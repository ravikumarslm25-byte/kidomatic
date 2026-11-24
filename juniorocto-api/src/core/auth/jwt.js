import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
export const sign = (payload, opts = { expiresIn: "7d" }) => jwt.sign(payload, env.jwtSecret, opts);
export const verify = (token) => jwt.verify(token, env.jwtSecret);
