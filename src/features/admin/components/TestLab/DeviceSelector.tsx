import { Chrome, Globe, Smartphone } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { DEVICES, type DeviceType } from './types';

type DeviceSelectorProps = {
	selectedDevice: DeviceType;
	onDeviceChange: (device: DeviceType) => void;
};

const ICON_MAP = {
	Smartphone,
	Globe,
	Chrome,
};

export function DeviceSelector({ selectedDevice, onDeviceChange }: DeviceSelectorProps) {
	return (
		<div className="flex flex-col gap-2">
			<h3 className="font-medium text-foreground text-sm">Device</h3>
			<div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
				{Object.values(DEVICES).map((device) => {
					const Icon = ICON_MAP[device.icon as keyof typeof ICON_MAP];
					const isSelected = selectedDevice === device.id;

					return (
						<Button
							className="flex h-auto flex-col items-center gap-2 py-3 transition-colors duration-300"
							key={device.id}
							onClick={() => onDeviceChange(device.id)}
							size="sm"
							variant={isSelected ? 'default' : 'outline'}
						>
							<Icon className="h-5 w-5" />
							<div className="flex flex-col items-center gap-1">
								<span className="font-medium text-xs">{device.name}</span>
								<span className="text-[10px] opacity-70">{device.description}</span>
							</div>
						</Button>
					);
				})}
			</div>
		</div>
	);
}
