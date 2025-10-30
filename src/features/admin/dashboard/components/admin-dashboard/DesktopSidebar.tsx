import { LogOut, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/shared/components/ui/button';
import type { SidebarProps } from './types';

/**
 * Desktop Sidebar Component
 * Fixed sidebar for desktop view (lg+)
 */
export function DesktopSidebar({
	menuItems,
	activeTab,
	userData,
	onTabChange,
	onLogout,
}: SidebarProps) {
	return (
		<aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:border-border lg:border-r lg:bg-card">
			{/* Sidebar Header */}
			<div className="flex h-16 items-center gap-3 border-border border-b bg-accent px-6">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) bg-white/20 backdrop-blur-sm">
					<Shield className="h-6 w-6 text-white" />
				</div>
				<div>
					<h1 className="text-[17px]! text-white">Admin Panel</h1>
					<p className="font-normal! text-[13px]! text-white/80">Дневник Достижений</p>
				</div>
			</div>

			{/* Navigation */}
			<nav className="space-y-1 p-4">
				{menuItems.map((item) => {
					const Icon = item.icon;
					const isActive = activeTab === item.id;
					return (
						<motion.button
							className={`relative flex w-full items-center gap-3 rounded-(--radius) px-3 py-2.5 text-[15px]! transition-all ${
								isActive
									? 'bg-accent text-accent-foreground shadow-lg'
									: 'text-foreground hover:bg-muted'
							}
              `}
							key={item.id}
							onClick={() => {
								console.log('[DesktopSidebar] Menu item clicked:', item.id);
								onTabChange(item.id);
							}}
							transition={{ type: 'spring', stiffness: 400, damping: 17 }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<Icon className="h-5 w-5" />
							<span>{item.label}</span>
							{isActive && (
								<motion.div
									animate={{ opacity: 1, scale: 1 }}
									className="absolute inset-0 rounded-(--radius) bg-accent/20"
									initial={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.2 }}
								/>
							)}
						</motion.button>
					);
				})}
			</nav>

			{/* User Profile at Bottom */}
			<div className="absolute right-0 bottom-0 left-0 border-border border-t bg-card p-4">
				<div className="mb-3 flex items-center gap-3 rounded-(--radius) bg-muted px-3 py-2">
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
						{userData?.email?.[0].toUpperCase()}
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate text-[14px]! text-foreground">{userData?.email}</p>
						<p className="font-normal! text-[12px]! text-muted-foreground">Супер-администратор</p>
					</div>
				</div>
				<Button
					className="w-full justify-start gap-2 text-[15px]!"
					onClick={onLogout}
					variant="outline"
				>
					<LogOut className="h-4 w-4" />
					Выход
				</Button>
			</div>
		</aside>
	);
}
