/* eslint-disable no-param-reassign */

import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { ProFeatureSubtitle, ProFeatureTitle } from '../IntegrationHelpers/ActionProFeatureLabels'

export default function KlaviyoActions({ klaviyoConf, setKlaviyoConf, loading, setLoading }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const actionHandler = (e, type) => {
    const newConf = { ...klaviyoConf }
    if (e.target?.checked) {
      newConf[type] = true
    } else {
      delete newConf[type]
    }

    setKlaviyoConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={klaviyoConf?.update || false}
        onChange={e => actionHandler(e, 'update')}
        className="wdt-200 mt-4 mr-2"
        value="update"
        isInfo={!isPro}
        title={<ProFeatureTitle title={__('Update Profile', 'bit-integrations')} />}
        subTitle={
          <ProFeatureSubtitle
            title={__('Update Profile', 'bit-integrations')}
            subTitle={__(
              'A record gets updated based on the email, else a new profile will be created',
              'bit-integrations'
            )}
            proVersion="2.4.9"
          />
        }
      />
      <TableCheckBox
        checked={klaviyoConf?.email_marketing_consent || false}
        onChange={e => actionHandler(e, 'email_marketing_consent')}
        className="wdt-200 mt-4 mr-2"
        value="email_marketing_consent"
        title={__('Email Marketing Consent', 'bit-integrations')}
        subTitle={__(
          'Subscribe the profile to email marketing so it can receive campaigns',
          'bit-integrations'
        )}
      />
    </div>
  )
}
