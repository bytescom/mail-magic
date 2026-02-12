# 📧 Mail Magic - Email Campaign Automation

> Automate your job application emails with personalized templates, smart contact management, and spam-safe delivery.

---

## 📑 **Table of Contents**

1. [Features](#features)
2. [Setup & Installation](#setup--installation)
3. [Vercel Blob Storage Setup](#vercel-blob-storage-setup)
4. [Email Sender Name Fix](#email-sender-name-fix)
5. [Custom Confirmation Modal](#custom-confirmation-modal)
6. [Troubleshooting](#troubleshooting)
7. [API Endpoints](#api-endpoints)
8. [Tech Stack](#tech-stack)

---

## ✨ **Features**

- 🎯 **Smart Email Templates** - Create reusable templates with variables
- 👥 **HR Contact Management** - Organize recruiter contacts
- 📎 **File Attachments** - Upload resume/cover letter to cloud (Vercel Blob)
- 🚀 **Batch Email Sending** - Send personalized emails to multiple recipients
- 🛡️ **Spam Protection** - Dynamic delays (3-15s) between emails
- 📊 **Activity Logs** - Track all sent emails with detailed logs
- 🎨 **Premium UI/UX** - Modern design with glassmorphism and animations
- ✅ **Custom Modals** - Beautiful confirmation dialogs instead of browser alerts

---

## 🚀 **Setup & Installation**

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/mail-magic.git
cd mail-magic
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Variables**

Create a `.env.local` file in the root directory:

```bash
# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
MONGODB_URI=your_mongodb_connection_string

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### **4. Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ **Vercel Blob Storage Setup**

### **Why Vercel Blob?**

Storing files (resumes/cover letters) directly in MongoDB as base64 makes your database huge and slow. Vercel Blob reduces database size by **99%**!

**Before (MongoDB base64):**
- 2 MB file = 2.7 MB in database
- 100 users = 250 MB database

**After (Vercel Blob URLs):**
- 2 MB file = 0.1 KB in database (just URL!)
- 100 users = 50 KB database

### **Setup Steps:**

#### **Step 1: Get Vercel Blob Token**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database** → **Blob**
3. Name it: `MailMagicStorage`
4. Click **Create**
5. Copy the `BLOB_READ_WRITE_TOKEN` from `.env.local` tab

#### **Step 2: Add to Environment Variables**

```bash
# Add to .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_ABC123XYZ...
```

#### **Step 3: Restart Dev Server**

```bash
# Stop server (Ctrl+C)
npm run dev
```

### **Vercel Blob Features:**

- ✅ FREE tier: 500 GB bandwidth/month
- ✅ Zero configuration on Vercel deployments
- ✅ Automatic CDN delivery
- ✅ Files up to 500MB per file
- ✅ 99% cheaper than storing in MongoDB

### **File Upload/Delete Routes:**

| Action | Endpoint | Method |
|--------|----------|--------|
| Upload Resume | `/api/upload-resume` | POST |
| Get Resume Info | `/api/upload-resume` | GET |
| Delete Resume | `/api/upload-resume` | DELETE |
| Upload Cover Letter | `/api/upload-cover-letter` | POST |
| Get Cover Letter Info | `/api/upload-cover-letter` | GET |
| Delete Cover Letter | `/api/upload-cover-letter` | DELETE |

### **Troubleshooting Uploads:**

**Error: Files not uploading to Vercel Blob**

**Cause:** Old `/api/user/files` route being called instead of new Blob routes

**Solution:**
1. Make sure send page uses new routes:
   ```javascript
   // ✅ Correct
   const endpoint = type === 'resume' ? '/api/upload-resume' : '/api/upload-cover-letter';
   ```
2. Restart dev server after adding `BLOB_READ_WRITE_TOKEN`
3. Check terminal for "☁️ Uploading to Vercel Blob..." logs

---

## 🏷️ **Email Sender Name Fix**

### **The Problem:**

Emails were showing sender as **"pankajk74147"** (email username) instead of **"Pankaj Kumar"** (actual name).

### **Why This Happened:**

The code was sending just the email address:
```javascript
from: "pankajk74147@gmail.com"  // ❌ No name
```

Gmail displays the username part as sender name when no proper name is provided.

### **The Fix:**

Now sends in proper RFC 5322 format:
```javascript
const senderName = user.name || variables.your_name || 'Job Applicant';
const fromHeader = `${senderName} <${user.email}>`;
// Result: "Pankaj Kumar <pankajk74147@gmail.com>"
```

### **Priority for Sender Name:**

1. **`user.name`** - From Google account (NextAuth session)
2. **`variables.your_name`** - From send form
3. **`'Job Applicant'`** - Fallback

### **Before vs After:**

**Before:**
```
From: pankajk74147
Subject: Application for frontend developer
```
❌ Unprofessional - looks like spam

**After:**
```
From: Pankaj Kumar
Subject: Application for frontend developer
```
✅ Professional - clear identity

### **Pro Tip:**

Set your name in Google account:
1. Go to [Google Personal Info](https://myaccount.google.com/personal-info)
2. Set "Name" to your professional name
3. This becomes the default sender name

---

## 🎨 **Custom Confirmation Modal**

### **What Changed:**

Replaced ugly browser `confirm()` dialogs with beautiful custom modals that match the app's premium design.

### **Features:**

- 🌈 Glassmorphism backdrop with blur
- ✨ Smooth animations (slide-up + zoom-in)
- 🎯 Context-aware (blue for send, rose for delete)
- 📧 Shows recipient count for emails
- 🛡️ Spam protection notice
- ⚡ Hover effects and micro-animations

### **Modal Types:**

#### **Email Send Confirmation:**
- Blue gradient header
- Send icon
- Recipient count badge
- "Launch Now" button
- Spam protection info

#### **File Delete Confirmation:**
- Rose/red gradient header
- Alert icon
- Warning message
- "Delete" button

### **Implementation:**

```javascript
// Trigger modal
setConfirmAction({
    title: 'Launch Email Campaign?',
    message: 'You're about to send personalized emails to 5 recipients...',
    type: 'send',
    count: 5,
    onConfirm: async () => {
        // Execute action
    }
});
setShowConfirmModal(true);
```

### **Visual Example:**

```
┌─────────────────────────────────────┐
│  [Blurred Dark Background]          │
│                                      │
│     ┌───────────────────────┐      │
│     │ [Gradient Header]      │      │
│     │      [Send Icon]       │      │
│     │   Launch Campaign?     │      │
│     │                        │      │
│     │   ┌───────────┐        │      │
│     │   │ 5 Recipients│       │      │
│     │   └───────────┘        │      │
│     │                        │      │
│     │  [Cancel] [Launch Now] │      │
│     │  [Spam Protection Info]│      │
│     └───────────────────────┘      │
└─────────────────────────────────────┘
```

---

## 🔧 **Troubleshooting**

### **401 Error - Unauthenticated**

**Issue:** POST `/api/emails/send` returns 401

**Cause:** NextAuth session is invalid or expired

**Solution:**
1. Check session: [http://localhost:3000/api/check-session](http://localhost:3000/api/check-session)
2. If `authenticated: false`, sign out and sign in again
3. Fresh sign-in creates new session with valid tokens

**Common Causes:**
- Session expired (JWT timeout)
- Cookies cleared
- `NEXTAUTH_SECRET` changed
- Not signed in

### **Vercel Blob Upload Issues**

**Error: "No token found"**
- **Solution:** Add `BLOB_READ_WRITE_TOKEN` to `.env.local` and restart server

**Error: "Invalid token"**
- **Solution:** Get fresh token from [Vercel Dashboard](https://vercel.com/dashboard/stores)

**Error: "Failed to upload file"**
- Check file size (max 5MB)
- Check file type (only PDF, DOC, DOCX)
- Check terminal logs for details

**Files still stored as base64 in MongoDB**
- Make sure send page uses new routes (`/api/upload-resume`)
- Check terminal for "☁️ Uploading to Vercel Blob..." message
- Restart dev server

### **Gmail Authentication Issues**

**Problem:** Refresh token not being saved

**Solution:**
1. Revoke app access: [https://myaccount.google.com/permissions](https://myaccount.google.com/permissions)
2. Sign out of your app
3. Sign in again (consent screen should appear)
4. Accept all permissions
5. Check terminal logs for `has_refresh_token: true`

### **Sender Name Shows Email Username**

**Problem:** Emails show "pankajk74147" instead of "Pankaj Kumar"

**Solution:** Already fixed! Make sure:
1. Your Google account has proper name set
2. Or enter your name in send form
3. Code now formats as `"Name <email>"`

---

## 📡 **API Endpoints**

### **Authentication**
- `POST /api/auth/signin` - Sign in with Google
- `POST /api/auth/signout` - Sign out
- `GET /api/check-session` - Check authentication status

### **Templates**
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template
- `PATCH /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### **HR Contacts**
- `GET /api/hr-emails` - Get all HR contacts
- `POST /api/hr-emails` - Add HR contact
- `PATCH /api/hr-emails/:id` - Update HR contact
- `DELETE /api/hr-emails/:id` - Delete HR contact

### **File Management**
- `POST /api/upload-resume` - Upload resume to Vercel Blob
- `GET /api/upload-resume` - Get resume info
- `DELETE /api/upload-resume` - Delete resume
- `POST /api/upload-cover-letter` - Upload cover letter
- `GET /api/upload-cover-letter` - Get cover letter info
- `DELETE /api/upload-cover-letter` - Delete cover letter

### **Email Sending**
- `POST /api/emails/send` - Send batch emails
- `GET /api/logs` - Get email logs
- `GET /api/stats` - Get dashboard statistics

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom CSS
- **Icons:** Lucide React
- **Notifications:** Sonner (toast)
- **Authentication:** NextAuth.js (Google OAuth)

### **Backend**
- **API Routes:** Next.js API Routes
- **Database:** MongoDB (Mongoose)
- **File Storage:** Vercel Blob
- **Email API:** Gmail API (via Google APIs)

### **Key Features**
- Server Components & Client Components
- JWT session management
- OAuth 2.0 with refresh tokens
- Cloud file storage
- Real-time toast notifications
- Responsive design (mobile-first)

---

## 📄 **File Structure**

```
mail-magic/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth routes
│   │   ├── templates/     # Template CRUD
│   │   ├── hr-emails/     # HR contact CRUD
│   │   ├── emails/send/   # Email sending logic
│   │   ├── logs/          # Email logs
│   │   ├── stats/         # Dashboard stats
│   │   ├── upload-resume/ # Resume upload (Vercel Blob)
│   │   └── upload-cover-letter/ # Cover letter upload
│   ├── dashboard/         # Main dashboard
│   ├── templates/         # Template management
│   ├── hr-emails/         # HR contact management
│   ├── send/              # Send emails page
│   ├── logs/              # Email logs page
│   └── layout.jsx         # Root layout
├── components/
│   ├── DashboardLayout.jsx
│   ├── ProtectedRoute.jsx
│   └── ...
├── lib/
│   ├── mongodb.js         # MongoDB connection
│   ├── gmail.js           # Gmail API service
│   └── utils.js           # Utility functions
├── models/
│   ├── User.js            # User schema
│   ├── Template.js        # Template schema
│   ├── HrEmail.js         # HR contact schema
│   └── EmailLog.js        # Email log schema
├── public/                # Static assets
└── .env.local            # Environment variables
```

---

## 🎯 **Usage Guide**

### **1. Create Email Template**

1. Go to `/templates`
2. Click "New Template"
3. Enter subject and body with variables:
   - `{your_name}` - Your name
   - `{hr_name}` - Recruiter name
   - `{company}` - Company name
   - `{job_role}` - Job role
   - `{portfolio_link}` - Portfolio URL

### **2. Add HR Contacts**

1. Go to `/hr-emails`
2. Click "Add Contact"
3. Enter:
   - Email address
   - HR name
   - Company
   - Job role

### **3. Upload Resume/Cover Letter**

1. Go to `/send`
2. Under "Payload Enrichment"
3. Click upload button
4. Select PDF/DOC file (max 5MB)
5. File uploads to Vercel Blob automatically

### **4. Send Emails**

1. Go to `/send`
2. Select template
3. Enter your name
4. Select recipients
5. Toggle resume/cover letter attachments
6. Click "Launch Campaign"
7. Confirm in modal
8. Emails sent with 3-15s delays

### **5. View Logs**

1. Go to `/logs`
2. Filter by status (all/sent/failed)
3. Search by recipient or company
4. Click "Details" to view full email
5. Export logs as CSV

---

## 🔐 **Security Features**

- ✅ JWT session authentication
- ✅ OAuth 2.0 with refresh tokens
- ✅ Protected API routes
- ✅ CSRF protection (NextAuth)
- ✅ Environment variable security
- ✅ Automatic token refresh
- ✅ Spam prevention (rate limiting)
- ✅ Input validation & sanitization

---

## 🚀 **Deployment**

### **Deploy to Vercel:**

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Vercel Blob token auto-injected in production
5. Deploy!

### **Environment Variables for Production:**

```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGODB_URI=your_mongodb_uri
# BLOB_READ_WRITE_TOKEN auto-injected by Vercel
```

---

## 📊 **Database Size Comparison**

### **Before Vercel Blob:**
- 2 MB resume file → 2.7 MB in MongoDB
- 100 users → 250 MB database
- Slow queries
- Expensive storage

### **After Vercel Blob:**
- 2 MB resume file → 0.1 KB in MongoDB (just URL)
- 100 users → 50 KB database (**99.98% smaller!**)
- Fast queries
- Free storage (500 GB/month)

---

## 💡 **Best Practices**

1. **Always enter your real name** in send form
2. **Revoke and re-authorize** if refresh token issues
3. **Restart dev server** after `.env.local` changes
4. **Test with yourself** before sending to recruiters
5. **Check logs page** after sending
6. **Keep templates professional**
7. **Don't exceed 15 emails per batch** (spam limits)
8. **Upload small files** (<5MB) for faster uploads

---

## 🤝 **Contributing**

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 **License**

This project is licensed under the MIT License.

---

## 🆘 **Support**

Having issues? Check:

1. **Troubleshooting section** above
2. **Terminal logs** for error messages
3. **Browser console** for frontend errors
4. **Check session endpoint:** `/api/check-session`
5. **Vercel Blob dashboard** for upload verification

---

## 🎉 **Version History**

### **v1.0.0** - Current
- ✅ Vercel Blob file storage
- ✅ Custom confirmation modals
- ✅ Fixed sender name display
- ✅ Spam protection with dynamic delays
- ✅ Email logs with detailed tracking
- ✅ Template management
- ✅ HR contact management
- ✅ Gmail OAuth integration
- ✅ Premium UI/UX

---

**Made with ❤️ for job seekers by Antigravity**

🚀 **Happy Job Hunting!**
