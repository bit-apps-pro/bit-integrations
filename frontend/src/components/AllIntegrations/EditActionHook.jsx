/* eslint-disable no-param-reassign */

import { create } from 'mutative'
import { useRef, useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../GlobalStates'
import bitsFetch from '../../Utils/bitsFetch'
import CustomFetcherHelper from '../../Utils/CustomFetcherHelper'
import { extractValueFromPath } from '../../Utils/Helpers'
import { __ } from '../../Utils/i18nwrap'
import LoaderSm from '../Loaders/LoaderSm'
import EyeIcn from '../Utilities/EyeIcn'
import EyeOffIcn from '../Utilities/EyeOffIcn'
import FieldContainer from '../Utilities/FieldContainer'
import TreeViewer from '../Utilities/treeViewer/TreeViewer'

function EditActionHook() {
  const [actionConf, setActionConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const setFormFields = useSetRecoilState($formFields)
  const [showResponse, setShowResponse] = useState(false)
  const [showSelectedFields, setShowSelectedFields] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isFetchingRef = useRef(false)

  let controller = new AbortController()
  const signal = controller.signal
  const { stopFetching } = CustomFetcherHelper(
    isFetchingRef,
    flow?.triggered_entity_id,
    controller,
    setIsLoading,
    'action_hook/test/remove',
    'POST',
    'hook_id'
  )

  const handleFetch = () => {
    if (isFetchingRef.current) {
      stopFetching()
      return
    }

    isFetchingRef.current = true
    setIsLoading(true)
    fetchSequentially()
  }

  const fetchSequentially = () => {
    const hookID = flow?.triggered_entity_id

    try {
      if (!isFetchingRef.current || !hookID) {
        stopFetching()
        return
      }

      bitsFetch({ hook_id: hookID }, 'action_hook/test', null, 'POST', signal).then(resp => {
        if (!resp.success && isFetchingRef.current) {
          fetchSequentially()
          return
        }

        if (resp.success) {
          setFlow(prevFlow =>
            create(prevFlow, draftFlow => {
              draftFlow.flow_details['rawData'] = resp.data.actionHook
              draftFlow.flow_details['fields'] = []
              draftFlow.flow_details['primaryKey'] = undefined
              draftFlow.flow_details['trigger_type'] =
                draftFlow.flow_details?.trigger_type || 'action_hook'

              if (draftFlow.flow_details?.body?.data) {
                draftFlow.flow_details.body.data = []
              } else {
                draftFlow.flow_details.field_map = []
              }
            })
          )
          setActionConf(prevConf =>
            create(prevConf, draftConf => {
              draftConf['rawData'] = resp.data.actionHook
              draftConf['fields'] = []
              draftConf['primaryKey'] = undefined

              if (draftConf?.body?.data) {
                draftConf.body.data = []
              } else {
                draftConf.field_map = []
              }
            })
          )
          setFormFields([])
          setShowResponse(true)
          setShowSelectedFields(true)
        }

        stopFetching()
      })
    } catch (err) {
      console.error(
        err.name === 'AbortError' ? __('AbortError: Fetch request aborted', 'bit-integrations') : err
      )
    }
  }

  const primaryKeySet = val => {
    setFlow(prevFlow =>
      create(prevFlow, draftFlow => {
        draftFlow.flow_details['primaryKey'] = !val
          ? undefined
          : { key: val, value: extractValueFromPath(flow.flow_details?.rawData, val) }
      })
    )
    setActionConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf['primaryKey'] = !val
          ? undefined
          : { key: val, value: extractValueFromPath(flow.flow_details?.rawData, val) }
      })
    )
  }

  const setSelectedFieldsData = (value = null, remove = false, index = null) => {
    if (remove) {
      // index = index ? index : flow.flow_details.fields.findIndex(field => field.name === value)
      index = index ? index : flow.flow_details.fields.findIndex(field => field.name === value)

      if (index !== -1) {
        removeSelectedField(index)
      }
      return
    }
    addSelectedField(value)
  }

  const addSelectedField = value => {
    setFlow(prevFlow =>
      create(prevFlow, draftFlow => {
        if (draftFlow.flow_details.fields.findIndex(field => field.name === value) === -1) {
          draftFlow.flow_details['fields'].push({ label: value, name: value })
        }
      })
    )
    setActionConf(prevConf =>
      create(prevConf, draftConf => {
        if (draftConf.fields.findIndex(field => field.name === value) === -1) {
          draftConf['fields'].push({ label: value, name: value })
        }
      })
    )
    setFormFields(prevFields =>
      create(prevFields, draftFields => {
        if (draftFields.findIndex(field => field.name === value) === -1) {
          draftFields.push({ label: value, name: value })
        }
      })
    )
  }

  const onUpdateField = (value, index, key) => {
    setFlow(prevFlow =>
      create(prevFlow, draftFlow => {
        draftFlow.flow_details.fields[index][key] = value
      })
    )
    setActionConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.fields[index][key] = value
      })
    )
    setFormFields(prevFields =>
      create(prevFields, draftFields => {
        draftFields[index][key] = value
      })
    )
  }

  const removeSelectedField = index => {
    setFormFields(prevFields =>
      create(prevFields, draftFields => {
        index = draftFields.findIndex(field => field.name === flow.flow_details.fields[index].name)
        draftFields.splice(index, 1)
      })
    )
    setFlow(prevFlow =>
      create(prevFlow, draftFlow => {
        draftFlow.flow_details.fields.splice(index, 1)
      })
    )
    setActionConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.fields.splice(index, 1)
      })
    )
  }

  const setHook = val => {
    if (flow?.triggered_entity_id) {
      stopFetching()
    }

    setFlow(prevFlow =>
      create(prevFlow, draftFlow => {
        draftFlow.triggered_entity_id = val
        draftFlow.flow_details['rawData'] = []
        draftFlow.flow_details['fields'] = []
        draftFlow.flow_details['primaryKey'] = undefined

        if (draftFlow.flow_details?.body?.data) {
          draftFlow.flow_details.body.data = []
        } else {
          draftFlow.flow_details.field_map = []
        }
      })
    )
    setActionConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf['rawData'] = []
        draftConf['fields'] = []
        draftConf['primaryKey'] = undefined

        if (draftConf?.body?.data) {
          draftConf.body.data = []
        } else {
          draftConf.field_map = []
        }
      })
    )
    setFormFields([])
    setShowResponse(false)
    setShowSelectedFields(false)
  }

  return (
    <div className="trigger-custom-width">
      <div className="flx flx-between">
        <div className="wdt-100 d-in-b">
          <b>{__('Hook:', 'bit-integrations')}</b>
        </div>
        <input
          className="btcd-paper-inp mt-1"
          onChange={e => setHook(e.target.value)}
          name="custom"
          value={flow?.triggered_entity_id || ''}
          type="text"
          placeholder={__('Enter Hook...', 'bit-integrations')}
          disabled={isLoading}
        />
      </div>
      <div className="flx mt-1 flx-between">
        <b className="wdt-100 d-in-b">{__('Unique Key:', 'bit-integrations')}</b>
        <MultiSelect
          options={flow.flow_details.fields?.map(field => ({
            label: field?.label,
            value: field?.name
          }))}
          defaultValue={
            Array.isArray(flow?.flow_details?.primaryKey)
              ? flow?.flow_details?.primaryKey.map(item => item.key).join(',')
              : flow?.flow_details?.primaryKey?.key || ''
          }
          className="msl-wrp-options"
          onChange={primaryKeySet}
          singleSelect
          closeOnSelect
        />
        <button
          onClick={handleFetch}
          className={`btn btcd-btn-lg sh-sm flx ml-1 ${
            isLoading ? 'red' : flow.flow_details?.fields ? 'gray' : 'purple'
          }`}
          type="button">
          {isLoading
            ? __('Stop', 'bit-integrations')
            : flow.flow_details.fields
              ? __('Fetched ✔', 'bit-integrations')
              : __('Fetch', 'bit-integrations')}
          {isLoading && <LoaderSm size="20" clr="#022217" className="ml-2" />}
        </button>
      </div>
      {flow.flow_details?.fields && (
        <>
          <div className="flx flx-between">
            <div className="my-3">
              <b>{__('Selected Fields:', 'bit-integrations')}</b>
            </div>
            <button
              onClick={() => setShowSelectedFields(prev => !prev)}
              className="btn btcd-btn-md sh-sm flx gray">
              <span className="txt-actionHook-resbtn font-inter-500">
                {showSelectedFields ? 'Hide Selected Fields' : 'View Selected Fields'}
              </span>
              &nbsp;
              {!showSelectedFields ? (
                <EyeIcn width="20" height="20" strokeColor="#222" />
              ) : (
                <EyeOffIcn width="20" height="20" strokeColor="#222" />
              )}
            </button>
          </div>
          {showSelectedFields && (
            <FieldContainer
              data={flow.flow_details.fields}
              onUpdateField={onUpdateField}
              onRemoveField={removeSelectedField}
            />
          )}
        </>
      )}
      {flow.flow_details?.rawData && (
        <>
          <div className="flx flx-between">
            <div className="my-3">
              <b>{__('Select Fields:', 'bit-integrations')}</b>
            </div>
            <button
              onClick={() => setShowResponse(prev => !prev)}
              className="btn btcd-btn-md sh-sm flx gray">
              <span className="txt-actionHook-resbtn font-inter-500">
                {showResponse
                  ? __('Hide Response', 'bit-integrations')
                  : __('View Response', 'bit-integrations')}
              </span>
              &nbsp;
              {!showResponse ? (
                <EyeIcn width="20" height="20" strokeColor="#222" />
              ) : (
                <EyeOffIcn width="20" height="20" strokeColor="#222" />
              )}
            </button>
          </div>
          {flow.flow_details?.rawData && showResponse && (
            <TreeViewer data={flow?.flow_details?.rawData} onChange={setSelectedFieldsData} />
          )}
        </>
      )}
    </div>
  )
}

export default EditActionHook
