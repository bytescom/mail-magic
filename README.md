# MailMagic 🚀

> **Automated Intelligence for Your Career Growth**

MailMagic is a next-generation job outreach automation SaaS that transforms your job search into a professional, high-conversion operation using secure automation directly through your own Gmail.

![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black?style=flat-square&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=flat-square&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ✨ Features

### 🎯 Core Functionality
- **Email Campaign Automation** - Send personalized emails to multiple HR managers
- **Template Management** - Create and manage professional email templates
- **HR Contact Management** - Organize your recruiter network
- **Email Logs & Analytics** - Track sent emails and campaign performance
- **Resume & Cover Letter Uploads** - Attach documents automatically

### 🔔 **NEW: Notification System**
- Real-time notifications for campaign completions
- HR list sync notifications
- Unread badge with pulse animation
- Mark as read/unread functionality
- Auto-generation on key events
- Beautiful notification dropdown UI

### 🔐 Security & Authentication
- **Google OAuth 2.0** - Secure sign-in
- **Gmail API Integration** - Send emails through your personal Gmail
- **NextAuth.js** - Session management
- **MongoDB** - Secure data storage

### 🎨 Modern UI/UX
- Clean, professional design
- Responsive (mobile, tablet, desktop)
- Dark mode support
- Smooth animations and transitions
- Accessible components

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB instance (local or Atlas)
- Google Cloud Project with Gmail API enabled
- Gmail account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mail-magic.git
   cd mail-magic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key_here

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
mail-magic/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── emails/       # Email sending
│   │   ├── hr-emails/    # HR contact management
│   │   ├── notifications/ # Notification system
│   │   ├── templates/    # Template management
│   │   └── ...
│   ├── dashboard/        # Dashboard page
│   ├── send/             # Send emails page
│   ├── templates/        # Templates page
│   ├── hr-emails/        # HR contacts page
│   ├── logs/             # Email logs page
│   ├── settings/         # Settings page
│   ├── layout.jsx        # Root layout
│   └── page.jsx          # Home page
├── components/
│   ├── DashboardLayout.jsx  # Main dashboard layout with notifications
│   ├── ProtectedRoute.jsx   # Auth protection
│   └── providers/           # Context providers
├── lib/
│   ├── mongodb.js        # Database connection
│   ├── gmail.js          # Gmail API service
│   ├── utils.js          # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── notificationHelpers.js  # Notification utilities
├── models/
│   ├── User.js           # User model
│   ├── EmailTemplate.js  # Template model
│   ├── HrEmail.js        # HR contact model
│   ├── EmailLog.js       # Log model
│   └── Notification.js   # Notification model
├── styles/
│   └── globals.css       # Global styles
└── public/               # Static assets
```

---

## 🎯 Key Features Explained

### 📧 Email Campaign System
Send personalized emails to multiple HR managers with:
- Variable replacement ({{hr_name}}, {{company}}, etc.)
- Spam prevention with delays
- Daily sending limits
- Batch processing

### 📝 Template Management
Create reusable email templates:
- Subject and body customization
- Variable placeholders
- Usage tracking
- Easy editing

### 👥 HR Contact Management
Organize your recruiter network:
- Import from CSV
- Manual addition
- Contact status tracking
- Tag organization

### 📊 Email Logs & Analytics
Track your campaigns:
- Sent/Failed status
- Timestamp tracking
- Search and filter
- Export capabilities

### 🔔 Notification System
Stay informed with real-time notifications:
- Campaign completion alerts
- HR import confirmations
- Security notifications
- Read/unread management
- Click-to-navigate links

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with Google
- `POST /api/auth/signout` - Sign out

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template
- `PATCH /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template

### HR Emails
- `GET /api/hr-emails` - Get all HR contacts
- `POST /api/hr-emails` - Add HR contact
- `POST /api/hr-emails/import` - Import from CSV
- `DELETE /api/hr-emails/[id]` - Delete contact

### Email Sending
- `POST /api/emails/send` - Send email campaign

### Notifications
- `GET /api/notifications` - Fetch notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications` - Mark as read
- `DELETE /api/notifications` - Delete notifications

### User Settings
- `GET /api/user/settings` - Get user settings
- `PATCH /api/user/settings` - Update settings
- `POST /api/user/files` - Upload resume/cover letter

---

## 🎨 Tech Stack

### Frontend
- **Next.js 16.1.3** - React framework with App Router
- **React 19** - UI library
- **TailwindCSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless functions
- **NextAuth.js** - Authentication
- **MongoDB** - Database
- **Mongoose** - ODM

### External APIs
- **Gmail API** - Email sending
- **Google OAuth 2.0** - Authentication

---

## 🔐 Security Features

- **OAuth 2.0** - Secure Google authentication
- **Session Management** - Secure user sessions
- **API Protection** - All routes require authentication
- **Data Encryption** - Sensitive data encrypted
- **Spam Prevention** - Built-in rate limiting
- **CSRF Protection** - NextAuth CSRF tokens

---

## 📱 Responsive Design

MailMagic works perfectly on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1280px+)

---

## 🧪 Testing

### Seed Test Notifications
```javascript
// In browser console
fetch('/api/notifications/seed', { method: 'POST' })
  .then(() => location.reload());
```

### Manual Testing
1. Sign in with Google
2. Create an email template
3. Add HR contacts (or import CSV)
4. Send test campaign
5. Check logs and notifications

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Import your repository
   - Add environment variables
   - Deploy!

3. **Environment Variables on Vercel**
   ```
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_secret
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

4. **Update Google OAuth Settings**
   - Add production domain to authorized origins
   - Add production callback URL

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

---

## 📊 Performance

- ⚡ **Fast Page Loads** - Optimized with Next.js
- 🚀 **Server-Side Rendering** - Initial load performance
- 📦 **Code Splitting** - Smaller bundle sizes
- 🎯 **Lazy Loading** - Load resources on demand
- 💾 **Database Indexing** - Fast queries

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

### Code Style
- ESLint for code quality
- Prettier for formatting
- Component-based architecture
- Clean, maintainable code

---

## 🎨 Favicon & PWA Setup

MailMagic includes a complete favicon setup for all platforms and devices.

### 📁 Favicon Files

All favicon files are located in `public/favicon/`:

- **`favicon.ico`** - Standard browser favicon (multi-size)
- **`favicon-96x96.png`** - High-resolution PNG favicon (96x96)
- **`apple-touch-icon.png`** - iOS home screen icon (180x180)
- **`web-app-manifest-192x192.png`** - Android/PWA icon (192x192)
- **`web-app-manifest-512x512.png`** - High-res displays (512x512)

### 🎨 Favicon Design

The MailMagic favicon features:
- **Blue gradient background** (#3B82F6 to #2563EB) - brand color
- **White paper plane icon** - symbolizing email automation
- **45° dynamic angle** - conveying speed and motion
- **Minimal design** - recognizable at all sizes (16px to 512px)

### ⚙️ Configuration

#### Metadata (`app/layout.jsx`)
```javascript
icons: {
  icon: [
    { url: '/favicon/favicon.ico', sizes: 'any' },
    { url: '/favicon/favicon-96x96.png', sizes: '96x96' },
  ],
  apple: [
    { url: '/favicon/apple-touch-icon.png', sizes: '180x180' },
  ],
}
```

#### PWA Support (`public/site.webmanifest`)
- App name and description
- Theme color: `#3B82F6` (MailMagic blue)
- App shortcuts (Dashboard, Send Emails)
- Icons for all sizes

### 📱 Where Favicons Appear

**Desktop**
- Browser tabs, bookmarks, history, address bar

**Mobile**
- Home screen (when added), browser tabs, app switcher, splash screen

**PWA**
- Installation icon, app drawer, notifications

### ✅ Browser Support

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari (including iOS)
- ✅ Opera
- ✅ Android browsers
- ✅ PWA support

### 🧪 Testing

1. **Browser Test**
   - Refresh page (Ctrl + Shift + R)
   - Check browser tab for favicon
   - Bookmark the page - verify icon appears

2. **Mobile Test**
   - iOS: Share → Add to Home Screen
   - Android: Menu → Add to Home Screen
   - Check home screen icon

3. **PWA Test**
   - Chrome DevTools → Application → Manifest
   - Verify all icons load correctly

### 🔄 How to Update Favicons

Use [RealFaviconGenerator](https://realfavicongenerator.net/):
1. Upload your logo/icon (512x512px recommended)
2. Configure settings
3. Download the package
4. Replace files in `public/favicon/`

**Recommended Sizes:**
- 16x16, 32x32, 48x48 → favicon.ico
- 96x96 → favicon-96x96.png
- 180x180 → apple-touch-icon.png
- 192x192, 512x512 → web-app-manifest-*.png

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting platform
- MongoDB for database solution
- Google for Gmail API

---

## 📞 Support

For issues or questions:
- 📧 Email: support@mailmagic.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/mail-magic/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/mail-magic/discussions)

---

## 🗺️ Roadmap

- [ ] Email scheduling
- [ ] Email templates marketplace
- [ ] A/B testing for email variants
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Browser extension
- [ ] Mobile app

---

## ⭐ Star History

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ by Bytescom**

© 2026 MailMagic. All rights reserved.
