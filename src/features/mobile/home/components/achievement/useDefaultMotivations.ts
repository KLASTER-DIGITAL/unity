/**
 * useDefaultMotivations Hook
 *
 * Provides default motivation cards with i18n support and automatic gradient assignment
 */

import { useTranslation } from '@/shared/lib/i18n';
import type { AchievementCard } from './types';
import { getGradientFromId } from './webgradients-collection';

export function useDefaultMotivations(): AchievementCard[] {
	const { t } = useTranslation();

	return [
		{
			id: 'default_1',
			date: t('motivation.card1.date', 'Начни сегодня'),
			title: t('motivation.card1.title', 'Сегодня отличное время'),
			description: t(
				'motivation.card1.description',
				'Запиши маленькую победу — это первый шаг к осознанию своих достижений.'
			),
			gradient: getGradientFromId('default_1'),
			isMarked: false,
			isDefault: true,
		},
		{
			id: 'default_2',
			date: t('motivation.card2.date', 'Совет дня'),
			title: t('motivation.card2.title', 'Даже одна мысль делает день осмысленным'),
			description: t(
				'motivation.card2.description',
				'Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.'
			),
			gradient: getGradientFromId('default_2'),
			isMarked: false,
			isDefault: true,
		},
		{
			id: 'default_3',
			date: t('motivation.card3.date', 'Мотивация'),
			title: t('motivation.card3.title', 'Запиши момент благодарности'),
			description: t(
				'motivation.card3.description',
				'Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.'
			),
			gradient: getGradientFromId('default_3'),
			isMarked: false,
			isDefault: true,
		},
	];
}
