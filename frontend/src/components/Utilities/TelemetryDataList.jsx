import { __ } from '../../Utils/i18nwrap'

export default function TelemetryDataList({ items = [], className = '' }) {
  if (!items.length) return null

  return (
    <details className={`btcd-collect${className ? ` ${className}` : ''}`}>
      <summary className="btcd-collect-sum">{__('What we collect', 'bit-integrations')}</summary>
      <ul className="btcd-collect-list">
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </details>
  )
}
