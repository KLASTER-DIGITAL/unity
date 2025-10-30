import { useEffect, useRef } from "react";

export type TelegramUser = {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
	photo_url?: string;
	auth_date: number;
	hash: string;
};

type TelegramLoginWidgetProps = {
	botName: string;
	buttonSize?: "large" | "medium" | "small";
	cornerRadius?: number;
	requestAccess?: string;
	usePic?: boolean;
	lang?: string;
	onAuth: (user: TelegramUser) => void;
};

/**
 * Native Telegram Login Widget component
 * Uses official Telegram Login Widget script instead of react-telegram-login
 * to avoid React version conflicts (react-telegram-login uses React 16)
 *
 * Documentation: https://core.telegram.org/widgets/login
 */
export function TelegramLoginWidget({
	botName,
	buttonSize = "large",
	cornerRadius = 8,
	requestAccess = "write",
	usePic = false,
	lang = "ru",
	onAuth,
}: TelegramLoginWidgetProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const callbackName = useRef(
		`telegramLoginCallback_${Math.random().toString(36).substr(2, 9)}`,
	);

	useEffect(() => {
		// Create global callback function
		(window as any)[callbackName.current] = (user: TelegramUser) => {
			onAuth(user);
		};

		// Create script element
		const script = document.createElement("script");
		script.src = "https://telegram.org/js/telegram-widget.js?22";
		script.setAttribute("data-telegram-login", botName);
		script.setAttribute("data-size", buttonSize);
		script.setAttribute("data-radius", cornerRadius.toString());
		script.setAttribute("data-request-access", requestAccess);
		script.setAttribute("data-userpic", usePic.toString());
		script.setAttribute("data-lang", lang);
		script.setAttribute("data-onauth", `${callbackName.current}(user)`);
		script.async = true;

		// Append script to container
		if (containerRef.current) {
			containerRef.current.appendChild(script);
		}

		// Cleanup
		return () => {
			if (containerRef.current && script.parentNode === containerRef.current) {
				containerRef.current.removeChild(script);
			}
			delete (window as any)[callbackName.current];
		};
	}, [botName, buttonSize, cornerRadius, requestAccess, usePic, lang, onAuth]);

	return <div ref={containerRef} />;
}
