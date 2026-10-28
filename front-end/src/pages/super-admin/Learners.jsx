import React from 'react';
import AccountDirectory from '../../components/workspace/AccountDirectory';
export default function Learners() {
  return (
    <AccountDirectory
      fixedRole="Learner"
      superAdmin
    />
  );
}
