import type { AchievementCard } from "./types";

/**
 * Achievement Home Screen - Constants
 */

// Градиенты для карточек в зависимости от sentiment
export const GRADIENTS = {
  positive: [
    "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
    "from-[var(--gradient-positive-2-start)] to-[var(--gradient-positive-2-end)]",
    "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
    "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]"
  ],
  neutral: [
    "from-[var(--gradient-neutral-1-start)] to-[var(--gradient-neutral-1-end)]",
    "from-[var(--gradient-neutral-2-start)] to-[var(--gradient-neutral-2-end)]"
  ],
  negative: [
    "from-[var(--gradient-negative-1-start)] to-[var(--gradient-negative-1-end)]",
    "from-[var(--gradient-negative-2-start)] to-[var(--gradient-negative-2-end)]"
  ]
};

// Мультиязычные дефолтные мотивации
export const DEFAULT_MOTIVATIONS: { [key: string]: AchievementCard[] } = {
  ru: [
    {
      id: "default_1",
      date: "Начни сегодня",
      title: "Сегодня отличное время",
      description: "Запиши маленькую победу — это первый шаг к осознанию своих достижений.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Совет дня",
      title: "Даже одна мысль делает день осмысленным",
      description: "Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Мотивация",
      title: "Запиши момент благодарности",
      description: "Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  en: [
    {
      id: "default_1",
      date: "Start today",
      title: "Today is a great time",
      description: "Write down a small victory — it's the first step to recognizing your achievements.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Daily tip",
      title: "Even one thought makes the day meaningful",
      description: "You don't have to write a lot — one phrase can change your perspective on the day.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivation",
      title: "Write down a moment of gratitude",
      description: "Feel the lightness when you notice the good in your life. This is the path to happiness.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  es: [
    {
      id: "default_1",
      date: "Empieza hoy",
      title: "Hoy es un gran momento",
      description: "Escribe una pequeña victoria — es el primer paso para reconocer tus logros.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Consejo del día",
      title: "Incluso un pensamiento hace el día significativo",
      description: "No tienes que escribir mucho — una frase puede cambiar tu perspectiva del día.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivación",
      title: "Escribe un momento de gratitud",
      description: "Siente la ligereza cuando notas lo bueno en tu vida. Este es el camino a la felicidad.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  de: [
    {
      id: "default_1",
      date: "Fang heute an",
      title: "Heute ist eine gute Zeit",
      description: "Schreibe einen kleinen Sieg auf — es ist der erste Schritt, um deine Erfolge zu erkennen.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Tipp des Tages",
      title: "Selbst ein Gedanke macht den Tag bedeutsam",
      description: "Du musst nicht viel schreiben — ein Satz kann deine Perspektive auf den Tag ändern.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivation",
      title: "Schreibe einen Moment der Dankbarkeit auf",
      description: "Fühl die Leichtigkeit, wenn du das Gute in deinem Leben bemerkst. Das ist der Weg zum Glück.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  fr: [
    {
      id: "default_1",
      date: "Commencez aujourd'hui",
      title: "Aujourd'hui est un bon moment",
      description: "Écrivez une petite victoire — c'est le premier pas pour reconnaître vos réalisations.",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "Conseil du jour",
      title: "Même une pensée rend la journée significative",
      description: "Vous n'avez pas besoin d'écrire beaucoup — une phrase peut changer votre regard sur la journée.",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "Motivation",
      title: "Écrivez un moment de gratitude",
      description: "Ressentez la légèreté lorsque vous remarquez le bien dans votre vie. C'est le chemin vers le bonheur.",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  zh: [
    {
      id: "default_1",
      date: "今天开始",
      title: "今天是个好时机",
      description: "写下一个小胜利——这是认识自己成就的第一步。",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "每日提示",
      title: "即使一个想法也能让这一天有意义",
      description: "不需要写很多——一句话就能改变你对这一天的看法。",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "动力",
      title: "写下感恩的时刻",
      description: "当你注意到生活中的美好时，感受那份轻松。这是通往幸福的道路。",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ],
  ja: [
    {
      id: "default_1",
      date: "今日から始めよう",
      title: "今日は良い時です",
      description: "小さな勝利を書き留めましょう——それはあなたの成果を認識する第一歩です。",
      gradient: "from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]",
      isMarked: false
    },
    {
      id: "default_2",
      date: "今日のヒント",
      title: "一つの考えでも一日を意味のあるものにします",
      description: "たくさん書く必要はありません——一つのフレーズがあなたの一日への見方を変えることができます。",
      gradient: "from-[var(--gradient-positive-3-start)] to-[var(--gradient-positive-3-end)]",
      isMarked: false
    },
    {
      id: "default_3",
      date: "モチベーション",
      title: "感謝の瞬間を書き留めましょう",
      description: "人生の良いことに気づいたとき、その軽さを感じましょう。それが幸せへの道です。",
      gradient: "from-[var(--gradient-positive-4-start)] to-[var(--gradient-positive-4-end)]",
      isMarked: false
    }
  ]
};

