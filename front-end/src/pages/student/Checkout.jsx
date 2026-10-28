import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { CreditCard, Lock, ChevronRight, Smartphone } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import { useStudent } from '../../context/StudentContext';

const UPI_PATTERN = /^[\w.-]{2,}@[a-zA-Z]{2,}$/;

function luhnValid(digits) {
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function expiryValid(value) {
  const clean = String(value || '').trim();
  const m = /^(\d{2})\/(\d{2}|\d{4})$/.exec(clean);
  if (!m) return false;
  const month = Number(m[1]);
  if (month < 1 || month > 12) return false;
  let year = Number(m[2]);
  if (year < 100) year += 2000;
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  if (year < curYear) return false;
  if (year === curYear && month < curMonth) return false;
  return true;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const { addToast } = useToast();
  const { enrollments, refreshData } = useStudent();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    api.student
      .getCatalogCourse(courseId)
      .then(setCourse)
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    document.title = 'Checkout | Acadex';
  }, []);

  if (course && Number(course.price) === 0)
    return (
      <Navigate
        to={`/student/course/${courseId}`}
        replace
      />
    );
  if (!courseId)
    return (
      <Navigate
        to="/student/explore"
        replace
      />
    );
  if (!paidSuccess && enrollments.some((e) => e.courseId === courseId)) {
    return (
      <Navigate
        to={`/student/learn/${courseId}`}
        replace
      />
    );
  }

  const setCardField = (field, value) => {
    setCard((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (method === 'card') {
      const digits = card.number.replace(/\D/g, '');
      if (card.name.trim().length < 2) e.name = 'Enter the name on the card';
      if (!/^\d{13,19}$/.test(digits) || !luhnValid(digits))
        e.number = 'Enter a valid card number';
      if (!expiryValid(card.expiry))
        e.expiry = 'Enter a valid future expiry (MM/YY)';
      if (!/^\d{3,4}$/.test(card.cvv.replace(/\D/g, '')))
        e.cvv = 'Enter the 3 or 4 digit CVV';
    } else if (!UPI_PATTERN.test(upiId.trim())) {
      e.upiId = 'Enter a valid UPI ID, e.g. name@okaxis';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setProcessing(true);
    try {
      const cleanDigits = card.number.replace(/\D/g, '');
      const payload =
        method === 'card'
          ? {
              courseId,
              paymentMethod: 'card',
              cardLast4: cleanDigits.slice(-4),
            }
          : { courseId, paymentMethod: 'upi', upiId: upiId.trim() };
      const result = await api.student.checkout(payload);
      setPaidSuccess(true);
      await refreshData();
      window.dispatchEvent(new Event('learning-data-changed'));
      if (!result.transactionId) {
        navigate(`/student/learn/${courseId}`, { replace: true });
        return;
      }
      navigate(
        `/student/payment-success?transactionId=${result.transactionId}&courseId=${courseId}`,
        {
          state: result,
          replace: true,
        },
      );
    } catch (err) {
      addToast(err.message || 'Payment failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const inputClass = (field) =>
    `w-full h-10 px-3 border rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#0056D2] ${
      errors[field] ? 'border-rose-400' : 'border-slate-200'
    }`;

  return (
    <PageLayout>
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 space-y-6">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link
            to="/student/explore"
            className="hover:text-[#0056D2]"
          >
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {course && (
            <>
              <Link
                to={`/student/course/${course.id}`}
                className="hover:text-[#0056D2] truncate max-w-[200px]"
              >
                {course.title}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-slate-900 font-semibold">Checkout</span>
        </nav>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent" />
          </div>
        ) : !course ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
            <p className="text-sm font-bold text-slate-800">
              This course is not available for purchase.
            </p>
            <Link
              to="/student/explore"
              className="mt-3 inline-block text-xs font-bold text-[#0056D2] hover:underline"
            >
              Back to catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <section className="lg:col-span-2 space-y-4">
              <h1 className="text-xl font-extrabold text-slate-900">
                Order summary
              </h1>
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3">
                <div className="w-24 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 line-clamp-2">
                    {course.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.leadInstructorName || course.instructorName}
                  </p>
                  {course.organizationName && (
                    <p className="text-xs text-slate-400">
                      {course.organizationName}
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">
                  Total
                </span>
                <span className="text-xl font-extrabold text-[#0056D2]">
                  ₹{Number(course.price).toLocaleString('en-IN')}
                </span>
              </div>
            </section>

            <section className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-bold text-slate-900">
                Payment method
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: 'card',
                    label: 'Credit / Debit card',
                    icon: CreditCard,
                  },
                  { id: 'upi', label: 'UPI', icon: Smartphone },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMethod(m.id);
                      setErrors({});
                    }}
                    className={`py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      method === m.id
                        ? 'bg-[#0056D2] border-[#0056D2] text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <m.icon className="w-4 h-4" /> {m.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={handlePay}
                className="space-y-4"
                noValidate
              >
                {method === 'card' ? (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Name on card
                      </label>
                      <input
                        value={card.name}
                        onChange={(e) => setCardField('name', e.target.value)}
                        autoComplete="cc-name"
                        className={inputClass('name')}
                      />
                      {errors.name && (
                        <p className="text-[11px] text-rose-600 mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Card number
                      </label>
                      <input
                        value={card.number}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        onChange={(e) => {
                          const d = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 19);
                          setCardField(
                            'number',
                            d.replace(/(.{4})/g, '$1 ').trim(),
                          );
                        }}
                        placeholder="4242 4242 4242 4242"
                        className={`${inputClass('number')} font-mono`}
                      />
                      {errors.number && (
                        <p className="text-[11px] text-rose-600 mt-1">
                          {errors.number}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Expiry
                        </label>
                        <input
                          value={card.expiry}
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          onChange={(e) => {
                            const d = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 4);
                            setCardField(
                              'expiry',
                              d.length > 2
                                ? `${d.slice(0, 2)}/${d.slice(2)}`
                                : d,
                            );
                          }}
                          placeholder="MM/YY"
                          className={`${inputClass('expiry')} font-mono`}
                        />
                        {errors.expiry && (
                          <p className="text-[11px] text-rose-600 mt-1">
                            {errors.expiry}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={card.cvv}
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          onChange={(e) =>
                            setCardField(
                              'cvv',
                              e.target.value.replace(/\D/g, '').slice(0, 4),
                            )
                          }
                          className={`${inputClass('cvv')} font-mono`}
                        />
                        {errors.cvv && (
                          <p className="text-[11px] text-rose-600 mt-1">
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      UPI ID
                    </label>
                    <input
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setErrors({});
                      }}
                      placeholder="yourname@okaxis"
                      className={inputClass('upiId')}
                    />
                    {errors.upiId && (
                      <p className="text-[11px] text-rose-600 mt-1">
                        {errors.upiId}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3 bg-[#0056D2] hover:bg-[#00419E] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {processing
                    ? 'Processing…'
                    : `Pay ₹${Number(course.price).toLocaleString('en-IN')}`}
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Only the last 4 digits of your card are stored.
                </p>
              </form>
            </section>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
