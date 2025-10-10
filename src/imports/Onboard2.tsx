import imgImage1569 from "figma:asset/5f4bd000111b1df6537a53aaf570a9424e39fbcf.png";
import { imgSliedbar, imgArrowRight, imgRectangle5904, imgCircle } from "./svg-gy0su";

function Sliedbar() {
  return (
    <div className="absolute h-2 left-[30px] top-[686px] w-[50px]" data-name="Sliedbar">
      <img className="block max-w-none size-full" src={imgSliedbar} />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute contents leading-[0] left-[15px] top-[494px]" data-name="Text">
      <div className="absolute font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] left-[15px] text-[#002055] text-[28px] top-[528px] tracking-[-1px] w-[335px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[33px]">Фиксируй достижения и смотри, как растёт твой прогресс</p>
      </div>
      <div className="absolute font-['Poppins:Medium',_'Noto_Sans:Regular',_sans-serif] left-[17px] text-[#756ef3] text-[14px] text-nowrap top-[494px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[18px] whitespace-pre">Твои маленькие шаги — большие победы</p>
      </div>
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
    <div className="absolute left-[330px] size-6 top-[746px]" data-name="Arrow - Right">
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
    <div className="absolute contents left-[272px] top-[650px]" data-name="Next Button">
      <div className="absolute h-[191px] left-[272px] top-[650px] w-[129px]">
        <div className="absolute bottom-0 left-[7.57%] right-0 top-0">
          <img className="block max-w-none size-full" src={imgRectangle5904} />
        </div>
      </div>
      <ArrowRight1 />
    </div>
  );
}

function Circle() {
  return (
    <div className="absolute h-[434px] left-[-24px] top-10 w-[369px]" data-name="Circle">
      <img className="block max-w-none size-full" src={imgCircle} />
    </div>
  );
}

export default function Onboard2() {
  return (
    <div className="bg-white relative size-full" data-name="Onboard 2">
      <Sliedbar />
      <Text />
      <div className="absolute flex flex-col font-['Poppins:Regular',_sans-serif] inset-[92.49%_84.27%_5.79%_8%] justify-center leading-[0] not-italic text-[#002055] text-[14px] text-center text-nowrap">
        <p className="leading-[14px] whitespace-pre">Skip</p>
      </div>
      <NextButton />
      <div className="absolute bg-center bg-cover bg-no-repeat h-[379px] left-8 top-[58px] w-[314px]" data-name="image 1569" style={{ backgroundImage: `url('${imgImage1569}')` }} />
      <Circle />
    </div>
  );
}