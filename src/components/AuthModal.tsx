import React, { useState, useEffect, useRef } from 'react';
import type { ConfirmationResult } from 'firebase/auth';
import { 
  X, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Smartphone, 
  RefreshCw, 
  UserCheck, 
  ExternalLink,
  Info,
  Key,
  AlertCircle
} from 'lucide-react';
import { 
  isFirebaseConfigured, 
  isEmailJsConfigured, 
  initRecaptchaVerifier, 
  sendRealSmsOtp, 
  verifyRealSmsOtp, 
  sendRealEmailOtp 
} from '../services/realAuthService';

export interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  authMethod: 'email' | 'mobile';
  verified: boolean;
  tier: 'Institutional Pro Member';
  joinedAt: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [method, setMethod] = useState<'mobile' | 'email'>('mobile');
  const [step, setStep] = useState<'input' | 'otp'>('input');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  // Real OTP states (6 digits)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [emailOtpCode, setEmailOtpCode] = useState<string>('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setDeliveryStatus('');

    if (authMode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    if (method === 'mobile') {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 8 || phoneDigits.length > 13) {
        setErrorMsg('Please enter a valid mobile number');
        return;
      }

      const fullPhone = `${countryCode}${phoneDigits}`;
      setIsSending(true);

      if (isFirebaseConfigured()) {
        try {
          setDeliveryStatus('Initialising carrier security check...');
          const verifier = initRecaptchaVerifier('recaptcha-container');
          if (!verifier) {
            throw new Error('Unable to initialize reCAPTCHA verifier. Please check network connection.');
          }

          setDeliveryStatus(`Contacting telecom network to dispatch real SMS to ${fullPhone}...`);
          const result = await sendRealSmsOtp(fullPhone, verifier);
          setConfirmationResult(result);
          setDeliveryStatus(`✓ Real SMS sent to ${fullPhone}`);
          setStep('otp');
          setTimer(60);
          setCanResend(false);
          setOtp(['', '', '', '', '', '']);
          setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
        } catch (err: any) {
          console.error('Firebase Real SMS dispatch error:', err);
          let friendlyMsg = err.message || 'Failed to send real SMS.';
          if (err.code === 'auth/invalid-phone-number') {
            friendlyMsg = 'The phone number format is invalid. Please check the country code and number.';
          } else if (err.code === 'auth/quota-exceeded') {
            friendlyMsg = 'SMS quota temporarily exceeded for this project. Please configure a billing tier or add test numbers in Firebase Console.';
          } else if (err.code === 'auth/too-many-requests') {
            friendlyMsg = 'Too many requests sent from this device. Please wait a few minutes before trying again.';
          }
          setErrorMsg(friendlyMsg);
        } finally {
          setIsSending(false);
        }
      } else {
        // Firebase is not yet configured in .env
        setIsSending(false);
        setShowSetupGuide(true);
        setErrorMsg('Real telecom SMS dispatch requires your Google Firebase project credentials in .env.');
      }
    } else {
      // Email Verification flow
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        setErrorMsg('Please enter a valid email address');
        return;
      }

      setIsSending(true);
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setEmailOtpCode(generatedCode);

      try {
        setDeliveryStatus(`Dispatching real verification email to ${email.trim()}...`);
        const res = await sendRealEmailOtp(email.trim(), generatedCode);
        if (res.method === 'emailjs') {
          setDeliveryStatus(`✓ Real 6-digit OTP dispatched to your inbox: ${email.trim()}`);
        } else {
          setDeliveryStatus(`✓ Real verification link dispatched to ${email.trim()}`);
        }
        setStep('otp');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
      } catch (err: any) {
        console.error('Real Email dispatch error:', err);
        if (!isEmailJsConfigured() && !isFirebaseConfigured()) {
          setShowSetupGuide(true);
          setErrorMsg('Real email delivery requires Firebase or EmailJS credentials in .env.');
        } else {
          setErrorMsg(err.message || 'Failed to dispatch email.');
        }
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto move to next input if filled
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code');
      return;
    }

    setIsVerifying(true);

    try {
      if (method === 'mobile') {
        if (confirmationResult) {
          // Verify code directly with Google's Firebase Authentication
          const userCred = await verifyRealSmsOtp(confirmationResult, enteredOtp);
          const verifiedPhone = userCred.user.phoneNumber || `${countryCode} ${phone}`;
          const user: UserProfile = {
            name: name.trim() || `Investor ${phone.slice(-4)}`,
            phone: verifiedPhone,
            countryCode,
            authMethod: 'mobile',
            verified: true,
            tier: 'Institutional Pro Member',
            joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          };

          localStorage.setItem('invest_ai_user', JSON.stringify(user));
          onLoginSuccess(user);
          onClose();
        } else {
          throw new Error('No active SMS confirmation session. Please request a new code.');
        }
      } else {
        // Verify Email OTP
        if (enteredOtp === emailOtpCode) {
          const user: UserProfile = {
            name: name.trim() || email.split('@')[0],
            email: email.trim(),
            authMethod: 'email',
            verified: true,
            tier: 'Institutional Pro Member',
            joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          };

          localStorage.setItem('invest_ai_user', JSON.stringify(user));
          onLoginSuccess(user);
          onClose();
        } else {
          setErrorMsg('The verification code you entered is incorrect. Please check your inbox or resend.');
        }
      }
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      let friendly = err.message || 'Invalid verification code.';
      if (err.code === 'auth/invalid-verification-code') {
        friendly = 'The 6-digit SMS code you entered is incorrect. Please double check the SMS on your phone.';
      } else if (err.code === 'auth/code-expired') {
        friendly = 'The SMS verification code has expired. Please click Resend Code.';
      }
      setErrorMsg(friendly);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    setErrorMsg('');
    setStep('input');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      {/* Hidden reCAPTCHA container required by Google for Phone Auth */}
      <div id="recaptcha-container"></div>

      <div className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-stone-900">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F4EFE6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-wide flex items-center gap-2">
                <span>{authMode === 'signup' ? 'Create Pro Account' : 'Sign In to Terminal'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                  LIVE OTP
                </span>
              </h3>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Real SMS Telecom & Official Email Verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sign In vs Sign Up Tabs */}
        {step === 'input' && (
          <div className="grid grid-cols-2 p-1.5 bg-[#EAE4D7] border-b border-[#DDD6C8] text-xs font-semibold">
            <button
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); setShowSetupGuide(false); }}
              className={`py-2 rounded-lg transition ${
                authMode === 'signup' 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => { setAuthMode('signin'); setErrorMsg(''); setShowSetupGuide(false); }}
              className={`py-2 rounded-lg transition ${
                authMode === 'signin' 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-[#FAF7F2]">
          {step === 'input' ? (
            <>
              {/* Method Selector: Mobile vs Email */}
              <div className="flex items-center gap-2 bg-[#EFE9DE] p-1 rounded-xl border border-[#DDD6C8]">
                <button
                  type="button"
                  onClick={() => { setMethod('mobile'); setErrorMsg(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                    method === 'mobile'
                      ? 'bg-white text-emerald-800 shadow-xs border border-stone-200'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Real Mobile SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('email'); setErrorMsg(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                    method === 'email'
                      ? 'bg-white text-emerald-800 shadow-xs border border-stone-200'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Real Email OTP</span>
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-stone-700 font-medium mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ashish Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition shadow-2xs"
                      required
                    />
                  </div>
                )}

                {method === 'mobile' ? (
                  <div>
                    <label className="block text-stone-700 font-medium mb-1.5">Mobile Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-white border border-[#DDD5C7] rounded-xl px-2.5 py-2.5 text-stone-900 text-xs font-mono focus:outline-none focus:border-emerald-600 shadow-2xs"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} className="bg-white text-stone-900">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 bg-white border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-stone-900 font-mono placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition shadow-2xs"
                        required
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      A real 6-digit SMS verification code will be dispatched to this physical phone.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-stone-700 font-medium mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@company.com or personal@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 transition shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      A real 6-digit verification code will be dispatched directly to your inbox.
                    </span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* Firebase / Provider Setup Assistant Card */}
                {showSetupGuide && (
                  <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <Key className="w-4 h-4 text-amber-700" />
                      <span>How to Enable Real SMS on Your Phone (2 mins)</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px] text-amber-800 leading-normal">
                      <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-2.5 h-2.5" /></a> and create a free project.</li>
                      <li>Click <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong> &rarr; Enable <strong>Phone</strong> and <strong>Email</strong>.</li>
                      <li>In Project Settings (gear icon), add a Web App (&lt;/&gt;) and paste the keys into your project's <strong><code>.env</code></strong> file.</li>
                    </ol>
                    <div className="text-[10px] text-amber-800 bg-amber-100/70 p-2 rounded border border-amber-200">
                      <strong>Tip:</strong> In Firebase Console &rarr; Phone Auth, you can also add test phone numbers (e.g. <code>+91 9999999999</code> with code <code>123456</code>) for testing without consuming telecom quota.
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting to Telecom Network...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Real Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Step 2: 6-Digit OTP Verification Screen */
            <div className="space-y-5 text-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-stone-900">Enter Verification Code</h4>
                <p className="text-xs text-stone-600 mt-1">
                  Sent to <strong className="text-emerald-800 font-mono">
                    {method === 'mobile' ? `${countryCode} ${phone}` : email}
                  </strong>
                </p>
                {deliveryStatus && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    {deliveryStatus}
                  </p>
                )}
                <button
                  onClick={() => { setStep('input'); setErrorMsg(''); }}
                  className="text-[11px] text-emerald-700 hover:underline mt-1 inline-block font-medium"
                >
                  Change {method === 'mobile' ? 'number' : 'email'}
                </button>
              </div>

              {/* 6 OTP Inputs */}
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center bg-white border border-[#DDD5C7] focus:border-emerald-600 rounded-xl text-lg font-bold font-mono text-stone-900 focus:outline-none transition shadow-2xs"
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isVerifying}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying with Telecom Gateway...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              {/* Resend Timer */}
              <div className="text-xs text-stone-500 flex items-center justify-center gap-2">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold underline"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span>Resend code in <strong className="text-stone-800 font-mono">{timer}s</strong></span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F4EFE6] border-t border-[#E8E2D5] text-[11px] text-stone-500 text-center">
          Telecom Grade Delivery • 256-bit AES Encryption • Zero Spam
        </div>
      </div>
    </div>
  );
};
