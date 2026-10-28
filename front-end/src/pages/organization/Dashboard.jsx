import React from 'react';
import OrgLayout from '../../components/organization/OrgLayout';
import Analytics from './Analytics';
export default function Dashboard() {
  return (
    <OrgLayout>
      <Analytics dashboardStyle />
    </OrgLayout>
  );
}
