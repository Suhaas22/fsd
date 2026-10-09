// =========================================================================================
// FDFED M2026 - Student Module: Graded Module Quiz & Academic Assessment
// Design: Stitch Coursera-Style Academic Assessment Experience (Desktop Layout)
// Author: Student Portal Implementation | IIIT Sri City
// =========================================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Flag, 
  CheckCircle2, 
  RotateCcw, 
  Award, 
  Check, 
  CheckCircle, 
  XCircle, 
  BarChart2, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { CircularProgress } from '../../components/common/ProgressBar';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

const DEFAULT_COURSERA_QUIZ = {
  id: "qz-101",
  courseId: "crs-1",
  courseTitle: "Advanced Enterprise Architecture & Payment Systems",
  institution: "Stanford University",
  moduleTitle: "Module 2: Distributed Consensus & Two-Phase Commit",
  title: "Graded Assessment: Distributed Consensus & Multi-Region Failover",
  description: "Demonstrate your understanding of distributed consensus protocols, Two-Phase Commit (2PC), Raft leader election, and high-frequency banking state reconciliation.",
  durationMinutes: 25,
  passingScore: 80,
  totalQuestions: 5,
  questions: [
    {
      id: "q1",
      number: 1,
      question: "Which AWS database service provides active-active multi-region replication with automated write-conflict resolution?",
      options: [
        "Amazon RDS PostgreSQL with cross-region read replicas",
        "Amazon DynamoDB Global Tables",
        "Amazon Aurora Serverless v1",
        "Amazon ElastiCache Redis in Cluster Mode"
      ],
      correctAnswer: 1,
      explanation: "Amazon DynamoDB Global Tables provide fully managed, active-active multi-region replication with automatic last-writer-wins conflict resolution across all regions."
    },
    {
      id: "q2",
      number: 2,
      question: "In the Two-Phase Commit (2PC) protocol, what does a participant node guarantee once it votes VOTE_COMMIT during Phase 1?",
      options: [
        "The write is immediately committed locally and returned to the end user",
        "The participant promises it has locked resources and will abide by the coordinator's final GLOBAL_COMMIT or GLOBAL_ABORT decision",
        "The participant will abort if any other node takes longer than 50 milliseconds",
        "The participant triggers asynchronous background replication to a secondary database"
      ],
      correctAnswer: 1,
      explanation: "A participant voting VOTE_COMMIT enters the prepared state, guaranteeing it can and will commit if instructed by the coordinator."
    },
    {
      id: "q3",
      number: 3,
      question: "Under the CAP Theorem, when an unavoidable network partition (P) occurs across data centers, what tradeoff must a financial ledger make?",
      options: [
        "Choose between Strong Consistency (CP) and High Availability (AP)",
        "Sacrifice Partition Tolerance to maintain sub-millisecond response latency",
        "Switch from symmetric AES-256 to asymmetric RSA-4096 cryptographic signatures",
        "Disable transaction logging until network connectivity is fully restored"
      ],
      correctAnswer: 0,
      explanation: "The CAP Theorem states that during a network partition (P), a distributed system must choose between returning an error to preserve Consistency (CP) or serving potentially stale data to preserve Availability (AP)."
    },
    {
      id: "q4",
      number: 4,
      question: "Which consensus algorithm decomposes consensus into Leader Election, Log Replication, and Safety using Leader, Follower, and Candidate states?",
      options: [
        "Proof of Work (PoW)",
        "Raft Consensus Algorithm",
        "Round-Robin Load Balancing",
        "Token Ring Protocol"
      ],
      correctAnswer: 1,
      explanation: "The Raft consensus algorithm is designed for understandability, dividing the consensus problem into three explicit states: Leader, Follower, and Candidate."
    },
    {
      id: "q5",
      number: 5,
      question: "Under PCI-DSS v4.0 regulatory standards, which payment card data element is strictly prohibited from persistent storage after transaction authorization?",
      options: [
        "Cardholder Name",
        "Primary Account Number (PAN) when properly encrypted",
        "Sensitive Authentication Data (SAD / CVV / CVC)",
        "Card Expiration Date"
      ],
      correctAnswer: 2,
      explanation: "PCI-DSS v4.0 strictly prohibits storing Sensitive Authentication Data (SAD)—including the 3-digit or 4-digit card security code (CVV/CVC)—after authorization, even if encrypted."
    }
  ]
};

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
  
  const [quizData, setQuizData] = useState(DEFAULT_COURSERA_QUIZ);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(1500); // 25:00
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    api.quizzes.list()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.items || []);
        if (list.length > 0) {
          const active = list.find(q => q.id === 'qz-101') || list[0];
          const hasQuestions = Array.isArray(active.questions) && active.questions.length > 0;
          setQuizData({
            ...DEFAULT_COURSERA_QUIZ,
            ...active,
            questions: hasQuestions ? active.questions : DEFAULT_COURSERA_QUIZ.questions,
            totalQuestions: hasQuestions ? active.questions.length : DEFAULT_COURSERA_QUIZ.totalQuestions,
          });
        }
      })
      .catch((err) => {
        console.warn('Using default Coursera assessment data:', err.message);
      });
  }, []);

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
    const questions = quizData.questions || [];
    questions.forEach((q, idx) => {
      const correctIdx = getCorrectAnswerIndex(q);
      if (selectedAnswers[idx] === correctIdx) {
        correctCount += 1;
      }
    });
    const total = questions.length || 1;
    const calculatedPercentage = Math.round((correctCount / total) * 100);
    setScore(calculatedPercentage);
    setIsSubmitted(true);
    setShowSubmitModal(false);
    
    if (calculatedPercentage >= (quizData.passingScore || 80)) {
      addToast(`Congratulations! You passed with ${calculatedPercentage}%!`, 'success');
    } else {
      addToast(`Assessment completed. Score: ${calculatedPercentage}%`, 'info');
    }
  };

  const questionsList = quizData.questions || [];
  const currentQ = questionsList[currentIdx] || questionsList[0];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIdx + 1) / questionsList.length) * 100);

  return (
    <PageLayout>
      <div className="bg-[#F8FAFC] min-h-screen py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/student" className="hover:text-coursera transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/student/my-learning" className="hover:text-coursera transition-colors">My Learning</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 truncate max-w-xs">{quizData.courseTitle}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">Graded Assessment</span>
          </nav>

          {/* Assessment Header Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-coursera text-xs font-bold border border-blue-100">
                  {quizData.institution || 'Stanford University'}
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
                onClick={() => setShowSubmitModal(true)}
                className="px-5 py-2.5 rounded-xl bg-coursera hover:bg-primary text-white text-xs font-bold shadow-sm transition-all shrink-0 active:scale-95"
              >
                Submit Exam
              </button>
            )}
          </div>

          {/* If Submitted: Full Report Screen */}
          {isSubmitted ? (
            <div className="bg-white border border-slate-200/80 rounded-xl p-8 md:p-12 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-8 animate-in fade-in">
              <div className="flex flex-col items-center text-center space-y-4">
                <CircularProgress 
                  progress={score} 
                  size={120} 
                  strokeWidth={10} 
                  color={score >= quizData.passingScore ? "#006D37" : "#DC2626"} 
                />

                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    score >= quizData.passingScore 
                      ? 'bg-emerald-50 text-secondary border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {score >= quizData.passingScore ? "✓ Passed with Academic Distinction" : "Did Not Pass (Requires 80%)"}
                  </span>

                  <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                    You Scored {score}%
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    You answered {Math.round((score / 100) * questionsList.length)} of {questionsList.length} questions correctly. 
                    Your official grade has been saved.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    to="/student/certificates"
                    className="px-6 py-3 rounded-xl bg-coursera text-white text-xs font-bold hover:bg-primary shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Verified Certificate</span>
                  </Link>
                  <Link
                    to="/student/course-progress"
                    className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Return to Course Progress
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowExplanations(!showExplanations)}
                    className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-coursera transition-colors"
                  >
                    {showExplanations ? "Hide Explanations" : "Review All Answers & Explanations"}
                  </button>
                </div>
              </div>

              {/* Explanations section */}
              {showExplanations && (
                <div className="border-t border-slate-100 pt-8 space-y-6">
                  <h3 className="text-base font-bold text-slate-900">
                    Question Review & Comprehensive Explanations
                  </h3>

                  <div className="space-y-4">
                    {questionsList.map((q, idx) => {
                      const opts = getQuestionOptions(q);
                      const correctIdx = getCorrectAnswerIndex(q);
                      const userAns = selectedAnswers[idx];
                      const isCorrect = userAns === correctIdx;

                      return (
                        <div key={q.id || idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
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
                            Your Answer: <strong className={isCorrect ? 'text-secondary' : 'text-rose-700'}>
                              {userAns !== undefined && opts[userAns] ? opts[userAns] : 'Not Answered'}
                            </strong>
                          </div>
                          {!isCorrect && opts[correctIdx] && (
                            <div className="text-xs text-secondary font-medium">
                              Correct Answer: <strong>{opts[correctIdx]}</strong>
                            </div>
                          )}
                          <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs leading-relaxed">
                            <strong className="text-slate-900">Explanation:</strong> {q.explanation || 'Refer to curriculum for detailed breakdown.'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Assessment 2-Column Desktop Layout (Stitch Specification) */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Question Map Sidebar (3 cols on desktop) */}
              <aside className="md:col-span-3 bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Question Map</h3>
                  <span className="text-[11px] text-slate-500 font-semibold">{answeredCount}/{questionsList.length} done</span>
                </div>

                <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
                  {questionsList.map((q, idx) => {
                    const isCurrent = currentIdx === idx;
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const isFlagged = flaggedQuestions.includes(idx);

                    let btnClass = "bg-slate-100 text-slate-600 hover:bg-slate-200";
                    if (isCurrent) {
                      btnClass = "bg-coursera text-white ring-2 ring-blue-500 ring-offset-2 font-bold shadow-xs";
                    } else if (isAnswered) {
                      btnClass = "bg-emerald-100 text-secondary font-bold hover:bg-emerald-200";
                    }

                    return (
                      <button
                        key={q.id || idx}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold relative transition-all ${btnClass}`}
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
                    <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300"></span>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-coursera"></span>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300"></span>
                    <span>Pending</span>
                  </div>
                </div>
              </aside>

              {/* Right Main Quiz Area (9 cols on desktop) */}
              <div className="md:col-span-9 flex flex-col space-y-4">
                
                {/* Top Bar: Progress & Monospace Timer */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Progress</span>
                    <h2 className="text-sm font-bold text-slate-900">Question {currentIdx + 1} of {questionsList.length}</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleFlag}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        flaggedQuestions.includes(currentIdx)
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{flaggedQuestions.includes(currentIdx) ? 'Flagged' : 'Flag'}</span>
                    </button>

                    <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full text-slate-800 font-mono font-bold text-xs shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                      <Clock className="w-3.5 h-3.5 text-coursera" />
                      <span>{formatTimer(timeLeft)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar Line */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-coursera rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between min-h-[420px]">
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-slate-900 mb-6 leading-relaxed">
                      {getQuestionText(currentQ)}
                    </h2>

                    {/* Options list */}
                    <div className="space-y-3">
                      {getQuestionOptions(currentQ).map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentIdx] === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(optIdx)}
                            className={`p-4 rounded-xl border text-xs md:text-sm font-medium flex items-start gap-4 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-coursera bg-blue-50/60 text-slate-900 shadow-sm ring-1 ring-coursera font-semibold'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isSelected ? 'border-coursera bg-coursera text-white' : 'border-slate-400 bg-white'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
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
                      onClick={handleClearSelection}
                      className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      Clear Selection
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={currentIdx === 0}
                        onClick={() => setCurrentIdx(prev => prev - 1)}
                        className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      {currentIdx < questionsList.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentIdx(prev => prev + 1)}
                          className="px-6 py-2.5 rounded-lg bg-coursera hover:bg-primary text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <span>Next</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowSubmitModal(true)}
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

            </div>
          )}

          {/* Submit Confirmation Modal */}
          {showSubmitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">Submit Graded Assessment?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You have answered <strong className="text-slate-900 font-bold">{answeredCount} of {questionsList.length}</strong> questions.
                  {questionsList.length - answeredCount > 0 && (
                    <span className="block text-amber-900 font-semibold mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                      ⚠️ You still have {questionsList.length - answeredCount} unanswered questions.
                    </span>
                  )}
                </p>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Keep Working
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2 rounded-xl bg-coursera hover:bg-primary text-white text-xs font-bold shadow-xs"
                  >
                    Submit Final Grade
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
}
