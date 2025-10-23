import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { imgArrowRight, imgRectangle5904 } from "@/imports/svg-6xkhk";
import type { NextButtonProps, ArrowRight1Props } from "./types";

/**
 * Arrow Right Icon Component
 */
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
 * Arrow Right Button Component
 */
function ArrowRight1({ onClick, disabled }: ArrowRight1Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`absolute size-6 bg-transparent border-0 cursor-pointer z-10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-name="Arrow - Right"
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
    </button>
  );
}

/**
 * Next Button Component
 * Shows shake animation and toast when clicked while disabled
 */
export function NextButton({ onNext, disabled, validationMessage }: NextButtonProps) {
  const [shake, setShake] = useState(false);

  const handleClick = () => {
    if (disabled) {
      // ✅ FIX: Встряхивание кнопки + toast-уведомление при попытке нажать на disabled кнопку
      setShake(true);
      setTimeout(() => setShake(false), 500);

      // Показываем toast-уведомление с переводом
      if (validationMessage) {
        toast.error(validationMessage, {
          duration: 3000,
          position: 'top-center',
        });
      }
      return;
    }
    onNext();
  };

  return (
    <motion.div
      className="absolute contents"
      style={{
        bottom: "max(-2px, calc(0px - 2vh))",
        right: "max(-1px, calc(0px - 1vw))"
      }}
      data-name="Next Button"
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{
        opacity: disabled ? 0.5 : 1,
        scale: 1,
        x: shake ? [0, -10, 10, -10, 10, 0] : 0
      }}
      transition={{
        delay: shake ? 0 : 0.6,
        duration: shake ? 0.5 : 0.6,
        type: shake ? "tween" : "spring"
      }}
      whileHover={{
        scale: disabled ? 1 : 1.05,
        rotate: disabled ? 0 : 0
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <button
        onClick={handleClick}
        className={`absolute h-[191px] w-[129px] max-w-[30vw] bg-transparent border-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
          bottom: "max(-2px, calc(0px - 2vh))",
          right: "max(-1px, calc(0px - 1vw))"
        }}
      >
        <div className="absolute bottom-0 left-[7.57%] right-0 top-0 pointer-events-none">
          <img className="block max-w-none size-full" src={imgRectangle5904} />
        </div>
      </button>
      <ArrowRight1 onClick={handleClick} disabled={disabled} />
    </motion.div>
  );
}

