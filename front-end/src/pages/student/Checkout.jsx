import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  KeyRound
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import RatingStars from '../../components/common/RatingStars';
import { useToast } from '../../components/common/Toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'paypal' | 'wallet'
  const [couponCode, setCouponCode] = useState('WELCOME10');
  const [appliedCoupon, setAppliedCoupon] = useState({ code: 'WELCOME10', discount: 10.00 });
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Card PIN Verification Modal State (4-Digit Security PIN)
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState(['', '', '', '']);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const originalPrice = 99.99;
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

  // Detect card brand from first digit
  const getCardBrand = (num) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    return 'NexusPay Card';
  };

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
      addToast('Special Coupon NEXUS20 applied: $20.00 off!', 'success');
    } else if (cleanCode === 'DEV100') {
      setAppliedCoupon({ code: 'DEV100', discount: 99.99 });
      setCouponError('');
      addToast('VIP Access Coupon Applied: Free Enrollment!', 'success');
    } else {
      setAppliedCoupon(null);
      setCouponError('Invalid promo code. Try "WELCOME10" or "NEXUS20"');
      addToast('Invalid promo code entered', 'error');
    }
  };

  // Validate form fields before initiating verification
  const validateForm = () => {
    const errors = {};
    if (!formData.cardName.trim() || formData.cardName.trim().length < 3) {
      errors.cardName = 'Please enter full name as printed on card';
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

  const handleInitiatePayment = (e) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      if (!validateForm()) {
        addToast('Please correct the highlighted card details', 'error');
        return;
      }
      // Open Card PIN verification modal
      setShowPinModal(true);
      setPinCode(['', '', '', '']);
      setPinError('');
    } else {
      // Direct checkout for PayPal / Wallet
      setIsProcessing(true);
      setTimeout(() => {
        navigate('/payment-success', {
          state: {
            courseTitle: "Advanced Enterprise Architecture & Payment Systems",
            amount: `$${totalPrice.toFixed(2)}`,
            transactionId: `#NX-${Math.floor(10000 + Math.random() * 90000)}`,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          }
        });
      }, 1000);
    }
  };

  // PIN input handler
  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pinCode];
    newPin[index] = value.slice(-1);
    setPinCode(newPin);
    setPinError('');

    // Auto-focus next input
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
      setIsVerifyingPin(false);
      setShowPinModal(false);
      addToast('PIN Verified & Payment Authorized!', 'success');

      navigate('/payment-success', {
        state: {
          courseTitle: "Advanced Enterprise Architecture & Payment Systems",
          amount: `$${totalPrice.toFixed(2)}`,
          transactionId: `#NX-${Math.floor(10000 + Math.random() * 90000)}`,
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        }
      });
    }, 1100);
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb Nav */}
        <nav className="flex items-center gap-2 text-xs text-outline mb-6 font-medium">
          <Link to="/explore" className="hover:text-primary transition-colors">Browse Catalog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/course-details" className="hover:text-primary transition-colors">Course Details</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary font-semibold">Secure Checkout</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Review & Place Order
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Encrypted with TLS 1.3. Your payment details are tokenized and never stored in plain text.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Order Summary & Interactive Card Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Soft Muted Interactive Bank Card Widget */}
            {paymentMethod === 'card' && (
              <div className="w-full aspect-[1.586/1] rounded-3xl p-6 bg-gradient-to-tr from-slate-900 via-[#255ea6] to-[#3a75bb] text-white shadow-elevation-2 relative overflow-hidden flex flex-col justify-between select-none">
                <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-extrabold text-sm">
                      N
                    </div>
                    <span className="font-bold text-xs tracking-wider uppercase text-white/90">
                      {getCardBrand(formData.cardNumber)}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-mono tracking-widest backdrop-blur-md">
                    DEBIT / GOLD
                  </span>
                </div>

                <div className="relative z-10 my-2">
                  <div className="text-[10px] uppercase text-white/60 tracking-widest font-semibold mb-1">Card Number</div>
                  <div className="font-mono text-lg md:text-xl tracking-widest font-bold drop-shadow">
                    {formData.cardNumber || '•••• •••• •••• ••••'}
                  </div>
                </div>

                <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/15">
                  <div>
                    <span className="text-[9px] uppercase text-white/60 block font-semibold">Cardholder Name</span>
                    <span className="text-xs font-bold tracking-wide uppercase">{formData.cardName || 'YOUR NAME'}</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase text-white/60 block font-semibold text-right">Expires</span>
                    <span className="text-xs font-mono font-bold">{formData.expDate || 'MM/YY'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary Box */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-6">
              <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
                Order Summary (1 Item)
              </h2>

              {/* Course Item */}
              <div className="flex gap-4">
                <div className="w-24 h-20 rounded-2xl overflow-hidden bg-surface-container flex-shrink-0 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&auto=format&fit=crop&q=80"
                    alt="Course Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Stanford Online / NexusTech
                  </span>
                  <h3 className="text-xs font-bold text-on-surface line-clamp-2 mt-0.5 leading-snug">
                    Advanced Machine Learning Algorithms Masterclass
                  </h3>
                  <p className="text-[11px] text-outline mt-0.5">Dr. Eleanor Rigby</p>
                  <div className="mt-1">
                    <RatingStars rating={4.9} reviewsCount={1245} size="sm" />
                  </div>
                </div>
              </div>

              {/* Coupon input */}
              <div className="pt-4 border-t border-outline-variant/60">
                <label className="text-xs font-bold text-on-surface block mb-2">
                  Have a Promo / Referral Code?
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. WELCOME10, NEXUS20"
                      className="w-full pl-9 pr-3 py-2 text-xs uppercase font-semibold bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-on-surface rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon && (
                  <p className="text-xs text-secondary font-semibold flex items-center gap-1 mt-2">
                    <Check className="w-3.5 h-3.5" /> Coupon <strong>{appliedCoupon.code}</strong> applied (-${appliedCoupon.discount.toFixed(2)})
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-error font-medium flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-outline-variant/60 space-y-2.5 text-xs text-on-surface">
                <div className="flex justify-between">
                  <span className="text-outline">Standard Course Price</span>
                  <span className="font-medium">${originalPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-secondary font-bold">
                    <span>Discount Applied ({appliedCoupon.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-outline">Taxes & Gateway Surcharge</span>
                  <span className="font-semibold text-emerald-700">$0.00 (Waived)</span>
                </div>
                <div className="pt-3 border-t border-outline-variant flex justify-between items-baseline text-base font-bold text-on-surface">
                  <span>Total Amount Due</span>
                  <span className="text-2xl text-primary font-black">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Money Back Guarantee Banner */}
              <div className="p-4 rounded-2xl bg-secondary-fixed/20 border border-secondary/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-on-secondary-fixed-variant leading-relaxed">
                  <strong className="font-bold">30-Day 100% Satisfaction Guarantee.</strong> Try the full course risk-free. Instant refund guarantee if it doesn't meet your expectations.
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Payment Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1">
              
              <h2 className="text-base font-bold text-on-surface mb-6">
                Choose Payment Method
              </h2>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/40'
                      : 'border-outline-variant hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Credit / Debit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/40'
                      : 'border-outline-variant hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="font-bold italic text-base">P</span>
                  <span>PayPal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/40'
                      : 'border-outline-variant hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-secondary" />
                  <span>Checkout</span>
                </button>
              </div>

              {/* Card Form */}
              <form onSubmit={handleInitiatePayment} className="space-y-4">
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-on-surface">
                      Name on Card
                    </label>
                    {formErrors.cardName && (
                      <span className="text-[11px] text-error font-medium">{formErrors.cardName}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Chen"
                    value={formData.cardName}
                    onChange={(e) => {
                      setFormData({ ...formData, cardName: e.target.value });
                      if (formErrors.cardName) setFormErrors({ ...formErrors, cardName: '' });
                    }}
                    className={`w-full px-4 py-3 text-xs bg-surface-container-low border rounded-xl focus:outline-none font-medium text-on-surface ${
                      formErrors.cardName ? 'border-error focus:border-error ring-1 ring-error/20' : 'border-outline-variant focus:border-primary'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-on-surface">
                      Card Number
                    </label>
                    {formErrors.cardNumber && (
                      <span className="text-[11px] text-error font-medium">{formErrors.cardNumber}</span>
                    )}
                  </div>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input
                      type="text"
                      required
                      placeholder="4242 •••• •••• 4242"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      className={`w-full pl-10 pr-4 py-3 text-xs bg-surface-container-low border rounded-xl focus:outline-none font-mono text-on-surface ${
                        formErrors.cardNumber ? 'border-error focus:border-error ring-1 ring-error/20' : 'border-outline-variant focus:border-primary'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-on-surface">
                        Expiry Date
                      </label>
                      {formErrors.expDate && (
                        <span className="text-[10px] text-error font-medium">{formErrors.expDate}</span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.expDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full px-4 py-3 text-xs bg-surface-container-low border rounded-xl focus:outline-none font-mono text-on-surface ${
                        formErrors.expDate ? 'border-error focus:border-error ring-1 ring-error/20' : 'border-outline-variant focus:border-primary'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-on-surface">
                        Security Code (CVV)
                      </label>
                      {formErrors.cvv && (
                        <span className="text-[10px] text-error font-medium">{formErrors.cvv}</span>
                      )}
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={formData.cvv}
                      onChange={(e) => {
                        setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') });
                        if (formErrors.cvv) setFormErrors({ ...formErrors, cvv: '' });
                      }}
                      placeholder="•••"
                      className={`w-full px-4 py-3 text-xs bg-surface-container-low border rounded-xl focus:outline-none font-mono text-on-surface ${
                        formErrors.cvv ? 'border-error focus:border-error ring-1 ring-error/20' : 'border-outline-variant focus:border-primary'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">
                      Billing Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
                    >
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Germany</option>
                      <option>India</option>
                      <option>Singapore</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-3 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveCard"
                    checked={formData.saveCard}
                    onChange={(e) => setFormData({ ...formData, saveCard: e.target.checked })}
                    className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="saveCard" className="text-xs text-on-surface cursor-pointer select-none font-medium">
                    Save this card securely in vault for future 1-click enrollments
                  </label>
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-elevation-2 flex items-center justify-center gap-2 transition-all disabled:opacity-75 hover:scale-[1.01]"
                  >
                    {isProcessing ? (
                      <span className="inline-flex items-center gap-2.5">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Connecting to Bank Gateway...</span>
                      </span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Verify PIN & Pay ${totalPrice.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-outline pt-2 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-secondary" />
                  <span>Encrypted with Card Security PIN Authentication. PCI-DSS Level 1.</span>
                </p>

              </form>

            </div>

          </div>

        </div>

      </div>

      {/* Card PIN Verification Modal (4-Digit Security PIN) */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setShowPinModal(false)}
          />

          <div className="relative w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-2xl p-6 md:p-8 z-10 animate-in zoom-in-95 duration-200">
            
            {/* Close modal button */}
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/60 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">Card PIN Verification</h3>
                <p className="text-[11px] text-outline">Authorize payment transaction</p>
              </div>
            </div>

            {/* Transaction metadata */}
            <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/60 mb-5 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-outline">Merchant:</span>
                <span className="font-bold text-on-surface">NexusPay Enterprise Academy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Card:</span>
                <span className="font-mono font-semibold text-on-surface">{formData.cardNumber.slice(-9) || '•••• 4242'}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-outline-variant/40">
                <span className="text-outline font-medium">Amount:</span>
                <span className="text-base font-extrabold text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Instruction */}
            <div className="text-center mb-4">
              <p className="text-xs text-on-surface-variant font-medium">
                Enter your 4-digit security PIN to authorize this purchase
              </p>
            </div>

            {/* 4-Digit PIN Boxes (Masked password style) */}
            <form onSubmit={handleVerifyPinAndPay} className="space-y-4">
              <div className="flex justify-center gap-3">
                {pinCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`pin-input-${index}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold font-mono bg-surface-container-low border border-outline-variant rounded-2xl focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 text-on-surface transition-all"
                  />
                ))}
              </div>

              {pinError && (
                <p className="text-xs text-error font-medium text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {pinError}
                </p>
              )}

              {/* Submit / Authorize Button */}
              <button
                type="submit"
                disabled={isVerifyingPin}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-elevation-1 flex items-center justify-center gap-2 transition-all disabled:opacity-75"
              >
                {isVerifyingPin ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying Security PIN...</span>
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Payment</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="w-full py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </form>

          </div>
        </div>
      )}

    </PageLayout>
  );
}
