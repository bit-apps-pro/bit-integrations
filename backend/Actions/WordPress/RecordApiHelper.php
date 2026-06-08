<?php

namespace BitApps\Integrations\Actions\WordPress;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID      = $integId;
    }

    public function execute($fieldValues, $fieldMap, $integrationDetails)
    {
        $fieldData  = $this->generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = isset($this->_integrationDetails->mainAction) ? $this->_integrationDetails->mainAction : '';

        $defaultResponse = [
            'success' => false,
            'message' => wp_sprintf(
                // translators: %s: Plugin name
                __('%s plugin is not installed or activated', 'bit-integrations'),
                'Bit Integrations Pro'
            ),
        ];

        if (strpos($mainAction, 'get') === 0) {
            $response = [
                'success' => false,
                'message' => __('Get data actions are no longer available in WordPress integration.', 'bit-integrations'),
            ];

            LogHandler::save($this->_integrationID, ['type' => 'WordPress', 'type_name' => $mainAction], 'error', $response);

            return $response;
        }

        switch ($mainAction) {
            // === Post Types ===
            case 'registerPostType':
                $response = Hooks::apply(Config::withPrefix('wordpress_registerPostType'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'unregisterPostType':
                $response = Hooks::apply(Config::withPrefix('wordpress_unregisterPostType'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'addPostTypeFeatures':
                $response = Hooks::apply(Config::withPrefix('wordpress_addPostTypeFeatures'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            // === Post Tags ===
            case 'createPostTag':
                $response = Hooks::apply(Config::withPrefix('wordpress_createPostTag'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'updatePostTag':
                $response = Hooks::apply(Config::withPrefix('wordpress_updatePostTag'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'deletePostTag':
                $response = Hooks::apply(Config::withPrefix('wordpress_deletePostTag'), $defaultResponse, $fieldData, $integrationDetails);

                break;
            case 'addTaxonomyToPost':
                $response = Hooks::apply(Config::withPrefix('wordpress_addTaxonomyToPost'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'removeTaxonomyFromPost':
                $response = Hooks::apply(Config::withPrefix('wordpress_removeTaxonomyFromPost'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'addTagsToPost':
                $response = Hooks::apply(Config::withPrefix('wordpress_addTagsToPost'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'removeTagsFromPost':
                $response = Hooks::apply(Config::withPrefix('wordpress_removeTagsFromPost'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            // === Media ===
            case 'addNewImage':
                $response = Hooks::apply(Config::withPrefix('wordpress_addNewImage'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'deleteMedia':
                $response = Hooks::apply(Config::withPrefix('wordpress_deleteMedia'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'renameMedia':
                $response = Hooks::apply(Config::withPrefix('wordpress_renameMedia'), $defaultResponse, $fieldData, $integrationDetails);

                break;
            // === Taxonomies ===
            case 'registerTaxonomy':
                $response = Hooks::apply(Config::withPrefix('wordpress_registerTaxonomy'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'unregisterTaxonomy':
                $response = Hooks::apply(Config::withPrefix('wordpress_unregisterTaxonomy'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            // === Terms ===
            case 'createNewTerm':
                $response = Hooks::apply(Config::withPrefix('wordpress_createNewTerm'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'updateTerm':
                $response = Hooks::apply(Config::withPrefix('wordpress_updateTerm'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'termDelete':
                $response = Hooks::apply(Config::withPrefix('wordpress_termDelete'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            // === Categories ===
            case 'createCategory':
                $response = Hooks::apply(Config::withPrefix('wordpress_createCategory'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'updateCategory':
                $response = Hooks::apply(Config::withPrefix('wordpress_updateCategory'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'deleteCategory':
                $response = Hooks::apply(Config::withPrefix('wordpress_deleteCategory'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'addCategoryToPost':
                $response = Hooks::apply(Config::withPrefix('wordpress_addCategoryToPost'), $defaultResponse, $fieldData, $integrationDetails);

                break;
            // === Product Tags (WooCommerce) ===
            case 'createProductTag':
                $response = Hooks::apply(Config::withPrefix('wordpress_createProductTag'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'updateProductTag':
                $response = Hooks::apply(Config::withPrefix('wordpress_updateProductTag'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'deleteProductTag':
                $response = Hooks::apply(Config::withPrefix('wordpress_deleteProductTag'), $defaultResponse, $fieldData, $integrationDetails);

                break;
            // === Product Categories (WooCommerce) ===
            case 'createProductCategory':
                $response = Hooks::apply(Config::withPrefix('wordpress_createProductCategory'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'updateProductCategory':
                $response = Hooks::apply(Config::withPrefix('wordpress_updateProductCategory'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'deleteProductCategory':
                $response = Hooks::apply(Config::withPrefix('wordpress_deleteProductCategory'), $defaultResponse, $fieldData, $integrationDetails);

                break;
            // === Product Types (WooCommerce) ===
            case 'createProductType':
                $response = Hooks::apply(Config::withPrefix('wordpress_createProductType'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'updateProductType':
                $response = Hooks::apply(Config::withPrefix('wordpress_updateProductType'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'deleteProductType':
                $response = Hooks::apply(Config::withPrefix('wordpress_deleteProductType'), $defaultResponse, $fieldData, $integrationDetails);

                break;
            // === Plugin Management ===
            case 'checkPluginActivationStatus':
                $response = Hooks::apply(Config::withPrefix('wordpress_checkPluginActivationStatus'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            case 'activatePlugin':
                $response = Hooks::apply(Config::withPrefix('wordpress_activatePlugin'), $defaultResponse, $fieldData, $integrationDetails);

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations'),
                ];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'WordPress', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue  = $item->wordPressField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }
}
