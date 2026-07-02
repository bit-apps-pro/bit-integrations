import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'createCampaign', label: __('Create Campaign', 'bit-integrations'), is_pro: true },
  { name: 'updateCampaign', label: __('Update Campaign', 'bit-integrations'), is_pro: true },
  {
    name: 'updateCampaignStatus',
    label: __('Update Campaign Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'deleteCampaign', label: __('Delete Campaign', 'bit-integrations'), is_pro: true }
]

export const CampaignFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'content', label: __('Content', 'bit-integrations'), required: false },
  { key: 'status', label: __('Status', 'bit-integrations'), required: false },
  { key: 'displayOptions', label: __('Display Options JSON', 'bit-integrations'), required: false },
  { key: 'displayConditions', label: __('Display Conditions JSON', 'bit-integrations'), required: false }
]

export const CampaignUpdateFields = [
  { key: 'campaignId', label: __('Campaign ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'content', label: __('Content', 'bit-integrations'), required: false },
  { key: 'status', label: __('Status', 'bit-integrations'), required: false },
  { key: 'displayOptions', label: __('Display Options JSON', 'bit-integrations'), required: false },
  { key: 'displayConditions', label: __('Display Conditions JSON', 'bit-integrations'), required: false }
]

export const CampaignStatusFields = [
  { key: 'campaignId', label: __('Campaign ID', 'bit-integrations'), required: true },
  { key: 'status', label: __('Status', 'bit-integrations'), required: true }
]

export const CampaignDeleteFields = [
  { key: 'campaignId', label: __('Campaign ID', 'bit-integrations'), required: true },
  { key: 'forceDelete', label: __('Force Delete', 'bit-integrations'), required: false }
]
