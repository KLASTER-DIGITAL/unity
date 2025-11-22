/**
 * Books Analytics Tab
 * 
 * Displays analytics for books generation (FREE vs PREMIUM, conversion, usage)
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { createClient } from '@/utils/supabase/client';

type BooksAnalytics = {
	totalBooks: number;
	freeBooks: number;
	premiumBooks: number;
	conversionRate: number; // FREE → PREMIUM
	avgGenerationTime: number; // seconds
	cacheHitRate: number; // percentage
	booksByType: {
		month: number;
		quarter: number;
		year: number;
		family: number;
		custom: number;
	};
};

export function BooksAnalyticsTab() {
	const [analytics, setAnalytics] = useState<BooksAnalytics | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadAnalytics = async () => {
			try {
				const supabase = createClient();
				const { data: { session } } = await supabase.auth.getSession();
				
				if (!session) return;

				// Get all books
				const { data: books, error } = await supabase
					.from('books_archive')
					.select('plan_type, type, created_at');

				if (error) {
					console.error('[BOOKS-ANALYTICS] Error:', error);
					return;
				}

				// Calculate analytics
				const totalBooks = books?.length || 0;
				const freeBooks = books?.filter(b => b.plan_type === 'free').length || 0;
				const premiumBooks = books?.filter(b => b.plan_type === 'premium').length || 0;
				
				// Conversion rate (users who created FREE then PREMIUM)
				const userIds = new Set(books?.map(b => b.user_id) || []);
				let convertedUsers = 0;
				for (const userId of userIds) {
					const userBooks = books?.filter(b => b.user_id === userId) || [];
					const hasFree = userBooks.some(b => b.plan_type === 'free');
					const hasPremium = userBooks.some(b => b.plan_type === 'premium');
					if (hasFree && hasPremium) convertedUsers++;
				}
				const conversionRate = userIds.size > 0 ? (convertedUsers / userIds.size) * 100 : 0;

				// Books by type
				const booksByType = {
					month: books?.filter(b => b.type === 'month').length || 0,
					quarter: books?.filter(b => b.type === 'quarter').length || 0,
					year: books?.filter(b => b.type === 'year').length || 0,
					family: books?.filter(b => b.type === 'family').length || 0,
					custom: books?.filter(b => b.type === 'custom').length || 0,
				};

				setAnalytics({
					totalBooks,
					freeBooks,
					premiumBooks,
					conversionRate: Math.round(conversionRate * 10) / 10,
					avgGenerationTime: 0, // TODO: track in future
					cacheHitRate: 0, // TODO: track in future
					booksByType,
				});
			} catch (error) {
				console.error('[BOOKS-ANALYTICS] Error:', error);
			} finally {
				setLoading(false);
			}
		};

		loadAnalytics();
	}, []);

	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	if (!analytics) {
		return <div className="text-muted-foreground">Не удалось загрузить аналитику</div>;
	}

	return (
		<div className="space-y-4">
			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm">Всего книг</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analytics.totalBooks}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm">FREE книги</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analytics.freeBooks}</div>
						<div className="text-muted-foreground text-xs">
							{analytics.totalBooks > 0
								? Math.round((analytics.freeBooks / analytics.totalBooks) * 100)
								: 0}
							% от общего
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm">PREMIUM книги</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{analytics.premiumBooks}</div>
						<div className="text-muted-foreground text-xs">
							{analytics.totalBooks > 0
								? Math.round((analytics.premiumBooks / analytics.totalBooks) * 100)
								: 0}
							% от общего
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Conversion Rate */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Конверсия FREE → PREMIUM</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{analytics.conversionRate}%</div>
					<div className="text-muted-foreground text-xs mt-1">
						Пользователей создали FREE книгу, затем PREMIUM
					</div>
				</CardContent>
			</Card>

			{/* Books by Type */}
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Книги по типам</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-2 md:grid-cols-5">
						<div>
							<div className="text-lg font-semibold">{analytics.booksByType.month}</div>
							<div className="text-muted-foreground text-xs">Месяц</div>
						</div>
						<div>
							<div className="text-lg font-semibold">{analytics.booksByType.quarter}</div>
							<div className="text-muted-foreground text-xs">Квартал</div>
						</div>
						<div>
							<div className="text-lg font-semibold">{analytics.booksByType.year}</div>
							<div className="text-muted-foreground text-xs">Год</div>
						</div>
						<div>
							<div className="text-lg font-semibold">{analytics.booksByType.family}</div>
							<div className="text-muted-foreground text-xs">Семейная</div>
						</div>
						<div>
							<div className="text-lg font-semibold">{analytics.booksByType.custom}</div>
							<div className="text-muted-foreground text-xs">Произвольная</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

