import { __, sprintf } from '../../Utils/i18nwrap'

// `note` is expected to be trusted, developer-authored markup (formatting like
// <ul>/<li>/<b>). As defence-in-depth against a caller ever passing dynamic or
// remote text, strip the active-content vectors before rendering: <script>/<style>/
// <iframe>-style blocks, inline event handlers, and javascript:/data: URLs.
const sanitizeNoteHtml = html => {
  if (typeof html !== 'string') return ''
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src|xlink:href)\s*=\s*("|')?\s*(javascript|data|vbscript):[^"'>\s]*/gi, '$1=$2#')
}

export default function Note({
  note,
  isInstruction = false,
  isHeadingNull = false,
  maxWidth = '450px',
  children
}) {
  return (
    <div className="note" style={{ maxWidth: maxWidth }}>
      {!isHeadingNull && (
        <h4 className="mt-0">
          {isInstruction ? __('Instruction', 'bit-integrations') : __('Note', 'bit-integrations')}
        </h4>
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <div
        className="note-text"
        dangerouslySetInnerHTML={{ __html: sanitizeNoteHtml(__(note, 'bit-integrations')) }}
      />
      {children}
    </div>
  )
}
