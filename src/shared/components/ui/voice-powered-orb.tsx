'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/universal';
import { useAudioLevel } from '@/shared/hooks/useAudioLevel';
import { useSpeechRecognition } from '@/shared/hooks/useSpeechRecognition';
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
 * - Universal Components (Button) для кросс-платформенности
 *
 * ЛОГИКА:
 * 1. Клик на микрофон в InputArea → открывается полноэкранный компонент
 * 2. Автостарт записи при открытии (Web Speech API)
 * 3. Continuous mode для мобильных браузеров (дольше слушает)
 * 4. Текст вставляется в input через onTranscriptReady НЕМЕДЛЕННО
 * 5. Пользователь видит распознанный текст и нажимает "Готово"
 * 6. Модальное окно закрывается ВРУЧНУЮ (НЕ автоматически)
 *
 * ДИЗАЙН:
 * - Полноэкранный backdrop с blur
 * - WebGL орб с GLSL шейдерами
 * - Пульсация и вращение при записи
 * - Визуализатор звука
 * - Кнопка "Готово" (Universal Button) для ручного закрытия
 *
 * МОБИЛЬНАЯ ОПТИМИЗАЦИЯ:
 * - Continuous mode (дольше слушает на мобильных)
 * - Interim results (показывает текст в процессе)
 * - Ручное закрытие (НЕТ автоматического setTimeout)
 * - Визуальная обратная связь (debug info, статус, transcript preview)
 */
export function VoicePoweredOrb({ isOpen, onClose, onTranscriptReady }: VoicePoweredOrbProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [isIOS, setIsIOS] = useState(false); // ✅ iOS Safari детект

	const { isListening, transcript, startListening, abortListening, resetTranscript, isSupported } =
		useSpeechRecognition();

	const onTranscriptReadyRef = useRef(onTranscriptReady); // ✅ Used in handleStopClick
	const isShuttingDownRef = useRef(false); // ✅ Prevents restarts after close
	const lastSubmittedTextRef = useRef<string>(''); // ✅ Prevents duplicate text

	// ✅ Update ref when onTranscriptReady changes
	useEffect(() => {
		onTranscriptReadyRef.current = onTranscriptReady;
	}, [onTranscriptReady]);

	// Reset state on open/close
	useEffect(() => {
		if (isOpen) {
			console.log('[VoicePoweredOrb] Modal opened, resetting state');
			setError(null);
			isShuttingDownRef.current = false;
			lastSubmittedTextRef.current = '';
			resetTranscript();
		} else {
			console.log('[VoicePoweredOrb] Modal closed');
			if (isListening) {
				console.log('[VoicePoweredOrb] Aborting listening');
				abortListening();
			}
		}
	}, [isOpen, isListening, abortListening, resetTranscript]);

	// ✅ CHANGED: Remove auto-start, user taps to start (tap-to-record pattern)
	// This fixes Android issues and makes UX clearer

	// ✅ Детект iOS Safari при открытии модального окна
	useEffect(() => {
		if (!isOpen) return;
		try {
			const ua = navigator.userAgent;
			const isiOSDevice = /iPhone|iPad|iPod/i.test(ua);
			const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Edg/i.test(ua);
			const result = isiOSDevice && isSafari;
			setIsIOS(result);
			console.log('[VoicePoweredOrb] UA detection', { isiOSDevice, isSafari, result });
		} catch (_e) {
			// ignore
		}
	}, [isOpen]);

	// Получить реальный уровень звука через Web Audio API
	// ⚠️ На iOS Safari микрофон нельзя использовать одновременно с SpeechRecognition
	// поэтому отключаем визуализацию уровня звука на iOS
	const audioLevel = useAudioLevel(isListening && !isIOS, !isIOS);
	const audioLevelRef = useRef(audioLevel);

	// Обновлять ref при изменении audioLevel
	useEffect(() => {
		audioLevelRef.current = audioLevel;
	}, [audioLevel]);

	// Логирование изменений isListening для отладки
	useEffect(() => {
		console.log('[VoicePoweredOrb] isListening changed:', isListening);
	}, [isListening]);

	// ✅ УДАЛЕНО: Автоматическая передача текста (вызывала дублирование)
	// Теперь текст передаётся ТОЛЬКО через handleStopClick (ручное управление)

	// ✅ Обработчик кнопки "Стоп" - пользователь сам контролирует когда остановить
	const handleStopClick = () => {
		const trimmedTranscript = transcript?.trim();

		console.log('[VoicePoweredOrb] Stop button clicked');
		console.log('[VoicePoweredOrb] transcript:', transcript);
		console.log('[VoicePoweredOrb] trimmedTranscript:', trimmedTranscript);
		console.log('[VoicePoweredOrb] lastSubmittedTextRef.current:', lastSubmittedTextRef.current);
		console.log('[VoicePoweredOrb] isListening:', isListening);

		// Останавливаем распознавание
		if (isListening) {
			try {
				console.log('[VoicePoweredOrb] Calling abortListening()');
				abortListening();
			} catch (_e) {
				// ignore
			}
		}

		// ✅ FIX: Передаём текст в чат ТОЛЬКО если есть И он НЕ был уже отправлен
		if (trimmedTranscript && trimmedTranscript !== lastSubmittedTextRef.current) {
			try {
				console.log('[VoicePoweredOrb] Calling onTranscriptReady with:', trimmedTranscript);
				onTranscriptReadyRef.current(trimmedTranscript);
				lastSubmittedTextRef.current = trimmedTranscript; // ✅ Запоминаем отправленный текст
				console.log('[VoicePoweredOrb] Text submitted to chat successfully');
			} catch (err) {
				console.error('[VoicePoweredOrb] Error calling onTranscriptReady:', err);
			}
		} else if (trimmedTranscript === lastSubmittedTextRef.current) {
			console.log('[VoicePoweredOrb] Text already submitted, skipping duplicate');
		} else if (!trimmedTranscript) {
			console.warn('[VoicePoweredOrb] No transcript to submit (empty or undefined)');
		}

		// Закрываем орб
		console.log('[VoicePoweredOrb] Closing orb');
		onClose();
	};

	// WebGL орб инициализация
	useEffect(() => {
		if (!isOpen || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const gl = canvas.getContext('webgl2');

		if (!gl) {
			console.error('[VoicePoweredOrb] WebGL2 not supported');
			setError('WebGL не поддерживается в вашем браузере');
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
			setError('Ошибка компиляции шейдеров');
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
			setError('Ошибка линковки шейдеров');
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

			// ✅ FIX: На iOS Safari используем синтетическую пульсацию (sin wave)
			// потому что Web Audio API нельзя использовать одновременно с SpeechRecognition
			let currentAudioLevel: number;
			if (isIOS && isListening) {
				// Синтетическая пульсация для iOS: sin wave с частотой 2 Hz
				const syntheticPulse = Math.sin(currentTime * 2 * Math.PI * 2) * 0.5 + 0.5; // 0.0 - 1.0
				currentAudioLevel = 0.3 + syntheticPulse * 0.4; // 0.3 - 0.7
			} else {
				// Реальный audioLevel из Web Audio API для НЕ-iOS
				currentAudioLevel = isListening ? 0.3 + audioLevelRef.current * 0.7 : 0.2;
			}

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
	}, [isOpen, isListening, isIOS]); // ✅ FIX: Добавлен isIOS для синтетической пульсации

	const handleBackdropClick = () => {
		if (!isListening) {
			onClose();
		}
	};

	return (
		<AnimatedPresence>
			{isOpen && (
				<>
					{/* Backdrop с blur - z-modal-backdrop (60) - КЛИКАБЕЛЬНЫЙ для закрытия, ПОВЕРХ navigation (z-40) */}
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

					{/* WebGL Canvas (орб) - z-modal (70) - ПОВЕРХ backdrop (z-60), pointer-events-none чтобы НЕ блокировать клики по кнопкам */}
					<canvas className="pointer-events-none fixed inset-0 z-modal" ref={canvasRef} />

					{/* ✅ УБРАЛИ кнопку старт/стоп - она мешала вставке текста!
					    Теперь ТОЛЬКО автоматический старт при открытии + кнопка "Готово" когда есть текст */}

					{/* ✅ УДАЛЕНО: DEBUG INFO блоки (показывали "❌ Нет результата" и другие тестовые сообщения) */}

					{/* ✅ КНОПКА "НАЧАТЬ ЗАПИСЬ" для iOS Safari (требуется пользовательский жест) */}
					{/* ✅ FIX: Убран текст, оставлена ТОЛЬКО иконка микрофона (как кнопка Stop) */}
					{/* ✅ КНОПКА "НАЧАТЬ ЗАПИСЬ" - когда НЕ слушаем */}
					{!isListening && !error && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ duration: 0.2 }}
							className="pointer-events-auto fixed bottom-5 left-1/2 z-popover -translate-x-1/2"
						>
							<Button
								onClick={() => {
									if (!isSupported) {
										setError('Голосовой ввод не поддерживается в вашем браузере');
										return;
									}
									console.log('[VoicePoweredOrb] Start button clicked');
									try {
										startListening();
									} catch (err) {
										const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
										setError(`Ошибка: ${errorMessage}`);
									}
								}}
								size="lg"
								variant="default"
								className="bg-primary hover:bg-primary/90 shadow-2xl p-6 text-4xl rounded-full w-20 h-20 flex items-center justify-center focus:outline-none focus:ring-0 active:outline-none"
							>
								<span className="text-white">🎤</span>
							</Button>
						</motion.div>
					)}

					{/* ✅ КНОПКА "ОСТАНОВИТЬ И ОТПРАВИТЬ" - когда слушаем */}
					{isListening && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ duration: 0.2 }}
							className="pointer-events-auto fixed bottom-5 left-1/2 z-popover -translate-x-1/2"
						>
							<Button
								onClick={handleStopClick}
								size="lg"
								variant="default"
								className="bg-white hover:bg-white/90 shadow-2xl p-6 rounded-full w-20 h-20 flex items-center justify-center focus:outline-none focus:ring-0 active:outline-none"
							>
								<ArrowUp className="w-8 h-8 text-black" />
							</Button>
						</motion.div>
					)}

					{/* ✅ PREVIEW TEXT - Текст распознавания ВВЕРХУ экрана, показываем последние 3-4 строки */}
					<AnimatedPresence>
						{transcript && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="pointer-events-none fixed top-20 left-0 right-0 z-popover px-6 text-center"
								style={{ paddingTop: 'env(safe-area-inset-top)' }}
								transition={{ duration: 0.2 }}
							>
								<div
									className="mx-auto max-w-md bg-white/98 backdrop-blur-xl rounded-2xl px-6 py-4 max-h-32 overflow-hidden border border-white/40"
									style={{
										boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
										WebkitBackdropFilter: 'blur(16px)',
										backdropFilter: 'blur(16px)',
									}}
								>
									<p className="text-base font-semibold text-gray-900 leading-relaxed line-clamp-4 text-left drop-shadow-sm">
										"{transcript}"
									</p>
								</div>
							</motion.div>
						)}
					</AnimatedPresence>

					{/* Ошибки - показываем только если есть */}
					{error && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							className="pointer-events-none fixed bottom-52 left-1/2 z-popover w-full max-w-md -translate-x-1/2 px-4 text-center"
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
