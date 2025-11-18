import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  createResource,
  getAllResources,
  deleteResource,
  getResourceStats,
  incrementEngagement,
  getDownloadUrl,
  downloadFile
} from '../../api/resourceService';
import {
  LibraryHeader,
  LibraryStats,
  LibraryFilters,
  LibraryTable,
  AddResourceModal
} from '../../components/library';

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
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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


  return (
    <div>
      <LibraryHeader
        isDark={isDark}
        onAddResource={() => setShowAddModal(true)}
      />

      <LibraryStats
        stats={stats}
        isDark={isDark}
      />

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`}>
        <LibraryFilters
          searchQuery={searchQuery}
          selectedType={selectedType}
          onSearchChange={setSearchQuery}
          onTypeChange={setSelectedType}
          isDark={isDark}
        />

        <LibraryTable
          resources={resources}
          loading={loading}
          isDark={isDark}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>

      <AddResourceModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        formData={formData}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        uploading={uploading}
        isDark={isDark}
      />
    </div>
  );
};

export default LibraryManagement;
