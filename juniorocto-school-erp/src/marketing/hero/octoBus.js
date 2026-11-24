// Lets other parts of the hero (world cards, the class picker) make Octo react
// and talk without threading props through the whole page.
const bus = typeof EventTarget !== "undefined" ? new EventTarget() : null;

/** opts: { speak?: boolean, bubble?: boolean (default true), hold?: ms the bubble stays } */
export function octoSay(text, opts = {}) {
  bus?.dispatchEvent(new CustomEvent("say", { detail: { text, ...opts } }));
}

export function onOctoSay(fn) {
  if (!bus) return () => {};
  const h = (e) => fn(e.detail);
  bus.addEventListener("say", h);
  return () => bus.removeEventListener("say", h);
}
