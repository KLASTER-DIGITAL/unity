import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ComponentInspector } from './ComponentInspector';
import { DeviceSelector } from './DeviceSelector';
import { LivePreview } from './LivePreview';
import { PlatformToggle } from './PlatformToggle';
import { DEFAULT_TEST_LAB_STATE, type DeviceType, type PlatformMode } from './types';

const STORAGE_KEY = 'unity-admin-test-lab-state';

export function TestLab() {
	const [selectedDevice, setSelectedDevice] = useState<DeviceType>(
		DEFAULT_TEST_LAB_STATE.selectedDevice
	);
	const [platformMode, setPlatformMode] = useState<PlatformMode>(
		DEFAULT_TEST_LAB_STATE.platformMode
	);
	const [isInspectorOpen, setIsInspectorOpen] = useState(false);

	// Load state from localStorage on mount
	useEffect(() => {
		const savedState = localStorage.getItem(STORAGE_KEY);
		if (savedState) {
			try {
				const parsed = JSON.parse(savedState);
				setSelectedDevice(parsed.selectedDevice || DEFAULT_TEST_LAB_STATE.selectedDevice);
				setPlatformMode(parsed.platformMode || DEFAULT_TEST_LAB_STATE.platformMode);
			} catch (error) {
				console.error('Failed to parse saved Test Lab state:', error);
			}
		}
	}, []);

	// Save state to localStorage on change
	useEffect(() => {
		const state = {
			selectedDevice,
			platformMode,
			timestamp: Date.now(),
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}, [selectedDevice, platformMode]);

	const handleDeviceChange = (device: DeviceType) => {
		setSelectedDevice(device);
	};

	const handlePlatformChange = (mode: PlatformMode) => {
		setPlatformMode(mode);
	};

	return (
		<div className="flex h-full flex-col gap-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl text-foreground">Test Lab</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Test PWA responsiveness across different devices and browsers
					</p>
				</div>
				<Button
					className="flex items-center gap-2 transition-colors duration-300"
					onClick={() => setIsInspectorOpen(!isInspectorOpen)}
					size="sm"
					variant={isInspectorOpen ? 'default' : 'outline'}
				>
					<Info className="h-4 w-4" />
					<span>Inspector</span>
				</Button>
			</div>

			{/* Controls */}
			<div className="space-y-4 rounded-lg border border-border bg-card p-4 transition-colors duration-300">
				<DeviceSelector onDeviceChange={handleDeviceChange} selectedDevice={selectedDevice} />
				<PlatformToggle onPlatformChange={handlePlatformChange} platformMode={platformMode} />
			</div>

			{/* Preview Area */}
			<div className="flex min-h-0 flex-1 gap-4">
				<LivePreview
					platformMode={platformMode}
					previewUrl={DEFAULT_TEST_LAB_STATE.previewUrl}
					selectedDevice={selectedDevice}
				/>
				<ComponentInspector
					isOpen={isInspectorOpen}
					onClose={() => setIsInspectorOpen(false)}
					platformMode={platformMode}
					previewUrl={DEFAULT_TEST_LAB_STATE.previewUrl}
					selectedDevice={selectedDevice}
				/>
			</div>
		</div>
	);
}
