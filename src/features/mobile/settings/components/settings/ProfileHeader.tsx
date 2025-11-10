import { Crown, Edit2, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { DEFAULT_AVATAR_URL } from './constants';

type ProfileHeaderProps = {
	profile: any;
	onEditClick: () => void;
	onUpgradeToPremium?: () => void;
};

/**
 * Profile header section
 * Features:
 * - User avatar with fallback
 * - Edit button overlay
 * - User name and email display
 * - Subscription badge (Premium or Free)
 * - Upgrade button for Free users
 */
export function ProfileHeader({ profile, onEditClick, onUpgradeToPremium }: ProfileHeaderProps) {
	const isPremium = profile?.is_premium || false;
	return (
		<div className="border-border border-b bg-card px-6 py-8 transition-colors duration-300">
			<div className="flex flex-col items-center">
				<div className="relative">
					<Avatar className="h-24 w-24 ring-4 ring-primary/10">
						<AvatarImage alt={profile?.name} src={profile?.avatar || DEFAULT_AVATAR_URL} />
						<AvatarFallback className="bg-muted">
							<img
								alt="Default avatar"
								className="h-full w-full object-cover"
								src={DEFAULT_AVATAR_URL}
							/>
						</AvatarFallback>
					</Avatar>
					<button
						aria-label="Edit profile"
						className="absolute right-0 bottom-0 rounded-full border border-border bg-card p-2 shadow-lg transition-colors hover:bg-muted"
						onClick={onEditClick}
					>
						<Edit2 className="h-5 w-5 text-foreground" strokeWidth={2} />
					</button>
				</div>

				{/* User Info - Name and Email */}
				<div className="mt-4 text-center">
					<h1 className="mb-1 font-semibold text-foreground text-lg">
						{profile?.name || 'Мой аккаунт'}
					</h1>
					<p className="text-muted-foreground text-sm">{profile?.email}</p>

					{/* Diary Name */}
					{(profile?.diaryName || profile?.diaryEmoji) && (
						<div className="mt-3 inline-flex items-center gap-2 rounded-full border-border border bg-muted/30 px-4 py-2">
							<span className="text-xl">{profile?.diaryEmoji || '📝'}</span>
							<span className="font-medium text-foreground text-sm">
								{profile?.diaryName || 'Мой дневник'}
							</span>
						</div>
					)}

					{/* Subscription Badge - ALWAYS show (Premium or Free) */}
					<div className="mt-4 flex flex-col items-center gap-3">
						{isPremium ? (
							// Premium Badge
							<Badge className="border-yellow-500/20 bg-yellow-500/10 text-yellow-600 transition-colors duration-300">
								<Crown className="mr-1 h-3 w-3" strokeWidth={2} />
								Premium
							</Badge>
						) : (
							// Free Badge + Upgrade Button
							<>
								<Badge
									variant="outline"
									className="border-muted-foreground/20 bg-muted/30 text-muted-foreground transition-colors duration-300"
								>
									Free Plan
								</Badge>
								{onUpgradeToPremium && (
									<Button
										size="sm"
										onClick={onUpgradeToPremium}
										className="h-9 gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 font-medium text-white shadow-lg ring-2 ring-yellow-600/30 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:ring-yellow-600/50 active:scale-95"
									>
										<Sparkles className="h-4 w-4" strokeWidth={2} />
										Активировать Premium
									</Button>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
