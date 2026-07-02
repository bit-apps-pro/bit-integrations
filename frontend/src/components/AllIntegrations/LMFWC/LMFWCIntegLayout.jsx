/* eslint-disable no-unused-vars */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import {
  generateMappedField,
  getAllCustomer,
  getAllGenerator,
  getAllLicense,
  getAllOrder,
  getAllProduct
} from './LMFWCCommonFunc'
import LMFWCFieldMap from './LMFWCFieldMap'
import { addFieldMap } from './IntegrationHelpers'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { create } from 'mutative'
import Note from '../../Utilities/Note'

export default function LMFWCIntegLayout({
  formFields,
  licenseManagerConf,
  setLicenseManagerConf,
  loading,
  setLoading,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setChanges = (val, name) => {
    setLicenseManagerConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = val

        if (name === 'module' && (val === 'create_license' || val === 'update_license')) {
          getAllCustomer(licenseManagerConf, setLicenseManagerConf, loading, setLoading)
          getAllProduct(licenseManagerConf, setLicenseManagerConf, loading, setLoading)
          getAllOrder(licenseManagerConf, setLicenseManagerConf, loading, setLoading)

          if (val === 'update_license') {
            getAllLicense(licenseManagerConf, setLicenseManagerConf, loading, setLoading)
            draftConf.lmfwcFields = [
              { label: __('License key', 'bit-integrations'), key: 'license_key', required: false },
              ...draftConf.generalFields
            ]
          } else {
            draftConf.lmfwcFields = [...draftConf.licenseFields, ...draftConf.generalFields]
          }

          draftConf.field_map = generateMappedField(draftConf.lmfwcFields)
          draftConf.module_note = `<p><b>${__('Note', 'bit-integrations')}</b>: ${__(
            'You can also use Valid for (the number of days) instead of Expires at',
            'bit-integrations'
          )}, <b>${__('please do not use both at a time', 'bit-integrations')}</b></p>`
        } else if (name === 'module' && ['activate_license', 'delete_license'].includes(val)) {
          draftConf.lmfwcFields = draftConf.licenseFields
          draftConf.field_map = generateMappedField(draftConf.lmfwcFields)
        } else if (name === 'module' && ['deactivate_license', 'reactivate_license'].includes(val)) {
          draftConf.lmfwcFields = [
            ...draftConf.licenseFields,
            { label: __('Activation Token', 'bit-integrations'), key: 'token', required: false }
          ]
          draftConf.field_map = generateMappedField(draftConf.lmfwcFields)
        } else if (name === 'module' && (val === 'create_generator' || val === 'update_generator')) {
          if (val === 'update_generator') {
            getAllGenerator(licenseManagerConf, setLicenseManagerConf, loading, setLoading)
            draftConf.lmfwcFields = draftConf.generatorFields.map(fields => {
              return { ...fields, required: false }
            })
          } else {
            draftConf.lmfwcFields = draftConf.generatorFields
          }

          draftConf.field_map = generateMappedField(draftConf.lmfwcFields)
        }
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Select Action:', 'bit-integrations')}</b>
        <MultiSelect
          title={'Action'}
          defaultValue={licenseManagerConf?.module}
          className="mt-2 w-5"
          onChange={val => setChanges(val, 'module')}
          options={licenseManagerConf?.modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: checkIsPro(isPro, action.is_pro) ? false : true
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {(isLoading || loading.customer || loading.product || loading.license || loading.generator) && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}

      {licenseManagerConf?.module && licenseManagerConf.module === 'update_license' && !isLoading && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select License:', 'bit-integrations')}</b>
            <MultiSelect
              options={
                licenseManagerConf?.licenses &&
                licenseManagerConf.licenses.map(event => ({ label: event, value: event }))
              }
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={licenseManagerConf?.selectedLicense}
              onChange={val => setChanges(val, 'selectedLicense')}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                getAllLicense(licenseManagerConf, setLicenseManagerConf, loading, setLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh License', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.license}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {licenseManagerConf?.module && licenseManagerConf.module === 'update_generator' && !isLoading && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Generator:', 'bit-integrations')}</b>
            <MultiSelect
              options={
                licenseManagerConf?.generators &&
                licenseManagerConf.generators.map(event => ({ label: event.name, value: `${event.id}` }))
              }
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={licenseManagerConf?.selectedGenerator}
              onChange={val => setChanges(val, 'selectedGenerator')}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                getAllGenerator(licenseManagerConf, setLicenseManagerConf, loading, setLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Generator', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.generator}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {licenseManagerConf?.module &&
        (licenseManagerConf.module === 'create_license' ||
          licenseManagerConf.module === 'update_license') &&
        !isLoading && (
          <>
            <br />
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Select Status:', 'bit-integrations')}</b>
              <MultiSelect
                options={[
                  { id: 'sold', name: 'Sold' },
                  { id: 'delivered', name: 'Delivered' },
                  { id: 'active', name: 'Active' },
                  { id: 'inactive', name: 'Inactive' }
                ].map(event => ({ label: event.name, value: `${event.id}` }))}
                className="msl-wrp-options dropdown-custom-width"
                defaultValue={licenseManagerConf?.selectedStatus}
                onChange={val => setChanges(val, 'selectedStatus')}
                singleSelect
                closeOnSelect
              />
            </div>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Select Customer:', 'bit-integrations')}</b>
              <MultiSelect
                options={
                  licenseManagerConf?.customers &&
                  licenseManagerConf.customers.map(customer => ({
                    label: customer.name,
                    value: `${customer.id}`
                  }))
                }
                className="msl-wrp-options dropdown-custom-width"
                defaultValue={licenseManagerConf?.selectedCustomer}
                onChange={val => setChanges(val, 'selectedCustomer')}
                singleSelect
                closeOnSelect
              />
              <button
                onClick={() =>
                  getAllCustomer(licenseManagerConf, setLicenseManagerConf, loading, setLoading)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Customers', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.customer}>
                &#x21BB;
              </button>
            </div>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Select Product:', 'bit-integrations')}</b>
              <MultiSelect
                options={
                  licenseManagerConf?.products &&
                  licenseManagerConf.products.map(product => ({
                    label: product.name,
                    value: `${product.id}`
                  }))
                }
                className="msl-wrp-options dropdown-custom-width"
                defaultValue={licenseManagerConf?.selectedProduct}
                onChange={val => setChanges(val, 'selectedProduct')}
                singleSelect
                closeOnSelect
              />
              <button
                onClick={() =>
                  getAllProduct(licenseManagerConf, setLicenseManagerConf, loading, setLoading)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Products', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.product}>
                &#x21BB;
              </button>
            </div>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Select Order:', 'bit-integrations')}</b>
              <MultiSelect
                options={
                  licenseManagerConf?.orders &&
                  licenseManagerConf.orders.map(order => ({
                    label: order.name,
                    value: `${order.id}`
                  }))
                }
                className="msl-wrp-options dropdown-custom-width"
                defaultValue={licenseManagerConf?.selectedOrder}
                onChange={val => setChanges(val, 'selectedOrder')}
                singleSelect
                closeOnSelect
              />
              <button
                onClick={() =>
                  getAllOrder(licenseManagerConf, setLicenseManagerConf, loading, setLoading)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Orders', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.order}>
                &#x21BB;
              </button>
            </div>
          </>
        )}
      {licenseManagerConf.module && !isLoading && (
        <div>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>

          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('License Manager Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {licenseManagerConf.field_map.map((itm, i) => (
            <LMFWCFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              licenseManagerConf={licenseManagerConf}
              formFields={formFields}
              setLicenseManagerConf={setLicenseManagerConf}
              setSnackbar={setSnackbar}
            />
          ))}

          {!['activate_license', 'delete_license'].includes(licenseManagerConf.module) && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    licenseManagerConf.field_map.length,
                    licenseManagerConf,
                    setLicenseManagerConf,
                    false
                  )
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
          <br />
          <br />
          {licenseManagerConf?.module_note && <Note note={licenseManagerConf?.module_note} />}
        </div>
      )}
    </>
  )
}
