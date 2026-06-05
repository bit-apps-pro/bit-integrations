/* eslint-disable no-param-reassign */

import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { ProFeatureSubtitle, ProFeatureTitle } from '../IntegrationHelpers/ActionProFeatureLabels'

export default function MailPoetActions({ mailPoetConf, setMailPoetConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const actionHandler = (e, type) => {
    const newConf = { ...mailPoetConf }
    if (e.target.checked) {
      newConf.actions[type] = true
    } else {
      delete newConf.actions[type]
    }

    setMailPoetConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx w-8">
      <TableCheckBox
        checked={mailPoetConf.actions?.update || false}
        onChange={e => actionHandler(e, 'update')}
        className="wdt-200 mt-4 mr-2"
        value="user_share"
        isInfo={!isPro}
        title={<ProFeatureTitle title={__('Update Subscriber', 'bit-integrations')} />}
        subTitle={
          <ProFeatureSubtitle
            title={__('Update Subscriber', 'bit-integrations')}
            subTitle={__(
              'Update Mailpoet exist Subscriber? First name, last name, and email may not be updated.',
              'bit-integrations'
            )}
            proVersion="2.4.1"
          />
        }
      />
      <TableCheckBox
        checked={mailPoetConf.actions?.send_confirmation_email || false}
        onChange={e => actionHandler(e, 'send_confirmation_email')}
        className="wdt-200 mt-4 mr-2"
        value="user_share"
        isInfo={!isPro}
        title={__('Send Confirmation Email', 'bit-integrations')}
        subTitle={__(
          'Can be used to disable a confirmation email. Otherwise, a confirmation email is sent as described above. It is strongly recommended to keep this option set to checked so that MailPoet settings for sign-up confirmation are respected. Turning it to unchecked might lead that subscriber to be added as unconfirmed.',
          'bit-integrations'
        )}
      />
    </div>
  )
}
