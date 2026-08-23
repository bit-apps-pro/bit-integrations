import { atom, DefaultValue, selector } from 'recoil'

export function atomWithBroadcast(key, initialValue) {
  const listeners = new Set()
  const channel = new BroadcastChannel(key)

  channel.onmessage = event => {
    listeners.forEach(listener => listener(event))
  }

  const broadcastAtom = atom({
    key: `${key}_broadcastAtom`,
    default: { isEvent: false, value: initialValue },
    effects_UNSTABLE: [
      ({ trigger, setSelf, onSet }) => {
        const listener = event => {
          if (event.data.isEvent) {
            setSelf({ isEvent: false, value: event.data.value })
          }
        }
        listeners.add(listener)
        onSet((newValue, oldValue, isReset) => {
          if (!newValue.isEvent) {
            channel.postMessage({ isEvent: true, value: newValue.value })
          }
        })
        return () => {
          listeners.delete(listener)
        }
      }
    ]
  })

  const returnedAtom = selector({
    key: `${key}_returnedAtom`,
    get: ({ get }) => get(broadcastAtom).value,
    set: ({ set }, update) => {
      if (update instanceof DefaultValue) {
        set(broadcastAtom, new DefaultValue())
      } else {
        set(broadcastAtom, { isEvent: false, value: update })
      }
    }
  })
  return returnedAtom
}
