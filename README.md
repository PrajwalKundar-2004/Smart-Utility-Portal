# 🎓 Smart-Utility Portal

> A modern, role-based academic utility portal that bridges the communication gap between lecturers and students.

The **Smart-Utility Portal** is a full-stack web application designed to streamline academic management. It offers dedicated, secure dashboards for both **Lecturers** and **Students**, making it incredibly easy to share and access essential academic resources like assignments, attendance, results, and notices.

---

## ✨ Key Features

### 🔐 Secure Authentication & Authorization
- **Role-Based Access Control:** Separate login and routing flows for Lecturers and Students.
- **Data Security:** Encrypted passwords using `bcrypt` and secure sessions using `JWT` (JSON Web Tokens).

### 👨‍🏫 Lecturer Dashboard
- **Notices:** Broadcast important announcements and updates to students.
- **Assignments:** Upload and manage coursework and assignments.
- **Attendance:** Keep track of and manage student attendance records.
- **Results:** Publish academic results for student access.

### 👨‍🎓 Student Dashboard
- **Notices:** Stay updated with the latest announcements from lecturers.
- **Assignments:** View and keep track of pending assignments.
- **Attendance:** Check personal attendance records and status.
- **Results:** Securely access personal academic results.

---

## 🛠️ Tech Stack

This project is built using the **MERN** stack, along with modern frontend tooling.

- **Frontend:** [React.js](https://react.dev/) (v19) powered by [Vite](https://vitejs.dev/) for fast builds.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for beautiful, responsive, and rapid UI development.
- **Backend:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) for a robust RESTful API.
- **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose) for flexible NoSQL data management.
- **Routing:** React Router v7 for seamless Client-Side Routing.

---

## 🚀 Getting Started

Follow these simple steps to get a local copy up and running.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd web-project
   ```

2. **Install all dependencies:**
   This project uses a unified `package.json` for both frontend and backend dependencies.
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Navigate to the backend directory and set up your environment variables.
   - Create a `.env` file in `src/backend/.env`.
   - Add your MongoDB URI and any other required secrets (like JWT secret).
   ```env
   # Example src/backend/.env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run the Backend Server:**
   Start the Express server using Nodemon (which watches for changes).
   ```bash
   npm run backend
   ```

5. **Run the Frontend Development Server:**
   Open a new terminal window and start the Vite dev server.
   ```bash
   npm run dev
   ```

6. **Explore!**
   Open your browser and navigate to `http://localhost:5173` (or the port Vite provides) to see the application in action.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is open-source and available under the MIT License.
