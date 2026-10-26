import { Fragment, useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { refreshByOptionsKey } from './WpHotelBookingCommonFunc'
import { utilitiesByAction } from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const valueName = key => `selected_${key}`

export default function WpHotelBookingActions({ wpHotelBookingConf, setWpHotelBookingConf }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const utilities = utilitiesByAction[wpHotelBookingConf?.mainAction] || []

  const clsActionMdl = () => setActionMdl({ show: false })

  const actionHandler = ({ key, optionsKey }) => {
    if (wpHotelBookingConf?.utilities?.[valueName(key)]) {
      setWpHotelBookingConf(prevConf =>
        create(prevConf, draftConf => {
          if (draftConf.utilities) delete draftConf.utilities[valueName(key)]
        })
      )

      return
    }

    if (optionsKey && refreshByOptionsKey[optionsKey]) {
      refreshByOptionsKey[optionsKey](setWpHotelBookingConf, setIsLoading)
    }

    setActionMdl({ show: key })
  }

  const toggleCheckbox = (key, value) => {
    setWpHotelBookingConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        if (draftConf.utilities[valueName(key)] === value) {
          delete draftConf.utilities[valueName(key)]
        } else {
          draftConf.utilities[valueName(key)] = value
        }
      })
    )
  }

  const setAction = (value, key) => {
    setWpHotelBookingConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        if (value) {
          draftConf.utilities[valueName(key)] = value
        } else {
          delete draftConf.utilities[valueName(key)]
        }
      })
    )
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {utilities.map(utility => {
        const { checkbox, key, multiple, options, optionsKey, subTitle, title, value } = utility
        const selected = wpHotelBookingConf?.utilities?.[valueName(key)]
        const selectOptions = options || wpHotelBookingConf?.[optionsKey] || []
        const refresh = optionsKey ? refreshByOptionsKey[optionsKey] : null

        return (
          <Fragment key={key}>
            <TableCheckBox
              checked={checkbox ? selected === value : !!selected?.length}
              onChange={() => (checkbox ? toggleCheckbox(key, value) : actionHandler(utility))}
              className="wdt-200 mt-4 mr-2"
              value={key}
              title={title}
              subTitle={subTitle}
            />
            {!checkbox && (
              <ConfirmModal
                className="custom-conf-mdl"
                mainMdlCls="o-v"
                btnClass="purple"
                btnTxt={__('Ok', 'bit-integrations')}
                show={actionMdl.show === key}
                close={clsActionMdl}
                action={clsActionMdl}
                title={title}>
                <div className="btcd-hr mt-2 mb-2" />
                <div className="mt-2">{subTitle}</div>
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
                      options={selectOptions}
                      className="msl-wrp-options"
                      singleSelect={!multiple}
                      closeOnSelect={!multiple}
                      defaultValue={selected || undefined}
                      onChange={val => setAction(val, key)}
                    />
                    {refresh && (
                      <button
                        onClick={() => refresh(setWpHotelBookingConf, setIsLoading)}
                        className="icn-btn sh-sm ml-2 tooltip"
                        style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
                        type="button"
                        disabled={isLoading}>
                        &#x21BB;
                      </button>
                    )}
                  </div>
                )}
              </ConfirmModal>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
