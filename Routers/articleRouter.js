import express from 'express';
import {
    createArticle,
    getMyArticles,
    getPendingArticles,
    approveArticle,
    rejectArticle,
    getPublishedArticles,
    getArticleById,
    updateArticle
} from '../Controller/articleController.js';
import { authMiddleware, adminMiddleware, contributorMiddleware } from '../Middleware/authMiddleware.js';

const articleRouter = express.Router();

// Public routes
articleRouter.get("/published", getPublishedArticles);

// Contributor routes
articleRouter.post("/", authMiddleware, contributorMiddleware, createArticle);
articleRouter.get("/my-articles", authMiddleware, contributorMiddleware, getMyArticles);
articleRouter.put("/:id", authMiddleware, contributorMiddleware, updateArticle);

// Admin routes
articleRouter.get("/pending", authMiddleware, adminMiddleware, getPendingArticles);
articleRouter.put("/:id/approve", authMiddleware, adminMiddleware, approveArticle);
articleRouter.put("/:id/reject", authMiddleware, adminMiddleware, rejectArticle);

// Protected route (requires authentication)
articleRouter.get("/:id", authMiddleware, getArticleById);

export default articleRouter;
