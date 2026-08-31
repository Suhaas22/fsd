import { useState, useRef } from "react";
import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Badge } from "../../../components/instructor/ui/Badge";
import {
  ChevronRight,
  Info,
  Settings,
  Eye,
  BookOpen,
  User,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";

export function CreateCourse() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Computer Science");
  const [level, setLevel] = useState("Intermediate");
  const [learnObjectives, setLearnObjectives] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [certificate, setCertificate] = useState(true);
  const [createdCourseId, setCreatedCourseId] = useState("1");

  // Thumbnail State
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailName, setThumbnailName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeThumbnail = (e) => {
    e?.stopPropagation();
    setThumbnail(null);
    setThumbnailName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Create a New Course</h1>
        <p className="text-navy-500">Follow the steps to set up your course framework.</p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-navy-200 -z-10"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 -z-10 transition-all"
          style={{ width: `${(Math.min(step, 3) - 1) * 50}%` }}
        ></div>

        {[
          { num: 1, label: "Course Info", icon: Info },
          { num: 2, label: "Settings", icon: Settings },
          { num: 3, label: "Preview", icon: Eye },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 
              ${
                step >= s.num
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "bg-white border-navy-300 text-navy-400"
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-xs font-medium mt-2 ${
                step >= s.num ? "text-primary-700" : "text-navy-500"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-navy-900">Course Information</h2>

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
                  placeholder="A brief description of what the course covers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-navy-300 bg-white px-3 py-2 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent min-h-[120px]"
                  placeholder="Detailed course description..."
                />
              </div>

              {/* Course Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">
                  Course Thumbnail
                </label>
                <p className="text-xs text-navy-500 mb-3">
                  Upload a high-resolution cover image for your course. 16:9 ratio recommended (e.g. 1280x720px).
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {thumbnail ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 border border-navy-200 rounded-xl bg-navy-50/40">
                    <div className="relative w-full sm:w-64 aspect-video rounded-lg overflow-hidden bg-navy-900 shadow-sm border border-navy-200 group">
                      <img
                        src={thumbnail}
                        alt="Course thumbnail preview"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-white/90 hover:bg-white text-navy-900 rounded-lg shadow-md transition-all text-xs font-semibold flex items-center gap-1"
                          title="Change image"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all text-xs font-semibold flex items-center gap-1"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-sm font-semibold text-navy-900 truncate">
                          {thumbnailName || "Custom Thumbnail Loaded"}
                        </span>
                      </div>
                      <p className="text-xs text-navy-500">
                        This image will be displayed on course cards, catalogs, and the preview page.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 text-xs gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" /> Replace Image
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeThumbnail}
                          className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 group",
                      dragActive
                        ? "border-primary-500 bg-primary-50/50 scale-[0.99]"
                        : "border-navy-200 hover:border-primary-400 hover:bg-primary-50/20"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 group-hover:bg-primary-100 transition-all mb-1">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-navy-900">
                      Click to upload course thumbnail, or drag and drop
                    </div>
                    <p className="text-xs text-navy-500">
                      PNG, JPG, WebP or GIF (Recommended: 1280x720, max 5MB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs gap-1.5 pointer-events-none"
                    >
                      <Upload className="w-3.5 h-3.5" /> Select Image
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-navy-200 pt-6">
                <h3 className="text-lg font-bold text-navy-900 mb-4">
                  Learning Objectives & Requirements
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      What will students learn? (One per line)
                    </label>
                    <textarea
                      value={learnObjectives}
                      onChange={(e) => setLearnObjectives(e.target.value)}
                      className="w-full rounded-md border border-navy-300 bg-white px-3 py-2 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-[120px]"
                      placeholder="Build scalable React applications...&#10;Implement complex state management..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Prerequisites
                    </label>
                    <textarea
                      value={prerequisites}
                      onChange={(e) => setPrerequisites(e.target.value)}
                      className="w-full rounded-md border border-navy-300 bg-white px-3 py-2 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-[100px]"
                      placeholder="What should students know before starting this course?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-navy-900">Course Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-navy-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-navy-900">Course Visibility</h4>
                    <p className="text-sm text-navy-500">
                      Make this course discoverable by students.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={visibility}
                      onChange={(e) => setVisibility(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-navy-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-navy-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-navy-900">
                      Certificate of Completion
                    </h4>
                    <p className="text-sm text-navy-500">
                      Award a certificate when students finish.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={certificate}
                      onChange={(e) => setCertificate(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-navy-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in py-4">
              <h2 className="text-xl font-bold text-navy-900 mb-6">Course Preview</h2>

              <div className="border border-navy-200 rounded-xl overflow-hidden shadow-sm">
                <div className="relative bg-navy-900 text-white overflow-hidden">
                  {thumbnail && (
                    <div className="absolute inset-0 z-0">
                      <img
                        src={thumbnail}
                        alt="Course cover"
                        className="w-full h-full object-cover opacity-20 blur-sm scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/90 to-navy-950/70" />
                    </div>
                  )}

                  <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                      <Badge
                        variant="primary"
                        className="mb-4 bg-primary-600 border-none text-white hover:bg-primary-600"
                      >
                        {category}
                      </Badge>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                        {title || "Untitled Course"}
                      </h3>
                      <p className="text-base text-navy-200 mb-6">
                        {subtitle || "No subtitle provided"}
                      </p>
                      <div className="flex gap-4 text-sm text-navy-300">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" /> {level} Level
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" /> 0 Enrolled
                        </span>
                      </div>
                    </div>

                    {thumbnail && (
                      <div className="w-full md:w-56 shrink-0 aspect-video rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
                        <img
                          src={thumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-navy-900 mb-2">
                        About this course
                      </h4>
                      <p className="text-navy-600 leading-relaxed whitespace-pre-line">
                        {description || "Detailed course description will appear here..."}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-navy-900 mb-2">
                        What you'll learn
                      </h4>
                      <ul className="list-disc pl-5 text-navy-600 space-y-1">
                        {learnObjectives
                          .split("\n")
                          .filter((item) => item.trim())
                          .map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-navy-900 mb-2">
                        Prerequisites
                      </h4>
                      <p className="text-navy-600">{prerequisites || "None"}</p>
                    </div>
                  </div>

                  <div className="md:col-span-1 space-y-6 border-t md:border-t-0 md:border-l border-navy-100 pt-6 md:pt-0 md:pl-8">
                    <h4 className="font-bold text-navy-900 mb-4 border-b border-navy-100 pb-2">
                      Course Settings
                    </h4>
                    <div className="space-y-4 mb-6">
                      <div>
                        <h5 className="text-sm font-bold text-navy-900">Visibility</h5>
                        <p className="text-sm text-navy-600">
                          {visibility ? "Public (Discoverable)" : "Private (Hidden)"}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-navy-900">Certificate</h5>
                        <p className="text-sm text-navy-600">
                          {certificate ? "Included upon completion" : "No certificate"}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-navy-900">Pricing</h5>
                        <p className="text-sm text-navy-500 italic">
                          Determined by Organization
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 text-sm text-primary-800">
                <span className="font-bold">Note:</span> Once you send this course for
                approval, your organization admins will review the course content. You can
                continue adding modules and lessons while it is pending review.
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center animate-in fade-in py-12">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-navy-900">
                Approval Request Sent!
              </h2>
              <p className="text-navy-500 max-w-md mx-auto">
                Your organization has been notified. You can continue building your
                curriculum while waiting for approval.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-navy-200 p-4 px-8 z-10 flex justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button
          variant="ghost"
          onClick={() => step > 1 && setStep(step - 1)}
          disabled={step === 1 || step === 4}
        >
          Back
        </Button>
        <div className="flex gap-3">
          {step < 3 ? (
            <>
              <Button 
                variant="outline"
                onClick={() => {
                  api.post("/courses", {
                    title: title || "Untitled Course",
                    subtitle,
                    description,
                    category,
                    level,
                    objectives: learnObjectives.split("\n").filter(Boolean),
                    prerequisites,
                    visibility,
                    certificate,
                    status: "Draft",
                    image: thumbnail,
                  }, "instructor").then((c) => {
                    if (c && c.id) setCreatedCourseId(c.id);
                    alert("Draft saved!");
                  }).catch(err => console.error("Error saving draft:", err));
                }}
              >
                Save Draft
              </Button>
              <Button onClick={() => setStep(step + 1)}>
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          ) : step === 3 ? (
            <Button 
              onClick={() => {
                api.post("/courses", {
                  title: title || "Untitled Course",
                  subtitle,
                  description,
                  category,
                  level,
                  objectives: learnObjectives.split("\n").filter(Boolean),
                  prerequisites,
                  visibility,
                  certificate,
                  status: "Pending Approval",
                  image: thumbnail,
                }, "instructor").then((c) => {
                  if (c && c.id) setCreatedCourseId(c.id);
                  setStep(4);
                }).catch(err => console.error("Error submitting course:", err));
              }}
            >
              Send Approval Request
            </Button>
          ) : (
            <Link to={`/instructor/courses/${createdCourseId}/content`}>
              <Button>Go to Curriculum Builder</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
