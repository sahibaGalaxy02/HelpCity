# HelpCity

![GitHub Stars](https://img.shields.io/github/stars/sahibaGalaxy02/HelpCity?style=flat-square&color=yellow)
![GitHub Forks](https://img.shields.io/github/forks/sahibaGalaxy02/HelpCity?style=flat-square&color=blue)
![License](https://img.shields.io/badge/License-Unspecified-lightgrey.svg)

HelpCity is a full-stack web application designed to help citizens report and track city-related issues efficiently. It provides a platform where users can submit complaints, monitor their status, and improve communication between citizens and authorities.

## 🚀 Key Features

*   **🔐 User Authentication**: Secure login and logout functionalities for citizens and potentially administrative users.
*   **📝 Issue Reporting System**: An intuitive interface for users to submit new issues with relevant details.
*   **🔄 Issue Status Tracking & Updates**: Citizens can track the progress of their reported issues, and authorities can update their status.
*   **💻 Responsive User Interface**: A user-friendly design that works seamlessly across various devices.
*   **⚡ Smooth Frontend-Backend Integration**: Efficient communication and data exchange between the client and server.
*   **⚙️ Admin Dashboard**: (Inferred from `adminController.js`) Functionality for administrators to manage and filter reported issues.
*   **☁️ Cloud-based File Uploads**: Integration with Cloudinary for handling image and media uploads related to issues.
*   **🔥 Real-time Features (Possible)**: Firebase integration suggests potential for notifications or real-time updates.

## 🛠️ Tech Stack

### Frontend

*   **Languages**: HTML, CSS, JavaScript
*   **Framework/Library**: React.js

### Backend

*   **Language**: JavaScript
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (using Mongoose ODM)
*   **File Storage**: Cloudinary
*   **Real-time/Admin Utilities**: Firebase Admin SDK
*   **File Upload Middleware**: Multer

## 📂 Project Structure

```
├── .gitignore
├── README.md
└── backend/
    ├── config/
    │   ├── cloudinary.js
    │   ├── db.js
    │   └── firebase.js
    ├── controllers/
    │   ├── adminController.js
    │   ├── authController.js
    │   └── issueController.js
    ├── middleware/
    │   ├── auth.js
    │   └── validate.js
    ├── models/
    │   ├── Issue.js
    │   └── User.js
    ├── package-lock.json
    ├── package.json
    └── routes/
```

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: [Download & Install Node.js](https://nodejs.org/en/download/) (which includes npm)
*   **MongoDB**: A running MongoDB instance. You can set up a local instance or use a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
*   **Cloudinary Account**: A free account for image storage.
*   **Firebase Project**: A Firebase project configured for admin SDK access.

## 🚀 Installation & Setup

Follow these steps to get HelpCity up and running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/sahibaGalaxy02/HelpCity.git
cd HelpCity
```

### 2. Backend Setup

Navigate into the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

#### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string # e.g., mongodb://localhost:27017/helpcity OR your_atlas_uri

JWT_SECRET=your_jwt_secret_key # A strong, unique key for JWT
JWT_EXPIRE=30d # e.g., 30d for 30 days

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" # Replace newline characters if storing as string
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

**Note on `FIREBASE_PRIVATE_KEY`**: If copying directly from a JSON key file, ensure newline characters (`\n`) are correctly escaped or handled as shown.

### 3. Frontend Setup (Assumed)

Although not explicitly in the provided `project structure`, the `README.md` snippet indicates a React.js frontend. If there is a `frontend` directory:

```bash
cd ../frontend # Go back to root, then into frontend
npm install
```

Create a `.env` file in the `frontend` directory for any client-side environment variables (e.g., `REACT_APP_API_URL=http://localhost:5000`).

### 4. Run the Application

#### Start the Backend

From the `backend` directory:

```bash
npm start
# Or for development with nodemon:
npm run dev
```

The backend server should start, usually on `http://localhost:5000` (or your specified `PORT`). You should see messages like "✅ MongoDB Connected" and "✅ Firebase Admin initialized".

#### Start the Frontend (Assumed)

From the `frontend` directory:

```bash
npm start
```

This will typically open the application in your browser at `http://localhost:3000`.

## 📖 Usage

### For Citizens

1.  **Register/Login**: Create a new account or log in using your existing credentials.
2.  **Report an Issue**: Navigate to the "Report Issue" section, fill in the details (category, description, location), and optionally upload supporting images.
3.  **Track Issues**: View a list of your reported issues and monitor their current status (e.g., "Pending", "In Progress", "Resolved").

### For Administrators

1.  **Login**: Access the admin panel with designated admin credentials.
2.  **Manage Issues**: View all reported issues, filter them by category or status, and update their status.
3.  **User Management**: (Potential) Manage user accounts if such functionality is implemented in `adminController`.

## 🤝 Contributing

We welcome contributions to HelpCity! If you have suggestions for improvements or new features, please follow these steps:

1.  **Fork** the repository.
2.  **Create** a new branch (`git checkout -b feature/YourFeature`).
3.  **Implement** your changes.
4.  **Commit** your changes (`git commit -m 'Add some feature'`).
5.  **Push** to the branch (`git push origin feature/YourFeature`).
6.  **Open** a Pull Request.

Please ensure your code adheres to the existing style and conventions.

## 📄 License

This project is currently **Unspecified**. More details regarding the licensing terms will be provided soon.

## 🙏 Acknowledgments

*   [Node.js](https://nodejs.org/)
*   [React](https://react.dev/)
*   [Express](https://expressjs.com/)
*   [MongoDB](https://www.mongodb.com/)
*   [Mongoose](https://mongoosejs.com/)
*   [Cloudinary](https://cloudinary.com/)
*   [Firebase](https://firebase.google.com/)
*   [Multer](https://www.npmjs.com/package/multer)
*   And all the open-source libraries that make this project possible!
