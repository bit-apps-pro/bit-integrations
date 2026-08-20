/* eslint-disable no-param-reassign */

import { useEffect, useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { getAllLeadLabel, getAllLeadTags } from './PropovoiceCrmCommonFunc'

export default function PropovoiceCrmActions({
  propovoiceCrmConf,
  setPropovoiceCrmConf,
  formFields,
  isLoading,
  setIsLoading
}) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })
  const [loading, setLoading] = useState({ tags: false, label: false })

  const actionHandler = (e, type) => {
    const newConf = { ...propovoiceCrmConf }
    if (type === 'tags') {
      if (e.target?.checked) {
        newConf.actions.tags = true
        getAllLeadTags(newConf, setPropovoiceCrmConf, loading, setLoading)
        setActionMdl({ show: 'tags' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.tags
      }
    } else if (type === 'label') {
      if (e.target?.checked) {
        newConf.actions.label = true
        getAllLeadLabel(newConf, setPropovoiceCrmConf, loading, setLoading)
        setActionMdl({ show: 'label' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.label
      }
    }
    setPropovoiceCrmConf({ ...newConf })
  }
  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }
  const onSelectHandler = (val, type) => {
    const newConf = { ...propovoiceCrmConf }
    if (type === 'tags') {
      newConf.tags = val
    } else if (type === 'label') {
      newConf.label = val
    }
    setPropovoiceCrmConf(newConf)
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={propovoiceCrmConf?.actions?.tags || false}
        onChange={e => actionHandler(e, 'tags')}
        className="wdt-200 mt-4 mr-2"
        value="tags"
        title={__('Add tags', 'bit-integrations')}
        subTitle={__('tags add lead', 'bit-integrations')}
      />
      <TableCheckBox
        checked={propovoiceCrmConf?.actions?.label || false}
        onChange={e => actionHandler(e, 'label')}
        className="wdt-200 mt-4 mr-2"
        value="label"
        title={__('Add label', 'bit-integrations')}
        subTitle={__('label add lead', 'bit-integrations')}
      />

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'tags'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Tags', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select tag', 'bit-integrations')}</div>
        {loading?.tags ? (
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
              options={
                propovoiceCrmConf?.default?.allTags
                  ? propovoiceCrmConf.default.allTags.map(tag => ({
                      label: tag.name,
                      value: tag.term_id
                    }))
                  : []
              }
              className="msl-wrp-options"
              defaultValue={propovoiceCrmConf?.tags}
              onChange={val => onSelectHandler(val, 'tags')}
            />
            <button
              onClick={() =>
                getAllLeadTags(propovoiceCrmConf, setPropovoiceCrmConf, loading, setLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Tags', 'bit-integrations')}'` }}
              type="button">
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'label'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Label', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select label', 'bit-integrations')}</div>
        {loading?.label ? (
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
              options={
                propovoiceCrmConf?.default?.allLabels
                  ? propovoiceCrmConf.default.allLabels.map(tag => ({
                      label: tag.name,
                      value: tag.term_id
                    }))
                  : []
              }
              singleSelect
              className="msl-wrp-options"
              defaultValue={propovoiceCrmConf?.label}
              onChange={val => onSelectHandler(val, 'label')}
            />
            <button
              onClick={() =>
                getAllLeadLabel(propovoiceCrmConf, setPropovoiceCrmConf, loading, setLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Label', 'bit-integrations')}'` }}
              type="button">
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>
    </div>
  )
}
