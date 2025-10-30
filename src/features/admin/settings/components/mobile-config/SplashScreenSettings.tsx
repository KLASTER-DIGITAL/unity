import type React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Switch } from "@/shared/components/ui/switch";
import type { MobileSettingsProps } from "./types";

export const SplashScreenSettings: React.FC<MobileSettingsProps> = ({
	settings,
	onChange,
}) => {
	const handleChange = (field: string, value: any) => {
		onChange({ ...settings, [field]: value });
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Splash Screen</CardTitle>
					<CardDescription>
						Экран загрузки при запуске приложения
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Включить Splash Screen</Label>
							<p className="text-muted-foreground text-sm">
								Показывать экран загрузки при запуске
							</p>
						</div>
						<Switch
							checked={settings.splash_enabled}
							onCheckedChange={(checked) =>
								handleChange("splash_enabled", checked)
							}
						/>
					</div>

					{settings.splash_enabled && (
						<>
							<div className="space-y-2">
								<Label>Изображение</Label>
								<Input
									onChange={(e) =>
										handleChange("splash_image_url", e.target.value)
									}
									placeholder="https://cdn.unity.com/splash.png"
									value={settings.splash_image_url || ""}
								/>
							</div>

							<div className="space-y-2">
								<Label>Цвет фона</Label>
								<div className="flex gap-2">
									<Input
										className="h-10 w-20 p-1"
										onChange={(e) =>
											handleChange("splash_bg_color", e.target.value)
										}
										type="color"
										value={settings.splash_bg_color}
									/>
									<Input
										className="flex-1"
										onChange={(e) =>
											handleChange("splash_bg_color", e.target.value)
										}
										value={settings.splash_bg_color}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label>Длительность (мс): {settings.splash_duration_ms}</Label>
								<Slider
									max={5000}
									min={500}
									onValueChange={([value]) =>
										handleChange("splash_duration_ms", value)
									}
									step={100}
									value={[settings.splash_duration_ms]}
								/>
							</div>

							<div className="space-y-2">
								<Label>Анимация</Label>
								<Select
									onValueChange={(value) =>
										handleChange("splash_animation", value)
									}
									value={settings.splash_animation}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="fade">Fade</SelectItem>
										<SelectItem value="zoom">Zoom</SelectItem>
										<SelectItem value="slide">Slide</SelectItem>
										<SelectItem value="none">None</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Следующий экран</Label>
								<Select
									onValueChange={(value) =>
										handleChange("splash_next_screen", value)
									}
									value={settings.splash_next_screen}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="onboarding">Onboarding</SelectItem>
										<SelectItem value="login">Login</SelectItem>
										<SelectItem value="home">Home</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
