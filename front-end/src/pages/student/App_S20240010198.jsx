
//  Rajidi Nishanth Reddy - S20240010198


/*

QuizAssign
├── QuestionNavigator
│   └── Question-number buttons
└── QuestionCard
    └── Answer-option buttons

  */


/*

Props
QuizAssign passes data and functions to child components.
- QuestionNavigator receives:
  - questions
  - currentIndex
  - selectedAnswers
  - flaggedIds
  - onQuestionSelect
- QuestionCard receives:
  - question
  - answerIndex
  - isSubmitted
  - onAnswerSelect

Callback functions
Child components communicate with the parent through callbacks.
- When a student clicks a question number, QuestionNavigator calls onQuestionSelect(index). This updates currentIndex in QuizAssign.
- When a student selects an answer, QuestionCard calls onAnswerSelect(question.id, index). This updates selectedAnswers in QuizAssign.

Lifted state
All shared state is stored in the common parent component, QuizAssign:
- currentIndex — active question
- selectedAnswers — answers selected by the student
- flaggedIds — questions marked for review
- secondsLeft — countdown timer
- isSubmitted — whether the quiz has been submitted

*/




import React, { useEffect, useState } from 'react';
import { CheckCircle2, Flag, Timer } from 'lucide-react';

const questions = [
  { id: 1, text: 'Which HTTP method is generally used to create a new resource?', options: ['GET', 'POST', 'DELETE', 'PATCH'], correctAnswer: 1 },
  { id: 2, text: 'What does an idempotency key help prevent in a payment API?', options: ['Slow network requests', 'Duplicate transactions', 'Expired user sessions', 'Invalid currencies'], correctAnswer: 1 },
  { id: 3, text: 'Which status code means a request was successful?', options: ['201', '404', '500', '401'], correctAnswer: 0 },
];

function QuestionNavigator({ questions, currentIndex, selectedAnswers, flaggedIds, onQuestionSelect }) {
  return <nav aria-label="Quiz questions" className="rounded-2xl border border-outline-variant bg-surface-container-low p-4"><h2 className="mb-3 text-sm font-bold">Questions</h2><div className="grid grid-cols-3 gap-2">{questions.map((question, index) => <button key={question.id} type="button" onClick={() => onQuestionSelect(index)} className={`relative rounded-lg py-2 text-xs font-bold ${index === currentIndex ? 'bg-primary text-white' : selectedAnswers[question.id] !== undefined ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-on-surface'}`}>{index + 1}{flaggedIds.includes(question.id) && <Flag className="absolute right-1 top-1 h-3 w-3" />}</button>)}</div></nav>;
}

function QuestionCard({ question, answerIndex, isSubmitted, onAnswerSelect }) {
  return <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-ambient"><p className="mb-5 text-lg font-bold">{question.text}</p><div className="space-y-3">{question.options.map((option, index) => { const selected = answerIndex === index; const correct = isSubmitted && index === question.correctAnswer; const incorrect = isSubmitted && selected && index !== question.correctAnswer; return <button key={option} type="button" disabled={isSubmitted} onClick={() => onAnswerSelect(question.id, index)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm ${correct ? 'border-emerald-500 bg-emerald-50' : incorrect ? 'border-red-500 bg-red-50' : selected ? 'border-primary bg-primary-fixed' : 'border-outline-variant hover:border-primary'}`}><span className="flex h-6 w-6 items-center justify-center rounded-full border font-bold">{String.fromCharCode(65 + index)}</span>{option}</button>; })}</div></section>;
}

export default function QuizAssign() {
  // Lifted state: both child components need the selected answer, current question, and flags.
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedIds, setFlaggedIds] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted || secondsLeft === 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => window.clearInterval(timer);
  }, [isSubmitted, secondsLeft]);

  const currentQuestion = questions[currentIndex];
  const selectAnswer = (questionId, answerIndex) => setSelectedAnswers((answers) => ({ ...answers, [questionId]: answerIndex }));
  const toggleFlag = () => setFlaggedIds((ids) => ids.includes(currentQuestion.id) ? ids.filter((id) => id !== currentQuestion.id) : [...ids, currentQuestion.id]);
  const score = questions.filter((question) => selectedAnswers[question.id] === question.correctAnswer).length;
  const time = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return <main className="mx-auto max-w-5xl px-4 py-8 text-on-surface"><header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">API Fundamentals Quiz</h1><p className="text-sm text-on-surface-variant">Choose one answer for each question.</p></div><div className="flex items-center gap-2 rounded-xl bg-surface-container px-4 py-2 font-bold"><Timer className="h-5 w-5 text-primary" />{time}</div></header>{isSubmitted && <section className="mb-6 rounded-2xl bg-emerald-50 p-5 text-emerald-900"><CheckCircle2 className="mb-2 h-7 w-7" /><h2 className="font-bold">Quiz submitted</h2><p>You scored {score} out of {questions.length}.</p></section>}<div className="grid gap-6 md:grid-cols-[180px_1fr]"><QuestionNavigator questions={questions} currentIndex={currentIndex} selectedAnswers={selectedAnswers} flaggedIds={flaggedIds} onQuestionSelect={setCurrentIndex} /><div><p className="mb-3 text-xs font-bold text-primary">QUESTION {currentIndex + 1} OF {questions.length}</p><QuestionCard question={currentQuestion} answerIndex={selectedAnswers[currentQuestion.id]} isSubmitted={isSubmitted} onAnswerSelect={selectAnswer} /><div className="mt-4 flex flex-wrap justify-between gap-2"><button type="button" disabled={isSubmitted} onClick={toggleFlag} className="rounded-lg border border-outline-variant px-3 py-2 text-sm"><Flag className="mr-1 inline h-4 w-4" />{flaggedIds.includes(currentQuestion.id) ? 'Unflag' : 'Flag'}</button><div className="flex gap-2"><button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)} className="rounded-lg border border-outline-variant px-3 py-2 text-sm">Previous</button>{currentIndex < questions.length - 1 ? <button type="button" onClick={() => setCurrentIndex((index) => index + 1)} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">Next</button> : <button type="button" disabled={isSubmitted} onClick={() => setIsSubmitted(true)} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">Submit quiz</button>}</div></div></div></div></main>;
}


