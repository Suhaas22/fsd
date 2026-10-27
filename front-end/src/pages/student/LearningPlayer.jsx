import {formatDuration} from '../../utils/duration';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  PlayCircle,
  Video,
  FileText,
  Clock,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { LinearProgressBar } from '../../components/common/ProgressBar';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import { useStudent } from '../../context/StudentContext';

export default function LearningPlayer() {
  const { courseId } = useParams();
  const { addToast } = useToast();
  const { refreshData } = useStudent();
  const videoRef = useRef(null);

  const [assessment,setAssessment]=useState(null);
  const [lessons,setLessons]=useState([]);
  const [loadError,setLoadError]=useState('');
  const [revision,setRevision]=useState(0);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(()=>{let active=true;setLoading(true);setLoadError('');setNotEnrolled(false);
    api.get(`/student/courses/${encodeURIComponent(courseId)}/content`).then(data=>{if(!active)return;setCourse(data.course);setEnrollment(data.enrollment);setLessons(data.lessons);setAssessment(data.assessment);if(data.course?.title)document.title=`${data.course.title} | Acadex`;}).catch(e=>{if(!active)return;setLoadError(e.message);setNotEnrolled(e.status===403||e.status===404);setCourse(null);setEnrollment(null);setLessons([]);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};
  },[courseId,revision]);

  const done = useMemo(() => new Set((enrollment?.completedLessons || []).map(String)), [enrollment]);

  useEffect(() => {
    if (lessons.length > 0) {
      if (!currentId || !lessons.some((l) => l.id === currentId)) {
        const next = lessons.find((l) => !done.has(l.id)) || lessons[0];
        setCurrentId(next.id);
      }
    }
  }, [lessons, done, currentId]);

  const currentIndex = lessons.findIndex((l) => l.id === currentId);
  const current = (currentIndex >= 0 ? lessons[currentIndex] : null) || lessons[0] || null;

  // Reset video error state whenever lesson changes
  useEffect(() => {
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [currentId]);

  useEffect(()=>{if(!currentId||!enrollment||!current||!(current.videoUrl||current.description||current.resourceUrl))return;let seconds=0;const tick=setInterval(()=>{if(document.visibilityState!=='visible')return;const video=videoRef.current;if(current?.videoUrl&&(!video||video.paused||video.ended))return;seconds+=1;if(seconds===30){seconds=0;api.post(`/student/courses/${courseId}/activity`,{lessonId:currentId,seconds:30}).catch(e=>console.warn('Activity could not be recorded:',e.message));}},1000);return()=>clearInterval(tick);},[courseId,currentId,enrollment?.id,current?.videoUrl,current?.description,current?.resourceUrl]);

  const toggleComplete = async (lesson, completed) => {
    if (!lesson || !enrollment || saving) return;
    setSaving(true);
    try {
      const wasCompleted = enrollment.status === 'Completed';
      const updated = await api.student.updateProgress(enrollment.id, lesson.id, completed);
      setEnrollment(updated);
      if (updated.status === 'Completed' && !wasCompleted) {
        addToast('Course completed! Your certificate has been issued.', 'success');
      } else {
        addToast(completed ? 'Lesson marked as complete' : 'Lesson marked as incomplete', 'success');
      }
      if (completed && currentIndex < lessons.length - 1) {
        setCurrentId(lessons[currentIndex + 1].id);
      }
      await refreshData();
    } catch (err) {
      addToast(err.message || 'Could not save progress', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent" />
        </div>
      </PageLayout>
    );
  }

  if(loadError&&!notEnrolled)return <PageLayout><div className="learner-page"><p role="alert" className="workspace-error">{loadError}</p><button className="admin-button mt-5" onClick={()=>setRevision(v=>v+1)}>Try again</button></div></PageLayout>;
  if (notEnrolled || !course || !enrollment) {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto py-20 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">You are not enrolled in this course</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">Enroll now to access the full course curriculum and lessons.</p>
          <Link
            to={`/student/course/${courseId}`}
            className="inline-block px-5 py-2.5 bg-[#0056D2] text-white text-xs font-bold rounded-lg hover:bg-[#00419E] transition-colors"
          >
            View course details
          </Link>
        </div>
      </PageLayout>
    );
  }

  const isDone = current ? done.has(current.id) : false;
  const calculatedProgress = lessons.length > 0
    ? Math.min(100, Math.max(0, Math.round((done.size / lessons.length) * 100)))
    : (enrollment.progress || 0);
  const completedCourse = enrollment.status === 'Completed' || (lessons.length > 0 && done.size === lessons.length);

  return (
    <PageLayout>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 space-y-5">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/student/my-learning" className="hover:text-[#0056D2]">My learning</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-slate-900 font-semibold truncate">{course.title}</span>
        </nav>

        {completedCourse && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-900">You completed this course</p>
                <p className="text-xs text-emerald-700">
                  Certificate {enrollment.certificateId ? `#${enrollment.certificateId}` : ''} has been issued to your account.
                </p>
              </div>
            </div>
            <Link
              to="/student/certificates"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold text-center hover:bg-emerald-700 transition-colors shrink-0"
            >
              View certificate
            </Link>
          </div>
        )}

        {assessment&&<section className="admin-card flex flex-wrap items-center justify-between gap-4"><div><p className="learner-kicker">Published assessment</p><h2 className="text-sm font-semibold mt-2">{assessment.title}</h2></div><Link className="admin-button" to={`/student/quiz?courseId=${courseId}`}>Open assessment<ChevronRight size={14}/></Link></section>}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 space-y-4">
            {lessons.length === 0 || !current ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No lessons published yet</p>
                <p className="text-xs text-slate-500 mt-1">The instructor has not added lessons to this course yet.</p>
              </div>
            ) : (
              <>
                {/* Real HTML5 Video Player */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative shadow-lg">
                  {current.isDemo&&<div className="learner-record-note mb-4">{current.mediaLabel||'Demo video · sample playback'} — sample content for demonstrating playback.</div>}
                  {current.type === 'reading' || !current.videoUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-8 text-center">
                      <FileText className="w-14 h-14 text-blue-400 mb-3" />
                      <p className="text-xs uppercase tracking-widest text-slate-400">Reading Lesson</p>
                      <h2 className="text-xl font-bold mt-1 max-w-lg">{current.title}</h2>
                      <p className="text-xs text-slate-300 mt-3 max-w-md">
                        {current.description || (current.resourceUrl?'Open the published lesson material below.':'Lesson material has not been published yet.')}
                      </p>
                      {current.resourceUrl&&<a className="admin-button mt-5" href={current.resourceUrl} target="_blank" rel="noreferrer">Open lesson material</a>}
                    </div>
                  ) : videoError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-6 text-center">
                      <PlayCircle className="w-12 h-12 text-slate-500 mb-2" />
                      <p className="text-sm font-semibold text-slate-300">Video source temporarily unavailable</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">The media URL could not be loaded directly by your browser.</p>
                      <button
                        onClick={() => {
                          setVideoError(false);
                          if (videoRef.current) {
                            videoRef.current.src = current.videoUrl;
                            videoRef.current.load();
                          }
                        }}
                        className="mt-3 px-3 py-1.5 rounded bg-blue-600 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retry video
                      </button>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      key={current.id}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                      poster={course.thumbnail}
                      onError={() => setVideoError(true)}
                      onEnded={() => {
                        if (!isDone) toggleComplete(current, true);
                      }}
                    >
                      <source src={current.videoUrl} />
                      Your browser does not support HTML5 video playback.
                    </video>
                  )}
                </div>

                {/* Lesson Controls & Description Header */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">
                      Module {current.moduleIndex + 1}: {current.moduleTitle} • Lesson {currentIndex + 1} of {lessons.length}
                    </p>
                    <h1 className="text-lg font-bold text-slate-900 truncate mt-0.5">{current.title}</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{current.duration ? formatDuration(current.duration) : 'Duration not recorded'}</span>
                      <span>•</span>
                      <span className="capitalize">{current.type || 'Course'} lesson</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={currentIndex <= 0}
                      onClick={() => setCurrentId(lessons[currentIndex - 1].id)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      aria-label="Previous lesson"
                      title="Previous lesson"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => toggleComplete(current, !isDone)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-[#0056D2] text-white hover:bg-[#00419E]'
                      }`}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : (isDone ? 'Completed — undo' : 'Mark as complete')}
                    </button>
                    <button
                      disabled={currentIndex >= lessons.length - 1}
                      onClick={() => setCurrentId(lessons[currentIndex + 1].id)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      aria-label="Next lesson"
                      title="Next lesson"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lesson Description & Details */}
                {current.description && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">About this lesson</h2>
                    <p className="text-sm text-slate-700 leading-relaxed">{current.description}</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Curriculum Sidebar */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>
                  {done.size} of {lessons.length} lessons completed
                </span>
                <span className="text-[#0056D2] font-bold">{calculatedProgress}%</span>
              </div>
              <LinearProgressBar progress={calculatedProgress} color={completedCourse ? 'bg-emerald-600' : 'bg-[#0056D2]'} />
            </div>

            <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100">
              {(course.modules || []).map((mod, mIdx) => {
                const modId = mod?.id || `mod-${mIdx + 1}`;
                const modLessons = lessons.filter((l) => l.moduleId === modId || l.moduleId === mod?.id);
                const modDone = modLessons.filter((l) => done.has(l.id)).length;
                return (
                  <div key={modId} className="border-b border-slate-100 last:border-0">
                    <div className="px-4 py-3 bg-slate-50 flex justify-between items-center sticky top-0 z-10 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {mIdx + 1}. {mod?.title || `Module ${mIdx + 1}`}
                      </p>
                      <span className="text-[11px] text-slate-500 shrink-0 ml-2 font-mono">
                        {modDone}/{modLessons.length}
                      </span>
                    </div>
                    <div className="py-1">
                      {modLessons.map((l) => {
                        const isSelected = l.id === currentId;
                        const lessonCompleted = done.has(l.id);
                        return (
                          <button
                            key={l.id}
                            onClick={() => setCurrentId(l.id)}
                            className={`w-full px-4 py-2.5 flex items-center justify-between gap-2.5 text-left text-xs transition-colors ${
                              isSelected
                                ? 'bg-blue-50/80 text-[#0056D2] font-semibold border-l-4 border-[#0056D2]'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {lessonCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                              )}
                              <span className="truncate">{l.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 font-mono">
                              {l.type === 'reading' ? (
                                <FileText className="w-3 h-3 text-slate-400" />
                              ) : (
                                <Video className="w-3 h-3 text-slate-400" />
                              )}
                              <span>{formatDuration(l.duration)}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
}
