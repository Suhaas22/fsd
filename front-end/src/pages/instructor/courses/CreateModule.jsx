import { useState } from "react";
import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";

export function CreateModule() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    setSaving(true);

    api.get("/courses/1", "instructor")
      .then((course) => {
        const currentModules = course.modules || [];
        const newMod = {
          id: Date.now(),
          title,
          description,
          objectives: objectives.split("\n").filter(Boolean),
          items: [],
        };
        return api.patch("/courses/1", {
          modules: [...currentModules, newMod],
        }, "instructor");
      })
      .then(() => {
        navigate("/instructor/courses/1/content");
      })
      .catch((err) => {
        console.error("Error creating module:", err);
        setSaving(false);
      });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Create New Module</h1>
        <p className="text-navy-500">A module groups related lessons and quizzes together.</p>
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Module Title</label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Module 3 — State Management" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-md border border-navy-300 bg-white px-3 py-2 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-[100px]"
              placeholder="What will students learn in this module?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Learning Objectives</label>
            <textarea 
              value={objectives}
              onChange={e => setObjectives(e.target.value)}
              className="w-full rounded-md border border-navy-300 bg-white px-3 py-2 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-[100px]"
              placeholder="After completing this module, students will be able to... (one per line)"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-navy-100">
            <Link to="/instructor/courses/1/content">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Module"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
