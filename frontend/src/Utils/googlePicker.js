const GAPI_SRC = 'https://apis.google.com/js/api.js'

let pickerReady

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

export const pickGoogleSpreadsheet = async ({ accessToken, apiKey, appId, title }) => {
  await loadPicker()

  const { picker } = window.google

  return new Promise(resolve => {
    const view = new picker.DocsView(picker.ViewId.SPREADSHEETS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)
      .setMode(picker.DocsViewMode.LIST)

    new picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setAppId(appId)
      .setOrigin(`${window.location.protocol}//${window.location.host}`)
      .setTitle(title)
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
  })
}
