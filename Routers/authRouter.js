import express from 'express';
import {
    registerContributor,
    registerAdmin,
    loginUser,
    logoutUser,
    getUser,
    toggleBookmark,
    getMyBookmarks
} from '../Controller/authController.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const authRouter = express.Router();

// Public routes
authRouter.post("/register-contributor", registerContributor);
authRouter.post("/register-admin", registerAdmin);
authRouter.post("/login", loginUser);

// Protected routes
authRouter.post("/logout", authMiddleware, logoutUser);
authRouter.get("/user", authMiddleware, getUser);
authRouter.put("/bookmarks/:id", authMiddleware, toggleBookmark);
authRouter.get("/bookmarks", authMiddleware, getMyBookmarks);

export default authRouter;
