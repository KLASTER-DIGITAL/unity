import { imgMicrophone, imgImage, imgPaperPlaneRight } from "./svg-w5pu5";

function Microphone() {
  return (
    <div className="relative shrink-0 size-4" data-name="Microphone">
      <img className="block max-w-none size-full" src={imgMicrophone} />
    </div>
  );
}

function Icon() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Microphone />
    </div>
  );
}

function Button() {
  return (
    <div className="box-border content-stretch flex gap-4 items-center justify-center min-h-7 min-w-7 p-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Icon />
    </div>
  );
}

function Image() {
  return (
    <div className="relative shrink-0 size-4" data-name="Image">
      <img className="block max-w-none size-full" src={imgImage} />
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <Image />
    </div>
  );
}

function Button1() {
  return (
    <div className="box-border content-stretch flex gap-1 items-center justify-center min-h-7 min-w-7 p-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Icon1 />
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Text">
      <div className="flex flex-col justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-center px-2 py-0 relative w-full">
          <div className="css-c770up font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.2)] w-full">
            <p className="leading-[20px]">Type text</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaperPlaneRight() {
  return (
    <div className="relative shrink-0 size-4" data-name="PaperPlaneRight">
      <img className="block max-w-none size-full" src={imgPaperPlaneRight} />
    </div>
  );
}

function Icon2() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <PaperPlaneRight />
    </div>
  );
}

function Button2() {
  return (
    <div className="box-border content-stretch flex gap-1 items-center justify-center min-h-7 min-w-7 p-[4px] relative rounded-[16px] shrink-0" data-name="Button">
      <Icon2 />
    </div>
  );
}

function Group() {
  return (
    <div className="content-center flex flex-wrap gap-2 h-7 items-center justify-start min-h-6 relative rounded-[12px] shrink-0 w-full" data-name="Group">
      <Button />
      <Button1 />
      <Text />
      <Button2 />
    </div>
  );
}

export default function Input() {
  return (
    <div className="bg-[rgba(255,255,255,0.8)] relative rounded-[16px] size-full" data-name="Input">
      <div className="flex flex-col justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-1 items-start justify-center overflow-clip px-5 py-4 relative size-full">
          <Group />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}