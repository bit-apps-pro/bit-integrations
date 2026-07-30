/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import Loader from '../../Loaders/Loader'
import { getAllTags } from './KeapCommonFunc'

export default function KeapActions({ keapConf, setKeapConf, loading, setLoading }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })
  const actionHandler = (e, type) => {
    const newConf = { ...keapConf }
    if (type === 'tag') {
      if (e.target?.checked) {
        getAllTags(keapConf, setKeapConf, setLoading)
        newConf.actions.tags = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.tags
      }
      setActionMdl({ show: 'tag' })
    }
    if (type === 'update') {
      if (e.target.checked) {
        newConf.actions.update = true
      } else {
        delete newConf.actions.update
      }
    }
    if (type === 'doubleOptIn') {
      if (e.target.checked) {
        newConf.actions.doubleOptIn = true
      } else {
        delete newConf.actions.doubleOptIn
      }
    }
    setKeapConf({ ...newConf })
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setChanges = val => {
    const newConf = { ...keapConf }
    newConf.selectedTags = val
    setKeapConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={keapConf?.selectedTags || false}
        onChange={e => actionHandler(e, 'tag')}
        className="wdt-200 mt-4 mr-2"
        value="tag"
        title={__('Add Tags', 'bit - integrations')}
        subTitle={__('Add Tags')}
      />
      {/* <TableCheckBox checked={keapConf.actions?.update || false} onChange={(e) => actionHandler(e, 'update')} className="wdt-200 mt-4 mr-2" value="update_subscriber" title={__('Update subscriber', 'bit-integrations')} subTitle={__('Override the existing subscriber info by responses.', 'bit-integrations')} /> */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'tag'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Tags', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select tags', 'bit-integrations')}</div>
        {loading ? (
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
              options={keapConf?.tags?.map(tag => ({ label: tag.name, value: tag.id }))}
              className="msl-wrp-options"
              defaultValue={keapConf?.selectedTags}
              onChange={val => setChanges(val)}
            />
            <button
              onClick={() => getAllTags(keapConf, setKeapConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Tags', 'bit-integrations')}'` }}
              type="button">
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>
    </div>
  )
}
