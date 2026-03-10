import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './DataBase/connection.js';
import authRouter from './Routers/authRouter.js';
import articleRouter from './Routers/articleRouter.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

// Health Check
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Knowledge Base API is running" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/articles", articleRouter);

app.listen(port, () => {
    connectDB();
    console.log("Knowledge Base server is running on port", port);
});
