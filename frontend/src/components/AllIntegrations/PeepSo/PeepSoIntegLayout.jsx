import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './PeepSoCommonFunc'
import PeepSoFieldMap from './PeepSoFieldMap'
import { AddPostFields, ChangeUserRoleFields, FollowUserFields, modules } from './staticData'
import Note from '../../Utilities/Note'

export default function PeepSoIntegLayout({ formFields, peepSoConf, setPeepSoConf, isLoading }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setPeepSoConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'add_post_activity_stream':
            draftConf.peepSoFields = AddPostFields
            break
          case 'change_user_role':
            draftConf.peepSoFields = ChangeUserRoleFields
            break
          case 'follow_user':
            draftConf.peepSoFields = FollowUserFields
            break
          default:
            draftConf.peepSoFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.peepSoFields)
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={peepSoConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: checkIsPro(isPro, action.is_pro) ? false : true
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}

      {peepSoConf?.mainAction && peepSoConf.peepSoFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('PeepSo Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {peepSoConf?.field_map?.map((itm, i) => (
            <PeepSoFieldMap
              key={i}
              i={i}
              field={itm}
              peepSoConf={peepSoConf}
              formFields={formFields}
              setPeepSoConf={setPeepSoConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(peepSoConf.field_map.length, peepSoConf, setPeepSoConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
      {peepSoConf.mainAction === 'change_user_role' && <Note note={note} />}
    </>
  )
}

const note = `
  ${__('For the <b>Change User Role</b> action, use the following values for the <b>PeepSo Role Fields</b>', 'bit-integrations')}:
  <ul>
    <li>${__('Use <b>member</b> for <b>Community Member</b>', 'bit-integrations')}</li>
    <li>${__('Use <b>admin</b> for <b>Community Administrator</b>', 'bit-integrations')}</li>
    <li>${__('Use <b>ban</b> for <b>Banned</b>', 'bit-integrations')}</li>
    <li>${__('Use <b>register</b> for <b>Pending user email verification</b>', 'bit-integrations')}</li>
    <li>${__('Use <b>verified</b> for <b>Pending admin approval</b>', 'bit-integrations')}</li>
  </ul>
  `
