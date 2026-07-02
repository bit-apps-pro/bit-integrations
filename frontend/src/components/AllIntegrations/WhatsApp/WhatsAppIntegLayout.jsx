import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import TinyMCE from '../../Utilities/TinyMCE'
import { addFieldMap, generateMappedField, getallTemplates } from './WhatsAppCommonFunc'
import WhatsAppFieldMap from './WhatsAppFieldMap'
import Note from '../../Utilities/Note'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'

export default function WhatsAppIntegLayout({
  formFields,
  whatsAppConf,
  setWhatsAppConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const { id } = useParams()
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setMessageBody = val => {
    const newConf = { ...whatsAppConf }
    newConf.body = val
    setWhatsAppConf(newConf)
  }

  const setChange = (value, name) => {
    setWhatsAppConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value

        if (isPro) {
          if (name === 'messageType' && value === 'text') {
            draftConf['taskNote'] = textMsgNote
          } else if (name === 'messageType' && value === 'media') {
            draftConf['taskNote'] = textMediaNote
            draftConf['media_field_map'] = [{ formField: '', whatsAppFormField: '' }]
            draftConf['media_fields'] = [
              { key: 'caption', label: 'Caption', required: false },
              { key: 'filename', label: 'FileName', required: false }
            ]
          } else if (name === 'messageType' && value === 'contact') {
            draftConf['taskNote'] = textMsgNote
            draftConf['contact_field_map'] = generateMappedField(contactFields)
            draftConf['contact_fields'] = contactFields
          } else if (name === 'messageType') {
            delete draftConf?.taskNote
          }
        }
      })
    )

    if (name === 'messageType' && value === 'template') {
      getallTemplates(whatsAppConf, setWhatsAppConf, setIsLoading, setSnackbar)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Message Type:', 'bit-integrations')}</b>
        <MultiSelect
          defaultValue={whatsAppConf?.messageType}
          className="mt-2 w-5"
          onChange={val => setChange(val, 'messageType')}
          options={whatsAppConf?.messageTypes?.map(messageType => ({
            label: checkIsPro(isPro, messageType.is_pro)
              ? messageType.label
              : getProLabel(messageType.label),
            value: messageType.name,
            disabled: checkIsPro(isPro, messageType.is_pro) ? false : true
          }))}
          singleSelect
          closeOnSelect
        />
      </div>
      {whatsAppConf.messageType === 'template' && whatsAppConf?.allTemplates && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Template:', 'bit-integrations')}</b>
            <MultiSelect
              defaultValue={whatsAppConf?.templateName}
              className="mt-2 w-5"
              onChange={val => setChange(val, 'templateName')}
              options={whatsAppConf?.allTemplates?.map(templateName => ({
                label: templateName,
                value: templateName
              }))}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => getallTemplates(whatsAppConf, setWhatsAppConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Template', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {whatsAppConf.messageType === 'media' && isPro && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select upload fields:', 'bit-integrations')}</b>
            <MultiSelect
              defaultValue={whatsAppConf?.upload_field}
              className="mt-2 w-5"
              onChange={val => setChange(val, 'upload_field')}
              options={formFields
                .filter(itm => itm.type === 'file')
                .map(itm => ({ label: itm.label, value: itm.name }))}
              singleSelect
              closeOnSelect
            />
          </div>
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select type of media:', 'bit-integrations')}</b>
            <MultiSelect
              defaultValue={whatsAppConf?.mediaType}
              className="mt-2 w-5"
              onChange={val => setChange(val, 'mediaType')}
              options={whatsAppConf?.mediaTypes?.map(type => ({ label: type, value: type }))}
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
      <br />
      <div className="mt-5">
        <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
        <div className="txt-dp">
          <b>{__('Form Fields', 'bit-integrations')}</b>
        </div>
        <div className="txt-dp">
          <b>{__('WhatsApp Fields', 'bit-integrations')}</b>
        </div>
      </div>
      <br />

      {whatsAppConf?.field_map.map((itm, i) => (
        <WhatsAppFieldMap
          key={`rp-m-${i + 9}`}
          i={i}
          field={itm}
          whatsAppConf={whatsAppConf}
          whatsAppFields={whatsAppConf.whatsAppFields}
          formFields={formFields}
          setWhatsAppConf={setWhatsAppConf}
          setSnackbar={setSnackbar}
        />
      ))}

      {whatsAppConf.messageType === 'media' && isPro && whatsAppConf?.media_fields && (
        <>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Media Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WhatsApp Fields', 'bit-integrations')}</b>
            </div>
          </div>
          <br />

          {whatsAppConf?.media_field_map?.map((itm, i) => (
            <WhatsAppFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              whatsAppConf={whatsAppConf}
              whatsAppFields={whatsAppConf.media_fields}
              formFields={formFields}
              setWhatsAppConf={setWhatsAppConf}
              setSnackbar={setSnackbar}
              mapKey="media_field_map"
            />
          ))}
        </>
      )}

      {whatsAppConf.messageType === 'contact' && isPro && whatsAppConf?.contact_fields && (
        <>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Contact Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WhatsApp Fields', 'bit-integrations')}</b>
            </div>
          </div>
          <br />

          {whatsAppConf?.contact_field_map?.map((itm, i) => (
            <WhatsAppFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              whatsAppConf={whatsAppConf}
              whatsAppFields={whatsAppConf.contact_fields}
              formFields={formFields}
              setWhatsAppConf={setWhatsAppConf}
              setSnackbar={setSnackbar}
              mapKey="contact_field_map"
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  whatsAppConf.contact_field_map.length,
                  whatsAppConf,
                  setWhatsAppConf,
                  'contact_field_map'
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}

      {whatsAppConf?.messageType === 'text' && isPro && (
        <div>
          <b className="wdt-200 d-in-b mr-16 mb-4 mt-4">{__('Message:', 'bit-integrations')}</b>
          <TinyMCE
            formFields={formFields}
            id={`whatsapp-message-${id}`}
            value={whatsAppConf.body}
            onChangeHandler={setMessageBody}
            width="100%"
            toolbarMnu="bold italic underline strikethrough | link | code | addFormField | toggleCode"
          />
        </div>
      )}
      <br />
      {whatsAppConf?.taskNote && <Note note={whatsAppConf?.taskNote} />}
    </>
  )
}

const textMsgNote = `<p>${__(
  'To ensure successful message delivery using the WhatsApp Business API:',
  'bit-integrations'
)}</p>
            <ul>
                <li><strong>${__(
                  'The conversation must be initiated by the user.',
                  'bit-integrations'
                )}</strong></li>
                <li>${__(
                  "To begin, <strong>send a message from your WhatsApp number to the recipient's number.</strong>",
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Once the user has started the conversation, you can continue to communicate with the recipient normally.',
                  'bit-integrations'
                )}</li>
            </ul>`

const textMediaNote = `<p>${__(
  'To ensure successful message delivery using the WhatsApp Business API:',
  'bit-integrations'
)}</p>
            <ul>
                <li><strong>${__(
                  'The conversation must be initiated by the user.',
                  'bit-integrations'
                )}</strong></li>
                <li>${__(
                  "To begin, <strong>send a message from your WhatsApp number to the recipient's number.</strong>",
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Once the user has started the conversation, you can continue to communicate with the recipient normally.',
                  'bit-integrations'
                )}</li>
            </ul>
            <h5>${__('Caption', 'bit-integrations')}</h5>
            <ul>
                <li>${__(
                  'Do not use with <strong>audio</strong> or <strong>sticker</strong> media.',
                  'bit-integrations'
                )}</li>
                <li>${__('Media asset <strong>caption</strong>.', 'bit-integrations')}</li>
                <li>${__(
                  '<strong>Captions</strong> are currently not supported for <strong>document</strong> media',
                  'bit-integrations'
                )}</li>
            </ul>
            <h5>${__('FileName', 'bit-integrations')}</h5>
            <ul>
                <li>${__('Use only with <strong>document media</strong>.', 'bit-integrations')}</li>
                <li>${__(
                  'Describes the <strong>FileName</strong> for the specific <strong>document</strong>.',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'The extension of the filename will specify what format the document is displayed as in WhatsApp.',
                  'bit-integrations'
                )}</li>
            </ul>`

const contactFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'middle_name', label: __('Middle Name', 'bit-integrations'), required: false },
  { key: 'suffix', label: __('Suffix', 'bit-integrations'), required: false },
  { key: 'prefix', label: __('Prefix', 'bit-integrations'), required: false },
  { key: 'birthday', label: __('Birthday (YEAR_MONTH_DAY)', 'bit-integrations'), required: false },
  { key: 'company', label: __('Company', 'bit-integrations'), required: false },
  { key: 'department', label: __('Department', 'bit-integrations'), required: false },
  { key: 'title', label: __('Business title', 'bit-integrations'), required: false },
  { key: 'HOME_email', label: __('Email (Home)', 'bit-integrations'), required: false },
  { key: 'WORK_email', label: __('Email (Work)', 'bit-integrations'), required: false },
  { key: 'CELL_phone', label: __('Phone Number (Cell)', 'bit-integrations'), required: false },
  { key: 'MAIN_phone', label: __('Phone Number (Main)', 'bit-integrations'), required: false },
  { key: 'IPHONE_phone', label: __('Phone Number (IPhone)', 'bit-integrations'), required: false },
  { key: 'HOME_phone', label: __('Phone Number (Home)', 'bit-integrations'), required: false },
  { key: 'WORK_phone', label: __('Phone Number (Work)', 'bit-integrations'), required: false },
  { key: 'HOME_street', label: __('Street (Home)', 'bit-integrations'), required: false },
  { key: 'HOME_city', label: __('City (Home)', 'bit-integrations'), required: false },
  { key: 'HOME_state', label: __('State (Home)', 'bit-integrations'), required: false },
  { key: 'HOME_zip', label: __('Zip (Home)', 'bit-integrations'), required: false },
  { key: 'HOME_country', label: __('Country (Home)', 'bit-integrations'), required: false },
  {
    key: 'HOME_country_code',
    label: __('Country Code (Home)', 'bit-integrations'),
    required: false
  },
  { key: 'WORK_street', label: __('Street (Work)', 'bit-integrations'), required: false },
  { key: 'WORK_city', label: __('City (Work)', 'bit-integrations'), required: false },
  { key: 'WORK_state', label: __('State (Work)', 'bit-integrations'), required: false },
  { key: 'WORK_zip', label: __('Zip (Work)', 'bit-integrations'), required: false },
  { key: 'WORK_country', label: __('Country (Work)', 'bit-integrations'), required: false },
  {
    key: 'WORK_country_code',
    label: __('Country Code (Work)', 'bit-integrations'),
    required: false
  }
]
