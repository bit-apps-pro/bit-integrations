import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  fetchAllCourse,
  fetchAllLesson,
  fetchAllMembership,
  fetchAllSection
} from './LifterLmsCommonFunc'
import Note from '../../Utilities/Note'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'

export default function LifterLmsIntegLayout({
  formFields,
  handleInput,
  lifterLmsConf,
  setLifterLmsConf,
  isLoading,
  setIsLoading,
  setSnackbar,
  allIntegURL,
  isInfo,
  edit
}) {
  useEffect(() => {
    if (lifterLmsConf.mainAction === '1') {
      fetchAllLesson(lifterLmsConf, setLifterLmsConf, setIsLoading, setSnackbar)
    } else if (lifterLmsConf.mainAction === '2') {
      fetchAllSection(lifterLmsConf, setLifterLmsConf, setIsLoading, setSnackbar)
    } else if (['3', '5', '6'].includes(lifterLmsConf.mainAction)) {
      fetchAllCourse(lifterLmsConf, setLifterLmsConf, setIsLoading, setSnackbar)
    } else if (['4', '7'].includes(lifterLmsConf.mainAction)) {
      fetchAllMembership(lifterLmsConf, setLifterLmsConf, setIsLoading, setSnackbar)
    }
  }, [lifterLmsConf.mainAction])

  const changeHandler = (val, status) => {
    const newConf = { ...lifterLmsConf }
    if (val !== '') {
      newConf[status] = val
    } else {
      delete newConf[status]
    }
    setLifterLmsConf({ ...newConf })
  }
  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="mainAction"
        value={lifterLmsConf.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {lifterLmsConf.allActions &&
          lifterLmsConf.allActions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      <br />
      {lifterLmsConf.mainAction === '1' && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Lesson:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            singleSelect
            defaultValue={lifterLmsConf?.lessonId}
            options={
              lifterLmsConf?.default?.allLesson &&
              lifterLmsConf.default.allLesson.map(item => ({
                label: item.lesson_title,
                value: item.lesson_id.toString()
              }))
            }
            onChange={val => changeHandler(val, 'lessonId')}
          />
          <button
            onClick={() => fetchAllLesson(lifterLmsConf, setLifterLmsConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch lesson list', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {lifterLmsConf.mainAction === '2' && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select a Section:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            singleSelect
            defaultValue={lifterLmsConf?.sectionId}
            options={
              lifterLmsConf?.default?.allSection &&
              lifterLmsConf.default.allSection.map(item => ({
                label: item.section_title,
                value: item.section_id.toString()
              }))
            }
            onChange={val => changeHandler(val, 'sectionId')}
          />
          <button
            onClick={() => fetchAllSection(lifterLmsConf, setLifterLmsConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch section list', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {['3', '5', '6'].includes(lifterLmsConf.mainAction) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select a Course:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            singleSelect
            defaultValue={lifterLmsConf?.courseId}
            options={
              lifterLmsConf?.default?.allCourse &&
              lifterLmsConf.default.allCourse.map(item => ({
                label: item.post_title,
                value: item.ID.toString()
              }))
            }
            onChange={val => changeHandler(val, 'courseId')}
          />
          <button
            onClick={() => fetchAllCourse(lifterLmsConf, setLifterLmsConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch course list', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      {['4', '7'].includes(lifterLmsConf.mainAction) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select a membership:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            singleSelect
            defaultValue={lifterLmsConf?.membershipId}
            options={
              lifterLmsConf?.default?.allMembership &&
              lifterLmsConf.default.allMembership.map(item => ({
                label: item.post_title,
                value: item.ID.toString()
              }))
            }
            onChange={val => changeHandler(val, 'membershipId')}
          />
          <button
            onClick={() =>
              fetchAllMembership(lifterLmsConf, setLifterLmsConf, setIsLoading, setSnackbar)
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch membership list', 'bit-integrations')}'` }}
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
      {lifterLmsConf?.mainAction && (
        <>
          <UserSourceSelect conf={lifterLmsConf} setConf={setLifterLmsConf} />
          {lifterLmsConf?.userSource === 'email' && (
            <UserEmailFieldMap
              conf={lifterLmsConf}
              setConf={setLifterLmsConf}
              formFields={formFields}
              actionLabel={__('LifterLMS Fields', 'bit-integrations')}
            />
          )}
          <br />
        </>
      )}
      {lifterLmsConf?.userSource === 'email' ? (
        <Note
          note={__(
            'This action runs for the user matching the mapped email. The user must already exist on your site, otherwise the action fails.',
            'bit-integrations'
          )}
        />
      ) : (
        <Note note={__('This integration will only work for logged-in users.', 'bit-integrations')} />
      )}
    </>
  )
}
