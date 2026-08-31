// StudyPlan
// |-- StudyPlanSummary
// |-- PlanCard
//     |-- LessonRow

/*

Props
StudyPlan passes shared data and callback functions to its child components.
- StudyPlanSummary receives:
  - completedCount
  - totalCount
  - onReset
- PlanCard receives:
  - plan
  - completedLessonIds
  - onToggleLesson
- LessonRow receives:
  - lesson
  - isComplete
  - onToggleLesson

Callback functions
Child components communicate with the parent through callbacks.
- When a student clicks a lesson, LessonRow calls onToggleLesson(lesson.id).
- The callback runs in StudyPlan and updates completedLessonIds.
- When the student clicks Reset week, StudyPlanSummary calls onReset().

Lifted state
The common parent, StudyPlan, owns completedLessonIds because the summary,
course cards, and lesson rows all depend on the same completion state.
- completedLessonIds - lessons completed during the current study week

*/

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Clock3, ListChecks, RotateCcw } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';

const studyPlan = [
  {
    id: 'payments',
    title: 'Enterprise Payment Systems',
    course: 'Advanced API Integrations',
    color: 'bg-primary',
    lessons: [
      { id: 'payments-1', title: 'Review idempotency keys', duration: '25 min' },
      { id: 'payments-2', title: 'Practice webhook retries', duration: '40 min' },
      { id: 'payments-3', title: 'Complete the ledger checkpoint', duration: '30 min' },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud Architecture Sprint',
    course: 'Advanced AWS Solutions Architect',
    color: 'bg-secondary',
    lessons: [
      { id: 'cloud-1', title: 'Map a multi-region VPC', duration: '35 min' },
      { id: 'cloud-2', title: 'Take the IAM knowledge check', duration: '20 min' },
    ],
  },
];

function LessonRow({ lesson, isComplete, onToggleLesson }) {
  return (
    <li className="flex items-center justify-between gap-4 border-t border-outline-variant/60 py-4">
      <button
        type="button"
        onClick={() => onToggleLesson(lesson.id)}
        aria-pressed={isComplete}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        {isComplete ? <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" /> : <Circle className="h-5 w-5 shrink-0 text-outline" />}
        <span className={isComplete ? 'text-sm text-on-surface-variant line-through' : 'text-sm font-semibold text-on-surface'}>{lesson.title}</span>
      </button>
      <span className="flex shrink-0 items-center gap-1 text-xs text-on-surface-variant"><Clock3 className="h-3.5 w-3.5" />{lesson.duration}</span>
    </li>
  );
}

function PlanCard({ plan, completedLessonIds, onToggleLesson }) {
  const completedCount = plan.lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  const progress = Math.round((completedCount / plan.lessons.length) * 100);

  return (
    <article className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-ambient">
      <div className="flex items-start gap-4 p-5">
        <div className={`h-10 w-10 shrink-0 rounded-xl ${plan.color} flex items-center justify-center text-white`}><ListChecks className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">{plan.course}</p>
          <h2 className="mt-1 text-lg font-bold text-on-surface">{plan.title}</h2>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${progress}%` }} /></div>
            <span className="text-xs font-bold text-on-surface-variant">{progress}%</span>
          </div>
        </div>
      </div>
      <ul className="px-5 pb-2">
        {plan.lessons.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} isComplete={completedLessonIds.includes(lesson.id)} onToggleLesson={onToggleLesson} />)}
      </ul>
    </article>
  );
}

function StudyPlanSummary({ completedCount, totalCount, onReset }) {
  return (
    <section className="rounded-2xl bg-on-surface p-6 text-white shadow-ambient">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-primary-fixed">This week</p><h2 className="mt-1 text-2xl font-black">Keep your momentum</h2><p className="mt-1 text-sm text-surface-container-high">{completedCount} of {totalCount} planned lessons completed.</p></div>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-lg border border-surface-container-high px-3 py-2 text-xs font-bold hover:bg-surface-container-high/10"><RotateCcw className="h-4 w-4" />Reset week</button>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-container-high/30"><div className="h-full rounded-full bg-primary-fixed transition-all" style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }} /></div>
    </section>
  );
}

export default function StudyPlan() {
  const [completedLessonIds, setCompletedLessonIds] = useState(['payments-1']);
  const totalCount = useMemo(() => studyPlan.reduce((count, plan) => count + plan.lessons.length, 0), []);

  const toggleLesson = (lessonId) => {
    setCompletedLessonIds((ids) => ids.includes(lessonId) ? ids.filter((id) => id !== lessonId) : [...ids, lessonId]);
  };

  const resetWeek = () => setCompletedLessonIds([]);

  return (
    <PageLayout>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-8">
        <header><p className="text-xs font-bold uppercase tracking-wider text-primary">Learning workspace</p><h1 className="mt-2 text-3xl font-black text-on-surface">My study plan</h1><p className="mt-1 text-sm text-on-surface-variant">A focused list of lessons for your next learning sprint.</p></header>
        <StudyPlanSummary completedCount={completedLessonIds.length} totalCount={totalCount} onReset={resetWeek} />
        <section className="space-y-4" aria-label="Planned courses">{studyPlan.map((plan) => <PlanCard key={plan.id} plan={plan} completedLessonIds={completedLessonIds} onToggleLesson={toggleLesson} />)}</section>
      </main>
    </PageLayout>
  );
}

/*

Component responsibilities
- StudyPlanSummary displays the weekly completion total and reset action.
- PlanCard displays one course plan and calculates its progress.
- LessonRow renders one lesson and reports completion changes to StudyPlan.

*/