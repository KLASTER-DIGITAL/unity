import { Bell, Menu, Search, Calendar, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MobileHeaderProps {
  title: string;
  showMenu?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  userName?: string;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  onSearchClick?: () => void;
}

export function MobileHeader({
  title,
  showMenu = true,
  showNotifications = true,
  showSearch = true,
  userName = "Пользователь",
  onMenuClick,
  onNotificationClick,
  onSearchClick
}: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMenuClick}
              className="p-2"
            >
              <Menu className="h-5 w-5 text-[#787486]" />
            </Button>
          )}
          
          {showSearch && (
            <div className="flex-1 max-w-sm relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#787486]" />
              </div>
              <input
                type="text"
                placeholder="Поиск достижений..."
                className="w-full pl-10 pr-4 py-2 bg-[#f5f5f5] rounded-md text-sm text-[#787486] focus:outline-none focus:ring-2 focus:ring-[#5030e5]/20"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {showNotifications && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 relative"
              >
                <Calendar className="h-5 w-5 text-[#787486]" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 relative"
              >
                <MessageCircle className="h-5 w-5 text-[#787486]" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNotificationClick}
                className="p-2 relative"
              >
                <Bell className="h-5 w-5 text-[#787486]" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-[#d8727d] rounded-full"></div>
              </Button>
            </>
          )}
          
          {/* User Profile */}
          <div className="flex items-center gap-2 ml-2" data-testid="user-menu">
            <div className="text-right text-sm">
              <div className="text-[#0d062d]">{userName}</div>
              <div className="text-[#787486] text-xs">Пользователь</div>
            </div>
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200">
              <ImageWithFallback
                src="/api/placeholder/36/36"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown className="h-4 w-4 text-[#787486]" />
          </div>
        </div>
      </div>
    </div>
  );
}