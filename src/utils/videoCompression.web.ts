// Direct import to avoid circular dependency
import { media } from '../shared/lib/platform/media';

let ffmpegInstance: any = null;
let isFFmpegLoaded = false;

/**
 * 🎥 INITIALIZE FFMPEG
 * Loads FFmpeg WebAssembly module (only once)
 * Uses dynamic import to avoid bundling FFmpeg in production
 */
async function loadFFmpeg(): Promise<any> {
  if (ffmpegInstance && isFFmpegLoaded) {
    return ffmpegInstance;
  }

  console.log('🎥 [FFMPEG] Loading FFmpeg WebAssembly...');

  try {
    // Dynamically import FFmpeg to avoid bundling issues
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

    const ffmpeg = new FFmpeg();

    // Load FFmpeg core from CDN
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    isFFmpegLoaded = true;

    console.log('🎥 [FFMPEG] ✅ FFmpeg loaded successfully');

    return ffmpeg;
  } catch (error) {
    console.error('🎥 [FFMPEG] ❌ Failed to load FFmpeg:', error);
    throw new Error('Failed to load FFmpeg: ' + (error as Error).message);
  }
}

/**
 * 🎥 COMPRESS VIDEO
 * Compresses video to 720p, max 30 seconds, ~5MB
 */
export async function compressVideo(
  file: File,
  maxDuration: number = 30,
  maxWidth: number = 1280,
  maxHeight: number = 720
): Promise<File> {
  console.log(`🎥 [COMPRESS] Starting compression: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

  try {
    const ffmpeg = await loadFFmpeg();

    // Write input file to FFmpeg virtual filesystem
    await ffmpeg.writeFile('input.mp4', await fetchFile(file));

    console.log('🎥 [COMPRESS] Processing video...');

    // FFmpeg command:
    // -i input.mp4          : Input file
    // -t 30                 : Trim to 30 seconds
    // -vf scale=1280:720    : Resize to 720p
    // -c:v libx264          : H.264 codec
    // -crf 28               : Quality (23=high, 28=medium, lower is better)
    // -preset fast          : Encoding speed
    // -c:a aac              : Audio codec
    // -b:a 128k             : Audio bitrate
    // output.mp4            : Output file
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-t', maxDuration.toString(),
      '-vf', `scale=${maxWidth}:${maxHeight}:force_original_aspect_ratio=decrease`,
      '-c:v', 'libx264',
      '-crf', '28',
      '-preset', 'fast',
      '-c:a', 'aac',
      '-b:a', '128k',
      'output.mp4'
    ]);

    console.log('🎥 [COMPRESS] Reading compressed video...');

    // Read output file
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data], { type: 'video/mp4' });
    const compressedFile = new File([blob], file.name, {
      type: 'video/mp4',
      lastModified: Date.now()
    });

    // Cleanup
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile('output.mp4');

    console.log(
      `🎥 [COMPRESS] ✅ Success: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction)`
    );

    return compressedFile;
  } catch (error) {
    console.error('🎥 [COMPRESS] ❌ Error:', error);
    throw new Error('Ошибка при сжатии видео: ' + (error as Error).message);
  }
}

/**
 * 🎬 GENERATE VIDEO THUMBNAIL
 * Extracts first frame as thumbnail
 */
export async function generateVideoThumbnail(file: File): Promise<File> {
  console.log(`🎬 [THUMBNAIL] Generating thumbnail for: ${file.name}`);

  try {
    const ffmpeg = await loadFFmpeg();

    // Write input file
    await ffmpeg.writeFile('input.mp4', await fetchFile(file));

    console.log('🎬 [THUMBNAIL] Extracting first frame...');

    // FFmpeg command:
    // -i input.mp4          : Input file
    // -ss 00:00:01          : Seek to 1 second
    // -vframes 1            : Extract 1 frame
    // -vf scale=200:200     : Resize to 200x200
    // thumbnail.jpg         : Output file
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-ss', '00:00:01',
      '-vframes', '1',
      '-vf', 'scale=200:200:force_original_aspect_ratio=decrease',
      'thumbnail.jpg'
    ]);

    // Read output file
    const data = await ffmpeg.readFile('thumbnail.jpg');
    const blob = new Blob([data], { type: 'image/jpeg' });
    const thumbnailFile = new File([blob], 'thumbnail.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    // Cleanup
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile('thumbnail.jpg');

    console.log(`🎬 [THUMBNAIL] ✅ Generated: ${(thumbnailFile.size / 1024).toFixed(2)}KB`);

    return thumbnailFile;
  } catch (error) {
    console.error('🎬 [THUMBNAIL] ❌ Error:', error);
    throw new Error('Ошибка при создании thumbnail: ' + (error as Error).message);
  }
}

/**
 * 📐 GET VIDEO METADATA
 * Extracts duration, width, height
 */
export async function getVideoMetadata(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  return media.getVideoMetadata(file);
}

/**
 * 🎥 CHECK IF VIDEO IS TOO LONG
 * Returns true if video is longer than maxDuration
 */
export async function isVideoTooLong(file: File, maxDuration: number = 30): Promise<boolean> {
  try {
    const metadata = await getVideoMetadata(file);
    return metadata.duration > maxDuration;
  } catch (error) {
    console.error('Error checking video duration:', error);
    return false;
  }
}

/**
 * 🎥 CHECK IF VIDEO IS TOO LARGE
 * Returns true if video is larger than maxSize (in MB)
 */
export function isVideoTooLarge(file: File, maxSizeMB: number = 50): boolean {
  const fileSizeMB = file.size / 1024 / 1024;
  return fileSizeMB > maxSizeMB;
}

/**
 * 🎥 VALIDATE VIDEO FILE
 * Checks if file is a valid video and within limits
 */
export async function validateVideo(file: File): Promise<{
  valid: boolean;
  error?: string;
  metadata?: {
    duration: number;
    width: number;
    height: number;
    sizeMB: number;
  };
}> {
  // Check file type
  if (!file.type.startsWith('video/')) {
    return { valid: false, error: 'Файл не является видео' };
  }

  // Check file size (max 100MB for upload)
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > 100) {
    return { valid: false, error: 'Видео слишком большое (макс 100MB)' };
  }

  try {
    // Get metadata
    const metadata = await getVideoMetadata(file);

    return {
      valid: true,
      metadata: {
        ...metadata,
        sizeMB
      }
    };
  } catch (error) {
    return { valid: false, error: 'Не удалось прочитать метаданные видео' };
  }
}

