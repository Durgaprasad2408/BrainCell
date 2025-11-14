const PLAYLIST_IDS = [
  'PLBlnK6fEyqRgp46KUv4ZY69yXmpwKOIev',
  'PLXj4XH7LcRfBkMlS_9aebcY78NLFwhE4M'
];

export const extractVideoIdFromUrl = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
};

export const extractPlaylistIdFromUrl = (url) => {
  const match = url.match(/list=([^&\s]+)/);
  return match ? match[1] : null;
};

export const fetchPlaylistVideos = async () => {
  try {
    const allVideos = [];

    for (const playlistId of PLAYLIST_IDS) {
      const url = `https://youtube138.p.rapidapi.com/playlist/videos/?id=${playlistId}&hl=en&gl=US`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '3a27027784msh07d888b5258ec15p1fa1efjsn2fd89f13dca9',
          'x-rapidapi-host': 'youtube138.p.rapidapi.com'
        }
      };

      const response = await fetch(url, options);
      const result = await response.json();

      if (result && result.contents) {
        const videos = result.contents
          .filter(item => item.video)
          .map(item => ({
            id: item.video.videoId,
            title: item.video.title,
            channel: item.video.author?.title || 'Unknown Channel',
            thumbnail: item.video.thumbnails?.[0]?.url || item.video.thumbnails?.[item.video.thumbnails.length - 1]?.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
            duration: item.video.lengthText || 'N/A',
            views: item.video.stats?.views ? formatViews(item.video.stats.views) : 'N/A',
            url: `https://www.youtube.com/watch?v=${item.video.videoId}`,
            description: item.video.descriptionSnippet || 'No description available',
            playlistId: playlistId
          }));

        allVideos.push(...videos);
      }
    }

    return allVideos;
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    return [];
  }
};

const formatViews = (views) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};
