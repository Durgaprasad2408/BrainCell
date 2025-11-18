import React from 'react';
import { X, Loader, Upload } from 'lucide-react';

const AddResourceModal = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onFileChange,
  onSubmit,
  uploading,
  isDark
}) => {
  if (!isOpen) return null;

  const resetForm = () => {
    // Reset logic will be handled by parent component
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Add New Resource
          </h2>
          <button
            onClick={resetForm}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Resource Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              placeholder="e.g., Introduction to Finite Automata"
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Resource Type
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={(e) => {
                const subCat = e.target.value;
                let type = 'pdf';
                if (subCat === 'videos') type = 'video';
                if (subCat === 'external-links') type = 'link';
                onInputChange({
                  target: { name: 'subCategory', value: subCat }
                });
                onInputChange({
                  target: { name: 'type', value: type }
                });
              }}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="notes">Notes</option>
              <option value="computative">Computative</option>
              <option value="videos">Video</option>
              <option value="external-links">External Link</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Subject - Topic
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={onInputChange}
              placeholder="e.g., Automata Theory"
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {formData.subCategory === 'external-links' ? (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Resource URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={onInputChange}
                placeholder="https://example.com/resource"
                required
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload File
              </label>
              <input
                type="file"
                onChange={onFileChange}
                accept={formData.subCategory === 'notes' || formData.subCategory === 'computative' ? '.pdf' : 'video/*'}
                required
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {formData.file && (
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Selected: {formData.file.name}
                </p>
              )}
            </div>
          )}


          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className={`flex-1 px-6 py-3 rounded-lg border font-medium transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Add Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;