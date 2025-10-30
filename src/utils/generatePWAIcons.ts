/**
 * Утилита для генерации PWA иконок
 * Создает иконки с градиентным фоном и эмодзи
 */

export function generatePWAIcon(size: number, emoji = '🏆'): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			reject(new Error('Could not get canvas context'));
			return;
		}

		// Фон с градиентом
		const gradient = ctx.createLinearGradient(0, 0, size, size);
		gradient.addColorStop(0, '#007AFF');
		gradient.addColorStop(1, '#0051D5');
		ctx.fillStyle = gradient;

		// Скругленные углы
		const radius = size * 0.2;
		ctx.beginPath();
		ctx.moveTo(radius, 0);
		ctx.lineTo(size - radius, 0);
		ctx.quadraticCurveTo(size, 0, size, radius);
		ctx.lineTo(size, size - radius);
		ctx.quadraticCurveTo(size, size, size - radius, size);
		ctx.lineTo(radius, size);
		ctx.quadraticCurveTo(0, size, 0, size - radius);
		ctx.lineTo(0, radius);
		ctx.quadraticCurveTo(0, 0, radius, 0);
		ctx.closePath();
		ctx.fill();

		// Эмодзи в центре
		const fontSize = size * 0.55;
		ctx.font = `${fontSize}px Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';

		// Небольшая тень для эмодзи
		ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
		ctx.shadowBlur = size * 0.02;
		ctx.shadowOffsetY = size * 0.01;

		ctx.fillText(emoji, size / 2, size / 2);

		// Преобразуем в blob
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error('Failed to create blob'));
			}
		}, 'image/png');
	});
}

/**
 * Создает и сохраняет все необходимые иконки для PWA
 */
export async function generateAllPWAIcons(): Promise<void> {
	const sizes = [192, 512];

	for (const size of sizes) {
		try {
			const blob = await generatePWAIcon(size);
			const url = URL.createObjectURL(blob);

			// Обновляем или создаем link элементы
			updateIconLink(size, url);

			console.log(`Generated PWA icon: ${size}x${size}`);
		} catch (error) {
			console.error(`Failed to generate icon ${size}x${size}:`, error);
		}
	}
}

function updateIconLink(size: number, url: string) {
	// Обновляем обычную иконку
	let iconLink = document.querySelector(
		`link[rel="icon"][sizes="${size}x${size}"]`
	) as HTMLLinkElement;
	if (!iconLink) {
		iconLink = document.createElement('link');
		iconLink.rel = 'icon';
		iconLink.type = 'image/png';
		iconLink.sizes = `${size}x${size}`;
		document.head.appendChild(iconLink);
	}
	iconLink.href = url;

	// Для 192px также обновляем apple-touch-icon
	if (size === 192) {
		let appleIconLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
		if (!appleIconLink) {
			appleIconLink = document.createElement('link');
			appleIconLink.rel = 'apple-touch-icon';
			document.head.appendChild(appleIconLink);
		}
		appleIconLink.href = url;
	}
}

/**
 * Генерирует скриншот для PWA (для app stores)
 */
export async function generatePWAScreenshot(width = 390, height = 844): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			reject(new Error('Could not get canvas context'));
			return;
		}

		// Белый фон
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, width, height);

		// Можно добавить логику для захвата реального скриншота
		// Но для простоты используем placeholder
		ctx.fillStyle = '#007AFF';
		ctx.font = '24px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Дневник Достижений', width / 2, height / 2);

		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error('Failed to create screenshot blob'));
			}
		}, 'image/png');
	});
}
