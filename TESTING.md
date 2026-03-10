# Manual API Testing Guide

Since the server is currently running in your terminal, you can test the API endpoints using **Postman**, **Thunder Client** (VS Code extension), or **PowerShell**.

## Testing with PowerShell

Open a **NEW PowerShell window** (keep the server running in the original window) and run these commands:

### 1. Test Server Health

```powershell
Invoke-RestMethod -Uri http://localhost:8080 -Method GET
```

**Expected Output**:
```json
{
  "msg": "Knowledge Base API Server is running on port 8080"
}
```

---

### 2. Register a Contributor

```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8080/api/v1/auth/register-contributor -Method POST -Body $body -ContentType "application/json"
```

**Expected Output**:
```json
{
  "message": "Contributor registered successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "contributor"
  }
}
```

---

### 3. Register an Admin

```powershell
$body = @{
    name = "Admin User"
    email = "admin@example.com"
    password = "admin123"
    adminCode = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8080/api/v1/auth/register-admin -Method POST -Body $body -ContentType "application/json"
```

**Expected Output**:
```json
{
  "message": "Admin registered successfully",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### 4. Login as Contributor

```powershell
$body = @{
    email = "john@example.com"
    password = "test123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:8080/api/v1/auth/login -Method POST -Body $body -ContentType "application/json" -SessionVariable session

# View the response
$response.Content | ConvertFrom-Json

# Save the session for future requests
```

**Expected Output**:
```json
{
  "message": "User logged in successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "contributor"
  }
}
```

---

### 5. Create an Article (as Contributor)

```powershell
$body = @{
    title = "Getting Started with Node.js"
    content = "Node.js is a powerful JavaScript runtime that allows you to build scalable server-side applications..."
} | ConvertTo-Json

$article = Invoke-WebRequest -Uri http://localhost:8080/api/v1/articles -Method POST -Body $body -ContentType "application/json" -WebSession $session

# View the response
$article.Content | ConvertFrom-Json
```

**Expected Output**:
```json
{
  "message": "Article created successfully and pending approval",
  "article": {
    "_id": "...",
    "title": "Getting Started with Node.js",
    "content": "...",
    "author": {...},
    "status": "pending",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

> **NOTE**: The status should be "pending"!

---

### 6. View My Articles (as Contributor)

```powershell
$myArticles = Invoke-RestMethod -Uri http://localhost:8080/api/v1/articles/my-articles -Method GET -WebSession $session
$myArticles
```

**Expected**: You should see your own articles with all statuses.

---

### 7. View Published Articles (Before Approval)

```powershell
Invoke-RestMethod -Uri http://localhost:8080/api/v1/articles/published -Method GET
```

**Expected Output**:
```json
{
  "articles": []
}
```

> **CRITICAL**: This should be EMPTY because no articles have been approved yet!

---

### 8. Login as Admin

```powershell
$body = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

$adminResponse = Invoke-WebRequest -Uri http://localhost:8080/api/v1/auth/login -Method POST -Body $body -ContentType "application/json" -SessionVariable adminSession

$adminResponse.Content | ConvertFrom-Json
```

---

### 9. View Pending Articles (as Admin)

```powershell
$pending = Invoke-RestMethod -Uri http://localhost:8080/api/v1/articles/pending -Method GET -WebSession $adminSession
$pending

# Save the article ID for approval
$articleId = $pending.articles[0]._id
Write-Host "Article ID: $articleId"
```

**Expected**: You should see the article created by the contributor with status "pending".

---

### 10. Approve the Article (as Admin)

```powershell
# Use the article ID from the previous step
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/articles/$articleId/approve" -Method PUT -WebSession $adminSession
```

**Expected Output**:
```json
{
  "message": "Article approved successfully",
  "article": {
    ...
    "status": "approved"
  }
}
```

---

### 11. View Published Articles (After Approval)

```powershell
$published = Invoke-RestMethod -Uri http://localhost:8080/api/v1/articles/published -Method GET
$published
```

**Expected**: Now you should see the approved article! ✅

---

### 12. Test Rejection Workflow

Create another article:
```powershell
$body = @{
    title = "Advanced MongoDB Techniques"
    content = "Learn advanced MongoDB concepts..."
} | ConvertTo-Json

$article2 = Invoke-WebRequest -Uri http://localhost:8080/api/v1/articles -Method POST -Body $body -ContentType "application/json" -WebSession $session
$article2Id = ($article2.Content | ConvertFrom-Json).article._id
```

Reject it as admin:
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/articles/$article2Id/reject" -Method PUT -WebSession $adminSession
```

Verify it's NOT in published:
```powershell
Invoke-RestMethod -Uri http://localhost:8080/api/v1/articles/published -Method GET
```

---

## Quick Test Summary

Run these commands in sequence to verify everything works:

```powershell
# Test 1: Server running
Invoke-RestMethod -Uri http://localhost:8080 -Method GET

# Test 2: Register contributor
$contributor = @{name="John Doe"; email="john@test.com"; password="test123"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8080/api/v1/auth/register-contributor -Method POST -Body $contributor -ContentType "application/json"

# Test 3: Register admin
$admin = @{name="Admin"; email="admin@test.com"; password="admin123"; adminCode="admin123"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8080/api/v1/auth/register-admin -Method POST -Body $admin -ContentType "application/json"

# Test 4-11: Continue with login and article workflow as shown above
```

---

## Testing with Postman (Recommended)

1. **Install Postman** from https://www.postman.com/downloads/

2. **Import these requests**:
   - Create a new collection called "Knowledge Base API"
   - Add requests for each endpoint listed in [README.md](file:///D:/FSDproject/README.md)

3. **Workflow**:
   - Register users → Login → Create articles → Admin approval → View published

---

## ✅ Verification Checklist

- [ ] Server responds at http://localhost:8080
- [ ] Can register contributor
- [ ] Can register admin (with admin code)
- [ ] Can login and receive JWT token
- [ ] Contributor can create articles (status = pending)
- [ ] Contributor can view own articles
- [ ] Published endpoint is empty before approval
- [ ] Admin can view pending articles
- [ ] Admin can approve articles
- [ ] Approved articles appear in published endpoint
- [ ] Admin can reject articles
- [ ] Rejected articles don't appear in published endpoint
- [ ] Authorization works (contributors can't access admin endpoints)

---

## Common Issues

**Cannot connect to server**:
- Make sure `npm run dev` is running in another terminal
- Check if MongoDB is running
- Verify port 8080 is not in use by another application

**CORS errors**:
- Already configured in index.js with `app.use(cors())`

**JWT token issues**:
- Tokens are stored in cookies (HTTP-only)
- Use `-WebSession` in PowerShell or enable cookie storage in Postman
