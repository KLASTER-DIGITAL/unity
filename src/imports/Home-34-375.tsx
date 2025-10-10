import imgEllipse22 from "figma:asset/fcf7bda2bc5cf545d6d545c7042de6d122912d16.png";
import imgEllipse24 from "figma:asset/a1915e0b173ceec2fe20f3b00950a974f9e187c2.png";
import { imgCategory, imgEllipse172, imgFriday26, imgRectangle5636, imgEllipse23, imgTickSquare, imgEllipse17, imgMakeADribbleShotForHyperactive, imgRectangle5637, imgEllipse25, imgTickSquare1, imgEllipse18, imgMakeADribbleShotForHyperactive1, imgTickSquare2, imgEllipse19, imgEllipse2656 } from "./svg-ur5oi";

function Category() {
  return (
    <div className="absolute inset-[12.5%]" data-name="Category">
      <div className="absolute inset-[-5%]">
        <img className="block max-w-none size-full" src={imgCategory} />
      </div>
    </div>
  );
}

function Category1() {
  return (
    <div className="absolute inset-[6.64%_85.33%_89.08%_9.33%]" data-name="Category">
      <Category />
    </div>
  );
}

function Menu() {
  return (
    <div className="absolute contents left-6 top-5" data-name="Menu">
      <div className="absolute left-6 size-[42px] top-5">
        <img className="block max-w-none size-full" src={imgEllipse172} />
      </div>
      <Category1 />
    </div>
  );
}

function TopBar() {
  return (
    <div className="absolute contents left-6 top-5" data-name="Top Bar">
      <div className="absolute font-['Poppins:Medium',_sans-serif] leading-[0] left-[145px] not-italic text-[#002055] text-[18px] text-nowrap top-8">
        <p className="leading-[18px] whitespace-pre">Friday, 26</p>
      </div>
      <Menu />
    </div>
  );
}

function Timer() {
  return <img className="block max-w-none size-full" src={imgFriday26} />;
}

function VuesaxLinearTimer() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/timer">
      <Timer />
    </div>
  );
}

function Timer1() {
  return (
    <div className="relative shrink-0 size-[16.798px]" data-name="timer">
      <VuesaxLinearTimer />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[4.199px] items-center justify-start opacity-50 relative">
      <Timer1 />
      <div className="font-['Proxima_Nova:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[12.598px] text-nowrap text-white tracking-[-0.2856px]">
        <p className="leading-[0.94] whitespace-pre">16:00PM</p>
      </div>
    </div>
  );
}

function Group19() {
  return (
    <div className="absolute contents left-[51.78px] top-[157.79px]">
      <div className="absolute flex h-[46.637px] items-center justify-center left-[51.78px] top-[157.79px] w-[95.238px]">
        <div className="flex-none rotate-[2deg]">
          <div className="backdrop-blur-[8.049px] backdrop-filter bg-[rgba(255,255,255,0.4)] h-[43.394px] opacity-50 rounded-[25.426px] w-[93.788px]" />
        </div>
      </div>
      <div className="absolute flex h-[19.209px] items-center justify-center left-[66.23px] top-[171.57px] w-[69.95px]">
        <div className="flex-none rotate-[2deg]">
          <Frame12 />
        </div>
      </div>
    </div>
  );
}

function Edit2() {
  return <img className="block max-w-none size-full" src={imgRectangle5636} />;
}

function VuesaxLinearEdit2() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/edit-2">
      <Edit2 />
    </div>
  );
}

function Edit3() {
  return (
    <div className="opacity-50 relative size-[16.798px]" data-name="edit-2">
      <VuesaxLinearEdit2 />
    </div>
  );
}

function Group20() {
  return (
    <div className="absolute contents left-[248.34px] top-[364.95px]">
      <div className="absolute flex h-[44.879px] items-center justify-center left-[248.34px] top-[364.95px] w-[44.879px]">
        <div className="flex-none rotate-[2deg]">
          <div className="opacity-50 relative size-[43.394px]">
            <img className="block max-w-none size-full" height="43.394" src={imgEllipse22} width="43.394" />
          </div>
        </div>
      </div>
      <div className="absolute flex h-[17.373px] items-center justify-center left-[262.09px] top-[378.7px] w-[17.373px]">
        <div className="flex-none rotate-[2deg]">
          <Edit3 />
        </div>
      </div>
    </div>
  );
}

function ArrowRight() {
  return <img className="block max-w-none size-full" src={imgEllipse23} />;
}

function VuesaxLinearArrowRight() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
      <ArrowRight />
    </div>
  );
}

function ArrowRight1() {
  return (
    <div className="opacity-10 relative size-[11.198px]" data-name="arrow-right">
      <VuesaxLinearArrowRight />
    </div>
  );
}

function ArrowRight2() {
  return <img className="block max-w-none size-full" src={imgEllipse23} />;
}

function VuesaxLinearArrowRight1() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
      <ArrowRight2 />
    </div>
  );
}

function ArrowRight3() {
  return (
    <div className="opacity-25 relative size-[11.198px]" data-name="arrow-right">
      <VuesaxLinearArrowRight1 />
    </div>
  );
}

function ArrowRight4() {
  return <img className="block max-w-none size-full" src={imgEllipse23} />;
}

function VuesaxLinearArrowRight2() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
      <ArrowRight4 />
    </div>
  );
}

function ArrowRight5() {
  return (
    <div className="opacity-50 relative size-[11.198px]" data-name="arrow-right">
      <VuesaxLinearArrowRight2 />
    </div>
  );
}

function Group22() {
  return (
    <div className="absolute contents left-[201.99px] top-[380.8px]">
      <div className="absolute flex h-[11.571px] items-center justify-center left-[201.99px] top-[380.8px] w-[11.571px]">
        <div className="flex-none rotate-[2deg]">
          <ArrowRight1 />
        </div>
      </div>
      <div className="absolute flex h-[11.571px] items-center justify-center left-[209.68px] top-[381.07px] w-[11.571px]">
        <div className="flex-none rotate-[2deg]">
          <ArrowRight3 />
        </div>
      </div>
      <div className="absolute flex h-[11.571px] items-center justify-center left-[217.38px] top-[381.34px] w-[11.571px]">
        <div className="flex-none rotate-[2deg]">
          <ArrowRight5 />
        </div>
      </div>
    </div>
  );
}

function TickSquare() {
  return (
    <div className="opacity-50 relative size-full" data-name="tick-square">
      <img className="block max-w-none size-full" src={imgTickSquare} />
    </div>
  );
}

function VuesaxLinearTickSquare() {
  return (
    <div className="absolute contents inset-[79.57%_79.75%_16.71%_15.61%]" data-name="vuesax/linear/tick-square">
      <div className="absolute flex inset-[79.57%_79.75%_16.71%_15.61%] items-center justify-center">
        <div className="flex-none rotate-[2deg] size-[16.798px]">
          <TickSquare />
        </div>
      </div>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[49.13px] top-[362.19px]">
      <div className="absolute flex h-[36.184px] items-center justify-center left-[49.13px] top-[362.19px] w-[36.184px]">
        <div className="flex-none rotate-[2deg]">
          <div className="opacity-50 relative size-[34.995px]">
            <img className="block max-w-none size-full" src={imgEllipse17} />
          </div>
        </div>
      </div>
      <VuesaxLinearTickSquare />
    </div>
  );
}

function Group27() {
  return (
    <div className="absolute contents left-[44.79px] top-[357.84px]">
      <div className="absolute flex h-[50.081px] items-center justify-center left-[44.79px] top-[357.84px] w-[193.866px]">
        <div className="flex-none rotate-[2deg]">
          <div className="backdrop-blur-[8.049px] backdrop-filter bg-[rgba(255,255,255,0.4)] h-[43.394px] opacity-50 rounded-[25.426px] w-[192.475px]" />
        </div>
      </div>
      <Group22 />
      <Group6 />
      <div className="absolute flex h-[15.307px] items-center justify-center left-[95.01px] top-[374.97px] w-[99.806px]">
        <div className="flex-none rotate-[2deg]">
          <div className="font-['Proxima_Nova:Regular',_sans-serif] leading-[0] not-italic opacity-50 relative text-[12.598px] text-nowrap text-white tracking-[-0.2856px]">
            <p className="leading-[0.94] whitespace-pre">Drag to mark done</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group2085662588() {
  return (
    <div className="absolute contents left-[39px] top-[152px]">
      <div className="absolute flex h-[263.624px] items-center justify-center left-[39px] top-[152px] w-[266.999px]">
        <div className="flex-none rotate-[2deg]">
          <div className="backdrop-blur-[22.747px] backdrop-filter bg-[#ff7769] h-[254.766px] opacity-50 rounded-[25.426px] w-[258.266px]" />
        </div>
      </div>
      <Group19 />
      <div className="absolute flex h-[89.826px] items-center justify-center left-[58.38px] top-[249.12px] w-[202.943px]">
        <div className="flex-none rotate-[2deg]">
          <div className="font-['Proxima_Nova:Semibold',_sans-serif] leading-[0] not-italic opacity-50 relative text-[29.396px] text-white tracking-[-0.2856px] w-[200.174px]">
            <p className="leading-[0.94]">
              {`Make a `}
              <br aria-hidden="true" />
              {`dribble shot for `}
              <br aria-hidden="true" />
              Hyperactive
            </p>
          </div>
        </div>
      </div>
      <Group20 />
      <Group27 />
    </div>
  );
}

function Timer2() {
  return <img className="block max-w-none size-full" src={imgMakeADribbleShotForHyperactive} />;
}

function VuesaxLinearTimer1() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/timer">
      <Timer2 />
    </div>
  );
}

function Timer3() {
  return (
    <div className="relative shrink-0 size-[21.268px]" data-name="timer">
      <VuesaxLinearTimer1 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex gap-[5.317px] items-center justify-start opacity-90 relative">
      <Timer3 />
      <div className="font-['Proxima_Nova:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[15.951px] text-nowrap text-white tracking-[-0.3616px]">
        <p className="leading-[0.94] whitespace-pre">16:00PM</p>
      </div>
    </div>
  );
}

function Group21() {
  return (
    <div className="absolute contents left-[15.28px] top-[182.49px]">
      <div className="absolute flex h-[46.54px] items-center justify-center left-[15.28px] top-[182.49px] w-[120.143px]">
        <div className="flex-none rotate-[358deg]">
          <div className="backdrop-blur-[10.191px] backdrop-filter bg-[rgba(255,255,255,0.4)] h-[42.434px] opacity-90 rounded-[32.193px] w-[118.748px]" />
        </div>
      </div>
      <div className="absolute flex h-[24.32px] items-center justify-center left-[33.44px] top-[196.03px] w-[88.579px]">
        <div className="flex-none rotate-[358deg]">
          <Frame13 />
        </div>
      </div>
    </div>
  );
}

function Edit4() {
  return <img className="block max-w-none size-full" src={imgRectangle5637} />;
}

function VuesaxLinearEdit3() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/edit-2">
      <Edit4 />
    </div>
  );
}

function Edit5() {
  return (
    <div className="h-[16.426px] opacity-90 relative w-[21.268px]" data-name="edit-2">
      <VuesaxLinearEdit3 />
    </div>
  );
}

function Group23() {
  return (
    <div className="absolute contents left-[279.83px] top-[371.35px]">
      <div className="absolute flex h-[44.313px] items-center justify-center left-[279.83px] top-[371.35px] w-[56.385px]">
        <div className="flex-none rotate-[358deg]">
          <div className="h-[42.434px] opacity-90 relative w-[54.943px]">
            <img className="block max-w-none size-full" height="42.434" src={imgEllipse24} width="54.943" />
          </div>
        </div>
      </div>
      <div className="absolute flex h-[17.154px] items-center justify-center left-[297.11px] top-[384.93px] w-[21.826px]">
        <div className="flex-none rotate-[358deg]">
          <Edit5 />
        </div>
      </div>
    </div>
  );
}

function ArrowRight6() {
  return <img className="block max-w-none size-full" src={imgEllipse25} />;
}

function VuesaxLinearArrowRight3() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
      <ArrowRight6 />
    </div>
  );
}

function ArrowRight7() {
  return (
    <div className="h-[10.951px] opacity-[0.18] relative w-[14.179px]" data-name="arrow-right">
      <VuesaxLinearArrowRight3 />
    </div>
  );
}

function ArrowRight8() {
  return <img className="block max-w-none size-full" src={imgEllipse25} />;
}

function VuesaxLinearArrowRight4() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
      <ArrowRight8 />
    </div>
  );
}

function ArrowRight9() {
  return (
    <div className="h-[10.951px] opacity-[0.45] relative w-[14.179px]" data-name="arrow-right">
      <VuesaxLinearArrowRight4 />
    </div>
  );
}

function ArrowRight10() {
  return <img className="block max-w-none size-full" src={imgEllipse25} />;
}

function VuesaxLinearArrowRight5() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
      <ArrowRight10 />
    </div>
  );
}

function ArrowRight11() {
  return (
    <div className="h-[10.951px] opacity-90 relative w-[14.179px]" data-name="arrow-right">
      <VuesaxLinearArrowRight5 />
    </div>
  );
}

function Group24() {
  return (
    <div className="absolute contents left-[221.09px] top-[391.26px]">
      <div className="absolute flex h-[11.425px] items-center justify-center left-[221.09px] top-[391.94px] w-[14.545px]">
        <div className="flex-none rotate-[358deg]">
          <ArrowRight7 />
        </div>
      </div>
      <div className="absolute flex h-[11.425px] items-center justify-center left-[230.83px] top-[391.6px] w-[14.545px]">
        <div className="flex-none rotate-[358deg]">
          <ArrowRight9 />
        </div>
      </div>
      <div className="absolute flex h-[11.425px] items-center justify-center left-[240.57px] top-[391.26px] w-[14.545px]">
        <div className="flex-none rotate-[358deg]">
          <ArrowRight11 />
        </div>
      </div>
    </div>
  );
}

function TickSquare1() {
  return (
    <div className="opacity-90 relative size-full" data-name="tick-square">
      <img className="block max-w-none size-full" src={imgTickSquare1} />
    </div>
  );
}

function VuesaxLinearTickSquare1() {
  return (
    <div className="absolute contents inset-[84.35%_83.67%_11.97%_10.5%]" data-name="vuesax/linear/tick-square">
      <div className="absolute flex inset-[84.35%_83.67%_11.97%_10.5%] items-center justify-center">
        <div className="flex-none h-[16.426px] rotate-[358deg] w-[21.268px]">
          <TickSquare1 />
        </div>
      </div>
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents left-[27.57px] top-[384.63px]">
      <div className="absolute flex h-[35.744px] items-center justify-center left-[27.57px] top-[384.63px] w-[45.464px]">
        <div className="flex-none rotate-[358deg]">
          <div className="h-[34.221px] opacity-90 relative w-[44.309px]">
            <img className="block max-w-none size-full" src={imgEllipse18} />
          </div>
        </div>
      </div>
      <VuesaxLinearTickSquare1 />
    </div>
  );
}

function Group28() {
  return (
    <div className="absolute contents left-[22.11px] top-[373.76px]">
      <div className="absolute flex h-[50.901px] items-center justify-center left-[22.11px] top-[373.76px] w-[245.02px]">
        <div className="flex-none rotate-[358deg]">
          <div className="backdrop-blur-[10.191px] backdrop-filter bg-[rgba(255,255,255,0.4)] h-[42.434px] opacity-90 rounded-[32.193px] w-[243.699px]" />
        </div>
      </div>
      <Group24 />
      <Group7 />
      <div className="absolute flex h-[15.968px] items-center justify-center left-[85.51px] top-[390.72px] w-[126.327px]">
        <div className="flex-none rotate-[358deg]">
          <div className="font-['Proxima_Nova:Regular',_sans-serif] h-[11.585px] leading-[0] not-italic opacity-90 relative text-[15.951px] text-white tracking-[-0.3616px] w-[126px]">
            <p className="leading-[0.94]">Drag to mark done</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group2085662589() {
  return (
    <div className="absolute contents left-2 top-[170px]">
      <div className="absolute flex h-[260.385px] items-center justify-center left-2 top-[170px] w-[335.495px]">
        <div className="flex-none rotate-[358deg]">
          <div className="backdrop-blur-[28.801px] backdrop-filter bg-[#ff8969] h-[249.13px] opacity-90 rounded-[32.193px] w-[327px]" />
        </div>
      </div>
      <Group21 />
      <div className="absolute flex h-[89.889px] items-center justify-center left-[32.55px] top-[266.22px] w-[256.113px]">
        <div className="flex-none rotate-[358deg]">
          <div className="font-['Proxima_Nova:Semibold',_sans-serif] h-[81.095px] leading-[0] not-italic opacity-90 relative text-[37.22px] text-white tracking-[-0.3616px] w-[253.447px]">
            <p className="leading-[0.94]">
              {`Make a `}
              <br aria-hidden="true" />
              {`dribble shot for `}
              <br aria-hidden="true" />
              Hyperactive
            </p>
          </div>
        </div>
      </div>
      <Group23 />
      <Group28 />
    </div>
  );
}

function ArrowRight12() {
  return <img className="block max-w-none size-full" src={imgMakeADribbleShotForHyperactive1} />;
}

function VuesaxLinearArrowRight6() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
      <ArrowRight12 />
    </div>
  );
}

function ArrowRight13() {
  return (
    <div className="absolute h-4 left-[301.54px] opacity-20 top-[390px] w-[20.538px]" data-name="arrow-right">
      <VuesaxLinearArrowRight6 />
    </div>
  );
}

function ArrowRight14() {
  return <img className="block max-w-none size-full" src={imgMakeADribbleShotForHyperactive1} />;
}

function VuesaxLinearArrowRight7() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
      <ArrowRight14 />
    </div>
  );
}

function ArrowRight15() {
  return (
    <div className="absolute h-4 left-[315.65px] opacity-50 top-[390px] w-[20.538px]" data-name="arrow-right">
      <VuesaxLinearArrowRight7 />
    </div>
  );
}

function ArrowRight16() {
  return <img className="block max-w-none size-full" src={imgMakeADribbleShotForHyperactive1} />;
}

function VuesaxLinearArrowRight8() {
  return (
    <div className="absolute contents inset-0" data-name="vuesax/linear/arrow-right">
      <ArrowRight16 />
    </div>
  );
}

function ArrowRight17() {
  return (
    <div className="absolute h-4 left-[329.77px] top-[390px] w-[20.538px]" data-name="arrow-right">
      <VuesaxLinearArrowRight8 />
    </div>
  );
}

function Group25() {
  return (
    <div className="absolute contents left-[301.54px] top-[390px]">
      <ArrowRight13 />
      <ArrowRight15 />
      <ArrowRight17 />
    </div>
  );
}

function TickSquare2() {
  return (
    <div className="absolute inset-[82.23%_83.89%_12.63%_9.41%]" data-name="tick-square">
      <img className="block max-w-none size-full" src={imgTickSquare2} />
    </div>
  );
}

function VuesaxLinearTickSquare2() {
  return (
    <div className="absolute contents inset-[82.23%_83.89%_12.63%_9.41%]" data-name="vuesax/linear/tick-square">
      <TickSquare2 />
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents left-[21.7px] top-[371px]">
      <div className="absolute h-[50px] left-[21.7px] top-[371px] w-[52.298px]">
        <img className="block max-w-none size-full" src={imgEllipse19} />
      </div>
      <VuesaxLinearTickSquare2 />
    </div>
  );
}

function Group29() {
  return (
    <div className="absolute contents left-3.5 top-[365px]">
      <div className="absolute backdrop-blur-[11.5px] backdrop-filter bg-[rgba(255,255,255,0.25)] h-[62px] left-3.5 rounded-[36.328px] top-[365px] w-[353px]" />
      <Group25 />
      <Group8 />
      <div className="absolute font-['Open_Sans:Regular',_sans-serif] leading-[0] left-[105.14px] not-italic text-[18px] text-white top-[387px] tracking-[-0.408px] w-[182.276px]">
        <p className="leading-[0.94]">Drag to mark read</p>
      </div>
    </div>
  );
}

function Group2085662590() {
  return (
    <div className="absolute contents left-[3px] top-[195px]">
      <div className="absolute backdrop-blur-[32.5px] backdrop-filter h-[252px] left-[3px] rounded-[36.328px] top-[195px] w-[369px]" />
      <div className="absolute font-['Open_Sans:Semibold',_sans-serif] leading-[0] left-[29px] not-italic text-[20px] text-white top-[239px] tracking-[-0.408px] w-[286px]">
        <p className="leading-none">Завершил сложную задачу на работе</p>
      </div>
      <div className="absolute font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] leading-[0] left-[30px] text-[14px] text-white top-[293px] w-[286px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[18px]">Поиграли с детьми, обсудили планы. Поймал момент присутствия — без</p>
      </div>
      <Group29 />
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-white relative size-full" data-name="Home">
      <div className="absolute font-['Poppins:SemiBold',_'Noto_Sans:Bold',_sans-serif] leading-[0] left-[25px] text-[#002055] text-[25px] top-[71px] w-[236px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="leading-[36px] whitespace-pre-wrap">{`Твои победы, Анна!  🙌`}</p>
      </div>
      <TopBar />
      <Group2085662588 />
      <Group2085662589 />
      <Group2085662590 />
      <div className="absolute left-[261px] size-[98px] top-7">
        <img className="block max-w-none size-full" src={imgEllipse2656} />
      </div>
      <div className="absolute font-['Poppins:Medium',_'Noto_Sans:Regular',_sans-serif] leading-[0] left-[297px] text-[10px] text-black text-nowrap top-24" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[8px] whitespace-pre">День</p>
      </div>
      <div className="absolute font-['Poppins:Medium',_sans-serif] h-[26px] leading-[0] left-[303px] not-italic text-[#b1d199] text-[32px] top-16 w-[27px]">
        <p className="leading-[8px]">1</p>
      </div>
      <div className="absolute font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] h-4 leading-[0] left-[30px] text-[12px] text-white top-[214px] w-[104px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[12px]">12 Августа 2025</p>
      </div>
    </div>
  );
}