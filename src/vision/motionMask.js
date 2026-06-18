export const LAYER_STATIC = 1;
export const LAYER_MOVING = 2;
export const STATIC_FADE  = 0.8;

// Recursively assigns a Three.js layer to an object and all its descendants.
export function setLayer(object, layer) {
  object.layers.set(layer);
  object.children.forEach(child => setLayer(child, layer));
}
