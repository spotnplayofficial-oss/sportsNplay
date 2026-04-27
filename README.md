# 🏆 PLAYNSPORTS

> **Uber for Sports Grounds** — Find players near you, book premium grounds, and never miss a game again.

![PLAYNSPORTS Banner](https://img.shields.io/badge/PLAYNSPORTS-Live-4ade80?style=for-the-badge&labelColor=060606)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io)

---

## 📌 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

---

## 📖 About

PLAYNSPORTS is a full-stack MERN application that connects sports players with each other and with ground owners. Players can mark themselves as available on a live map, find nearby players, join/create sports groups, book grounds, and chat in real-time.

---

## ✨ Features

- 🗺️ **Live Map** — Players mark availability with location, sport & skill level
- 🔍 **Nearby Search** — Find players & grounds within custom radius
- 🏟️ **Ground Booking** — Book sports grounds with slot selection
- 💳 **Razorpay Payments** — 30% advance + 70% final payment flow with refunds
- 💬 **Real-time Chat** — 1-on-1 and group chat via Socket.io
- 👥 **Sports Groups** — Create groups, invite players, set joining deadlines
- 📧 **OTP Login** — Email-based OTP authentication via Gmail
- 🖼️ **Avatar Upload** — Cloudinary image upload for profile photos
- 🔐 **JWT Auth** — Secure authentication with role-based access (Player / Ground Owner)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI Framework |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| React Leaflet | Interactive maps |
| Socket.io Client | Real-time chat |
| Axios | API requests |
| Razorpay JS | Payment gateway |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time WebSockets |
| JWT | Authentication |
| Bcrypt.js | Password hashing |
| Cloudinary | Image storage |
| Nodemailer | OTP emails via Gmail |
| Razorpay | Payment processing |

---

## 📁 Project Structure

```
SpotNPlay/
└── playnsports/
    ├── client/                  # React frontend
    │   ├── public/
    │   │   └── vercel.json      # Vercel SPA routing fix
    │   └── src/
    │       ├── api/
    │       │   └── axios.js     # Axios instance with auth interceptor
    │       ├── context/
    │       │   ├── AuthContext.jsx
    │       │   └── SocketContext.jsx
    │       ├── pages/
    │       │   ├── Home.jsx
    │       │   ├── Login.jsx
    │       │   ├── Register.jsx
    │       │   ├── OTPLogin.jsx
    │       │   ├── MapSearch.jsx
    │       │   ├── GroundDetail.jsx
    │       │   ├── PlayerDashboard.jsx
    │       │   ├── GroundOwnerDashboard.jsx
    │       │   ├── ProfilePage.jsx
    │       │   ├── GroupPage.jsx
    │       │   └── ChatPage.jsx
    │       ├── components/
    │       │   └── Navbar.jsx
    │       ├── App.jsx
    │       └── main.jsx
    │
    └── server/                  # Node.js backend
        ├── config/
        │   └── db.js            # MongoDB connection
        ├── controllers/
        │   ├── authController.js
        │   ├── playerController.js
        │   ├── groundController.js
        │   ├── bookingController.js
        │   ├── uploadController.js
        │   ├── groupController.js
        │   ├── otpController.js
        │   ├── paymentController.js
        │   └── chatController.js
        ├── models/
        │   ├── User.js
        │   ├── Player.js
        │   ├── Ground.js
        │   ├── Booking.js
        │   ├── Payment.js
        │   ├── Group.js
        │   ├── OTP.js
        │   ├── Conversation.js
        │   └── Message.js
        ├── routes/
        │   ├── authRoutes.js
        │   ├── playerRoutes.js
        │   ├── groundRoutes.js
        │   ├── bookingRoutes.js
        │   ├── uploadRoutes.js
        │   ├── groupRoutes.js
        │   ├── otpRoutes.js
        │   ├── paymentRoutes.js
        │   └── chatRoutes.js
        ├── socket/
        │   └── socketHandler.js
        ├── utils/
        │   ├── generateToken.js
        │   └── sendEmail.js
        ├── .env
        ├── server.js
        └── package.json
```

---

## ✅ Prerequisites

Make sure you have these installed before starting:

- **Node.js** v18 or higher → [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **Git** → [Download](https://git-scm.com)
- **MongoDB Atlas** account (free) → [Sign up](https://mongodb.com/atlas)
- **Cloudinary** account (free) → [Sign up](https://cloudinary.com)
- **Razorpay** account (test mode) → [Sign up](https://razorpay.com)
- A **Gmail** account with App Password enabled

---

## 🚀 Local Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/AlphaGaurav13/SpotNPlay.git
cd SpotNPlay/playnsports
```

---

### Step 2 — Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/` folder:

```bash
# On Windows
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```

Then fill in your values (see [Environment Variables](#environment-variables) section below).

---

### Step 3 — Setup Frontend

```bash
cd ../client
npm install
```

---

### Step 4 — Update Frontend API URL

In `client/src/api/axios.js`, make sure this is set for local development:

```javascript
const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});
```

In `client/src/context/SocketContext.jsx`:

```javascript
socketRef.current = io('http://localhost:5000', { ... });
```

---

## 🔐 Environment Variables

Create `server/.env` with these values:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/playnsports

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail OTP (use App Password, not your real password)
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Razorpay (test mode keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### How to get each value:

**MongoDB URI:**
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Click **Connect** → **Connect your application**
4. Copy the connection string and replace `<password>`

**Cloudinary:**
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy Cloud Name, API Key, API Secret from the dashboard

**Gmail App Password:**
1. Go to your Google Account → Security
2. Enable **2-Step Verification**
3. Go to **App Passwords** → Generate a new app password
4. Use that 16-digit password as `EMAIL_PASS`

**Razorpay:**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Settings → API Keys → Generate Test Key
3. Copy Key ID and Key Secret

---

## ▶️ Running the App

### Run Backend (Terminal 1)

```bash
cd SpotNPlay/playnsports/server
npm run dev
```

You should see:
```
Server running on port 5000 🟢
MongoDB Connected: cluster0.xxxxx.mongodb.net 🟢
```

---

### Run Frontend (Terminal 2)

```bash
cd SpotNPlay/playnsports/client
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### Open in Browser

```
http://localhost:5173
```

---

## 🧪 Test Credentials (Razorpay)

Use these in test mode:

| Method | Details |
|---|---|
| UPI | `success@razorpay` |
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

---

## 🌐 Deployment

### Frontend — Vercel

| Setting | Value |
|---|---|
| Root Directory | `playnsports/client` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Before deploying or running locally, create a `.env` file in the `client` folder or set variables in Vercel:
```
VITE_API_URL=https://spotnplay-1.onrender.com/api
VITE_SOCKET_URL=https://spotnplay-1.onrender.com
```
(See `.env.example` for defaults.)

### Backend — Render.com

| Setting | Value |
|---|---|
| Root Directory | `playnsports/server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | Add all `.env` variables (see example below) |
A `.env` file for the server should include at least the following keys:

```env
PORT=5000
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=long_random_secret
NODE_ENV=production

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

EMAIL_USER=your@mail.com
EMAIL_PASS=app-password-or-service-credentials

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# optional: comma‑separated list of allowed origins for CORS
ALLOWED_ORIGINS=http://localhost:5173,https://playnsports-app.vercel.app,https://your-front-url.com
```> ⚠️ **Note:** Render free plan has cold starts (~30 sec on first request after inactivity). This is normal.

### Live URLs
- **Frontend:** https://playnsports-app.vercel.app
- **Backend:** https://spotnplay-1.onrender.com

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/me` | Get current user |

### Players
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/players/availability` | Set player as available |
| GET | `/api/players/nearby` | Get nearby available players |
| GET | `/api/players/me` | Get my player profile |
| PATCH | `/api/players/offline` | Go offline |

### Grounds
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/grounds` | Create a ground |
| GET | `/api/grounds/nearby` | Get nearby grounds |
| GET | `/api/grounds/:id` | Get ground details |
| POST | `/api/grounds/:id/slots` | Add slots to ground |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings/grounds/:id/book` | Book a ground slot |
| GET | `/api/bookings/my` | Get my bookings |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/grounds/:id/advance-order` | Create 30% advance order |
| POST | `/api/payments/grounds/:id/verify-advance` | Verify advance payment |
| POST | `/api/payments/bookings/:id/final-order` | Create 70% final order |
| POST | `/api/payments/bookings/:id/verify-final` | Verify final payment |
| POST | `/api/payments/bookings/:id/cancel-refund` | Cancel & get refund |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat/direct` | Get or create direct conversation |
| GET | `/api/chat/conversations` | Get all my conversations |
| GET | `/api/chat/:conversationId/messages` | Get messages |
| POST | `/api/chat/message` | Send a message |

### OTP
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/otp/send` | Send OTP to email |
| POST | `/api/otp/verify` | Verify OTP |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Gaurav Kumar**
- GitHub: [@AlphaGaurav13](https://github.com/AlphaGaurav13)
- Project: [SpotNPlay](https://github.com/AlphaGaurav13/SpotNPlay)

---

<div align="center">
  <p>Built with ❤️ for players, by players.</p>
  <p><strong>PLAYNSPORTS — Your sports community, live on the map.</strong></p>
</div>
```