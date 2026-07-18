import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_media', label: __('Create Media', 'bit-integrations'), is_pro: true },
  { name: 'update_media', label: __('Update Media', 'bit-integrations'), is_pro: true },
  { name: 'trash_media', label: __('Trash Media', 'bit-integrations'), is_pro: true },
  { name: 'restore_media', label: __('Restore Media', 'bit-integrations'), is_pro: true },
  { name: 'delete_media', label: __('Delete Media (Permanently)', 'bit-integrations'), is_pro: true },
  { name: 'change_media_status', label: __('Change Media Status', 'bit-integrations'), is_pro: true },
  { name: 'create_tag', label: __('Create Tag', 'bit-integrations'), is_pro: true },
  { name: 'rename_tag', label: __('Rename Tag', 'bit-integrations'), is_pro: true },
  { name: 'delete_tag', label: __('Delete Tag', 'bit-integrations'), is_pro: true },
  { name: 'set_media_tags', label: __('Set Media Tags', 'bit-integrations'), is_pro: true },
  { name: 'add_media_tags', label: __('Add Tags to Media', 'bit-integrations'), is_pro: true },
  { name: 'remove_media_tags', label: __('Remove Tags from Media', 'bit-integrations'), is_pro: true },
  { name: 'create_playlist', label: __('Create Playlist', 'bit-integrations'), is_pro: true },
  { name: 'update_playlist', label: __('Update Playlist', 'bit-integrations'), is_pro: true },
  { name: 'trash_playlist', label: __('Trash Playlist', 'bit-integrations'), is_pro: true },
  { name: 'restore_playlist', label: __('Restore Playlist', 'bit-integrations'), is_pro: true },
  { name: 'delete_playlist', label: __('Delete Playlist (Permanently)', 'bit-integrations'), is_pro: true },
  { name: 'change_playlist_status', label: __('Change Playlist Status', 'bit-integrations'), is_pro: true },
  { name: 'add_media_to_playlist', label: __('Add Media to Playlist', 'bit-integrations'), is_pro: true },
  { name: 'remove_media_from_playlist', label: __('Remove Media from Playlist', 'bit-integrations'), is_pro: true },
  { name: 'create_email_submission', label: __('Create Email Submission', 'bit-integrations'), is_pro: true },
  { name: 'subscribe_email_to_providers', label: __('Subscribe Email to Providers', 'bit-integrations'), is_pro: true },
  { name: 'record_watch_progression', label: __('Record Watch Progression', 'bit-integrations'), is_pro: true },
  { name: 'record_visit', label: __('Record Visit', 'bit-integrations'), is_pro: true },
  { name: 'save_preset', label: __('Save Preset', 'bit-integrations'), is_pro: true },
  { name: 'delete_preset', label: __('Delete Preset', 'bit-integrations'), is_pro: true }
]

// The field map carries free text plus the REQUIRED identifier of the record the
// action targets (media id, playlist id, tag name…) so it can be mapped from
// trigger data. Optional or non-identifying values that can be fetched — preset,
// tags, attachment, an optional media/user — are dropdowns the user picks.
const mediaId = { key: 'media_id', label: __('Media Id', 'bit-integrations'), required: true }
const playlistId = { key: 'playlist_id', label: __('Playlist Id', 'bit-integrations'), required: true }

export const FluentPlayerStaticData = {
  create_media: [
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'src', label: __('Media Source URL', 'bit-integrations'), required: true },
    { key: 'poster_src', label: __('Poster Image URL', 'bit-integrations'), required: false }
  ],
  update_media: [
    mediaId,
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'src', label: __('Media Source URL', 'bit-integrations'), required: false },
    { key: 'poster_src', label: __('Poster Image URL', 'bit-integrations'), required: false }
  ],
  trash_media: [mediaId],
  restore_media: [mediaId],
  delete_media: [mediaId],
  change_media_status: [mediaId],
  create_tag: [{ key: 'tag', label: __('New Tag Name', 'bit-integrations'), required: true }],
  rename_tag: [
    { key: 'old_name', label: __('Current Tag Name', 'bit-integrations'), required: true },
    { key: 'new_name', label: __('New Tag Name', 'bit-integrations'), required: true }
  ],
  delete_tag: [{ key: 'tag', label: __('Tag Name', 'bit-integrations'), required: true }],
  set_media_tags: [mediaId],
  add_media_tags: [mediaId],
  remove_media_tags: [mediaId],
  create_playlist: [
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'poster_src', label: __('Poster Image URL', 'bit-integrations'), required: false }
  ],
  update_playlist: [
    playlistId,
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'poster_src', label: __('Poster Image URL', 'bit-integrations'), required: false }
  ],
  trash_playlist: [playlistId],
  restore_playlist: [playlistId],
  delete_playlist: [playlistId],
  change_playlist_status: [playlistId],
  add_media_to_playlist: [
    playlistId,
    { key: 'media_ids', label: __('Media Ids (comma separated)', 'bit-integrations'), required: true }
  ],
  remove_media_from_playlist: [
    playlistId,
    { key: 'media_ids', label: __('Media Ids (comma separated)', 'bit-integrations'), required: true }
  ],
  create_email_submission: [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'layer_id', label: __('Layer Id', 'bit-integrations'), required: false },
    { key: 'video_time', label: __('Video Time (seconds)', 'bit-integrations'), required: false },
    { key: 'ip_address', label: __('IP Address', 'bit-integrations'), required: false },
    { key: 'browser', label: __('Browser', 'bit-integrations'), required: false },
    { key: 'device', label: __('Device', 'bit-integrations'), required: false }
  ],
  subscribe_email_to_providers: [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true }
  ],
  record_watch_progression: [
    mediaId,
    { key: 'user_id', label: __('User Id', 'bit-integrations'), required: true },
    { key: 'watched_duration', label: __('Watched Duration (seconds)', 'bit-integrations'), required: true },
    { key: 'course_id', label: __('LMS Course Id', 'bit-integrations'), required: false },
    { key: 'step_id', label: __('LMS Step Id', 'bit-integrations'), required: false }
  ],
  record_visit: [
    mediaId,
    { key: 'duration', label: __('Watched Duration (seconds)', 'bit-integrations'), required: true },
    { key: 'percentage', label: __('Watched Percentage (0-100)', 'bit-integrations'), required: false },
    { key: 'ip_address', label: __('IP Address', 'bit-integrations'), required: false },
    { key: 'browser', label: __('Browser', 'bit-integrations'), required: false },
    { key: 'device', label: __('Device', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country Code', 'bit-integrations'), required: false }
  ],
  save_preset: [
    { key: 'name', label: __('Preset Name', 'bit-integrations'), required: true },
    { key: 'slug', label: __('Preset Slug', 'bit-integrations'), required: false }
  ],
  delete_preset: []
}

// ---- Fixed option sets (selects, never mapped) ----
export const providerOptions = [
  { label: __('WordPress Media', 'bit-integrations'), value: 'wordpress' },
  { label: __('YouTube', 'bit-integrations'), value: 'youtube' },
  { label: __('Vimeo', 'bit-integrations'), value: 'vimeo' },
  { label: __('Bunny Stream', 'bit-integrations'), value: 'bunny' },
  { label: __('Mux', 'bit-integrations'), value: 'mux' },
  { label: __('Gumlet', 'bit-integrations'), value: 'gumlet' },
  { label: __('Cloudflare Stream', 'bit-integrations'), value: 'cloudflare' },
  { label: __('External URL', 'bit-integrations'), value: 'external' }
]

export const viewTypeOptions = [
  { label: __('Video', 'bit-integrations'), value: 'video' },
  { label: __('Audio', 'bit-integrations'), value: 'audio' },
  { label: __('YouTube', 'bit-integrations'), value: 'youtube' },
  { label: __('Vimeo', 'bit-integrations'), value: 'vimeo' }
]

export const postStatusOptions = [
  { label: __('Publish', 'bit-integrations'), value: 'publish' },
  { label: __('Private', 'bit-integrations'), value: 'private' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' }
]

export const endedOptions = [
  { label: __('Yes', 'bit-integrations'), value: '1' },
  { label: __('No', 'bit-integrations'), value: '0' }
]

// ---- Fetched dropdowns (user picks; never an action's required identifier) ----
export const needsPreset = [
  'create_media', 'update_media', 'create_email_submission', 'subscribe_email_to_providers', 'delete_preset'
]
export const needsTags = ['create_media', 'update_media', 'set_media_tags', 'add_media_tags', 'remove_media_tags']
export const needsAttachment = ['create_media']
export const needsOptionalMedia = ['create_email_submission', 'subscribe_email_to_providers']
export const needsOptionalMediaIds = ['create_playlist', 'update_playlist']
export const needsOptionalUser = ['create_email_submission', 'record_visit']

// ---- Option selects ----
export const needsProvider = ['create_media', 'update_media']
export const needsPostStatus = ['change_media_status', 'change_playlist_status']

// ---- Optional option selects in the Utilities section ----
export const hasUtilities = ['create_media', 'update_media', 'record_watch_progression']
