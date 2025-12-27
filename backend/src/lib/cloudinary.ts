import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string = 'saddleup/images'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format || 'jpg',
            bytes: result.bytes || 0,
          });
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Upload video to Cloudinary with compression
 */
export async function uploadVideo(
  buffer: Buffer,
  folder: string = 'saddleup/videos',
  maxDuration: number = 60
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'video',
        transformation: [
          { quality: 'auto', fetch_format: 'mp4' },
        ],
        eager: [
          { width: 640, height: 480, crop: 'limit', format: 'jpg' }, // Thumbnail
        ],
        eager_async: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            duration: result.duration,
            format: result.format || 'mp4',
            bytes: result.bytes || 0,
          });
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Get video thumbnail URL
 */
export function getVideoThumbnail(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    transformation: [
      { width: 640, height: 480, crop: 'limit' },
    ],
  });
}

/**
 * Delete media from Cloudinary
 */
export async function deleteMedia(publicId: string, resourceType: 'image' | 'video'): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}
