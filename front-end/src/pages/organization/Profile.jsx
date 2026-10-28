import React from 'react';
import AccountPage from '../../components/workspace/AccountPage';
import OrgLayout from '../../components/organization/OrgLayout';
export default function Profile() {
  return (
    <OrgLayout>
      <AccountPage />
    </OrgLayout>
  );
}
