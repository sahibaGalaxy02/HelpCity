import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FiMapPin, FiPhone, FiArrowRight, FiShield } from 'react-icons/fi'
import { setupRecaptcha, sendOTP } from '../services/firebase'
import { loginUser } from '../redux/slices/authSlice'
import bg from "../assets/bg1.jpg"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  const otpRefs = useRef([])

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading: authLoading } = useSelector(s => s.auth)

  const formatPhone = (value) => {
    let cleaned = value.replace(/\D/g, '')
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned
    }
    return '+' + cleaned
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    setLoading(true)
    try {
      const verifier = setupRecaptcha('recaptcha-container')
      const formattedPhone = formatPhone(phone)
      const result = await sendOTP(formattedPhone, verifier)
      setConfirmationResult(result)
      setStep('otp')
      toast.success(`OTP sent to ${formattedPhone}`)
    } catch (error) {
      console.error('OTP error:', error)
      toast.error(error.message || 'Failed to send OTP. Check your phone number.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }

    setLoading(true)
    try {
      const result = await confirmationResult.confirm(otpCode)
      const idToken = await result.user.getIdToken()

      const res = await dispatch(loginUser({ idToken }))
      if (loginUser.fulfilled.match(res)) {
        toast.success('Welcome to HelpCity! 🎉')
        navigate('/')
      } else {
        toast.error(res.payload || 'Login failed')
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      toast.error('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
  <div
    className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
    style={{ backgroundImage: `url(${bg})` }}
  >

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/60"></div>

    <div className="relative z-10 flex w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl">

      {/* LEFT SIDE (Info Panel) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 text-white bg-gradient-to-br from-blue-700/80 to-indigo-900/80 backdrop-blur">

        <div className="flex items-center gap-3 mb-8">
          <FiMapPin className="text-3xl" />
          <h1 className="text-3xl font-bold">HelpCity</h1>
        </div>

        <h2 className="text-4xl font-bold leading-snug mb-6">
          Report civic issues <br />
          and build better cities
        </h2>

        <p className="text-blue-100 mb-10">
          Join thousands of citizens improving their city by reporting
          potholes, garbage overflow, broken streetlights and more.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: "🛣️", label: "Road Issues", count: "2.4k" },
            { icon: "💧", label: "Water Problems", count: "1.8k" },
            { icon: "⚡", label: "Power Issues", count: "956" },
            { icon: "🗑️", label: "Garbage Reports", count: "3.1k" }
          ].map((item) => (
            <div
              key={item.label}
className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transition hover:scale-105 hover:bg-white/20"            >
              <div className="text-2xl">{item.icon}</div>
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="text-xs text-blue-200">{item.count} reported</div>
            </div>
          ))}
        </div>
      </div>


      {/* RIGHT SIDE (Login Card) */}
      <div className="flex-1 flex items-center justify-center bg-white/95 p-10">

        <div className="w-full max-w-sm">

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Sign in with phone
          </h2>

          <p className="text-gray-500 text-sm mb-8">
            We'll send an OTP to verify your number
          </p>


          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-5">

              <div>
                <label className="text-sm text-gray-600">
                  Phone Number
                </label>

                <div className="relative mt-2">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex gap-2 items-center">
                    <FiPhone size={16} />
                    <span>+91</span>
                  </div>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-lg py-3 pl-20 pr-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div id="recaptcha-container"></div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                Send OTP <FiArrowRight />
              </button>

            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">

              <h3 className="text-lg font-semibold text-gray-800">
                Enter OTP
              </h3>

              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || authLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <FiShield /> Verify & Login
              </button>

            </form>
          )}

          <p className="text-xs text-gray-400 mt-8 text-center">
            By continuing you agree to our Terms and Privacy Policy
          </p>

          <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
></motion.div>

        </div>
      </div>

    </div>
  </div>
  )
}

