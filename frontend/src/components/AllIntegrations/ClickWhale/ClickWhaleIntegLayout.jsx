import { useEffect, useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import ClickWhaleActions from './ClickWhaleActions'
import { generateMappedField, listsForAction, refreshClickWhaleAuthors } from './ClickWhaleCommonFunc'
import ClickWhaleFieldMap from './ClickWhaleFieldMap'
import {
  CreateLinkFields,
  DeleteLinkFields,
  hasUtilities,
  modules,
  needsAuthor,
  UpdateLinkFields
} from './staticData'

const fieldsByAction = {
  create_link: CreateLinkFields,
  update_link: UpdateLinkFields,
  delete_link: DeleteLinkFields
}

export default function ClickWhaleIntegLayout({
  formID,
  formFields,
  clickWhaleConf,
  setClickWhaleConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  // Authors live here rather than on conf so they are not persisted into
  // flow_details every time the flow is saved.
  const [lists, setLists] = useState({})

  const mainAction = clickWhaleConf?.mainAction

  // Populate the dropdown for whatever action is already selected. Matters most on
  // the edit screen, where handleMainAction never runs.
  useEffect(() => {
    if (listsForAction(mainAction).length > 0) {
      refreshClickWhaleAuthors(setLists, setIsLoading)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainAction])

  const setField = (key, val) =>
    setClickWhaleConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
      })
    )

  const handleMainAction = value => {
    setClickWhaleConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.clickWhaleFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.clickWhaleFields)
      })
    )
    // The effect above fetches the lists this action needs.
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsAuthor.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Author:', 'bit-integrations')}</b>
            <MultiSelect
              // MultiSelect matches defaultValue against its options in an effect keyed
              // on defaultValue alone, never on the options. Authors are fetched after
              // mount, so without remounting once they land, a saved author would match
              // nothing and render blank while conf still held the id.
              key={`selectedAuthor-${lists?.authors?.length ?? 0}`}
              title="selectedAuthor"
              defaultValue={clickWhaleConf?.selectedAuthor ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                Array.isArray(lists?.authors)
                  ? lists.authors.map(author => ({
                      label: author.label,
                      value: author.value?.toString()
                    }))
                  : []
              }
              onChange={val => setField('selectedAuthor', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshClickWhaleAuthors(setLists, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Authors', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
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

      {mainAction && clickWhaleConf.clickWhaleFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('ClickWhale Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {clickWhaleConf?.field_map?.map((itm, i) => (
            <ClickWhaleFieldMap
              key={`clickwhale-m-${i + 9}`}
              i={i}
              field={itm}
              clickWhaleConf={clickWhaleConf}
              formFields={formFields}
              setClickWhaleConf={setClickWhaleConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(clickWhaleConf.field_map.length, clickWhaleConf, setClickWhaleConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction === 'create_link' && (
        <Note
          note={__(
            'Leave Slug unmapped to derive it from the Title; a slug already in use is rejected. Pick an Author to set the owner — front-end triggers have no logged-in user, so the link would otherwise be left unassigned.',
            'bit-integrations'
          )}
        />
      )}

      {mainAction === 'update_link' && (
        <Note
          note={__(
            'Only mapped fields are changed — anything left unmapped keeps its stored value.',
            'bit-integrations'
          )}
        />
      )}

      {hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <ClickWhaleActions clickWhaleConf={clickWhaleConf} setClickWhaleConf={setClickWhaleConf} />
        </div>
      )}
    </>
  )
}
