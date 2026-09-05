const SAFE_LINK = /\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:)[^\s)]+)\)/gi

const escapeHtml = text =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const inlineToHtml = line => {
  const smartTags = {}
  let text = line.replace(/\$\{[^}]*\}/g, matched => {
    const placeholder = `%%BITMD${Object.keys(smartTags).length}%%`
    smartTags[placeholder] = escapeHtml(matched)

    return placeholder
  })

  text = escapeHtml(text)
  text = text.replace(SAFE_LINK, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  text = text.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>')
  text = text.replace(/(^|[^\w\\])_([^_]+?)_(?!\w)/g, '$1<em>$2</em>')
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')

  return Object.keys(smartTags).reduce(
    (acc, placeholder) => acc.split(placeholder).join(smartTags[placeholder]),
    text
  )
}

export default function markdownToHtml(markdown) {
  const lines = String(markdown || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')

  let html = ''
  let paragraph = []
  let quote = []
  let listType = null
  let codeLines = null

  const flushParagraph = () => {
    if (paragraph.length) {
      html += `<p>${paragraph.join('<br>')}</p>`
      paragraph = []
    }
  }

  const flushQuote = () => {
    if (quote.length) {
      html += `<blockquote><p>${quote.join('<br>')}</p></blockquote>`
      quote = []
    }
  }

  const flushList = () => {
    if (listType) {
      html += `</${listType}>`
      listType = null
    }
  }

  const flushCode = () => {
    if (codeLines) {
      html += `<pre><code>${codeLines.join('\n')}</code></pre>`
      codeLines = null
    }
  }

  const openList = type => {
    flushParagraph()
    flushQuote()
    if (listType !== type) {
      flushList()
      html += `<${type}>`
      listType = type
    }
  }

  lines.forEach(line => {
    if (/^\s*```/.test(line)) {
      if (codeLines) {
        flushCode()
      } else {
        flushParagraph()
        flushQuote()
        flushList()
        codeLines = []
      }

      return
    }

    if (codeLines) {
      codeLines.push(escapeHtml(line))

      return
    }

    if (!line.trim()) {
      flushParagraph()
      flushQuote()
      flushList()

      return
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      flushParagraph()
      flushQuote()
      flushList()
      const level = heading[1].length
      html += `<h${level}>${inlineToHtml(heading[2])}</h${level}>`

      return
    }

    const bullet = line.match(/^\s*[-*+]\s+(.*)$/)
    if (bullet) {
      openList('ul')
      html += `<li>${inlineToHtml(bullet[1])}</li>`

      return
    }

    const ordered = line.match(/^\s*\d+\.\s+(.*)$/)
    if (ordered) {
      openList('ol')
      html += `<li>${inlineToHtml(ordered[1])}</li>`

      return
    }

    const quoted = line.match(/^\s*>\s?(.*)$/)
    if (quoted) {
      flushParagraph()
      flushList()
      quote.push(inlineToHtml(quoted[1]))

      return
    }

    flushQuote()
    flushList()
    paragraph.push(inlineToHtml(line))
  })

  flushCode()
  flushParagraph()
  flushQuote()
  flushList()

  return html
}
