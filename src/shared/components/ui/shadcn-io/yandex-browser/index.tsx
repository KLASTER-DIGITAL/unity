import type { SVGProps } from 'react';

type YandexBrowserMode = 'default' | 'simple';

export interface YandexBrowserProps extends SVGProps<SVGSVGElement> {
  url?: string;
  imageSrc?: string;
  videoSrc?: string;
  width?: number;
  height?: number;
  mode?: YandexBrowserMode;
}

export function YandexBrowser({
  imageSrc,
  videoSrc,
  url,
  width = 1203,
  height = 753,
  mode = 'default',
  ...props
}: YandexBrowserProps) {
  return (
    <svg
      fill="none"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#yandex-path0)">
        {/* Browser window background */}
        <path
          className="fill-[#F2F2F2] dark:fill-[#1F1F1F]"
          d="M0 52H1202V741C1202 747.627 1196.63 753 1190 753H12C5.37258 753 0 747.627 0 741V52Z"
        />
        {/* Top bar background - Yandex yellow accent */}
        <path
          className="fill-[#FFCC00] dark:fill-[#FFD633]"
          clipRule="evenodd"
          d="M0 12C0 5.37258 5.37258 0 12 0H1190C1196.63 0 1202 5.37258 1202 12V52H0L0 12Z"
          fillRule="evenodd"
        />
        <path
          className="fill-[#FFDB4D] dark:fill-[#FFE066]"
          clipRule="evenodd"
          d="M1.06738 12C1.06738 5.92487 5.99225 1 12.0674 1H1189.93C1196.01 1 1200.93 5.92487 1200.93 12V51H1.06738V12Z"
          fillRule="evenodd"
        />

        {/* Yandex logo "Я" */}
        <g className="mix-blend-luminosity">
          <text
            className="dark:fill-[#1F1F1F]"
            fill="#000000"
            fontFamily="Arial, sans-serif"
            fontSize="20"
            fontWeight="bold"
            x="20"
            y="33"
          >
            Я
          </text>
        </g>

        {/* Menu button (hamburger) */}
        <g className="mix-blend-luminosity">
          <rect
            className="dark:fill-[#1F1F1F]"
            fill="#000000"
            height="2"
            rx="1"
            width="20"
            x="1165"
            y="20"
          />
          <rect
            className="dark:fill-[#1F1F1F]"
            fill="#000000"
            height="2"
            rx="1"
            width="20"
            x="1165"
            y="25"
          />
          <rect
            className="dark:fill-[#1F1F1F]"
            fill="#000000"
            height="2"
            rx="1"
            width="20"
            x="1165"
            y="30"
          />
        </g>

        {/* Address bar */}
        <path
          className="fill-white dark:fill-[#2D2D2D]"
          d="M80 17C80 13.6863 82.6863 11 86 11H1116C1119.31 11 1122 13.6863 1122 17V35C1122 38.3137 1119.31 41 1116 41H86C82.6863 41 80 38.3137 80 35V17Z"
        />

        {/* Lock icon */}
        <g className="mix-blend-luminosity">
          <path
            className="dark:fill-[#CCCCCC]"
            d="M96.269 32.0852H102.426C103.277 32.0852 103.696 31.6663 103.696 30.7395V25.9851C103.696 25.1472 103.353 24.7219 102.642 24.6521V23.0842C102.642 20.6721 101.036 19.5105 99.348 19.5105C97.659 19.5105 96.053 20.6721 96.053 23.0842V24.6711C95.393 24.7727 95 25.1917 95 25.9851V30.7395C95 31.6663 95.418 32.0852 96.269 32.0852ZM97.272 22.97C97.272 21.491 98.211 20.6785 99.348 20.6785C100.478 20.6785 101.423 21.491 101.423 22.97V24.6394L97.272 24.6458V22.97Z"
            fill="#000000"
          />
        </g>

        {/* URL text */}
        <g className="mix-blend-luminosity">
          <text
            className="dark:fill-[#CCCCCC]"
            fill="#000000"
            fontFamily="Arial, sans-serif"
            fontSize="12"
            x="110"
            y="30"
          >
            {url || 'unity-wine.vercel.app'}
          </text>
        </g>

        {mode === 'default' ? (
          <>
            {/* Back button */}
            <g className="mix-blend-luminosity">
              <path
                className="dark:fill-[#CCCCCC]"
                d="M53.914 32.5938C54.094 32.7656 54.312 32.8594 54.562 32.8594C55.086 32.8594 55.492 32.4531 55.492 31.9375C55.492 31.6797 55.391 31.4453 55.211 31.2656L49.742 25.9219L55.211 20.5938C55.391 20.4141 55.492 20.1719 55.492 19.9219C55.492 19.4062 55.086 19 54.562 19C54.312 19 54.094 19.0938 53.922 19.2656L47.844 25.2031C47.625 25.4062 47.516 25.6562 47.516 25.9297C47.516 26.2031 47.625 26.4375 47.836 26.6484L53.914 32.5938Z"
                fill="#000000"
              />
            </g>

            {/* Forward button */}
            <g className="mix-blend-luminosity">
              <path
                className="dark:fill-[#CCCCCC]"
                d="M68.422 32.8594C68.68 32.8594 68.891 32.7656 69.07 32.5938L75.148 26.6562C75.359 26.4375 75.469 26.2109 75.469 25.9297C75.469 25.6562 75.367 25.4141 75.148 25.2109L69.07 19.2656C68.891 19.0938 68.68 19 68.422 19C67.898 19 67.492 19.4062 67.492 19.9219C67.492 20.1719 67.602 20.4141 67.773 20.5938L73.25 25.9375L67.773 31.2656C67.594 31.4531 67.492 31.6797 67.492 31.9375C67.492 32.4531 67.898 32.8594 68.422 32.8594Z"
                fill="#000000"
              />
            </g>
          </>
        ) : null}

        {/* Default background when no image/video */}
        {!(imageSrc || videoSrc) && (
          <rect
            className="dark:fill-[#1F1F1F]"
            clipPath="url(#yandex-roundedBottom)"
            fill="#FFFFFF"
            height={height - 52}
            width={width - 2}
            x="1"
            y="52"
          />
        )}

        {imageSrc && (
          <image
            clipPath="url(#yandex-roundedBottom)"
            height={height - 52}
            href={imageSrc}
            preserveAspectRatio="xMidYMid slice"
            width={width - 2}
            x="1"
            y="52"
          />
        )}

        {videoSrc && (
          <foreignObject
            clipPath="url(#yandex-roundedBottom)"
            height={height - 52}
            preserveAspectRatio="xMidYMid slice"
            width={width - 2}
            x="1"
            y="52"
          >
            <video
              autoPlay
              className="size-full overflow-hidden object-cover"
              loop
              muted
              playsInline
              src={videoSrc}
            />
          </foreignObject>
        )}
      </g>
      <defs>
        <clipPath id="yandex-path0">
          <rect fill="white" height={height} width={width} />
        </clipPath>
        <clipPath id="yandex-roundedBottom">
          <path
            d={`M1 52H${width - 1}V${height - 12}C${width - 1} ${height - 5.925} ${width - 6.08} ${height} ${width - 12} ${height}H12C5.92486 ${height} 1 ${height - 5.925} 1 ${height - 12}V52Z`}
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
