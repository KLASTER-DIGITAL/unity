import type { SVGProps } from "react";

type ChromeMobileMode = "default" | "simple";

export interface ChromeMobileProps extends SVGProps<SVGSVGElement> {
	url?: string;
	imageSrc?: string;
	videoSrc?: string;
	width?: number;
	height?: number;
	mode?: ChromeMobileMode;
}

export function ChromeMobile({
	imageSrc,
	videoSrc,
	url,
	width = 1203,
	height = 753,
	mode = "default",
	...props
}: ChromeMobileProps) {
	return (
		<svg
			fill="none"
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			width={width}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g clipPath="url(#chrome-path0)">
				{/* Browser window background */}
				<path
					className="fill-[#F1F3F4] dark:fill-[#202124]"
					d="M0 52H1202V741C1202 747.627 1196.63 753 1190 753H12C5.37258 753 0 747.627 0 741V52Z"
				/>
				{/* Top bar background */}
				<path
					className="fill-[#F1F3F4] dark:fill-[#202124]"
					clipRule="evenodd"
					d="M0 12C0 5.37258 5.37258 0 12 0H1190C1196.63 0 1202 5.37258 1202 12V52H0L0 12Z"
					fillRule="evenodd"
				/>
				<path
					className="fill-white dark:fill-[#292A2D]"
					clipRule="evenodd"
					d="M1.06738 12C1.06738 5.92487 5.99225 1 12.0674 1H1189.93C1196.01 1 1200.93 5.92487 1200.93 12V51H1.06738V12Z"
					fillRule="evenodd"
				/>

				{/* Chrome menu dots (3 vertical dots) */}
				<circle
					className="fill-[#5F6368] dark:fill-[#9AA0A6]"
					cx="1170"
					cy="25"
					r="3"
				/>
				<circle
					className="fill-[#5F6368] dark:fill-[#9AA0A6]"
					cx="1170"
					cy="35"
					r="3"
				/>
				<circle
					className="fill-[#5F6368] dark:fill-[#9AA0A6]"
					cx="1170"
					cy="15"
					r="3"
				/>

				{/* Address bar */}
				<path
					className="fill-[#F1F3F4] dark:fill-[#3C4043]"
					d="M80 17C80 13.6863 82.6863 11 86 11H1116C1119.31 11 1122 13.6863 1122 17V35C1122 38.3137 1119.31 41 1116 41H86C82.6863 41 80 38.3137 80 35V17Z"
				/>

				{/* Lock icon */}
				<g className="mix-blend-luminosity">
					<path
						className="dark:fill-[#9AA0A6]"
						d="M96.269 32.0852H102.426C103.277 32.0852 103.696 31.6663 103.696 30.7395V25.9851C103.696 25.1472 103.353 24.7219 102.642 24.6521V23.0842C102.642 20.6721 101.036 19.5105 99.348 19.5105C97.659 19.5105 96.053 20.6721 96.053 23.0842V24.6711C95.393 24.7727 95 25.1917 95 25.9851V30.7395C95 31.6663 95.418 32.0852 96.269 32.0852ZM97.272 22.97C97.272 21.491 98.211 20.6785 99.348 20.6785C100.478 20.6785 101.423 21.491 101.423 22.97V24.6394L97.272 24.6458V22.97Z"
						fill="#5F6368"
					/>
				</g>

				{/* URL text */}
				<g className="mix-blend-luminosity">
					<text
						className="dark:fill-[#9AA0A6]"
						fill="#5F6368"
						fontFamily="Arial, sans-serif"
						fontSize="12"
						x="110"
						y="30"
					>
						{url || "unity-wine.vercel.app"}
					</text>
				</g>

				{mode === "default" ? (
					<>
						{/* Back button */}
						<g className="mix-blend-luminosity">
							<path
								className="dark:fill-[#9AA0A6]"
								d="M33.914 32.5938C34.094 32.7656 34.312 32.8594 34.562 32.8594C35.086 32.8594 35.492 32.4531 35.492 31.9375C35.492 31.6797 35.391 31.4453 35.211 31.2656L29.742 25.9219L35.211 20.5938C35.391 20.4141 35.492 20.1719 35.492 19.9219C35.492 19.4062 35.086 19 34.562 19C34.312 19 34.094 19.0938 33.922 19.2656L27.844 25.2031C27.625 25.4062 27.516 25.6562 27.516 25.9297C27.516 26.2031 27.625 26.4375 27.836 26.6484L33.914 32.5938Z"
								fill="#5F6368"
							/>
						</g>

						{/* Forward button */}
						<g className="mix-blend-luminosity">
							<path
								className="dark:fill-[#9AA0A6]"
								d="M58.422 32.8594C58.68 32.8594 58.891 32.7656 59.07 32.5938L65.148 26.6562C65.359 26.4375 65.469 26.2109 65.469 25.9297C65.469 25.6562 65.367 25.4141 65.148 25.2109L59.07 19.2656C58.891 19.0938 58.68 19 58.422 19C57.898 19 57.492 19.4062 57.492 19.9219C57.492 20.1719 57.602 20.4141 57.773 20.5938L63.25 25.9375L57.773 31.2656C57.594 31.4531 57.492 31.6797 57.492 31.9375C57.492 32.4531 57.898 32.8594 58.422 32.8594Z"
								fill="#5F6368"
							/>
						</g>
					</>
				) : null}

				{/* Default background when no image/video */}
				{!(imageSrc || videoSrc) && (
					<rect
						className="dark:fill-[#202124]"
						clipPath="url(#chrome-roundedBottom)"
						fill="#FFFFFF"
						height={height - 52}
						width={width - 2}
						x="1"
						y="52"
					/>
				)}

				{imageSrc && (
					<image
						clipPath="url(#chrome-roundedBottom)"
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
						clipPath="url(#chrome-roundedBottom)"
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
				<clipPath id="chrome-path0">
					<rect fill="white" height={height} width={width} />
				</clipPath>
				<clipPath id="chrome-roundedBottom">
					<path
						d={`M1 52H${width - 1}V${height - 12}C${width - 1} ${height - 5.925} ${width - 6.08} ${height} ${width - 12} ${height}H12C5.92486 ${height} 1 ${height - 5.925} 1 ${height - 12}V52Z`}
						fill="white"
					/>
				</clipPath>
			</defs>
		</svg>
	);
}
