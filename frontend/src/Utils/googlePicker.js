import { getOneClickPicker } from './connectionApi'
import { __ } from './i18nwrap'

const GAPI_SRC = 'https://apis.google.com/js/api.js'

const PICKER_MAX = { width: 1051, height: 650 }
const PICKER_MIN = { width: 566, height: 350 }
const VIEWPORT_GUTTER = 48

let pickerReady

const fitToViewport = (max, min, viewport) => Math.max(min, Math.min(max, viewport - VIEWPORT_GUTTER))

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

const buildView = (picker, kind) =>
  kind === 'folder'
    ? new picker.DocsView(picker.ViewId.FOLDERS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true)
        .setMimeTypes(FOLDER_MIME_TYPE)
        .setMode(picker.DocsViewMode.LIST)
    : new picker.DocsView(picker.ViewId.SPREADSHEETS)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false)
        .setMode(picker.DocsViewMode.LIST)

export const pickFromGoogleDrive = async ({ connectionId, kind, title, onOpen }) => {
  const pickerRes = await getOneClickPicker(connectionId)

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
    new picker.PickerBuilder()
      .addView(buildView(picker, kind))
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
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
          resolve(doc ? { id: doc.id, name: doc.name } : null)
        } else if (data.action === picker.Action.CANCEL) {
          resolve(null)
        }
      })
      .build()
      .setVisible(true)

    onOpen?.()
  })
}
