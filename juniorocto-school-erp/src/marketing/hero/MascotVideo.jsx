import { memo, useEffect, useRef, useState } from "react";
import mascotVideo from "../assets/octopus.mp4";
import octoFallback from "../assets/octo-mascot.png";
import octoPoster from "../assets/octopus-poster.webp";
import { CROP, isLightFrame, keyFrame, makeScratch } from "./mascotKey";

// Plays the mascot video and paints each frame onto a canvas with the baked-in
// background removed (see lib/mascotKey). The <video> stays in place underneath
// at opacity 0 — only the keyed canvas is seen. Falls back to the static mascot
// image if the video can't load or the browser can't process frames.
// `still`: show one frame and stop (light fallback for slow devices, like reduced motion)
function MascotVideo({ className = "", still = false }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | fallback

  useEffect(() => {
    const v = videoRef.current, out = canvasRef.current;
    const reduce = still || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const work = document.createElement("canvas");
    const wctx = work.getContext("2d", { willReadFrequently: true });
    const octx = out.getContext("2d");
    if (!wctx || !octx) { setStatus("fallback"); return; }

    let stopped = false, handle = 0, scratch = null, lastTime = -1, shown = false, budget = 1, slowFrames = 0;
    const fit = () => {
      const css = out.clientWidth || 180;
      const w = Math.round(Math.max(160, Math.min(520, css * Math.min(2, window.devicePixelRatio || 1) * budget)));
      if (out.width !== w) {
        const h = Math.round((w * CROP.h) / CROP.w);
        out.width = work.width = w; out.height = work.height = h;
        scratch = makeScratch(w, h);
      }
    };
    const paint = () => {
      fit();
      const t0 = performance.now();
      wctx.drawImage(v, CROP.x, CROP.y, CROP.w, CROP.h, 0, 0, work.width, work.height);
      const img = wctx.getImageData(0, 0, work.width, work.height);
      if (isLightFrame(img.data, work.width, work.height)) return false; // white intro frames: keep last frame
      octx.putImageData(keyFrame(img, scratch), 0, 0);
      // slow device? drop resolution rather than stutter
      if (performance.now() - t0 > 22 && ++slowFrames > 20 && budget > 0.5) { budget -= 0.2; slowFrames = 0; }
      return true;
    };
    const onFrame = () => {
      if (stopped) return;
      if (v.currentTime !== lastTime) {
        lastTime = v.currentTime;
        try {
          if (paint() && !shown) {
            shown = true; setStatus("ready");
            if (reduce) { v.pause(); stopped = true; return; } // still image for reduced motion
          }
        } catch { stopped = true; setStatus("fallback"); return; }
      }
      schedule();
    };
    const schedule = () => {
      handle = v.requestVideoFrameCallback ? v.requestVideoFrameCallback(onFrame) : requestAnimationFrame(onFrame);
    };

    const fail = () => { stopped = true; setStatus("fallback"); };
    // Browsers may pause a muted autoplay video (e.g. power saving); resume while the page is visible.
    const keepPlaying = () => { if (!stopped && !document.hidden) v.play().catch(() => {}); };
    v.addEventListener("error", fail);
    v.addEventListener("pause", keepPlaying);
    document.addEventListener("visibilitychange", keepPlaying);
    // autoplay blocked → seek past the white intro and show that still frame
    const onSeeked = () => { try { if (paint() && !shown) { shown = true; setStatus("ready"); } } catch { fail(); } };
    v.play().catch(() => { v.currentTime = 0.6; });
    v.addEventListener("seeked", onSeeked);
    schedule();
    const giveUp = setTimeout(() => { if (!shown) fail(); }, 8000);

    return () => {
      stopped = true;
      clearTimeout(giveUp);
      if (v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(handle); else cancelAnimationFrame(handle);
      v.removeEventListener("error", fail);
      v.removeEventListener("pause", keepPlaying);
      v.removeEventListener("seeked", onSeeked);
      document.removeEventListener("visibilitychange", keepPlaying);
      v.pause();
    };
  }, [still]);

  return (
    <div className={`jo-mascot relative ${className}`} style={{ aspectRatio: `${CROP.w} / ${CROP.h}` }}>
      {/* keyed still frame: shows instantly while the 3MB video loads, and stays if the video can't play */}
      {status !== "ready" && (
        <img src={octoPoster} alt={status === "fallback" ? "Octo the octopus" : ""} draggable="false"
          onError={(e) => { e.currentTarget.src = octoFallback; }}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
      )}
      {status !== "fallback" && (
        <>
          <video ref={videoRef} src={mascotVideo} muted autoPlay loop playsInline preload="auto" aria-hidden="true" tabIndex={-1}
            className="pointer-events-none absolute inset-0 h-full w-full opacity-0" />
          <canvas ref={canvasRef} role="img" aria-label="Octo the octopus, waving hello"
            className={`absolute inset-0 h-full w-full ${status === "ready" ? "opacity-100" : "opacity-0"}`} />
        </>
      )}
    </div>
  );
}

// Memoised: parent re-renders (speech bubble changes) must never touch the video.
export default memo(MascotVideo);
