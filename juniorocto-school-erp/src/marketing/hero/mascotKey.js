// Background removal for the mascot video (octopus.mp4).
//
// The MP4 has no alpha channel: the octopus sits on a baked-in dark grey
// checkerboard (and the first ~0.2s of each loop is plain white). We remove the
// background per frame by flood-filling from the frame border through
// "dark + neutral grey" pixels. Dark details INSIDE the octopus (pupils, mouth)
// are enclosed by its body, so the fill never reaches them.

// Crop window (in source pixels) that contains every pose in the clip — only
// empty background is trimmed; the hat touches the top edge mid-jump, so y starts at 0.
export const SRC_SIZE = 960;
export const CROP = { x: 104, y: 0, w: 728, h: 872 };

const DARK_MAX = 78;   // brightest channel of a background pixel
const GREY_SPREAD = 26; // max channel spread (background is neutral grey)

/** True when the frame is one of the plain-white intro frames (skip it). */
export function isLightFrame(d, w, h) {
  const px = (x, y) => { const i = (y * w + x) * 4; return Math.min(d[i], d[i + 1], d[i + 2]); };
  return px(1, 1) > 200 && px(w - 2, 1) > 200 && px(1, h - 2) > 200 && px(w - 2, h - 2) > 200;
}

/** Makes reusable buffers for a w×h frame. */
export function makeScratch(w, h) {
  const n = w * h;
  return { w, h, cand: new Uint8Array(n), bg: new Uint8Array(n), stack: new Int32Array(n) };
}

/** Writes alpha into ImageData `img` in place. */
export function keyFrame(img, s) {
  const d = img.data, { w, h, cand, bg, stack } = s, n = w * h;
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const r = d[p], g = d[p + 1], b = d[p + 2];
    const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
    const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
    cand[i] = mx < DARK_MAX && mx - mn < GREY_SPREAD ? 1 : 0;
    bg[i] = 0;
  }
  // seed from every border pixel that looks like background
  let top = 0;
  const seed = (i) => { if (cand[i] && !bg[i]) { bg[i] = 1; stack[top++] = i; } };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (top) {
    const i = stack[--top], x = i % w;
    if (x > 0) seed(i - 1);
    if (x < w - 1) seed(i + 1);
    if (i >= w) seed(i - w);
    if (i < n - w) seed(i + w);
  }
  // Background also peeks through closed gaps between tentacles. Those enclosed
  // grey regions are told apart from the face (pupils, brows, mouth) by position:
  // measured over the whole clip, face features stay inside x 0.39–0.62, y ≤ 0.47
  // of the crop, while trapped background sits at y ≥ 0.51 or out to the sides.
  for (let s0 = 0; s0 < n; s0++) {
    if (!cand[s0] || bg[s0]) continue;
    let top2 = 0, area = 0, sx = 0, sy = 0;
    cand[s0] = 2; stack[top2++] = s0;
    const start = top2;
    for (let k = 0; k < top2; k++) { // BFS kept in `stack` so the region can be revisited
      const i = stack[k], x = i % w;
      area++; sx += x; sy += (i - x) / w;
      if (x > 0 && cand[i - 1] === 1) { cand[i - 1] = 2; stack[top2++] = i - 1; }
      if (x < w - 1 && cand[i + 1] === 1) { cand[i + 1] = 2; stack[top2++] = i + 1; }
      if (i >= w && cand[i - w] === 1) { cand[i - w] = 2; stack[top2++] = i - w; }
      if (i < n - w && cand[i + w] === 1) { cand[i + w] = 2; stack[top2++] = i + w; }
    }
    const cx = sx / area / w, cy = sy / area / h;
    if (cy >= 0.49 || cx < 0.34 || cx > 0.7) for (let k = start - 1; k < top2; k++) bg[stack[k]] = 1;
  }
  // alpha: background → 0, then erode the 1px dark fringe and feather the next ring
  const edge = cand; // reuse buffer: 1 = first ring inside the figure
  for (let i = 0; i < n; i++) {
    edge[i] = 0;
    if (bg[i]) continue;
    const x = i % w;
    if ((x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (i >= w && bg[i - w]) || (i < n - w && bg[i + w])) edge[i] = 1;
  }
  for (let i = 0, p = 3; i < n; i++, p += 4) {
    if (bg[i] || edge[i]) { d[p] = 0; continue; }
    const x = i % w;
    if ((x > 0 && edge[i - 1]) || (x < w - 1 && edge[i + 1]) || (i >= w && edge[i - w]) || (i < n - w && edge[i + w])) d[p] = 150;
  }
  return img;
}
