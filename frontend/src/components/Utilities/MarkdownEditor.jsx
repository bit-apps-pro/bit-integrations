import { Fragment, useEffect, useRef, useState } from 'react'
import {
  LuBold,
  LuBraces,
  LuChevronDown,
  LuCode,
  LuEye,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuItalic,
  LuLink,
  LuList,
  LuListOrdered,
  LuSquareCode,
  LuSquarePen,
  LuStrikethrough,
  LuTextQuote
} from 'react-icons/lu'
import { __ } from '../../Utils/i18nwrap'
import markdownToHtml from '../../Utils/markdownToHtml'

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
  const lastRangeRef = useRef(null)
  const scrollTopRef = useRef(null)
  const appendedAtEndRef = useRef(false)
  const [pendingSelection, setPendingSelection] = useState(null)
  const [mode, setMode] = useState('write')
  const [insertOpen, setInsertOpen] = useState(false)
  const insertRef = useRef(null)

  useEffect(() => {
    if (!pendingSelection || !textareaRef.current) return
    const el = textareaRef.current
    el.focus()
    el.setSelectionRange(pendingSelection.start, pendingSelection.end)
    if (scrollTopRef.current !== null) el.scrollTop = scrollTopRef.current
    lastRangeRef.current = { start: pendingSelection.start, end: pendingSelection.end }
    setPendingSelection(null)
  }, [pendingSelection])

  useEffect(() => {
    if (!insertOpen) return undefined

    const onPointerDown = ev => {
      if (!insertRef.current?.contains(ev.target)) setInsertOpen(false)
    }
    const onKeyDown = ev => {
      if (ev.key === 'Escape') setInsertOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [insertOpen])

  if (!show) return null

  const rememberRange = () => {
    const el = textareaRef.current
    if (el) lastRangeRef.current = { start: el.selectionStart, end: el.selectionEnd }
  }

  // pushes the new text up and remembers where the caret should land once it is rendered
  const commit = (nextValue, start, end) => {
    scrollTopRef.current = appendedAtEndRef.current ? null : (textareaRef.current?.scrollTop ?? 0)
    onChange(nextValue)
    setPendingSelection({ start, end })
  }

  const getRange = () => {
    const el = textareaRef.current
    if (!el) return { start: value.length, end: value.length }
    if (document.activeElement === el) {
      appendedAtEndRef.current = false

      return { start: el.selectionStart, end: el.selectionEnd }
    }

    appendedAtEndRef.current = !lastRangeRef.current

    return lastRangeRef.current || { start: value.length, end: value.length }
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
      Icon: LuHeading1,
      tip: __('Heading 1', 'bit-integrations'),
      run: () => prefixLines(() => '# ')
    },
    {
      key: 'h2',
      Icon: LuHeading2,
      tip: __('Heading 2', 'bit-integrations'),
      run: () => prefixLines(() => '## ')
    },
    {
      key: 'h3',
      Icon: LuHeading3,
      tip: __('Heading 3', 'bit-integrations'),
      run: () => prefixLines(() => '### ')
    },
    {
      key: 'bold',
      startsGroup: true,
      Icon: LuBold,
      tip: __('Bold', 'bit-integrations'),
      run: () => wrapSelection('**', '**', __('bold text', 'bit-integrations'))
    },
    {
      key: 'italic',
      Icon: LuItalic,
      tip: __('Italic', 'bit-integrations'),
      run: () => wrapSelection('_', '_', __('italic text', 'bit-integrations'))
    },
    {
      key: 'strike',
      Icon: LuStrikethrough,
      tip: __('Strikethrough', 'bit-integrations'),
      run: () => wrapSelection('~~', '~~', __('struck text', 'bit-integrations'))
    },
    {
      key: 'bullet',
      startsGroup: true,
      Icon: LuList,
      tip: __('Bullet List', 'bit-integrations'),
      run: () => prefixLines(() => '- ')
    },
    {
      key: 'ordered',
      Icon: LuListOrdered,
      tip: __('Numbered List', 'bit-integrations'),
      run: () => prefixLines(index => `${index + 1}. `)
    },
    {
      key: 'quote',
      Icon: LuTextQuote,
      tip: __('Quote', 'bit-integrations'),
      run: () => prefixLines(() => '> ')
    },
    {
      key: 'link',
      startsGroup: true,
      Icon: LuLink,
      tip: __('Link', 'bit-integrations'),
      run: insertLink
    },
    {
      key: 'code',
      Icon: LuCode,
      tip: __('Inline Code', 'bit-integrations'),
      run: () => wrapSelection('`', '`', __('code', 'bit-integrations'))
    },
    {
      key: 'codeblock',
      Icon: LuSquareCode,
      tip: __('Code Block', 'bit-integrations'),
      run: insertCodeBlock
    }
  ]

  const insertableFields = formFields?.filter(
    field => !field?.type?.match(/^(file-up|recaptcha|section|divider|image|advanced-file-up)$/)
  )

  const isPreview = mode === 'preview'

  const insertGroups = [
    { key: 'fields', label: __('Form Fields', 'bit-integrations'), items: insertableFields },
    { key: 'tags', label: __('Smart Tags', 'bit-integrations'), items: smartTags }
  ].filter(group => group.items?.length > 0)

  const pickToken = token => {
    setInsertOpen(false)
    insertToken(token)
  }

  return (
    <div className="btcbi-md-editor">
      <div className="flx mb-1 btcbi-md-bar">
        <div className="btcbi-md-modes" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isPreview}
            className={`btcbi-md-mode ${isPreview ? '' : 'is-active'}`}
            onClick={() => setMode('write')}>
            <LuSquarePen size={14} aria-hidden="true" />
            {__('Write', 'bit-integrations')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isPreview}
            className={`btcbi-md-mode ${isPreview ? 'is-active' : ''}`}
            onClick={() => setMode('preview')}>
            <LuEye size={14} aria-hidden="true" />
            {__('Preview', 'bit-integrations')}
          </button>
        </div>

        {!isPreview && (
          <>
            <span className="btcbi-md-sep" />

            {tools.map(({ key, Icon, tip, run, startsGroup }) => (
              <Fragment key={key}>
                {startsGroup && <span className="btcbi-md-sep" />}
                <button
                  onClick={run}
                  className="icn-btn sh-sm mr-1 tooltip"
                  style={{
                    '--tooltip-txt': `'${tip}'`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  type="button"
                  disabled={disabled}
                  aria-label={tip}>
                  <Icon size={16} aria-hidden="true" />
                </button>
              </Fragment>
            ))}

            {insertGroups.length > 0 && (
              <div className="btcbi-md-insert" ref={insertRef}>
                <span className="btcbi-md-sep" />
                <button
                  onClick={() => setInsertOpen(open => !open)}
                  className={`btcbi-md-insert__trigger ${insertOpen ? 'is-open' : ''}`}
                  type="button"
                  disabled={disabled}
                  aria-haspopup="menu"
                  aria-expanded={insertOpen}>
                  <LuBraces size={14} aria-hidden="true" />
                  {__('Insert', 'bit-integrations')}
                  <LuChevronDown size={14} className="btcbi-md-insert__caret" aria-hidden="true" />
                </button>

                {insertOpen && (
                  <div className="btcbi-md-insert__menu" role="menu">
                    {insertGroups.map(group => (
                      <div key={group.key} className="btcbi-md-insert__group">
                        <div className="btcbi-md-insert__label">{group.label}</div>
                        {group.items.map(item => (
                          <button
                            key={`md-${group.key}-${item.name}`}
                            type="button"
                            role="menuitem"
                            className="btcbi-md-insert__item"
                            onClick={() => pickToken(`\${${item.name}}`)}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isPreview ? (
        <div className="btcbi-md-preview">
          {value.trim() ? (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} />
          ) : (
            <span className="btcbi-md-preview__empty">
              {__('Nothing to preview yet.', 'bit-integrations')}
            </span>
          )}
        </div>
      ) : (
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
          onSelect={rememberRange}
          onKeyUp={rememberRange}
          onClick={rememberRange}
          onBlur={rememberRange}
        />
      )}
    </div>
  )
}
