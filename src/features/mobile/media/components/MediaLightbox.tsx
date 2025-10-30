import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { MediaFile } from "@/shared/lib/api";

type MediaLightboxProps = {
	media: MediaFile[];
	initialIndex?: number;
	isOpen: boolean;
	onClose: () => void;
};

export function MediaLightbox({
	media,
	initialIndex = 0,
	isOpen,
	onClose,
}: MediaLightboxProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);

	const goToPrevious = () => {
		setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
	};

	const goToNext = () => {
		setCurrentIndex((prev) => (prev + 1) % media.length);
	};

	const currentMedia = media[currentIndex];

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					animate={{ opacity: 1 }}
					className="scrollbar-hide fixed inset-0 z-50 flex items-center justify-center bg-black"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					onClick={onClose}
				>
					{/* Close Button */}
					<button
						className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/10 transition-colors hover:bg-card/20"
						onClick={onClose}
					>
						<X className="h-6 w-6 text-white" />
					</button>

					{/* Counter */}
					{media.length > 1 && (
						<div className="-translate-x-1/2 absolute top-4 left-1/2 z-10 rounded-full bg-card/10 px-4 py-2">
							<span className="font-semibold! text-[14px]! text-white">
								{currentIndex + 1} / {media.length}
							</span>
						</div>
					)}

					{/* Media Content */}
					<div
						className="relative flex h-full w-full items-center justify-center p-4"
						onClick={(e) => e.stopPropagation()}
					>
						<AnimatePresence mode="wait">
							<motion.div
								animate={{ opacity: 1, scale: 1 }}
								className="flex max-h-full max-w-full items-center justify-center"
								exit={{ opacity: 0, scale: 0.9 }}
								initial={{ opacity: 0, scale: 0.9 }}
								key={currentIndex}
								transition={{ duration: 0.2 }}
							>
								{currentMedia?.type === "image" ? (
									<img
										alt=""
										className="max-h-full max-w-full rounded-[12px] object-contain"
										src={currentMedia.url}
									/>
								) : currentMedia?.type === "video" ? (
									<video
										autoPlay
										className="max-h-full max-w-full rounded-[12px]"
										controls
										src={currentMedia.url}
									/>
								) : null}
							</motion.div>
						</AnimatePresence>
					</div>

					{/* Navigation Arrows */}
					{media.length > 1 && (
						<>
							<button
								className="-translate-y-1/2 absolute top-1/2 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-card/10 transition-colors hover:bg-card/20"
								onClick={(e) => {
									e.stopPropagation();
									goToPrevious();
								}}
							>
								<ChevronLeft className="h-8 w-8 text-white" />
							</button>

							<button
								className="-translate-y-1/2 absolute top-1/2 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-card/10 transition-colors hover:bg-card/20"
								onClick={(e) => {
									e.stopPropagation();
									goToNext();
								}}
							>
								<ChevronRight className="h-8 w-8 text-white" />
							</button>
						</>
					)}

					{/* Thumbnails */}
					{media.length > 1 && (
						<div className="-translate-x-1/2 scrollbar-hide absolute bottom-4 left-1/2 flex max-w-full gap-2 overflow-x-auto px-4">
							{media.map((item, index) => (
								<button
									className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-[8px] border-2 transition-all ${
										index === currentIndex
											? "scale-110 border-white"
											: "border-white/30 opacity-60 hover:opacity-100"
									}`}
									key={item.path}
									onClick={(e) => {
										e.stopPropagation();
										setCurrentIndex(index);
									}}
								>
									{item.type === "image" ? (
										<img
											alt=""
											className="h-full w-full object-cover"
											src={item.url}
										/>
									) : (
										<video
											className="h-full w-full object-cover"
											muted
											src={item.url}
										/>
									)}
								</button>
							))}
						</div>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
