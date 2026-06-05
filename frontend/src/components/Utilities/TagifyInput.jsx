/* eslint-disable jsx-a11y/label-has-associated-control */
import Tagify from '@yaireo/tagify'
import '@yaireo/tagify/dist/tagify.css'
import { max } from 'lodash'
import { useEffect, useRef } from 'react'

function TagifyInput({ label, onChange, value, disabled, type, textarea, className, formFields }) {
  const fields = formFields
    ? formFields
      .filter(itm => itm.label !== undefined)
      .map(item => ({ name: item.label, value: item.name }))
    : []

  const targetRef = useRef(null)

  const tagifyRef = useRef(null)

  useEffect(() => {
    const input = targetRef.current
    input.value = value
    input.setAttribute('value', value)
    if (tagifyRef.current) {
      tagifyRef.current.destroy()
    }

    tagifyRef.current = new Tagify(input, tagifySettings)
    tagifyRef.current.DOM.originalInput.value = value

    tagifyRef.current.on('input', onInput)
    tagifyRef.current.on('add', onAddTag)
    tagifyRef.current.on('remove', onRemoveTag)
    tagifyRef.current.on('change', onAddTag)
  }, [])

  const modifyTagifyData = val => {
    const matchedBraces = val.match(/(\${{.*?"value":".*?)"}}/g)
    let replacedData = val
    if (matchedBraces) {
      matchedBraces.forEach(item => {
        const itm = item.slice(2, -1)
        const parseData = JSON.parse(itm)
        replacedData = replacedData.replace(item, `\${${parseData.value}}`)
      })
    }

    onChange(replacedData)
  }

  const onInput = e => {
    const { prefix, textContent } = e.detail
    const lastChar = textContent.slice(-1)
    const isLastCharPrefix = lastChar === '#'
    const pref = isLastCharPrefix ? lastChar : prefix
    if (pref) {
      if (pref === '#') {
        tagifyRef.current.whitelist = fields
      }
      tagifyRef.current.dropdown.show()
    }

    setTimeout(() => {
      modifyTagifyData(e.detail.tagify.DOM.originalInput.value)
    }, 100)
  }

  const onAddTag = e => {
    setTimeout(() => {
      modifyTagifyData(e.detail.tagify.DOM.originalInput.value)
    }, 100)
  }

  const onRemoveTag = e => {
    setTimeout(() => {
      modifyTagifyData(e.detail.tagify.DOM.originalInput.value)
    }, 100)
  }

  const tagifySettings = {
    mixTagsInterpolator: ['${', '}'],
    mode: 'mix',
    mixMode: { insertAfterTag: ' ' },
    pattern: /#/,
    placeholder: label,
    tagTextProp: 'value',
    duplicates: true,
    whitelist: fields,
    enforceWhitelist: true,
    trim: true,
    editTags: false,
    dropdown: {
      enabled: 0,
      position: 'text',
      mapValueTo: 'value',
      highlightFirst: true,
      searchKeys: ['label', 'value'],
      closeOnSelect: true,
      placeAbove: false,
      maxItems: fields.length
    },
    callbacks: {
      add: () => {
        modifyTagifyData(tagifyRef.current.DOM.originalInput.value)
      },
      remove: () => {
        modifyTagifyData(tagifyRef.current.DOM.originalInput.value)
      }
    }
  }
  return (
    <div>
      <input name="tagify-inp" type={type === undefined ? 'text' : type} ref={targetRef} />
      {/* <span>{ddiv}</span> */}
    </div>
  )
}

export default TagifyInput
