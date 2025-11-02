import { Mic } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from './utils';

type AIVoiceInputProps = {
	onStop?: (duration: number) => void;
	visualizerBars?: number;
	className?: string;
};

export function AIVoiceInput({
	onStop,
	visualizerBars = 48,
	className,
}: AIVoiceInputProps) {
	const [time, setTime] = useState(0);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		const intervalId = setInterval(() => {
			setTime((t) => t + 1);
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const handleClick = () => {
		onStop?.(time);
	};

	return (
		<div className={cn('w-full py-4', className)}>
			<div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-2">
				<button
					className="group flex h-16 w-16 items-center justify-center rounded-xl bg-none transition-colors"
					onClick={handleClick}
					type="button"
				>
					<div
						className="h-6 w-6 animate-spin cursor-pointer rounded-sm bg-black pointer-events-auto dark:bg-white"
						style={{ animationDuration: '3s' }}
					/>
				</button>

				<span className="font-mono text-sm text-black/70 transition-opacity duration-300 dark:text-white/70">
					{formatTime(time)}
				</span>

				<div className="flex h-4 w-64 items-center justify-center gap-0.5">
					{[...Array(visualizerBars)].map((_, i) => (
						<div
							className="w-0.5 animate-pulse rounded-full bg-black/50 transition-all duration-300 dark:bg-white/50"
							key={i}
							style={
								isClient
									? {
											height: `${20 + Math.random() * 80}%`,
											animationDelay: `${i * 0.05}s`,
										}
									: undefined
							}
						/>
					))}
				</div>

				<p className="h-4 text-xs text-black/70 dark:text-white/70">Listening...</p>
			</div>
		</div>
	);
}

