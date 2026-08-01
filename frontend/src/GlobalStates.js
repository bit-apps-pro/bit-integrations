import { atom } from 'recoil'
import { APP_CONFIG } from './config/app'

// atoms
// eslint-disable-next-line no-undef
export const $appConfigState = atom({ key: '$appConfigState', default: APP_CONFIG })
export const $newFlow = atom({ key: '$newFlow', default: {}, dangerouslyAllowMutability: true })
export const $actionConf = atom({
  key: '$actionConf',
  default: {},
  dangerouslyAllowMutability: true
})
export const $formFields = atom({
  key: '$formFields',
  default: {},
  dangerouslyAllowMutability: true
})
export const $flowStep = atom({ key: '$flowStep', default: 1, dangerouslyAllowMutability: true })
