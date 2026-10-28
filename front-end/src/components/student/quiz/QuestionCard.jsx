import React from 'react';
import { Clock, Flag, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * QuestionCard Component (Lab 2 React Component)
 * Displays the current question prompt, interactive answer choices, timer status,
 * flag-for-review toggle, and previous/next navigation buttons.
 *
 * Props:
 * - question: Current question object
 * - currentIdx: Current zero-based index
 * - totalQuestions: Total question count
 * - selectedOption: Current selected option index for this question (or undefined)
 * - isFlagged: Boolean whether question is flagged for review
 * - timeLeftFormatted: Formatted countdown string (e.g. "24:50")
 * - progressPercent: Calculated progress percentage (0-100)
 *
 * Callbacks:
 * - onSelectOption: Function(optIdx)
 * - onToggleFlag: Function()
 * - onClearSelection: Function()
 * - onPrev: Function()
 * - onNext: Function()
 * - onSubmitClick: Function()
 */
export default function QuestionCard({
  question,
  currentIdx = 0,
  totalQuestions = 1,
  selectedOption,
  isFlagged = false,
  timeLeftFormatted = '25:00',
  progressPercent = 0,
  onSelectOption,
  onToggleFlag,
  onClearSelection,
  onPrev,
  onNext,
  onSubmitClick,
}) {
  if (!question) return null;

  const questionTitle =
    question.question || question.questionText || question.title || '';

  const options = Array.isArray(question.options)
    ? question.options.map((opt) =>
        typeof opt === 'object' && opt !== null
          ? opt.text || opt.title || ''
          : opt,
      )
    : [];

  return (
    <div className="md:col-span-9 flex flex-col space-y-4">
      {/* Top Bar: Progress & Monospace Timer */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Progress
          </span>
          <h2 className="text-sm font-bold text-slate-900">
            Question {currentIdx + 1} of {totalQuestions}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleFlag}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isFlagged
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full text-slate-800 font-mono font-bold text-xs shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <Clock className="w-3.5 h-3.5 text-coursera" />
            <span>{timeLeftFormatted}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0056D2] rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between min-h-[420px]">
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-900 mb-6 leading-relaxed">
            {questionTitle}
          </h2>

          {/* Options list */}
          <div className="space-y-3">
            {options.map((opt, optIdx) => {
              const isSelected =
                selectedOption !== undefined && selectedOption === optIdx;

              return (
                <div
                  key={optIdx}
                  onClick={() => onSelectOption(optIdx)}
                  className={`p-4 rounded-xl border text-xs md:text-sm font-medium flex items-start gap-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#0056D2] bg-blue-50/70 text-slate-900 shadow-sm ring-1 ring-[#0056D2] font-semibold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700 bg-white'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'border-[#0056D2] bg-[#0056D2] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected ? (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    ) : null}
                  </div>
                  <span className="leading-relaxed">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-6 mt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
          >
            Clear Selection
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={onPrev}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentIdx < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={onNext}
                className="px-6 py-2.5 rounded-lg bg-[#0056D2] hover:bg-[#00419E] text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmitClick}
                className="px-6 py-2.5 rounded-lg bg-secondary hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Review & Submit</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
