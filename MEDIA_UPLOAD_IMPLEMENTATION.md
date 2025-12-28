# Media Upload & Video Player Enhancement - Implementation

## Overview

This implementation adds full media upload functionality with Cloudinary integration and enhanced video player controls with timestamp markers on the timeline.

## Implementation Details

### Backend Changes

#### 1. Cloudinary Integration (`backend/src/lib/cloudinary.ts`)

- `uploadImage()` - Uploads images with automatic optimization
- `uploadVideo()` - Uploads videos with compression and thumbnail generation
- `getVideoThumbnail()` - Generates thumbnail URLs for videos
- `deleteMedia()` - Removes media from Cloudinary

**Configuration:**
- Images: Auto quality, auto format
- Videos: MP4 format, auto quality, thumbnail generation
- Folder structure: `saddleup/images` and `saddleup/videos`

#### 2. Media Upload API (`backend/src/routes/media.ts`)

**Endpoints:**
- `POST /api/media/upload` - Upload media file (photo or video)
- `GET /api/media` - Get user's media uploads
- `DELETE /api/media/:id` - Delete media upload

**Features:**
- Multer for file handling (memory storage)
- 100MB file size limit
- File type validation (images and videos)
- Automatic Cloudinary upload
- Media record creation in database
- Thumbnail generation for videos

#### 3. Environment Variables

Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Frontend Changes

#### 1. Chat Interface Updates (`frontend/app/(tabs)/chat.tsx`)

**New Features:**
- Media picker button (camera icon)
- Camera/photo library selection
- Photo and video capture
- Media preview before sending
- Upload progress indicator
- Media display in messages

**Permissions:**
- Camera permission request
- Photo library permission request

**Media Options:**
- Take Photo
- Take Video (max 60 seconds)
- Choose from Library

#### 2. Enhanced Video Player (`frontend/app/message-detail/[messageId].tsx`)

**New Features:**
- Custom video controls
- Play/pause button
- Timeline with progress indicator
- Timestamp markers on timeline
- Current time / total duration display
- Clickable timestamp markers that seek video
- Color-coded markers (by feedback type)

**Timeline Features:**
- Progress bar showing playback position
- Visual markers for each timestamp reference
- Markers color-coded by type (green=positive, orange=concern, blue=instruction)
- Click markers to jump to that timestamp
- Shows current time and total duration

#### 3. Video Player Component

**Controls:**
- ▶/⏸ Play/Pause button
- Timeline scrubber with progress
- Timestamp markers overlay
- Time display (current / total)

**Markers:**
- Positioned at exact timestamp locations
- Color-coded by feedback type
- Clickable to seek to that moment
- White border for visibility

## Usage Flow

### Uploading Media

1. User taps camera button in chat
2. Selects "Take Photo", "Take Video", or "Choose from Library"
3. Captures/selects media
4. Media uploads to Cloudinary automatically
5. Preview appears in chat input
6. User can remove preview or send message with media
7. Media included in message when sent

### Video Analysis with Timestamps

1. User uploads video and asks question
2. AI analyzes and provides timestamp feedback
3. Backend extracts timestamp references
4. User views message detail screen
5. Video player shows with timeline
6. Timestamp markers visible on timeline
7. User can:
   - Play/pause video
   - See progress on timeline
   - Click timestamp markers to jump to moments
   - See color-coded feedback types

## Media Storage Structure

### Cloudinary Folders
- `saddleup/images/` - All uploaded images
- `saddleup/videos/` - All uploaded videos

### Database Records
- `MediaUpload` model stores:
  - Storage URL (Cloudinary secure URL)
  - Thumbnail URL (for videos)
  - Media type (photo/video)
  - File size
  - Duration (for videos)
  - User association
  - Conversation/message associations

## Video Player Timeline Markers

### Marker Positioning
- Markers positioned at exact timestamp locations on timeline
- Calculation: `(timestampSeconds / totalDuration) * 100%`
- Positioned absolutely on timeline bar

### Marker Colors
- **Green** (#4CAF50): Positive feedback
- **Orange** (#FF9800): Concerns/warnings
- **Blue** (#2196F3): Instructions
- **Brown** (#8B7355): Default/other

### Marker Interaction
- Click marker to seek video to that timestamp
- Video starts playing when marker clicked
- Timeline updates as video plays

## File Size Limits

- **Maximum file size**: 100MB
- **Video duration**: 60 seconds (enforced in picker)
- **Image quality**: Auto-optimized by Cloudinary
- **Video format**: MP4 (converted automatically)

## Security & Permissions

- Camera permission required for taking photos/videos
- Photo library permission required for selecting media
- User authentication required for all uploads
- Files validated before upload
- User can only delete their own media

## Next Steps (Future Enhancements)

1. **Video Trimming**: Allow users to trim videos before upload
2. **Multiple Media**: Support multiple images/videos in one message
3. **Media Gallery**: View all uploaded media in user profile
4. **Media Download**: Allow downloading original files
5. **Video Compression**: Client-side compression before upload
6. **Progress Indicator**: Show upload progress percentage
7. **Retry Failed Uploads**: Handle network failures gracefully
8. **Media Sharing**: Share media with other users/instructors

## Testing

1. Test image upload (camera and library)
2. Test video upload (camera and library)
3. Verify video playback with controls
4. Test timestamp marker clicking
5. Verify timeline progress updates
6. Test media deletion
7. Verify permissions handling
8. Test file size limits
9. Verify thumbnail generation for videos
10. Test media display in chat messages

