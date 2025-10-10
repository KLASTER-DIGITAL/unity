import imgImage1569 from "figma:asset/5f4bd000111b1df6537a53aaf570a9424e39fbcf.png";
import { imgCircle, imgSliedbar, imgArrowRight, imgRectangle5904 } from "./svg-6xkhk";

function Circle() {
  return (
    <div className="h-[434px] relative shrink-0 w-[369px]" data-name="Circle">
      <img className="block max-w-none size-full" src={imgCircle} />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute gap-4 grid grid-cols-[repeat(1,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] h-[133px] leading-[0] top-[453px] translate-x-[-50%] w-[335px]" data-name="Text" style={{ left: "calc(50% + 6.5px)" }}>
      <div className="[grid-area:1_/_1] font-['Poppins:Medium',_'Noto_Sans:Regular',_sans-serif] relative shrink-0 text-[#756ef3] text-[14px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[18px] whitespace-pre">Твои маленькие шаги — большие победы</p>
      </div>
      <div className="[grid-area:2_/_1] font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] relative self-start shrink-0 text-[#002055] text-[28px] tracking-[-1px] w-[335px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[33px]">Фиксируй достижения и смотри, как растёт твой прогресс</p>
      </div>
    </div>
  );
}

function Sliedbar() {
  return (
    <div className="absolute h-2 left-[46px] translate-y-[-50%] w-[50px]" data-name="Sliedbar" style={{ top: "calc(50% + 228.5px)" }}>
      <img className="block max-w-none size-full" src={imgSliedbar} />
    </div>
  );
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

function ArrowRight1() {
  return (
    <div className="absolute bottom-[69px] right-[46px] size-6" data-name="Arrow - Right">
      <div className="absolute flex inset-[23.75%_17.71%_26.04%_19.79%] items-center justify-center">
        <div className="flex-none h-[15px] rotate-[270deg] w-[12.049px]">
          <ArrowRight />
        </div>
      </div>
    </div>
  );
}

function NextButton() {
  return (
    <div className="absolute bottom-[-2px] contents right-[-1px]" data-name="Next Button">
      <div className="absolute bottom-[-2px] h-[191px] right-[-1px] w-[129px]">
        <div className="absolute bottom-0 left-[7.57%] right-0 top-0">
          <img className="block max-w-none size-full" src={imgRectangle5904} />
        </div>
      </div>
      <ArrowRight1 />
    </div>
  );
}

function Frame2087324618() {
  return (
    <div className="content-center flex flex-wrap gap-0 h-[841px] items-center justify-center relative shrink-0 w-[444px]">
      <Circle />
      <div className="absolute bg-center bg-cover bg-no-repeat h-[379px] top-[27px] translate-x-[-50%] w-[314px]" data-name="image 1569" style={{ left: "calc(50% - 1px)", backgroundImage: `url('${imgImage1569}')` }} />
      <Text />
      <Sliedbar />
      <NextButton />
      <div className="absolute flex flex-col font-['Poppins:Regular',_sans-serif] justify-center leading-[0] left-[58.01px] not-italic text-[#002055] text-[14px] text-center translate-x-[-50%] translate-y-[-50%] w-[31.011px]" style={{ top: "calc(50% + 334.5px)" }}>
        <p className="leading-[14px]">Skip</p>
      </div>
    </div>
  );
}

export default function Onboard2() {
  return (
    <div className="bg-white content-stretch flex gap-2.5 items-center justify-center relative size-full" data-name="Onboard 2">
      <Frame2087324618 />
    </div>
  );
}