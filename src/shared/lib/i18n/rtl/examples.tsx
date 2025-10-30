/**
 * RTL Examples
 *
 * Real-world examples of RTL support in UNITY-v2 components
 */

import { ChevronRight, Search, Settings, X } from "lucide-react";
import React from "react";
import { useTranslation } from "../useTranslation";
import { RTLText } from "./RTLProvider";

/**
 * Example 1: Navigation Menu with RTL
 */
export function ExampleNavigation() {
	const { t } = useTranslation();

	return (
		<nav className="border-b bg-card" dir={t.direction}>
			<ul className="flex p-4">
				<li className="me-4">
					<a className="text-blue-600" href="#">
						{t("nav.home", "Home")}
					</a>
				</li>
				<li className="me-4">
					<a className="text-muted-foreground" href="#">
						{t("nav.history", "History")}
					</a>
				</li>
				<li className="me-4">
					<a className="text-muted-foreground" href="#">
						{t("nav.achievements", "Achievements")}
					</a>
				</li>
				<li>
					<a className="text-muted-foreground" href="#">
						{t("nav.settings", "Settings")}
					</a>
				</li>
			</ul>
		</nav>
	);
}

/**
 * Example 2: Card Layout with Image
 */
export function ExampleCard({
	image,
	title,
	description,
}: {
	image: string;
	title: string;
	description: string;
}) {
	const { t } = useTranslation();

	return (
		<div className="rounded-lg bg-card p-4 shadow" dir={t.direction}>
			<div className="flex gap-4">
				<img
					alt={title}
					className="h-20 w-20 rounded object-cover"
					src={image}
				/>
				<div className="flex-1">
					<h3 className="text-start font-semibold text-lg">{title}</h3>
					<p className="text-start text-muted-foreground text-sm">
						{description}
					</p>
				</div>
			</div>
		</div>
	);
}

/**
 * Example 3: Search Input with Icon
 */
export function ExampleSearchInput() {
	const { t } = useTranslation();

	return (
		<div className="relative" dir={t.direction}>
			<input
				className="w-full rounded-lg border py-2 ps-10 pe-4"
				placeholder={t("search.placeholder", "Search...")}
				type="text"
			/>
			<Search className="-translate-y-1/2 absolute start-3 top-1/2 h-4 w-4 text-muted-foreground" />
		</div>
	);
}

/**
 * Example 4: Modal with Close Button
 */
export function ExampleModal({
	isOpen,
	onClose,
	title,
	children,
}: {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}) {
	const { t } = useTranslation();

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/50">
			<div className="w-full max-w-md rounded-lg bg-card" dir={t.direction}>
				<div className="relative border-b p-6">
					<h2 className="text-start font-semibold text-xl">{title}</h2>
					<button
						className="absolute end-4 top-4 rounded p-2 hover:bg-muted"
						onClick={onClose}
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				<div className="p-6">{children}</div>
			</div>
		</div>
	);
}

/**
 * Example 5: Breadcrumbs
 */
export function ExampleBreadcrumbs({
	items,
}: {
	items: Array<{ label: string; href?: string }>;
}) {
	const { t } = useTranslation();

	return (
		<nav className="flex items-center gap-2" dir={t.direction}>
			{items.map((item, index) => (
				<React.Fragment key={index}>
					{item.href ? (
						<a className="text-blue-600 hover:underline" href={item.href}>
							{item.label}
						</a>
					) : (
						<span className="text-muted-foreground">{item.label}</span>
					)}
					{index < items.length - 1 && (
						<ChevronRight className="icon-mirror h-4 w-4 text-muted-foreground" />
					)}
				</React.Fragment>
			))}
		</nav>
	);
}

/**
 * Example 6: Entry Card with Actions
 */
export function ExampleEntryCard({
	entry,
}: {
	entry: {
		text: string;
		created_at: string;
		category: string;
	};
}) {
	const { t } = useTranslation();

	return (
		<div className="rounded-lg bg-card p-4 shadow" dir={t.direction}>
			<div className="mb-2 flex items-start justify-between">
				<span className="text-muted-foreground text-xs">
					{t.formatRelativeTime(entry.created_at)}
				</span>
				<span className="rounded bg-blue-100 px-2 py-1 text-blue-800 text-xs">
					{entry.category}
				</span>
			</div>
			<p className="text-start">{entry.text}</p>
			<div className="mt-4 flex gap-2">
				<button className="text-blue-600 text-sm hover:underline">
					{t("entry.edit", "Edit")}
				</button>
				<button className="text-red-600 text-sm hover:underline">
					{t("entry.delete", "Delete")}
				</button>
			</div>
		</div>
	);
}

/**
 * Example 7: Settings List
 */
export function ExampleSettingsList() {
	const { t } = useTranslation();

	const settings = [
		{ icon: Settings, label: t("settings.general", "General"), href: "#" },
		{
			icon: Settings,
			label: t("settings.notifications", "Notifications"),
			href: "#",
		},
		{ icon: Settings, label: t("settings.privacy", "Privacy"), href: "#" },
		{ icon: Settings, label: t("settings.language", "Language"), href: "#" },
	];

	return (
		<div className="rounded-lg bg-card shadow" dir={t.direction}>
			{settings.map((setting, index) => (
				<a
					className="flex items-center gap-3 border-b p-4 last:border-b-0 hover:bg-muted"
					href={setting.href}
					key={index}
				>
					<setting.icon className="h-5 w-5 text-muted-foreground" />
					<span className="flex-1 text-start">{setting.label}</span>
					<ChevronRight className="icon-mirror h-5 w-5 text-muted-foreground" />
				</a>
			))}
		</div>
	);
}

/**
 * Example 8: Achievement Badge
 */
export function ExampleAchievementBadge({
	title,
	description,
	progress,
	total,
}: {
	title: string;
	description: string;
	progress: number;
	total: number;
}) {
	const { t } = useTranslation();
	const percentage = (progress / total) * 100;

	return (
		<div className="rounded-lg bg-card p-4 shadow" dir={t.direction}>
			<h3 className="mb-2 text-start font-semibold text-lg">{title}</h3>
			<p className="mb-4 text-start text-muted-foreground text-sm">
				{description}
			</p>

			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">
						{t("achievement.progress", "Progress")}
					</span>
					<span className="font-semibold">
						{progress} / {total}
					</span>
				</div>

				<div className="h-2 w-full rounded-full bg-muted">
					<div
						className="h-2 rounded-full bg-blue-600 transition-all"
						style={{ width: `${percentage}%` }}
					/>
				</div>
			</div>
		</div>
	);
}

/**
 * Example 9: Language Switcher with RTL Indicator
 */
export function ExampleLanguageSwitcher() {
	const { t, changeLanguage, currentLanguage } = useTranslation();

	const languages = [
		{ code: "en", name: "English", isRTL: false },
		{ code: "ru", name: "Русский", isRTL: false },
		{ code: "ar", name: "العربية", isRTL: true },
		{ code: "he", name: "עברית", isRTL: true },
	];

	return (
		<div className="rounded-lg bg-card p-4 shadow" dir={t.direction}>
			<h3 className="mb-4 text-start font-semibold text-lg">
				{t("settings.language", "Language")}
			</h3>

			<div className="space-y-2">
				{languages.map((lang) => (
					<button
						className={`flex w-full items-center justify-between rounded-lg border p-3 ${currentLanguage === lang.code ? "border-blue-600 bg-blue-50" : "border-border"}hover:bg-muted`}
						key={lang.code}
						onClick={() => changeLanguage(lang.code)}
					>
						<span className="text-start">{lang.name}</span>
						{lang.isRTL && (
							<span className="rounded bg-purple-100 px-2 py-1 text-purple-800 text-xs">
								RTL
							</span>
						)}
					</button>
				))}
			</div>
		</div>
	);
}

/**
 * Example 10: RTL Text Detection
 */
export function ExampleRTLTextDetection() {
	const { t } = useTranslation();

	const texts = [
		{ text: "Hello World", expected: "LTR" },
		{ text: "مرحبا بالعالم", expected: "RTL" },
		{ text: "שלום עולם", expected: "RTL" },
		{ text: "Mixed مختلط Text", expected: "Mixed" },
	];

	return (
		<div className="rounded-lg bg-card p-4 shadow" dir={t.direction}>
			<h3 className="mb-4 text-start font-semibold text-lg">
				RTL Text Detection
			</h3>

			<div className="space-y-3">
				{texts.map((item, index) => (
					<div className="rounded border p-3" key={index}>
						<RTLText className="mb-2 block">{item.text}</RTLText>
						<span className="text-muted-foreground text-xs">
							Expected: {item.expected}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
