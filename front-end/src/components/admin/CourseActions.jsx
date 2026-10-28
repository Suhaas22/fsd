import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Archive, Trash2, X } from 'lucide-react';
import { api } from '../../utils/api';
export default function CourseActions({ course, onUpdated }) {
  const navigate = useNavigate();
  const [action, setAction] = useState('');
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function open(kind) {
    setAction(kind);
    setError('');
    setForm({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      level: course.level || 'Beginner',
    });
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (action === 'edit')
        await api.patch(`/admin/courses/${course.id}`, form);
      else if (action === 'archive')
        await api.post(`/admin/courses/${course.id}/archive`, {});
      else await api.delete(`/admin/courses/${course.id}`);
      setAction('');
      if (action === 'delete') navigate('/admin/courses');
      else onUpdated();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className="admin-button"
        onClick={() => open('edit')}
      >
        <Pencil size={13} />
        Edit
      </button>
      {course.status !== 'Archived' && (
        <button
          className="admin-button"
          onClick={() => open('archive')}
        >
          <Archive size={13} />
          Archive
        </button>
      )}
      <button
        className="admin-button admin-button-danger"
        onClick={() => open('delete')}
      >
        <Trash2 size={13} />
        Delete
      </button>
      {action && (
        <div className="admin-modal-backdrop">
          <form
            onSubmit={save}
            className="admin-modal space-y-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-action-title"
          >
            <div className="flex justify-between">
              <h2
                id="course-action-title"
                className="text-xl font-semibold"
              >
                {action === 'edit'
                  ? 'Edit course'
                  : action === 'archive'
                    ? 'Archive course?'
                    : 'Delete course?'}
              </h2>
              <button
                type="button"
                aria-label="Close course editor"
                onClick={() => setAction('')}
              >
                <X size={19} />
              </button>
            </div>
            {action === 'edit' ? (
              <>
                <label className="block text-sm">
                  Title
                  <input
                    className="admin-input mt-2"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </label>
                <label className="block text-sm">
                  Category
                  <input
                    className="admin-input mt-2"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  />
                </label>
                <label className="block text-sm">
                  Level
                  <select
                    className="admin-input mt-2"
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value })
                    }
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
                <label className="block text-sm">
                  Description
                  <textarea
                    className="admin-input mt-2"
                    rows={5}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </label>
              </>
            ) : (
              <p className="admin-muted">
                {action === 'archive'
                  ? 'The course will leave the published catalog. Enrollments and payment history are preserved.'
                  : 'Only courses without enrollment or payment history can be permanently deleted.'}
              </p>
            )}
            {error && (
              <p
                className="workspace-error"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="admin-button"
                disabled={busy}
                onClick={() => setAction('')}
              >
                Cancel
              </button>
              <button
                className="admin-button admin-button-primary"
                disabled={busy}
              >
                {busy
                  ? 'Saving…'
                  : action === 'edit'
                    ? 'Save changes'
                    : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
