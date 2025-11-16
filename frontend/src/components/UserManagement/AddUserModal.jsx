import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import Papa from 'papaparse';
import { useTheme } from '../../contexts/ThemeContext';

const AddUserModal = ({ 
  isOpen, 
  type, // 'student' or 'faculty'
  onClose, 
  formData, 
  onFormChange, 
  onAddUser, 
  onBulkAdd, 
  loading,
  availableSubjects,
  isDark 
}) => {
  const [bulkFile, setBulkFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    setBulkFile(e.target.files[0]);
  };

  const handleBulkUpload = () => {
    if (bulkFile) {
      onBulkAdd(bulkFile, type);
    }
  };

  const clearBulkFile = () => {
    setBulkFile(null);
    const fileInput = document.getElementById(`bulk-file-${type}`);
    if (fileInput) fileInput.value = null;
  };

  const handleSubjectToggle = (subject) => {
    const currentSubjects = formData.subjects || [];
    const updatedSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    
    onFormChange({ ...formData, subjects: updatedSubjects });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Add New {type === 'student' ? 'Student' : 'Faculty'}
          </h2>
          <button
            onClick={() => {
              onClose();
              clearBulkFile();
            }}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Individual User Form */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder={type === 'faculty' ? 'Dr. John Doe' : 'John Doe'}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              placeholder="john.doe@university.edu"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password || ''}
                onChange={(e) => onFormChange({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Faculty-specific subjects selection */}
          {type === 'faculty' && (
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                Subjects
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableSubjects.map((subject) => (
                  <label
                    key={subject}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      (formData.subjects || []).includes(subject)
                        ? isDark
                          ? 'bg-blue-900/30 border-blue-700'
                          : 'bg-blue-50 border-blue-300'
                        : isDark
                          ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(formData.subjects || []).includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {subject}
                    </span>
                  </label>
                ))}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                {(formData.subjects || []).length} subject{(formData.subjects || []).length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Bulk Upload Section */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-400 dark:border-gray-600"></div>
          </div>

          <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Bulk Add {type === 'student' ? 'Students' : 'Faculty'} via CSV
            </h3>
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Upload a CSV file with columns: <b>name</b>, <b>email</b>, <b>password</b>
              {type === 'faculty' && ', <b>subjects</b> (comma-separated)'}.
            </p>

            <input
              id={`bulk-file-${type}`}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${
                isDark 
                  ? 'file:bg-green-600 file:text-white hover:file:bg-green-700' 
                  : 'file:bg-green-100 file:text-green-700 hover:file:bg-green-200'
              }`}
            />
            {bulkFile && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Selected: {bulkFile.name}
                </span>
                <button
                  onClick={clearBulkFile}
                  className={`text-sm ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}
                >
                  Remove
                </button>
              </div>
            )}
            <button
              onClick={handleBulkUpload}
              disabled={!bulkFile || loading}
              className={`mt-3 w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isDark
                  ? `bg-${type === 'student' ? 'green' : 'blue'}-600 hover:bg-${type === 'student' ? 'green' : 'blue'}-700 text-white`
                  : `bg-${type === 'student' ? 'green' : 'blue'}-600 hover:bg-${type === 'student' ? 'green' : 'blue'}-700 text-white`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <UserPlus className="w-5 h-5" />
              {loading && bulkFile ? 'Processing...' : `Add ${type === 'student' ? 'Students' : 'Faculty'} from CSV`}
            </button>
          </div>
        </div>

        <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
          <button
            onClick={() => {
              onClose();
              clearBulkFile();
            }}
            className={`px-6 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={() => onAddUser(type)}
            disabled={loading || !formData.name || !formData.email || !formData.password || (type === 'faculty' && (formData.subjects || []).length === 0)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              loading || !formData.name || !formData.email || !formData.password || (type === 'faculty' && (formData.subjects || []).length === 0)
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : `bg-${type === 'student' ? 'green' : 'blue'}-600 hover:bg-${type === 'student' ? 'green' : 'blue'}-700 text-white`
            }`}
          >
            {loading && !bulkFile ? 'Adding...' : `Add ${type === 'student' ? 'Student' : 'Faculty'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;