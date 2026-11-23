import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { __, sprintf } from '../../Utils/i18nwrap'

const ROOT = { id: 'root', name: __('My Drive', 'bit-integrations') }

const LOCATIONS = [
  { id: 'my-drive', label: __('My Drive', 'bit-integrations'), root: ROOT },
  {
    id: 'shared-with-me',
    label: __('Shared with me', 'bit-integrations'),
    root: { id: '', name: __('Shared with me', 'bit-integrations') }
  },
  {
    id: 'shared-drives',
    label: __('Shared drives', 'bit-integrations'),
    root: { id: '', name: __('Shared drives', 'bit-integrations') }
  }
]

const locationRoot = locationId => LOCATIONS.find(({ id }) => id === locationId).root

const FolderIcon = () => (
  <svg className="btcd-folder-icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path
      d="M2 5.5A1.5 1.5 0 0 1 3.5 4h4.09a1.5 1.5 0 0 1 1.06.44L10 5.79h6.5A1.5 1.5 0 0 1 18 7.29v7.21a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5z"
      fill="currentColor"
    />
  </svg>
)

const SheetIcon = () => (
  <svg className="btcd-sheet-icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path
      d="M5 2h7l4 4v11.5A1.5 1.5 0 0 1 14.5 19h-9A1.5 1.5 0 0 1 4 17.5v-14A1.5 1.5 0 0 1 5.5 2z"
      fill="currentColor"
    />
    <path d="M7 10h6v5H7zm0 2.5h6M10 10v5" fill="none" stroke="#fff" strokeWidth="1.2" />
  </svg>
)

const Chevron = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
    <path d="M7.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
)

const errorText = (res, fallback) => (typeof res?.data === 'string' && res.data) || fallback

export default function GoogleDriveBrowser({
  mode = 'folder',
  label,
  placeholder,
  isOneClick,
  savedItems = [],
  browse,
  createFolder,
  findInDrive,
  onSelect
}) {
  const isFolderMode = mode === 'folder'
  const [isOpen, setIsOpen] = useState(false)
  const [location, setLocation] = useState('my-drive')
  const [trail, setTrail] = useState([ROOT])
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [newFolderName, setNewFolderName] = useState(null)
  const [isBusy, setIsBusy] = useState(false)
  const wrapRef = useRef(null)
  const newFolderInputRef = useRef(null)
  const browseRef = useRef(browse)
  browseRef.current = browse

  const current = trail[trail.length - 1]
  const isVirtualRoot = current.id === ''
  const locations = isOneClick ? LOCATIONS.filter(({ id }) => id !== 'shared-drives') : LOCATIONS
  const trailPath = trail.map(({ name }) => name).join('/')

  const loadItems = useCallback(
    async folderId => {
      setIsLoading(true)
      setLoadError('')
      const res = await browseRef.current(folderId, location)
      setIsLoading(false)

      if (!res?.success) {
        setItems([])
        setLoadError(
          errorText(res, __('Could not load Google Drive. Please try again.', 'bit-integrations'))
        )
        return
      }

      setItems(res.data?.items || res.data?.folders || [])
    },
    [location]
  )

  useEffect(() => {
    if (isOpen) loadItems(current.id)
  }, [isOpen, current, loadItems])

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

  const select = item => {
    onSelect({ id: item.id, name: item.name })
    setIsOpen(false)
  }

  const openFolder = folder =>
    setTrail([...trail, { id: folder.id, name: folder.name, path: trailPath }])

  const switchLocation = locationId => {
    setLocation(locationId)
    setTrail([locationRoot(locationId)])
    setNewFolderName(null)
  }

  const togglePanel = () => {
    setLocation('my-drive')
    setTrail([ROOT])
    setNewFolderName(null)
    setIsOpen(prev => !prev)
  }

  const handleCreateFolder = async event => {
    event.preventDefault()
    const name = (newFolderName || '').trim()
    if (!name) return

    setIsBusy(true)
    const res = await createFolder(current.id, name)
    setIsBusy(false)

    if (!res?.success) {
      toast.error(
        errorText(res, __('The folder could not be created. Please try again.', 'bit-integrations'))
      )
      return
    }

    const folder = res.data.folder
    setNewFolderName(null)
    setItems(prev => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)))
    toast.success(sprintf(__('Folder "%s" created', 'bit-integrations'), folder.name))
  }

  const handleFindInDrive = async () => {
    setIsBusy(true)
    try {
      const item = await findInDrive(() => setIsBusy(false))
      if (item) select(item)
    } catch (error) {
      toast.error(
        error?.message || __('Google Drive could not be opened. Please try again.', 'bit-integrations')
      )
    } finally {
      setIsBusy(false)
    }
  }

  const emptyText = () => {
    if (!isOneClick) {
      return isFolderMode
        ? __('No folders here yet.', 'bit-integrations')
        : __('No spreadsheets or folders here.', 'bit-integrations')
    }
    if (isFolderMode && !isVirtualRoot) {
      return __(
        'No folders here yet. Create one, or find an existing folder in Google Drive.',
        'bit-integrations'
      )
    }
    return __('Nothing here yet. Use "Find in Google Drive" to pick one.', 'bit-integrations')
  }

  const showSaved = isOneClick && location === 'my-drive' && trail.length === 1 && savedItems.length > 0
  const ItemIcon = isFolderMode ? FolderIcon : SheetIcon

  return (
    <div className="btcd-folder-select" ref={wrapRef}>
      <button
        type="button"
        className="btcd-paper-inp btcd-folder-select-trigger"
        onClick={togglePanel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}>
        <span className={label ? '' : 'btcd-folder-select-placeholder'}>{label || placeholder}</span>
        <Chevron className="btcd-folder-select-caret" />
      </button>

      {isOpen && (
        <div
          className="btcd-folder-panel"
          role="dialog"
          aria-label={
            isFolderMode
              ? __('Choose a Google Drive folder', 'bit-integrations')
              : __('Choose a spreadsheet', 'bit-integrations')
          }>
          <div
            className="btcd-folder-tabs"
            role="tablist"
            aria-label={__('Drive location', 'bit-integrations')}>
            {locations.map(({ id, label: tabLabel }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={location === id}
                className="btcd-folder-tab"
                onClick={() => switchLocation(id)}>
                {tabLabel}
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
            {isLoading && <p className="btcd-folder-note">{__('Loading…', 'bit-integrations')}</p>}
            {!isLoading && loadError && <p className="btcd-folder-note is-error">{loadError}</p>}
            {!isLoading && !loadError && items.length === 0 && (
              <p className="btcd-folder-note">{emptyText()}</p>
            )}
            {!isLoading &&
              items.map(item =>
                item.type === 'spreadsheet' ? (
                  <button
                    key={item.id}
                    type="button"
                    className="btcd-folder-row"
                    onClick={() => select(item)}>
                    <SheetIcon />
                    <span className="btcd-folder-row-name">{item.name}</span>
                  </button>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    className="btcd-folder-row"
                    onClick={() => openFolder(item)}>
                    <FolderIcon />
                    <span className="btcd-folder-row-name">{item.name}</span>
                    <Chevron className="btcd-folder-row-caret" />
                  </button>
                )
              )}

            {!isLoading && showSaved && (
              <>
                <p className="btcd-folder-group">{__('Chosen before', 'bit-integrations')}</p>
                {savedItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className="btcd-folder-row"
                    onClick={() => select(item)}>
                    <ItemIcon />
                    <span className="btcd-folder-row-name">{item.name}</span>
                  </button>
                ))}
              </>
            )}
          </div>

          {isFolderMode && newFolderName !== null && (
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

          {(isOneClick || isFolderMode) && (
            <div className="btcd-folder-footer">
              <div className="btcd-folder-footer-start">
                {isFolderMode && newFolderName === null && !isVirtualRoot && (
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
              {isFolderMode && !isVirtualRoot && (
                <button
                  type="button"
                  className="btcd-folder-btn is-primary"
                  onClick={() =>
                    select(
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
          )}
        </div>
      )}
    </div>
  )
}
