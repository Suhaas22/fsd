import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { OrgProvider } from './context/OrgContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import './index.css';
import './styles/academy.css';
import './styles/workspace.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <OrgProvider>
          <App />
        </OrgProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import './styles/learner.css';

import './styles/dashboard-polish.css';

import './styles/typography.css';
