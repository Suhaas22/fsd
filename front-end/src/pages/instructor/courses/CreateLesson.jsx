import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import { PlayCircle, FileText, UploadCloud, Paperclip } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";

export function CreateLesson() {
  const navigate = useNavigate();
  const [lessonType, setLessonType] = useState('video');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    setSaving(true);

    api.get("/courses/1", "instructor")
      .then((course) => {
        const currentModules = course.modules || [];
        if (currentModules.length > 0) {
          const firstMod = currentModules[0];
          const newItem = {
            id: Date.now(),
            type: lessonType === 'video' ? 'Video' : 'Reading',
            title,
            duration: Number(duration) || 10,
            fileName: lessonType === 'video' ? 'lesson_video.mp4' : 'lesson_reading.pdf',
            fileSize: '15.4 MB',
            url: '',
          };
          firstMod.items = [...(firstMod.items || []), newItem];
        }
        return api.patch("/courses/1", {
          modules: currentModules,
        }, "instructor");
      })
      .then(() => {
        navigate("/instructor/courses/1/content");
      })
      .catch((err) => {
        console.error("Error creating lesson:", err);
        setSaving(false);
      });
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Create Lesson</h1>
        <p className="text-navy-500">Add content to Module 1 — Introduction to React Patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Lesson Title</label>
                <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Setting up the Development Environment" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-3">Content Type</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setLessonType('video')}
                    className={cn(
                      "flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all",
                      lessonType === 'video' 
                        ? "border-primary-600 bg-primary-50 text-primary-700" 
                        : "border-navy-200 hover:border-primary-300 text-navy-600"
                    )}
                  >
                    <PlayCircle className="w-8 h-8" />
                    <span className="font-medium text-sm">Video</span>
                  </button>
                  <button 
                    onClick={() => setLessonType('reading')}
                    className={cn(
                      "flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all",
                      lessonType === 'reading' 
                        ? "border-primary-600 bg-primary-50 text-primary-700" 
                        : "border-navy-200 hover:border-primary-300 text-navy-600"
                    )}
                  >
                    <FileText className="w-8 h-8" />
                    <span className="font-medium text-sm">Reading</span>
                  </button>
                </div>
              </div>

              {lessonType === 'video' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-navy-700 mb-1">Estimated Duration (minutes)</label>
                  <Input 
                    type="number" 
                    value={duration} 
                    onChange={e => setDuration(e.target.value)} 
                  />
                  <div className="border-2 border-dashed border-navy-200 rounded-xl p-8 text-center hover:border-primary-500 hover:bg-primary-50/20 transition-all cursor-pointer">
                    <UploadCloud className="w-10 h-10 text-navy-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-navy-900">Upload video file</p>
                    <p className="text-xs text-navy-500 mt-1">MP4, MOV up to 2GB</p>
                  </div>
                </div>
              )}

              {lessonType === 'reading' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-navy-700 mb-1">Reading Content (Markdown)</label>
                  <textarea 
                    rows={6}
                    className="w-full rounded-md border border-navy-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <h3 className="font-bold text-navy-900">Publish Settings</h3>
              <div className="flex items-center justify-between text-sm text-navy-700">
                <span>Free Preview</span>
                <input type="checkbox" className="rounded text-primary-600" />
              </div>
              <div className="flex items-center justify-between text-sm text-navy-700">
                <span>Downloadable</span>
                <input type="checkbox" className="rounded text-primary-600" defaultChecked />
              </div>
              <div className="pt-4 border-t border-navy-100 flex flex-col gap-2">
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Lesson"}
                </Button>
                <Link to="/instructor/courses/1/content" className="w-full">
                  <Button variant="outline" className="w-full">Cancel</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
