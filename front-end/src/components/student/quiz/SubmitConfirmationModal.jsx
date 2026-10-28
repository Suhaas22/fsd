import React from 'react';

/**
 * SubmitConfirmationModal Component (Lab 2 React Component)
 * Modal dialogue to confirm submission of the graded assessment.
 *
 * Props:
 * - isOpen: Boolean controlling modal visibility
 * - answeredCount: Number of questions answered so far
 * - totalQuestions: Total question count
 *
 * Callbacks:
 * - onClose: Function called to dismiss the modal without submitting
 * - onConfirmSubmit: Function called to confirm and submit
 */
export default function SubmitConfirmationModal({
  isOpen = false,
  answeredCount = 0,
  totalQuestions = 0,
  onClose,
  onConfirmSubmit,
}) {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Submit Assessment?
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          You have answered{' '}
          <strong className="text-slate-900 font-bold">
            {answeredCount} of {totalQuestions}
          </strong>{' '}
          questions.
          {unansweredCount > 0 && (
            <span className="block text-amber-900 font-semibold mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              ⚠️ You still have {unansweredCount} unanswered questions.
            </span>
          )}
        </p>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
          >
            Continue Quiz
          </button>
          <button
            type="button"
            onClick={onConfirmSubmit}
            className="px-5 py-2 rounded-xl bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold shadow-xs"
          >
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
