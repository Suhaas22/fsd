import React from 'react';

/**
 * QuizHeader Component (Lab 2 React Component)
 * Displays the assessment title, institution badge, passing criteria, and submit trigger.
 *
 * Props:
 * - quizData: Object containing title, description, institution, passingScore
 * - isSubmitted: Boolean indicating whether the assessment has already been submitted
 *
 * Callbacks:
 * - onSubmitClick: Function called when the student clicks "Submit Exam"
 */
export default function QuizHeader({ quizData, isSubmitted, onSubmitClick }) {
  if (!quizData) return null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2 py-0.5 rounded bg-blue-50 text-coursera text-xs font-bold border border-blue-100">
            {quizData.institution || 'Course assessment'}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-secondary text-xs font-bold border border-emerald-100">
            Pass Mark: {quizData.passingScore}%
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          {quizData.title}
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          {quizData.description}
        </p>
      </div>

      {!isSubmitted && (
        <button
          type="button"
          onClick={onSubmitClick}
          className="px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold shadow-sm transition-all shrink-0 active:scale-95"
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
}
