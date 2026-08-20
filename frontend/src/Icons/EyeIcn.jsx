/* eslint-disable max-len */
export default function EyeIcn({ size = 20, stroke = 2, off = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ pointerEvents: 'none' }}>
      {off ? (
        <>
          <path
            className="svg-icn"
            strokeWidth={stroke}
            d="M10.73,5.08a10.74,10.74,0,0,1,11.21,6.57,1,1,0,0,1,0,.7,10.75,10.75,0,0,1-1.45,2.49"
          />
          <path className="svg-icn" strokeWidth={stroke} d="M14.08,14.16a3,3,0,0,1-4.24-4.24" />
          <path
            className="svg-icn"
            strokeWidth={stroke}
            d="M17.48,17.5A10.75,10.75,0,0,1,2.06,12.35a1,1,0,0,1,0-.7A10.75,10.75,0,0,1,6.51,6.51"
          />
          <path className="svg-icn" strokeWidth={stroke} d="M2,2,22,22" />
        </>
      ) : (
        <>
          <path
            className="svg-icn"
            strokeWidth={stroke}
            d="M2.06,12.35a1,1,0,0,1,0-.7,10.75,10.75,0,0,1,19.88,0,1,1,0,0,1,0,.7,10.75,10.75,0,0,1-19.88,0"
          />
          <circle className="svg-icn" strokeWidth={stroke} cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )
}
