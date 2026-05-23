/**
 * WavyBackground — decorative SVG waves for page banners.
 * Place inside a `relative overflow-hidden` container; waves sit at the bottom.
 */
export default function WavyBackground({ color1, color2 }) {
  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 right-0 w-full pointer-events-none select-none"
      style={{ height: '56px' }}
    >
      <path
        fill={color1 || 'rgba(255,255,255,0.12)'}
        d="M0,40 Q150,10 300,40 T600,40 T900,40 T1200,40 L1200,120 L0,120 Z"
      />
      <path
        fill={color2 || 'rgba(255,255,255,0.07)'}
        d="M0,65 Q200,35 400,65 T800,65 T1200,65 L1200,120 L0,120 Z"
      />
    </svg>
  )
}
