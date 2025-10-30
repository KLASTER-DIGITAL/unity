/**
 * ProfileEditModal Component for UNITY-v2
 *
 * Features:
 * - Edit user name
 * - Upload avatar image
 * - Image preview with crop
 * - BottomSheet UI
 * - iOS Design System compliance
 *
 * @author UNITY Team
 * @date 2025-10-19
 */

import { Camera, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { updateUserProfile, uploadMedia } from "@/shared/lib/api";
import { compressImage } from "@/utils/imageCompression";
import { createClient } from "@/utils/supabase/client";

// Дефолтное фото для аватара
const DEFAULT_AVATAR_URL =
	"https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png";

type ProfileEditModalProps = {
	isOpen: boolean;
	onClose: () => void;
	profile: {
		id: string;
		name?: string;
		email?: string;
		avatar?: string;
	};
	onProfileUpdated?: (updatedProfile: any) => void;
};

export function ProfileEditModal({
	isOpen,
	onClose,
	profile,
	onProfileUpdated,
}: ProfileEditModalProps) {
	const [name, setName] = useState(profile?.name || "");
	const [email, setEmail] = useState(profile?.email || "");
	const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || "");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Handle avatar file selection
	const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Неверный формат файла", {
				description: "Пожалуйста, выберите изображение",
			});
			return;
		}

		// Validate file size (max 15MB - современные телефоны делают большие фото)
		if (file.size > 15 * 1024 * 1024) {
			toast.error("Файл слишком большой", {
				description: "Максимальный размер: 15 МБ",
			});
			return;
		}

		try {
			setIsUploading(true);

			console.log(
				`📸 [AVATAR] Original file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
			);

			// Compress image with aggressive settings for large files
			const compressedFile = await compressImage(
				file,
				512, // maxWidth
				file.size > 5 * 1024 * 1024 ? 0.7 : 0.8, // quality - lower for large files
			);

			console.log(
				`📸 [AVATAR] Compressed: ${(compressedFile.size / 1024).toFixed(2)}KB`,
			);

			// Create preview URL
			const previewUrl = URL.createObjectURL(compressedFile);
			setAvatarUrl(previewUrl);
			setAvatarFile(compressedFile);

			toast.success("Фото выбрано", {
				description: 'Нажмите "Сохранить" для применения изменений',
			});
		} catch (error) {
			console.error("Error processing avatar:", error);
			toast.error("Ошибка обработки фото", {
				description: "Попробуйте другое изображение",
			});
		} finally {
			setIsUploading(false);
		}
	};

	// Handle save
	const handleSave = async () => {
		if (!profile?.id) {
			toast.error("Ошибка", { description: "ID пользователя не найден" });
			return;
		}

		// Validate name
		if (!name.trim()) {
			toast.error("Введите имя", {
				description: "Имя не может быть пустым",
			});
			return;
		}

		// Validate email
		if (!(email.trim() && email.includes("@"))) {
			toast.error("Неверный email", {
				description: "Введите корректный email адрес",
			});
			return;
		}

		try {
			setIsSaving(true);

			let uploadedAvatarUrl = profile.avatar;

			// Upload avatar if changed
			if (avatarFile) {
				try {
					console.log("📸 [PROFILE] Uploading avatar...");
					const mediaFile = await uploadMedia(avatarFile, profile.id);
					console.log("📸 [PROFILE] Upload response:", mediaFile);

					if (mediaFile?.url) {
						uploadedAvatarUrl = mediaFile.url;
						console.log("📸 [PROFILE] Avatar URL set:", uploadedAvatarUrl);
					} else {
						console.warn("📸 [PROFILE] No URL in response:", mediaFile);
						toast.error("Ошибка загрузки фото", {
							description:
								"Не удалось получить URL фото. Профиль будет сохранен без нового фото",
						});
					}
				} catch (uploadError: any) {
					console.error("📸 [PROFILE] Avatar upload error:", uploadError);
					toast.error("Ошибка загрузки фото", {
						description:
							uploadError.message || "Профиль будет сохранен без нового фото",
					});
				}
			}

			// Update email if changed (via Supabase Auth)
			const emailChanged = email.trim() !== profile.email;
			if (emailChanged) {
				try {
					const supabase = createClient();
					const { error: emailError } = await supabase.auth.updateUser({
						email: email.trim(),
					});

					if (emailError) {
						throw emailError;
					}

					toast.info("Подтвердите новый email", {
						description: "Мы отправили письмо для подтверждения на новый адрес",
					});
				} catch (emailError) {
					console.error("Email update error:", emailError);
					toast.error("Ошибка смены email", {
						description: "Не удалось изменить email. Попробуйте позже",
					});
					// Don't return - continue with profile update
				}
			}

			// Update profile in database
			const updatedProfile = await updateUserProfile(profile.id, {
				name: name.trim(),
				avatar: uploadedAvatarUrl,
				email: email.trim(), // Update email in profiles table
			});

			toast.success("Профиль обновлен", {
				description: emailChanged
					? "Изменения сохранены. Проверьте email для подтверждения"
					: "Изменения успешно сохранены",
			});

			// Notify parent component
			if (onProfileUpdated) {
				onProfileUpdated(updatedProfile);
			}

			onClose();
		} catch (error) {
			console.error("Error saving profile:", error);
			toast.error("Ошибка сохранения", {
				description: "Попробуйте еще раз",
			});
		} finally {
			setIsSaving(false);
		}
	};

	// Handle remove avatar
	const handleRemoveAvatar = async () => {
		if (!profile?.id) {
			toast.error("Ошибка", { description: "ID пользователя не найден" });
			return;
		}

		try {
			setIsSaving(true);

			// Update profile in database with empty avatar
			const updatedProfile = await updateUserProfile(profile.id, {
				avatar: "", // Remove avatar
			});

			console.log("✅ Avatar removed from database:", updatedProfile);

			// Update local state immediately
			setAvatarUrl("");
			setAvatarFile(null);

			// Notify parent component for real-time update
			if (onProfileUpdated) {
				onProfileUpdated(updatedProfile);
			}

			toast.success("Фото удалено", {
				description: "Изменения сохранены",
			});
		} catch (error) {
			console.error("Error removing avatar:", error);
			toast.error("Ошибка удаления фото", {
				description: "Попробуйте еще раз",
			});
		} finally {
			setIsSaving(false);
		}
	};

	// Handle cancel
	const handleCancel = () => {
		// Reset to original values
		setName(profile?.name || "");
		setEmail(profile?.email || "");
		setAvatarUrl(profile?.avatar || "");
		setAvatarFile(null);
		onClose();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={!isSaving ? handleCancel : undefined}
					/>

					{/* Modal Content */}
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="modal-bottom-sheet z-modal mx-auto max-h-[95vh] max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
						exit={{ opacity: 0, y: 100 }}
						initial={{ opacity: 0, y: 100 }}
					>
						{/* Header */}
						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-foreground text-title-3">
								Редактировать профиль
							</h2>
							<button
								className="rounded-full p-1 transition-colors hover:bg-accent/10 disabled:opacity-50"
								disabled={isSaving}
								onClick={handleCancel}
							>
								<X className="h-5 w-5 text-foreground" />
							</button>
						</div>

						<div className="space-y-6">
							{/* Avatar Section - Improved Design from 21st.dev */}
							<div className="flex flex-col items-center gap-4">
								<div className="group relative">
									{/* Remove Button (only if avatar exists) - MOVED TO TOP RIGHT */}
									<AnimatePresence>
										{avatarUrl && !isUploading && (
											<motion.button
												animate={{ scale: 1, opacity: 1 }}
												aria-label="Remove photo"
												className="-top-2 -right-2 absolute z-10 rounded-full bg-destructive p-2 text-destructive-foreground shadow-lg ring-4 ring-background transition-all hover:bg-destructive/90 active:scale-95"
												exit={{ scale: 0, opacity: 0 }}
												initial={{ scale: 0, opacity: 0 }}
												onClick={handleRemoveAvatar}
												title="Удалить фото"
											>
												<X className="h-4 w-4" strokeWidth={2.5} />
											</motion.button>
										)}
									</AnimatePresence>

									{/* Avatar with hover effect */}
									<div className="relative">
										<Avatar className="h-32 w-32 border-4 border-border transition-all duration-300 group-hover:border-primary/50">
											<AvatarImage
												alt={name}
												className="object-cover"
												src={avatarUrl || DEFAULT_AVATAR_URL}
											/>
											<AvatarFallback className="bg-muted">
												<img
													alt="Default avatar"
													className="h-full w-full object-cover"
													src={DEFAULT_AVATAR_URL}
												/>
											</AvatarFallback>
										</Avatar>

										{/* Hover overlay - clickable to upload */}
										<div
											className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
											onClick={() =>
												!isUploading && fileInputRef.current?.click()
											}
										>
											{isUploading ? (
												<Loader2
													className="h-8 w-8 animate-spin text-white"
													strokeWidth={2}
												/>
											) : (
												<Camera
													className="h-8 w-8 text-white"
													strokeWidth={2}
												/>
											)}
										</div>
									</div>
								</div>

								<div className="space-y-1 text-center">
									<p className="font-medium text-foreground text-sm">
										{avatarUrl
											? "Изменить фото профиля"
											: "Добавить фото профиля"}
									</p>
									<p className="font-normal text-muted-foreground text-xs">
										JPG, PNG или GIF • Макс. 15 МБ
									</p>
								</div>
							</div>

							{/* Form Fields */}
							<div className="space-y-4">
								{/* Name Input */}
								<div className="space-y-2">
									<label className="font-semibold text-foreground text-sm">
										Имя
									</label>
									<Input
										disabled={isSaving}
										maxLength={50}
										onChange={(e) => setName(e.target.value)}
										placeholder="Введите ваше имя"
										type="text"
										value={name}
									/>
									<p className="text-muted-foreground text-xs">
										{name.length}/50 символов
									</p>
								</div>

								{/* Email (Editable) */}
								<div className="space-y-2">
									<label className="font-semibold text-foreground text-sm">
										Email
									</label>
									<Input
										disabled={isSaving}
										maxLength={100}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="your@email.com"
										type="email"
										value={email}
									/>
									<p className="text-muted-foreground text-xs">
										{email !== profile?.email
											? "После смены email потребуется подтверждение"
											: "Введите новый email для изменения"}
									</p>
								</div>
							</div>
						</div>

						{/* Footer with action buttons */}
						<div className="mt-6 flex gap-3 border-border border-t pt-4">
							<Button
								className="flex-1"
								disabled={isSaving}
								onClick={handleCancel}
								variant="outline"
							>
								Отмена
							</Button>
							<Button
								className="flex-1"
								disabled={isSaving || isUploading || !name.trim()}
								onClick={handleSave}
							>
								{isSaving ? "Сохранение..." : "Сохранить"}
							</Button>
						</div>

						{/* Hidden File Input */}
						<input
							accept="image/*"
							aria-label="Select avatar image"
							className="hidden"
							onChange={handleAvatarSelect}
							ref={fileInputRef}
							type="file"
						/>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
