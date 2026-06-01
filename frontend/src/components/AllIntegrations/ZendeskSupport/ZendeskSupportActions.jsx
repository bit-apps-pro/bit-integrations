/* eslint-disable no-param-reassign */
import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import ConfirmModal from '../../Utilities/ConfirmModal'
import LoaderSm from '../../Loaders/LoaderSm'
import { ProFeatureSubtitle, ProFeatureTitle } from '../IntegrationHelpers/ActionProFeatureLabels'
import { fetchUtilityOptions } from './ZendeskSupportCommonFunc'
import { ZendeskSupportOptions, ZendeskSupportUtilities } from './staticData'

export default function ZendeskSupportActions({
  zendeskSupportConf,
  setZendeskSupportConf,
  loading,
  setLoading
}) {
  const { isPro } = useRecoilValue($appConfigState)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const utilities = ZendeskSupportUtilities[zendeskSupportConf.actionName] || []
  if (utilities.length === 0) {
    return null
  }

  const clsActionMdl = () => setActionMdl({ show: false })

  const refresh = util =>
    fetchUtilityOptions(zendeskSupportConf, setZendeskSupportConf, setLoading, util.route, util.listKey)

  const actionHandler = (e, util) => {
    const checked = e.target?.checked
    setZendeskSupportConf(prev => {
      const utils = { ...(prev.utilities || {}) }
      if (!checked) {
        delete utils[util.key]
      }
      return { ...prev, utilities: utils }
    })

    if (checked) {
      if (util.kind === 'fetch' && !zendeskSupportConf?.[util.listKey]?.length) {
        refresh(util)
      }
      setActionMdl({ show: util.key })
    } else {
      setActionMdl({ show: false })
    }
  }

  const setValue = (util, val) =>
    setZendeskSupportConf(prev => ({
      ...prev,
      utilities: { ...(prev.utilities || {}), [util.key]: val }
    }))

  return (
    <div className="pos-rel d-flx flx-wrp">
      {utilities.map(util => (
        <TableCheckBox
          key={util.key}
          checked={Boolean(zendeskSupportConf?.utilities?.[util.key])}
          onChange={e => actionHandler(e, util)}
          className="wdt-200 mt-4 mr-2"
          value={util.key}
          isInfo={!isPro}
          title={<ProFeatureTitle title={util.label} />}
          subTitle={
            <ProFeatureSubtitle
              title={util.label}
              subTitle={sprintf(__('Select %s for this action', 'bit-integrations'), util.label)}
              proVersion="2.4.9"
            />
          }
        />
      ))}

      {utilities.map(util => {
        const options =
          util.kind === 'static'
            ? ZendeskSupportOptions[util.optionsKey]
            : zendeskSupportConf?.[util.listKey] || []

        return (
          <ConfirmModal
            key={`mdl-${util.key}`}
            className="custom-conf-mdl"
            mainMdlCls="o-v"
            btnClass="purple"
            btnTxt={__('Ok', 'bit-integrations')}
            show={actionMdl.show === util.key}
            close={clsActionMdl}
            action={clsActionMdl}
            title={util.label}>
            <div className="btcd-hr mt-2 mb-2" />
            <div className="mt-2">
              {sprintf(__('Select %s', 'bit-integrations'), util.label)}
            </div>
            <div className="flx flx-between mt-2">
              <MultiSelect
                options={options}
                className="msl-wrp-options"
                defaultValue={zendeskSupportConf?.utilities?.[util.key]}
                onChange={val => setValue(util, val)}
                singleSelect
              />
              {util.kind === 'fetch' && (
                <button
                  onClick={() => refresh(util)}
                  className="icn-btn sh-sm ml-2 mr-2 tooltip"
                  style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
                  type="button"
                  disabled={loading?.[util.listKey]}>
                  {loading?.[util.listKey] ? <LoaderSm size="20" clr="#022217" /> : <>&#x21BB;</>}
                </button>
              )}
            </div>
          </ConfirmModal>
        )
      })}
    </div>
  )
}
