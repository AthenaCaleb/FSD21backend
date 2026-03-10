# 🎓 Knowledge Base System: The Ultimate Technical Deep Dive (Extended)

This document provides a comprehensive, granular explanation of the entire backend system, now including the newly integrated features.

---

## 🛠️ 1. Core Service Architecture

### `index.js` (The Command Center)
- `app.use(express.static('frontend'));`: Serves your Vanilla UI files directly from the backend server.

---

## 📂 2. Data Persistence (`/Models`)

### `userModel.js` (Identity)
- **`bookmarks`**: An array of `ObjectIds` referencing the `Article` model. This allows each user to maintain a personal list of saved knowledge.

### `articleModel.js` (Content)
- **`category`**: A new field with a fixed list (`enum`) of departments like Technical, HR, and Policy.
- **Indexes**: Includes indexes on both `status` and `author` for lightning-fast lookups.

---

## 📂 3. The Brains (`/Controller`)

### `authController.js` (User Logic)
- **`toggleBookmark`**: A smart logic that checks if an article is already bookmarked. If yes, it removes it; if no, it adds it.
- **`getMyBookmarks`**: Uses `.populate()` to "join" the bookmark IDs with the actual article data and author names.

### `articleController.js` (Workflow Logic)
- **`getPublishedArticles`**: Now supports **Search & Filter**. It uses `$regex` for partial matching in titles/content and `$options: 'i'` to make the search case-insensitive.
- **`updateArticle`**: **The Guarded Edit**. It ensures:
    1. Only the original author can edit.
    2. Only `pending` or `rejected` articles can be updated.
    3. Status resets to `pending` if a rejected article is modified.

---

## 📂 4. The Security Guards (`/Middleware`)

### `authMiddleware.js`
- **RBAC**: Ensures that only Contributors can submit articles and only Admins can approve them.

---

## 📂 5. Frontend Integration (`/frontend`)

### `script.js`
- **Dynamic UI**: Uses `encodeURIComponent` to pass entire article objects into the Edit modal safely.
- **Real-time Search**: Listens for the `input` event on the search bar to filter articles as you type.
- **State Persistence**: Uses `localStorage` combined with a `httpOnly` cookie for a seamless, secure login experience.

---

## 🚦 New Feature Workflows

### 1. The Bookmark Loop
User clicks ★ $\rightarrow$ `script.js` calls `PUT /bookmarks/:id` $\rightarrow$ Backend updates the array $\rightarrow$ UI reloads instantly.

### 2. The Edit & Resubmit Loop
Contributor edits a **Rejected** article $\rightarrow$ Code updates the content **and** flips status back to **Pending** $\rightarrow$ Admin sees the updated version in their review list.

### 3. The Discovery Loop
User types "Server" in search $\rightarrow$ Frontend sends `?query=server` $\rightarrow$ Backend runs a `$or` regex search $\rightarrow$ Only matching results are returned.
