/* eslint-disable no-undef */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-console */
/* eslint-disable react/jsx-one-expression-per-line */

import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import './resource/sass/app.scss'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Toaster } from 'react-hot-toast'
import { useRecoilValue } from 'recoil'
import 'regenerator-runtime/runtime.js'
import logo from '../logo.svg'
import {
  defaultLoaderFallback,
  getIntegrationsElement
} from './components/AppRouteElements'
import Loader from './components/Loaders/Loader'
import TableLoader from './components/Loaders/TableLoader2'
import ProModalBtn from './components/Utilities/ProModalBtn'
import { APP_CONFIG } from './config/app'
import { $appConfigState } from './GlobalStates'
import useFetch from './hooks/useFetch'
import ChangelogToggle from './pages/ChangelogToggle'
import './resource/icons/style.css'
import { __ } from './Utils/i18nwrap'
const AuthResponse = lazy(() => import('./pages/AuthResponse'))
const AllIntegrations = lazy(() => import('./pages/AllIntegrations'))
const Integrations = lazy(() => import('./components/Integrations'))
const Settings = lazy(() => import('./pages/Settings'))
const DocSupport = lazy(() => import('./pages/DocSupport'))
const FlowBuilder = lazy(() => import('./pages/FlowBuilder'))
const Connections = lazy(() => import('./pages/Connections'))
const Error404 = lazy(() => import('./pages/Error404'))

const integrationsElement = getIntegrationsElement(Integrations)
const authResponseElement = getIntegrationsElement(AuthResponse)

function App() {
  const btcbi = useRecoilValue($appConfigState)
  const loaderStyle = { height: '82vh' }

  // check if integrations are available
  const { data, isLoading } = useFetch({ payload: {}, action: 'flow/list', method: 'get' })

  const [integrations, setIntegrations] = useState(
    !isLoading && data.success && data?.data?.integrations ? data.data.integrations : []
  )
  useEffect(() => {
    !isLoading && setIntegrations(data.success ? data.data.integrations : [])
  }, [data])
  // check integrations end
  const flowNumber = integrations.length
  useEffect(() => {
    removeUnwantedCSS()
  }, [])

  const isValidUser = APP_CONFIG.isPro

  return (
    <Suspense fallback={<Loader className="g-c" style={loaderStyle} />}>
      <Toaster
        position="bottom-right"
        containerStyle={{ inset: '-25px 30px 20px -10px' }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#000000',
            color: '#fff',
            bottom: 40,
            padding: '15px 18px',
            boxShadow: '0 0px 7px rgb(0 0 0 / 30%), 0 3px 30px rgb(0 0 0 / 20%)'
          }
        }}
      />
      <div className="Btcd-App">
        <div className="nav-wrp">
          <div className="flx">
            <div className="logo flx" title={__('Integrations for Forms')}>
              {/* <Link to="/" className="flx"> */}
              <img src={logo} alt="logo" style={{ marginLeft: '8px', width: '170px' }} />
              {/* <span className="ml-2 mr-2  ">Bit Integrations</span> */}
              {/* </Link> */}
            </div>

            {/* <nav className="top-nav ml-2">
              <a
                target="_blank"
                href="https://wordpress.org/support/plugin/bit-integrations/reviews/#new-post"
                className={`app-link ${btcbi.isPro ? '' : 'green blink'} `}
                rel="noreferrer">
                {__('Review us', 'bit-integrations')}
              </a>
            </nav> */}
            <nav className="top-nav ml-5">{/* <AnnouncementModal /> */}</nav>
            <div className="flx flx-center" style={{ marginLeft: 'auto' }}>
              ${!btcbi.isPro && <ProModalBtn />}
              {/* <CashbackModal /> */}
              <ChangelogToggle />
            </div>
          </div>
        </div>

        <div className="route-wrp">
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<TableLoader />}>
                  <AllIntegrations
                    integrations={integrations}
                    setIntegrations={setIntegrations}
                    isLoading={isLoading}
                    isValidUser={isValidUser}
                  />
                </Suspense>
              }
            />
            <Route
              path="/connections"
              element={
                <Suspense fallback={defaultLoaderFallback}>
                  <Connections />
                </Suspense>
              }
            />

            <Route
              path="/app-settings"
              element={
                <Suspense fallback={defaultLoaderFallback}>
                  <Settings />
                </Suspense>
              }
            />

            <Route
              path="/doc-support"
              element={
                <Suspense fallback={defaultLoaderFallback}>
                  <DocSupport />
                </Suspense>
              }
            />

            <Route
              path="/flow/new"
              element={
                <Suspense fallback={defaultLoaderFallback}>
                  <FlowBuilder />
                </Suspense>
              }
            />

            <Route path="/flow/action">
              <Route index element={integrationsElement} />
              <Route path="*" element={integrationsElement} />
            </Route>

            <Route path="/auth-response">
              <Route index element={authResponseElement} />
              <Route path="*" element={authResponseElement} />
            </Route>

            <Route path="*" element={<Error404 />} />
          </Routes>
        </div>
      </div>
    </Suspense>
  )
}

function removeUnwantedCSS() {
  const conflictStyles = ['bootstrap']
  const styles = document.styleSheets

  for (let i = 0; i < styles.length; i += 1) {
    if (styles[i].href !== null) {
      const regex = new RegExp(conflictStyles.join('.*css|'), 'gi')
      if (styles[i]?.href.match(regex)) {
        styles[i].disabled = true
      }
    }
  }
}

export default App
