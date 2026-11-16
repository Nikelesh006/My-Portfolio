import DepthText from './DepthText';

export default function ExperienceHeading({ className = '' }) {
  return (
    <h2 className={`w-full flex items-center justify-start overflow-visible m-0 p-0 ${className}`}>
      <DepthText
        text="Experience"
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
  );
}
