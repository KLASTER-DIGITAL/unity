'use client';

import { useEffect, useRef, useState } from 'react';
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
	const [lastTranscript, setLastTranscript] = useState('');
	const { t } = useTranslation();

	const { isListening, transcript, startListening, stopListening, isSupported } =
		useSpeechRecognition({
			onError: (err) => {
				console.error('[VoicePoweredOrb] Speech recognition error:', err);
				setError(
					t('voice_orb_error_recognition', 'Не удалось распознать речь. Попробуйте еще раз.')
				);
			},
		});

	// Обработка нового транскрипта
	useEffect(() => {
		if (transcript?.trim() && transcript !== lastTranscript) {
			console.log('[VoicePoweredOrb] New transcript:', transcript);
			setLastTranscript(transcript);
			onTranscriptReady(transcript);
			// Закрываем модальное окно после получения текста
			setTimeout(() => {
				onClose();
			}, 500);
		}
	}, [transcript, lastTranscript, onTranscriptReady, onClose]);

	// Сброс состояния при закрытии
	useEffect(() => {
		if (!isOpen) {
			setLastTranscript('');
			setError(null);
			if (isListening) {
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

				// Орб радиус с пульсацией
				float radius = 0.3 + audioLevel * 0.1;

				// Процедурный шум для органических эффектов
				float noise = snoise(uv * 3.0 + time * 0.5);
				float noise2 = snoise(uv * 5.0 - time * 0.3);

				// Цветовой градиент (purple → pink)
				vec3 color1 = vec3(0.66, 0.33, 0.96); // purple
				vec3 color2 = vec3(0.93, 0.28, 0.58); // pink
				vec3 color = mix(color1, color2, sin(time + noise) * 0.5 + 0.5);

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
			const audioLevel = isListening ? 0.5 + Math.random() * 0.5 : 0.2;

			gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
			gl.uniform1f(timeLocation, currentTime);
			gl.uniform1f(audioLevelLocation, audioLevel);

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

	const handleOrbClick = () => {
		if (!isSupported) {
			setError(t('voice_orb_error_not_supported', 'Голосовой ввод недоступен в вашем браузере'));
			return;
		}

		if (isListening) {
			stopListening();
		} else {
			setError(null);
			startListening();
		}
	};

	const handleBackdropClick = () => {
		if (!isListening) {
			onClose();
		}
	};

	return (
		<AnimatedPresence>
			{isOpen && (
				<>
					{/* Backdrop с blur - ПОЛНОЭКРАННЫЙ как у модальных окон */}
					<motion.div
						animate={{ opacity: 1 }}
						className="pointer-events-none fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
					/>

					{/* Кликабельная область для закрытия - ПОД кнопкой */}
					<button
						className="fixed inset-0 z-[99] cursor-default bg-transparent"
						onClick={handleBackdropClick}
						onKeyDown={(e) => {
							if (e.key === 'Escape') {
								handleBackdropClick();
							}
						}}
						type="button"
						aria-label="Закрыть орб"
					/>

					{/* WebGL Canvas - ПОЛНОЭКРАННЫЙ */}
					<canvas className="pointer-events-none fixed inset-0 z-modal" ref={canvasRef} />

					{/* Кнопка управления СНИЗУ орба - ВЫШЕ ВСЕГО */}
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="fixed bottom-32 left-1/2 z-[101] -translate-x-1/2"
						exit={{ opacity: 0, y: 20 }}
						initial={{ opacity: 0, y: 20 }}
					>
						<button
							className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 active:scale-95"
							onClick={handleOrbClick}
							type="button"
						>
							{/* Иконка микрофона */}
							<svg
								className="h-5 w-5 text-white"
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
							{/* Текст кнопки */}
							<span className="text-sm font-semibold text-white">
								{isListening
									? t('voice_orb_stop_recording', 'Остановить запись')
									: t('voice_orb_start_recording', 'Начать запись')}
							</span>
						</button>
					</motion.div>

					{/* Hint текст и ошибки - ВЫШЕ кнопки, только когда НЕ слушаем */}
					{!isListening && (
						<div className="pointer-events-none fixed bottom-52 left-1/2 z-[100] w-full max-w-md -translate-x-1/2 px-4 text-center">
							{error ? (
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									className="rounded-lg bg-red-500/90 px-4 py-3 text-sm font-medium text-white shadow-lg"
									exit={{ opacity: 0, y: 10 }}
									initial={{ opacity: 0, y: 10 }}
								>
									{error}
								</motion.div>
							) : (
								<>
									<p className="text-sm font-medium text-white">
										{t('voice_orb_tap_to_start', 'Нажмите на орб чтобы начать')}
									</p>
									<p className="mt-1 text-xs text-white/70">
										{t('voice_orb_tap_background_to_close', 'Или нажмите на фон чтобы закрыть')}
									</p>
								</>
							)}
						</div>
					)}
				</>
			)}
		</AnimatedPresence>
	);
}
