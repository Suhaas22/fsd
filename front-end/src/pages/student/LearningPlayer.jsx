import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  MessageSquare, 
  FileText, 
  Download, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  FastForward, 
  BookOpen, 
  Share2, 
  HelpCircle,
  Plus,
  Send,
  FileQuestion,
  Sparkles,
  ThumbsUp,
  Clock,
  ExternalLink,
  Layers,
  Check
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';

export default function LearningPlayer() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(252); // 04:12
  const totalTimeSec = 645; // 10:45
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'notes' | 'discussion' | 'transcript' | 'resources'
  
  // Real-time video play timer simulation
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      const speedMultiplier = parseFloat(playbackSpeed.replace('x', '')) || 1.0;
      timer = setInterval(() => {
        setCurrentTimeSec(prev => {
          if (prev >= totalTimeSec) {
            setIsPlaying(false);
            addToast('Lesson complete! Ready for next lecture or module quiz.', 'success');
            return totalTimeSec;
          }
          return prev + 1;
        });
      }, 1000 / speedMultiplier);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, addToast]);

  const formatSec = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [userNotes, setUserNotes] = useState([
    { id: 1, timeSec: 135, timeStr: "02:15", text: "Idempotency keys must be stored with a TTL of at least 24 hours in Redis cache." },
    { id: 2, timeSec: 250, timeStr: "04:10", text: "State transition diagram shows pending -> processing -> settled -> reconciled lifecycle." },
    { id: 3, timeSec: 420, timeStr: "07:00", text: "Exponential backoff formula: t = min(t_max, t_base * 2^attempt + jitter)." }
  ]);
  const [newNote, setNewNote] = useState('');

  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      author: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
      time: "2 hours ago",
      text: "How do we handle duplicate webhook callbacks when using high-concurrency message queues in banking integrations?",
      likes: 14,
      isLiked: false,
      replies: [
        {
          author: "Dr. Marcus Vance",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          text: "We use a distributed Redis lock per event_id with an immediate return of HTTP 200 once acknowledged.",
          time: "1 hour ago",
          isInstructor: true
        }
      ]
    },
    {
      id: 2,
      author: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
      time: "1 day ago",
      text: "The explanation of zero-knowledge token vaults at 06:30 is crystal clear. Great breakdown of HSM key rotations!",
      likes: 8,
      isLiked: false,
      replies: []
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const transcriptLines = [
    { start: 0, end: 45, text: "Welcome back to Module 2 of the NexusPay Enterprise Architecture series." },
    { start: 45, end: 120, text: "In this session, we examine how state transitions operate under high-concurrency payment volumes." },
    { start: 120, end: 200, text: "When a customer initiates an authorized charge, the gateway generates a cryptographically signed payload." },
    { start: 200, end: 290, text: "Notice how state management in NexusPay uses idempotent tokens to guarantee exactly-once processing." },
    { start: 290, end: 380, text: "Let us inspect the distributed locking mechanism implemented in the ledger reconciliation pipeline." },
    { start: 380, end: 500, text: "Finally, we configure webhook retry buffers with randomized exponential jitter to prevent cascading service downtime." },
    { start: 500, end: 645, text: "In the next lesson, we will run the live simulation code and take the module assessment quiz." }
  ];

  const handleAddNote = (e) => {
    e.preventDefault();
    if (newNote.trim()) {
      setUserNotes([
        ...userNotes,
        {
          id: Date.now(),
          timeSec: currentTimeSec,
          timeStr: formatSec(currentTimeSec),
          text: newNote
        }
      ]);
      setNewNote('');
      addToast(`Note saved at ${formatSec(currentTimeSec)}`, 'success');
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setDiscussions([
        {
          id: Date.now(),
          author: "Alex Chen",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          time: "Just now",
          text: newComment,
          likes: 0,
          isLiked: false,
          replies: []
        },
        ...discussions
      ]);
      setNewComment('');
      addToast('Your question has been posted to the course discussion!', 'success');
    }
  };

  const handleToggleLike = (id) => {
    setDiscussions(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          likes: d.isLiked ? d.likes - 1 : d.likes + 1,
          isLiked: !d.isLiked
        };
      }
      return d;
    }));
  };

  const handleScrubberClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newSec = Math.round(pos * totalTimeSec);
    setCurrentTimeSec(newSec);
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTimeSec / totalTimeSec) * 100));

  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Breadcrumb & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-outline-variant/60">
          <nav className="flex items-center gap-2 text-xs text-outline font-medium">
            <Link to="/my-learning" className="hover:text-primary transition-colors">My Learning</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/course-progress" className="hover:text-primary transition-colors">NexusPay Fundamentals</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-outline">Module 2</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-bold">2.3 State Management</span>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              to="/course-progress"
              className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
            >
              Course Milestones
            </Link>
            <Link
              to="/quiz"
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-container text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Take Assessment Quiz</span>
            </Link>
          </div>
        </div>

        {/* Main Two-Column Player Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Main Player Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Video Viewport Container (Dark Canvas for the video only) */}
            <div className="relative aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden shadow-elevation-2 border border-slate-800 group select-none">
              
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&auto=format&fit=crop&q=80"
                alt="Video Lesson Visual"
                className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-95' : 'opacity-75'}`}
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white border border-white/10">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span>{isPlaying ? 'PLAYING (1080p HD)' : 'PAUSED'}</span>
              </div>

              {/* Big Center Play Icon */}
              {!isPlaying && (
                <div 
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-primary hover:bg-primary-container text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>
              )}

              {/* Bottom Scrubber & Controls */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 space-y-2.5">
                
                {/* Scrubber Bar */}
                <div 
                  onClick={handleScrubberClick}
                  className="relative h-1.5 w-full bg-white/20 hover:h-2.5 rounded-full cursor-pointer overflow-hidden transition-all group/bar"
                >
                  <div 
                    className="h-full bg-primary rounded-full relative transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-100"></div>
                  </div>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between text-white text-xs pt-0.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1 hover:text-primary-fixed transition-colors"
                      title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>

                    <button
                      onClick={() => setCurrentTimeSec(Math.max(0, currentTimeSec - 10))}
                      className="p-1 text-slate-300 hover:text-white transition-colors"
                      title="Rewind 10s"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setCurrentTimeSec(Math.min(totalTimeSec, currentTimeSec + 10))}
                      className="p-1 text-slate-300 hover:text-white transition-colors"
                      title="Forward 10s"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 hover:text-primary-fixed transition-colors"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span className="font-mono text-xs text-slate-300 font-medium">
                      {formatSec(currentTimeSec)} / {formatSec(totalTimeSec)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-primary font-semibold cursor-pointer"
                    >
                      <option value="0.75x">0.75x</option>
                      <option value="1.0x">1.0x</option>
                      <option value="1.25x">1.25x</option>
                      <option value="1.5x">1.5x</option>
                      <option value="2.0x">2.0x</option>
                    </select>

                    <button 
                      onClick={() => addToast('Captions enabled: English', 'info')}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300"
                    >
                      CC
                    </button>

                    <button 
                      onClick={() => addToast('Fullscreen mode', 'info')}
                      className="p-1 text-slate-300 hover:text-white transition-colors" 
                      title="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Lesson Title & Clean Light Theme Info Box */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="primary" size="sm">Module 2 • Lesson 3</Badge>
                    <span className="text-xs text-outline font-medium">Dr. Marcus Vance • Principal Architect</span>
                  </div>
                  <h1 className="text-xl font-bold text-on-surface tracking-tight">
                    2.3 State Management in NexusPay
                  </h1>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => addToast('Lesson bookmarked for offline review', 'success')}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
                  >
                    Bookmark
                  </button>
                  <Link
                    to="/quiz"
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs transition-all"
                  >
                    Next: Module Quiz →
                  </Link>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed font-normal">
                Understand how transaction states transition through pending, authorized, captured, and settled statuses with atomic idempotency locks in enterprise payment gateways.
              </p>
            </div>

            {/* Bottom Tabs Workspace (Overview, Notes, Discussion, Transcript, Resources) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient">
              
              <div className="flex items-center gap-6 border-b border-outline-variant pb-3 mb-6 text-xs font-bold overflow-x-auto scrollbar-none">
                {[
                  { id: 'overview', label: 'Lesson Overview' },
                  { id: 'notes', label: `My Notes (${userNotes.length})` },
                  { id: 'transcript', label: 'Interactive Transcript' },
                  { id: 'discussion', label: `Q&A Forum (${discussions.length})` },
                  { id: 'resources', label: 'Blueprints & Downloads (2)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2 relative whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-primary font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs text-on-surface-variant leading-relaxed">
                  <h3 className="font-bold text-sm text-on-surface">Architectural Takeaways</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">1</div>
                      <h4 className="font-bold text-on-surface text-xs">Idempotency Key</h4>
                      <p className="text-[11px] text-on-surface-variant">Generate deterministic UUIDs on client requests to guard against duplicate captures.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-secondary-container text-secondary flex items-center justify-center font-bold text-xs">2</div>
                      <h4 className="font-bold text-on-surface text-xs">Append-Only Ledger</h4>
                      <p className="text-[11px] text-on-surface-variant">Record immutable double-entry debit/credit events rather than mutating row balances.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant space-y-1.5">
                      <div className="w-7 h-7 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center font-bold text-xs">3</div>
                      <h4 className="font-bold text-on-surface text-xs">Jittered Backoff</h4>
                      <p className="text-[11px] text-on-surface-variant">Implement randomized exponential retries on webhooks to prevent cascading downtime.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={`Add note at current time (${formatSec(currentTimeSec)})...`}
                      className="flex-1 px-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface placeholder:text-outline font-medium"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </button>
                  </form>

                  <div className="space-y-2">
                    {userNotes.map((note) => (
                      <div 
                        key={note.id} 
                        onClick={() => {
                          setCurrentTimeSec(note.timeSec);
                          setIsPlaying(true);
                        }}
                        className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant hover:border-primary/50 flex items-start gap-3 cursor-pointer transition-all group"
                      >
                        <button className="px-2 py-0.5 rounded-md bg-primary-fixed text-primary text-[11px] font-mono font-bold flex items-center gap-1 group-hover:bg-primary group-hover:text-white transition-colors">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{note.timeStr}</span>
                        </button>
                        <p className="text-xs text-on-surface pt-0.5 leading-relaxed">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Transcript */}
              {activeTab === 'transcript' && (
                <div className="space-y-3">
                  <p className="text-xs text-outline">Click any sentence to jump video playback to that timestamp:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {transcriptLines.map((line, idx) => {
                      const isActiveLine = currentTimeSec >= line.start && currentTimeSec < line.end;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setCurrentTimeSec(line.start);
                            setIsPlaying(true);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                            isActiveLine
                              ? 'bg-primary-fixed/50 border-primary text-primary font-semibold'
                              : 'bg-surface-container-low border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-primary font-bold pt-0.5">{formatSec(line.start)}</span>
                          <p className="leading-relaxed">{line.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Discussion */}
              {activeTab === 'discussion' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask the instructor or community a question..."
                      className="flex-1 px-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface placeholder:text-outline font-medium"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </form>

                  <div className="space-y-3">
                    {discussions.map((d) => (
                      <div key={d.id} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <img src={d.avatar} alt={d.author} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" />
                            <div>
                              <p className="font-bold text-xs text-on-surface">{d.author}</p>
                              <p className="text-[10px] text-outline">{d.time}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleToggleLike(d.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              d.isLiked ? 'bg-primary text-white' : 'bg-surface-container text-outline hover:text-on-surface'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{d.likes}</span>
                          </button>
                        </div>

                        <p className="text-xs text-on-surface leading-relaxed">{d.text}</p>

                        {/* Replies */}
                        {d.replies && d.replies.length > 0 && (
                          <div className="pl-3 border-l-2 border-primary/40 space-y-2 mt-2 pt-1">
                            {d.replies.map((r, rIdx) => (
                              <div key={rIdx} className="flex items-start gap-2 text-xs">
                                <img src={r.avatar} alt={r.author} className="w-6 h-6 rounded-full object-cover" />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-primary">{r.author}</span>
                                    {r.isInstructor && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold">Instructor</span>
                                    )}
                                  </div>
                                  <p className="text-on-surface-variant mt-0.5">{r.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Resources */}
              {activeTab === 'resources' && (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-xs">NexusPay_State_Machine_Specification.pdf</p>
                        <p className="text-[10px] text-outline">1.4 MB • Architectural Blueprint</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => addToast('Downloading State Machine Blueprint PDF...', 'success')}
                      className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-secondary-container text-secondary flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-xs">Idempotency_Middleware_Snippet.ts</p>
                        <p className="text-[10px] text-outline">14 KB • Production TypeScript Code</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => addToast('Downloading TypeScript middleware snippet...', 'success')}
                      className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-secondary flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Syllabus / Course Navigation Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-ambient space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <h3 className="font-bold text-sm text-on-surface">Course Syllabus</h3>
                <span className="text-xs font-bold text-primary">60% Complete</span>
              </div>

              {/* Modules list */}
              <div className="space-y-2.5 text-xs">
                
                {/* Module 1 (Done) */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant">
                  <div className="flex items-center justify-between font-bold text-on-surface mb-1">
                    <span>Module 1: Foundations</span>
                    <span className="text-secondary font-bold text-[11px]">✓ Done</span>
                  </div>
                  <p className="text-[10px] text-outline">4 of 4 lessons completed</p>
                </div>

                {/* Module 2 (Active) */}
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/40 space-y-2">
                  <div className="flex items-center justify-between font-bold text-primary">
                    <span>Module 2: Advanced Logic</span>
                    <span className="text-[11px] font-bold text-on-surface-variant bg-primary-fixed px-2 py-0.5 rounded-full">2/4 Done</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div 
                      onClick={() => addToast('Currently playing 2.3 State Management', 'info')}
                      className="p-2 rounded-xl bg-primary text-white font-bold shadow-xs flex items-center justify-between cursor-pointer text-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <Play className="w-3 h-3 fill-current animate-pulse" />
                        2.3 State Management
                      </span>
                      <span className="text-[10px] font-mono opacity-90">{formatSec(currentTimeSec)}</span>
                    </div>

                    <div 
                      onClick={() => {
                        addToast('Loaded Lesson 2.4: Webhooks & Retries', 'success');
                        setCurrentTimeSec(0);
                      }}
                      className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container flex items-center justify-between cursor-pointer transition-colors text-xs"
                    >
                      <span>2.4 Webhooks & Exponential Retries</span>
                      <span className="text-[10px] text-outline">25m</span>
                    </div>

                    <Link
                      to="/quiz"
                      className="p-2 rounded-xl text-tertiary font-bold hover:bg-tertiary-fixed/30 flex items-center justify-between transition-colors text-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileQuestion className="w-3.5 h-3.5" />
                        Module 2 Graded Quiz
                      </span>
                      <span className="text-[10px] text-tertiary font-bold">15m</span>
                    </Link>
                  </div>
                </div>

                {/* Module 3 (Next) */}
                <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant opacity-60">
                  <div className="flex items-center justify-between font-bold text-on-surface mb-0.5">
                    <span>Module 3: High-Throughput Clearing</span>
                    <span className="text-outline text-[11px]">Locked</span>
                  </div>
                  <p className="text-[10px] text-outline">Unlocks after Module 2 Quiz</p>
                </div>

              </div>

              {/* Navigation CTAs */}
              <div className="pt-3 border-t border-outline-variant flex items-center justify-between gap-2.5">
                <button
                  onClick={() => addToast('Already on the current active lecture', 'info')}
                  className="flex-1 py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center justify-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <Link
                  to="/quiz"
                  className="flex-1 py-2 px-3 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary-container shadow-xs transition-all"
                >
                  <span>Take Quiz</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>

        </div>

      </div>
    </PageLayout>
  );
}
