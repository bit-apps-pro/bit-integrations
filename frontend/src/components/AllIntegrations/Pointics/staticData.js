import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'adjust_points', label: __('Adjust Points', 'bit-integrations'), is_pro: true },
  {
    name: 'award_channel_points',
    label: __('Award Channel Points', 'bit-integrations'),
    is_pro: true
  },
  { name: 'redeem_reward', label: __('Redeem Reward', 'bit-integrations'), is_pro: true },
  { name: 'apply_redemption', label: __('Apply Redemption', 'bit-integrations'), is_pro: true },
  { name: 'cancel_redemption', label: __('Cancel Redemption', 'bit-integrations'), is_pro: true },
  {
    name: 'recompute_member_tier',
    label: __('Recompute Member Tier', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'send_referral_invite',
    label: __('Send Referral Invite', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'cancel_referral_invite',
    label: __('Cancel Referral Invite', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'complete_referral_registration',
    label: __('Complete Referral Registration', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'complete_referral_purchase',
    label: __('Complete Referral Purchase', 'bit-integrations'),
    is_pro: true
  }
]

export const PointsAdjustFields = [
  { key: 'user_email', label: __('Member Email', 'bit-integrations'), required: true },
  { key: 'points', label: __('Points (negative debits)', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'source', label: __('Source', 'bit-integrations'), required: false },
  { key: 'idempotency_key', label: __('Idempotency Key', 'bit-integrations'), required: false }
]

export const AwardChannelFields = [
  { key: 'user_email', label: __('Member Email', 'bit-integrations'), required: true },
  { key: 'dedupe_key', label: __('Dedupe Key', 'bit-integrations'), required: true },
  { key: 'amount', label: __('Amount', 'bit-integrations'), required: false }
]

export const RedeemRewardFields = [
  { key: 'user_email', label: __('Member Email', 'bit-integrations'), required: true },
  { key: 'points', label: __('Points (ratio rewards only)', 'bit-integrations'), required: false },
  { key: 'idempotency_key', label: __('Idempotency Key', 'bit-integrations'), required: false }
]

export const RedemptionIdFields = [
  { key: 'user_email', label: __('Member Email', 'bit-integrations'), required: true },
  { key: 'redemption_id', label: __('Redemption Id', 'bit-integrations'), required: true }
]

export const MemberIdFields = [
  { key: 'user_email', label: __('Member Email', 'bit-integrations'), required: true }
]

export const ReferralInviteFields = [
  { key: 'referrer_email', label: __('Referrer Email', 'bit-integrations'), required: true },
  { key: 'email', label: __('Invite Email', 'bit-integrations'), required: true }
]

export const ReferralIdFields = [
  { key: 'referrer_email', label: __('Referrer Email', 'bit-integrations'), required: true },
  { key: 'referral_id', label: __('Referral Id', 'bit-integrations'), required: true }
]

export const ReferralRegistrationFields = [
  { key: 'referee_email', label: __('Referee Email', 'bit-integrations'), required: true },
  { key: 'referrer_email', label: __('Referrer Email', 'bit-integrations'), required: false }
]

export const ReferralPurchaseFields = [
  { key: 'referee_email', label: __('Referee Email', 'bit-integrations'), required: true },
  { key: 'amount', label: __('Order Amount', 'bit-integrations'), required: true },
  { key: 'referrer_email', label: __('Referrer Email', 'bit-integrations'), required: false }
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

export const needsChannel = ['award_channel_points']

export const needsReward = ['redeem_reward']

export const hasUtilities = ['redeem_reward', 'recompute_member_tier']
