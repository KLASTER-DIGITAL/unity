/**
 * Push Notification Templates
 *
 * Мультиязычные шаблоны для push уведомлений
 * Поддерживаемые языки: ru, en, es, de, fr, zh, ja
 */

export type PushTemplateType =
  | 'daily_reminder'
  | 'weekly_report'
  | 'achievement_unlocked'
  | 'motivational'
  | 'streak_milestone'
  | 'custom';

export type PushTemplate = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
};

export type PushTemplateVariables = {
  userName?: string;
  streakDays?: number;
  achievementName?: string;
  weeklyStats?: {
    totalEntries: number;
    successRate: number;
  };
  customMessage?: string;
};

/**
 * Шаблоны push уведомлений на всех языках
 */
const PUSH_TEMPLATES: Record<string, Record<PushTemplateType, PushTemplate>> = {
  // Русский
  ru: {
    daily_reminder: {
      title: '📝 Время для записи!',
      body: 'Не забудьте записать свои достижения сегодня',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    weekly_report: {
      title: '📊 Еженедельный отчет',
      body: 'Ваша статистика за неделю готова!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    achievement_unlocked: {
      title: '🏆 Новое достижение!',
      body: 'Поздравляем! Вы разблокировали новое достижение',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    motivational: {
      title: '💪 Мотивация дня',
      body: 'Каждый день - это новая возможность стать лучше!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    streak_milestone: {
      title: '🔥 Серия продолжается!',
      body: 'Вы ведете дневник уже {streakDays} дней подряд!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    custom: {
      title: 'Уведомление',
      body: '{customMessage}',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
  },

  // English
  en: {
    daily_reminder: {
      title: '📝 Time to write!',
      body: "Don't forget to record your achievements today",
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    weekly_report: {
      title: '📊 Weekly Report',
      body: 'Your weekly statistics are ready!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    achievement_unlocked: {
      title: '🏆 New Achievement!',
      body: 'Congratulations! You unlocked a new achievement',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    motivational: {
      title: '💪 Daily Motivation',
      body: 'Every day is a new opportunity to become better!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    streak_milestone: {
      title: '🔥 Streak continues!',
      body: "You've been journaling for {streakDays} days in a row!",
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    custom: {
      title: 'Notification',
      body: '{customMessage}',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
  },

  // Español
  es: {
    daily_reminder: {
      title: '📝 ¡Hora de escribir!',
      body: 'No olvides registrar tus logros hoy',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    weekly_report: {
      title: '📊 Informe Semanal',
      body: '¡Tus estadísticas semanales están listas!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    achievement_unlocked: {
      title: '🏆 ¡Nuevo Logro!',
      body: '¡Felicitaciones! Has desbloqueado un nuevo logro',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    motivational: {
      title: '💪 Motivación del Día',
      body: '¡Cada día es una nueva oportunidad para mejorar!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    streak_milestone: {
      title: '🔥 ¡La racha continúa!',
      body: '¡Has estado escribiendo durante {streakDays} días seguidos!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    custom: {
      title: 'Notificación',
      body: '{customMessage}',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
  },

  // Deutsch
  de: {
    daily_reminder: {
      title: '📝 Zeit zum Schreiben!',
      body: 'Vergiss nicht, deine Erfolge heute aufzuzeichnen',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    weekly_report: {
      title: '📊 Wochenbericht',
      body: 'Deine Wochenstatistik ist fertig!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    achievement_unlocked: {
      title: '🏆 Neue Errungenschaft!',
      body: 'Glückwunsch! Du hast eine neue Errungenschaft freigeschaltet',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    motivational: {
      title: '💪 Motivation des Tages',
      body: 'Jeder Tag ist eine neue Chance, besser zu werden!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    streak_milestone: {
      title: '🔥 Serie geht weiter!',
      body: 'Du schreibst seit {streakDays} Tagen in Folge!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    custom: {
      title: 'Benachrichtigung',
      body: '{customMessage}',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
  },

  // Français
  fr: {
    daily_reminder: {
      title: "📝 Temps d'écrire!",
      body: "N'oubliez pas d'enregistrer vos réalisations aujourd'hui",
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    weekly_report: {
      title: '📊 Rapport Hebdomadaire',
      body: 'Vos statistiques hebdomadaires sont prêtes!',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    achievement_unlocked: {
      title: '🏆 Nouveau Succès!',
      body: 'Félicitations! Vous avez débloqué un nouveau succès',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    motivational: {
      title: '💪 Motivation du Jour',
      body: "Chaque jour est une nouvelle opportunité de s'améliorer!",
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    streak_milestone: {
      title: '🔥 La série continue!',
      body: "Vous écrivez depuis {streakDays} jours d'affilée!",
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    custom: {
      title: 'Notification',
      body: '{customMessage}',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
  },

  // 中文 (Chinese)
  zh: {
    daily_reminder: {
      title: '📝 写日记时间！',
      body: '别忘了记录今天的成就',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    weekly_report: {
      title: '📊 每周报告',
      body: '您的每周统计已准备好！',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    achievement_unlocked: {
      title: '🏆 新成就！',
      body: '恭喜！您解锁了新成就',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    motivational: {
      title: '💪 每日激励',
      body: '每一天都是变得更好的新机会！',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    streak_milestone: {
      title: '🔥 连续记录！',
      body: '您已连续写日记 {streakDays} 天！',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    custom: {
      title: '通知',
      body: '{customMessage}',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
  },

  // 日本語 (Japanese)
  ja: {
    daily_reminder: {
      title: '📝 日記を書く時間！',
      body: '今日の成果を記録することを忘れないでください',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    weekly_report: {
      title: '📊 週間レポート',
      body: '週間統計が準備できました！',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    achievement_unlocked: {
      title: '🏆 新しい実績！',
      body: 'おめでとうございます！新しい実績をアンロックしました',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    motivational: {
      title: '💪 今日のモチベーション',
      body: '毎日が良くなる新しい機会です！',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    streak_milestone: {
      title: '🔥 連続記録！',
      body: '{streakDays}日連続で日記を書いています！',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
    custom: {
      title: '通知',
      body: '{customMessage}',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    },
  },
};

/**
 * Получает шаблон push уведомления
 */
export function getPushTemplate(
  type: PushTemplateType,
  language = 'ru',
  variables?: PushTemplateVariables
): PushTemplate {
  // Fallback to Russian if language not supported
  const lang = PUSH_TEMPLATES[language] ? language : 'ru';
  const template = PUSH_TEMPLATES[lang][type];

  if (!template) {
    console.warn(`[Push Templates] Template not found: ${type} for language: ${lang}`);
    return PUSH_TEMPLATES.ru.custom;
  }

  // Replace variables in template
  let title = template.title;
  let body = template.body;

  if (variables) {
    if (variables.userName) {
      title = title.replace('{userName}', variables.userName);
      body = body.replace('{userName}', variables.userName);
    }
    if (variables.streakDays !== undefined) {
      title = title.replace('{streakDays}', String(variables.streakDays));
      body = body.replace('{streakDays}', String(variables.streakDays));
    }
    if (variables.achievementName) {
      title = title.replace('{achievementName}', variables.achievementName);
      body = body.replace('{achievementName}', variables.achievementName);
    }
    if (variables.weeklyStats) {
      title = title.replace('{totalEntries}', String(variables.weeklyStats.totalEntries));
      body = body.replace('{totalEntries}', String(variables.weeklyStats.totalEntries));
      title = title.replace('{successRate}', String(variables.weeklyStats.successRate));
      body = body.replace('{successRate}', String(variables.weeklyStats.successRate));
    }
    if (variables.customMessage) {
      title = title.replace('{customMessage}', variables.customMessage);
      body = body.replace('{customMessage}', variables.customMessage);
    }
  }

  return {
    ...template,
    title,
    body,
  };
}

/**
 * Получает список всех доступных типов шаблонов
 */
export function getAvailableTemplateTypes(): PushTemplateType[] {
  return [
    'daily_reminder',
    'weekly_report',
    'achievement_unlocked',
    'motivational',
    'streak_milestone',
    'custom',
  ];
}

/**
 * Получает список поддерживаемых языков
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(PUSH_TEMPLATES);
}
