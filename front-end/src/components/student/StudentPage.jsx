import React from 'react';
import PageLayout from '../layout/PageLayout';
export default function StudentPage({ children }) {
  return (
    <PageLayout>
      <div className="learner-page admin-page">{children}</div>
    </PageLayout>
  );
}
