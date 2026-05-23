/* eslint-disable react/button-has-type */
/* eslint-disable no-console */
import { create } from 'mutative'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { $flowStep, $formFields, $newFlow } from '../../../GlobalStates'
import CloseIcn from '../../../Icons/CloseIcn'
import GetLogo from '../../../Utils/GetLogo'
import { extractValueFromPath } from '../../../Utils/Helpers'
import hooklist from '../../../Utils/StaticData/hooklist'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import ConfirmModal from '../../Utilities/ConfirmModal'
import EyeIcn from '../../Utilities/EyeIcn'
import EyeOffIcn from '../../Utilities/EyeOffIcn'
import SnackMsg from '../../Utilities/SnackMsg'
import TreeViewer from '../../Utilities/treeViewer/TreeViewer'
import Note from '../../Utilities/Note'

const EssentialBlocksHelper = () => {
  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowStep = useSetRecoilState($flowStep)
  const setFields = useSetRecoilState($formFields)
  const [primaryKey, setPrimaryKey] = useState()
  const [primaryKeyModal, setPrimaryKeyModal] = useState(false)
  const [selectedFields, setSelectedFields] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const [showResponse, setShowResponse] = useState(false)
  const intervalRef = useRef(null)

  const setTriggerData = () => {
    if (!selectedFields.length) {
      toast.error(__('Please Select Fields', 'bit-integrations'))
      return
    }
    if (!primaryKey) {
      toast.error(__('Please Select a Primary Key', 'bit-integrations'))
      return
    }

    const tmpNewFlow = { ...newFlow }
    tmpNewFlow.triggerData = {
      primaryKey: primaryKey,
      fields: selectedFields.map(field => ({ label: field, name: field }))
    }
    tmpNewFlow['primaryKey'] = primaryKey
    tmpNewFlow.triggered_entity_id = 'eb_form_submit_before_email'
    setFields(selectedFields)
    setNewFlow(tmpNewFlow)
    setFlowStep(2)
  }

  const setSelectedFieldsData = (value = null, remove = false, index = null) => {
    if (remove) {
      index = index ? index : selectedFields.indexOf(value)

      if (index !== -1) {
        removeSelectedField(index)
      }
      return
    }
    addSelectedField(value)
  }

  const addSelectedField = value => {
    setSelectedFields(prevFields =>
      create(prevFields, draftFields => {
        draftFields.push(value)
      })
    )
  }

  const removeSelectedField = index => {
    setSelectedFields(prevFields =>
      create(prevFields, draftFields => {
        draftFields.splice(index, 1)
      })
    )
  }

  const handleFetch = () => {
    if (isLoading) {
      clearInterval(intervalRef.current)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    intervalRef.current = setInterval(() => {
      bitsFetch(null, 'essential_blocks/get').then(resp => {
        if (resp.success) {
          clearInterval(intervalRef.current)
          const tmpNewFlow = { ...newFlow }

          tmpNewFlow.triggerDetail.tmp = resp.data.essentialBlocks
          tmpNewFlow.triggerDetail.data = resp.data.essentialBlocks
          setNewFlow(tmpNewFlow)
          setIsLoading(false)
          setShowResponse(true)
          setSelectedFields([])
          bitsFetch({ reset: true }, 'essential_blocks/test/remove')
        }
      })
    }, 1500)
  }

  const showResponseTable = () => {
    setShowResponse(prevState => !prevState)
  }

  const primaryKeySet = val => {
    setPrimaryKey(
      !val
        ? undefined
        : {
          key: val,
          value: extractValueFromPath(newFlow.triggerDetail?.data, val)
        }
    )
  }
  useEffect(() => {
    return () => {
      setFields()
      bitsFetch({ hook_id: window.hook_id }, 'essential_blocks/test/remove').then(resp => {
        delete window.hook_id
        intervalRef.current && clearInterval(intervalRef.current)
      })
    }
  }, [])
  const info = `<h4>${__('Setup Essential Blocks', 'bit-integrations')}</h4>
            <a className="btcd-link" href="https://bit-integrations.com/wp-docs/trigger/essential-blocks-integrations/" target="_blank" rel="noreferrer">${__(
    'More Details on Documentation',
    'bit-integrations'
  )}</a>
            <ul>
                <li>${__(
    'Click on the <b>Fetch</b> button then Submit your <b>Form</b> to get the form data',
    'bit-integrations'
  )}</li>
            </ul>`

  return (
    <div className="trigger-custom-width">
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      {newFlow.triggerDetail?.data && (
        <>
          <div className="my-3">
            <b>{__('Selected Fields:', 'bit-integrations')}</b>
          </div>
          <div
            className="bg-white rounded border my-1 table-webhook-div p-2"
            style={{ minHeight: '40px', maxHeight: '14rem' }}>
            {selectedFields.map((field, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <input
                  key={index}
                  className="btcd-paper-inp w-100 m-1"
                  type="text"
                  onChange={e => setSelectedFieldsData(e.target.value, index)}
                  value={field.replace(/[,]/gi, '.').replace(/["{\}[\](\)]/gi, '')}
                  disabled={isLoading}
                />
                <button
                  className="btn btcd-btn-lg sh-sm"
                  onClick={() => removeSelectedField(index)}
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    color: '#ff4646',
                    padding: '2px'
                  }}>
                  <CloseIcn size={12} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="flx flx-around">
        <button onClick={handleFetch} className="btn btcd-btn-lg sh-sm flx purple" type="button">
          {isLoading
            ? __('Stop', 'bit-integrations')
            : newFlow.triggerDetail?.data
              ? __('Fetched ✔', 'bit-integrations')
              : __('Fetch', 'bit-integrations')}
          {isLoading && <LoaderSm size="20" clr="#022217" className="ml-2" />}
        </button>
        {selectedFields.length > 0 && (
          <button
            onClick={() => setPrimaryKeyModal(true)}
            className={`btn btcd-btn-lg sh-sm flx ${selectedFields.length && 'purple'}`}
            type="button"
            disabled={!selectedFields.length}>
            {primaryKey ? __('Unique Key ✔', 'bit-integrations') : __('Unique Key', 'bit-integrations')}
          </button>
        )}
      </div>
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={primaryKeyModal}
        close={() => setPrimaryKeyModal(false)}
        action={() => setPrimaryKeyModal(false)}
        title={__('Primary Key', 'bit-integrations')}
        cssTransStyle={{ zIndex: 99999 }}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Primary Key', 'bit-integrations')}</div>
        <div className="flx flx-between mt-2">
          <MultiSelect
            options={selectedFields.map(field => ({ label: field, value: field }))}
            className="msl-wrp-options"
            defaultValue={primaryKey?.key}
            onChange={primaryKeySet}
            singleSelect
            closeOnSelect
          />
        </div>
      </ConfirmModal>

      {newFlow.triggerDetail?.data && showResponse && (
        <>
          <div className="mt-3">
            <b>{__('Select Fields:', 'bit-integrations')}</b>
          </div>
          <TreeViewer data={newFlow?.triggerDetail?.data} onChange={setSelectedFieldsData} />
        </>
      )}
      {newFlow.triggerDetail?.data && (
        <div className="flx flx-between">
          <button onClick={showResponseTable} className="btn btcd-btn-lg sh-sm flx">
            <span className="txt-essentialBlocks-resbtn font-inter-500">
              {showResponse ? 'Hide Response' : 'View Response'}
            </span>
            {!showResponse ? (
              <EyeIcn width="20" height="20" strokeColor="#000000" />
            ) : (
              <EyeOffIcn width="20" height="20" strokeColor="#000000" />
            )}
          </button>
          <button
            onClick={setTriggerData}
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!selectedFields.length || !primaryKey}>
            Set Action
          </button>
        </div>
      )}
      <div className="flx flx-center">
        <Note note={info} />
      </div>
    </div>
  )
}
export default EssentialBlocksHelper
