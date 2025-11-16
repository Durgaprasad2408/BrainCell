import React from 'react';
import { X } from 'lucide-react';

const EditUserModal = ({ 
  isOpen, 
  onClose, 
  selectedUser, 
  editForm, 
  onFormChange, 
  availableSubjects, 
  onSubjectToggle, 
  onUpdateUser, 
  loading,
  isDark 
}) => {
  if (!isOpen || !selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Edit User
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Full Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
              placeholder="John Doe"
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
              value={editForm.email}
              onChange={(e) => onFormChange({ ...editForm, email: e.target.value })}
              placeholder="john.doe@university.edu"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {selectedUser?.role === 'instructor' && (
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                Subjects
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableSubjects.map((subject) => (
                  <label
                    key={subject}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      editForm.subjects.includes(subject)
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
                      checked={editForm.subjects.includes(subject)}
                      onChange={() => onSubjectToggle(subject)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {subject}
                    </span>
                  </label>
                ))}
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                {editForm.subjects.length} subject{editForm.subjects.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            } transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={onUpdateUser}
            disabled={loading || !editForm.name || !editForm.email || (selectedUser?.role === 'instructor' && editForm.subjects.length === 0)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              loading || !editForm.name || !editForm.email || (selectedUser?.role === 'instructor' && editForm.subjects.length === 0)
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;