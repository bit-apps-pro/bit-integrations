import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { __, sprintf } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { refreshBookneticOptions, selectsForAction } from './BookneticCommonFunc'
import { utilities } from './staticData'

export default function BookneticActions({ bookneticConf, setBookneticConf }) {
  const [isLoading, setIsLoading] = useState(false)
  const [openKey, setOpenKey] = useState(null)

  const actionUtilities = selectsForAction(utilities, bookneticConf?.mainAction)
  const openUtility = actionUtilities.find(item => item.key === openKey)

  const setUtility = (key, val) => {
    setBookneticConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        if (val) {
          draftConf.utilities[key] = val
        } else {
          delete draftConf.utilities[key]
        }
      })
    )
  }

  const handleToggle = (e, item) => {
    if (!e.target.checked) {
      setUtility(item.key, '')
      return
    }

    setOpenKey(item.key)

    if (item.source && !bookneticConf?.default?.[item.source]) {
      refreshBookneticOptions(item.source, setBookneticConf, setIsLoading)
    }
  }

  const closeModal = () => setOpenKey(null)

  const options = item => item.options ?? bookneticConf?.default?.[item.source] ?? []

  const selectedLabels = item => {
    const values = String(bookneticConf?.utilities?.[item.key] ?? '')
      .split(',')
      .filter(Boolean)
    const labels = values
      .map(value => options(item).find(option => option.value === value)?.label)
      .filter(Boolean)

    return labels.length === values.length && labels.length ? labels.join(', ') : ''
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {actionUtilities.map(item => (
        <TableCheckBox
          key={item.key}
          checked={!!bookneticConf?.utilities?.[item.key]}
          onChange={e => handleToggle(e, item)}
          className="wdt-200 mt-4 mr-2"
          value={item.key}
          title={item.title}
          subTitle={
            selectedLabels(item)
              ? sprintf(
                  // translators: %s: selected option labels
                  __('Selected: %s', 'bit-integrations'),
                  selectedLabels(item)
                )
              : item.subTitle
          }
        />
      ))}

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={!!openUtility}
        close={closeModal}
        action={closeModal}
        title={openUtility?.title}>
        <div className="btcd-hr mt-2 mb-2" />
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
          openUtility && (
            <div className="flx flx-between mt-2">
              <MultiSelect
                key={openUtility.key}
                options={options(openUtility)}
                className="msl-wrp-options"
                singleSelect={!openUtility.multi}
                closeOnSelect={!openUtility.multi}
                defaultValue={bookneticConf?.utilities?.[openUtility.key] || undefined}
                onChange={val => setUtility(openUtility.key, val)}
              />
              {openUtility.source && (
                <button
                  onClick={() =>
                    refreshBookneticOptions(openUtility.source, setBookneticConf, setIsLoading)
                  }
                  className="icn-btn sh-sm ml-2 mr-2 tooltip"
                  style={{ '--tooltip-txt': `'${__('Refresh List', 'bit-integrations')}'` }}
                  type="button"
                  disabled={isLoading}>
                  &#x21BB;
                </button>
              )}
            </div>
          )
        )}
      </ConfirmModal>
    </div>
  )
}
