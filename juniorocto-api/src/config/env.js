import dotenv from "dotenv";
dotenv.config();
export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/juniorocto",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5175").split(","),
};
