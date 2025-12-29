# 💬 Chit-Chat - Real-time Anonymous Chat App
A modern **MERN stack** real-time chat application with **room-based conversations**, **admin controls**, and **anonymous messaging**. No chat history stored - perfect for private discussions.

## ✨ Features

- ✅ **User Registration & Login** - JWT authenticated users
- ✅ **Room Creation** - Auto-generates **8-character unique room IDs**
- ✅ **Room Joining** - Join any room using room ID
- ✅ **Real-time Messaging** - Socket.IO powered instant chat
- ✅ **Timestamps** - Messages show exact send time (`HH:MM`)
- ✅ **Admin Controls** - `Admin: username` prefix, kick users, dismiss rooms
- ✅ **Anonymous** - **No message history stored** in database
- ✅ **Responsive UI** - Works on **Desktop, Tablet, Mobile**
- ✅ **Clean Dark UI** - Modern purple/blue theme
- ✅ **MongoDB Atlas Ready** - Production database support

## 🛠 Tech Stack

Frontend: React 18 + Vite + Socket.IO Client + CSS Modules
Backend: Node.js + Express + Socket.IO + MongoDB + JWT + bcrypt
Database: MongoDB Atlas (chit-chat)
Deployment: Vercel (Frontend) + Render (Backend)

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)
- [MongoDB Atlas](https://mongodb.com/atlas) account (FREE)

### 1. Clone & Setup
git clone https://github.com/govind927/Chit-Chat-Real-Time-Chat-App
cd chit-chat

Backend
cd server && npm install && cd ../client && npm install

### 2. Environment Setup

**`server/.env`**:
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chit-chat?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-keep-it-safe
CLIENT_ORIGIN=http://localhost:3000

**`client/.env`**:
VITE_API_URL=http://localhost:5000

text

### 3. Run Development Servers
Terminal 1 - Backend
cd server
npm run dev

MongoDB connected + Server running on port 5000
Terminal 2 - Frontend
cd client
npm run dev

Local: http://localhost:3000/

## 🎮 Usage Flow

Register/Login → JWT token stored

Lobby → Create room (auto 8-char ID) OR Join with ID

Chat → Real-time messages with timestamps

Admin → "Admin: username" prefix + Kick/Dismiss

Users → Can only Leave room

Dismiss → Room + data PERMANENTLY deleted (anonymous)

## 🌐 Production Deployment

### Backend (Render.com)
render.com → New → Web Service → Connect GitHub

Root directory: server

Build: npm install

Start: npm start

Env vars: MONGO_URI, JWT_SECRET, CLIENT_ORIGIN

### Frontend (Vercel)
vercel.com → New Project → Import GitHub repo

Root directory: client

Build: npm run build

Output: dist

Env var: VITE_API_URL=https://your-render-app.onrender.com

## 📱 Responsive Design

| Device | Layout |
|--------|--------|
| **Desktop** | Sidebar (Room info) + Main Chat |
| **Tablet** | Stacked layout |
| **Mobile** | Full-screen chat + touch-friendly |

## 📈 Performance & Scale

- **Socket.IO**: 1000+ concurrent users/room
- **No message storage**: Instant scaling
- **MongoDB indexes**: `roomId`, `username`
- **Vite**: Lightning-fast builds (~1s)
- **Render/Vercel**: FREE hosting

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push & PR

## 📄 License

MIT License - Free for commercial use, education, portfolios.

