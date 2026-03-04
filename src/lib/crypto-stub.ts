// Browser stub for node:crypto — webhook verification is server-side only.
// This prevents Vite from failing on the node:crypto import from the SDK.
export function createHash() {
  throw new Error('node:crypto is not available in the browser');
}
export function createHmac() {
  throw new Error('node:crypto is not available in the browser');
}
export function timingSafeEqual() {
  throw new Error('node:crypto is not available in the browser');
}
