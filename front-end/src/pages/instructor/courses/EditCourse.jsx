import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  RefreshCw,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { api } from "../../../utils/api";

export function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Computer Science");
  const [level, setLevel] = useState("Advanced");

  // Thumbnail State
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get(`/courses/${id || 1}`, "instructor")
      .then((data) => {
        setCourse(data);
        setTitle(data.title || "");
        setSubtitle(data.subtitle || "");
        setDescription(data.description || "");
        setCategory(data.category || "Computer Science");
        setLevel(data.level || "Advanced");
        setThumbnail(data.image || "");
        setThumbnailName("course_cover.jpg");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading course:", err);
        setLoading(false);
      });
  }, [id]);

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setThumbnailName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    setSaving(true);
    api.patch(`/courses/${id || 1}`, {
      title,
      subtitle,
      description,
      category,
      level,
      image: thumbnail,
    }, "instructor")
      .then(() => {
        setSaving(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch((err) => {
        console.error("Error updating course:", err);
        setSaving(false);
      });
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading course...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-sm text-navy-500">
        <Link to="/instructor/courses" className="hover:text-primary-700">
          My Courses
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy-900 font-medium">Edit Course</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Edit Course Details</h1>
          <p className="text-navy-500 text-sm">
            Update your course title, description, and settings.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" /> Course changes saved successfully!
        </div>
      )}

      {/* Main Form */}
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Course Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced React Patterns"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Subtitle
            </label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="A brief tagline for your course"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-navy-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
              placeholder="Describe what students will learn in this course..."
            />
          </div>

          {/* Thumbnail Uploader */}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Course Thumbnail
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />

            {thumbnail ? (
              <div className="relative group rounded-xl overflow-hidden border border-navy-200 bg-navy-50 max-w-md">
                <img
                  src={thumbnail}
                  alt="Course Thumbnail Preview"
                  className="w-full h-48 object-cover"
                />
                <div className="p-3 bg-white border-t border-navy-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <ImageIcon className="w-4 h-4 text-navy-500 shrink-0" />
                    <span className="text-xs text-navy-700 font-medium truncate">
                      {thumbnailName || "thumbnail.jpg"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 text-xs text-primary-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setThumbnail(null);
                        setThumbnailName("");
                      }}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all max-w-md ${
                  dragActive
                    ? "border-primary-500 bg-primary-50/50"
                    : "border-navy-200 hover:border-navy-400 bg-navy-50/30"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-navy-100 text-navy-500 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-navy-900">
                  Click to upload thumbnail
                </p>
                <p className="text-xs text-navy-500 mt-1">PNG, JPG up to 5MB (16:9 ratio recommended)</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-navy-100">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-navy-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
              >
                <option>Computer Science</option>
                <option>Business</option>
                <option>Design</option>
                <option>Web Development</option>
                <option>Data Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full h-10 rounded-md border border-navy-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Actions */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-navy-200 p-4 px-8 z-10 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-navy-500">Status:</span>
          <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
            {course?.status || "Published"}
          </span>
        </div>
        <div className="flex gap-3">
          <Link to="/instructor/courses">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
