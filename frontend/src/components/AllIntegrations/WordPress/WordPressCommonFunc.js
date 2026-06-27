import { create } from 'mutative'
import {
  AddCategoryToPostFields,
  AddImageFields,
  CategoryIdField,
  CreateCategoryFields,
  CreateProductCategoryFields,
  CreateProductTagFields,
  CreateProductTypeFields,
  CreateTagFields,
  CreateTermFields,
  EmptyFields,
  MediaIdField,
  PluginPathField,
  PostTypeFeaturesFields,
  PostTypeField,
  ProductTypeIdField,
  RegisterPostTypeFields,
  RegisterTaxonomyFields,
  RenameMediaFields,
  TagIdField,
  TagsToPostFields,
  TaxonomyField,
  TaxonomyToPostFields,
  TermIdTaxonomyFields,
  UpdateCategoryFields,
  UpdateProductCategoryFields,
  UpdateProductTagFields,
  UpdateProductTypeFields,
  UpdateTagFields,
  UpdateTermFields
} from './staticData'

export const handleInput = (e, wordPressConf, setWordPressConf) => {
  const { name, value } = e.target
  setWordPressConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const getFieldsForAction = action => {
  switch (action) {
    // Post Types
    case 'registerPostType':
      return RegisterPostTypeFields
    case 'unregisterPostType':
      return PostTypeField
    case 'addPostTypeFeatures':
      return PostTypeFeaturesFields
    // Post Tags
    case 'createPostTag':
      return CreateTagFields
    case 'updatePostTag':
      return UpdateTagFields
    case 'deletePostTag':
      return TagIdField
    case 'addTaxonomyToPost':
      return TaxonomyToPostFields
    case 'removeTaxonomyFromPost':
      return TaxonomyToPostFields
    case 'addTagsToPost':
      return TagsToPostFields
    case 'removeTagsFromPost':
      return TagsToPostFields
    // Media
    case 'addNewImage':
      return AddImageFields
    case 'deleteMedia':
      return MediaIdField
    case 'renameMedia':
      return RenameMediaFields
    // Taxonomies
    case 'registerTaxonomy':
      return RegisterTaxonomyFields
    case 'unregisterTaxonomy':
      return TaxonomyField
    // Terms
    case 'createNewTerm':
      return CreateTermFields
    case 'updateTerm':
      return UpdateTermFields
    case 'termDelete':
      return TermIdTaxonomyFields
    // Categories
    case 'createCategory':
      return CreateCategoryFields
    case 'updateCategory':
      return UpdateCategoryFields
    case 'deleteCategory':
      return CategoryIdField
    case 'addCategoryToPost':
      return AddCategoryToPostFields
    // WooCommerce Product Tags
    case 'createProductTag':
      return CreateProductTagFields
    case 'updateProductTag':
      return UpdateProductTagFields
    case 'deleteProductTag':
      return TagIdField
    // WooCommerce Product Categories
    case 'createProductCategory':
      return CreateProductCategoryFields
    case 'updateProductCategory':
      return UpdateProductCategoryFields
    case 'deleteProductCategory':
      return CategoryIdField
    // WooCommerce Product Types
    case 'createProductType':
      return CreateProductTypeFields
    case 'updateProductType':
      return UpdateProductTypeFields
    case 'deleteProductType':
      return ProductTypeIdField
    // Plugin
    case 'checkPluginActivationStatus':
      return PluginPathField
    case 'activatePlugin':
      return PluginPathField
    default:
      return EmptyFields
  }
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', wordPressField: field.key }))
    : [{ formField: '', wordPressField: '' }]
}

export const checkMappedFields = wordPressConf => {
  const mappedFields = wordPressConf?.field_map
    ? wordPressConf.field_map.filter(mappedField => {
        return (
          !mappedField.formField ||
          !mappedField.wordPressField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
        )
      })
    : []
  return mappedFields.length === 0
}
