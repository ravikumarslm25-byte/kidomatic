import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

(async () => {
  try {
    await connectDb();
    createApp().listen(env.port, () => console.log(`✓ KidoMatic API on http://localhost:${env.port}`));
  } catch (e) {
    console.error("Failed to start:", e.message);
    process.exit(1);
  }
})();
