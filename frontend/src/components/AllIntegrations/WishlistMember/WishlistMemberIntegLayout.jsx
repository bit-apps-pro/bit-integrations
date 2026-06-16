import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap, generateMappedField, refreshLevels } from './WishlistMemberCommonFunc'
import WishlistMemberFieldMap from './WishlistMemberFieldMap'
import { actionFieldsMap, modules } from './staticData'

export default function WishlistMemberIntegLayout({
  formFields,
  wishlistMemberConf,
  setWishlistMemberConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setChange = (value, name) => {
    setWishlistMemberConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value

        if (name === 'action') {
          draftConf.wishlistFields = actionFieldsMap[value] || []
          draftConf.field_map = generateMappedField(draftConf.wishlistFields)
        }

        if (name === 'action' && value === 'create_member') {
          refreshLevels(setWishlistMemberConf, setIsLoading, setSnackbar)
        }
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          defaultValue={wishlistMemberConf?.action}
          className="mt-2 w-5"
          onChange={val => setChange(val, 'action')}
          options={modules?.map(module => ({
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.value,
            disabled: checkIsPro(isPro, module.is_pro) ? false : true
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {['create_member', 'add_member_to_level', 'remove_member_from_level'].includes(
        wishlistMemberConf?.action
      ) && (
          <>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Membership Levels:', 'bit-integrations')}</b>
              <MultiSelect
                defaultValue={wishlistMemberConf?.level_id || ''}
                className="btcd-paper-drpdwn w-5"
                options={wishlistMemberConf?.levels?.map(lvl => ({
                  label: lvl.label,
                  value: lvl.value.toString()
                }))}
                onChange={value => setChange(value, 'level_id')}
                closeOnSelect
                singleSelect
              />
              <button
                onClick={() => refreshLevels(setWishlistMemberConf, setIsLoading, setSnackbar)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Membership Levels', 'bit-integrations')}'` }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            </div>
            <br />
          </>
        )}

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
      {wishlistMemberConf?.action && !isLoading && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WishlistMember Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {wishlistMemberConf.field_map.map((itm, i) => (
            <WishlistMemberFieldMap
              key={`wishlist-m-${i + 9}`}
              i={i}
              field={itm}
              wishlistMemberConf={wishlistMemberConf}
              wishlistFields={wishlistMemberConf?.wishlistFields}
              formFields={formFields}
              setWishlistMemberConf={setWishlistMemberConf}
            />
          ))}

          {wishlistMemberConf?.wishlistFields?.length > 1 && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() => addFieldMap(wishlistMemberConf.field_map.length, setWishlistMemberConf)}
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
