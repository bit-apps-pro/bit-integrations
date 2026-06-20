import { __ } from '../../../Utils/i18nwrap'

// Every Vimeo action is Pro.
export const modules = [
  { name: 'upload_video', label: __('Upload Video', 'bit-integrations'), is_pro: true },
  { name: 'edit_video', label: __('Edit Video', 'bit-integrations'), is_pro: true },
  { name: 'delete_video', label: __('Delete Video', 'bit-integrations'), is_pro: true },
  { name: 'add_comment', label: __('Add Comment to Video', 'bit-integrations'), is_pro: true },
  { name: 'create_showcase', label: __('Create Showcase', 'bit-integrations'), is_pro: true },
  { name: 'add_video_to_showcase', label: __('Add Video to Showcase', 'bit-integrations'), is_pro: true },
  { name: 'create_folder', label: __('Create Folder', 'bit-integrations'), is_pro: true },
  { name: 'add_video_to_folder', label: __('Add Video to Folder', 'bit-integrations'), is_pro: true },
  { name: 'add_video_to_channel', label: __('Add Video to Channel', 'bit-integrations'), is_pro: true },
  { name: 'like_video', label: __('Like Video', 'bit-integrations'), is_pro: true },
  { name: 'add_to_watch_later', label: __('Add Video to Watch Later', 'bit-integrations'), is_pro: true },
  { name: 'upload_text_track', label: __('Upload Caption / Text Track', 'bit-integrations'), is_pro: true }
]

// Field-map fields per action (free-form inputs mapped from form fields).
export const VimeoStaticData = {
  upload_video: [
    { label: __('Video File URL', 'bit-integrations'), key: 'link', required: true },
    { label: __('Title', 'bit-integrations'), key: 'name', required: false },
    { label: __('Description', 'bit-integrations'), key: 'description', required: false }
  ],
  edit_video: [
    { label: __('Title', 'bit-integrations'), key: 'name', required: false },
    { label: __('Description', 'bit-integrations'), key: 'description', required: false }
  ],
  add_comment: [{ label: __('Comment', 'bit-integrations'), key: 'text', required: true }],
  create_showcase: [
    { label: __('Showcase Name', 'bit-integrations'), key: 'name', required: true },
    { label: __('Description', 'bit-integrations'), key: 'description', required: false }
  ],
  create_folder: [{ label: __('Folder Name', 'bit-integrations'), key: 'name', required: true }],
  upload_text_track: [
    { label: __('Language (e.g. en)', 'bit-integrations'), key: 'language', required: true },
    { label: __('Track Name', 'bit-integrations'), key: 'name', required: false }
  ]
}

// Which fetched-id dropdowns + static selects each action needs.
export const actionRequirements = {
  upload_video: { dropdowns: [], selects: ['privacy'] },
  edit_video: { dropdowns: ['video'], selects: ['privacy'] },
  delete_video: { dropdowns: ['video'], selects: [] },
  add_comment: { dropdowns: ['video'], selects: [] },
  create_showcase: { dropdowns: [], selects: [] },
  add_video_to_showcase: { dropdowns: ['showcase', 'video'], selects: [] },
  create_folder: { dropdowns: [], selects: [] },
  add_video_to_folder: { dropdowns: ['folder', 'video'], selects: [] },
  add_video_to_channel: { dropdowns: ['channel', 'video'], selects: [] },
  like_video: { dropdowns: ['video'], selects: [] },
  add_to_watch_later: { dropdowns: ['video'], selects: [] },
  upload_text_track: { dropdowns: ['video'], selects: ['trackType'] }
}

// id dropdown meta: conf key holding the chosen id, conf.default key holding the fetched list, refresh route name.
export const dropdownMeta = {
  video: { confKey: 'videoId', dataKey: 'videos', route: 'refresh_vimeo_videos', label: __('Video', 'bit-integrations') },
  showcase: { confKey: 'showcaseId', dataKey: 'showcases', route: 'refresh_vimeo_showcases', label: __('Showcase', 'bit-integrations') },
  folder: { confKey: 'folderId', dataKey: 'folders', route: 'refresh_vimeo_folders', label: __('Folder', 'bit-integrations') },
  channel: { confKey: 'channelId', dataKey: 'channels', route: 'refresh_vimeo_channels', label: __('Channel', 'bit-integrations') }
}

// Per-action helper note shown above the fields (HTML; rendered by <Note />).
export const actionNotes = {
  upload_video: __(
    '<p>The <b>Video File</b> must be a direct, public link to the raw video file (e.g. https://…/clip.mp4) — Vimeo downloads it via the pull method. A YouTube, Vimeo, or other web-page URL will not work. For best results use an MP4 (H.264 High), ProRes 422 HQ, or H.265 file with AAC-LC audio.</p>',
    'bit-integrations'
  ),
  edit_video: __(
    '<p>Only the fields you map are updated; leave a field unmapped to keep its current value.</p>',
    'bit-integrations'
  ),
  delete_video: __(
    '<p>This <b>permanently deletes</b> the selected video from Vimeo and cannot be undone.</p>',
    'bit-integrations'
  ),
  add_comment: __('<p>Posts a comment on the selected video.</p>', 'bit-integrations'),
  add_video_to_showcase: __(
    '<p>Adds the selected video to the chosen showcase (album).</p>',
    'bit-integrations'
  ),
  add_video_to_folder: __(
    '<p>Adds the selected video to the chosen folder (project).</p>',
    'bit-integrations'
  ),
  add_video_to_channel: __('<p>Adds the selected video to the chosen channel.</p>', 'bit-integrations'),
  upload_text_track: __(
    '<p>This creates the caption / text-track entry on the video. Uploading the actual .vtt/.srt file content is a separate Vimeo step.</p>',
    'bit-integrations'
  )
}

export const privacyOptions = [
  { label: __('Public (anybody)', 'bit-integrations'), value: 'anybody' },
  { label: __('Private (nobody)', 'bit-integrations'), value: 'nobody' },
  { label: __('Unlisted', 'bit-integrations'), value: 'unlisted' },
  { label: __('Hidden from Vimeo', 'bit-integrations'), value: 'disable' }
]

export const trackTypeOptions = [
  { label: __('Subtitles', 'bit-integrations'), value: 'subtitles' },
  { label: __('Captions', 'bit-integrations'), value: 'captions' },
  { label: __('Descriptions', 'bit-integrations'), value: 'descriptions' },
  { label: __('Chapters', 'bit-integrations'), value: 'chapters' },
  { label: __('Metadata', 'bit-integrations'), value: 'metadata' }
]
