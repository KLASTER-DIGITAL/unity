import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useTranslations } from "../../utils/i18n";
import { 
  Trophy, 
  Medal, 
  Star, 
  Target, 
  Calendar,
  Flame,
  TrendingUp,
  Award,
  Crown,
  Zap,
  Heart,
  BookOpen,
  Dumbbell,
  Camera
} from "lucide-react";

export function AchievementsScreen({ userData }: { userData?: any }) {
  // Получаем переводы для языка пользователя
  const t = useTranslations(userData?.language || 'ru');
  const userStats = {
    totalEntries: 47,
    currentStreak: 7,
    longestStreak: 23,
    totalBadges: 12,
    level: 8,
    nextLevelProgress: 65
  };

  const badges = [
    { 
      id: 1, 
      name: "Первые шаги", 
      description: "Создать первую запись", 
      icon: Star, 
      earned: true, 
      rarity: "common",
      earnedDate: "15 дней назад"
    },
    { 
      id: 2, 
      name: "Неделя силы", 
      description: "7 дней записей подряд", 
      icon: Flame, 
      earned: true, 
      rarity: "rare",
      earnedDate: "Сегодня"
    },
    { 
      id: 3, 
      name: "Спортивный дух", 
      description: "10 записей о спорте", 
      icon: Dumbbell, 
      earned: true, 
      rarity: "common",
      earnedDate: "3 дня назад"
    },
    { 
      id: 4, 
      name: "Книжный червь", 
      description: "Прочитать 5 книг", 
      icon: BookOpen, 
      earned: true, 
      rarity: "uncommon",
      earnedDate: "Неделю назад"
    },
    { 
      id: 5, 
      name: "Фотограф", 
      description: "Добавить 20 фото к записям", 
      icon: Camera, 
      earned: false, 
      rarity: "rare",
      progress: 15
    },
    { 
      id: 6, 
      name: "Месяц побед", 
      description: "30 дней записей подряд", 
      icon: Crown, 
      earned: false, 
      rarity: "legendary",
      progress: 7
    }
  ];

  const milestones = [
    { id: 1, title: "10 записей", completed: true, reward: "Бейдж 'Начинающий'" },
    { id: 2, title: "Неделя подряд", completed: true, reward: "Бейдж 'Постоянство'" },
    { id: 3, title: "50 записей", completed: false, progress: 47, total: 50, reward: "Премиум тема" },
    { id: 4, title: "Месяц подряд", completed: false, progress: 7, total: 30, reward: "Бейдж 'Легенда'" }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-800 border-gray-300";
      case "uncommon": return "bg-green-100 text-green-800 border-green-300";
      case "rare": return "bg-blue-100 text-blue-800 border-blue-300";
      case "legendary": return "bg-purple-100 text-purple-800 border-purple-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "rare": return "shadow-blue-200";
      case "legendary": return "shadow-purple-200";
      default: return "";
    }
  };

  return (
    <div className="pb-20 min-h-screen overflow-x-hidden scrollbar-hide" style={{ backgroundColor: '#f8f7ff' }}>
      {/* Header Section */}
      <div className="p-4 bg-white">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#5030e5] to-[#8b78ff] rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl mb-1 text-[#0d062d]">Уровень {userStats.level}</h1>
          <p className="text-[#787486]">Мастер достижений</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl mb-1 text-[#0d062d]">{userStats.totalEntries}</div>
            <div className="text-xs text-[#787486]">Записей</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1 text-[#0d062d]">{userStats.totalBadges}</div>
            <div className="text-xs text-[#787486]">Наград</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1 text-[#0d062d]">{userStats.currentStreak}</div>
            <div className="text-xs text-[#787486]">Дней подряд</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1 text-[#0d062d]">{userStats.longestStreak}</div>
            <div className="text-xs text-[#787486]">Рекорд</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-[#787486]">
            <span>До следующего уровня</span>
            <span>{userStats.nextLevelProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#5030e5] to-[#8b78ff] h-2 rounded-full transition-all duration-300"
              style={{ width: `${userStats.nextLevelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {badges.map(badge => {
            const Icon = badge.icon;
            return (
              <Card 
                key={badge.id} 
                className={`bg-white border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  badge.earned ? '' : 'opacity-60'
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className="relative mb-3">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      badge.earned 
                        ? badge.rarity === 'legendary' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                          badge.rarity === 'rare' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                          badge.rarity === 'uncommon' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                          'bg-gradient-to-br from-gray-400 to-gray-600'
                        : 'bg-gray-200'
                    }`}>
                      <Icon className={`h-8 w-8 ${badge.earned ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    {badge.earned && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Star className="h-3 w-3 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="text-[#0d062d] mb-1">{badge.name}</h4>
                  <p className="text-xs text-[#787486] mb-2">{badge.description}</p>
                  
                  {badge.earned ? (
                    <Badge className={`text-xs ${
                      badge.rarity === 'legendary' ? 'bg-purple-100 text-purple-600' :
                      badge.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                      badge.rarity === 'uncommon' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {badge.earnedDate}
                    </Badge>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#5030e5] h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((badge.progress || 0) / (badge.rarity === 'legendary' ? 30 : 20)) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-[#787486]">
                        {badge.progress}/{badge.rarity === 'legendary' ? 30 : 20}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Milestones Section */}
      <div className="p-4">
        <h3 className="text-[#0d062d] mb-4">Основные этапы</h3>
        <div className="space-y-3">
          {milestones.map(milestone => (
            <Card key={milestone.id} className="bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      milestone.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-[#5030e5]/10 text-[#5030e5]'
                    }`}>
                      {milestone.completed ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="text-[#0d062d]">{milestone.title}</h4>
                      <p className="text-sm text-[#787486]">{milestone.reward}</p>
                    </div>
                  </div>
                  
                  {milestone.completed ? (
                    <Badge className="bg-green-100 text-green-600">Выполнено</Badge>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-[#787486] mb-1">
                        {milestone.progress}/{milestone.total}
                      </p>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#5030e5] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(milestone.progress! / milestone.total!) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}