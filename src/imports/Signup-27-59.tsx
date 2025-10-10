import { imgArrowLeft2, imgEllipse172, imgEllipse, imgApple, imgGroup659 } from "./svg-wsubx";

function ArrowLeft2() {
  return (
    <div className="relative size-full" data-name="Arrow - Left 2">
      <div className="absolute inset-[-12.86%_-6.43%]">
        <img className="block max-w-none size-full" src={imgArrowLeft2} />
      </div>
    </div>
  );
}

function BackArrow() {
  return (
    <div className="absolute left-[25px] size-5 top-[163px]" data-name="Back arrow">
      <div className="absolute flex inset-[20.83%_35.42%] items-center justify-center">
        <div className="flex-none h-[5.833px] rotate-[90deg] w-[11.667px]">
          <ArrowLeft2 />
        </div>
      </div>
    </div>
  );
}

function Back() {
  return (
    <div className="absolute contents left-3.5 top-[152px]" data-name="Back">
      <div className="absolute left-3.5 size-[42px] top-[152px]">
        <img className="block max-w-none size-full" src={imgEllipse172} />
      </div>
      <BackArrow />
    </div>
  );
}

function TopBar() {
  return (
    <div className="absolute contents left-3.5 top-[152px]" data-name="Top Bar">
      <div className="absolute font-['Poppins:Medium',_sans-serif] leading-[0] left-[178.5px] not-italic text-[#002055] text-[18px] text-center text-nowrap top-[164px] translate-x-[-50%]">
        <p className="leading-[18px] whitespace-pre">Sign Up</p>
      </div>
      <Back />
    </div>
  );
}

function Ellipse() {
  return (
    <div className="absolute h-[49px] left-[287px] top-[88px] w-16" data-name="Ellipse">
      <img className="block max-w-none size-full" src={imgEllipse} />
    </div>
  );
}

function Group700() {
  return (
    <div className="absolute contents left-6 top-[267px]">
      <div className="absolute bg-white h-[60px] left-6 rounded-[16px] top-[267px] w-[327px]">
        <div aria-hidden="true" className="absolute border border-[#756ef3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      </div>
    </div>
  );
}

function Group699() {
  return (
    <div className="absolute contents left-6 top-[285px]">
      <div className="absolute bg-white h-[61.875px] left-6 rounded-[16px] top-[355.13px] w-[327px]">
        <div aria-hidden="true" className="absolute border border-[#e9f1ff] border-solid inset-0 pointer-events-none rounded-[16px]" />
      </div>
      <div className="absolute font-['Poppins:Regular',_sans-serif] h-[16.5px] leading-[0] left-11 not-italic text-[#848a94] text-[16px] top-[377.81px] w-[120px]">
        <p className="leading-[16px]">Enter your mail</p>
      </div>
      <div className="absolute font-['Poppins:Regular',_sans-serif] h-[17px] leading-[0] left-[42px] not-italic text-[#848a94] text-[16px] top-[285px] w-[153px]">
        <p className="leading-[16px]">Enter your name</p>
      </div>
    </div>
  );
}

function Group705() {
  return (
    <div className="absolute contents left-6 top-[447px]">
      <div className="absolute bg-white h-[60px] left-6 rounded-[16px] top-[447px] w-[327px]">
        <div aria-hidden="true" className="absolute border border-[#e9f1ff] border-solid inset-0 pointer-events-none rounded-[16px]" />
      </div>
      <div className="absolute font-['Poppins:Regular',_sans-serif] leading-[0] left-11 not-italic text-[#848a94] text-[16px] text-nowrap top-[469px]">
        <p className="leading-[16px] whitespace-pre">Enter your password</p>
      </div>
    </div>
  );
}

function Apple() {
  return (
    <div className="absolute h-[58px] left-[113px] top-[669px] w-[60px]" data-name="Apple">
      <img className="block max-w-none size-full" src={imgApple} />
    </div>
  );
}

function Group659() {
  return (
    <div className="absolute inset-[84.48%_34.4%_12.44%_58.93%]">
      <img className="block max-w-none size-full" src={imgGroup659} />
    </div>
  );
}

function Google() {
  return (
    <div className="absolute contents left-[203px] top-[669px]" data-name="google">
      <div className="absolute bg-white h-[58px] left-[203px] rounded-[16px] top-[669px] w-[60px]">
        <div aria-hidden="true" className="absolute border border-[#e9f1ff] border-solid inset-0 pointer-events-none rounded-[16px]" />
      </div>
      <Group659 />
    </div>
  );
}

function Social() {
  return (
    <div className="absolute contents left-[113px] top-[669px]" data-name="Social">
      <Apple />
      <Google />
    </div>
  );
}

function SignUp() {
  return (
    <div className="absolute contents left-[113px] top-[625px]" data-name="Sign Up">
      <div className="absolute font-['Poppins:Medium',_sans-serif] leading-[0] left-[187.5px] not-italic text-[#868d95] text-[14px] text-center text-nowrap top-[625px] translate-x-[-50%]">
        <p className="leading-[14px] whitespace-pre">Signup With</p>
      </div>
      <Social />
    </div>
  );
}

function Group219() {
  return (
    <div className="absolute contents left-[157px] top-[553px]">
      <div className="absolute font-['Poppins:Medium',_sans-serif] leading-[0] left-[188px] not-italic text-[16px] text-center text-nowrap text-white top-[553px] translate-x-[-50%]">
        <p className="leading-[16px] whitespace-pre">Sign Up</p>
      </div>
    </div>
  );
}

function SignIn() {
  return (
    <div className="absolute contents left-6 top-[537px]" data-name="Sign In">
      <div className="absolute blur-[18.5px] filter inset-[67.49%_6.4%_27.22%_6.4%] opacity-70 rounded-[53px]" data-name="Base" />
      <div className="absolute bg-[#756ef3] h-12 left-6 rounded-[16px] top-[537px] w-[327px]" />
      <Group219 />
    </div>
  );
}

export default function Signup() {
  return (
    <div className="bg-white relative size-full" data-name="Signup">
      <TopBar />
      <Ellipse />
      <div className="absolute font-['Poppins:SemiBold',_sans-serif] leading-[0] left-6 not-italic text-[#002055] text-[25px] text-nowrap top-[212px]">
        <p className="leading-[25px] whitespace-pre">Create Account</p>
      </div>
      <div className="absolute font-['Poppins:SemiBold',_'Noto_Sans:Bold',_sans-serif] leading-[0] text-[#002055] text-[25px] text-nowrap top-[71px]" style={{ left: "calc(50% - 155.5px)", fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="leading-[25px] whitespace-pre">Сохраним твои успехи?</p>
      </div>
      <Group700 />
      <Group699 />
      <Group705 />
      <div className="absolute font-['Open_Sans:Medium',_sans-serif] leading-[0] left-[283px] not-italic text-[#756ef3] text-[14px] text-nowrap text-right top-[767px] translate-x-[-100%]">
        <p className="leading-[14px] whitespace-pre">
          <span className="font-['Poppins:Regular',_sans-serif] text-[#848a94]">Have an Account?</span>
          <span className="font-['Poppins:Regular',_sans-serif]"> </span>
          <span className="font-['Poppins:SemiBold',_sans-serif]">Sign In</span>
        </p>
      </div>
      <SignUp />
      <SignIn />
    </div>
  );
}