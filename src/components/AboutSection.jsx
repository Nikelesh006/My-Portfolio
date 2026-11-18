import DepthText from './DepthText';

export default function AboutSection({ className = '' }) {
  return (
    <section
      id="about"
      className={`relative w-full min-h-[100dvh] bg-white flex flex-col items-start justify-start px-[4vw] pt-[clamp(88px,11.5vh,130px)] pb-[clamp(48px,8vh,96px)] ${className}`}
    >
      <div className="w-full flex flex-col items-start">
        <div
          className="w-full"
          style={{
            marginTop: 'clamp(32px, 4.5vh, 56px)',
            marginBottom: 'clamp(20px, 3.2vh, 40px)'
          }}
        >
          <h2 className="w-full flex items-center justify-start overflow-visible m-0 p-0">
            <DepthText
              text="About Me"
              layers={34}
              depth={1.92}
              depthColor="#c0c0c0"
              gradientDepth={false}
              hoverPush={0.5}
              float={false}
              tilt={7.5}
              pointerTracking
              smoothing={0.14}
              perspective={900}
              autoOrbit
              orbitSpeed={0.35}
              fontSize="clamp(2.4rem, 9.6vw, 5.6rem)"
              fontWeight={900}
              shadow
              outline={false}
              intro
              faceColor="#000000"
            />
          </h2>
        </div>
      </div>
    </section>
  );
}
