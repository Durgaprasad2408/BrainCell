import React from 'react';
import { Loader, FileText, Video, Link as LinkIcon } from 'lucide-react';
import ResourceActions from './ResourceActions';

const LibraryTable = ({
  resources,
  loading,
  isDark,
  onView,
  onDelete
}) => {
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


  return (
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
                    <ResourceActions
                      resource={resource}
                      onView={onView}
                      onDelete={onDelete}
                      isDark={isDark}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LibraryTable;