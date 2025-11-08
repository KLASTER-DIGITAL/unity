/**
 * React Native Readiness Test Component
 *
 * Admin panel component for testing React Native migration readiness
 *
 * @author UNITY Team
 * @date 2025-10-24
 */

import { useState } from 'react';
import { checkReactNativeReadiness, type ReadinessReport } from '@/shared/lib/platform';

export function ReactNativeReadinessTest() {
	const [report, setReport] = useState<ReadinessReport | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const runTest = async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await checkReactNativeReadiness();
			setReport(result);

			// Log to console for debugging
			console.log('React Native Readiness Report:', result);

			// Download report as JSON
			const blob = new Blob([JSON.stringify(result, null, 2)], {
				type: 'application/json',
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `react-native-readiness-${new Date().toISOString()}.json`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
			console.error('React Native Readiness Test failed:', err);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'ready':
				return 'text-green-600';
			case 'partial':
				return 'text-yellow-600';
			case 'not_ready':
				return 'text-red-600';
			default:
				return 'text-muted-foreground';
		}
	};

	const getStatusEmoji = (status: string) => {
		switch (status) {
			case 'ready':
				return '✅';
			case 'partial':
				return '⚠️';
			case 'not_ready':
				return '❌';
			default:
				return '❓';
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 90) {
			return 'text-green-600';
		}
		if (score >= 70) {
			return 'text-yellow-600';
		}
		return 'text-red-600';
	};

	return (
		<div className="rounded-lg bg-card p-6 shadow">
			<div className="mb-6">
				<h2 className="mb-2 font-bold text-2xl">React Native Readiness Test</h2>
				<p className="text-muted-foreground">
					Проверка готовности всех platform adapters для миграции на React Native
				</p>
			</div>

			<button
				className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors duration-300 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
				disabled={loading}
				onClick={runTest}
			>
				{loading ? 'Тестирование...' : 'Запустить тест'}
			</button>

			{error && (
				<div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
					<p className="font-semibold text-red-600">Ошибка:</p>
					<p className="text-red-600">{error}</p>
				</div>
			)}

			{report && (
				<div className="mt-6 space-y-6">
					{/* Overall Status */}
					<div className="rounded-lg border border-blue-200 bg-linear-to-r from-blue-50 to-purple-50 p-6">
						<div className="mb-4 flex items-center justify-between">
							<div>
								<h3 className="mb-1 font-bold text-xl">Общий статус</h3>
								<p className="text-muted-foreground text-sm">
									{new Date(report.timestamp).toLocaleString('ru-RU')}
								</p>
							</div>
							<div className="text-right">
								<div className={`font-bold text-4xl ${getScoreColor(report.overallScore)}`}>
									{report.overallScore}%
								</div>
								<div className={`text-lg ${getStatusColor(report.overall)}`}>
									{getStatusEmoji(report.overall)} {report.overall.toUpperCase()}
								</div>
							</div>
						</div>

						{/* Progress Bar */}
						<div className="h-4 w-full overflow-hidden rounded-full bg-muted">
							<div
								className={`h-full transition-all duration-500 ${
									report.overallScore >= 90
										? 'bg-green-500'
										: report.overallScore >= 70
											? 'bg-yellow-500'
											: 'bg-red-500'
								}`}
								style={{ width: `${report.overallScore}%` }}
							/>
						</div>
					</div>

					{/* Individual Checks */}
					<div className="space-y-4">
						<h3 className="font-bold text-lg">Детальные проверки</h3>

						{report.checks.map((check, index) => (
							<div
								className="rounded-lg border border-border bg-muted p-4 transition-shadow hover:shadow-md"
								key={index}
							>
								<div className="mb-2 flex items-start justify-between">
									<div className="flex-1">
										<div className="mb-1 flex items-center gap-2">
											<span className="text-xl">{getStatusEmoji(check.status)}</span>
											<h4 className="font-semibold text-lg">{check.name}</h4>
										</div>
										<p className="text-muted-foreground text-sm">{check.details}</p>
									</div>
									<div className="ml-4 text-right">
										<div className={`font-bold text-2xl ${getScoreColor(check.score)}`}>
											{check.score}%
										</div>
										<div className={`text-sm ${getStatusColor(check.status)}`}>{check.status}</div>
									</div>
								</div>

								{/* Mini Progress Bar */}
								<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
									<div
										className={`h-full transition-all ${
											check.score >= 90
												? 'bg-green-500'
												: check.score >= 70
													? 'bg-yellow-500'
													: 'bg-red-500'
										}`}
										style={{ width: `${check.score}%` }}
									/>
								</div>
							</div>
						))}
					</div>

					{/* Summary */}
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<h3 className="mb-2 font-bold">📊 Сводка</h3>
						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<div className="font-bold text-2xl text-green-600">
									{report.checks.filter((c) => c.status === 'ready').length}
								</div>
								<div className="text-muted-foreground text-sm">Готово</div>
							</div>
							<div>
								<div className="font-bold text-2xl text-yellow-600">
									{report.checks.filter((c) => c.status === 'partial').length}
								</div>
								<div className="text-muted-foreground text-sm">Частично</div>
							</div>
							<div>
								<div className="font-bold text-2xl text-red-600">
									{report.checks.filter((c) => c.status === 'not_ready').length}
								</div>
								<div className="text-muted-foreground text-sm">Не готово</div>
							</div>
						</div>
					</div>

					{/* Recommendations */}
					<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
						<h3 className="mb-2 font-bold">💡 Рекомендации</h3>
						<ul className="space-y-2 text-sm">
							{report.overallScore >= 95 && (
								<li className="text-green-600">
									✅ Отличная готовность! Можно начинать миграцию на React Native
								</li>
							)}
							{report.overallScore >= 80 && report.overallScore < 95 && (
								<li className="text-yellow-600">
									⚠️ Хорошая готовность, но есть области для улучшения
								</li>
							)}
							{report.overallScore < 80 && (
								<li className="text-red-600">❌ Требуется дополнительная работа перед миграцией</li>
							)}

							{report.checks
								.filter((c) => c.status !== 'ready')
								.map((check, index) => (
									<li className="text-foreground" key={index}>
										• {check.name}: {check.details}
									</li>
								))}
						</ul>
					</div>

					{/* Actions */}
					<div className="flex gap-4">
						<button
							className="rounded-lg bg-muted px-4 py-2 text-white transition-colors hover:bg-muted"
							onClick={() => {
								const text = JSON.stringify(report, null, 2);
								navigator.clipboard.writeText(text);
								alert('Отчет скопирован в буфер обмена!');
							}}
						>
							📋 Копировать JSON
						</button>

						<button
							className="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
							onClick={() => {
								console.log('React Native Readiness Report:', report);
								alert('Отчет выведен в консоль браузера');
							}}
						>
							🔍 Показать в консоли
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
