import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './CreatorLmsCommonFunc'
import CreatorLmsFieldMap from './CreatorLmsFieldMap'
import {
  courseStatusOptions,
  CreateCourseFields,
  CreateStudentFields,
  EnrollUserInCourseFields,
  MarkLessonCompletedFields,
  modules,
  UpdateStudentFields
} from './staticData'

export default function CreatorLmsIntegLayout({
  formID,
  formFields,
  creatorLmsConf,
  setCreatorLmsConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const appConfig = useRecoilValue($appConfigState)
  const { isPro } = appConfig

  const handleMainAction = value => {
    setCreatorLmsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.courseStatus = null

        switch (value) {
          case 'create_student':
            draftConf.creatorLmsFields = CreateStudentFields
            break
          case 'update_student_data':
            draftConf.creatorLmsFields = UpdateStudentFields
            break
          case 'enroll_user_in_course':
            draftConf.creatorLmsFields = EnrollUserInCourseFields
            break
          case 'create_course':
            draftConf.creatorLmsFields = CreateCourseFields
            break
          case 'mark_lesson_completed':
            draftConf.creatorLmsFields = MarkLessonCompletedFields
            break
          default:
            draftConf.creatorLmsFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.creatorLmsFields)
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
          defaultValue={creatorLmsConf?.mainAction ?? null}
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

      {creatorLmsConf?.mainAction === 'create_course' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Course Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="courseStatus"
              defaultValue={creatorLmsConf?.courseStatus ?? 'draft'}
              className="btcd-paper-drpdwn w-5"
              options={courseStatusOptions}
              onChange={val =>
                setCreatorLmsConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.courseStatus = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
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

      {creatorLmsConf?.mainAction &&
        creatorLmsConf.creatorLmsFields &&
        creatorLmsConf.creatorLmsFields.length > 0 && (
          <div className="mt-4">
            <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
            <div className="btcd-hr mt-1" />
            <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
              <div className="txt-dp">
                <b>{__('Form Fields', 'bit-integrations')}</b>
              </div>
              <div className="txt-dp">
                <b>{__('Creator LMS Fields', 'bit-integrations')}</b>
              </div>
            </div>

            {creatorLmsConf?.field_map?.map((itm, i) => (
              <CreatorLmsFieldMap
                key={`creator-lms-m-${i + 9}`}
                i={i}
                field={itm}
                creatorLmsConf={creatorLmsConf}
                formFields={formFields}
                setCreatorLmsConf={setCreatorLmsConf}
              />
            ))}
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(creatorLmsConf.field_map.length, creatorLmsConf, setCreatorLmsConf)
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
            <br />
          </div>
        )}
    </>
  )
}
