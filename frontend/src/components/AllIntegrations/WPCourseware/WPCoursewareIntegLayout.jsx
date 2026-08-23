// eslint-disable-next-line import/no-extraneous-dependencies
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import { getWPCoursewareCourses } from './WPCoursewareCommonFunc'
import Note from '../../Utilities/Note'
import { create } from 'mutative'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'

export default function WPCoursewareIntegLayout({
  formFields,
  wpCoursewareConf,
  setWPCoursewareConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const inputHandler = ({ target: { name, value } }) => {
    setWPCoursewareConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value
      })
    )

    getWPCoursewareCourses(wpCoursewareConf, setWPCoursewareConf, setIsLoading, setSnackbar)
  }

  const setCourses = val => {
    const newConf = { ...wpCoursewareConf }

    if (val.includes('select_all_course')) {
      newConf.selectedAllCourse = wpCoursewareConf.default.WPCWCourses.filter(
        course => course.id !== 'select_all_course'
      ).map(course => course.id)
    } else {
      delete newConf.selectedAllCourse
    }

    newConf.course = val ? val.split(',') : []
    setWPCoursewareConf({ ...newConf })
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('WP Courseware Actions:', 'bit-integrations')}</b>
        <select
          onChange={e => inputHandler(e)}
          name="action"
          value={wpCoursewareConf.action}
          className="btcd-paper-inp w-5">
          <option value="">{__('Select Action', 'bit-integrations')}</option>
          <option value="enroll">{__('Enroll user in a Course', 'bit-integrations')}</option>
          <option value="unroll">{__('Unroll user in a Course', 'bit-integrations')}</option>
        </select>
      </div>

      {wpCoursewareConf?.action && (
        <div className="mt-4">
          <UserSourceSelect
            conf={wpCoursewareConf}
            setConf={setWPCoursewareConf}
            mapKey="wpCoursewareField"
          />
        </div>
      )}

      {wpCoursewareConf?.action && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('WP Courseware Courses:', 'bit-integrations')}</b>
          <MultiSelect
            defaultValue={wpCoursewareConf?.course}
            className="btcd-paper-drpdwn w-5"
            options={
              wpCoursewareConf?.default?.WPCWCourses &&
              Object.values(wpCoursewareConf.default.WPCWCourses).map(({ id, title }) => ({
                label: title,
                value: id.toString()
              }))
            }
            onChange={val => setCourses(val)}
          />
          <button
            onClick={() =>
              getWPCoursewareCourses(wpCoursewareConf, setWPCoursewareConf, setIsLoading, setSnackbar)
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{
              '--tooltip-txt': `'${__('Refresh WP Courseware Courses', 'bit-integrations')}'`
            }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {wpCoursewareConf?.action && wpCoursewareConf?.userSource === 'email' && (
        <UserEmailFieldMap
          conf={wpCoursewareConf}
          setConf={setWPCoursewareConf}
          formFields={formFields}
          mapKey="wpCoursewareField"
          actionLabel={__('WP Courseware Fields', 'bit-integrations')}
        />
      )}

      <br />
      <br />
      {wpCoursewareConf?.userSource === 'email' ? (
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
