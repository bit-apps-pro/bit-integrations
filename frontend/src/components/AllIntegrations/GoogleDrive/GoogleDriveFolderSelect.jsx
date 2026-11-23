import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { browseDriveFolders, createDriveFolder, findFolderInDrive } from './GoogleDriveCommonFunc'

const ROOT = { id: 'root', name: __('My Drive', 'bit-integrations') }

const LOCATIONS = [
  { id: 'my-drive', root: ROOT },
  { id: 'shared-with-me', root: { id: '', name: __('Shared with me', 'bit-integrations') } },
  { id: 'shared-drives', root: { id: '', name: __('Shared drives', 'bit-integrations') } }
]

const locationRoot = locationId => LOCATIONS.find(({ id }) => id === locationId).root

const LOCATION_LABELS = {
  'my-drive': __('My Drive', 'bit-integrations'),
  'shared-with-me': __('Shared with me', 'bit-integrations'),
  'shared-drives': __('Shared drives', 'bit-integrations')
}

const FolderIcon = () => (
  <svg className="btcd-folder-icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path
      d="M2 5.5A1.5 1.5 0 0 1 3.5 4h4.09a1.5 1.5 0 0 1 1.06.44L10 5.79h6.5A1.5 1.5 0 0 1 18 7.29v7.21a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5z"
      fill="currentColor"
    />
  </svg>
)

const Chevron = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
    <path d="M7.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
)

const folderLabel = (folderId, foldersList) => {
  if (!folderId) return ''
  if (folderId === ROOT.id) return ROOT.name
  return foldersList?.find(({ id }) => id === folderId)?.name || folderId
}

export default function GoogleDriveFolderSelect({ value, onChange, googleDriveConf }) {
  const [isOpen, setIsOpen] = useState(false)
  const [location, setLocation] = useState('my-drive')
  const [trail, setTrail] = useState([ROOT])
  const [folders, setFolders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [newFolderName, setNewFolderName] = useState(null)
  const [isBusy, setIsBusy] = useState(false)
  const wrapRef = useRef(null)
  const newFolderInputRef = useRef(null)

  const current = trail[trail.length - 1]
  const isVirtualRoot = current.id === ''
  const isOneClick = Boolean(googleDriveConf?.one_click_app)
  const locations = isOneClick ? LOCATIONS.filter(({ id }) => id !== 'shared-drives') : LOCATIONS
  const savedFolders = (googleDriveConf?.foldersList || []).filter(({ id }) => id !== ROOT.id)

  const loadFolders = useCallback(
    async folderId => {
      setIsLoading(true)
      setLoadError('')
      const res = await browseDriveFolders(googleDriveConf, folderId, location)
      setIsLoading(false)

      if (!res?.success) {
        setFolders([])
        setLoadError(
          (typeof res?.data === 'string' && res.data) ||
            __('Folders could not be loaded. Please try again.', 'bit-integrations')
        )
        return
      }

      setFolders(res.data?.folders || [])
    },
    [googleDriveConf, location]
  )

  useEffect(() => {
    if (isOpen) loadFolders(current.id)
  }, [isOpen, current, loadFolders])

  const switchLocation = locationId => {
    setLocation(locationId)
    setTrail([locationRoot(locationId)])
    setNewFolderName(null)
  }

  useEffect(() => {
    if (newFolderName === '') newFolderInputRef.current?.focus()
  }, [newFolderName])

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutside = event => {
      if (!wrapRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = event => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const selectFolder = folder => {
    onChange({ id: folder.id, name: folder.name })
    setIsOpen(false)
  }

  const trailPath = trail.map(({ name }) => name).join('/')

  const handleCreateFolder = async event => {
    event.preventDefault()
    const name = (newFolderName || '').trim()
    if (!name) return

    setIsBusy(true)
    const res = await createDriveFolder(googleDriveConf, current.id, name)
    setIsBusy(false)

    if (!res?.success) {
      toast.error(
        (typeof res?.data === 'string' && res.data) ||
          __('The folder could not be created. Please try again.', 'bit-integrations')
      )
      return
    }

    const folder = res.data.folder
    setNewFolderName(null)
    setFolders(prev => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)))
    toast.success(sprintf(__('Folder "%s" created', 'bit-integrations'), folder.name))
  }

  const handleFindInDrive = async () => {
    setIsBusy(true)
    try {
      const folder = await findFolderInDrive(googleDriveConf, () => setIsBusy(false))
      if (folder) selectFolder(folder)
    } catch (error) {
      toast.error(
        error?.message || __('Google Drive could not be opened. Please try again.', 'bit-integrations')
      )
    } finally {
      setIsBusy(false)
    }
  }

  const openPanel = () => {
    setLocation('my-drive')
    setTrail([ROOT])
    setNewFolderName(null)
    setIsOpen(prev => !prev)
  }

  const label = folderLabel(value, googleDriveConf?.foldersList)

  return (
    <div className="btcd-folder-select" ref={wrapRef}>
      <button
        type="button"
        className="btcd-paper-inp btcd-folder-select-trigger"
        onClick={openPanel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}>
        <span className={label ? '' : 'btcd-folder-select-placeholder'}>
          {label || __('Select Folder', 'bit-integrations')}
        </span>
        <Chevron className="btcd-folder-select-caret" />
      </button>

      {isOpen && (
        <div
          className="btcd-folder-panel"
          role="dialog"
          aria-label={__('Choose a Google Drive folder', 'bit-integrations')}>
          <div
            className="btcd-folder-tabs"
            role="tablist"
            aria-label={__('Drive location', 'bit-integrations')}>
            {locations.map(({ id }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={location === id}
                className="btcd-folder-tab"
                onClick={() => switchLocation(id)}>
                {LOCATION_LABELS[id]}
              </button>
            ))}
          </div>
          <nav className="btcd-folder-trail" aria-label={__('Folder path', 'bit-integrations')}>
            {trail.map((folder, index) => (
              <span key={`${index}-${folder.id}`} className="btcd-folder-trail-item">
                {index > 0 && <Chevron className="btcd-folder-trail-sep" />}
                {index === trail.length - 1 ? (
                  <span className="btcd-folder-trail-current" aria-current="location">
                    {folder.name}
                  </span>
                ) : (
                  <button type="button" onClick={() => setTrail(trail.slice(0, index + 1))}>
                    {folder.name}
                  </button>
                )}
              </span>
            ))}
          </nav>

          <div className="btcd-folder-list" aria-busy={isLoading}>
            {isLoading && (
              <p className="btcd-folder-note">{__('Loading folders…', 'bit-integrations')}</p>
            )}
            {!isLoading && loadError && <p className="btcd-folder-note is-error">{loadError}</p>}
            {!isLoading && !loadError && folders.length === 0 && (
              <p className="btcd-folder-note">
                {isOneClick && isVirtualRoot
                  ? __(
                      'No folders here yet. Use "Find in Google Drive" to pick one.',
                      'bit-integrations'
                    )
                  : isOneClick
                    ? __(
                        'No folders here yet. Create one, or find an existing folder in Google Drive.',
                        'bit-integrations'
                      )
                    : __('No folders here yet.', 'bit-integrations')}
              </p>
            )}
            {!isLoading &&
              folders.map(folder => (
                <button
                  key={folder.id}
                  type="button"
                  className="btcd-folder-row"
                  onClick={() =>
                    setTrail([...trail, { id: folder.id, name: folder.name, path: trailPath }])
                  }>
                  <FolderIcon />
                  <span className="btcd-folder-row-name">{folder.name}</span>
                  <Chevron className="btcd-folder-row-caret" />
                </button>
              ))}

            {!isLoading &&
              isOneClick &&
              location === 'my-drive' &&
              trail.length === 1 &&
              savedFolders.length > 0 && (
                <>
                  <p className="btcd-folder-group">{__('Chosen before', 'bit-integrations')}</p>
                  {savedFolders.map(folder => (
                    <button
                      key={folder.id}
                      type="button"
                      className="btcd-folder-row"
                      onClick={() => selectFolder(folder)}>
                      <FolderIcon />
                      <span className="btcd-folder-row-name">{folder.name}</span>
                    </button>
                  ))}
                </>
              )}
          </div>

          {newFolderName !== null && (
            <form className="btcd-folder-create" onSubmit={handleCreateFolder}>
              <input
                className="btcd-paper-inp"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder={__('New folder name', 'bit-integrations')}
                aria-label={__('New folder name', 'bit-integrations')}
                maxLength={255}
                ref={newFolderInputRef}
              />
              <button
                type="submit"
                className="btcd-folder-btn"
                disabled={isBusy || !newFolderName.trim()}>
                {__('Create', 'bit-integrations')}
              </button>
              <button type="button" className="btcd-folder-link" onClick={() => setNewFolderName(null)}>
                {__('Cancel', 'bit-integrations')}
              </button>
            </form>
          )}

          <div className="btcd-folder-footer">
            <div className="btcd-folder-footer-start">
              {newFolderName === null && !isVirtualRoot && (
                <button
                  type="button"
                  className="btcd-folder-link"
                  onClick={() => setNewFolderName('')}
                  disabled={isBusy}>
                  {__('+ New folder', 'bit-integrations')}
                </button>
              )}
              {isOneClick && (
                <button
                  type="button"
                  className="btcd-folder-link"
                  onClick={handleFindInDrive}
                  disabled={isBusy}>
                  {__('Find in Google Drive', 'bit-integrations')}
                </button>
              )}
            </div>
            {!isVirtualRoot && (
              <button
                type="button"
                className="btcd-folder-btn is-primary"
                onClick={() =>
                  selectFolder(
                    current.id === ROOT.id
                      ? ROOT
                      : { id: current.id, name: [current.path, current.name].join('/') }
                  )
                }
                disabled={isBusy}>
                {sprintf(__('Use "%s"', 'bit-integrations'), current.name)}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
