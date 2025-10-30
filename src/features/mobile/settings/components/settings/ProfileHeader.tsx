import { Edit2 } from "lucide-react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import { DEFAULT_AVATAR_URL } from "./constants";

type ProfileHeaderProps = {
	profile: any;
	onEditClick: () => void;
};

/**
 * Profile header section
 * Features:
 * - User avatar with fallback
 * - Edit button overlay
 * - User name and email display
 */
export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
	return (
		<div className="border-border border-b bg-card px-6 py-8 transition-colors duration-300">
			<div className="flex flex-col items-center">
				<div className="relative">
					<Avatar className="h-24 w-24 ring-4 ring-primary/10">
						<AvatarImage
							alt={profile?.name}
							src={profile?.avatar || DEFAULT_AVATAR_URL}
						/>
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
						{profile?.name || "Мой аккаунт"}
					</h1>
					<p className="text-muted-foreground text-sm">{profile?.email}</p>
				</div>
			</div>
		</div>
	);
}
