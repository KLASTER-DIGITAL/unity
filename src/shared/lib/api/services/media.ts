import { createClient } from '@/utils/supabase/client';
import { API_URLS } from '../config/urls';
import { blobToBase64 } from '../core/request';
import type { MediaFile, UploadMediaOptions } from '../types';

/**
 * Upload media file (image or video)
 * @param file - File to upload
 * @param userId - User ID
 * @param options - Upload options (thumbnail, dimensions, duration, entryId)
 * @returns Uploaded media file metadata
 */
export async function uploadMedia(
	file: File,
	userId: string,
	options?: UploadMediaOptions
): Promise<MediaFile> {
	console.log('[MEDIA] 📤 Uploading media:', file.name, file.type, options);

	// Convert File to base64
	const base64File = await blobToBase64(file);

	// Convert thumbnail to base64 (if provided)
	let base64Thumbnail: string | undefined;
	if (options?.thumbnail) {
		console.log('[MEDIA] 🖼️ Converting thumbnail to base64...');
		base64Thumbnail = await blobToBase64(options.thumbnail);
	}

	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error('No active session');
	}

	const requestBody = {
		file: base64File,
		fileName: file.name,
		mimeType: file.type,
		userId,
		thumbnail: base64Thumbnail,
		width: options?.width,
		height: options?.height,
		duration: options?.duration,
		entryId: (options as any)?.entryId,
	};

	try {
		console.log('[MEDIA] 🎯 Attempting media-upload-api microservice (10s timeout)...');

		// Create abort controller for timeout (10s for file upload)
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10_000);

		const response = await fetch(`${API_URLS.MEDIA_UPLOAD}/upload`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.access_token}`,
			},
			body: JSON.stringify(requestBody),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`Microservice returned ${response.status}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(data.error || 'Microservice returned error');
		}

		console.log('[MEDIA] ✅ media-upload-api success:', data.path);

		const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

		return {
			id: data.id || '',
			userId,
			fileName: file.name,
			filePath: data.path,
			fileType: mediaType,
			fileSize: file.size,
			createdAt: new Date().toISOString(),
			url: data.url,
			path: data.path,
			type: mediaType,
			mimeType: data.mimeType,
		};
	} catch (microserviceError: any) {
		console.error('[MEDIA] ❌ Media microservice failed!');
		console.error('[MEDIA] Error:', microserviceError);
		throw new Error(`Failed to upload media: ${microserviceError.message}`);
	}
}

/**
 * Get signed URL for media file
 * @param path - File path in storage
 * @returns Signed URL for accessing the file
 */
export async function getSignedUrl(path: string): Promise<string> {
	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error('No active session');
	}

	const requestBody = { path };

	try {
		console.log('[MEDIA] 🎯 Getting signed URL via media-manage-api (5s timeout)...');

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(`${API_URLS.MEDIA_MANAGE}/signed-url`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.access_token}`,
			},
			body: JSON.stringify(requestBody),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`Microservice returned ${response.status}`);
		}

		const data = await response.json();

		if (!(data.success && data.url)) {
			throw new Error(data.error || 'No URL returned');
		}

		console.log('[MEDIA] ✅ Signed URL obtained from media-manage-api');
		return data.url;
	} catch (_microserviceError: any) {
		console.error('[MEDIA] ❌ Microservice failed, using fallback...');

		// Fallback: Direct Supabase Storage
		const { data, error } = await supabase.storage.from('media').createSignedUrl(path, 3600);

		if (error || !data?.signedUrl) {
			console.error('[MEDIA] ❌ Fallback also failed:', error);
			throw new Error('Failed to get signed URL');
		}

		console.log('[MEDIA] ✅ Fallback success');
		return data.signedUrl;
	}
}

/**
 * Delete media file
 * @param path - File path in storage
 */
export async function deleteMedia(path: string): Promise<void> {
	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error('No active session');
	}

	try {
		console.log('[MEDIA] 🎯 Attempting media-manage-api for delete (5s timeout)...');

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(`${API_URLS.MEDIA_MANAGE}/${encodeURIComponent(path)}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.access_token}`,
			},
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`Microservice returned ${response.status}`);
		}

		const data = await response.json();

		if (!data.success) {
			throw new Error(data.error || 'Delete failed');
		}

		console.log('[MEDIA] ✅ Media deleted via media-manage-api');
		return;
	} catch (_microserviceError: any) {
		console.error('[MEDIA] ❌ Microservice failed, using fallback...');

		// Fallback: Direct Supabase Storage
		const { error } = await supabase.storage.from('media').remove([path]);

		if (error) {
			console.error('[MEDIA] ❌ Fallback also failed:', error);
			throw new Error('Failed to delete media');
		}

		console.log('[MEDIA] ✅ Media deleted via fallback');
	}
}
