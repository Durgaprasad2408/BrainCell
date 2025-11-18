import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Video, Download, Play, Clock, Eye, ChevronLeft, ChevronRight, Loader, X } from 'lucide-react';
import VideoModal from '../../components/VideoModal';
import { fetchPlaylistVideos, extractVideoIdFromUrl } from '../../utils/youtubeUtils';
import { getPublishedResources, incrementEngagement, getDownloadUrl, downloadFile } from '../../api/resourceService';
import StudentNavbar from '../../components/StudentNavbar';
import { useTheme } from '../../contexts/ThemeContext'; // <-- 1. Import useTheme

const Library = () => {
  const { isDark } = useTheme(); // <-- 2. Get isDark state
  const [activeTab, setActiveTab] = useState('pdf-notes');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [youtubeData, setYoutubeData] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const VIDEOS_PER_PAGE = 4;
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    loadResources();
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadResources = async () => {
    setLoading(true);
    try {
      let subCategory;
      if (activeTab === 'pdf-notes') subCategory = 'notes';
      else if (activeTab === 'computative') subCategory = 'computative';
      else if (activeTab === 'videos') subCategory = 'videos,external-links';

      const response = await getPublishedResources({ subCategory, search: searchQuery });
      setResources(response.data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylistVideos = async () => {
    setLoading(true);
    try {
      const videos = await fetchPlaylistVideos();
      setYoutubeData(videos);
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      setYoutubeData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (videoUrl) => {
    const videoId = extractVideoIdFromUrl(videoUrl);
    if (videoId) {
      setSelectedVideoId(videoId);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideoId(null);
    setSelectedVideoUrl(null);
  };

  const handleDownload = async (resource) => {
    try {
      if (resource.type === 'pdf') {
        const response = await getDownloadUrl(resource._id);
        await downloadFile(response.data.url, resource.title);
      } else {
        const engagementType =
          resource.subCategory === 'computative' || resource.type === 'pdf' || resource.subCategory === 'notes'
            ? 'download'
            : 'click';
        await incrementEngagement(resource._id, engagementType);
        window.open(resource.url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const tabs = [
    { id: 'pdf-notes', label: 'PDF Notes', icon: FileText },
    { id: 'computative', label: 'Computative', icon: BookOpen },
    { id: 'videos', label: 'Videos', icon: Video }
  ];

  // PDF Notes Tab
  const renderPDFNotes = () => {
    const pdfResources = resources.filter(r => r.subCategory === 'notes');
    const filteredPdfs = pdfResources.filter(pdf =>
      searchQuery === '' || 
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pdf.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPdfs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredPdfs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (currentItems.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          {/* 3. Apply isDark logic */}
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No PDF resources available
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((pdf) => (
            <div key={pdf._id} className={`rounded-lg shadow-lg border p-6 hover:shadow-xl transition-all duration-200 ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-red-500" />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark
                    ? 'bg-blue-900 text-blue-200'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {pdf.size || 'PDF'}
                </span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {pdf.title}
              </h3>
              <div className={`flex items-center justify-between text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>{pdf.category}</span>
                <span>{pdf.downloads ?? 0} downloads</span>
              </div>
              <button
                onClick={() => handleDownload(pdf)}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentPage === 1
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentPage === totalPages
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </>
    );
  };

  // Computative Tab
    const renderComputative = () => {
    const gateResources = resources.filter(r => r.subCategory === 'computative');
    const filteredLinks = gateResources.filter(link =>
      searchQuery === '' || 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      link.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLinks.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredLinks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (currentItems.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No Computative available
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((paper) => (
            <div
              key={paper._id}
              className={`rounded-lg shadow-lg border p-6 hover:shadow-xl transition-all duration-200 ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <BookOpen className="w-8 h-8 text-green-500" />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark
                    ? 'bg-green-900 text-green-200'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {paper.size || 'PDF'}
                </span>
              </div>

              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {paper.title}
              </h3>

              <div className={`flex items-center justify-between text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>{paper.category}</span>
                <span>{paper.downloads ?? 0} downloads</span>
              </div>

              <button
                onClick={() => handleDownload(paper)}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentPage === 1
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentPage === totalPages
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </>
    );
  };

  // Videos Tab
  const renderVideos = () => {
    const videoResources = resources.filter(r => r.subCategory === 'videos' || r.subCategory === 'external-links');
    const filteredVideos = videoResources.filter(video =>
      searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      video.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (currentItems.length === 0) {
      return (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No video resources available
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((video) => (
            <div 
              key={video._id} 
              className={`rounded-lg shadow-lg border p-6 hover:shadow-xl transition-all duration-200 cursor-pointer ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`} 
              onClick={() => handleVideoClick(video)}
            >
              <div className="flex items-start justify-between mb-4">
                <Video className="w-8 h-8 text-blue-500" />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDark
                    ? 'bg-blue-900 text-blue-200'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {video.subCategory === 'external-links' ? 'External' : 'Uploaded'}
                </span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {video.title}
              </h3>
              <div className={`flex items-center justify-between text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>{video.category}</span>
                <span>{video.views} views</span>
              </div>
              <button
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Watch Video</span>
              </button>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentPage === 1
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentPage === totalPages
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </>
    );
  };

  const filteredVideos = youtubeData.filter(video =>
    searchQuery === '' || video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE);
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const endIndex = startIndex + VIDEOS_PER_PAGE;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleVideoClick = (resource) => {
    if (resource.subCategory === 'external-links') {
      const videoId = extractVideoIdFromUrl(resource.url);
      if (videoId) {
        setSelectedVideoId(videoId);
        setIsModalOpen(true);
      } else {
        window.open(resource.url, '_blank');
      }
    } else if (resource.subCategory === 'videos') {
      setSelectedVideoUrl(resource.url);
      setIsModalOpen(true);
    }
  };

  const handleCloseVideoModal = () => {
    setIsModalOpen(false);
    setSelectedVideoId(null);
    setSelectedVideoUrl(null);
  };

  const renderSearchBar = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={`Search ${activeTab === 'pdf-notes' ? 'notes' : activeTab === 'computative' ? 'Computative' : 'videos'}...`}
        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isDark
            ? 'border-gray-600 bg-gray-700 text-white'
            : 'border-gray-300 bg-white text-gray-900'
        }`}
      />
    </div>
  );

  return (
    <>
      <StudentNavbar />
      {selectedVideoUrl ? (
        <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 ${isModalOpen ? '' : 'hidden'}`}>
          <div className={`relative w-full max-w-4xl rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              onClick={handleCloseVideoModal}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <video controls className="w-full" autoPlay>
              <source src={selectedVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      ) : (
        <VideoModal
          isOpen={isModalOpen}
          onClose={handleCloseVideoModal}
          videoId={selectedVideoId}
        />
      )}
      <div className={`min-h-screen pt-20 transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className={`flex flex-wrap justify-center mb-8 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? isDark
                        ? 'border-blue-400 text-blue-400'
                        : 'border-blue-500 text-blue-600'
                      : isDark
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          {renderSearchBar()}

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === 'pdf-notes' && renderPDFNotes()}
            {activeTab === 'computative' && renderComputative()}
            {activeTab === 'videos' && renderVideos()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Library;