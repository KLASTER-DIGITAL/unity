import { Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { DEFAULT_AVATAR_URL } from "./constants";

interface ProfileHeaderProps {
  profile: any;
  onEditClick: () => void;
}

/**
 * Profile header section
 * Features:
 * - User avatar with fallback
 * - Edit button overlay
 * - User name and email display
 */
export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  return (
    <div className="bg-card px-6 py-8 border-b border-border transition-colors duration-300">
      <div className="flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-24 w-24 ring-4 ring-primary/10">
            <AvatarImage src={profile?.avatar || DEFAULT_AVATAR_URL} alt={profile?.name} />
            <AvatarFallback className="bg-muted">
              <img src={DEFAULT_AVATAR_URL} alt="Default avatar" className="h-full w-full object-cover" />
            </AvatarFallback>
          </Avatar>
          <button
            onClick={onEditClick}
            className="absolute bottom-0 right-0 p-2 bg-card rounded-full shadow-lg border border-border hover:bg-muted transition-colors"
            aria-label="Edit profile"
          >
            <Edit2 className="h-5 w-5 text-foreground" strokeWidth={2} />
          </button>
        </div>

        {/* User Info - Name and Email */}
        <div className="mt-4 text-center">
          <h1 className="text-lg font-semibold text-foreground mb-1">
            {profile?.name || 'Мой аккаунт'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.email}
          </p>
        </div>
      </div>
    </div>
  );
}

