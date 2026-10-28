import React from 'react';
import AccountDirectory from '../../components/workspace/AccountDirectory';
export default function Organizations() {
  return (
    <AccountDirectory
      fixedRole="Organization"
      superAdmin
    />
  );
}
