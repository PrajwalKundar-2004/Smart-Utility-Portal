import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './src/backend/.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} originalname - Original file name
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<{ url: string, public_id: string, bytes: number, format: string }>}
 */
export const uploadToCloudinary = (buffer, originalname, folder = 'assignments', customResourceType = null) => {
  return new Promise((resolve, reject) => {
    // Detect extension/format
    const ext = path.extname(originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    const isVideo = ['.mp4', '.mov', '.webm', '.avi', '.mkv'].includes(ext);

    // Select optimal resource_type for Cloudinary
    let resource_type = customResourceType;
    if (!resource_type) {
      if (isImage) {
        resource_type = 'image';
      } else if (isVideo) {
        resource_type = 'video';
      } else {
        // PDFs and documents upload reliably as 'raw' without hitting capacity limits
        resource_type = 'raw';
      }
    }

    const cleanBaseName = path.basename(originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_') || 'file';
    const uniquePublicId = `${cleanBaseName}_${Date.now()}${resource_type === 'raw' ? ext : ''}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        public_id: uniquePublicId,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        const finalUrl = result.secure_url || result.url;
        resolve({
          url: finalUrl,
          secure_url: finalUrl,
          public_id: result.public_id,
          bytes: result.bytes,
          format: result.format || ext.replace('.', ''),
          resource_type: result.resource_type,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId 
 * @param {string} resourceType ('image' | 'raw' | 'video')
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return;
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (res?.result === 'not found' && resourceType !== 'raw') {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
  } catch (err) {
    console.error('Error deleting from Cloudinary:', err);
  }
};

export const getSignedDownloadUrl = (publicId, format = '', resourceType = 'auto') => {
  let rType = resourceType;
  if (!rType || rType === 'auto') {
    const isDoc = publicId.toLowerCase().endsWith('.pdf') ||
      publicId.toLowerCase().includes('.doc') ||
      publicId.toLowerCase().includes('.xls') ||
      publicId.toLowerCase().includes('.ppt') ||
      publicId.toLowerCase().includes('.txt');
    rType = isDoc ? 'raw' : 'image';
  }
  const fmt = rType === 'raw' ? '' : (format || '');
  return cloudinary.utils.private_download_url(publicId, fmt, {
    resource_type: rType,
    type: 'upload',
  });
};

export default cloudinary;
