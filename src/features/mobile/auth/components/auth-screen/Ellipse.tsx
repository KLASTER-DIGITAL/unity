import { imgEllipse } from "@/imports/svg-ok0q3";

/**
 * Decorative ellipse element
 */
export function Ellipse() {
  return (
    <div className="absolute right-4 top-20 w-16 h-12 pointer-events-none z-0">
      <img className="block w-full h-full object-contain" src={imgEllipse} alt="" />
    </div>
  );
}

