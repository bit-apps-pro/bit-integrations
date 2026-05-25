/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'
import { TASK_LIST_VALUES } from './jetEngineConstants'

export const handleInput = (e, jetEngineConf, setJetEngineConf) => {
  const newConf = create(jetEngineConf, draftConf => {
    const { name } = e.target
    if (e.target.value !== '') {
      draftConf[name] = e.target.value
    } else {
      delete draftConf[name]
    }
  })

  setJetEngineConf(newConf)
}

export const checkMappedFields = jetEngineConf => {
  const mappedFields = jetEngineConf?.field_map
    ? jetEngineConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.jetEngineField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}


export const getJetEngineOptions = (
  route,
  actionOptions,
  setActionsOptions,
  type,
  loading,
  setLoading
) => {
  if (!route) {
    return
  }

  setLoading({ ...loading, cptOptions: true })

  bitsFetch({}, route).then(result => {
    if (result.success && result.data) {
      const tmpOptions = { ...actionOptions }
      tmpOptions[type] = result.data
      setActionsOptions(tmpOptions)
      setLoading({ ...loading, cptOptions: false })
      toast.success(__('Menu Positions fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, cptOptions: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const getJetEngineRelationTypes = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, relation_types: true })

  bitsFetch({}, 'jetEngine_relation_types').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.allRelationTypes = result.data
      setConf(newConf)
      setLoading({ ...loading, relation_types: false })
      toast.success(__('Realtion object fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, relation_types: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const getJetEngineCPTList = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, cptList: true })

  bitsFetch({}, 'jetEngine_cpt_list').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.cptList = result.data
      setConf(newConf)
      setLoading({ ...loading, cptList: false })
      toast.success(__('CPT list fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, cptList: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const getJetEngineCCTList = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, cctList: true })

  bitsFetch({}, 'jetEngine_cct_list').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.cctList = result.data
      setConf(newConf)
      setLoading({ ...loading, cctList: false })
      toast.success(__('CCT list fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, cctList: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const getJetEngineTaxList = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, taxList: true })

  bitsFetch({}, 'jetEngine_tax_list').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.taxList = result.data
      setConf(newConf)
      setLoading({ ...loading, taxList: false })
      toast.success(__('Taxonomy list fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, taxList: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const getJetEngineRelationList = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, relationList: true })

  bitsFetch({}, 'jetEngine_relation_list').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.relationList = result.data
      setConf(newConf)
      setLoading({ ...loading, relationList: false })
      toast.success(__('Taxonomy list fetched successfully', 'bit-integrations'))
      if (newConf.selectedTask !== TASK_LIST_VALUES.DELETE_RELATION) {
        getJetEngineRelationTypes(newConf, setConf, loading, setLoading)
      }
      return
    }
    setLoading({ ...loading, relationList: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const jetEngineStaticFields = selectedTask => {
  if (
    selectedTask === TASK_LIST_VALUES.CREATE_POST_TYPE ||
    selectedTask === TASK_LIST_VALUES.UPDATE_POST_TYPE
  ) {
    return {
      staticFields: [
        {
          key: 'name',
          label: __('Post Type Name', 'bit-integrations'),
          required: selectedTask === TASK_LIST_VALUES.CREATE_POST_TYPE ? true : false
        },
        { key: 'singular_name', label: __('Singular Name', 'bit-integrations'), required: false },
        { key: 'add_new', label: __('Add New', 'bit-integrations'), required: false },
        { key: 'add_new_item', label: __('Add New Item', 'bit-integrations'), required: false },
        { key: 'new_item', label: __('New Item', 'bit-integrations'), required: false },
        { key: 'edit_item', label: __('Edit Item', 'bit-integrations'), required: false },
        { key: 'view_item', label: __('View Item', 'bit-integrations'), required: false },
        { key: 'all_items', label: __('All Items', 'bit-integrations'), required: false },
        { key: 'search_items', label: __('Search for items', 'bit-integrations'), required: false },
        { key: 'parent_item_colon', label: __('Parent Item', 'bit-integrations'), required: false },
        { key: 'not_found', label: __('Not Found', 'bit-integrations'), required: false },
        {
          key: 'not_found_in_trash',
          label: __('Not Found In trash', 'bit-integrations'),
          required: false
        },
        { key: 'menu_name', label: __('Admin Menu', 'bit-integrations'), required: false },
        {
          key: 'name_admin_bar',
          label: __('Add New on Toolbar', 'bit-integrations'),
          required: false
        },
        { key: 'featured_image', label: __('Featured Image', 'bit-integrations'), required: false },
        {
          key: 'set_featured_image',
          label: __('Set Featured Image', 'bit-integrations'),
          required: false
        },
        {
          key: 'remove_featured_image',
          label: __('Remove Featured Image', 'bit-integrations'),
          required: false
        },
        {
          key: 'use_featured_image',
          label: __('Use Featured Image', 'bit-integrations'),
          required: false
        },
        {
          key: 'archives',
          label: __('The post type archive label used in nav menus', 'bit-integrations'),
          required: false
        },
        {
          key: 'insert_into_item',
          label: __('Insert into post', 'bit-integrations'),
          required: false
        },
        {
          key: 'uploaded_to_this_item',
          label: __('Uploaded to this post', 'bit-integrations'),
          required: false
        }
      ],
      fieldMap:
        selectedTask === TASK_LIST_VALUES.CREATE_POST_TYPE
          ? [{ formField: '', jetEngineField: 'name' }]
          : [{ formField: '', jetEngineField: '' }]
    }
  } else if (
    selectedTask === TASK_LIST_VALUES.CREATE_CONTENT_TYPE ||
    selectedTask === TASK_LIST_VALUES.UPDATE_CONTENT_TYPE
  ) {
    return {
      staticFields: [
        {
          key: 'name',
          label: __('Content Type Name', 'bit-integrations'),
          required: selectedTask === TASK_LIST_VALUES.CREATE_CONTENT_TYPE ? true : false
        },
        {
          key: 'capability',
          label: __('Content Type UI Access Capability', 'bit-integrations'),
          required: false
        }
      ],
      fieldMap:
        selectedTask === TASK_LIST_VALUES.CREATE_CONTENT_TYPE
          ? [{ formField: '', jetEngineField: 'name' }]
          : [{ formField: '', jetEngineField: '' }]
    }
  } else if (
    selectedTask === TASK_LIST_VALUES.CREATE_TAXONOMY ||
    selectedTask === TASK_LIST_VALUES.UPDATE_TAXONOMY
  ) {
    return {
      staticFields: [
        {
          key: 'name',
          label: __('Taxonomy Name', 'bit-integrations'),
          required: selectedTask === TASK_LIST_VALUES.CREATE_TAXONOMY ? true : false
        },
        { key: 'singular_name', label: __('Singular name', 'bit-integrations'), required: false },
        { key: 'menu_name', label: __('Menu name text', 'bit-integrations'), required: false },
        { key: 'all_items', label: __('All items text', 'bit-integrations'), required: false },
        { key: 'edit_item', label: __('Edit item text', 'bit-integrations'), required: false },
        { key: 'view_item', label: __('View Item', 'bit-integrations'), required: false },
        { key: 'update_item', label: __('Update item text', 'bit-integrations'), required: false },
        {
          key: 'add_new_item',
          label: __('Add new item text', 'bit-integrations'),
          required: false
        },
        {
          key: 'new_item_name',
          label: __('New item name text', 'bit-integrations'),
          required: false
        },
        { key: 'parent_item', label: __('Parent item text', 'bit-integrations'), required: false },
        {
          key: 'parent_item_colon',
          label: __('Parent item with colon', 'bit-integrations'),
          required: false
        },
        {
          key: 'search_items',
          label: __('Search items text', 'bit-integrations'),
          required: false
        },
        {
          key: 'popular_items',
          label: __('Popular items text', 'bit-integrations'),
          required: false
        },
        {
          key: 'separate_items_with_commas',
          label: __('Separate item with commas text', 'bit-integrations'),
          required: false
        },
        {
          key: 'add_or_remove_items',
          label: __('Add or remove items text', 'bit-integrations'),
          required: false
        },
        {
          key: 'choose_from_most_used',
          label: __('Choose from most used text', 'bit-integrations'),
          required: false
        },
        {
          key: 'not_found',
          label: __('Items not found text', 'bit-integrations'),
          required: false
        },
        {
          key: 'back_to_items',
          label: __('Back to items text', 'bit-integrations'),
          required: false
        },
        { key: 'query_var', label: __('Register Query Var', 'bit-integrations'), required: false },
        {
          key: 'capability_type',
          label: __('Capability Type', 'bit-integrations'),
          required: false
        },
        {
          key: 'description',
          label: __('Taxonomy Description', 'bit-integrations'),
          required: false
        }
      ],
      fieldMap:
        selectedTask === TASK_LIST_VALUES.CREATE_TAXONOMY
          ? [{ formField: '', jetEngineField: 'name' }]
          : [{ formField: '', jetEngineField: '' }]
    }
  } else if (
    selectedTask === TASK_LIST_VALUES.CREATE_RELATION ||
    selectedTask === TASK_LIST_VALUES.UPDATE_RELATION
  ) {
    return {
      staticFields: [
        {
          key: 'name',
          label: __('Relation Name', 'bit-integrations'),
          required: selectedTask === TASK_LIST_VALUES.CREATE_RELATION ? true : false
        },
        {
          key: 'parent_page_control_title',
          label: __('Parent Object: label of relation box', 'bit-integrations'),
          required: false
        },
        {
          key: 'parent_page_control_connect',
          label: __('Parent Object: label of connect button', 'bit-integrations'),
          required: false
        },
        {
          key: 'parent_page_control_select',
          label: __('Parent Object: label of select item control', 'bit-integrations'),
          required: false
        },
        {
          key: 'child_page_control_title',
          label: __('Child Object: label of relation box', 'bit-integrations'),
          required: false
        },
        {
          key: 'child_page_control_connect',
          label: __('Child Object: label of connect button', 'bit-integrations'),
          required: false
        },
        {
          key: 'child_page_control_select',
          label: __('Child Object: label of select item control', 'bit-integrations'),
          required: false
        }
      ],
      fieldMap:
        selectedTask === TASK_LIST_VALUES.CREATE_RELATION
          ? [{ formField: '', jetEngineField: 'name' }]
          : [{ formField: '', jetEngineField: '' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.DELETE_POST_TYPE) {
    return {
      staticFields: [{ key: 'post_type_id', label: 'Post Type ID', required: true }],
      fieldMap: [{ formField: '', jetEngineField: 'post_type_id' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.DELETE_CONTENT_TYPE) {
    return {
      staticFields: [{ key: 'content_type_id', label: 'Content Type ID', required: true }],
      fieldMap: [{ formField: '', jetEngineField: 'content_type_id' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.DELETE_TAXONOMY) {
    return {
      staticFields: [{ key: 'tax_id', label: 'Taxonomy ID', required: true }],
      fieldMap: [{ formField: '', jetEngineField: 'tax_id' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.DELETE_RELATION) {
    return {
      staticFields: [{ key: 'relation_id', label: 'Relation ID', required: true }],
      fieldMap: [{ formField: '', jetEngineField: 'relation_id' }]
    }
  }

  return { staticFields: [], fieldMap: [] }
}
