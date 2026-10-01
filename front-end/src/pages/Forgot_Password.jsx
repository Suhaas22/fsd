import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Send
} from 'lucide-react';
import { api } from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(45);

  // Password criteria evaluations
  const passwordCriteria = {
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword),
    hasLength: newPassword.length >= 6
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await api.auth.requestPasswordReset(email.trim());
      setLoading(false);
      setStep(2);
      setSuccessMsg(result.message || `A 6-digit recovery code has been dispatched to ${email}.`);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Unable to start password recovery. Please try again.');
    }
  };

  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError('');
    setStep(3);
    setSuccessMsg('Enter your new password to complete the reset.');
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (!passwordCriteria.hasLength || !passwordCriteria.hasUpper || !passwordCriteria.hasLower || !passwordCriteria.hasNumber || !passwordCriteria.hasSpecial) {
      setError('Password must contain 1 uppercase letter, small letters, 1 number, 1 special symbol, and at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.auth.resetPassword(email.trim(), otp.join(''), newPassword);
      setLoading(false);
      setStep(4);
      setSuccessMsg(result.message || 'Your password has been reset successfully!');
      setTimeout(() => {
        navigate('/signin', { state: { email } });
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Unable to reset your password. Please check the code and try again.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col justify-between font-sans">
      
      {/* Header */}
      <header className="border-b border-[#E5DDD2] bg-[#FAF7F2]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Edu<span className="text-blue-600">Sphere</span>
            </span>
          </Link>

          <Link
            to="/signin"
            className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex items-center justify-center">
        <div className="bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-10 shadow-lg shadow-stone-900/5 w-full">
          
          {/* Top Badge */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {step === 1 && 'Reset Your Password'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Create New Password'}
              {step === 4 && 'Password Reset Complete'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              {step === 1 && 'Enter your verified account email to receive a recovery code.'}
              {step === 2 && `We have dispatched a 6-digit code to ${email}.`}
              {step === 3 && 'Choose a strong new password meeting all complexity criteria.'}
              {step === 4 && 'You can now sign in with your updated credentials.'}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-blue-600'
                    : s < step
                    ? 'w-4 bg-emerald-500'
                    : 'w-4 bg-[#E5DDD2]'
                }`}
              />
            ))}
          </div>

          {/* Error & Success Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: EMAIL ENTRY */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@university.edu or name@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF7F2] border border-[#E5DDD2] rounded-xl text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-0.5">Account recovery</span>
                Enter the email address associated with your EduSphere account. In local development, use the reset code configured by your backend.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Recovery Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 text-center mb-3">
                  Enter 6-Digit Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessMsg('New security code sent!');
                    setOtp(['4', '8', '2', '9', '1', '0']);
                  }}
                  className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Code</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-11 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                {newPassword.length > 0 && (
                  <div className="mt-2.5 p-2.5 bg-[#FAF7F2] border border-[#E5DDD2] rounded-xl">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1.5 font-medium">
                      <span>Password format requirements:</span>
                      <span className={
                        /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword) && newPassword.length >= 6
                          ? 'text-emerald-700 font-bold'
                          : 'text-amber-700 font-semibold'
                      }>
                        {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword) && newPassword.length >= 6
                          ? 'All criteria met ✓'
                          : 'Standard format'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {/[A-Z]/.test(newPassword) ? '✓' : '•'} 1 Capital letter (A-Z)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${/[a-z]/.test(newPassword) ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {/[a-z]/.test(newPassword) ? '✓' : '•'} Small letters (a-z)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {/[0-9]/.test(newPassword) ? '✓' : '•'} 1 Number (0-9)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword) ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword) ? '✓' : '•'} 1 Special symbol (!@#$)
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${newPassword.length >= 6 ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-[#E0D7CB] text-slate-500'}`}>
                        {newPassword.length >= 6 ? '✓' : '•'} 6+ Chars
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-11 py-3 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password & Save</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Your Password Has Been Updated!</h3>
              <p className="text-xs text-slate-600">
                You will be automatically redirected to the Sign In portal in a moment...
              </p>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Bottom Link */}
          {step !== 4 && (
            <div className="mt-6 pt-6 border-t border-[#F2ECE4] text-center text-xs text-slate-500">
              Remember your password?{' '}
              <Link to="/signin" className="text-blue-700 hover:text-blue-800 font-bold">
                Sign in directly
              </Link>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5DDD2] bg-[#FAF7F2] py-6 text-center text-xs text-slate-500">
        <p>© 2026 EduSphere Global Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
