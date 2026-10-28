import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { CircularProgress } from '../../common/ProgressBar';

/**
 * QuizResultSummary Component (Lab 2 React Component)
 * Displays the final grade assessment report with academic distinction status,
 * certificate navigation, retake callback, and question-by-question review with explanations.
 *
 * Props:
 * - score: Final percentage score (0-100)
 * - passingScore: Minimum passing score (defaults to 80)
 * - questionsList: Array of question objects
 * - selectedAnswers: Object tracking student answers
 * - targetCourseId: ID of current course
 *
 * Callbacks:
 * - onRetake: Function called when student opts to reset and retake
 */
export default function QuizResultSummary({
  score = 0,
  passingScore = 80,
  questionsList = [],
  selectedAnswers = {},
  targetCourseId,
  onRetake,
}) {
  const [showExplanations, setShowExplanations] = useState(false);
  const isPassed = score >= passingScore;

  const getCorrectAnswerIndex = (q) => {
    if (q.correctAnswer !== undefined) return q.correctAnswer;
    if (typeof q.correctOption === 'string') {
      const char = q.correctOption.toLowerCase();
      if (char >= 'a' && char <= 'd') return char.charCodeAt(0) - 97;
    }
    if (Array.isArray(q.options)) {
      const idx = q.options.findIndex(
        (opt) => typeof opt === 'object' && opt.isCorrect,
      );
      if (idx !== -1) return idx;
    }
    return 0;
  };

  const getQuestionOptions = (q) => {
    if (!q || !Array.isArray(q.options)) return [];
    return q.options.map((opt) =>
      typeof opt === 'object' && opt !== null
        ? opt.text || opt.title || ''
        : opt,
    );
  };

  const getQuestionText = (q) => {
    if (!q) return '';
    return q.question || q.questionText || q.title || '';
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-8 md:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-8 animate-in fade-in">
      <div className="flex flex-col items-center text-center space-y-4">
        <CircularProgress
          progress={score}
          size={120}
          strokeWidth={10}
          color={isPassed ? '#006D37' : '#DC2626'}
        />

        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isPassed
                ? 'bg-emerald-50 text-secondary border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {isPassed ? 'Passed' : `Did Not Pass (Requires ${passingScore}%)`}
          </span>

          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            You Scored {score}%
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            You answered {Math.round((score / 100) * questionsList.length)} of{' '}
            {questionsList.length} questions correctly. Your official grade has
            been saved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isPassed && (
            <Link
              to="/student/certificates"
              className="px-6 py-3 rounded-xl bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>View Certificate</span>
            </Link>
          )}
          <Link
            to={
              targetCourseId
                ? `/student/course-progress/${targetCourseId}`
                : '/student/my-learning'
            }
            state={{ courseId: targetCourseId }}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Return to Course Progress
          </Link>
          <button
            type="button"
            onClick={onRetake}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Assessment</span>
          </button>
          <button
            type="button"
            onClick={() => setShowExplanations(!showExplanations)}
            className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-coursera transition-colors"
          >
            {showExplanations
              ? 'Hide Explanations'
              : 'Review All Answers & Explanations'}
          </button>
        </div>
      </div>

      {/* Explanations section */}
      {showExplanations && (
        <div className="border-t border-slate-100 pt-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900">
            Question Review
          </h3>

          <div className="space-y-4">
            {questionsList.map((q, idx) => {
              const opts = getQuestionOptions(q);
              const correctIdx = getCorrectAnswerIndex(q);
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === correctIdx;

              return (
                <div
                  key={q.id || idx}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-xs md:text-sm font-bold text-slate-900">
                      {idx + 1}. {getQuestionText(q)}
                    </h4>
                    {isCorrect ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-secondary font-bold text-[10px] flex items-center gap-1 shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1 shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600">
                    Your Answer:{' '}
                    <strong
                      className={isCorrect ? 'text-secondary' : 'text-rose-700'}
                    >
                      {userAns !== undefined && opts[userAns]
                        ? opts[userAns]
                        : 'Not Answered'}
                    </strong>
                  </div>
                  {!isCorrect && opts[correctIdx] && (
                    <div className="text-xs text-secondary font-medium">
                      Correct Answer: <strong>{opts[correctIdx]}</strong>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs leading-relaxed">
                    <strong className="text-slate-900">Explanation:</strong>{' '}
                    {q.explanation ||
                      'Refer to curriculum for detailed breakdown.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
