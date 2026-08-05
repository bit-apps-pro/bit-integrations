/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function TrelloActions({ trelloConf, setTrelloConf, formFields }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })
  const actionHandler = (e, type) => {
    const newConf = { ...trelloConf }
    if (type === 'tag') {
      if (e.target?.checked) {
        newConf.actions.tag = true
        setActionMdl({ show: 'tag' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.tag
      }
    }

    if (type === 'richTextDesc') {
      newConf.actions = { ...newConf.actions }
      if (e.target?.checked) {
        newConf.actions.richTextDesc = true
        // description is handled by the rich text editor, drop it from the field map
        const restFieldMap = (newConf.field_map || []).filter(
          fld => fld?.trelloFormField !== 'desc'
        )
        newConf.field_map = restFieldMap.length
          ? restFieldMap
          : [{ formField: '', trelloFormField: '' }]
      } else {
        delete newConf.actions.richTextDesc
      }
    }

    setTrelloConf({ ...newConf })
  }
  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }
  const onSelectHandler = val => {
    const newConf = { ...trelloConf }
    newConf.pos = val
    setTrelloConf(newConf)
  }

  const options = [
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' }
  ]

  return (
    <div className="pos-rel w-8">
      <div className="d-flx">
        <TableCheckBox
          checked={trelloConf?.actions?.tag || false}
          onChange={e => actionHandler(e, 'tag')}
          className="wdt-200 mt-4 mr-2"
          value="tag"
          title={__('Add Position', 'bit-integrations')}
          subTitle={__('Add Card Position', 'bit-integrations')}
        />
      </div>
      <div className="d-flx">
        <TableCheckBox
          checked={trelloConf?.actions?.richTextDesc || false}
          onChange={e => actionHandler(e, 'richTextDesc')}
          className="wdt-400 mt-4 mr-2"
          value="richTextDesc"
          title={__('Write Description with Rich Text Editor', 'bit-integrations')}
          subTitle={__(
            'Write long, formatted content in an editor instead of mapping a plain text field. Description is removed from Field Map.',
            'bit-integrations'
          )}
        />
      </div>
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'tag'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Position', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Card Position', 'bit-integrations')}</div>
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <MultiSelect
              options={options}
              className="msl-wrp-options"
              singleSelect
              defaultValue={trelloConf.pos}
              onChange={val => onSelectHandler(val)}
            />
          </div>
        )}
      </ConfirmModal>
    </div>
  )
}
