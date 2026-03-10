import Article from "../Models/articleModel.js";

// Create Article (Contributor only)
export const createArticle = async (req, res) => {
    const { title, content } = req.body;
    try {
        const newArticle = await Article.create({
            title,
            content,
            author: req.user._id,
            status: 'pending',
            category: req.body.category || 'General'
        });

        const populatedArticle = await Article.findById(newArticle._id).populate('author', 'name email');

        res.status(201).json({
            message: "Article created successfully and pending approval",
            article: populatedArticle
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get My Articles (Contributor only)
export const getMyArticles = async (req, res) => {
    try {
        const articles = await Article.find({ author: req.user._id })
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ articles });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get Pending Articles (Admin only)
export const getPendingArticles = async (req, res) => {
    try {
        const articles = await Article.find({ status: 'pending' })
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ articles });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Approve Article (Admin only)
export const approveArticle = async (req, res) => {
    try {
        const articleId = req.params.id;
        const article = await Article.findById(articleId);

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        article.status = 'approved';
        await article.save();

        const updatedArticle = await Article.findById(articleId).populate('author', 'name email');

        res.status(200).json({
            message: "Article approved successfully",
            article: updatedArticle
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Reject Article (Admin only)
export const rejectArticle = async (req, res) => {
    try {
        const articleId = req.params.id;
        const article = await Article.findById(articleId);

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        article.status = 'rejected';
        await article.save();

        const updatedArticle = await Article.findById(articleId).populate('author', 'name email');

        res.status(200).json({
            message: "Article rejected",
            article: updatedArticle
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get Published Articles (Public - anyone can access)
export const getPublishedArticles = async (req, res) => {
    try {
        const { query, category } = req.query;
        let filter = { status: 'approved' };

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ];
        }

        const articles = await Article.find(filter)
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ articles });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update Article (Contributor only - only if pending or rejected)
export const updateArticle = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const articleId = req.params.id;
        const article = await Article.findById(articleId);

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Check ownership
        if (article.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to edit this article" });
        }

        // Only allow editing if pending or rejected
        if (article.status === 'approved') {
            return res.status(400).json({ message: "Approved articles cannot be edited" });
        }

        article.title = title || article.title;
        article.content = content || article.content;
        article.category = category || article.category;

        // If it was rejected, reset to pending
        if (article.status === 'rejected') {
            article.status = 'pending';
        }

        await article.save();
        res.status(200).json({ message: "Article updated successfully", article });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get Article by ID (with proper authorization)
export const getArticleById = async (req, res) => {
    try {
        const articleId = req.params.id;
        const article = await Article.findById(articleId).populate('author', 'name email');

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Only show approved articles to non-authors/non-admins
        if (article.status !== 'approved' &&
            req.user.role !== 'admin' &&
            article.author._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({ article });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
