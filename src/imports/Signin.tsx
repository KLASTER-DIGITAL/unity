import { imgArrowLeft2, imgEllipse172, imgEllipse, imgApple, imgGroup659 } from "./svg-rqc7r";

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
    <div className="absolute left-[35px] size-5 top-[71px]" data-name="Back arrow">
      <div className="absolute flex inset-[20.83%_35.42%] items-center justify-center">
        <div className="flex-none h-[5.833px] rotate-[90deg] w-[11.667px]">
          <ArrowLeft2 />
        </div>
      </div>
    </div>
  );
}

function BAxk() {
  return (
    <div className="absolute contents left-6 top-[60px]" data-name="BAxk">
      <div className="absolute left-6 size-[42px] top-[60px]">
        <img className="block max-w-none size-full" src={imgEllipse172} />
      </div>
      <BackArrow />
    </div>
  );
}

function TopBar() {
  return (
    <div className="absolute contents left-6 top-[60px]" data-name="Top Bar">
      <div className="absolute font-['Poppins:Medium',_sans-serif] leading-[0] left-[157px] not-italic text-[#002055] text-[18px] text-nowrap top-[72px]">
        <p className="leading-[18px] whitespace-pre">Sign In</p>
      </div>
      <BAxk />
    </div>
  );
}

function Group219() {
  return (
    <div className="absolute contents left-[161px] top-[493px]">
      <div className="absolute font-['Poppins:Medium',_sans-serif] leading-[0] left-[188px] not-italic text-[16px] text-center text-nowrap text-white top-[493px] translate-x-[-50%]">
        <p className="leading-[16px] whitespace-pre">Sign In</p>
      </div>
    </div>
  );
}

function Group1000000851() {
  return (
    <div className="absolute contents left-6 top-[477px]">
      <div className="absolute bg-[#756ef3] h-12 left-6 rounded-[16px] top-[477px] w-[327px]" />
      <Group219 />
    </div>
  );
}

function SignIn() {
  return (
    <div className="absolute contents left-6 top-[477px]" data-name="Sign In">
      <div className="absolute blur-[18.5px] filter inset-[60.47%_6.4%_34.24%_6.4%] opacity-70 rounded-[53px]" data-name="Base" />
      <Group1000000851 />
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
      <div className="absolute font-['Poppins:Medium',_sans-serif] leading-[0] left-11 not-italic text-[#002055] text-[16px] text-nowrap top-[289px]">
        <p className="leading-[16px] whitespace-pre">albart.ainstain@gmail.com</p>
      </div>
    </div>
  );
}

function Group699() {
  return (
    <div className="absolute contents left-6 top-[357px]">
      <div className="absolute bg-white h-[60px] left-6 rounded-[16px] top-[357px] w-[327px]">
        <div aria-hidden="true" className="absolute border border-[#e9f1ff] border-solid inset-0 pointer-events-none rounded-[16px]" />
      </div>
      <div className="absolute font-['Poppins:Regular',_sans-serif] leading-[0] left-11 not-italic text-[#868d95] text-[16px] text-nowrap top-[379px]">
        <p className="leading-[16px] whitespace-pre">Enter your password</p>
      </div>
    </div>
  );
}

function Apple() {
  return (
    <div className="absolute h-[58px] left-[113px] top-[609px] w-[60px]" data-name="Apple">
      <img className="block max-w-none size-full" src={imgApple} />
    </div>
  );
}

function Group659() {
  return (
    <div className="absolute inset-[77.09%_34.4%_19.83%_58.93%]">
      <img className="block max-w-none size-full" src={imgGroup659} />
    </div>
  );
}

function Google() {
  return (
    <div className="absolute contents left-[203px] top-[609px]" data-name="Google">
      <div className="absolute bg-white h-[58px] left-[203px] rounded-[16px] top-[609px] w-[60px]">
        <div aria-hidden="true" className="absolute border border-[#e9f1ff] border-solid inset-0 pointer-events-none rounded-[16px]" />
      </div>
      <Group659 />
    </div>
  );
}

function Social() {
  return (
    <div className="absolute contents left-[113px] top-[609px]" data-name="Social">
      <Apple />
      <Google />
    </div>
  );
}

function SignInWith() {
  return (
    <div className="absolute contents left-[113px] top-[565px]" data-name="Sign in with">
      <div className="absolute font-['Poppins:Medium',_sans-serif] leading-[0] left-[187.5px] not-italic text-[#868d95] text-[14px] text-center text-nowrap top-[565px] translate-x-[-50%]">
        <p className="leading-[14px] whitespace-pre">Signin with</p>
      </div>
      <Social />
    </div>
  );
}

export default function Signin() {
  return (
    <div className="bg-white relative size-full" data-name="Signin">
      <TopBar />
      <SignIn />
      <Ellipse />
      <div className="absolute font-['Poppins:SemiBold',_sans-serif] leading-[0] left-6 not-italic text-[#002055] text-[25px] text-nowrap top-[142px]">
        <p className="leading-[25px] whitespace-pre">Welcome Back</p>
      </div>
      <div className="absolute font-['Poppins:Regular',_sans-serif] leading-[0] left-6 not-italic text-[#868d95] text-[14px] top-[179px] w-[249px]">
        <p className="leading-[24px]">Please Inter your email address and password for Login</p>
      </div>
      <Group700 />
      <Group699 />
      <div className="absolute font-['Poppins:Medium',_sans-serif] leading-[0] left-[351px] not-italic text-[#002055] text-[14px] text-nowrap text-right top-[433px] translate-x-[-100%]">
        <p className="leading-[14px] whitespace-pre">Forgot Password?</p>
      </div>
      <div className="absolute font-['Open_Sans:Medium',_sans-serif] leading-[0] left-[187.5px] not-italic text-[#756ef3] text-[14px] text-center text-nowrap top-[707px] translate-x-[-50%]">
        <p className="leading-[14px] whitespace-pre">
          <span className="font-['Poppins:Regular',_sans-serif] text-[#868d95]">Not Registrar Yet?</span>
          <span className="font-['Poppins:Regular',_sans-serif]"> </span>
          <span className="font-['Poppins:SemiBold',_sans-serif]">Sign Up</span>
        </p>
      </div>
      <SignInWith />
    </div>
  );
}