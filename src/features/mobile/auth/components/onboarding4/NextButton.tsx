import { motion } from "motion/react";
import { imgArrowRight, imgRectangle5904 } from "@/imports/svg-6xkhk";

interface NextButtonProps {
  onNext: () => void;
  disabled: boolean;
}

function ArrowRight() {
  return (
    <div className="relative size-full" data-name="Arrow - Right">
      <div className="absolute inset-[-5%_-6.22%]">
        <img className="block max-w-none size-full" src={imgArrowRight} />
      </div>
    </div>
  );
}

/**
 * Next Button Component
 * Large animated button for proceeding to next step
 */
export function NextButton({ onNext, disabled }: NextButtonProps) {
  const handleClick = () => {
    console.log('[NextButton] onClick called, disabled:', disabled);
    if (!disabled) {
      console.log('[NextButton] Calling onNext...');
      onNext();
      console.log('[NextButton] onNext called successfully');
    } else {
      console.log('[NextButton] Click ignored - button is disabled');
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`absolute h-[191px] w-[129px] max-w-[30vw] bg-transparent ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        bottom: "max(-2px, calc(0px - 2vh))",
        right: "max(-1px, calc(0px - 1vw))",
        zIndex: 50
      }}
      data-name="Next Button"
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{
        opacity: disabled ? 0.5 : 1,
        scale: 1,
        x: 0
      }}
      transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
      whileHover={{
        scale: disabled ? 1 : 1.05,
        rotate: disabled ? 0 : 2
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <div className="absolute h-full w-full">
        <div className="absolute bottom-0 left-[7.57%] right-0 top-0 pointer-events-none">
          <img className="block max-w-none size-full" src={imgRectangle5904} />
        </div>
        
        {/* Arrow integrated inside */}
        <div
          className={`absolute size-6 z-10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            bottom: "min(69px, 15vh)",
            right: "min(46px, 12vw)"
          }}
        >
          <div className="absolute flex inset-[23.75%_17.71%_26.04%_19.79%] items-center justify-center pointer-events-none">
            <div className="flex-none h-[15px] rotate-[270deg] w-[12.049px]">
              <ArrowRight />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

