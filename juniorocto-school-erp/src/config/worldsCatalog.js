// Lessons available in KidoMatic Worlds — copied from the Worlds app
// (juniorocto-worlds/src/config/curriculum.js, ready topics only). The id must match
// the Worlds route /play/:id. Regenerate when lessons are added there.
export const WORLD_GRADES = [
  { id: "nursery", name: "Nursery", tag: "Ages 3–4", color: "#FF8A3D" },
  { id: "lkg", name: "LKG", tag: "Ages 4–5", color: "#4C7EF3" },
  { id: "ukg", name: "UKG", tag: "Ages 5–6", color: "#22C1A6" },
];

export const WORLD_LESSONS = [
  { id: "body-parts", title: "Parts of the Body", grade: "nursery", emoji: "🖐️" },
  { id: "sense-organs", title: "Sense Organs", grade: "nursery", emoji: "👀" },
  { id: "helpers", title: "People Who Help Us", grade: "nursery", emoji: "👩‍🚒" },
  { id: "farm-animals", title: "Farm Animals", grade: "nursery", emoji: "🐄" },
  { id: "wild-animals", title: "Wild Animals", grade: "nursery", emoji: "🐯" },
  { id: "birds", title: "Birds", grade: "nursery", emoji: "🐦" },
  { id: "plant-parts", title: "Parts of Plants", grade: "nursery", emoji: "🌱" },
  { id: "aquatic", title: "Aquatic Animals", grade: "lkg", emoji: "🐠" },
  { id: "insects", title: "Insects", grade: "lkg", emoji: "🐝" },
  { id: "countries", title: "Countries of the World", grade: "ukg", emoji: "🌍" },
  { id: "landforms", title: "Landforms of Earth", grade: "ukg", emoji: "⛰️" },
  { id: "reptiles", title: "Reptiles", grade: "ukg", emoji: "🦎" },
];

// ERP class name → Worlds grade (other classes see every lesson)
export const gradeForClass = (klass = "") => ({ nursery: "nursery", lkg: "lkg", ukg: "ukg" })[String(klass).trim().toLowerCase()] || null;
