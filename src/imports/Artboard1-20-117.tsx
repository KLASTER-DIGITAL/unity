import imgGeneratedImageSeptember092025333Pm1 from "figma:asset/bd383d77e5f7766d755b15559de65d5ccfa62e27.png";
import { imgVector, imgVector1, imgLayer1, imgEllipse22, imgEllipse13, imgEllipse14, imgEllipse15, imgEllipse20, imgEllipse21, imgEllipse12, imgEllipse11, imgEllipse23, imgEllipse27, imgEllipse36, imgEllipse32, imgEllipse33, imgEllipse34, imgEllipse29, imgEllipse30, imgEllipse24, imgEllipse25, imgEllipse35 } from "./svg-lqmvp";

interface ExpantArrow1Props {
  property1?: "expand_more_FILL0_wght200_GRAD0_opsz20" | "Variant2";
}

function ExpantArrow1({ property1 = "expand_more_FILL0_wght200_GRAD0_opsz20" }: ExpantArrow1Props) {
  if (property1 === "Variant2") {
    return (
      <div className="relative size-full" data-name="Property 1=Variant2">
        <div className="absolute inset-[37.97%_27.89%_37.49%_27.89%]" data-name="Vector">
          <img className="block max-w-none size-full" src={imgVector} />
        </div>
      </div>
    );
  }
  return (
    <div className="relative size-full" data-name="Property 1=expand_more_FILL0_wght200_GRAD0_opsz20">
      <div className="absolute inset-[37.97%_27.89%_37.49%_27.89%]" data-name="Vector">
        <img className="block max-w-none size-full" src={imgVector1} />
      </div>
    </div>
  );
}

function CollapsedArrow() {
  return (
    <div className="relative size-full" data-name="Collapsed-Arrow">
      <div className="absolute inset-0 overflow-clip" data-name="Expant-Arrow">
        <ExpantArrow1 />
      </div>
    </div>
  );
}

function ExpantArrow() {
  return (
    <div className="relative size-full" data-name="Expant-Arrow">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[270deg] size-5">
          <div className="relative size-full" data-name="Collapsed-Arrow">
            <CollapsedArrow />
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageDropdownVariant3() {
  return (
    <div className="bg-white relative rounded-[10px] size-full" data-name="Language / Dropdown/Variant3">
      <div className="flex flex-row items-center min-w-inherit relative size-full">
        <div className="box-border content-stretch flex items-center justify-between min-w-inherit pl-[22px] pr-[13px] py-0 relative size-full">
          <div className="content-stretch flex gap-2.5 items-center justify-center relative shrink-0" data-name="Text">
            <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#6b6b6b] text-[12px] text-nowrap">
              <p className="leading-[normal] whitespace-pre">Select Language</p>
            </div>
          </div>
          <div className="content-stretch flex gap-2.5 items-center justify-center relative shrink-0" data-name="Arrow">
            <div className="relative shrink-0 size-5" data-name="Expant-Arrow">
              <ExpantArrow />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Body() {
  return (
    <div className="absolute contents left-10 top-[606px]" data-name="Body">
      <div className="absolute font-['Open_Sans:Bold',_sans-serif] leading-[0] left-[187.5px] not-italic opacity-60 text-[#8d8d8d] text-[14px] text-center top-[606px] translate-x-[-50%] w-[295px]">
        <p className="leading-[24px]">История ваших побед — день за днём</p>
      </div>
    </div>
  );
}

function Title() {
  return (
    <div className="absolute contents left-10 top-[506px]" data-name="Title">
      <Body />
      <div className="absolute font-['Open_Sans:Bold',_sans-serif] leading-[0] left-[187.5px] not-italic text-[#2f394b] text-[37px] text-center top-[506px] tracking-[-0.8px] translate-x-[-50%] w-[295px]">
        <p className="leading-[45px]">Создавай дневник побед</p>
      </div>
    </div>
  );
}

function ButtonContainer() {
  return (
    <div className="absolute contents left-10 top-[696px]" data-name="Button Container">
      <div className="absolute inset-[85.71%_10.67%_6.9%_10.67%] rounded-[15px]" data-name="Base" />
      <div className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic text-[20px] text-center text-nowrap text-white translate-x-[-50%]" style={{ top: "calc(50% + 308px)", left: "calc(50% - 0.5px)" }}>
        <p className="leading-[normal] whitespace-pre">Начать</p>
      </div>
    </div>
  );
}

function ProgressBar() {
  return (
    <div className="absolute contents left-[165px] top-[388px]" data-name="Progress Bar">
      <div className="absolute h-[5px] left-[165px] rounded-[13px] top-[388px] w-[25px]" data-name="Progress Indicator" />
      <div className="absolute left-[195px] opacity-40 rounded-[13px] size-[5px] top-[388px]" data-name="Progress Indicator" />
      <div className="absolute left-[205px] opacity-40 rounded-[13px] size-[5px] top-[388px]" data-name="Progress Indicator" />
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute contents left-[100px] top-[442px]" data-name="Logo">
      <div className="absolute font-['Poller_One:Regular',_sans-serif] leading-[0] left-[186px] not-italic text-[#756ef3] text-[46px] text-center text-nowrap top-[442px] translate-x-[-50%]">
        <p className="leading-[48px] whitespace-pre">UNITY</p>
      </div>
    </div>
  );
}

function Arrow() {
  return <div className="absolute left-[239px] size-5 top-[657px]" data-name="Arrow" />;
}

function Layer1() {
  return (
    <div className="absolute inset-[2.09%_73.87%_92.61%_12.8%]" data-name="Layer 1">
      <img className="block max-w-none size-full" src={imgLayer1} />
    </div>
  );
}

function Layer2() {
  return (
    <div className="absolute contents inset-[2.09%_73.87%_92.61%_12.8%]" data-name="Layer 2">
      <Layer1 />
    </div>
  );
}

export default function Artboard1() {
  return (
    <div className="bg-white relative size-full" data-name="Artboard 1">
      <div className="absolute left-[99px] size-[97px] top-[291px]">
        <div className="absolute inset-[-27.835%]">
          <img className="block max-w-none size-full" src={imgEllipse22} />
        </div>
      </div>
      <div className="absolute left-[94px] size-[340px] top-[265px]">
        <div className="absolute inset-[-18.235%]">
          <img className="block max-w-none size-full" src={imgEllipse13} />
        </div>
      </div>
      <div className="absolute left-[-144px] size-[340px] top-[272px]">
        <div className="absolute inset-[-18.235%]">
          <img className="block max-w-none size-full" src={imgEllipse14} />
        </div>
      </div>
      <div className="absolute bg-gradient-to-b from-[#ffffff] h-[433px] left-0 rounded-[30px] to-[#f8f6ff] top-[379px] w-[375px]" data-name="Background Shape" />
      <Title />
      <div className="absolute blur-[18.5px] filter inset-[86.7%_17.33%_5.91%_17.33%] opacity-70 rounded-[53px]" data-name="Base" />
      <ButtonContainer />
      <ProgressBar />
      <div className="absolute left-2.5 size-[46px] top-[326px]">
        <div className="absolute inset-[-58.696%]">
          <img className="block max-w-none size-full" src={imgEllipse15} />
        </div>
      </div>
      <div className="absolute left-[62px] size-[46px] top-[328px]">
        <div className="absolute inset-[-58.696%]">
          <img className="block max-w-none size-full" src={imgEllipse15} />
        </div>
      </div>
      <div className="absolute left-[120px] size-[46px] top-[322px]">
        <div className="absolute inset-[-58.696%]">
          <img className="block max-w-none size-full" src={imgEllipse15} />
        </div>
      </div>
      <div className="absolute left-[178px] size-[46px] top-[318px]">
        <div className="absolute inset-[-58.696%]">
          <img className="block max-w-none size-full" src={imgEllipse15} />
        </div>
      </div>
      <div className="absolute left-[227px] size-[46px] top-[326px]">
        <div className="absolute inset-[-58.696%]">
          <img className="block max-w-none size-full" src={imgEllipse15} />
        </div>
      </div>
      <div className="absolute left-[293px] size-[46px] top-[326px]">
        <div className="absolute inset-[-58.696%]">
          <img className="block max-w-none size-full" src={imgEllipse20} />
        </div>
      </div>
      <div className="absolute left-[332px] size-[46px] top-[322px]">
        <div className="absolute inset-[-58.696%]">
          <img className="block max-w-none size-full" src={imgEllipse15} />
        </div>
      </div>
      <div className="absolute left-[345px] size-[46px] top-[328px]">
        <div className="absolute inset-[-58.696%]">
          <img className="block max-w-none size-full" src={imgEllipse21} />
        </div>
      </div>
      <div className="absolute left-[-150px] size-[282px] top-[-87px]">
        <div className="absolute inset-[-10.284%]">
          <img className="block max-w-none size-full" src={imgEllipse12} />
        </div>
      </div>
      <div className="absolute left-[94px] size-[340px] top-[-145px]">
        <div className="absolute inset-[-8.529%]">
          <img className="block max-w-none size-full" src={imgEllipse11} />
        </div>
      </div>
      <div className="absolute left-[201px] size-[46px] top-[35px]">
        <div className="absolute inset-[-43.478%]">
          <img className="block max-w-none size-full" src={imgEllipse23} />
        </div>
      </div>
      <div className="absolute left-[150px] size-[46px] top-[31px]">
        <div className="absolute inset-[-43.478%]">
          <img className="block max-w-none size-full" src={imgEllipse23} />
        </div>
      </div>
      <div className="absolute left-[98px] size-28 top-[-29px]">
        <div className="absolute inset-[-31.25%]">
          <img className="block max-w-none size-full" src={imgEllipse27} />
        </div>
      </div>
      <div className="absolute left-[81px] size-28 top-[-27px]">
        <div className="absolute inset-[-107.143%]">
          <img className="block max-w-none size-full" src={imgEllipse36} />
        </div>
      </div>
      <div className="absolute left-[215px] size-[78px] top-[25px]">
        <div className="absolute inset-[-153.846%]">
          <img className="block max-w-none size-full" src={imgEllipse32} />
        </div>
      </div>
      <div className="absolute left-[169px] size-[78px] top-[18px]">
        <div className="absolute inset-[-175.641%]">
          <img className="block max-w-none size-full" src={imgEllipse33} />
        </div>
      </div>
      <div className="absolute left-[290px] size-[78px] top-[19px]">
        <div className="absolute inset-[-25.641%]">
          <img className="block max-w-none size-full" src={imgEllipse34} />
        </div>
      </div>
      <div className="absolute left-[-63px] size-[183px] top-[-55px]">
        <div className="absolute inset-[-15.847%]">
          <img className="block max-w-none size-full" src={imgEllipse29} />
        </div>
      </div>
      <div className="absolute left-[-23px] size-[46px] top-[31px]">
        <div className="absolute inset-[-63.044%]">
          <img className="block max-w-none size-full" src={imgEllipse30} />
        </div>
      </div>
      <div className="absolute left-[267px] size-[46px] top-[35px]">
        <div className="absolute inset-[-43.478%]">
          <img className="block max-w-none size-full" src={imgEllipse24} />
        </div>
      </div>
      <div className="absolute left-[319px] size-[46px] top-[37px]">
        <div className="absolute inset-[-63.044%]">
          <img className="block max-w-none size-full" src={imgEllipse25} />
        </div>
      </div>
      <div className="absolute left-[74px] size-28 top-[-29px]">
        <div className="absolute inset-[-125%]">
          <img className="block max-w-none size-full" src={imgEllipse35} />
        </div>
      </div>
      <Logo />
      <Arrow />
      <Layer2 />
      <div className="absolute bg-center bg-cover bg-no-repeat h-[379px] left-0 top-0 w-[375px]" data-name="Generated Image September 09, 2025 - 3_33PM 1" style={{ backgroundImage: `url('${imgGeneratedImageSeptember092025333Pm1}')` }} />
      <div className="absolute bg-white box-border content-stretch flex h-14 items-center justify-between min-w-[170px] pl-[22px] pr-[13px] py-0 rounded-[10px] top-[285px] translate-x-[-50%] w-[230px]" data-name="Language / Dropdown/Variant3" style={{ left: "calc(50% - 0.5px)" }}>
        <LanguageDropdownVariant3 />
      </div>
    </div>
  );
}