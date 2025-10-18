/**
 * 📤 CHUNK UPLOAD UTILITY
 * Uploads large files in chunks for better reliability and progress tracking
 */

interface ChunkUploadOptions {
  file: File;
  url: string;
  chunkSize?: number; // Default: 1MB
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

interface ChunkUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload file in chunks
 */
export async function uploadFileInChunks({
  file,
  url,
  chunkSize = 1024 * 1024, // 1MB default
  headers = {},
  onProgress,
  onChunkComplete
}: ChunkUploadOptions): Promise<ChunkUploadResult> {
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  console.log(`📤 [CHUNK] Starting chunked upload: ${file.name}`);
  console.log(`📤 [CHUNK] File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  console.log(`📤 [CHUNK] Chunk size: ${(chunkSize / 1024).toFixed(0)}KB`);
  console.log(`📤 [CHUNK] Total chunks: ${totalChunks}`);

  try {
    // Upload each chunk
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      console.log(`📤 [CHUNK] Uploading chunk ${chunkIndex + 1}/${totalChunks} (${(chunk.size / 1024).toFixed(0)}KB)`);

      // Create FormData for chunk
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size.toString());

      // Upload chunk
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          // Don't set Content-Type - let browser set it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Chunk ${chunkIndex + 1} upload failed: ${response.status}`);
      }

      // Update progress
      const progress = ((chunkIndex + 1) / totalChunks) * 100;
      onProgress?.(progress);
      onChunkComplete?.(chunkIndex, totalChunks);

      console.log(`📤 [CHUNK] ✅ Chunk ${chunkIndex + 1}/${totalChunks} uploaded (${progress.toFixed(0)}%)`);
    }

    console.log(`📤 [CHUNK] 🎉 All chunks uploaded successfully`);

    return {
      success: true,
      url: url
    };

  } catch (error) {
    console.error('📤 [CHUNK] ❌ Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Upload file with automatic chunking for large files
 */
export async function smartUpload({
  file,
  url,
  threshold = 5 * 1024 * 1024, // 5MB threshold
  headers = {},
  onProgress
}: {
  file: File;
  url: string;
  threshold?: number;
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
}): Promise<ChunkUploadResult> {
  // Use chunked upload for large files
  if (file.size > threshold) {
    console.log(`📤 [SMART] File is large (${(file.size / 1024 / 1024).toFixed(2)}MB), using chunked upload`);
    return uploadFileInChunks({
      file,
      url,
      headers,
      onProgress
    });
  }

  // Use regular upload for small files
  console.log(`📤 [SMART] File is small (${(file.size / 1024 / 1024).toFixed(2)}MB), using regular upload`);
  
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    onProgress?.(100);

    return {
      success: true,
      url: url
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Resume interrupted upload
 */
export async function resumeUpload({
  file,
  url,
  uploadedChunks,
  chunkSize = 1024 * 1024,
  headers = {},
  onProgress
}: {
  file: File;
  url: string;
  uploadedChunks: number[]; // Array of uploaded chunk indices
  chunkSize?: number;
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
}): Promise<ChunkUploadResult> {
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  console.log(`📤 [RESUME] Resuming upload: ${file.name}`);
  console.log(`📤 [RESUME] Already uploaded: ${uploadedChunks.length}/${totalChunks} chunks`);

  try {
    // Upload only missing chunks
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // Skip already uploaded chunks
      if (uploadedChunks.includes(chunkIndex)) {
        console.log(`📤 [RESUME] Skipping chunk ${chunkIndex + 1}/${totalChunks} (already uploaded)`);
        continue;
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      console.log(`📤 [RESUME] Uploading chunk ${chunkIndex + 1}/${totalChunks}`);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size.toString());

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Chunk ${chunkIndex + 1} upload failed: ${response.status}`);
      }

      const progress = ((uploadedChunks.length + chunkIndex + 1) / totalChunks) * 100;
      onProgress?.(progress);
    }

    console.log(`📤 [RESUME] 🎉 Upload resumed and completed`);

    return {
      success: true,
      url: url
    };

  } catch (error) {
    console.error('📤 [RESUME] ❌ Resume failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

