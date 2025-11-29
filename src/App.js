import React, { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, Settings, FileText, Database } from 'lucide-react';

export default function App() {
  const [masterFile, setMasterFile] = useState(null);
  const [employeeFile, setEmployeeFile] = useState(null);
  const [tenantId, setTenantId] = useState('1');
  const [operatedBy, setOperatedBy] = useState('1');
  const [startingUid, setStartingUid] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  const handleMasterFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setMasterFile(file);
      setError(null);
    } else {
      setError('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleEmployeeFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setEmployeeFile(file);
      setError(null);
    } else {
      setError('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleSubmit = async () => {
    if (!masterFile || !employeeFile) {
      setError('Please upload both Excel files');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('master_data', masterFile);
    formData.append('employee_data', employeeFile);
    formData.append('tenant_id', tenantId);
    formData.append('operated_by_uid', operatedBy);
    formData.append('starting_uid', startingUid);

    try {
      const response = await fetch('http://localhost:8000/generate-sql', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate SQL');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.filename) return;

    try {
      const response = await fetch(`http://localhost:8000/download/${result.filename}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Database className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Excel to SQL Generator</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Upload your Excel files and generate SQL insert queries automatically
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Master Data File */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-500 transition-colors">
                <label className="block cursor-pointer">
                  <div className="flex flex-col items-center">
                    <FileText className="w-12 h-12 text-indigo-500 mb-3" />
                    <span className="text-sm font-semibold text-gray-700 mb-2">
                      Master Data File
                    </span>
                    <span className="text-xs text-gray-500 mb-3">
                      (gblm_designation & gblm_office sheets)
                    </span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleMasterFileChange}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                      {masterFile ? 'Change File' : 'Choose File'}
                    </div>
                  </div>
                </label>
                {masterFile && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-600 truncate">{masterFile.name}</p>
                  </div>
                )}
              </div>

              {/* Employee Data File */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-500 transition-colors">
                <label className="block cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-green-500 mb-3" />
                    <span className="text-sm font-semibold text-gray-700 mb-2">
                      Employee Details File
                    </span>
                    <span className="text-xs text-gray-500 mb-3">
                      (Employee Details sheet)
                    </span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleEmployeeFileChange}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                      {employeeFile ? 'Change File' : 'Choose File'}
                    </div>
                  </div>
                </label>
                {employeeFile && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-600 truncate">{employeeFile.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration Section */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors mb-4"
              >
                <Settings className="w-5 h-5 mr-2" />
                <span className="font-medium">Advanced Configuration</span>
              </button>

              {showConfig && (
                <div className="grid md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenant ID
                    </label>
                    <input
                      type="number"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operated By UID
                    </label>
                    <input
                      type="number"
                      value={operatedBy}
                      onChange={(e) => setOperatedBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Starting UID
                    </label>
                    <input
                      type="number"
                      value={startingUid}
                      onChange={(e) => setStartingUid(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !masterFile || !employeeFile}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating SQL...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Generate SQL Queries
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
                <p className="text-gray-600">SQL queries generated successfully</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.stats.total_employees}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Successfully Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {result.stats.successfully_processed}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {result.stats.errors}
                </p>
              </div>
            </div>

            {/* Errors List */}
            {result.errors && result.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Errors:</h3>
                <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {result.errors.map((err, idx) => (
                    <p key={idx} className="text-sm text-red-700 mb-1">
                      • {err}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* SQL Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">SQL Preview:</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {result.sql_preview}
                </pre>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download SQL File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}