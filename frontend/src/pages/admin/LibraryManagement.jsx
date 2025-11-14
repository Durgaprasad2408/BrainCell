import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  FileText,
  Video,
  Link as LinkIcon,
  X,
  Loader
} from 'lucide-react';
import {
  createResource,
  getAllResources,
  updateResource,
  deleteResource,
  getResourceStats,
  incrementEngagement,
  getDownloadUrl,
  downloadFile
} from '../../api/resourceService';

const LibraryManagement = () => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({
    totalResources: 0,
    pdfCount: 0,
    videoCount: 0,
    linkCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'pdf',
    subCategory: 'notes',
    category: '',
    url: '',
    status: 'Published',
    file: null
  });

  useEffect(() => {
    fetchResources();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedType, searchQuery]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const filters = {
        type: selectedType,
        search: searchQuery
      };
      const response = await getAllResources(filters);
      setResources(response.data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getResourceStats();
      
      // FIX: Check if response and response.data are valid before setting state
      if (response && response.data) {
        setStats(response.data);
      } else {
        // Log an error, but don't set state to undefined
        console.error('Invalid response from getResourceStats:', response);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // If an error is caught, the state remains at its default value, which is safe.
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('subCategory', formData.subCategory);
      data.append('category', formData.category);
      data.append('status', formData.status);

      if (formData.type === 'link') {
        data.append('url', formData.url);
      } else if (formData.file) {
        data.append('file', formData.file);
      } else {
        alert('Please select a file to upload');
        setUploading(false);
        return;
      }

      await createResource(data);
      alert('Resource added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchResources();
      fetchStats();
    } catch (error) {
      console.error('Error creating resource:', error);
      alert(error.response?.data?.message || 'Failed to create resource');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'pdf',
      subCategory: 'notes',
      category: '',
      url: '',
      status: 'Published',
      file: null
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        alert('Resource deleted successfully!');
        fetchResources();
        fetchStats();
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Failed to delete resource');
      }
    }
  };

  const handleDownload = async (resource) => {
    try {
      if (resource.type === 'pdf') {
        const response = await getDownloadUrl(resource._id);
        await downloadFile(response.data.url, resource.title);
      } else {
        await incrementEngagement(resource._id, 'download');
        window.open(resource.url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleView = async (resource) => {
    try {
      await incrementEngagement(resource._id, 'view');
      window.open(resource.url, '_blank');
    } catch (error) {
      console.error('Error viewing resource:', error);
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'pdf') return FileText;
    if (type === 'video') return Video;
    return LinkIcon;
  };

  const getTypeColor = (type) => {
    if (type === 'pdf') return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
    if (type === 'video') return isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
    return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status) => {
    if (status === 'Published') return isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    return isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-700';
  };

  const statsDisplay = [
    { label: 'Total Resources', value: stats.totalResources, color: 'blue' },
    { label: 'PDFs', value: stats.pdfCount, color: 'red' },
    { label: 'Videos', value: stats.videoCount, color: 'blue' },
    { label: 'Links', value: stats.linkCount, color: 'green' }
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Library Management
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage educational resources and materials
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statsDisplay.map((stat, index) => (
          <div
            key={index}
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 border`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{stat.label}</p>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF Notes</option>
              <option value="video">Videos</option>
              <option value="link">Links</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Resource
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Type
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Subject
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Details
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Engagement
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {resources.map((resource) => {
                  const Icon = getTypeIcon(resource.type);
                  return (
                    <tr key={resource._id} className={`${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Icon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {resource.title}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(resource.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(resource.type)}`}>
                          {resource.type.toUpperCase()}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {resource.category}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {resource.size || resource.duration || 'External'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        {resource.type === 'pdf' && `${resource.downloads} downloads`}
                        {resource.type === 'video' && `${resource.views} views`}
                        {resource.type === 'link' && `${resource.clicks} clicks`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(resource.status)}`}>
                          {resource.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(resource)}
                            className={`p-2 rounded-lg ${
                              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            } transition-colors`}
                            title="View Resource"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(resource)}
                            className={`p-2 rounded-lg ${
                              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            } transition-colors`}
                            title="Download Resource"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(resource._id)}
                            className={`p-2 rounded-lg ${
                              isDark ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                            } transition-colors`}
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add New Resource
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Resource Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
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
                    setFormData(prev => ({ ...prev, subCategory: subCat, type }));
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="notes">PDF Notes</option>
                  <option value="gate-papers">GATE Papers</option>
                  <option value="videos">Video</option>
                  <option value="external-links">External Link</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleFileChange}
                    accept={formData.subCategory === 'notes' || formData.subCategory === 'gate-papers' ? '.pdf' : 'video/*'}
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

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
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
      )}
    </div>
  );
};

export default LibraryManagement;
