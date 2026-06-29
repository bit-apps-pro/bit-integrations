import { Suspense } from 'react'
import Loader from './Loaders/Loader'

export const defaultLoaderFallback = <Loader className="g-c" style={{ height: '82vh' }} />

export function getIntegrationsElement(IntegrationsComponent) {
  return (
    <Suspense fallback={defaultLoaderFallback}>
      <IntegrationsComponent />
    </Suspense>
  )
}
