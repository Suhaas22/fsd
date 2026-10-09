import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  Check, 
  Tag, 
  ChevronRight, 
  Wallet, 
  AlertCircle,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  KeyRound,
  Shield,
  Star
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const course = location.state?.course;
  const courseTitle = course?.title || 'Advanced Machine Learning & Distributed Systems Architecture';
  const courseThumbnail = course?.thumbnail || 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop&q=80';
  const courseProvider = course?.institution || course?.organizationName || 'Stanford University';
  const courseInstructor = course?.instructorName || course?.instructors?.[0]?.name || 'Dr. Eleanor Rigby, Stanford University';

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'paypal'
  const [couponCode, setCouponCode] = useState('WELCOME10');
  const [appliedCoupon, setAppliedCoupon] = useState({ code: 'WELCOME10', discount: 10.00 });
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 4-Digit Security PIN Verification Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState(['', '', '', '']);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const originalPrice = Number(course?.price) || 99.99;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0.00;
  const totalPrice = Math.max(0, originalPrice - discountAmount);

  const [formData, setFormData] = useState({
    cardName: 'Alex Chen',
    cardNumber: '4242 8849 2014 4242',
    expDate: '12/28',
    cvv: '884',
    saveCard: true,
    country: 'United States',
    zipCode: '94107'
  });

  const [formErrors, setFormErrors] = useState({});

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
    if (formErrors.cardNumber) {
      setFormErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setFormData(prev => ({ ...prev, expDate: val }));
    if (formErrors.expDate) {
      setFormErrors(prev => ({ ...prev, expDate: '' }));
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'WELCOME10') {
      setAppliedCoupon({ code: 'WELCOME10', discount: 10.00 });
      setCouponError('');
      addToast('Coupon WELCOME10 applied: $10.00 off!', 'success');
    } else if (cleanCode === 'NEXUS20') {
      setAppliedCoupon({ code: 'NEXUS20', discount: 20.00 });
      setCouponError('');
      addToast('Coupon NEXUS20 applied: $20.00 off!', 'success');
    } else if (cleanCode === 'FREE100' || cleanCode === 'DEV100') {
      setAppliedCoupon({ code: 'DEV100', discount: 99.99 });
      setCouponError('');
      addToast('Full Scholarship Coupon Applied: $0.00 Total!', 'success');
    } else {
      setAppliedCoupon(null);
      setCouponError('Invalid promo code. Try "WELCOME10" or "NEXUS20"');
      addToast('Invalid promo code entered', 'error');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.cardName.trim() || formData.cardName.trim().length < 3) {
      errors.cardName = 'Please enter name as printed on card';
    }
    const cleanNum = formData.cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 15) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    if (!formData.expDate || !formData.expDate.includes('/') || formData.expDate.length < 5) {
      errors.expDate = 'Valid MM/YY required';
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      errors.cvv = '3-digit CVV required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const completeCheckout = async () => {
    setIsProcessing(true);
    const targetCourseId = course?.id || 'crs-1';

    try {
      const result = await api.student.checkout(targetCourseId, paymentMethod, totalPrice, 'lrn-1');
      navigate('/student/payment-success', {
        state: {
          courseTitle: result?.courseTitle || courseTitle,
          amount: `$${Number(result?.amount || totalPrice).toFixed(2)}`,
          transactionId: result?.transactionId || `#NX-${Math.floor(10000 + Math.random() * 90000)}`,
          date: result?.date || 'October 2026',
          courseId: targetCourseId,
        },
      });
    } catch (err) {
      addToast(`Unable to complete checkout: ${err.message || 'Server error'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiatePayment = (e) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      if (!validateForm()) {
        addToast('Please correct the highlighted card details', 'error');
        return;
      }
      setShowPinModal(true);
      setPinCode(['', '', '', '']);
      setPinError('');
    } else {
      completeCheckout();
    }
  };

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pinCode];
    newPin[index] = value.slice(-1);
    setPinCode(newPin);
    setPinError('');

    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinCode[index] && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyPinAndPay = (e) => {
    e.preventDefault();
    const fullPin = pinCode.join('');
    if (fullPin.length < 4) {
      setPinError('Please enter your complete 4-digit card PIN.');
      return;
    }

    setIsVerifyingPin(true);
    addToast('Authenticating card security PIN...', 'info');

    setTimeout(() => {
      setShowPinModal(false);
      addToast('PIN Verified & Payment Authorized!', 'success');
      completeCheckout().finally(() => setIsVerifyingPin(false));
    }, 1000);
  };

  return (
    <PageLayout>
      <div className="bg-[#F8FAFC] min-h-screen py-8">
        <div className="max-w-[1050px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumb (Stitch Spec) */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/student/explore" className="hover:text-coursera transition-colors">Courses</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/student/explore" className="hover:text-coursera transition-colors">Cart</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-semibold">Checkout</span>
          </nav>

          {/* 2-Column Stitch Layout (55% / 45%) */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Column: Order Summary (55%) */}
            <div className="w-full lg:w-[55%] space-y-6">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                Order Summary
              </h1>

              {/* Course Horizontal Card (Stitch Spec) */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow">
                <div className="w-28 h-24 bg-slate-100 rounded-lg shrink-0 overflow-hidden relative">
                  <img 
                    src={courseThumbnail} 
                    alt={courseTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between flex-grow min-w-0">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {courseTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{courseInstructor}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                      4.9
                    </span>
                    <span className="text-slate-400 font-normal">(1,245 reviews)</span>
                  </div>
                </div>
                <div className="text-right text-sm font-bold text-slate-900 shrink-0">
                  ${originalPrice.toFixed(2)}
                </div>
              </div>

              {/* Promo Code Input (Stitch Spec) */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input 
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter promo code (e.g. WELCOME10)"
                  className="flex-grow h-10 border border-slate-200/80 rounded-lg px-3.5 text-xs font-semibold uppercase bg-white focus:outline-none focus:border-coursera text-slate-900"
                />
                <button 
                  type="submit"
                  className="h-10 px-5 bg-white border border-coursera text-coursera font-bold text-xs rounded-lg hover:bg-coursera hover:text-white transition-colors"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <p className="text-xs text-secondary font-semibold flex items-center gap-1 -mt-3">
                  <Check className="w-3.5 h-3.5" /> Coupon <strong>{appliedCoupon.code}</strong> applied (-${appliedCoupon.discount.toFixed(2)})
                </p>
              )}
              {couponError && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1 -mt-3">
                  <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                </p>
              )}

              {/* Price Breakdown Card (Stitch Spec) */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Original Price</span>
                  <span className="font-semibold text-slate-900">${originalPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-secondary font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100 w-full my-1"></div>
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-xl text-coursera font-extrabold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* 30-Day Guarantee Banner (Stitch Spec) */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
                <span className="font-medium">30-day money-back guarantee. Secure your academic credential risk-free.</span>
              </div>
            </div>

            {/* Right Column: Payment Details (45%) */}
            <div className="w-full lg:w-[45%]">
              <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sticky top-24 space-y-4">
                <h2 className="text-lg font-bold text-slate-900 mb-2">Payment Details</h2>

                {/* Card vs PayPal selector (Stitch Spec) */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-coursera bg-blue-50/60 text-coursera ring-1 ring-coursera'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex-1 py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                      paymentMethod === 'paypal'
                        ? 'border-coursera bg-blue-50/60 text-coursera ring-1 ring-coursera'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>PayPal</span>
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleInitiatePayment} className="space-y-3.5 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Name on Card
                    </label>
                    <input 
                      type="text"
                      required
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      placeholder="Alex Chen"
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-coursera"
                    />
                    {formErrors.cardName && <span className="text-[10px] text-rose-600">{formErrors.cardName}</span>}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        required
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 8849 2014 4242"
                        className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-coursera"
                      />
                    </div>
                    {formErrors.cardNumber && <span className="text-[10px] text-rose-600">{formErrors.cardNumber}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input 
                        type="text"
                        required
                        value={formData.expDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-coursera"
                      />
                      {formErrors.expDate && <span className="text-[10px] text-rose-600">{formErrors.expDate}</span>}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        CVV
                      </label>
                      <input 
                        type="password"
                        required
                        maxLength={4}
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                        placeholder="884"
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-coursera"
                      />
                      {formErrors.cvv && <span className="text-[10px] text-rose-600">{formErrors.cvv}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Country
                      </label>
                      <select 
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full h-10 px-2.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-coursera"
                      >
                        <option>United States</option>
                        <option>India</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Postal Code
                      </label>
                      <input 
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="94107"
                        className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-coursera"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-2 py-3.5 bg-coursera hover:bg-primary text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ${totalPrice.toFixed(2)}</span>
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-tight">
                    By completing your purchase you agree to these Terms of Service.
                  </p>
                </form>

              </div>
            </div>

          </div>

        </div>

        {/* 4-Digit Security PIN Verification Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-coursera flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">Enter Card Security PIN</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Authorize payment of <strong>${totalPrice.toFixed(2)}</strong> for {courseTitle}
                </p>
              </div>

              <div className="flex justify-center gap-3 my-4">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    id={`pin-input-${idx}`}
                    type="password"
                    maxLength={1}
                    value={pinCode[idx]}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(idx, e)}
                    className="w-12 h-12 text-center text-lg font-bold border border-slate-300 rounded-xl focus:border-coursera focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                ))}
              </div>

              {pinError && <p className="text-xs text-rose-600 font-medium">{pinError}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isVerifyingPin}
                  onClick={handleVerifyPinAndPay}
                  className="flex-1 py-2.5 bg-coursera hover:bg-primary text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  {isVerifyingPin ? 'Verifying...' : 'Authorize'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
