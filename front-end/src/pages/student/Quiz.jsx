import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Flag, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Award, 
  Sparkles,
  HelpCircle,
  Check,
  CheckCircle,
  XCircle,
  BarChart2,
  BookOpen
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/common/Badge';
import { CircularProgress } from '../../components/common/ProgressBar';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

const getQuestionOptions = (q) => {
  if (!q) return [];
  if (Array.isArray(q.options)) {
    return q.options.map(opt => (typeof opt === 'object' ? (opt.text || opt.title || '') : opt));
  }
  if (q.optionA) {
    return [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean);
  }
  return [];
};

const getQuestionText = (q) => {
  if (!q) return '';
  return q.question || q.questionText || q.title || '';
};

const getCorrectAnswerIndex = (q) => {
  if (q.correctAnswer !== undefined) return q.correctAnswer;
  if (typeof q.correctOption === 'string') {
    const char = q.correctOption.toLowerCase();
    if (char >= 'a' && char <= 'd') return char.charCodeAt(0) - 97;
  }
  if (Array.isArray(q.options)) {
    const idx = q.options.findIndex(opt => typeof opt === 'object' && opt.isCorrect);
    if (idx !== -1) return idx;
  }
  return 0;
};

export default function Quiz() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.quizzes.list()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.items || []);
        if (list.length > 0) {
          const activeQuiz = list[0];
          setQuizData(activeQuiz);
          if (activeQuiz.durationMinutes) {
            setTimeLeft(activeQuiz.durationMinutes * 60);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching quiz from backend:', err);
        setLoading(false);
      });
  }, []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({
    0: 0,
    1: 1
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(863);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optIdx });
  };

  const handleClearSelection = () => {
    const updated = { ...selectedAnswers };
    delete updated[currentIdx];
    setSelectedAnswers(updated);
    addToast('Answer selection cleared', 'info');
  };

  const handleToggleFlag = () => {
    if (flaggedQuestions.includes(currentIdx)) {
      setFlaggedQuestions(prev => prev.filter(q => q !== currentIdx));
      addToast(`Question ${currentIdx + 1} unflagged`, 'info');
    } else {
      setFlaggedQuestions(prev => [...prev, currentIdx]);
      addToast(`Question ${currentIdx + 1} flagged for review`, 'info');
    }
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    const questions = quizData?.questions || [];
    questions.forEach((q, idx) => {
      const correctIdx = getCorrectAnswerIndex(q);
      if (selectedAnswers[idx] === correctIdx) {
        correctCount += 1;
      }
    });
    const total = quizData?.totalQuestions || questions.length || 1;
    const calculatedPercentage = Math.round((correctCount / total) * 100);
    setScore(calculatedPercentage);
    setIsSubmitted(true);
    setShowSubmitModal(false);
    
    if (calculatedPercentage >= (quizData?.passingScore || 80)) {
      addToast(`Congratulations! You passed with ${calculatedPercentage}%!`, 'success');
    } else {
      addToast(`Assessment completed. Score: ${calculatedPercentage}%`, 'info');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Quiz Not Found</h2>
          <p className="text-xs text-slate-500">No assessment questions found for this module.</p>
          <Link to="/student" className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl inline-block">
            Back to Dashboard
          </Link>
        </div>
      </PageLayout>
    );
  }

  const currentQ = quizData.questions[currentIdx] || quizData.questions[0];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-margin-desktop py-8 space-y-8">
        
        {/* Breadcrumbs Header */}
        <nav className="flex items-center gap-2 text-xs text-outline font-medium">
          <Link to="/my-learning" className="hover:text-primary transition-colors">My Learning</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/course-progress" className="hover:text-primary transition-colors">{quizData.courseTitle}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-outline">{quizData.moduleTitle}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary font-bold">Module Assessment</span>
        </nav>

        {/* Assessment Title & Top Status Bar */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="tertiary" size="sm">Graded Assessment</Badge>
              <span className="text-xs text-outline font-medium">10 Questions • 15 Minutes • Pass: 80%</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-on-surface">
              {quizData.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            {!isSubmitted && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-mono font-bold text-sm shadow-xs">
                <Clock className="w-4 h-4 text-tertiary" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            {!isSubmitted && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-elevation-1 transition-all"
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>

        {/* Result Screen if submitted */}
        {isSubmitted ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 md:p-12 shadow-elevation-2 space-y-8 animate-in fade-in">
            <div className="flex flex-col items-center text-center space-y-4">
              <CircularProgress 
                progress={score} 
                size={110} 
                strokeWidth={9} 
                color={score >= quizData.passingScore ? "#006D37" : "#BA1A1A"} 
              />

              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  score >= quizData.passingScore ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                }`}>
                  {score >= quizData.passingScore ? "✓ Passed with Honors" : "Needs Review (Passing grade 80%)"}
                </span>

                <h2 className="text-3xl font-extrabold text-on-surface mt-2 tracking-tight">
                  You scored {score}%
                </h2>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1">
                  You answered {Math.round((score / 100) * quizData.totalQuestions)} of {quizData.totalQuestions} questions correctly. Your grade has been posted to your student transcript.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to="/course-progress"
                  className="px-6 py-3 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-elevation-1 transition-all"
                >
                  Return to Course Progress
                </Link>
                <Link
                  to="/certificates"
                  className="px-6 py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors"
                >
                  View Certificates
                </Link>
                <button
                  onClick={() => setShowExplanations(!showExplanations)}
                  className="px-5 py-3 rounded-2xl border border-outline-variant hover:bg-surface-container text-xs font-bold text-primary transition-colors"
                >
                  {showExplanations ? "Hide Detailed Explanations" : "Review All Answers & Explanations"}
                </button>
              </div>
            </div>

            {/* Detailed Answers & Explanations Breakdown */}
            {showExplanations && (
              <div className="pt-6 border-t border-outline-variant space-y-4">
                <h3 className="font-bold text-sm text-on-surface">Question by Question Breakdown</h3>
                <div className="space-y-4">
                  {quizData.questions.map((q, idx) => {
                    const userAns = selectedAnswers[idx];
                    const correctIdx = getCorrectAnswerIndex(q);
                    const isCorrect = userAns === correctIdx;
                    const opts = getQuestionOptions(q);

                    return (
                      <div key={q.id || idx} className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant text-xs space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-bold text-on-surface">
                            Q{idx + 1}. {getQuestionText(q)}
                          </span>
                          {isCorrect ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 flex-shrink-0">
                              <CheckCircle className="w-3.5 h-3.5" /> Correct (+10 pts)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center gap-1 flex-shrink-0">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-outline">
                          Your Answer: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{userAns !== undefined && opts[userAns] ? opts[userAns] : 'Not Answered'}</strong>
                        </div>
                        {!isCorrect && opts[correctIdx] && (
                          <div className="text-[11px] text-emerald-800 font-medium">
                            Correct Answer: <strong>{opts[correctIdx]}</strong>
                          </div>
                        )}
                        <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/60 text-on-surface-variant text-[11px] leading-relaxed">
                          <strong>Explanation:</strong> {q.explanation || 'Refer to course documentation for detailed explanation.'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Question Map Navigator */}
            <div className="bg-surface-container-low border border-outline-variant/80 rounded-2xl p-4 shadow-ambient">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface mb-3">
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  <span>Question Map</span>
                </span>
                <span className="text-outline font-semibold">
                  {answeredCount} of {quizData.totalQuestions || quizData.questions.length} Answered
                </span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {quizData.questions.map((q, idx) => {
                  const isCurrent = currentIdx === idx;
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isFlagged = flaggedQuestions.includes(idx);

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all ${
                        isCurrent
                          ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2 scale-105'
                          : isAnswered
                          ? 'bg-secondary-fixed text-on-secondary-fixed font-bold'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-tertiary ring-2 ring-surface"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Question Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant text-xs">
                <span className="font-bold text-primary tracking-wide uppercase">Question {currentIdx + 1} of {quizData.totalQuestions || quizData.questions.length}</span>
                <button
                  onClick={handleToggleFlag}
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    flaggedQuestions.includes(currentIdx) ? 'text-tertiary' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <Flag className={`w-4 h-4 ${flaggedQuestions.includes(currentIdx) ? 'fill-current text-tertiary' : ''}`} />
                  <span>{flaggedQuestions.includes(currentIdx) ? "Flagged for Review" : "Flag Question"}</span>
                </button>
              </div>

              {/* Question Text */}
              <h2 className="text-base md:text-lg font-bold text-on-surface leading-snug">
                {getQuestionText(currentQ)}
              </h2>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {getQuestionOptions(currentQ).map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === optIdx;

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-2xl border text-xs md:text-sm font-medium flex items-start gap-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-on-surface shadow-sm ring-2 ring-primary/40 font-semibold'
                          : 'border-outline-variant hover:bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected ? 'border-primary bg-primary text-white' : 'border-outline'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="leading-relaxed">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-6 border-t border-outline-variant flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleClearSelection}
                  className="text-xs font-semibold text-outline hover:text-error transition-colors"
                >
                  Clear Selection
                </button>

                <div className="flex items-center gap-3">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentIdx < quizData.totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentIdx(prev => prev + 1)}
                      className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Review & Submit</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 max-w-md w-full shadow-elevation-3 space-y-4">
              <h3 className="text-lg font-bold text-on-surface">Submit Assessment?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                You have answered <strong className="text-on-surface font-bold">{answeredCount} of {quizData.totalQuestions}</strong> questions.
                {quizData.totalQuestions - answeredCount > 0 && (
                  <span className="block text-amber-800 font-semibold mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    ⚠️ You still have {quizData.totalQuestions - answeredCount} unanswered questions.
                  </span>
                )}
              </p>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-outline hover:bg-surface-container"
                >
                  Keep Working
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm"
                >
                  Submit Final Grade
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
