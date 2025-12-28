import express, { Response } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { uploadImage, uploadVideo, getVideoThumbnail } from '../lib/cloudinary';
import { customAlphabet } from 'nanoid';
const generateVisibleId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|quicktime/;
    const extname = allowedTypes.test(file.mimetype.toLowerCase());
    const mimetype = allowedTypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

// Upload media
router.post(
  '/upload',
  authenticate,
  upload.single('media'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const file = req.file;
      const isVideo = file.mimetype.startsWith('video/');
      const isImage = file.mimetype.startsWith('image/');

      if (!isVideo && !isImage) {
        return res.status(400).json({ error: 'Invalid file type' });
      }

      // Upload to Cloudinary
      let uploadResult;
      if (isVideo) {
        uploadResult = await uploadVideo(file.buffer);
      } else {
        uploadResult = await uploadImage(file.buffer);
      }

      // Create media upload record
      const visibleId = generateVisibleId();
      const visibleIdDisplay = `MU-${visibleId}`;

      const mediaUpload = await prisma.mediaUpload.create({
        data: {
          visibleId,
          visibleIdDisplay,
          userId: req.userId!,
          mediaType: isVideo ? 'video' : 'photo',
          storageUrl: uploadResult.secure_url,
          thumbnailUrl: isVideo ? getVideoThumbnail(uploadResult.public_id) : uploadResult.secure_url,
          duration: uploadResult.duration ? Math.round(uploadResult.duration) : null,
          fileSize: uploadResult.bytes,
        },
      });

      res.json({
        id: mediaUpload.id,
        visibleIdDisplay: mediaUpload.visibleIdDisplay,
        url: uploadResult.secure_url,
        thumbnailUrl: mediaUpload.thumbnailUrl,
        mediaType: mediaUpload.mediaType,
        duration: mediaUpload.duration,
        fileSize: mediaUpload.fileSize,
      });
    } catch (error: any) {
      console.error('Media upload error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload media' });
    }
  }
);

// Get user's media uploads
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.query;

    const mediaUploads = await prisma.mediaUpload.findMany({
      where: {
        userId: req.userId!,
        ...(conversationId && { conversationId: conversationId as string }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(mediaUploads);
  } catch (error) {
    console.error('Get media uploads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete media upload
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const mediaUpload = await prisma.mediaUpload.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!mediaUpload) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete from Cloudinary (optional - can be handled by Cloudinary auto-delete policies)
    // await deleteMedia(mediaUpload.storageUrl, mediaUpload.mediaType);

    await prisma.mediaUpload.delete({
      where: { id: mediaUpload.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

