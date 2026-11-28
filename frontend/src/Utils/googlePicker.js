import { getGooglePicker } from './connectionApi'
import { __ } from './i18nwrap'

const GAPI_SRC = 'https://apis.google.com/js/api.js'

const PICKER_MAX = { width: 1051, height: 650 }
const PICKER_MIN = { width: 566, height: 350 }
const VIEWPORT_GUTTER = 48

const GOOGLE_REGIONAL_LOCALES = ['en-GB', 'es-419', 'fr-CA', 'pt-BR', 'pt-PT', 'zh-CN', 'zh-HK', 'zh-TW']

let pickerReady

const fitToViewport = (max, min, viewport) => Math.max(min, Math.min(max, viewport - VIEWPORT_GUTTER))

const pickerLocale = () => {
  const lang = (document.documentElement.lang || '').replace('_', '-')
  return GOOGLE_REGIONAL_LOCALES.includes(lang) ? lang : lang.split('-')[0]
}

const loadGapi = () =>
  new Promise((resolve, reject) => {
    if (window.gapi?.load) {
      resolve(window.gapi)
      return
    }

    const script = document.createElement('script')
    script.src = GAPI_SRC
    script.async = true
    script.onload = () => resolve(window.gapi)
    script.onerror = () => reject(new Error('Google API script failed to load'))
    document.head.appendChild(script)
  })

const loadPicker = () => {
  if (!pickerReady) {
    pickerReady = loadGapi()
      .then(
        gapi =>
          new Promise((resolve, reject) => {
            gapi.load('picker', { callback: resolve, onerror: reject })
          })
      )
      .catch(error => {
        pickerReady = undefined
        throw error
      })
  }

  return pickerReady
}

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder'
const SPREADSHEET_MIME_TYPE = 'application/vnd.google-apps.spreadsheet'

const buildView = (picker, kind, { sharedDrives = false, folder } = {}) => {
  const isFolderKind = kind === 'folder'
  const mimeType = isFolderKind ? FOLDER_MIME_TYPE : SPREADSHEET_MIME_TYPE
  let view

  if (folder) {
    view = new picker.DocsView(picker.ViewId.DOCS).setParent(folder.id).setLabel(folder.name)
  } else if (isFolderKind) {
    view = new picker.DocsView(picker.ViewId.FOLDERS)
  } else {
    view = new picker.DocsView(picker.ViewId.SPREADSHEETS)
  }

  view
    .setMimeTypes(mimeType)
    .setSelectFolderEnabled(isFolderKind)
    .setIncludeFolders(true)
    .setMode(picker.DocsViewMode.LIST)

  return sharedDrives ? view.setEnableDrives(true) : view
}

export const pickFromGoogleDrive = async ({ connectionId, kind, title, folder, onOpen }) => {
  const pickerRes = await getGooglePicker(connectionId)

  if (!pickerRes?.success) {
    throw new Error(
      (typeof pickerRes?.data === 'string' && pickerRes.data) ||
        __('Google Drive picker is not available right now', 'bit-integrations')
    )
  }

  const { access_token: accessToken, api_key: apiKey, app_id: appId } = pickerRes.data

  await loadPicker()

  const { picker } = window.google

  return new Promise(resolve => {
    let pickerInstance
    const finish = item => {
      resolve(item)
      setTimeout(() => pickerInstance?.dispose())
    }
    const builder = new picker.PickerBuilder()
    if (apiKey) builder.setDeveloperKey(apiKey)
    const locale = pickerLocale()
    if (locale) builder.setLocale(locale)

    if (folder) builder.addView(buildView(picker, kind, { folder }))

    builder
      .addView(buildView(picker, kind))
      .addView(buildView(picker, kind, { sharedDrives: true }))
      .enableFeature(picker.Feature.SUPPORT_DRIVES)
      .setOAuthToken(accessToken)
      .setAppId(appId)
      .setOrigin(`${window.location.protocol}//${window.location.host}`)
      .setTitle(title)
      .setSize(
        fitToViewport(PICKER_MAX.width, PICKER_MIN.width, window.innerWidth),
        fitToViewport(PICKER_MAX.height, PICKER_MIN.height, window.innerHeight)
      )
      .setCallback(data => {
        if (data.action === picker.Action.PICKED) {
          const [doc] = data.docs || []
          finish(doc ? { id: doc.id, name: doc.name } : null)
        } else if (data.action === picker.Action.CANCEL) {
          finish(null)
        }
      })

    pickerInstance = builder.build()
    pickerInstance.setVisible(true)

    onOpen?.()
  })
}
