import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  fetchAllAchievementByType,
  fetchAllAchievementType,
  fetchAllPointType,
  fetchAllRankByType,
  fetchAllRankType
} from './GamiPressCommonFunc'
import GamiPressFieldMap from './GamiPressFieldMap'
import Note from '../../Utilities/Note'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'

export default function GamiPressIntegLayout({
  formFields,
  handleInput,
  gamiPressConf,
  setGamiPressConf,
  isLoading,
  setIsLoading,
  setSnackbar,
  allIntegURL,
  isInfo,
  edit
}) {
  useEffect(() => {
    if (['1', '4'].includes(gamiPressConf.mainAction)) {
      fetchAllRankType(gamiPressConf, setGamiPressConf, setIsLoading, setSnackbar)
    }
    if (['2', '5'].includes(gamiPressConf.mainAction)) {
      fetchAllAchievementType(gamiPressConf, setGamiPressConf, setIsLoading, setSnackbar)
    }
    if (['3', '6'].includes(gamiPressConf.mainAction)) {
      fetchAllPointType(gamiPressConf, setGamiPressConf, setIsLoading, setSnackbar)
    }
  }, [gamiPressConf.mainAction])

  const changeHandler = (val, status) => {
    const newConf = { ...gamiPressConf }
    newConf[status] = val

    if (status === 'rankType') {
      fetchAllRankByType(newConf, setGamiPressConf, setIsLoading, setSnackbar)
    }
    if (status === 'selectedAchievementType') {
      fetchAllAchievementByType(newConf, setGamiPressConf, setIsLoading, setSnackbar)
    }

    setGamiPressConf({ ...newConf })
  }
  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="mainAction"
        value={gamiPressConf.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {gamiPressConf.allActions &&
          gamiPressConf.allActions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      <br />
      {['1', '4'].includes(gamiPressConf.mainAction) && (
        <>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Rank Type:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={gamiPressConf?.rankType}
              options={
                gamiPressConf?.default?.allRankTypes &&
                gamiPressConf.default.allRankTypes.map(item => ({
                  label: item.post_title,
                  value: item.post_name.toString()
                }))
              }
              singleSelect
              onChange={val => changeHandler(val, 'rankType')}
            />
            <button
              onClick={() =>
                fetchAllRankType(gamiPressConf, setGamiPressConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Rank Type List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>

          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Rank:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={gamiPressConf?.selectedRank}
              options={
                gamiPressConf?.default?.allRanks &&
                gamiPressConf.default.allRanks.map(rank => ({
                  label: rank.post_title,
                  value: rank.ID.toString()
                }))
              }
              singleSelect
              onChange={val => changeHandler(val, 'selectedRank')}
            />
            <button
              onClick={() =>
                fetchAllRankByType(gamiPressConf, setGamiPressConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Rank', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {['2', '5'].includes(gamiPressConf.mainAction) && (
        <>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Achievement Type:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={gamiPressConf?.selectedAchievementType}
              options={
                gamiPressConf?.default?.allAchievementTypes &&
                gamiPressConf.default.allAchievementTypes.map(item => ({
                  label: item.post_title,
                  value: item.post_name.toString()
                }))
              }
              singleSelect
              onChange={val => changeHandler(val, 'selectedAchievementType')}
            />
            <button
              onClick={() =>
                fetchAllAchievementType(gamiPressConf, setGamiPressConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{
                '--tooltip-txt': `'${__('Fetch achievement type list', 'bit-integrations')}'`
              }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>

          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Achievement:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={gamiPressConf?.selectedAchievement}
              options={
                gamiPressConf?.default?.allAchievements &&
                gamiPressConf.default.allAchievements.map(rank => ({
                  label: rank.post_title,
                  value: rank.ID.toString()
                }))
              }
              singleSelect
              onChange={val => changeHandler(val, 'selectedAchievement')}
            />
            <button
              onClick={() =>
                fetchAllAchievementByType(gamiPressConf, setGamiPressConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Achievement', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {['3', '6'].includes(gamiPressConf.mainAction) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Enter Point:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={gamiPressConf?.selectedPointType}
            options={
              gamiPressConf?.default?.allPointTypes &&
              gamiPressConf.default.allPointTypes.map(item => ({
                label: item.post_title,
                value: item.post_name.toString()
              }))
            }
            singleSelect
            onChange={val => changeHandler(val, 'selectedPointType')}
          />
          <button
            onClick={() => fetchAllPointType(gamiPressConf, setGamiPressConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch point type', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      <br />
      <br />
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

      {['3', '6'].includes(gamiPressConf.mainAction) && (
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
              <b>{__('GamiPress Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {gamiPressConf.field_map.map((itm, i) => (
            <GamiPressFieldMap
              key={`dash-m-${i + 9}`}
              i={i}
              field={itm}
              gamiPressConf={gamiPressConf}
              formFields={formFields}
              setGamiPressConf={setGamiPressConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(gamiPressConf.field_map.length, gamiPressConf, setGamiPressConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>

          <br />
          <br />
        </>
      )}
      <br />
      {gamiPressConf?.mainAction && (
        <>
          <br />
          <UserSourceSelect conf={gamiPressConf} setConf={setGamiPressConf} />
          {gamiPressConf?.userSource === 'email' && (
            <UserEmailFieldMap
              conf={gamiPressConf}
              setConf={setGamiPressConf}
              formFields={formFields}
              actionLabel={__('GamiPress Fields', 'bit-integrations')}
            />
          )}
          <br />
        </>
      )}
      {gamiPressConf?.userSource === 'email' ? (
        <Note
          note={__(
            'This action runs for the user matching the mapped email. The user must already exist on your site, otherwise the action fails.',
            'bit-integrations'
          )}
        />
      ) : (
        <Note note={__('Some integrations will only work for logged-in users.', 'bit-integrations')} />
      )}
    </>
  )
}
