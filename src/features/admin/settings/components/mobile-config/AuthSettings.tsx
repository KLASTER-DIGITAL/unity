import type React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { MobileSettingsProps } from "./types";

export const AuthSettings: React.FC<MobileSettingsProps> = ({
	settings,
	onChange,
}) => {
	const handleChange = (field: string, value: any) => {
		onChange({ ...settings, [field]: value });
	};

	const toggleAuthMethod = (method: string) => {
		const methods = settings.auth_methods.includes(method)
			? settings.auth_methods.filter((m) => m !== method)
			: [...settings.auth_methods, method];
		handleChange("auth_methods", methods);
	};

	const authMethods = [
		{ id: "email", label: "Email/Password" },
		{ id: "google", label: "Google" },
		{ id: "apple", label: "Apple" },
		{ id: "telegram", label: "Telegram" },
		{ id: "facebook", label: "Facebook" },
	];

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Методы авторизации</CardTitle>
					<CardDescription>
						Доступные способы входа в приложение
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{authMethods.map((method) => (
						<div className="flex items-center space-x-2" key={method.id}>
							<Checkbox
								checked={settings.auth_methods.includes(method.id)}
								id={method.id}
								onCheckedChange={() => toggleAuthMethod(method.id)}
							/>
							<Label className="cursor-pointer" htmlFor={method.id}>
								{method.label}
							</Label>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Дизайн экрана авторизации</CardTitle>
					<CardDescription>Настройка внешнего вида</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>Заголовок</Label>
						<Input
							onChange={(e) => handleChange("auth_title", e.target.value)}
							placeholder="Добро пожаловать"
							value={settings.auth_title}
						/>
					</div>

					<div className="space-y-2">
						<Label>Подзаголовок</Label>
						<Input
							onChange={(e) => handleChange("auth_subtitle", e.target.value)}
							placeholder="Войдите в свой аккаунт"
							value={settings.auth_subtitle}
						/>
					</div>

					<div className="space-y-2">
						<Label>Цвет фона</Label>
						<div className="flex gap-2">
							<Input
								className="h-10 w-20 p-1"
								onChange={(e) => handleChange("auth_bg_color", e.target.value)}
								type="color"
								value={settings.auth_bg_color}
							/>
							<Input
								className="flex-1"
								onChange={(e) => handleChange("auth_bg_color", e.target.value)}
								value={settings.auth_bg_color}
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
