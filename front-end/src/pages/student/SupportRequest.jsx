import SearchableSelect from '../../components/common/SearchableSelect';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import StudentPage from '../../components/student/StudentPage';
import { useRemoteData } from '../../hooks/useRemoteData';
import { api } from '../../services/api';
import { AdminHeader, AdminDataState } from '../../components/admin/AdminUI';
export default function SupportRequest() {
  const categories = useRemoteData('/student/dispute-categories');
  const courses = useRemoteData('/student/enrollments');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: '',
    description: '',
    courseId: '',
    category: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    if (!form.category) {
      setError('Choose an issue category.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const created = await api.post('/student/disputes', form);
      window.dispatchEvent(new Event('notifications-changed'));
      navigate(`/student/disputes/${created.id}`, { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <StudentPage>
      <Link className="admin-count-label" to="/student/disputes">
        <ArrowLeft size={14} />
        Support requests
      </Link>
      <AdminHeader title="New support request" />
      <div className="learner-support-form">
        <form className="admin-card learner-form" onSubmit={submit}>
          <h2>Tell us what happened</h2>
          <label>
            Subject
            <input
              required
              maxLength={160}
              className="admin-input"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="A short description of the issue"
            />
          </label>
          <SearchableSelect
            label="Issue category"
            required
            value={form.category}
            onChange={(category) => setForm({ ...form, category })}
            options={(categories.data || []).map((category) => ({
              value: category,
              label: category,
            }))}
            placeholder="Choose an issue category"
            searchPlaceholder="Search issue categories…"
          />
          <AdminDataState {...categories} />
          <SearchableSelect
            label="Related course"
            value={form.courseId}
            onChange={(courseId) => setForm({ ...form, courseId })}
            options={[
              { value: '', label: 'General account or payment question' },
              ...(courses.data || []).map((c) => ({
                value: c.courseId,
                label: c.courseTitle,
              })),
            ]}
            placeholder="Choose an enrolled course"
            searchPlaceholder="Search your enrolled courses…"
          />
          <AdminDataState {...courses} />
          <label>
            Details
            <textarea
              required
              maxLength={5000}
              rows={7}
              className="admin-input"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Include what you were doing, what went wrong and the help you need."
            />
          </label>
          {error && (
            <p role="alert" className="workspace-error">
              {error}
            </p>
          )}
          <div className="learner-form-footer">
            <button
              className="admin-button admin-button-primary"
              disabled={busy}
            >
              <Send size={14} />
              {busy ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </StudentPage>
  );
}
