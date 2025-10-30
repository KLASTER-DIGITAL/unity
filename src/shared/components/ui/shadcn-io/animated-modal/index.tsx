"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "../../utils";

// import { useOnClickOutside } from "../../../hooks/use-on-click-outside";

type ModalContextType = {
	open: boolean;
	setOpen: (open: boolean) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
	const [open, setOpen] = useState(false);

	return (
		<ModalContext.Provider value={{ open, setOpen }}>
			{children}
		</ModalContext.Provider>
	);
};

export const useModal = () => {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	return context;
};

export function Modal({ children }: { children: ReactNode }) {
	return <ModalProvider>{children}</ModalProvider>;
}

export const ModalTrigger = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => {
	const { setOpen } = useModal();
	return (
		<button
			className={cn(
				"relative overflow-hidden rounded-md px-4 py-2 text-center text-black dark:text-white",
				className,
			)}
			onClick={() => setOpen(true)}
		>
			{children}
		</button>
	);
};

export const ModalBody = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => {
	const { open } = useModal();

	useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
	}, [open]);

	const modalRef = useRef<HTMLDivElement>(null);
	const { setOpen: _setOpen } = useModal();
	// useOnClickOutside(modalRef as React.RefObject<HTMLElement>, () => setOpen(false));

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					animate={{
						opacity: 1,
						backdropFilter: "blur(10px)",
					}}
					className="fixed inset-0 z-50 flex h-full w-full items-center justify-center [perspective:800px] [transform-style:preserve-3d]"
					exit={{
						opacity: 0,
						backdropFilter: "blur(0px)",
					}}
					initial={{
						opacity: 0,
					}}
				>
					<Overlay />

					<motion.div
						animate={{
							opacity: 1,
							scale: 1,
							rotateX: 0,
							y: 0,
						}}
						className={cn(
							"relative z-50 flex max-h-[90%] min-h-[50%] flex-1 flex-col overflow-hidden border border-transparent bg-card md:max-w-[40%] md:rounded-2xl dark:border-neutral-800 dark:bg-neutral-950",
							className,
						)}
						exit={{
							opacity: 0,
							scale: 0.8,
							rotateX: 10,
						}}
						initial={{
							opacity: 0,
							scale: 0.5,
							rotateX: 40,
							y: 40,
						}}
						ref={modalRef}
						transition={{
							type: "spring",
							stiffness: 260,
							damping: 15,
						}}
					>
						<CloseIcon />
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export const ModalContent = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div className={cn("flex flex-1 flex-col p-8 md:p-10", className)}>
		{children}
	</div>
);

export const ModalFooter = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div
		className={cn(
			"flex justify-end bg-muted p-4 dark:bg-neutral-900",
			className,
		)}
	>
		{children}
	</div>
);

const Overlay = ({ className }: { className?: string }) => (
	<motion.div
		animate={{
			opacity: 1,
			backdropFilter: "blur(10px)",
		}}
		className={`fixed inset-0 z-50 h-full w-full bg-black bg-opacity-50 ${className}`}
		exit={{
			opacity: 0,
			backdropFilter: "blur(0px)",
		}}
		initial={{
			opacity: 0,
		}}
	/>
);

const CloseIcon = () => {
	const { setOpen } = useModal();
	return (
		<button
			className="group absolute top-4 right-4"
			onClick={() => setOpen(false)}
		>
			<svg
				className="h-4 w-4 text-black transition duration-200 group-hover:rotate-3 group-hover:scale-125 dark:text-white"
				fill="none"
				height="24"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				viewBox="0 0 24 24"
				width="24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M0 0h24v24H0z" fill="none" stroke="none" />
				<path d="M18 6l-12 12" />
				<path d="M6 6l12 12" />
			</svg>
		</button>
	);
};
