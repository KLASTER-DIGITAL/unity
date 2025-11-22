/**
 * Book Share Button
 * 
 * Generates public share link for books
 */

import { Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { createClient } from '@/utils/supabase/client';

type BookShareButtonProps = {
	bookId: string;
	onShareGenerated?: (shareUrl: string) => void;
};

export function BookShareButton({ bookId, onShareGenerated }: BookShareButtonProps) {
	const [isGenerating, setIsGenerating] = useState(false);

	const handleShare = async () => {
		try {
			setIsGenerating(true);

			const supabase = createClient();
			const { data: { session } } = await supabase.auth.getSession();

			if (!session) {
				toast.error('Необходима авторизация');
				return;
			}

			// Generate share token via Edge Function (or direct DB call)
			const { data, error } = await supabase
				.rpc('generate_book_share_token');

			if (error) {
				// Fallback: generate token client-side
				const shareToken = btoa(bookId + Date.now()).replace(/[+/=]/g, '');
				
				const { error: updateError } = await supabase
					.from('books_archive')
					.update({
						share_token: shareToken,
						is_public: true,
						shared_at: new Date().toISOString(),
					})
					.eq('id', bookId);

				if (updateError) {
					throw updateError;
				}

				const shareUrl = `${window.location.origin}/book/${shareToken}`;
				
				// Copy to clipboard
				await navigator.clipboard.writeText(shareUrl);
				toast.success('Ссылка скопирована в буфер обмена!');
				
				onShareGenerated?.(shareUrl);
			}
		} catch (error) {
			console.error('[BOOK-SHARE] Error:', error);
			toast.error('Не удалось создать ссылку');
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Button
			className="h-7 w-7 p-0"
			disabled={isGenerating}
			onClick={handleShare}
			size="sm"
			variant="ghost"
			title="Поделиться книгой"
		>
			<Share2 className="h-3.5 w-3.5" />
		</Button>
	);
}

