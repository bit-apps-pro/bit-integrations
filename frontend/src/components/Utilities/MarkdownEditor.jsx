import { useEffect, useRef, useState } from 'react'
import { __ } from '../../Utils/i18nwrap'

const LINE_PREFIX_PATTERN = /^(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s+)/

export default function MarkdownEditor({
  id,
  value = '',
  onChange,
  formFields,
  smartTags,
  rows = 12,
  placeholder,
  disabled,
  show = true
}) {
  const textareaRef = useRef(null)
  const [pendingSelection, setPendingSelection] = useState(null)

  useEffect(() => {
    if (!pendingSelection || !textareaRef.current) return
    textareaRef.current.focus()
    textareaRef.current.setSelectionRange(pendingSelection.start, pendingSelection.end)
    setPendingSelection(null)
  }, [pendingSelection])

  if (!show) return null

  // pushes the new text up and remembers where the caret should land once it is rendered
  const commit = (nextValue, start, end) => {
    onChange(nextValue)
    setPendingSelection({ start, end })
  }

  const getRange = () => {
    const el = textareaRef.current
    if (!el) return { start: value.length, end: value.length }
    return { start: el.selectionStart, end: el.selectionEnd }
  }

  const wrapSelection = (token, endToken = token, fallbackText = '') => {
    const { start, end } = getRange()
    const selected = value.substring(start, end) || fallbackText
    const nextValue = value.substring(0, start) + token + selected + endToken + value.substring(end)

    commit(nextValue, start + token.length, start + token.length + selected.length)
  }

  const prefixLines = makePrefix => {
    const { start, end } = getRange()
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const nextBreak = value.indexOf('\n', end)
    const lineEnd = nextBreak === -1 ? value.length : nextBreak
    const prefixed = value
      .substring(lineStart, lineEnd)
      .split('\n')
      .map((line, index) => makePrefix(index) + line.replace(LINE_PREFIX_PATTERN, ''))
      .join('\n')
    const nextValue = value.substring(0, lineStart) + prefixed + value.substring(lineEnd)

    commit(nextValue, lineStart, lineStart + prefixed.length)
  }

  const insertLink = () => {
    const { start, end } = getRange()
    const selected = value.substring(start, end) || __('link text', 'bit-integrations')
    const nextValue = `${value.substring(0, start)}[${selected}](https://)${value.substring(end)}`
    const urlStart = start + selected.length + 3

    commit(nextValue, urlStart, urlStart + 'https://'.length)
  }

  const insertCodeBlock = () => {
    const { start, end } = getRange()
    const selected = value.substring(start, end)
    const leadingBreak = start > 0 && value[start - 1] !== '\n' ? '\n' : ''
    const block = `${leadingBreak}\`\`\`\n${selected}\n\`\`\`\n`
    const nextValue = value.substring(0, start) + block + value.substring(end)
    const caret = start + leadingBreak.length + 4

    commit(nextValue, caret, caret + selected.length)
  }

  const insertToken = token => {
    if (!token) return
    const { start, end } = getRange()
    const nextValue = value.substring(0, start) + token + value.substring(end)

    commit(nextValue, start + token.length, start + token.length)
  }

  const tools = [
    {
      key: 'h1',
      label: 'H1',
      tip: __('Heading 1', 'bit-integrations'),
      run: () => prefixLines(() => '# ')
    },
    {
      key: 'h2',
      label: 'H2',
      tip: __('Heading 2', 'bit-integrations'),
      run: () => prefixLines(() => '## ')
    },
    {
      key: 'h3',
      label: 'H3',
      tip: __('Heading 3', 'bit-integrations'),
      run: () => prefixLines(() => '### ')
    },
    {
      key: 'bold',
      label: 'B',
      tip: __('Bold', 'bit-integrations'),
      style: { fontWeight: 800 },
      run: () => wrapSelection('**', '**', __('bold text', 'bit-integrations'))
    },
    {
      key: 'italic',
      label: 'I',
      tip: __('Italic', 'bit-integrations'),
      style: { fontStyle: 'italic' },
      run: () => wrapSelection('_', '_', __('italic text', 'bit-integrations'))
    },
    {
      key: 'strike',
      label: 'S',
      tip: __('Strikethrough', 'bit-integrations'),
      style: { textDecoration: 'line-through' },
      run: () => wrapSelection('~~', '~~', __('struck text', 'bit-integrations'))
    },
    {
      key: 'bullet',
      label: '•',
      tip: __('Bullet List', 'bit-integrations'),
      run: () => prefixLines(() => '- ')
    },
    {
      key: 'ordered',
      label: '1.',
      tip: __('Numbered List', 'bit-integrations'),
      style: { fontSize: 11 },
      run: () => prefixLines(index => `${index + 1}. `)
    },
    {
      key: 'quote',
      label: '❝',
      tip: __('Quote', 'bit-integrations'),
      run: () => prefixLines(() => '> ')
    },
    { key: 'link', label: '🔗', tip: __('Link', 'bit-integrations'), run: insertLink },
    {
      key: 'code',
      label: '`',
      tip: __('Inline Code', 'bit-integrations'),
      run: () => wrapSelection('`', '`', __('code', 'bit-integrations'))
    },
    {
      key: 'codeblock',
      label: '</>',
      tip: __('Code Block', 'bit-integrations'),
      style: { fontSize: 10 },
      run: insertCodeBlock
    }
  ]

  const insertableFields = formFields?.filter(
    field => !field?.type?.match(/^(file-up|recaptcha|section|divider|image|advanced-file-up)$/)
  )

  return (
    <div className="btcbi-md-editor">
      <div className="flx flx-wrp mb-1">
        {tools.map(tool => (
          <button
            key={tool.key}
            onClick={tool.run}
            className="icn-btn sh-sm mr-1 tooltip"
            style={{ '--tooltip-txt': `'${tool.tip}'`, fontSize: 12, fontWeight: 600, ...tool.style }}
            type="button"
            disabled={disabled}
            aria-label={tool.tip}>
            {tool.label}
          </button>
        ))}

        {insertableFields?.length > 0 && (
          <select
            className="btcd-paper-inp wdt-150 ml-2"
            value=""
            disabled={disabled}
            aria-label={__('Insert Form Field', 'bit-integrations')}
            onChange={ev => insertToken(ev.target.value)}>
            <option value="">{__('Form Fields', 'bit-integrations')}</option>
            {insertableFields.map(field => (
              <option key={`md-ff-${field.name}`} value={`\${${field.name}}`}>
                {field.label}
              </option>
            ))}
          </select>
        )}

        {smartTags?.length > 0 && (
          <select
            className="btcd-paper-inp wdt-150 ml-2"
            value=""
            disabled={disabled}
            aria-label={__('Insert Smart Tag', 'bit-integrations')}
            onChange={ev => insertToken(ev.target.value)}>
            <option value="">{__('Smart Tags', 'bit-integrations')}</option>
            {smartTags.map(tag => (
              <option key={`md-st-${tag.name}`} value={`\${${tag.name}}`}>
                {tag.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <textarea
        id={id}
        ref={textareaRef}
        className="btcd-paper-inp w-10"
        style={{ width: '100%', fontFamily: 'monospace', lineHeight: 1.5 }}
        rows={rows}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={ev => onChange(ev.target.value)}
      />
    </div>
  )
}
