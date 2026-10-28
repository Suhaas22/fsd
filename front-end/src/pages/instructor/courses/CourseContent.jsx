import { durationMinutes, formatDuration } from '../../../utils/duration';
import '../../../styles/curriculum-controls.css';
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
} from '../../../components/common';
import { cn } from '../../../utils/cn';
import { api } from '../../../utils/api';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Trash2,
  PlayCircle,
  BookOpen,
  Plus,
  X,
  Save,
  HelpCircle,
  Eye,
  MoreHorizontal,
  ArrowLeft,
  Target,
  Layers,
  Upload,
  FileText,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getTotalDuration(modules = []) {
  return (modules || []).reduce((total, mod) => {
    const items = Array.isArray(mod?.items)
      ? mod.items
      : Array.isArray(mod?.lessons)
        ? mod.lessons
        : [];
    return (
      total +
      items.reduce((sum, item) => sum + durationMinutes(item?.duration), 0)
    );
  }, 0);
}

function getTotalItems(modules = []) {
  return (modules || []).reduce(
    (total, mod) => total + (Array.isArray(mod?.items) ? mod.items.length : 0),
    0,
  );
}

// ─── Icon Mapping ────────────────────────────────────────────────────────────────
const typeConfig = {
  Video: {
    icon: PlayCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'Video',
  },
  Reading: {
    icon: BookOpen,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Reading',
  },
  Quiz: {
    icon: HelpCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Quiz',
  },
};

// ─── Add Item Dropdown ──────────────────────────────────────────────────────────
function AddItemDropdown({ onAdd, position = 'bottom' }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const items = [
    { type: 'Video', icon: PlayCircle, desc: 'Upload or link a video lesson' },
    { type: 'Reading', icon: BookOpen, desc: 'Add a text-based reading' },
    { type: 'Quiz', icon: HelpCircle, desc: 'Create a graded assessment' },
  ];

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-primary-700 transition-colors group"
      >
        <div
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200',
            open
              ? 'bg-primary-600 text-white rotate-45 scale-110'
              : 'bg-slate-800 text-white group-hover:bg-primary-600 group-hover:scale-110',
          )}
        >
          <Plus
            className="w-3 h-3"
            strokeWidth={3}
          />
        </div>
        Add content
      </button>

      {open && (
        <div
          className={cn(
            'absolute left-0 z-50 w-72 bg-white rounded-xl border border-slate-200/60 shadow-elevated p-1.5 animate-in fade-in slide-in-from-top-2 duration-200',
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Add new item
          </div>
          {items.map((item) => (
            <button
              key={item.type}
              onClick={() => {
                onAdd(item.type);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group/item"
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110',
                  typeConfig[item.type].bg,
                  typeConfig[item.type].color,
                )}
              >
                <item.icon
                  className="w-4.5 h-4.5"
                  strokeWidth={1.8}
                />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {item.type}
                </div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline Editable Text ───────────────────────────────────────────────────────
function InlineEdit({
  value,
  onChange,
  className,
  placeholder,
  multiline = false,
  inputClassName,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(String(value ?? ''));
  }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) onChange(draft.trim());
  };

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft(String(value ?? ''));
              setEditing(false);
            }
          }}
          className={cn(
            'w-full rounded-lg border border-primary-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none min-h-[80px] transition-all',
            inputClassName,
          )}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(String(value ?? ''));
            setEditing(false);
          }
        }}
        className={cn(
          'w-full rounded-lg border border-primary-300 bg-white px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all',
          inputClassName,
        )}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={cn(
        'curriculum-inline cursor-text rounded-md px-1.5 py-0.5 -mx-1.5 transition-colors border border-transparent inline-block',
        className,
      )}
      title="Click to edit"
    >
      {value || <span className="text-slate-400 italic">{placeholder}</span>}
    </span>
  );
}

// ─── File Upload Modal ──────────────────────────────────────────────────────────
function FileUploadModal({ item, courseId, onClose, onSave }) {
  const isVideo = item?.type === 'Video';
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fileName, setFileName] = useState(item?.fileName || '');
  const [fileSize, setFileSize] = useState(item?.fileSize || '');
  const existingPath = item?.videoUrl || item?.resourceUrl || item?.url || '';
  const [previewUrl, setPreviewUrl] = useState(existingPath);
  const [previewError, setPreviewError] = useState(false);
  useEffect(() => {
    if (!selectedFile || !isVideo) return;
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setPreviewError(false);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile, isVideo]);
  const [lessonTitle, setLessonTitle] = useState(item?.title || '');
  const [duration, setDuration] = useState(durationMinutes(item?.duration));
  const fileInputRef = useRef(null);

  if (!item) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = (file) => {
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('Choose a file smaller than 100 MB.');
      return;
    }
    if (isVideo && !/\.(mp4|webm|mov|m4v)$/i.test(file.name)) {
      setUploadError('Choose an MP4, WebM, MOV or M4V video.');
      return;
    }
    setSelectedFile(file);
    setUploadError('');
    setFileName(file.name);
    setFileSize(formatBytes(file.size));
  };

  const handleSave = async () => {
    if (!lessonTitle.trim()) {
      setUploadError('Enter a lesson title.');
      return;
    }
    if (!selectedFile && !existingPath) {
      setUploadError('Choose a file to upload.');
      return;
    }
    if (isVideo && previewError) {
      setUploadError(
        'This video cannot play in your browser. Choose an MP4 with H.264 video or a supported WebM file.',
      );
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      let url = existingPath;
      if (selectedFile) {
        const form = new FormData();
        form.append('file', selectedFile);
        const uploaded = await api.post(`/courses/${courseId}/upload`, form);
        url = (uploaded.data || uploaded).path;
        if (!url)
          throw new Error('The server did not return an uploaded file.');
      }
      onSave({
        ...item,
        title: lessonTitle,
        duration: durationMinutes(duration),
        fileName,
        fileSize,
        url,
        videoUrl: isVideo ? url : null,
        resourceUrl: isVideo ? null : url,
        isDemo: false,
        mediaLabel: null,
      });
      onClose();
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90dvh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                isVideo
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-amber-100 text-amber-600',
              )}
            >
              {isVideo ? (
                <PlayCircle className="w-5 h-5" />
              ) : (
                <BookOpen className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isVideo ? 'Upload Video Content' : 'Upload Reading Material'}
              </h3>
              <p className="text-xs text-slate-500">
                Upload a file for this lesson
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Lesson Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Lesson Title
            </label>
            <Input
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Lesson title"
              className="h-10"
            />
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              {isVideo ? 'Video File' : 'Document / Reading File'}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={
                isVideo
                  ? '.mp4,.webm,.mov,.m4v'
                  : '.pdf,.png,.jpg,.jpeg,.gif,.webp'
              }
              onChange={handleChange}
              className="hidden"
            />
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={cn(
                'curriculum-upload-dropzone border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2',
                dragActive ? 'is-dragging' : fileName ? 'has-file' : '',
              )}
            >
              {fileName ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 break-all">
                    {fileName}
                  </p>
                  {fileSize && (
                    <p className="text-xs text-slate-500 mt-0.5">{fileSize}</p>
                  )}
                  <p className="text-xs text-primary-600 font-medium mt-2 hover:underline">
                    Click or drop to replace file
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to browse or drag and drop file here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isVideo
                      ? 'MP4, WebM, MOV or M4V · up to 100 MB'
                      : 'PDF or image · up to 100 MB'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {isVideo && previewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Video preview
              </p>
              <video
                key={previewUrl}
                controls
                preload="metadata"
                src={previewUrl}
                className="w-full rounded-lg bg-black max-h-56"
                onLoadedMetadata={(e) => {
                  setPreviewError(false);
                  if (selectedFile && Number.isFinite(e.currentTarget.duration))
                    setDuration(e.currentTarget.duration / 60);
                }}
                onError={() => setPreviewError(true)}
              />
              {previewError && (
                <p
                  role="alert"
                  className="text-sm text-rose-600"
                >
                  This video cannot play. Try an H.264 MP4 or a supported WebM
                  video.
                </p>
              )}
            </div>
          )}

          {/* Duration */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Estimated Duration (min)
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration in minutes"
                className="h-10"
              />
            </div>
          </div>
        </div>

        {uploadError && (
          <p
            className="workspace-error mx-6 mb-4"
            role="alert"
          >
            {uploadError}
          </p>
        )}
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Save file'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Curriculum Item Row ────────────────────────────────────────────────────────
function CurriculumItem({
  item,
  index,
  totalItems,
  courseId,
  moduleId,
  onUpdate,
  onDelete,
  onOpenUpload,
  onQuiz,
}) {
  const cfg = typeConfig[item.type] || typeConfig.Video;
  const IconComponent = cfg.icon;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const isUploadable = item.type === 'Video' || item.type === 'Reading';

  return (
    <div className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/50 group transition-colors">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div
          onClick={() => isUploadable && onOpenUpload(item)}
          className={cn(
            'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
            cfg.bg,
            isUploadable &&
              'cursor-pointer hover:ring-2 hover:ring-primary-400/50',
          )}
          title={
            isUploadable
              ? `Click to upload ${item.type.toLowerCase()} file`
              : undefined
          }
        >
          <IconComponent
            className={cn('w-4 h-4 sm:w-5 sm:h-5', cfg.color)}
            strokeWidth={1.8}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Badge
              variant="default"
              className="text-[10px] px-1.5 py-0 shrink-0 font-semibold uppercase tracking-wider"
            >
              {item.type}
            </Badge>
            <InlineEdit
              value={item.title}
              onChange={(val) => onUpdate({ ...item, title: val })}
              className="font-medium text-slate-900 truncate"
              placeholder="Untitled item"
            />
            {item.fileName && (
              <span
                onClick={() => isUploadable && onOpenUpload(item)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md px-1.5 py-0.5 cursor-pointer hover:bg-emerald-100 transition-colors"
                title="Click to manage file"
              >
                <FileText className="w-3 h-3" />
                <span className="max-w-[130px] truncate">{item.fileName}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <InlineEdit
                value={formatDuration(item.duration ?? 0)}
                onChange={(val) =>
                  onUpdate({ ...item, duration: durationMinutes(val) })
                }
                className="min-w-[48px] text-center"
                inputClassName="w-28 h-7 text-xs text-center"
              />
            </span>
            {isUploadable && (
              <button
                onClick={() => onOpenUpload(item)}
                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium hover:underline transition-colors"
              >
                <Upload className="w-3 h-3" />
                {item.fileName ? 'Change file' : 'Upload file'}
              </button>
            )}
            {item.type === 'Quiz' && (
              <button
                type="button"
                onClick={() => onQuiz(item, moduleId)}
                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium hover:underline transition-colors"
              >
                {item.quizId ? 'Edit quiz' : 'Create quiz'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Item Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0 ml-2">
        <div
          className="relative"
          ref={menuRef}
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-slate-200/60 shadow-elevated p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => {
                  onDelete();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Learning Objectives ────────────────────────────────────────────────────────
function LearningObjectives({ objectives, onChange }) {
  const [expanded, setExpanded] = useState(false);

  const addObjective = () => {
    onChange([...objectives, '']);
    setExpanded(true);
  };

  const updateObjective = (idx, val) => {
    const newObjs = [...objectives];
    newObjs[idx] = val;
    onChange(newObjs);
  };

  const removeObjective = (idx) => {
    onChange(objectives.filter((_, i) => i !== idx));
  };

  return (
    <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="curriculum-pale-icon w-8 h-8 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">
            Learning Objectives ({objectives.length})
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
          {objectives.map((obj, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 group"
            >
              <span className="text-xs font-semibold text-slate-400 w-5 shrink-0">
                {idx + 1}.
              </span>
              <Input
                value={obj}
                onChange={(e) => updateObjective(idx, e.target.value)}
                placeholder="e.g. Understand the fundamentals of..."
                className="flex-1 h-9 text-sm bg-slate-50/50 border-transparent focus:bg-white"
              />
              <button
                onClick={() => removeObjective(idx)}
                className="p-1 text-slate-300 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={addObjective}
            className="flex items-center gap-2 text-xs font-medium text-primary-600 hover:text-primary-700 mt-2 pl-7 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add objective
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Module Card ────────────────────────────────────────────────────────────────
function ModuleCard({
  module,
  index,
  totalModules,
  expanded,
  onToggle,
  onUpdate,
  onDelete,
  onOpenUpload,
  courseId,
  onQuiz,
}) {
  const items = Array.isArray(module?.items)
    ? module.items
    : Array.isArray(module?.lessons)
      ? module.lessons
      : [];
  const moduleDuration = items.reduce(
    (sum, item) => sum + durationMinutes(item?.duration),
    0,
  );

  const addItem = (type) => {
    const newItem = {
      id: crypto.randomUUID(),
      type,
      title: `New ${type}`,
      duration: type === 'Quiz' ? 15 : type === 'Reading' ? 10 : 12,
      fileName: '',
      fileSize: '',
      url: '',
    };
    onUpdate({ ...module, items: [...items, newItem] });
  };

  const updateItem = (updatedItem) => {
    onUpdate({
      ...module,
      items: items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    });
  };

  const deleteItem = (itemId) => {
    onUpdate({
      ...module,
      items: items.filter((item) => item.id !== itemId),
    });
  };

  return (
    <div
      className={cn(
        'bg-white border rounded-xl shadow-sm transition-all duration-200',
        expanded
          ? 'border-primary-200/60 shadow-card'
          : 'border-slate-200/60 hover:border-slate-300/80',
      )}
    >
      {/* Module Header */}
      <div className="flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onToggle}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
              expanded
                ? 'curriculum-pale-icon'
                : 'bg-slate-50 text-slate-500 hover:text-slate-700',
            )}
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <InlineEdit
                value={module.title}
                onChange={(val) => onUpdate({ ...module, title: val })}
                className="font-bold text-slate-900 truncate"
                placeholder="Module title"
                inputClassName="font-bold"
              />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center">
                <Layers className="w-3 h-3 mr-1" /> {items.length} items
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />{' '}
                {formatDuration(moduleDuration)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete module"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module Body */}
      {expanded && (
        <div className="border-t border-slate-100">
          <div className="px-5 sm:px-8 py-5 space-y-5">
            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Description
              </label>
              <InlineEdit
                value={module.description || ''}
                onChange={(val) => onUpdate({ ...module, description: val })}
                className="text-sm text-slate-700 leading-relaxed block w-full"
                placeholder="Click to add a module description..."
                multiline
              />
            </div>

            {/* Learning Objectives */}
            <LearningObjectives
              objectives={module.objectives || []}
              onChange={(objs) => onUpdate({ ...module, objectives: objs })}
            />

            {/* Items List */}
            {items.length > 0 && (
              <div className="border border-slate-200/60 rounded-xl divide-y divide-slate-100/80 overflow-hidden">
                {items.map((item, idx) => (
                  <CurriculumItem
                    key={item.id}
                    item={item}
                    index={idx}
                    totalItems={items.length}
                    onUpdate={updateItem}
                    onDelete={() => deleteItem(item.id)}
                    onOpenUpload={onOpenUpload}
                    onQuiz={onQuiz}
                    courseId={courseId}
                    moduleId={module.id}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/30">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  No content yet
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Add videos, readings or quizzes
                </p>
              </div>
            )}

            {/* Add Item */}
            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-200/50 flex-1" />
              <AddItemDropdown onAdd={addItem} />
              <div className="h-px bg-slate-200/50 flex-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export function CourseContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [expandedModules, setExpandedModules] = useState([1]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [uploadModalItem, setUploadModalItem] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [pending, setPending] = useState(null);
  const [saveError, setSaveError] = useState('');
  const dirty = useRef(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setRevision((r) => r + 1);
    window.addEventListener('focus', refresh);
    window.addEventListener('learning-data-changed', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('learning-data-changed', refresh);
    };
  }, []);

  useEffect(() => {
    dirty.current = false;
    setCourse(null);
    setModules([]);
    setLoading(true);
  }, [id]);
  useEffect(() => {
    let active = true;
    api
      .get(`/courses/${id}/editor`, 'instructor')
      .then((data) => {
        if (!active) return;
        if (!data) {
          setLoading(false);
          return;
        }
        setCourse(data);
        setPending(data.pendingModuleRequest);
        const rawModules = Array.isArray(data.modules) ? data.modules : [];
        const normalized = rawModules.map((mod, idx) => ({
          ...mod,
          id: mod.id || idx + 1,
          title: mod.title || `Module ${idx + 1}`,
          description: mod.description || '',
          objectives: Array.isArray(mod.objectives) ? mod.objectives : [],
          items: Array.isArray(mod.items)
            ? mod.items
            : Array.isArray(mod.lessons)
              ? mod.lessons
              : [],
        }));
        if (!dirty.current) setModules(normalized);
        if (normalized.length > 0) {
          setExpandedModules([normalized[0].id]);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setSaveError(err.message || 'Unable to load this course.');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, revision]);

  const updateModules = (newModules) => {
    dirty.current = true;
    setModules(newModules);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await api.put(`/courses/${id}/curriculum-draft`, { modules });
      setSavedSuccess(true);
      setSavedMessage('Draft saved. Learner content is unchanged.');
      dirty.current = false;
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };
  const handleSaveToBackend = () => {
    setSaving(true);
    setSaveError('');
    api
      .post(`/courses/${id}/module-requests`, { modules }, 'instructor')
      .then(() => {
        setSaving(false);
        setSavedSuccess(true);
        setSavedMessage('Changes submitted to your organization.');
        setPending({ status: 'Pending' });
        dirty.current = false;
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch((err) => {
        setSaveError(err.message || 'Unable to submit curriculum changes.');
        setSaving(false);
      });
  };

  const handleSaveUploadedFile = (updatedItem) => {
    setModules((prevModules) =>
      prevModules.map((mod) => {
        const modItems = Array.isArray(mod.items) ? mod.items : [];
        return {
          ...mod,
          items: modItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        };
      }),
    );
  };

  const toggleModule = (modId) => {
    setExpandedModules((prev) =>
      prev.includes(modId) ? prev.filter((m) => m !== modId) : [...prev, modId],
    );
  };

  const collapseAll = () => setExpandedModules([]);
  const expandAll = () => setExpandedModules(modules.map((m) => m.id));

  const addModule = () => {
    const newModule = {
      id: crypto.randomUUID(),
      title: `Module ${modules.length + 1}: New Module`,
      description: '',
      objectives: [],
      items: [],
    };
    const newModules = [...modules, newModule];
    updateModules(newModules);
    setExpandedModules((prev) => [...prev, newModule.id]);
  };

  const updateModule = (updatedModule) => {
    updateModules(
      modules.map((m) => (m.id === updatedModule.id ? updatedModule : m)),
    );
  };

  const deleteModule = (moduleId) => {
    updateModules(modules.filter((m) => m.id !== moduleId));
    setConfirmDelete(null);
  };

  const totalDuration = getTotalDuration(modules);
  const totalItems = getTotalItems(modules);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        Loading course curriculum...
      </div>
    );
  }

  if (!course)
    return (
      <div className="admin-card">
        <p
          role="alert"
          className="workspace-error"
        >
          {saveError || 'Course not found.'}
        </p>
        <Link
          className="admin-button mt-4"
          to="/instructor/courses"
        >
          My courses
        </Link>
      </div>
    );
  if (course.status === 'Archived')
    return (
      <div className="admin-card">
        <h1 className="text-lg font-semibold">{course.title}</h1>
        <p className="admin-muted mt-4">
          This course is archived. Its enrollment history is retained.
        </p>
        <Link
          to="/instructor/courses"
          className="admin-button mt-5"
        >
          My courses
        </Link>
      </div>
    );
  return (
    <div
      data-editor-style="neutral-v2"
      className="curriculum-editor max-w-5xl mx-auto pb-28"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {course?.title
              ? `${course.title} - Curriculum`
              : 'Course Curriculum'}
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/instructor/courses">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shadow-2xs border-slate-200 text-slate-700 hover:text-slate-900 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white border border-slate-200/60 rounded-xl px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="curriculum-pale-icon w-8 h-8 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-xs font-medium block">
                Modules
              </span>
              <span className="font-bold text-slate-900">{modules.length}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200/50" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-xs font-medium block">
                Items
              </span>
              <span className="font-bold text-slate-900">{totalItems}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200/50" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-xs font-medium block">
                Total Duration
              </span>
              <span className="font-bold text-slate-900">
                {formatDuration(totalDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Module List */}
      <div className="space-y-4">
        {modules.map((mod, idx) => (
          <div
            key={mod.id}
            className="relative"
          >
            {confirmDelete === mod.id && (
              <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-rose-200">
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
                    <Trash2 className="w-5 h-5 text-rose-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">
                    Delete Module?
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 max-w-xs">
                    This will permanently delete "{mod.title}" and all{' '}
                    {Array.isArray(mod.items) ? mod.items.length : 0} items
                    inside it.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteModule(mod.id)}
                    >
                      Delete Module
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <ModuleCard
              module={mod}
              index={idx}
              totalModules={modules.length}
              expanded={expandedModules.includes(mod.id)}
              onToggle={() => toggleModule(mod.id)}
              onUpdate={updateModule}
              onDelete={() => setConfirmDelete(mod.id)}
              onOpenUpload={(item) => setUploadModalItem(item)}
              courseId={id || course.id}
              onQuiz={async (item, moduleId) => {
                setSaving(true);
                setSaveError('');
                try {
                  await api.put(`/courses/${id}/curriculum-draft`, { modules });
                  const params = new URLSearchParams({
                    courseId: id,
                    moduleId: String(moduleId),
                    itemId: String(item.id),
                  });
                  navigate(
                    item.quizId
                      ? `/instructor/courses/quiz/${item.quizId}/edit?${params}`
                      : `/instructor/courses/quiz/create?${params}`,
                  );
                } catch (e) {
                  setSaveError(e.message);
                } finally {
                  setSaving(false);
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Add Module Button */}
      <div className="mt-6">
        <button
          onClick={addModule}
          className="curriculum-add-module w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex items-center justify-center gap-3 text-sm font-semibold text-slate-500 transition-all group"
        >
          <div className="curriculum-pale-icon w-8 h-8 rounded-full flex items-center justify-center transition-colors">
            <Plus
              className="w-4 h-4"
              strokeWidth={2.5}
            />
          </div>
          Add new module
        </button>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="instructor-editor-actions fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 p-3 px-6 z-10 flex justify-between items-center shadow-[0_-4px_16px_-2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500">Status:</span>
          <Badge
            variant="success"
            className="font-semibold"
          >
            {course?.status || 'Status not recorded'}
          </Badge>
          <span className="hidden sm:inline text-sm text-slate-400">·</span>
          <span className="hidden sm:inline text-sm text-slate-500">
            {modules.length} modules · {totalItems} items ·{' '}
            {formatDuration(totalDuration)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {saveError && (
            <p
              role="alert"
              className="workspace-error"
            >
              {saveError}
            </p>
          )}
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              {savedMessage}
            </span>
          )}
          <Button
            onClick={handleSaveDraft}
            disabled={saving}
            variant="outline"
            size="sm"
          >
            Save draft
          </Button>
          <Button
            onClick={handleSaveToBackend}
            disabled={saving || !!pending}
            size="sm"
            className="shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" />{' '}
            {saving
              ? 'Saving…'
              : pending
                ? 'Awaiting organization approval'
                : 'Request organization approval'}
          </Button>
        </div>
      </div>

      {/* File Upload Modal */}
      {uploadModalItem && (
        <FileUploadModal
          item={uploadModalItem}
          courseId={id}
          onClose={() => setUploadModalItem(null)}
          onSave={handleSaveUploadedFile}
        />
      )}
    </div>
  );
}
