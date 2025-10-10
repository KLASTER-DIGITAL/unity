import svgPaths from "./svg-wgvq4zqu0u";

function Category() {
  return (
    <div className="absolute inset-[12.5%]" data-name="Category">
      <div className="absolute inset-[-5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
          <g id="Category">
            <path clipRule="evenodd" d={svgPaths.p30955100} fillRule="evenodd" id="Stroke 1" stroke="var(--stroke-0, #002055)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path clipRule="evenodd" d={svgPaths.p2ab2d180} fillRule="evenodd" id="Stroke 3" stroke="var(--stroke-0, #002055)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path clipRule="evenodd" d={svgPaths.p2d147e00} fillRule="evenodd" id="Stroke 5" stroke="var(--stroke-0, #002055)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path clipRule="evenodd" d={svgPaths.p3a3f5900} fillRule="evenodd" id="Stroke 7" stroke="var(--stroke-0, #002055)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Category1() {
  return (
    <div className="absolute inset-[17.42%_85.33%_71.35%_9.33%]" data-name="Category">
      <Category />
    </div>
  );
}

function Menu() {
  return (
    <div className="absolute contents left-[24px] top-[20px]" data-name="Menu">
      <div className="absolute left-[24px] size-[42px] top-[20px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
          <circle cx="21" cy="21" fill="var(--fill-0, white)" id="Ellipse 172" r="20.5" stroke="var(--stroke-0, #E9F1FF)" />
        </svg>
      </div>
      <Category1 />
    </div>
  );
}

function TopBar() {
  return (
    <div className="absolute contents left-[24px] top-[20px]" data-name="Top Bar">
      <p className="absolute font-['Poppins:Medium',_sans-serif] leading-[18px] left-[145px] not-italic text-[#002055] text-[18px] text-nowrap top-[32px] whitespace-pre">Friday, 26</p>
      <Menu />
    </div>
  );
}

export default function Top() {
  return (
    <div className="bg-white relative size-full" data-name="top">
      <TopBar />
      <div className="absolute left-[261px] size-[98px] top-[28px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 98 98">
          <circle cx="49" cy="49" id="Ellipse 2656" r="48.5" stroke="var(--stroke-0, #AFAFAF)" />
        </svg>
      </div>
      <p className="absolute font-['Poppins:Medium',_'Noto_Sans:Medium',_sans-serif] leading-[8px] left-[297px] text-[10px] text-black text-nowrap top-[96px] whitespace-pre" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 500" }}>
        День
      </p>
      <p className="absolute font-['Poppins:Medium',_sans-serif] h-[26px] leading-[8px] left-[303px] not-italic text-[#b1d199] text-[32px] top-[64px] w-[27px]">1</p>
      <p className="absolute font-['Poppins:Regular',_'Noto_Sans:Regular',_sans-serif] h-[16px] leading-[12px] left-[30px] text-[12px] text-white top-[214px] w-[104px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        12 Августа 2025
      </p>
      <p className="absolute css-yw3n1i font-['Open_Sans:Semibold',_sans-serif] leading-[0.94] left-[30px] not-italic text-[#202224] text-[0px] text-[24px] top-[79px] tracking-[-0.408px] w-[230px]">
        🙌 <span>{`Привет Анна, `}</span>
        <span className="text-[#797981]">
          {`Какие твои `}
          <br aria-hidden="true" />
          победы сегодня?
        </span>
      </p>
    </div>
  );
}