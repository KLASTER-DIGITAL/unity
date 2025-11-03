'use client';

import { useEffect, useRef, useState } from 'react';
import { useAudioLevel } from '@/shared/hooks/useAudioLevel';
import { useSpeechRecognition } from '@/shared/hooks/useSpeechRecognition';
import { useTranslation } from '@/shared/lib/i18n/useTranslation';
import { AnimatedPresence, motion } from '@/shared/lib/platform/animation';

interface VoicePoweredOrbProps {
	isOpen: boolean;
	onClose: () => void;
	onTranscriptReady: (text: string) => void;
}

/**
 * Voice Powered Orb Component with WebGL
 * Полноэкранный компонент с анимированным WebGL орбом для голосового ввода
 *
 * ТЕХНОЛОГИИ:
 * - WebGL с OGL библиотекой
 * - GLSL шейдеры (procedural noise, color shifting, lighting)
 * - Web Speech API (useSpeechRecognition)
 * - Framer Motion для анимаций
 *
 * ЛОГИКА:
 * 1. Клик на микрофон в InputArea → открывается полноэкранный компонент
 * 2. Клик на орб → начинается запись (Web Speech API)
 * 3. Автоматическая остановка когда пользователь перестает говорить
 * 4. Текст вставляется в input через onTranscriptReady
 * 5. Модальное окно закрывается автоматически
 *
 * ДИЗАЙН:
 * - Полноэкранный backdrop с blur
 * - WebGL орб с GLSL шейдерами
 * - Пульсация и вращение при записи
 * - Визуализатор звука
 */
export function VoicePoweredOrb({ isOpen, onClose, onTranscriptReady }: VoicePoweredOrbProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [debugInfo, setDebugInfo] = useState<string>(''); // ✅ DEBUG: визуальный индикатор
	const { t } = useTranslation();

	const { isListening, transcript, startListening, stopListening, isSupported, debugInfo: speechDebugInfo } =
		useSpeechRecognition();

	// ✅ АВТОМАТИЧЕСКИЙ СТАРТ: Начинаем запись ТОЛЬКО ОДИН РАЗ при открытии
	// Используем ref чтобы предотвратить повторный запуск когда isListening меняется
	const hasAutoStartedRef = useRef(false);

	useEffect(() => {
		if (isOpen) {
			// Сбрасываем флаг при открытии
			hasAutoStartedRef.current = false;
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen && !hasAutoStartedRef.current) {
			// Проверяем поддержку браузера
			if (!isSupported) {
				setError(
					'Голосовой ввод не поддерживается в вашем браузере. Попробуйте Chrome, Edge или Firefox.'
				);
				console.warn('[VoicePoweredOrb] Speech recognition not supported');
				hasAutoStartedRef.current = true; // Помечаем что попытались
				return;
			}

			// Автоматически начинаем запись при открытии ТОЛЬКО ОДИН РАЗ
			console.log('[VoicePoweredOrb] Auto-starting recording on open (ONCE)');
			hasAutoStartedRef.current = true; // Помечаем что запустили
			setTimeout(() => {
				startListening();
			}, 300); // Небольшая задержка для плавности анимации
		}
	}, [isOpen, isSupported, startListening]);

	// Получить реальный уровень звука через Web Audio API
	const audioLevel = useAudioLevel(isListening);
	const audioLevelRef = useRef(audioLevel);

	// Обновлять ref при изменении audioLevel
	useEffect(() => {
		audioLevelRef.current = audioLevel;
	}, [audioLevel]);

	// Логирование изменений isListening для отладки
	useEffect(() => {
		console.log('[VoicePoweredOrb] isListening changed:', isListening);
		// ✅ DEBUG: показываем информацию из hook
		if (speechDebugInfo) {
			setDebugInfo(speechDebugInfo);
		}
	}, [isListening, speechDebugInfo]);

	// Обработка нового транскрипта (используем useRef для предотвращения дублей)
	const lastTranscriptRef = useRef('');

	useEffect(() => {
		if (transcript?.trim() && transcript !== lastTranscriptRef.current) {
			console.log('[VoicePoweredOrb] New transcript:', transcript);
			setDebugInfo(`✅ Получен текст: "${transcript.substring(0, 30)}..."`); // ✅ DEBUG
			lastTranscriptRef.current = transcript;
			onTranscriptReady(transcript);
			// Закрываем модальное окно после получения текста
			setTimeout(() => {
				console.log('[VoicePoweredOrb] Closing modal after transcript');
				setDebugInfo('Закрываем окно...'); // ✅ DEBUG
				onClose();
			}, 500);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transcript]);

	// Сброс состояния при закрытии
	useEffect(() => {
		if (!isOpen) {
			console.log('[VoicePoweredOrb] Modal closed, resetting state');
			lastTranscriptRef.current = '';
			setError(null);
			if (isListening) {
				console.log('[VoicePoweredOrb] Stopping listening on close');
				stopListening();
			}
		}
	}, [isOpen, isListening, stopListening]);

	// WebGL орб инициализация
	// biome-ignore lint/correctness/useExhaustiveDependencies: t is stable from useTranslation
	useEffect(() => {
		if (!isOpen || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const gl = canvas.getContext('webgl2');

		if (!gl) {
			console.error('[VoicePoweredOrb] WebGL2 not supported');
			setError(t('voice_orb_error_webgl', 'WebGL не поддерживается в вашем браузере'));
			return;
		}

		// Установка размера canvas
		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			canvas.width = window.innerWidth * dpr;
			canvas.height = window.innerHeight * dpr;
			canvas.style.width = `${window.innerWidth}px`;
			canvas.style.height = `${window.innerHeight}px`;
			gl.viewport(0, 0, canvas.width, canvas.height);
		};

		resize();
		window.addEventListener('resize', resize);

		// Vertex shader
		const vertexShaderSource = `
			attribute vec4 position;
			void main() {
				gl_Position = position;
			}
		`;

		// Fragment shader с процедурным шумом и цветовыми эффектами
		const fragmentShaderSource = `
			precision highp float;
			uniform vec2 resolution;
			uniform float time;
			uniform float audioLevel;

			// Simplex noise function
			vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
			vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
			vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

			float snoise(vec2 v) {
				const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
				vec2 i  = floor(v + dot(v, C.yy));
				vec2 x0 = v -   i + dot(i, C.xx);
				vec2 i1;
				i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
				vec4 x12 = x0.xyxy + C.xxzz;
				x12.xy -= i1;
				i = mod289(i);
				vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
				vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
				m = m*m;
				m = m*m;
				vec3 x = 2.0 * fract(p * C.www) - 1.0;
				vec3 h = abs(x) - 0.5;
				vec3 ox = floor(x + 0.5);
				vec3 a0 = x - ox;
				m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
				vec3 g;
				g.x  = a0.x  * x0.x  + h.x  * x0.y;
				g.yz = a0.yz * x12.xz + h.yz * x12.yw;
				return 130.0 * dot(m, g);
			}

			void main() {
				vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
				float dist = length(uv);

				// Орб радиус с УСИЛЕННОЙ пульсацией для синхронизации с речью
				float radius = 0.3 + audioLevel * 0.3;

				// Процедурный шум для органических эффектов
				float noise = snoise(uv * 3.0 + time * 0.5);
				float noise2 = snoise(uv * 5.0 - time * 0.3);

				// Цветовой градиент (cyan → blue → purple) - БЕЗ розового
				vec3 color1 = vec3(0.2, 0.7, 0.9);   // cyan (голубой)
				vec3 color2 = vec3(0.4, 0.5, 0.95);  // blue (синий)
				vec3 color3 = vec3(0.6, 0.4, 0.85);  // purple (сиреневый)
				vec3 color = mix(mix(color1, color2, sin(time + noise) * 0.5 + 0.5), color3, cos(time * 0.7) * 0.5 + 0.5);

				// Свечение орба
				float glow = smoothstep(radius + 0.1, radius - 0.1, dist + noise * 0.05);
				float edge = smoothstep(radius + 0.05, radius, dist + noise2 * 0.03);

				// Внутренние детали
				float detail = sin(dist * 20.0 - time * 2.0 + noise * 3.0) * 0.5 + 0.5;
				color += detail * 0.2 * edge;

				// Финальный цвет с альфа-каналом
				vec3 finalColor = color * (glow + edge * 0.5);
				float alpha = glow + edge * 0.3;

				gl_FragColor = vec4(finalColor, alpha);
			}
		`;

		// Компиляция шейдеров
		const compileShader = (source: string, type: number) => {
			const shader = gl.createShader(type);
			if (!shader) return null;
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error('Shader compile error:', gl.getShaderInfoLog(shader));
				gl.deleteShader(shader);
				return null;
			}
			return shader;
		};

		const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
		const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

		if (!vertexShader || !fragmentShader) {
			setError(t('voice_orb_error_shader', 'Ошибка компиляции шейдеров'));
			return;
		}

		// Создание программы
		const program = gl.createProgram();
		if (!program) return;

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Program link error:', gl.getProgramInfoLog(program));
			setError(t('voice_orb_error_shader_link', 'Ошибка линковки шейдеров'));
			return;
		}

		// biome-ignore lint/correctness/useHookAtTopLevel: This is WebGL API, not React hook
		gl.useProgram(program);

		// Создание буфера для полноэкранного квада
		const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

		const positionLocation = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

		// Uniform locations
		const resolutionLocation = gl.getUniformLocation(program, 'resolution');
		const timeLocation = gl.getUniformLocation(program, 'time');
		const audioLevelLocation = gl.getUniformLocation(program, 'audioLevel');

		// Включить blending для альфа-канала
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		// Анимационный цикл
		let animationId: number;
		const startTime = Date.now();

		const render = () => {
			const currentTime = (Date.now() - startTime) / 1000;
			// Использовать реальный audioLevel из Web Audio API
			const currentAudioLevel = isListening ? 0.3 + audioLevelRef.current * 0.7 : 0.2;

			gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
			gl.uniform1f(timeLocation, currentTime);
			gl.uniform1f(audioLevelLocation, currentAudioLevel);

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			animationId = requestAnimationFrame(render);
		};

		render();

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', resize);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			gl.deleteBuffer(positionBuffer);
		};
	}, [isOpen, isListening]);

	const handleBackdropClick = () => {
		if (!isListening) {
			onClose();
		}
	};

	return (
		<AnimatedPresence>
			{isOpen && (
				<>
					{/* Backdrop с blur - z-modal-backdrop (60) - КЛИКАБЕЛЬНЫЙ для закрытия */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={handleBackdropClick}
						style={{
							WebkitBackdropFilter: 'blur(8px)',
							backdropFilter: 'blur(8px)',
						}}
						transition={{ duration: 0.2 }}
					/>

					{/* WebGL Canvas (орб) - z-modal (ПОВЕРХ backdrop) */}
					<canvas className="pointer-events-none fixed inset-0 z-modal" ref={canvasRef} />

					{/* Кнопка управления В ЦЕНТРЕ орба - z-popover (САМЫЙ ВЕРХНИЙ, ПОВЕРХ орба) */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="fixed left-1/2 top-1/2 z-popover flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4"
						exit={{ opacity: 0, scale: 0.8 }}
						initial={{ opacity: 0, scale: 0.8 }}
					>
						<button
							className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-white/30 active:scale-95"
							onClick={() => {
								if (isListening) {
									stopListening();
								} else {
									setError(null);
									startListening();
								}
							}}
							type="button"
							aria-label={isListening ? 'Остановить запись' : 'Начать запись'}
						>
							{/* Иконка микрофона */}
							<svg
								className="h-10 w-10 text-white drop-shadow-lg"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<title>{isListening ? 'Остановить' : 'Начать'}</title>
								{isListening ? (
									// Иконка стоп (квадрат)
									<rect height="12" rx="2" width="12" x="6" y="6" />
								) : (
									// Иконка микрофона
									<>
										<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
										<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
										<line x1="12" x2="12" y1="19" y2="23" />
										<line x1="8" x2="16" y1="23" y2="23" />
									</>
								)}
							</svg>
						</button>
						{/* Текст под кнопкой */}
						<p className="text-center text-sm font-medium text-white drop-shadow-lg">
							{isListening ? 'Остановить запись' : 'Начать запись'}
						</p>
					</motion.div>

					{/* DEBUG INFO - показываем ВСЕГДА для отладки */}
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="pointer-events-none fixed top-20 left-1/2 z-100 w-full max-w-md -translate-x-1/2 px-4 text-center"
						exit={{ opacity: 0, y: -10 }}
						initial={{ opacity: 0, y: -10 }}
					>
						<div className="space-y-2">
							<div className="rounded-lg bg-blue-500/90 px-4 py-2 text-xs font-mono text-white shadow-lg">
								{debugInfo || 'Ожидание...'}
							</div>
							{/* Показываем статус записи */}
							<div className={`rounded-lg px-4 py-2 text-xs font-mono text-white shadow-lg ${isListening ? 'bg-green-500/90' : 'bg-gray-500/90'}`}>
								{isListening ? '🔴 ЗАПИСЬ' : '⏸️ ПАУЗА'}
							</div>
						</div>
					</motion.div>

					{/* Ошибки - показываем только если есть */}
					{error && (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							className="pointer-events-none fixed bottom-52 left-1/2 z-100 w-full max-w-md -translate-x-1/2 px-4 text-center"
							exit={{ opacity: 0, y: 10 }}
							initial={{ opacity: 0, y: 10 }}
						>
							<div className="rounded-lg bg-red-500/90 px-4 py-3 text-sm font-medium text-white shadow-lg">
								{error}
							</div>
						</motion.div>
					)}
				</>
			)}
		</AnimatedPresence>
	);
}
