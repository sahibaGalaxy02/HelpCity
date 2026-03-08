import { initializeApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let appInstance = null
let authInstance = null

const isPlaceholder = (value = '') =>
  !value || value.includes('...') || value.includes('your-project')

const ensureFirebaseAuth = () => {
  if (authInstance) return authInstance

  if (
    isPlaceholder(firebaseConfig.apiKey) ||
    isPlaceholder(firebaseConfig.authDomain) ||
    isPlaceholder(firebaseConfig.projectId) ||
    isPlaceholder(firebaseConfig.appId)
  ) {
    throw new Error('Firebase is not configured. Update VITE_FIREBASE_* values in your .env file.')
  }

  appInstance = initializeApp(firebaseConfig)
  authInstance = getAuth(appInstance)
  return authInstance
}

export const setupRecaptcha = (containerId) => {
  const auth = ensureFirebaseAuth()
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear()
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      window.recaptchaVerifier = null
    },
  })
  return window.recaptchaVerifier
}

export const sendOTP = async (phoneNumber, appVerifier) => {
  const auth = ensureFirebaseAuth()
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
}

export { ensureFirebaseAuth as getFirebaseAuth }
