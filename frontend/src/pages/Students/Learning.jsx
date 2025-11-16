import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { getAllSubjects, enrollSubject, checkEnrollment } from '../../api/subjectService';
import { useTheme } from '../../contexts/ThemeContext';

const Learning = () => {
  const { isDark } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 3 rows of 3

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await getAllSubjects();
      setSubjects(response.data || []);

      const enrollmentStatus = {};
      for (const subject of response.data || []) {
        try {
          const enrollmentResponse = await checkEnrollment(subject._id);
          enrollmentStatus[subject._id] = enrollmentResponse.isEnrolled;
        } catch (error) {
          console.error('Error checking enrollment for subject:', subject._id);
        }
      }
      setEnrolledSubjects(enrollmentStatus);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (subjectId) => {
    try {
      setEnrolling(subjectId);
      await enrollSubject(subjectId);
      setEnrolledSubjects(prev => ({ ...prev, [subjectId]: true }));
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.message || 'Failed to enroll in subject');
    } finally {
      setEnrolling(null);
    }
  };

  const handleSubjectSelect = (subject) => {
    if (!enrolledSubjects[subject._id]) {
      return;
    }

    window.location.href = `/student/learning/${encodeURIComponent(subject.name)}`;
  };

  const renderSubjectCards = () => {
    const filteredSubjects = subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      const aEnrolled = enrolledSubjects[a._id];
      const bEnrolled = enrolledSubjects[b._id];
      if (aEnrolled && !bEnrolled) return -1;
      if (!aEnrolled && bEnrolled) return 1;
      return 0;
    });

    const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSubjects = filteredSubjects.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    const handlePrev = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 transition-colors duration-200 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Choose Your Subject
          </h1>
          <p className={`text-lg transition-colors duration-200 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Select a subject to start learning
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSubjects.map((subject) => {
            const isEnrolled = enrolledSubjects[subject._id];
            const isEnrollingThis = enrolling === subject._id;

            return (
              <div
                key={subject._id}
                className={`rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                    : 'bg-white border border-gray-200 hover:border-gray-300 shadow-lg'
                } ${isEnrolled ? 'cursor-pointer' : ''}`}
                onClick={() => isEnrolled && handleSubjectSelect(subject)}
              >
                <div className={`h-32 flex items-center justify-center overflow-hidden`}>
                  {subject.image ? (
                    <img
                      src={subject.image}
                      alt={subject.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center`}>
                      <span className="text-6xl">{subject.icon || '📚'}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 transition-colors duration-200 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {subject.name}
                  </h3>
                  <p className={`text-sm mb-4 transition-colors duration-200 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {subject.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {subject.lessons} lessons
                    </span>
                    <span className={`text-sm transition-colors duration-200 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {subject.students} students
                    </span>
                  </div>
                  {isEnrolled ? (
                    <div className={`w-full px-4 py-2 rounded-lg text-center font-medium ${
                      isDark
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Enrolled
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(subject._id);
                      }}
                      disabled={isEnrollingThis}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        isEnrollingThis
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {isEnrollingThis ? 'Enrolling...' : 'Enroll'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            aria-label="Previous"
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`mr-4 p-2 rounded-md transition-colors ${
              currentPage === 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 1L2 9.24242L11 17" stroke={isDark ? '#9CA3AF' : '#111820'} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="flex gap-2 text-gray-500 text-sm md:text-base">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`flex items-center justify-center active:scale-95 w-9 md:w-12 h-9 md:h-12 aspect-square rounded-md transition-all ${
                  currentPage === page
                    ? 'bg-indigo-500 text-white'
                    : `bg-white border border-gray-200 hover:bg-gray-100/70 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300`
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`ml-4 p-2 rounded-md transition-colors ${
              currentPage === totalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg width="9" height="16" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L10 9.24242L1 17" stroke={isDark ? '#9CA3AF' : '#111820'} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

  return (
    <div className={`min-h-screen transition-colors duration-200 pt-20 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {renderSubjectCards()}
    </div>
  );
};

export default Learning;
