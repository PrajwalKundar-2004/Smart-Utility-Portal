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
export const uploadToCloudinary = (buffer, originalname, folder = 'assignments') => {
  return new Promise((resolve, reject) => {
    // Detect extension/format
    const ext = path.extname(originalname).toLowerCase();
    const isPdf = ext === '.pdf';
    // Use the exact same name as the file
    const cleanBaseName = path.basename(originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // In Cloudinary, uploading with resource_type: 'auto' (or 'image') allows PDFs
    // to be indexed in the main Media Library, generate visual page thumbnails, and be delivered as PDF documents.
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        public_id: cleanBaseName,
        use_filename: true,
        unique_filename: false,
        format: isPdf ? 'pdf' : undefined,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url || result.url,
          public_id: result.public_id,
          bytes: result.bytes,
          format: result.format || (isPdf ? 'pdf' : ext.replace('.', '')),
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

export const getSignedDownloadUrl = (publicId, format = 'pdf', resourceType = 'image') => {
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: 'upload',
  });
};

export default cloudinary;
