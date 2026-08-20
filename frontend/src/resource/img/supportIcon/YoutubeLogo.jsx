/* eslint-disable max-len */
/* Official YouTube play badge — brand colours are fixed, not themeable. */
export default function YoutubeLogo({ size = 20, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="presentation">
      <path
        fill="#FF0000"
        d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.09 0 12 0 12s0 3.91.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.91 24 12 24 12s0-3.91-.5-5.8Z"
      />
      <path fill="#FFFFFF" d="M9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  )
}
