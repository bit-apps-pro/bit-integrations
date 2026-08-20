import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  {
    name: 'award_achievement_to_user',
    label: __('Award Achievement to User', 'bit-integrations'),
    is_pro: true
  }
]

export const AwardAchievementFields = [
  {
    key: 'user_id',
    label: __('User (ID, Email or Username)', 'bit-integrations'),
    required: true
  }
]

// Actions that need the achievement dropdown rendered in the integration layout
export const needsAchievement = ['award_achievement_to_user']
