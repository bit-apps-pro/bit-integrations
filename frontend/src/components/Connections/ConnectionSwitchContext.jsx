import { createContext, useContext } from 'react'

// Lets a read-only (isInfo) integration page turn the connection dropdown back
// on without every integration's Authorization wrapper forwarding a new prop.
// The provider owns the persistence (flow/update); ConnectionAccountSelect only
// reports which connection was picked.
const ConnectionSwitchContext = createContext(null)

export const ConnectionSwitchProvider = ConnectionSwitchContext.Provider

export const useConnectionSwitch = () => useContext(ConnectionSwitchContext)
