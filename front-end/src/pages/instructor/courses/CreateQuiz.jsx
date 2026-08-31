import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Badge } from "../../../components/instructor/ui/Badge";
import { api } from "../../../utils/api";
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  HelpCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit3,
  Save,
  AlertCircle,
  Lock,
  Unlock,
  Award,
  RotateCcw,
  Sparkles,
  X,
  Check,
  Layers,
  Target,
  Zap,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../../utils/cn";

// ─── Helpers ────────────────────────────────────────────────────────────────────
let nextQuestionId = 100;
let nextOptionId = 1000;

function generateOptionId() {
  return `opt_${nextOptionId++}`;
}

function generateQuestionId() {
  return nextQuestionId++;
}

function createEmptyOption(label = "") {
  return {
    id: generateOptionId(),
    text: label,
    isCorrect: false,
  };
}

function createEmptyQuestion() {
  return {
    id: generateQuestionId(),
    text: "",
    options: [
      { id: generateOptionId(), text: "", isCorrect: false },
      { id: generateOptionId(), text: "", isCorrect: false },
      { id: generateOptionId(), text: "", isCorrect: false },
      { id: generateOptionId(), text: "", isCorrect: false },
    ],
    points: 10,
    explanation: "",
    collapsed: false,
  };
}

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// ─── Correct Answer Indicator ───────────────────────────────────────────────────
function CorrectAnswerRadio({ isCorrect, isLocked, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1",
        isCorrect
          ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 focus:ring-emerald-400 scale-110"
          : isLocked
          ? "bg-navy-100 text-navy-300 cursor-not-allowed focus:ring-navy-200"
          : "bg-white border-2 border-navy-300 text-navy-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 focus:ring-emerald-300"
      )}
      title={
        isCorrect
          ? "This is the correct answer"
          : isLocked
          ? "Another option is already marked as correct"
          : "Mark as correct answer"
      }
    >
      {isCorrect ? (
        <Check className="w-4 h-4" strokeWidth={3} />
      ) : isLocked ? (
        <Lock className="w-3 h-3" />
      ) : (
        <div className="w-2.5 h-2.5 rounded-full bg-navy-200 group-hover:bg-emerald-300 transition-colors" />
      )}
    </button>
  );
}

// ─── Option Row ─────────────────────────────────────────────────────────────────
function OptionRow({
  option,
  index,
  hasCorrectAnswer,
  onToggleCorrect,
  onUpdateText,
  onDelete,
  totalOptions,
}) {
  const letter = OPTION_LETTERS[index] || String(index + 1);
  const isLocked = hasCorrectAnswer && !option.isCorrect;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-300 group",
        option.isCorrect
          ? "border-emerald-300 bg-gradient-to-r from-emerald-50/80 to-emerald-50/30 shadow-sm shadow-emerald-100"
          : isLocked
          ? "border-navy-100 bg-navy-50/30 opacity-60"
          : "border-navy-200 bg-white hover:border-navy-300 hover:shadow-sm"
      )}
    >
      {/* Correct Answer Toggle */}
      <CorrectAnswerRadio
        isCorrect={option.isCorrect}
        isLocked={isLocked}
        onClick={() => onToggleCorrect(option.id)}
        disabled={false}
      />

      {/* Option Letter */}
      <span
        className={cn(
          "text-sm font-bold w-7 text-center shrink-0 transition-colors duration-200",
          option.isCorrect
            ? "text-emerald-700"
            : isLocked
            ? "text-navy-300"
            : "text-navy-500"
        )}
      >
        {letter}.
      </span>

      {/* Option Text */}
      <input
        type="text"
        value={option.text}
        onChange={(e) => onUpdateText(option.id, e.target.value)}
        placeholder={`Option ${letter}`}
        className={cn(
          "flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-navy-300 transition-colors",
          option.isCorrect
            ? "text-emerald-900 placeholder:text-emerald-300"
            : isLocked
            ? "text-navy-400"
            : "text-navy-800"
        )}
      />

      {/* Status / Delete */}
      <div className="flex items-center gap-1.5 shrink-0">
        {option.isCorrect && (
          <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            CORRECT
          </span>
        )}
        {isLocked && (
          <span className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-navy-400">
            <Lock className="w-3 h-3" />
          </span>
        )}
        {totalOptions > 2 && (
          <button
            onClick={() => onDelete(option.id)}
            className="p-1 text-navy-300 hover:text-rose-500 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Remove option"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Question Card ──────────────────────────────────────────────────────────────
function QuestionCard({
  question,
  index,
  totalQuestions,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hasCorrectAnswer = question.options.some((o) => o.isCorrect);
  const correctOption = question.options.find((o) => o.isCorrect);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [question.text]);

  // ─── Handlers ───────────────────────────────────────────────────────
  const setCorrectOption = (optionId) => {
    onUpdate({
      ...question,
      options: question.options.map((o) => ({
        ...o,
        isCorrect: o.id === optionId ? !o.isCorrect : false,
      })),
    });
  };

  const updateOptionText = (optionId, text) => {
    onUpdate({
      ...question,
      options: question.options.map((o) =>
        o.id === optionId ? { ...o, text } : o
      ),
    });
  };

  const deleteOption = (optionId) => {
    if (question.options.length <= 2) return;
    onUpdate({
      ...question,
      options: question.options.filter((o) => o.id !== optionId),
    });
  };

  const addOption = () => {
    if (question.options.length >= 8) return;
    onUpdate({
      ...question,
      options: [...question.options, createEmptyOption()],
    });
  };

  const updateQuestionText = (text) => {
    onUpdate({ ...question, text });
  };

  const updatePoints = (points) => {
    onUpdate({ ...question, points: parseInt(points) || 0 });
  };

  const updateExplanation = (explanation) => {
    onUpdate({ ...question, explanation });
  };

  return (
    <div
      className={cn(
        "bg-white border-2 rounded-2xl transition-all duration-300 overflow-hidden",
        collapsed
          ? "border-navy-200/60 hover:border-navy-300"
          : "border-navy-200/60 shadow-card hover:shadow-elevated"
      )}
    >
      {/* Question Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 sm:px-6",
          collapsed ? "py-4" : "py-5 border-b border-navy-100"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-navy-300 cursor-grab hover:text-navy-600 shrink-0 hidden sm:block transition-colors">
            <GripVertical className="w-5 h-5" />
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
              collapsed
                ? "bg-navy-50 text-navy-500 hover:text-navy-700"
                : "bg-primary-50 text-primary-600"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {index + 1}
                </div>
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider hidden sm:inline">
                  Question
                </span>
              </div>

              {collapsed && (
                <span className="text-sm font-medium text-navy-700 truncate">
                  {question.text || (
                    <span className="text-navy-400 italic">Untitled question</span>
                  )}
                </span>
              )}
            </div>

            {collapsed && (
              <div className="flex items-center gap-3 mt-1.5 text-xs text-navy-500">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {question.options.length} options
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {question.points} pts
                </span>
                {hasCorrectAnswer ? (
                  <Badge variant="success" className="text-[10px] py-0">
                    <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                    Answer set
                  </Badge>
                ) : (
                  <Badge variant="warning" className="text-[10px] py-0">
                    <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                    No answer
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Question Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={() => onMoveUp()}
            disabled={index === 0}
            className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-navy-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveDown()}
            disabled={index === totalQuestions - 1}
            className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-navy-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete()}
            className="p-1.5 text-navy-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Body */}
      {!collapsed && (
        <div className="px-4 sm:px-6 py-5 space-y-5">
          {/* Question Text */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2 block">
              Question Text
            </label>
            <textarea
              ref={textareaRef}
              value={question.text}
              onChange={(e) => updateQuestionText(e.target.value)}
              placeholder="Type your question here..."
              className="w-full rounded-xl border-2 border-navy-200 bg-navy-50/30 px-4 py-3 text-sm font-medium text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white resize-none min-h-[80px] transition-all duration-200"
              rows={2}
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-navy-400 flex items-center gap-2">
                Answer Options
                {hasCorrectAnswer && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full normal-case tracking-normal">
                    <ShieldCheck className="w-3 h-3" />
                    Correct answer selected
                  </span>
                )}
                {!hasCorrectAnswer && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full normal-case tracking-normal animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    Select a correct answer
                  </span>
                )}
              </label>
            </div>

            <div className="space-y-2.5">
              {question.options.map((opt, idx) => (
                <OptionRow
                  key={opt.id}
                  option={opt}
                  index={idx}
                  hasCorrectAnswer={hasCorrectAnswer}
                  onToggleCorrect={setCorrectOption}
                  onUpdateText={updateOptionText}
                  onDelete={deleteOption}
                  totalOptions={question.options.length}
                />
              ))}
            </div>

            {/* Add Option */}
            {question.options.length < 8 && (
              <button
                onClick={addOption}
                className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors pl-1 group"
              >
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 group-hover:scale-110 transition-all">
                  <Plus className="w-3 h-3" strokeWidth={3} />
                </div>
                Add option
                <span className="text-navy-300 font-normal">
                  ({question.options.length}/8)
                </span>
              </button>
            )}
          </div>

          {/* Points & Explanation */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-navy-100">
            <div className="w-full sm:w-36">
              <label className="block text-xs font-semibold text-navy-500 mb-1.5">
                <Target className="w-3 h-3 inline mr-1" />
                Points
              </label>
              <Input
                type="number"
                value={question.points}
                onChange={(e) => updatePoints(e.target.value)}
                min="0"
                className="h-9 text-sm font-semibold"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-navy-500 mb-1.5">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Explanation{" "}
                <span className="text-navy-300 font-normal">(shown after submission)</span>
              </label>
              <input
                type="text"
                value={question.explanation}
                onChange={(e) => updateExplanation(e.target.value)}
                placeholder="Why is the correct answer right?"
                className="w-full h-9 rounded-lg border border-navy-200 bg-white px-3 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Preview Mode ──────────────────────────────────────────────────────────
function QuizPreview({ questions, quizTitle, passingScore, onExit }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = questions.reduce((sum, q) => {
    const correctOpt = q.options.find((o) => o.isCorrect);
    if (correctOpt && selectedAnswers[q.id] === correctOpt.id) return sum + q.points;
    return sum;
  }, 0);
  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = scorePercent >= passingScore;
  const answeredCount = Object.keys(selectedAnswers).length;

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-navy-900">{quizTitle} — Results</h1>
          <Button variant="outline" onClick={onExit} className="gap-1.5">
            <Edit3 className="w-4 h-4" /> Return to Editor
          </Button>
        </div>

        {/* Score Card */}
        <Card className="mb-8 overflow-hidden">
          <div
            className={cn(
              "p-8 text-center",
              passed
                ? "bg-gradient-to-br from-emerald-50 to-teal-50"
                : "bg-gradient-to-br from-rose-50 to-amber-50"
            )}
          >
            <div
              className={cn(
                "w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg",
                passed
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                  : "bg-gradient-to-br from-rose-400 to-amber-500 text-white"
              )}
            >
              <div>
                <div className="text-3xl font-black">{scorePercent}%</div>
                <div className="text-xs font-medium opacity-80">Score</div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-navy-900 mb-1">
              {passed ? "🎉 Congratulations! You Passed" : "😔 Not Quite There"}
            </h2>
            <p className="text-navy-500">
              {earnedPoints} / {totalPoints} points • Passing score: {passingScore}%
            </p>

            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{answeredCount}</div>
                <div className="text-xs text-navy-500">Answered</div>
              </div>
              <div className="w-px bg-navy-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-navy-700">{questions.length}</div>
                <div className="text-xs text-navy-500">Total</div>
              </div>
              <div className="w-px bg-navy-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{earnedPoints}</div>
                <div className="text-xs text-navy-500">Points Earned</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Review Questions */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Question Review
          </h3>
          {questions.map((q, idx) => {
            const correctOpt = q.options.find((o) => o.isCorrect);
            const userAnswer = selectedAnswers[q.id];
            const isCorrectAnswer = correctOpt && userAnswer === correctOpt.id;

            return (
              <Card key={q.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                        isCorrectAnswer
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      )}
                    >
                      {isCorrectAnswer ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-navy-900">
                        {idx + 1}. {q.text}
                      </h4>
                      <span className="text-xs text-navy-400">{q.points} points</span>
                    </div>
                  </div>

                  <div className="space-y-2 ml-10">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = userAnswer === opt.id;
                      const isCorrect = opt.isCorrect;
                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-lg border text-sm transition-all",
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                              : isUserChoice
                              ? "border-rose-300 bg-rose-50 text-rose-800"
                              : "border-navy-100 text-navy-600"
                          )}
                        >
                          <span className="font-bold w-5 text-center">
                            {OPTION_LETTERS[optIdx]}.
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isUserChoice && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 ml-10 p-3 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800">
                      <span className="font-semibold">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button onClick={onExit} size="lg" className="gap-2">
            <Edit3 className="w-4 h-4" /> Return to Editor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{quizTitle}</h1>
          <p className="text-navy-500 text-sm mt-1">
            {questions.length} questions • {totalPoints} total points • Pass: {passingScore}%
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onExit} size="sm">
            Exit Preview
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-navy-500 mb-1.5">
          <span>
            {answeredCount} of {questions.length} answered
          </span>
          <span>{Math.round((answeredCount / questions.length) * 100)}% complete</span>
        </div>
        <div className="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <Card
            key={q.id}
            className={cn(
              "transition-all duration-200",
              selectedAnswers[q.id] ? "border-primary-200" : ""
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-navy-900 leading-relaxed">
                    {q.text || "Untitled question"}
                  </h3>
                  <span className="text-xs text-navy-400 mt-1 block">{q.points} points</span>
                </div>
              </div>

              <div className="space-y-2.5 ml-10">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all duration-200 group",
                      selectedAnswers[q.id] === opt.id
                        ? "border-primary-400 bg-primary-50 shadow-sm"
                        : "border-navy-200 hover:border-navy-300 hover:bg-navy-50/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        selectedAnswers[q.id] === opt.id
                          ? "border-primary-600 bg-primary-600"
                          : "border-navy-300 group-hover:border-navy-400"
                      )}
                    >
                      {selectedAnswers[q.id] === opt.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="font-bold text-sm text-navy-500 w-5">
                      {OPTION_LETTERS[optIdx]}.
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        selectedAnswers[q.id] === opt.id
                          ? "text-primary-900"
                          : "text-navy-700"
                      )}
                    >
                      {opt.text || `Option ${OPTION_LETTERS[optIdx]}`}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-between items-center">
        <span className="text-sm text-navy-500">
          {questions.length - answeredCount > 0 && (
            <span className="text-amber-600 font-medium">
              ⚠ {questions.length - answeredCount} unanswered question(s)
            </span>
          )}
        </span>
        <Button
          onClick={() => setSubmitted(true)}
          size="lg"
          className="gap-2 shadow-md px-8"
        >
          <CheckCircle className="w-5 h-5" />
          Submit Quiz
        </Button>
      </div>
    </div>
  );
}

// ─── Main CreateQuiz Component ──────────────────────────────────────────────────
export function CreateQuiz() {
  const [quizTitle, setQuizTitle] = useState("Quiz: Core Concepts");
  const [passingScore, setPassingScore] = useState(80);
  const [showExplanations, setShowExplanations] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/quizzes/105", "instructor")
      .then((data) => {
        if (data) {
          setQuizTitle(data.title || "Quiz: Core Concepts");
          setPassingScore(data.passingScore || 80);
          setShowExplanations(data.showExplanations ?? true);
          setQuestions(data.questions || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading quiz:", err);
        setLoading(false);
      });
  }, []);

  const handleSaveQuiz = () => {
    setSaving(true);
    api.patch("/quizzes/105", {
      title: quizTitle,
      passingScore,
      showExplanations,
      questions,
    }, "instructor")
      .then(() => {
        setSaving(false);
        alert("Quiz saved successfully!");
      })
      .catch((err) => {
        console.error("Error saving quiz:", err);
        setSaving(false);
      });
  };

  // ─── Question Operations ────────────────────────────────────────────
  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const updateQuestion = (updatedQuestion) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  const deleteQuestion = (questionId) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const moveQuestion = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= questions.length) return;
    const newQuestions = [...questions];
    [newQuestions[fromIndex], newQuestions[toIndex]] = [
      newQuestions[toIndex],
      newQuestions[fromIndex],
    ];
    setQuestions(newQuestions);
  };

  // ─── Stats ──────────────────────────────────────────────────────────
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const questionsWithAnswer = questions.filter((q) =>
    q.options.some((o) => o.isCorrect)
  ).length;
  const allQuestionsValid =
    questions.every(
      (q) => q.text.trim() && q.options.some((o) => o.isCorrect) && q.options.every((o) => o.text.trim())
    );

  // ─── Preview Mode ──────────────────────────────────────────────────
  if (previewMode) {
    return (
      <QuizPreview
        questions={questions}
        quizTitle={quizTitle}
        passingScore={passingScore}
        onExit={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto pb-28">
      {/* Main Content */}
      <div className="flex-1 space-y-5">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-2 text-sm text-navy-500 mb-1">
            <Link
              to="/instructor/courses"
              className="hover:text-primary-600 transition-colors"
            >
              My Courses
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link
              to="/instructor/courses/1/content"
              className="hover:text-primary-600 transition-colors"
            >
              Curriculum
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-navy-700 font-medium">Quiz Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            Quiz Builder
          </h1>
          <p className="text-navy-500 mt-1">
            Create multiple choice questions and mark correct answers.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-navy-200/60 rounded-xl px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-navy-500 text-xs font-medium block">
                  Questions
                </span>
                <span className="font-bold text-navy-900">
                  {questions.length}
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-navy-200/50" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-navy-500 text-xs font-medium block">
                  Total Points
                </span>
                <span className="font-bold text-navy-900">{totalPoints}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-navy-200/50" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-navy-500 text-xs font-medium block">
                  Answers Set
                </span>
                <span className="font-bold text-navy-900">
                  {questionsWithAnswer}/{questions.length}
                </span>
              </div>
            </div>
          </div>

          {!allQuestionsValid && (
            <Badge variant="warning" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Some questions need attention
            </Badge>
          )}

          {allQuestionsValid && (
            <Badge variant="success" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              All questions ready
            </Badge>
          )}
        </div>

        {/* Question Cards */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              totalQuestions={questions.length}
              onUpdate={updateQuestion}
              onDelete={() => deleteQuestion(q.id)}
              onMoveUp={() => moveQuestion(idx, -1)}
              onMoveDown={() => moveQuestion(idx, 1)}
            />
          ))}
        </div>

        {/* Add Question Button */}
        <button
          onClick={addQuestion}
          className="w-full border-2 border-dashed border-navy-200 rounded-xl py-8 flex items-center justify-center gap-3 text-sm font-semibold text-navy-500 hover:text-primary-700 hover:border-primary-300 hover:bg-primary-50/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-all group-hover:scale-110">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <div>Add New Question</div>
            <div className="text-xs text-navy-400 font-normal mt-0.5">
              Multiple choice with 2–8 options
            </div>
          </div>
        </button>
      </div>

      {/* Right Settings Sidebar */}
      <div className="w-full lg:w-80 space-y-5 lg:sticky lg:top-6 lg:self-start">
        {/* Quiz Settings */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold text-navy-900 border-b border-navy-100 pb-2.5 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary-600" /> Quiz Settings
            </h3>

            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                Quiz Title
              </label>
              <Input
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-600 mb-1.5">
                Passing Score (%)
              </label>
              <Input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                min="0"
                max="100"
                className="h-9 text-sm"
              />
            </div>

            <div className="border-t border-navy-100 pt-3 space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-navy-700">
                  Show Explanations
                </span>
                <button
                  onClick={() => setShowExplanations(!showExplanations)}
                  className={cn(
                    "w-10 h-5.5 rounded-full transition-all duration-200 relative",
                    showExplanations ? "bg-primary-600" : "bg-navy-200"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-200",
                      showExplanations ? "left-[calc(100%-20px)]" : "left-0.5"
                    )}
                  />
                </button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-navy-900 border-b border-navy-100 pb-2.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
            </h3>

            <button
              onClick={() => {
                const validForPreview = questions.length > 0 && questions.some((q) => q.text.trim());
                if (validForPreview) setPreviewMode(true);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-navy-200 hover:border-primary-300 hover:bg-primary-50/30 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-navy-900">
                  Preview Quiz
                </div>
                <div className="text-xs text-navy-500">
                  Take the quiz as a student
                </div>
              </div>
            </button>

            <button
              onClick={addQuestion}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-navy-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-navy-900">
                  Add Question
                </div>
                <div className="text-xs text-navy-500">
                  Add a new MCQ
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-navy-900 border-b border-navy-100 pb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Readiness Checklist
            </h3>

            {[
              {
                label: "At least one question",
                ok: questions.length > 0,
              },
              {
                label: "All questions have text",
                ok: questions.every((q) => q.text.trim()),
              },
              {
                label: "All options have text",
                ok: questions.every((q) =>
                  q.options.every((o) => o.text.trim())
                ),
              },
              {
                label: "All questions have a correct answer",
                ok: questionsWithAnswer === questions.length,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-sm"
              >
                {item.ok ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-navy-300 shrink-0" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    item.ok ? "text-navy-600" : "text-navy-400"
                  )}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white/95 backdrop-blur-md border-t border-navy-200/60 p-3 px-6 z-10 flex justify-between items-center shadow-[0_-4px_16px_-2px_rgba(0,0,0,0.06)]">
        <Link to="/instructor/courses/1/content">
          <Button variant="ghost">Cancel</Button>
        </Link>
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm">
            <Save className="w-4 h-4 mr-1.5" /> Save Draft
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const validForPreview = questions.length > 0 && questions.some((q) => q.text.trim());
              if (validForPreview) setPreviewMode(true);
            }}
            className="shadow-sm"
          >
            <Eye className="w-4 h-4 mr-1.5" /> Preview
          </Button>
          <Link to="/instructor/courses/1/content">
            <Button className="shadow-sm">
              <CheckCircle className="w-4 h-4 mr-1.5" /> Save & Publish
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
