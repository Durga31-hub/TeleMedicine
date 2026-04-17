# 🏥 TeleCare: AI-Based Telemedicine Platform

TeleCare is a full-stack telemedicine platform that helps patients connect with doctors quickly and efficiently. It combines basic AI-driven symptom checking with real-time video consultations to make healthcare more accessible and streamlined.

## 🚀 Features

### 🩺 AI Symptom Checker

* Patients can enter their symptoms and get a basic analysis.
* The system groups symptoms into categories like respiratory, cardiac, neurological, and mental health.
* It also gives a rough severity level and some context that can help doctors before the consultation starts.

### 🎥 Video Consultation

* Supports real-time video and audio communication using WebRTC.
* Includes a live chat feature for sharing additional information during the call.
* AI-generated symptom data is available to the doctor during the session.

### 📋 Medical Records

* Doctors can generate digital prescriptions after consultations.
* Patients can view past records and upcoming appointments in one place.
* Records can be downloaded for future reference.

### 🔔 Notifications

* Patients get notified when the doctor joins the session.
* Quick access links allow users to join consultations instantly.

## 🛠️ Tech Stack

* Frontend: React.js
* Backend: Node.js, Express.js
* Database: MongoDB
* Real-time Communication: Socket.io, WebRTC
* API Handling: Axios

## ⚙️ Setup Instructions

### Prerequisites

* Node.js (v18 or above)
* MongoDB (local or Atlas)

### 1. Clone the project

```bash
git clone <repository-url>
cd telemedicine-platform
```

### 2. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Environment setup

Create a `.env` file inside the `server` folder:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/telemedicine
JWT_SECRET=your_secret_key_here
```

### 4. Run the app

Start backend:

```bash
cd server
npm run dev
```

Start frontend:

```bash
cd client
npm start
```

Open: http://localhost:3000

## 🛡️ Notes

* This project is a prototype built for a hackathon.
* The symptom checker is not a medical diagnosis tool.
* It is designed to demonstrate how AI can assist in healthcare workflows.

---

*Built for Hackathon 2026*
