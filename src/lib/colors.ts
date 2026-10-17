// Shade swatches by WooCommerce pa_shade term slug ("shade-<id>").
export const SHADE_HEX: Record<string, string> = {
  rose: "#C9607F", rasp: "#B51F59", coral: "#E2705E", wine: "#7A1F3D",
  light: "#F0D0B8", medium: "#DDB08C", tan: "#C08E66", peach: "#F2A98F", berry: "#C23A6B",
};
export const shadeHex = (slug: string) => SHADE_HEX[slug.replace(/^shade-/, "")] ?? "#d9c2cc";
