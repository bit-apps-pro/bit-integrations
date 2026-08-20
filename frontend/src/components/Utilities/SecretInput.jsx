import { useState } from 'react'
import EyeIcn from '../../Icons/EyeIcn'
import { __ } from '../../Utils/i18nwrap'

export default function SecretInput({ className = '', disabled, ...inputProps }) {
  const [isRevealed, setIsRevealed] = useState(false)

  const canReveal = !disabled

  return (
    <div className={`btcd-secret-fld ${className}`.trim()}>
      <input
        {...inputProps}
        className="btcd-paper-inp w-10"
        type={isRevealed && canReveal ? 'text' : 'password'}
        disabled={disabled}
      />
      {canReveal && (
        <button
          type="button"
          className="btcd-secret-fld-btn"
          onClick={() => setIsRevealed(revealed => !revealed)}
          aria-pressed={isRevealed}
          title={isRevealed ? __('Hide', 'bit-integrations') : __('Show', 'bit-integrations')}
          aria-label={
            isRevealed ? __('Hide value', 'bit-integrations') : __('Show value', 'bit-integrations')
          }>
          <EyeIcn size={16} off={isRevealed} />
        </button>
      )}
    </div>
  )
}
