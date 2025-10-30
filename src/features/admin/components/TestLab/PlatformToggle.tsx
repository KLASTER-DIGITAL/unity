import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { PlatformMode } from './types';

type PlatformToggleProps = {
	platformMode: PlatformMode;
	onPlatformChange: (mode: PlatformMode) => void;
};

export function PlatformToggle({ platformMode, onPlatformChange }: PlatformToggleProps) {
	return (
		<div className="flex flex-col gap-2">
			<h3 className="font-medium text-foreground text-sm">Platform Mode</h3>
			<div className="flex gap-2">
				<Button
					className="flex items-center gap-2 transition-colors duration-300"
					onClick={() => onPlatformChange('web')}
					size="sm"
					variant={platformMode === 'web' ? 'default' : 'outline'}
				>
					<Monitor className="h-4 w-4" />
					<span>Web (PWA)</span>
				</Button>
				<Button
					className="flex items-center gap-2 transition-colors duration-300"
					onClick={() => onPlatformChange('react-native')}
					size="sm"
					variant={platformMode === 'react-native' ? 'default' : 'outline'}
				>
					<Smartphone className="h-4 w-4" />
					<span>React Native</span>
				</Button>
			</div>
			<p className="text-muted-foreground text-xs">
				{platformMode === 'web'
					? 'Testing PWA mode with current implementation'
					: 'Simulating React Native mode (Q2 2026 migration)'}
			</p>
		</div>
	);
}
