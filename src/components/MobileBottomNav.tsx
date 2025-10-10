import { Home, History, Trophy, BarChart3, Settings } from "lucide-react";
import { Button } from "./ui/button";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'history', label: 'История', icon: History },
    { id: 'achievements', label: 'Награды', icon: Trophy },
    { id: 'reports', label: 'Обзоры', icon: BarChart3 },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg px-1 py-2 z-50 max-w-md mx-auto">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-all duration-200 min-w-0 ${
                isActive 
                  ? 'text-[#5030e5] bg-[#5030e5]/10' 
                  : 'text-[#787486] hover:text-[#5030e5] hover:bg-[#5030e5]/5'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#5030e5]' : 'text-current'}`} />
              <span className={`text-[10px] leading-tight text-center ${isActive ? 'text-[#5030e5]' : 'text-[#787486]'}`}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}