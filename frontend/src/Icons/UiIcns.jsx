function Frame({ size, className, children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="presentation">
      {children}
    </svg>
  )
}

export function MailIcn({ size = 20, className }) {
  return (
    <Frame size={size} className={className}>
      <rect x="2.5" y="4.75" width="19" height="14.5" rx="2.5" />
      <path d="m3.5 7 7.2 4.9a2.3 2.3 0 0 0 2.6 0L20.5 7" />
    </Frame>
  )
}

export function LogRetentionIcn({ size = 20, className }) {
  return (
    <Frame size={size} className={className}>
      <path d="M3.2 12a8.8 8.8 0 1 0 2.7-6.35" />
      <polyline points="3.2 3.9 3.2 8.4 7.7 8.4" />
      <polyline points="12 7.6 12 12.2 15.4 14.1" />
    </Frame>
  )
}

export function PrivacyIcn({ size = 20, className }) {
  return (
    <Frame size={size} className={className}>
      <path d="M12 2.9 4.8 5.7v5.1c0 4.4 3 7.8 7.2 9.3 4.2-1.5 7.2-4.9 7.2-9.3V5.7Z" />
      <polyline points="9.2 11.8 11.3 13.9 15 10.1" />
    </Frame>
  )
}

export function DocsIcn({ size = 20, className }) {
  return (
    <Frame size={size} className={className}>
      <path d="M5.1 4.4a1.9 1.9 0 0 1 1.9-1.9h8.3l3.6 3.7v13.4a1.9 1.9 0 0 1-1.9 1.9H7a1.9 1.9 0 0 1-1.9-1.9Z" />
      <polyline points="15.1 2.6 15.1 6.4 18.8 6.4" />
      <path d="M8.7 12.3h6.6" />
      <path d="M8.7 15.9h4.4" />
    </Frame>
  )
}

export function DangerIcn({ size = 20, className }) {
  return (
    <Frame size={size} className={className}>
      <path d="M3.8 6.6h16.4" />
      <path d="M8.7 6.6V4.9a1.8 1.8 0 0 1 1.8-1.8h3a1.8 1.8 0 0 1 1.8 1.8v1.7" />
      <path d="M18.1 6.6v12.6a1.9 1.9 0 0 1-1.9 1.9H7.8a1.9 1.9 0 0 1-1.9-1.9V6.6" />
      <path d="M10.3 10.8v6.2" />
      <path d="M13.7 10.8v6.2" />
    </Frame>
  )
}
