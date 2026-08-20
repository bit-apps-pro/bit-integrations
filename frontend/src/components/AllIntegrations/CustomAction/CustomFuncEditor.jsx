import React, { useEffect, useRef } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'

const CustomFuncEditor = ({ customActionConf, setCustomActionConf, formFields, isInfo }) => {
  const monacoEditorRef = useRef(null)

  useEffect(() => {
    return () => {
      monacoEditorRef.current = null
    }
  }, [])

  const handleChangeFormField = e => {
    const newConf = { ...customActionConf }
    if (e !== '') {
      newConf['value'] = newConf.value + e
    }
    setCustomActionConf({ ...newConf })
  }
  const handleChange = val => {
    // setCustomActionConf(prv => ({ ...prv, value: val }))
    setCustomActionConf(prv =>
      create(prv, draft => {
        draft.value = val
        draft.isValid = false
      })
    )
    monacoEditorRef.current && onChange(val)
    monacoEditorRef.current = ''
  }
  function createDependencyProposals(range) {
    return formFields.map(item => ({
      label: item.label,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: `'${item.name}'`,
      range: range
    }))
  }

  const onMount = (_, monaco) => {
    monacoEditorRef.current = monaco
  }

  const onChange = (s, e) => {
    monacoEditorRef.current.languages.registerCompletionItemProvider('php', {
      provideCompletionItems: function (model, position) {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: position.column - 10,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })
        const match = textUntilPosition.match(/\$trigger\[?/)
        if (!match) {
          return { suggestions: [] }
        }
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        return {
          suggestions: createDependencyProposals(range)
        }
      }
    })
  }

  return (
    <div className="flx ">
      {!isInfo ? (
        <Editor
          width={'100%'}
          className="monaco-editor"
          height="50vh"
          theme="vs-dark"
          defaultLanguage="php"
          defaultValue={customActionConf?.defaultValue}
          value={customActionConf?.value}
          onChange={handleChange}
          onMount={onMount}
        />
      ) : (
        <div>
          <div className="mt-3" style={{ width: '1500px' }}>
            <b>{__('Custom Action:', 'bit-integrations')}</b>
          </div>
          <textarea
            className="btcd-paper-inp w-6 mt-1"
            style={{ resize: 'none' }}
            rows="20"
            value={customActionConf.value}
            type="text"
            disabled={isInfo}
          />
        </div>
      )}
    </div>
  )
}

export default CustomFuncEditor
