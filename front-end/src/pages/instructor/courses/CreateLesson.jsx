import { Card, CardContent, Button, Input } from '../../../components/common';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { PlayCircle, FileText, UploadCloud, Paperclip } from 'lucide-react';
import { useState, useRef } from 'react';
import { cn } from '../../../utils/cn';
import { api } from '../../../utils/api';

export function CreateLesson() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [lessonType, setLessonType] = useState('video');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(10);
  const [readingContent, setReadingContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Track the actual uploaded file
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (!courseId) {
      setError('Open a course from My courses first.');
      return;
    }
    setError('');
    setSaving(true);
    const targetModuleId = searchParams.get('moduleId');

    api
      .get(`/courses/${courseId}/editor`, 'instructor')
      .then(async (course) => {
        let uploadedUrl = '';
        if (uploadedFile) {
          const form = new FormData();
          form.append('file', uploadedFile);
          const result = await api.post(`/courses/${courseId}/upload`, form);
          uploadedUrl = (result.data || result).path;
          if (!uploadedUrl)
            throw new Error('The upload did not return a file URL.');
        }
        const currentModules = course.modules || [];
        if (currentModules.length > 0) {
          const targetMod = targetModuleId
            ? currentModules.find(
                (m) => String(m.id) === String(targetModuleId)
              ) || currentModules[0]
            : currentModules[0];
          const newItem = {
            id: Date.now(),
            type: lessonType === 'video' ? 'Video' : 'Reading',
            title,
            duration: Number(duration) || 10,
            videoUrl: lessonType === 'video' ? uploadedUrl : null,
            resourceUrl: lessonType === 'video' ? null : uploadedUrl,
            fileName: uploadedFile ? uploadedFile.name : '',
            fileSize: uploadedFile ? formatBytes(uploadedFile.size) : '',
            url: '',
            description: readingContent,
            content: readingContent,
          };
          targetMod.items = [...(targetMod.items || []), newItem];
        }
        return api.put(
          `/courses/${courseId}/curriculum-draft`,
          {
            modules: currentModules,
          },
          'instructor'
        );
      })
      .then(() => {
        navigate(`/instructor/courses/${courseId}/content`);
      })
      .catch((err) => {
        setError(err.message || 'Unable to save lesson draft.');
        setSaving(false);
      });
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create Lesson</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <p role="alert" className="workspace-error mb-4">
              {error}
            </p>
          )}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lesson Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Setting up the Development Environment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Content Type
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setLessonType('video')}
                    className={cn(
                      'flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all',
                      lessonType === 'video'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-primary-300 text-slate-600'
                    )}
                  >
                    <PlayCircle className="w-8 h-8" />
                    <span className="font-medium text-sm">Video</span>
                  </button>
                  <button
                    onClick={() => setLessonType('reading')}
                    className={cn(
                      'flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all',
                      lessonType === 'reading'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-slate-200 hover:border-primary-300 text-slate-600'
                    )}
                  >
                    <FileText className="w-8 h-8" />
                    <span className="font-medium text-sm">Reading</span>
                  </button>
                </div>
              </div>

              {lessonType === 'video' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estimated Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-navy-200 rounded-xl p-8 text-center hover:border-primary-500 hover:bg-primary-50/20 transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-10 h-10 text-navy-400 mx-auto mb-2" />
                    {uploadedFile ? (
                      <>
                        <p className="text-sm font-medium text-navy-900">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-navy-500 mt-1">
                          {formatBytes(uploadedFile.size)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-navy-900">
                          Upload video file
                        </p>
                        <p className="text-xs text-navy-500 mt-1">
                          MP4, MOV up to 2GB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {lessonType === 'reading' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reading Content (Markdown)
                  </label>
                  <textarea
                    rows={6}
                    value={readingContent}
                    onChange={(e) => setReadingContent(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Write your lesson text in markdown or upload a PDF..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-slate-900">Draft settings</h3>
              <p className="text-xs text-slate-500">
                Lessons are saved as a draft. Request organization approval from
                the course editor when your content is ready.
              </p>
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Saving...' : 'Save Lesson'}
                </Button>
                <Link
                  to={`/instructor/courses/${courseId}/content`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
