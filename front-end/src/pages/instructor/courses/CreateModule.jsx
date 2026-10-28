import { useState } from 'react';
import { Card, CardContent, Button, Input } from '../../../components/common';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { api } from '../../../utils/api';

export function CreateModule() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;
    if (!courseId) {
      setError('Open a course from My courses first.');
      return;
    }
    setError('');
    setSaving(true);

    api
      .get(`/courses/${courseId}/editor`, 'instructor')
      .then((course) => {
        const currentModules = course.modules || [];
        const newMod = {
          id: Date.now(),
          title,
          description,
          objectives: objectives.split('\n').filter(Boolean),
          items: [],
        };
        return api.put(
          `/courses/${courseId}/curriculum-draft`,
          {
            modules: [...currentModules, newMod],
          },
          'instructor',
        );
      })
      .then(() => {
        navigate(`/instructor/courses/${courseId}/content`);
      })
      .catch((err) => {
        setError(err.message || 'Unable to save module draft.');
        setSaving(false);
      });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Module</h1>
      </div>

      {error && (
        <p
          role="alert"
          className="workspace-error mb-4"
        >
          {error}
        </p>
      )}
      <Card>
        <CardContent className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Module Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Module 3 — State Management"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-[100px]"
              placeholder="What will students learn in this module?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Learning Objectives
            </label>
            <textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-[100px]"
              placeholder="After completing this module, students will be able to... (one per line)"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-navy-100">
            <Link to={`/instructor/courses/${courseId}/content`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Module'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
