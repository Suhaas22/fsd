import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OrgLayout from '../../components/organization/OrgLayout';
import { useRemoteData } from '../../hooks/useRemoteData';
import {
  AdminHeader,
  AdminSearch,
  AdminDataState,
  AdminEmpty,
} from '../../components/admin/AdminUI';
export default function Learners() {
  const state = useRemoteData('/workspace/organization/learners'),
    [search, setSearch] = useState('');
  const rows =
    state.data?.filter((l) =>
      `${l.name} ${l.email}`.toLowerCase().includes(search.toLowerCase()),
    ) || [];
  return (
    <OrgLayout>
      <div className="admin-page">
        <AdminHeader title="Learners" />
        <div className="admin-toolbar">
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder="Search learners by name or email…"
          />
        </div>
        <AdminDataState {...state} />
        {state.data && !state.error && (
          <section className="admin-card">
            <div className="operations-table-scroll">
              <table className="operations-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.name}</strong>
                      </td>
                      <td>{l.email}</td>
                      <td>
                        <Link
                          className="admin-button"
                          to={`/org/learners/${l.id}`}
                        >
                          View learner
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <AdminEmpty title="No learners match your search" />
            )}
          </section>
        )}
      </div>
    </OrgLayout>
  );
}
