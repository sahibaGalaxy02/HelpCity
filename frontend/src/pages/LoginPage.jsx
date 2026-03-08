import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FiMapPin, FiPhone, FiArrowRight, FiShield } from 'react-icons/fi'
import { setupRecaptcha, sendOTP } from '../services/firebase'
import { loginUser } from '../redux/slices/authSlice'

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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-700 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-56 h-56 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FiMapPin className="text-white text-xl" />
            </div>
            <span className="font-display font-bold text-2xl text-white">HelpCity</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-white leading-tight mb-6">
            Report civic issues,<br />
            <span className="text-brand-200">build better cities.</span>
          </h1>
          <p className="text-brand-200 text-lg leading-relaxed mb-10">
            Join thousands of citizens making a difference. Report potholes, garbage overflow, broken streetlights, and more.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🛣️', label: 'Road Issues', count: '2.4k' },
              { icon: '💧', label: 'Water Problems', count: '1.8k' },
              { icon: '⚡', label: 'Power Issues', count: '956' },
              { icon: '🗑️', label: 'Garbage Reports', count: '3.1k' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-white font-semibold text-sm">{item.label}</div>
                <div className="text-brand-200 text-xs">{item.count} reported</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo (mobile) */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <FiMapPin className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">Help<span className="text-brand-600">City</span></span>
          </div>

          {step === 'phone' ? (
            <div className="animate-slide-up">
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Sign in with phone</h2>
              <p className="text-gray-500 text-sm mb-8">We'll send an OTP to verify your number</p>

              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                      <FiPhone size={16} />
                      <span className="text-sm">+91</span>
                      <div className="w-px h-5 bg-gray-200" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="input-field pl-24"
                      maxLength={10}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enter 10-digit number without country code</p>
                </div>

                <div id="recaptcha-container" />

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner" />
                      Sending OTP...
                    </div>
                  ) : (
                    <>Send OTP <FiArrowRight /></>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-slide-up">
              <button
                onClick={() => setStep('phone')}
                className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
              >
                ← Change number
              </button>
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-gray-500 text-sm mb-8">
                We sent a 6-digit code to <strong>{formatPhone(phone)}</strong>
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex gap-3 justify-between">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading || authLoading} className="btn-primary w-full">
                  {(loading || authLoading) ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner" />
                      Verifying...
                    </div>
                  ) : (
                    <><FiShield size={16} /> Verify & Login</>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Didn't receive OTP?{' '}
                  <button type="button" onClick={() => setStep('phone')} className="text-brand-600 font-medium">
                    Resend
                  </button>
                </p>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
