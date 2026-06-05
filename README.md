# 🏙️ HelpCity — Civic Issue Reporting Platform

A full-stack MERN application that enables citizens to report civic issues (potholes, garbage overflow, broken streetlights, water leakage) and allows admins to manage and resolve them.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| State | Redux Toolkit |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | Firebase Phone OTP + JWT |
| Images | Cloudinary |
| Maps | Google Maps JavaScript API |
| HTTP | Axios |

---

## 📁 Project Structure

```
helpcity/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js     # Cloudinary + Multer setup
│   │   ├── db.js             # MongoDB connection
│   │   └── firebase.js       # Firebase Admin SDK
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── issueController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT protect + adminOnly
│   │   └── validate.js       # express-validator rules
│   ├── models/
│   │   ├── User.js
│   │   └── Issue.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── issues.js
│   │   ├── admin.js
│   │   └── upload.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── IssueCard.jsx
    │   │   └── layout/
    │   │       ├── Layout.jsx
    │   │       └── Navbar.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── ReportIssuePage.jsx
    │   │   ├── IssueDetailPage.jsx
    │   │   ├── UserDashboard.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── redux/
    │   │   ├── store.js
    │   │   └── slices/
    │   │       ├── authSlice.js
    │   │       └── issuesSlice.js
    │   ├── services/
    │   │   ├── api.js          # Axios instance + API calls
    │   │   └── firebase.js     # Firebase client setup
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Firebase project with Phone Authentication enabled
- Cloudinary account
- Google Cloud project with Maps JavaScript API + Geocoding API enabled

---

### 1. Clone & Install

```bash
# Backend
cd helpcity/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication → Phone** sign-in method
4. Go to **Project Settings → Your Apps → Add Web App** and copy the config for frontend
5. Go to **Project Settings → Service Accounts → Generate new private key** for backend
6. Add your domain (localhost) to Firebase **Authorized Domains**

---

### 3. Backend Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cd backend
cp .env.example .env
```

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/helpcity

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Phone number that automatically gets admin role on first login
ADMIN_PHONE=+919999999999

FRONTEND_URL=http://localhost:5173
```

---

### 4. Frontend Environment Variables

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

### 5. Run the App

**Backend:**
```bash
cd backend
npm run dev      # Development with nodemon
# or
npm start        # Production
```

**Frontend:**
```bash
cd frontend
npm run dev      # Development server at http://localhost:5173
# or
npm run build    # Production build
npm run preview  # Preview production build
```

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login/register with Firebase ID token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile name |

### Issues
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/issues` | Get all issues (filters: category, status, sort, page) | Public |
| POST | `/api/issues` | Create new issue (multipart/form-data) | Required |
| GET | `/api/issues/my` | Get current user's issues | Required |
| GET | `/api/issues/:id` | Get single issue | Public |
| PUT | `/api/issues/:id` | Update own issue | Required |
| DELETE | `/api/issues/:id` | Delete own issue | Required |
| POST | `/api/issues/:id/upvote` | Toggle upvote | Required |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/issues` | All issues with filters | Admin |
| PUT | `/api/admin/status/:id` | Update status/department/notes | Admin |
| DELETE | `/api/admin/issues/:id` | Delete any issue | Admin |
| GET | `/api/admin/users` | List all citizens | Admin |

---

## 🛡️ Security Features

- **JWT Authentication** — Stateless token-based auth, 7-day expiry
- **Firebase Phone OTP** — Secure phone verification with reCAPTCHA
- **Rate Limiting** — 100 req/15min globally; 20 req/hour for auth routes
- **Helmet.js** — Secure HTTP headers
- **Input Validation** — express-validator on all POST/PUT routes
- **CORS** — Configured to allow only your frontend URL
- **Image Validation** — Multer restricts to images < 5MB
- **Role-based Access** — Citizen vs Admin middleware guards

---

## 🚀 Deployment

### Backend (Railway / Render / DigitalOcean)
1. Set all environment variables in your hosting platform
2. Build command: `npm install`
3. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Set all `VITE_*` environment variables
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add a `vercel.json` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### MongoDB Atlas
- Use a free M0 cluster
- Whitelist `0.0.0.0/0` for cloud deployments
- Update `MONGO_URI` to your Atlas connection string

---

## 🔧 Making a User an Admin

Option 1: Set `ADMIN_PHONE=+91XXXXXXXXXX` in backend `.env` before that user first logs in.

Option 2: Manually update in MongoDB:
```javascript
db.users.updateOne({ phone: "+91XXXXXXXXXX" }, { $set: { role: "admin" } })
```

---

## 📱 Features

### Citizen Side
- 📱 Phone OTP login via Firebase
- 📝 Report issues with title, description, category, photo
- 📍 Auto-detect location with Google Maps
- 🗳️ Upvote issues to show community support
- 📋 View issue feed with filters
- 👤 Personal dashboard with issue tracking

### Admin Side
- 📊 Dashboard with statistics (total, by status, by category)
- 🔍 Search and filter all issues
- ✏️ Update issue status (Pending → In Progress → Resolved / Rejected)
- 🏢 Assign to department
- 📝 Add admin notes visible to reporter
- 🗑️ Delete spam issues

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with descriptive messages
4. Open a pull request

---

## 📄 License

MIT License — free for personal and commercial use.