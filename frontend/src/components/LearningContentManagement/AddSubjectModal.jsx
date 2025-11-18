import React from 'react';
import { X, Upload } from 'lucide-react';

const AddSubjectModal = ({
  showModal,
  onClose,
  editingSubject,
  newSubject,
  setNewSubject,
  isDark,
  onCreateSubject,
  onUpdateSubject,
  loading
}) => {
  if (!showModal) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl w-full`}>
        <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6 flex items-center justify-between`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
              Subject Name
            </label>
            <input
              type="text"
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              placeholder="e.g., Theory of Computation"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Description
            </label>
            <textarea
              value={newSubject.description}
              onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
              placeholder="Describe what this subject covers..."
              rows={4}
              maxLength="200"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <p className={`text-xs mt-1 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {newSubject.description.length}/200 characters
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Subject Image *
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDark ? 'border-gray-600' : 'border-gray-300'
            }`}>
              <Upload className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewSubject({ ...newSubject, image: e.target.files[0] })}
                className="hidden"
                id="subject-image-upload"
              />
              <label
                htmlFor="subject-image-upload"
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Choose Image File
              </label>
              {newSubject.image && (
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Selected: {newSubject.image.name}
                </p>
              )}
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
              Upload an image to represent this subject
            </p>
          </div>
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
            onClick={() => {
              if (!newSubject.name || !newSubject.description || (!editingSubject && !newSubject.image)) return;

              if (editingSubject && editingSubject._id) {
                if (newSubject.image) {
                  const formData = new FormData();
                  formData.append('name', newSubject.name);
                  formData.append('description', newSubject.description);
                  formData.append('image', newSubject.image);
                  onUpdateSubject(editingSubject._id, formData);
                } else {
                  // Send as JSON if no image
                  const data = {
                    name: newSubject.name,
                    description: newSubject.description
                  };
                  onUpdateSubject(editingSubject._id, data);
                }
              } else if (editingSubject && !editingSubject._id) {
                alert('Error: Subject ID is missing. Please try again.');
              } else {
                if (newSubject.image) {
                  const formData = new FormData();
                  formData.append('name', newSubject.name);
                  formData.append('description', newSubject.description);
                  formData.append('image', newSubject.image);
                  onCreateSubject(formData);
                } else {
                  // Send as JSON if no image
                  const data = {
                    name: newSubject.name,
                    description: newSubject.description
                  };
                  onCreateSubject(data);
                }
              }
            }}
            disabled={!newSubject.name || !newSubject.description || (!editingSubject && !newSubject.image) || loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !newSubject.name || !newSubject.description || loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : editingSubject ? 'Update Subject' : 'Add Subject'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubjectModal;