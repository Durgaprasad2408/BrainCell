import React from 'react';
import { Upload } from 'lucide-react';

const VideoBuilder = ({
  videoData,
  setVideoData,
  isDark
}) => {
  return (
    <div>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Video Content
      </h3>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Video URL
          </label>
          <input
            type="url"
            value={videoData.videoUrl}
            onChange={(e) => setVideoData({ ...videoData, videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div className="text-center">
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>OR</p>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Upload Video File
          </label>
          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoData({ ...videoData, videoFile: e.target.files[0] })}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className={`cursor-pointer px-4 py-2 rounded-lg font-medium ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Choose File
            </label>
            {videoData.videoFile && (
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Selected: {videoData.videoFile.name}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Description
          </label>
          <textarea
            value={videoData.description}
            onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
            placeholder="Describe what this video covers..."
            rows={4}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Transcript (Optional)
          </label>
          <textarea
            value={videoData.transcript}
            onChange={(e) => setVideoData({ ...videoData, transcript: e.target.value })}
            placeholder="Paste the video transcript here..."
            rows={6}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoBuilder;