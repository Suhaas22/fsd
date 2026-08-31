import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { api } from '../../utils/api';

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(data => {
        setReports(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
        setLoading(false);
      });
  }, []);

  const handleDownload = (reportTitle, format) => {
    alert(`Downloading ${reportTitle} (${format})...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-500">Generate and download platform reports.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Loading report templates...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, idx) => (
            <div key={report.id || idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{report.title}</h3>
              <p className="text-slate-500 text-sm mb-6">{report.description}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(report.title, 'CSV')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors text-sm"
                >
                  <Download className="w-4 h-4" /> CSV
                </button>
                <button
                  onClick={() => handleDownload(report.title, 'PDF')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors text-sm"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
