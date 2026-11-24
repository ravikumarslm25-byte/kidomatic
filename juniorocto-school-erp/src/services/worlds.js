import { USE_MOCK, WORLDS_URL } from "@/config/app";
import { api } from "./api";

// Start a KidoMatic Worlds lesson for one student. The API signs a launch token for
// that child; the Worlds app carries it and posts the finished lesson back, which lands
// in Skills & Milestones and the Portfolio. Returns the URL to open.
export async function launchWorld({ lesson, student }) {
  if (!WORLDS_URL) throw new Error("KidoMatic Worlds isn't connected yet (VITE_WORLDS_URL is not set).");
  if (USE_MOCK) return `${WORLDS_URL}/play/${lesson.id}`; // demo mode: plays as a guest, nothing is saved
  try {
    const { data } = await api.get(`/worlds/launch/${encodeURIComponent(lesson.id)}`, {
      params: { studentId: student.id, studentName: student.name, worldTitle: lesson.title },
    });
    const path = data?.data?.path;
    if (!path) throw new Error("No launch link came back.");
    return `${WORLDS_URL}${path}`;
  } catch (e) {
    if (e?.status === 402) throw new Error("Your school's plan doesn't include KidoMatic Worlds.");
    throw e;
  }
}
