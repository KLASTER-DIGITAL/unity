import svgPaths from "./svg-7dtbhv9t1o";

function Category() {
  return (
    <div className="absolute inset-[12.5%]" data-name="Category">
      <div className="absolute inset-[-7.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <g id="Category">
            <path clipRule="evenodd" d={svgPaths.p376c7e00} fillRule="evenodd" id="Stroke 1" stroke="var(--stroke-0, #002055)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path clipRule="evenodd" d={svgPaths.p2c8dec00} fillRule="evenodd" id="Stroke 3" stroke="var(--stroke-0, #002055)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path clipRule="evenodd" d={svgPaths.p24b32890} fillRule="evenodd" id="Stroke 5" stroke="var(--stroke-0, #002055)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path clipRule="evenodd" d={svgPaths.pbdbe400} fillRule="evenodd" id="Stroke 7" stroke="var(--stroke-0, #002055)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Category1() {
  return (
    <div className="absolute inset-[90.25%_95.1%_3.46%_1.74%]" data-name="Category">
      <Category />
    </div>
  );
}

function Menu() {
  return (
    <div className="absolute bottom-0 contents left-0 right-[93.36%] top-[86.79%]" data-name="Menu">
      <div className="absolute bottom-0 left-0 right-[93.36%] top-[86.79%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
          <circle cx="14" cy="14" fill="var(--fill-0, white)" id="Ellipse 172" r="13.5" stroke="var(--stroke-0, #E9F1FF)" />
        </svg>
      </div>
      <Category1 />
    </div>
  );
}

function Microphone() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Microphone">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Microphone">
          <path d={svgPaths.p1f30f700} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
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

function Voice() {
  return (
    <div className="absolute box-border content-stretch flex gap-[16px] items-center justify-center left-[4px] min-h-[28px] min-w-[28px] p-[4px] rounded-[16px] top-[40px]" data-name="voice">
      <Icon />
    </div>
  );
}

function TextArea() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Text area">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-center px-[8px] py-0 relative w-full">
          <p className="css-c770up font-['Inter:Regular',_sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.2)] w-full">Опиши главную мысль, момент, благодарность</p>
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute content-center flex flex-wrap gap-[8px] h-[52px] items-center left-[37px] min-h-[24px] rounded-[12px] top-[28px] w-[279px]" data-name="Group">
      <TextArea />
    </div>
  );
}

function PaperPlaneRight() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="PaperPlaneRight">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="PaperPlaneRight">
          <path d={svgPaths.p3328ef00} fill="var(--fill-0, black)" fillOpacity="0.4" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[8px] shrink-0" data-name="Icon">
      <PaperPlaneRight />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute box-border content-stretch flex gap-[4px] items-center justify-center left-[312px] min-h-[28px] min-w-[28px] p-[4px] rounded-[16px] top-[40px]" data-name="Button">
      <Icon1 />
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.8)] bottom-[17.93%] left-0 right-[16.35%] rounded-[16px] top-[31.13%]" data-name="Input">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Voice />
        <Group />
        <Button />
      </div>
      <div aria-hidden="true" className="absolute border-[0.5px] border-[rgba(0,0,0,0.2)] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

export default function Chat() {
  return (
    <div className="relative size-full" data-name="chat">
      <Menu />
      <div className="absolute bottom-[66.04%] font-['Poppins:SemiBold',_'Noto_Sans:SemiBold',_sans-serif] leading-[26px] left-[4.74%] right-[23.46%] text-[20px] text-black text-center top-0" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 600" }}>
        <p className="mb-0">Что сегодня получилось лучше всего?</p>
        <p>&nbsp;</p>
      </div>
      <Input />
      <div className="absolute inset-[91.51%_86.05%_4%_11.37%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 10">
          <path d={svgPaths.p3f4d2c00} fill="var(--fill-0, #92BFFF)" id="Vector" />
        </svg>
      </div>
      <div className="absolute bg-[rgba(217,217,217,0)] inset-[88.21%_72.28%_1.42%_9.48%] rounded-[10px]">
        <div aria-hidden="true" className="absolute border-[#9d9d9d] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <p className="absolute font-['SF_Pro:Light',_sans-serif] font-[274.315] inset-[89.62%_75.83%_2.83%_15.4%] leading-[16px] text-[12px] text-black text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Семья
      </p>
      <div className="absolute inset-[91.51%_66.14%_4%_31.28%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 10">
          <path d={svgPaths.p3f4d2c00} fill="var(--fill-0, #92BFFF)" id="Vector" />
        </svg>
      </div>
      <div className="absolute bg-[rgba(217,217,217,0)] inset-[88.21%_52.37%_1.42%_29.38%] rounded-[10px]">
        <div aria-hidden="true" className="absolute border-[#9d9d9d] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <p className="absolute font-['SF_Pro:Light',_sans-serif] font-[274.315] inset-[89.62%_54.98%_2.83%_35.31%] leading-[16px] text-[12px] text-black text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Работа
      </p>
      <div className="absolute inset-[91.51%_46.24%_4%_51.19%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 10">
          <path d={svgPaths.p3f4d2c00} fill="var(--fill-0, #92BFFF)" id="Vector" />
        </svg>
      </div>
      <div className="absolute bg-[rgba(217,217,217,0)] inset-[88.21%_29.15%_1.42%_49.29%] rounded-[10px]">
        <div aria-hidden="true" className="absolute border-[#9d9d9d] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <p className="absolute font-['SF_Pro:Light',_sans-serif] font-[274.315] inset-[89.62%_32.23%_2.83%_55.21%] leading-[16px] text-[12px] text-black text-nowrap whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        финансы
      </p>
      <div className="absolute inset-[91.51%_22.54%_4%_74.88%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 10">
          <path d={svgPaths.p3f4d2c00} fill="var(--fill-0, #92BFFF)" id="Vector" />
        </svg>
      </div>
      <div className="absolute bg-[rgba(217,217,217,0)] inset-[88.21%_9.72%_1.42%_72.99%] rounded-[10px]">
        <div aria-hidden="true" className="absolute border-[#9d9d9d] border-[0.3px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <p className="absolute bottom-[2.83%] font-['SF_Pro:Light',_sans-serif] font-[274.315] leading-[16px] left-[78.91%] right-0 text-[12px] text-black text-nowrap top-[89.62%] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>
        Благодарность
      </p>
    </div>
  );
}