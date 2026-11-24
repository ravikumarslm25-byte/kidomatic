// Octo's voice on the homepage, using the browser's built-in speech synthesis
// (free, nothing sent anywhere). Speaks only in response to a tap — never on
// page load — and the visitor's mute choice is remembered.

const KEY = "jo-site-voice";
export const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

let muted = false;
try { muted = localStorage.getItem(KEY) === "off"; } catch { /* storage blocked */ }

export const isMuted = () => muted || !canSpeak;
export function setMuted(v) {
  muted = !!v;
  try { localStorage.setItem(KEY, muted ? "off" : "on"); } catch { /* storage blocked */ }
  if (muted) stopSpeaking();
}

// a friendly English voice if the device has one (Indian English first, then UK / US)
let voice = null;
function pickVoice() {
  const all = canSpeak ? window.speechSynthesis.getVoices() : [];
  const rank = (v) => {
    const lang = (v.lang || "").toLowerCase();
    let r = lang.startsWith("en-in") ? 40 : lang.startsWith("en-gb") ? 30 : lang.startsWith("en-us") ? 25 : lang.startsWith("en") ? 10 : -100;
    if (/female|neerja|heera|zira|aria|jenny|samantha|veena|google/i.test(v.name)) r += 5;
    return r;
  };
  voice = all.filter((v) => rank(v) > 0).sort((a, b) => rank(b) - rank(a))[0] || null;
}
if (canSpeak) {
  pickVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}

// emoji are for the eyes only
const clean = (text) => String(text || "").replace(/[\p{Extended_Pictographic}️‍]/gu, "").replace(/\s+/g, " ").trim();

/** Speak a line (replaces whatever is being said). opts.force ignores mute — only for an explicit Replay. */
export function say(text, opts = {}) {
  if (!canSpeak || (muted && !opts.force)) return false;
  const line = clean(text);
  if (!line) return false;
  const u = new SpeechSynthesisUtterance(line);
  if (!voice) pickVoice();
  if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-IN";
  u.rate = 0.95; u.pitch = 1.3; u.volume = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  return true;
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel();
}

// short, quiet sound effects from /public/sounds, loaded only when first played
const clips = {};
export function playSound(name, volume = 0.45) {
  if (muted || typeof Audio === "undefined") return;
  try {
    const a = clips[name] || (clips[name] = new Audio(`/sounds/${name}.mp3`));
    a.volume = volume;
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch { /* audio unavailable */ }
}
