/**
 * Confetti Explosion Component
 *
 * Красивый эффект конфетти для success modal
 * Основан на примере из ticket-confirmation-card
 *
 * ВАЖНО: Confetti должен быть СНАРУЖИ modal (fixed positioning)
 * чтобы падать поверх всего экрана, а не внутри modal
 */

export interface ConfettiExplosionProps {
	/**
	 * Количество конфетти частиц
	 * @default 100
	 */
	confettiCount?: number;

	/**
	 * Длительность анимации в секундах (не используется, для совместимости)
	 * @default 5
	 */
	duration?: number;

	/**
	 * Цвета конфетти
	 * @default ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6", "#f97316"]
	 */
	colors?: string[];
}

export function ConfettiExplosion({
	confettiCount = 100,
	colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#f97316'],
}: ConfettiExplosionProps) {
	return (
		<>
			<style>
				{`
          @keyframes fall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
			</style>
			<div
				className="fixed inset-0 pointer-events-none"
				style={{ zIndex: 9999 }}
				aria-hidden="true"
			>
				{Array.from({ length: confettiCount }).map((_, i) => (
					<div
						key={i}
						className="absolute w-2 h-4"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${-20 + Math.random() * 10}%`,
							backgroundColor: colors[i % colors.length],
							transform: `rotate(${Math.random() * 360}deg)`,
							animation: `fall ${2.5 + Math.random() * 2.5}s ${Math.random() * 2}s linear forwards`,
						}}
					/>
				))}
			</div>
		</>
	);
}
