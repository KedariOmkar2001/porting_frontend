import React, { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, Settings, FileText, Database, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function App() {
  const [masterFile, setMasterFile] = useState(null);
  const [employeeFile, setEmployeeFile] = useState(null);
  const [tenantId, setTenantId] = useState('1');
  const [operatedBy, setOperatedBy] = useState('1');
  const [startingUid, setStartingUid] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  const handleMasterFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setMasterFile(file);
      setError(null);
      setValidationResult(null);
      setResult(null);
    } else {
      setError('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleEmployeeFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setEmployeeFile(file);
      setError(null);
      setValidationResult(null);
      setResult(null);
    } else {
      setError('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleValidate = async () => {
    if (!masterFile || !employeeFile) {
      setError('Please upload both Excel files');
      return;
    }

    setValidating(true);
    setError(null);
    setValidationResult(null);
    setResult(null);

    const formData = new FormData();
    formData.append('master_data', masterFile);
    formData.append('employee_data', employeeFile);

    try {
      const response = await fetch('https://porting-backend-1.onrender.com/validate-data', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to validate data');
      }

      setValidationResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (skipValidation = false) => {
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
    formData.append('skip_validation', skipValidation.toString());

    try {
      const response = await fetch('https://porting-backend-1.onrender.com/generate-sql', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate SQL');
      }

      setResult(data);

      // If validation data is included in the response, show it
      if (data.validation) {
        setValidationResult(data.validation);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.filename) return;

    try {
      const response = await fetch(`https://porting-backend-1.onrender.com/download/${result.filename}`);
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
      <div className="max-w-6xl mx-auto">
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

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={handleValidate}
                disabled={validating || !masterFile || !employeeFile}
                className="bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {validating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Validating...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Validate Data
                  </>
                )}
              </button>

              <button
                onClick={() => handleSubmit(false)}
                disabled={loading || !masterFile || !employeeFile}
                className="bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

        {/* Validation Results */}
        {validationResult && !result && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center mb-6">
              {validationResult.can_proceed ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Validation Passed!</h2>
                    <p className="text-gray-600">Your data is ready for SQL generation</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Validation Failed</h2>
                    <p className="text-gray-600">Please fix the errors below before generating SQL</p>
                  </div>
                </>
              )}
            </div>

            {/* Master Data Validation */}
            {validationResult.master_data_validation && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Master Data</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Designations:</strong> {validationResult.master_data_validation.designation_count} records
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Offices:</strong> {validationResult.master_data_validation.office_count} records
                  </p>
                </div>

                {validationResult.master_data_validation.errors?.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" />
                      Errors ({validationResult.master_data_validation.errors.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {validationResult.master_data_validation.errors.map((err, idx) => (
                        <div key={idx} className="text-sm text-red-700 bg-white p-2 rounded">
                          <strong>{err.type}:</strong> {err.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationResult.master_data_validation.warnings?.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Warnings ({validationResult.master_data_validation.warnings.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {validationResult.master_data_validation.warnings.map((warn, idx) => (
                        <div key={idx} className="text-sm text-yellow-700 bg-white p-2 rounded">
                          {warn.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Employee Data Validation */}
            {validationResult.employee_data_validation && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Employee Data</h3>

                {/* Summary Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Rows</p>
                    <p className="text-xl font-bold text-blue-600">
                      {validationResult.employee_data_validation.summary?.total_rows || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Errors</p>
                    <p className="text-xl font-bold text-red-600">
                      {validationResult.employee_data_validation.summary?.error_count || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Warnings</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {validationResult.employee_data_validation.summary?.warning_count || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Valid Rows</p>
                    <p className="text-xl font-bold text-green-600">
                      {(validationResult.employee_data_validation.summary?.total_rows || 0) -
                       (validationResult.employee_data_validation.summary?.error_count || 0)}
                    </p>
                  </div>
                </div>

                {/* Errors */}
                {validationResult.employee_data_validation.errors?.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" />
                      Errors ({validationResult.employee_data_validation.errors.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {validationResult.employee_data_validation.errors.map((err, idx) => (
                        <div key={idx} className="text-sm bg-white p-3 rounded border border-red-200">
                          <div className="flex items-start">
                            <span className="inline-block bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-semibold mr-2">
                              {err.type}
                            </span>
                            {err.row && (
                              <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold mr-2">
                                Row {err.row}
                              </span>
                            )}
                          </div>
                          <p className="text-red-700 mt-2">{err.message}</p>
                          {err.value && (
                            <p className="text-gray-600 text-xs mt-1">Value: "{err.value}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {validationResult.employee_data_validation.warnings?.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Warnings ({validationResult.employee_data_validation.warnings.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {validationResult.employee_data_validation.warnings.map((warn, idx) => (
                        <div key={idx} className="text-sm bg-white p-3 rounded border border-yellow-200">
                          <div className="flex items-start">
                            <span className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-2">
                              {warn.type}
                            </span>
                            {warn.row && (
                              <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold mr-2">
                                Row {warn.row}
                              </span>
                            )}
                          </div>
                          <p className="text-yellow-700 mt-2">{warn.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {validationResult.can_proceed && (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <Database className="w-5 h-5 mr-2" />
                  Proceed to Generate SQL
                </button>
              )}
              {!validationResult.can_proceed && (
                <div className="flex-1 bg-gray-100 border-2 border-dashed border-gray-300 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600">
                    <Info className="w-5 h-5 mr-2" />
                    <p className="text-sm">Please fix all errors before generating SQL</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && result.success && (
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

        {/* Validation Failed but SQL Generated */}
        {result && !result.success && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <XCircle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Generation Failed</h2>
                <p className="text-gray-600">{result.message}</p>
              </div>
            </div>

            {/* Show validation results if included */}
            {result.validation && (
              <div className="mt-6">
                <button
                  onClick={() => setValidationResult(result.validation)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View Validation Details
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}