import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const MONGODB_URL = process.env.MONGODB_URI;

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;