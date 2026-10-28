import React from 'react';

/**
 * QuestionNavigator Component (Lab 2 React Component)
 * Renders the question number map sidebar allowing random-access question navigation.
 *
 * Props:
 * - questions: Array of question objects
 * - currentIdx: Index of currently active question
 * - selectedAnswers: Object tracking selected option per question index { [qIdx]: optIdx }
 * - flaggedQuestions: Array of question indices marked for review
 *
 * Callbacks:
 * - onSelectQuestion: Function(idx) called when user clicks a specific question number
 */
export default function QuestionNavigator({
  questions = [],
  currentIdx = 0,
  selectedAnswers = {},
  flaggedQuestions = [],
  onSelectQuestion,
}) {
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <aside className="md:col-span-3 bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Question Map</h3>
        <span className="text-[11px] text-slate-500 font-semibold">
          {answeredCount}/{questions.length} done
        </span>
      </div>

      <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = currentIdx === idx;
          const isAnswered = selectedAnswers[idx] !== undefined;
          const isFlagged = flaggedQuestions.includes(idx);

          let btnClass =
            'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
          if (isCurrent) {
            btnClass =
              'bg-[#0056D2] text-white ring-2 ring-[#0056D2] ring-offset-2 font-bold shadow-sm';
          } else if (isAnswered) {
            btnClass =
              'bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-2xs';
          }

          return (
            <button
              key={q.id || idx}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold relative transition-all ${btnClass}`}
              aria-label={`Go to question ${idx + 1}`}
            >
              {idx + 1}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"></span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-5 mt-5 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#0056D2]"></span>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300"></span>
          <span>Pending</span>
        </div>
      </div>
    </aside>
  );
}
