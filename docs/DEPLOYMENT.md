# Deployment (manual — no CI/CD)

Target: the existing k3s node (`ssh opsadmin@10.20.0.1`, reachable over WireGuard), namespace **`cosmetics`**, public host `beauty.shomaaa.ir`.
Architecture and the reasoning behind it: [INFRASTRUCTURE-FINDINGS.md](INFRASTRUCTURE-FINDINGS.md).

```
Internet ─▶ Traefik (kube-system, TLS via ACME HTTP-01 "le")
              └─▶ Service web  ─▶ Deployment web (Next.js standalone, :3000)
                                     └─ server-side only ─▶ Service wordpress ─▶ Deployment wordpress (WP + WooCommerce, :80)
                                                                                     └─▶ StatefulSet mysql (PVC)
WordPress admin is NOT exposed publicly (port-forward only).
```

## Prerequisites
- Docker + WireGuard access to `10.20.0.1`; `git`, `node`.
- DNS: `beauty.shomaaa.ir` **A → 193.151.152.230**, DNS-only (no CDN proxy), otherwise Let's Encrypt HTTP-01 cannot succeed.
- Secrets exist in the cluster (`deploy/create-secrets.sh`, one-time, idempotent: does nothing if the Secret exists).

## Secrets (names only — values live in the cluster)
`cosmetics-secrets`: `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD`, `WP_ADMIN_PASSWORD`, `REVALIDATE_SECRET`, `WORDPRESS_{AUTH,SECURE_AUTH,LOGGED_IN,NONCE}_{KEY,SALT}`.
`create-secrets.sh` also stores a 0600 copy at `~/.cosmetics-prod-secrets` on the machine that ran it (outside the repo). Payment-gateway credentials are **not** configured (see README, "Payments").

## First deployment
```bash
deploy/create-secrets.sh     # once
deploy/deploy.sh seed        # build wp + web images, import into k3s, apply manifests, wait, bootstrap + seed 30 products
```
`deploy.sh` tags both images with the git short SHA (`-dirty` if uncommitted), pipes `docker save` into `sudo k3s ctr images import` (node-local images; same technique used for `tpsite-local/minio`) and applies `deploy/k8s/*.yaml`.

## Redeploy (code change)
```bash
git pull && deploy/deploy.sh          # new tag → rolling replacement (Recreate strategy for web/wordpress: brief downtime)
```
Content/catalog change only: `deploy/deploy.sh seed` (seed is idempotent: matched by SKU, never duplicates).

## Verify
```bash
kubectl -n cosmetics get pods,ingress,pvc             # via: ssh opsadmin@10.20.0.1 sudo k3s kubectl ...
curl -sI https://beauty.shomaaa.ir/                          # 200 once DNS+cert are ready
curl -s https://beauty.shomaaa.ir/api/health?deep=1          # {"ok":true,"backend":"up"}
curl -s https://beauty.shomaaa.ir/sitemap.xml | grep -c /products/   # 30
```
Before DNS points here, check from inside the cluster: `kubectl -n cosmetics port-forward svc/web 3300:80` then `curl localhost:3300/api/health?deep=1`.

## Restart / health behaviour
All pods use `restartPolicy: Always` with startup/readiness/liveness probes (`/api/health`, `/wp-json/cosmetics/v1/health`, `/healthz-live.txt`). Test: `kubectl -n cosmetics rollout restart deploy/web deploy/wordpress` and `kubectl -n cosmetics delete pod mysql-0` (data persists on the PVC).

## Rollback
```bash
kubectl -n cosmetics rollout undo deploy/web         # previous ReplicaSet (previous image is still on the node)
kubectl -n cosmetics rollout undo deploy/wordpress
# or redeploy an older commit:  git checkout <sha> && deploy/deploy.sh
```
Database: nightly dumps in PVC `db-backups` (CronJob `mysql-backup`, 14 kept). Restore:
`kubectl -n cosmetics run restore --rm -i --image=mysql:8.4 --overrides=…` mounting `db-backups` — or copy a dump out with `kubectl cp` from a helper pod and `gunzip -c dump.sql.gz | mysql -h mysql -uroot -p cosmetics`.
Copy backups off-server regularly (same caveat as the GitLab notes in `/opt/infra/docs`).

## WordPress admin
```bash
ssh -L 8081:localhost:8081 opsadmin@10.20.0.1 'sudo k3s kubectl -n cosmetics port-forward svc/wordpress 8081:80'
# then browse http://localhost:8081/wp-admin  (user: cosmetics_admin, password in ~/.cosmetics-prod-secrets)
```
(WordPress `home/siteurl` is `https://beauty.shomaaa.ir`; over the port-forward you may need a hosts entry or `?` redirects — use `wp` CLI for routine tasks: `kubectl -n cosmetics exec deploy/wordpress -- wp --allow-root ...`.)

## Cache invalidation
`POST /api/revalidate` with header `x-revalidate-secret: <REVALIDATE_SECRET>` clears the catalog cache (otherwise data refreshes every 2 minutes).

## Catalog changes
Edit `catalog/products.mjs`, regenerate images if needed (`scripts/generate-images.mjs`), then `deploy/deploy.sh seed` (idempotent, matched by SKU).

## Payments
No gateway is connected. Orders are recorded as `on-hold` and support arranges payment; do not describe checkout as paid until a gateway plugin is installed and verified.
