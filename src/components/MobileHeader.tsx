import { Bell, Calendar, ChevronDown, Menu, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
  title: _title,
  showMenu = true,
  showNotifications = true,
  showSearch = true,
  userName = 'Пользователь',
  onMenuClick,
  onNotificationClick,
  onSearchClick: _onSearchClick,
}: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button className="p-2" onClick={onMenuClick} size="sm" variant="ghost">
              <Menu className="h-5 w-5 text-[#787486]" />
            </Button>
          )}

          {showSearch && (
            <div className="relative max-w-sm flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[#787486]" />
              </div>
              <input
                className="w-full rounded-md bg-[#f5f5f5] py-2 pr-4 pl-10 text-[#787486] text-sm focus:outline-none focus:ring-2 focus:ring-[#5030e5]/20"
                placeholder="Поиск достижений..."
                type="text"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showNotifications && (
            <>
              <Button className="relative p-2" size="sm" variant="ghost">
                <Calendar className="h-5 w-5 text-[#787486]" />
              </Button>
              <Button className="relative p-2" size="sm" variant="ghost">
                <MessageCircle className="h-5 w-5 text-[#787486]" />
              </Button>
              <Button
                className="relative p-2"
                onClick={onNotificationClick}
                size="sm"
                variant="ghost"
              >
                <Bell className="h-5 w-5 text-[#787486]" />
                <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#d8727d]" />
              </Button>
            </>
          )}

          {/* User Profile */}
          <div className="ml-2 flex items-center gap-2" data-testid="user-menu">
            <div className="text-right text-sm">
              <div className="text-[#0d062d]">{userName}</div>
              <div className="text-[#787486] text-xs">Пользователь</div>
            </div>
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-border">
              <ImageWithFallback
                alt="Profile"
                className="h-full w-full object-cover"
                src="/api/placeholder/36/36"
              />
            </div>
            <ChevronDown className="h-4 w-4 text-[#787486]" />
          </div>
        </div>
      </div>
    </div>
  );
}
