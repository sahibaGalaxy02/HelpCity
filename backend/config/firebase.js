const admin = require('firebase-admin');

let initialized = false;

const initializeFirebase = () => {
  if (!initialized) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      initialized = true;
      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      // Already initialized (hot reload in dev)
      if (error.code === 'app/duplicate-app') {
        initialized = true;
      } else {
        console.error('❌ Firebase Admin init error:', error.message);
      }
    }
  }
};

const verifyFirebaseToken = async (idToken) => {
  initializeFirebase();
  return await admin.auth().verifyIdToken(idToken);
};

// Initialize on module load
initializeFirebase();

module.exports = { initializeFirebase, verifyFirebaseToken };
