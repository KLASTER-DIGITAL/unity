import { imgEllipse } from '@/imports/svg-ok0q3';

/**
 * Decorative ellipse element
 */
export function Ellipse() {
	return (
		<div className="pointer-events-none absolute top-20 right-4 z-0 h-12 w-16">
			<img alt="" className="block h-full w-full object-contain" src={imgEllipse} />
		</div>
	);
}
