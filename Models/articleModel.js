import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    category: {
        type: String,
        enum: ['Technical', 'General', 'Policy', 'HR', 'Engineering'],
        default: 'General'
    }
}, { timestamps: true });

// Index for efficient querying
articleSchema.index({ status: 1 });
articleSchema.index({ author: 1 });

const Article = mongoose.model("Article", articleSchema);

export default Article;
