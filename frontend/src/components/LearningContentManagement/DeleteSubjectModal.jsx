import React from 'react';
import { X } from 'lucide-react';

const DeleteSubjectModal = ({
  showModal,
  onClose,
  deletingSubject,
  isDark,
  onDeleteSubject,
  loading
}) => {
  if (!showModal || !deletingSubject) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md w-full`}>
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Delete Subject
          </h2>
        </div>

        <div className="p-6">
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
            Are you sure you want to delete <strong>{deletingSubject.name}</strong>?
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            This will remove the subject and all its associated lessons ({deletingSubject.lessons} lessons). This action cannot be undone.
          </p>
        </div>

        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex gap-3 justify-end`}>
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
            onClick={onDeleteSubject}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Delete Subject'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubjectModal;