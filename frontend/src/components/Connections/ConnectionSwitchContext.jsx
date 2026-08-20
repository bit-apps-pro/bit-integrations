import { createContext, useContext } from 'react'

const ConnectionSwitchContext = createContext(null)

export const ConnectionSwitchProvider = ConnectionSwitchContext.Provider

export const useConnectionSwitch = () => useContext(ConnectionSwitchContext)
