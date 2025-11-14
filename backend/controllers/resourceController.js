import Resource from '../models/Resource.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const uploadToCloudinary = (buffer, resourceType, folder, flags) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: resourceType,
      folder: folder
    };

    if (flags) {
      uploadOptions.flags = flags;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

export const createResource = async (req, res) => {
  try {
    const { title, type, subCategory, category, url, status } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required'
      });
    }

    let resourceData = {
      title,
      type,
      subCategory,
      category,
      status: status || 'Published',
      createdBy: req.user._id
    };

    if (type === 'link') {
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required for link resources'
        });
      }
      resourceData.url = url;
    } else if (req.file) {
      // Upload file to Cloudinary
      const resourceType = type === 'video' ? 'video' : 'raw';
      const folder = `resources/${type === 'video' ? 'videos' : 'pdfs'}`;
      const flags = resourceType === 'raw' ? 'attachment' : undefined;

      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        resourceType,
        folder,
        flags
      );

      resourceData.url = uploadResult.secure_url;
      resourceData.cloudinaryPublicId = uploadResult.public_id;

      if (resourceType === 'raw') {
        resourceData.size = `${(uploadResult.bytes / 1024 / 1024).toFixed(2)} MB`;
      } else if (resourceType === 'video') {
        resourceData.duration = uploadResult.duration;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'File is required for PDF/Video resources'
      });
    }

    const resource = await Resource.create(resourceData);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resource',
      error: error.message
    });
  }
};

export const getAllResources = async (req, res) => {
  try {
    const { type, search, subCategory } = req.query;

    let query = {};

    if (type && type !== 'all') {
      query.type = type;
    }

    if (subCategory && subCategory !== 'all') {
      if (subCategory.includes(',')) {
        query.subCategory = { $in: subCategory.split(',') };
      } else {
        query.subCategory = subCategory;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message
    });
  }
};

export const getPublishedResources = async (req, res) => {
  try {
    const { subCategory, search } = req.query;

    let query = { status: 'Published' };

    if (subCategory && subCategory !== 'all') {
      if (subCategory.includes(',')) {
        query.subCategory = { $in: subCategory.split(',') };
      } else {
        query.subCategory = subCategory;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching published resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message
    });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { title, category, status } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (title) resource.title = title;
    if (category) resource.category = category;
    if (status) resource.status = status;

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resource',
      error: error.message
    });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Delete from Cloudinary if it has a public ID
    if (resource.cloudinaryPublicId) {
      const resourceType = resource.type === 'video' ? 'video' : 'raw';
      await cloudinary.uploader.destroy(resource.cloudinaryPublicId, {
        resource_type: resourceType
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource',
      error: error.message
    });
  }
};

export const getResourceStats = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    const pdfCount = await Resource.countDocuments({ type: 'pdf' });
    const videoCount = await Resource.countDocuments({ type: 'video' });
    const linkCount = await Resource.countDocuments({ type: 'link' });

    res.status(200).json({
      success: true,
      data: {
        totalResources,
        pdfCount,
        videoCount,
        linkCount
      }
    });
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource stats',
      error: error.message
    });
  }
};

export const incrementEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'view', 'download', 'click'

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (type === 'view' && resource.type === 'video') {
      resource.views = (resource.views || 0) + 1;
    } else if (type === 'download' && resource.type === 'pdf') {
      resource.downloads = (resource.downloads || 0) + 1;
    } else if (type === 'click' && resource.type === 'link') {
      resource.clicks = (resource.clicks || 0) + 1;
    }

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Engagement updated successfully'
    });
  } catch (error) {
    console.error('Error updating engagement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update engagement',
      error: error.message
    });
  }
};

export const getDownloadUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.type !== 'pdf') {
      return res.status(400).json({
        success: false,
        message: 'Download URL only available for PDF resources'
      });
    }

    // Increment download counter
    resource.downloads = (resource.downloads || 0) + 1;
    await resource.save();

    // Create download URL with attachment flag
    const downloadUrl = resource.url.replace('/upload/', '/upload/fl_attachment/');

    res.status(200).json({
      success: true,
      data: {
        url: downloadUrl,
        filename: `${resource.title}.pdf`
      }
    });
  } catch (error) {
    console.error('Error getting download URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get download URL',
      error: error.message
    });
  }
};

export const getInstructorResourceStats = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { period = 'all' } = req.query;

    const totalResources = await Resource.countDocuments({ createdBy: instructorId });
    const publishedResources = await Resource.countDocuments({ createdBy: instructorId, status: 'Published' });
    const draftResources = await Resource.countDocuments({ createdBy: instructorId, status: 'Draft' });

    // Calculate date range based on period
    let startDate;
    const now = new Date();

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1w':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    const resourcesInPeriod = await Resource.find({
      createdBy: instructorId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Group by date for chart
    const resourceChartData = {};
    resourcesInPeriod.forEach(resource => {
      const date = resource.createdAt.toISOString().split('T')[0];
      resourceChartData[date] = (resourceChartData[date] || 0) + 1;
    });

    const chartLabels = Object.keys(resourceChartData).sort();
    const chartData = chartLabels.map(date => resourceChartData[date]);

    res.status(200).json({
      success: true,
      data: {
        totalResources,
        publishedResources,
        draftResources,
        resourceChart: {
          labels: chartLabels,
          data: chartData
        }
      }
    });
  } catch (error) {
    console.error('Error fetching instructor resource stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource stats',
      error: error.message
    });
  }
};