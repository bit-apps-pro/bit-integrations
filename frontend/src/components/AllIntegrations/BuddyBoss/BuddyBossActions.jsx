/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function BuddyBossActions({ buddyBossConf, setBuddyBossConf, formFields }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })
  const actionHandler = (e, type) => {
    const newConf = { ...buddyBossConf }
    if (type === 'privacy') {
      if (e.target?.checked) {
        newConf.actions.privacy = true
        setActionMdl({ show: 'privacy' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.privacy
      }
    }
    if (type === 'type') {
      if (e.target?.checked) {
        newConf.actions.type = true
        setActionMdl({ show: 'type' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.type
      }
    }

    setBuddyBossConf({ ...newConf })
  }
  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const changeHandler = (val, name) => {
    const newConf = { ...buddyBossConf }
    if (name === 'privacyId') {
      if (val !== '') {
        newConf[name] = val
      } else {
        delete newConf[name]
      }
    }
    setBuddyBossConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={buddyBossConf?.actions?.privacy || false}
        onChange={e => actionHandler(e, 'privacy')}
        className="wdt-200 mt-4 mr-2"
        value="privacy"
        title={__('Add Privacy', 'bit-integrations')}
        subTitle={__('Add privacy of group', 'bit-integrations')}
      />

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'privacy'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Status', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select privacy of group', 'bit-integrations')}</div>
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
              className="msl-wrp-options"
              defaultValue={buddyBossConf?.privacyId}
              options={buddyBossConf?.groupPrivacyOptions.map(item => ({
                label: item.label,
                value: item.key
              }))}
              onChange={val => changeHandler(val, 'privacyId')}
              singleSelect
            />
          </div>
        )}
      </ConfirmModal>


    </div>
  )
}
