import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FiArrowRight, FiMapPin, FiPhone, FiShield, FiStar } from 'react-icons/fi'
import { setupRecaptcha, sendOTP } from '../services/firebase'
import { loginUser } from '../redux/slices/authSlice'
import bg from '../assets/bg1.jpg'

export default function LoginPage() {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  const otpRefs = useRef([])

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading: authLoading } = useSelector((state) => state.auth)

  const formatPhone = (value) => {
    let cleaned = value.replace(/\D/g, '')
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = `91${cleaned}`
    }
    return `+${cleaned}`
  }

  const handleSendOTP = async (event) => {
    event.preventDefault()
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
    const nextOtp = [...otp]
    nextOtp[index] = value.slice(-1)
    setOtp(nextOtp)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async (event) => {
    event.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }

    setLoading(true)
    try {
      const result = await confirmationResult.confirm(otpCode)
      const idToken = await result.user.getIdToken()

      const response = await dispatch(loginUser({ idToken }))
      if (loginUser.fulfilled.match(response)) {
        toast.success('Welcome to HelpCity!')
        navigate('/')
      } else {
        toast.error(response.payload || 'Login failed')
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
      className="relative min-h-screen overflow-hidden bg-cover bg-center px-4 py-8 sm:px-6"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-slate-950/68" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.22),transparent_24%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-[0_30px_90px_rgba(15,23,42,0.32)] backdrop-blur-xl">
        <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-gradient-to-br from-sky-600/55 via-cyan-600/35 to-slate-950/70 p-12 text-white">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 backdrop-blur">
                <FiMapPin className="text-2xl" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">HelpCity</h1>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-100/80">Faster civic action</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-50">
              <FiStar size={12} /> Trusted by local communities
            </div>

            <h2 className="mt-6 font-display text-5xl font-bold leading-[1.02]">
              Report what matters.
              <br />
              See your city respond.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-sky-50/82">
              Join residents tracking potholes, water leaks, streetlight failures, and sanitation issues in one clean public feed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Road Issues', count: '2.4k reported', tone: 'Road' },
              { label: 'Water Problems', count: '1.8k tracked', tone: 'Water' },
              { label: 'Power Issues', count: '956 active', tone: 'Electricity' },
              { label: 'Waste Reports', count: '3.1k resolved', tone: 'Garbage' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm transition-transform hover:-translate-y-1"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/70">{item.tone}</div>
                <div className="mt-2 text-lg font-semibold">{item.label}</div>
                <div className="mt-1 text-sm text-sky-100/72">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Secure login
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold text-slate-900">
                Sign in with phone
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                We&apos;ll send a one-time passcode to verify your number and keep reporting fast.
              </p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>

                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 text-slate-500">
                      <FiPhone size={16} />
                      <span className="font-semibold">+91</span>
                    </div>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="input-field relative z-0 pl-20"
                      placeholder="Enter mobile number"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div id="recaptcha-container"></div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  Send OTP <FiArrowRight />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Enter OTP
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Type the 6-digit code sent to {formatPhone(phone)}
                  </p>
                </div>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => { otpRefs.current[index] = element }}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      className="h-14 w-12 rounded-2xl border border-slate-200 bg-white text-center text-lg font-bold text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className="btn-primary w-full py-3"
                >
                  <FiShield /> Verify & Login
                </button>
              </form>
            )}

            <p className="mt-8 text-center text-xs leading-6 text-slate-400">
              By continuing you agree to our Terms and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
