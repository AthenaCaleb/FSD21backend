import User from "../Models/userModel.js";
import generateToken from "../Utils/generateToken.js";

// Register Contributor
export const registerContributor = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role: 'contributor'
        });

        res.status(201).json({
            message: "Contributor registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Register Admin
export const registerAdmin = async (req, res) => {
    const { name, email, password, adminCode } = req.body;
    try {
        if (adminCode !== process.env.ADMIN_CODE) {
            return res.status(403).json({ message: "Invalid admin code" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role: 'admin'
        });

        res.status(201).json({
            message: "Admin registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        await generateToken(user._id, res);
        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Logout User
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get Current User
export const getUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId, '-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Toggle Bookmark
export const toggleBookmark = async (req, res) => {
    try {
        const userId = req.user._id;
        const articleId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const bookmarkIndex = user.bookmarks.indexOf(articleId);
        let message = "";

        if (bookmarkIndex > -1) {
            // Remove from bookmarks
            user.bookmarks.splice(bookmarkIndex, 1);
            message = "Article removed from bookmarks";
        } else {
            // Add to bookmarks
            user.bookmarks.push(articleId);
            message = "Article added to bookmarks";
        }

        await user.save();
        res.status(200).json({ message, bookmarks: user.bookmarks });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get My Bookmarks
export const getMyBookmarks = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate({
            path: 'bookmarks',
            populate: { path: 'author', select: 'name email' }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ bookmarks: user.bookmarks });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
