<?php

/**
 *  Wordpres Post  Creation
 *  added MB  Custom Fields
 *  Added ACF Custom Fields
 */

namespace BitApps\Integrations\Actions\PostCreation;

use BitApps\Integrations\Config;
use BitApps\Integrations\controller\PostController;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Flow\Flow;
use BitApps\Integrations\Log\LogHandler;

final class PostCreationController
{
    public static function postFieldMapping($postData, $mappingFields, $fieldValues)
    {
        foreach ($mappingFields as $mapped) {
            if (isset($mapped->formField, $mapped->postField)) {
                $triggerValue = $mapped->formField;
                $actionValue = $mapped->postField;

                if ($actionValue === '_thumbnail_id' && $triggerValue === 'custom') {
                    Helper::uploadFeatureImg($mapped->customValue, $postData['post_id']);
                } elseif ($triggerValue === 'custom') {
                    $postData[$actionValue] = Common::replaceFieldWithValue($mapped->customValue, $fieldValues);
                } elseif (!\is_null($fieldValues[$triggerValue]) && $actionValue !== '_thumbnail_id') {
                    $postData[$actionValue] = $fieldValues[$triggerValue];
                } elseif ($actionValue === '_thumbnail_id') {
                    Helper::uploadFeatureImg($fieldValues[$triggerValue], $postData['post_id']);
                }
            }
        }

        return $postData;
    }

    public static function acfFileMapping($acfMapField, $fieldValues, $postId)
    {
        $fileTypes = ['file', 'image'];

        foreach ($acfMapField as $fieldPair) {
            if (property_exists($fieldPair, 'acfFileUpload')) {
                $triggerValue = $fieldPair->formField;
                $actionValue = $fieldPair->acfFileUpload;
                $fieldObject = get_field_object($actionValue);
                if (!empty($fieldValues[$fieldPair->formField])) {
                    if (\in_array($fieldObject['type'], $fileTypes)) {
                        static::uploadACFFile($postId, $fieldValues[$triggerValue], $actionValue, $fieldObject);
                    } else {
                        $attachMentId = Helper::multiFileMoveWpMedia($fieldValues[$triggerValue], $postId);
                        if (!empty($attachMentId)) {
                            update_post_meta($postId, '_' . $actionValue, $fieldObject['key']);
                            update_post_meta($postId, $fieldObject['name'], $attachMentId);
                        }
                    }
                }
            }
        }
    }

    public static function acfFieldMapping($mappingFields, $fieldValues)
    {
        $acfFieldData = [];
        foreach ($mappingFields as $key => $mapped) {
            if (isset($mapped->acfField)) {
                $fieldObject = get_field_object($mapped->acfField);
                if ($fieldObject && isset($mapped->formField) && $mapped->acfField) {
                    $triggerValue = $mapped->formField;
                    $actionValue = $mapped->acfField;
                    $acfFieldData[$key]['key'] = $actionValue;
                    $acfFieldData[$key]['name'] = $fieldObject['name'];
                    if ($triggerValue === 'custom') {
                        $acfFieldData[$key]['value'] = Common::replaceFieldWithValue($mapped->customValue, $fieldValues);
                    } elseif (!\is_null($fieldValues[$triggerValue]) && \gettype($fieldValues[$triggerValue]) !== 'array') {
                        $acfFieldData[$key]['value'] = $fieldValues[$triggerValue];
                    } elseif (!\is_null($fieldValues[$triggerValue]) && \gettype($fieldValues[$triggerValue]) === 'array') {
                        $acfFieldData[$key]['value'] = $fieldValues[$triggerValue];
                    }
                }
            }
        }

        return $acfFieldData;
    }

    public static function mbFieldMapping($mappingFields, $fieldValues, $metaboxFields, $postId)
    {
        $metaboxFieldData = [];
        foreach ($mappingFields as $key => $mapped) {
            if (isset($mapped->formField, $mapped->metaboxField)) {
                $triggerValue = $mapped->formField;
                $actionValue = $mapped->metaboxField;
                $fieldObject = $metaboxFields[$actionValue];

                if ($fieldObject) {
                    $metaboxFieldData[$key]['name'] = $fieldObject['field_name'];
                    if ($triggerValue === 'custom') {
                        $metaboxFieldData[$key]['value'] = Common::replaceFieldWithValue($mapped->customValue, $fieldValues);
                    } elseif (!\is_null($fieldValues[$triggerValue]) && \gettype($fieldValues[$triggerValue]) !== 'array') {
                        $metaboxFieldData[$key]['value'] = $fieldValues[$triggerValue];
                    } elseif (!\is_null($fieldValues[$triggerValue]) && \gettype($fieldValues[$triggerValue]) === 'array') {
                        foreach ($fieldValues[$triggerValue] as $value) {
                            add_post_meta($postId, $fieldObject['field_name'], $value);
                        }
                    }
                }
            }
        }

        return $metaboxFieldData;
    }

    public static function mbFileMapping($metaboxMapField, $fieldValues, $metaboxFields, $postId)
    {
        foreach ($metaboxMapField as $fieldPair) {
            if (property_exists($fieldPair, 'metaboxFileUpload')) {
                if (empty($fieldPair->formField) || empty($fieldPair->metaboxFileUpload)) {
                    continue;
                }

                if (empty($fieldValues[$fieldPair->formField])) {
                    continue;
                }

                $triggerValue = $fieldPair->formField;
                $actionValue = $fieldPair->metaboxFileUpload;
                $fieldObject = isset($metaboxFields[$actionValue]) ? $metaboxFields[$actionValue] : null;

                if (empty($fieldObject)) {
                    continue;
                }

                if (empty($fieldObject['multiple'])) {
                    static::uploadMBFile($postId, $fieldValues[$triggerValue], $fieldObject);
                } else {
                    $attachMentId = Helper::multiFileMoveWpMedia($fieldValues[$triggerValue], $postId);

                    if (!empty($attachMentId) && \is_array($attachMentId)) {
                        foreach ($attachMentId as $attachemnt) {
                            add_post_meta($postId, $fieldObject['field_name'], $attachemnt);
                        }
                    }
                }
            }
        }
    }

    public static function HandleJeCPTFieldMap($jeCPTFieldMap, $fieldValues, $postId, $fields)
    {
        foreach ($jeCPTFieldMap as $key => $item) {
            if (isset($item->formField, $item->jeCPTField)) {
                $triggerValue = $item->formField;
                $actionValue = $item->jeCPTField;
                $currentField = self::JeCPTFieldfindByName($fields, $actionValue);

                if ($currentField['type'] === 'checkbox') {
                    if ($triggerValue === 'custom') {
                        $customValueString = str_replace(' ', '', Common::replaceFieldWithValue($item->customValue, $fieldValues));
                        $customValue = explode(',', $customValueString);
                        $cbValue = [];
                        foreach ($customValue as $cbItem) {
                            $cbValue[$cbItem] = true;
                        }
                        update_post_meta($postId, $actionValue, $cbValue);
                    } elseif (!\is_null($fieldValues[$triggerValue]) && !\is_array($fieldValues[$triggerValue])) {
                        $cvRawValue = explode(',', str_replace(' ', '', $fieldValues[$triggerValue]));
                        $cbValue = [];
                        foreach ($cvRawValue as $cbItem) {
                            $cbValue[$cbItem] = true;
                        }
                        update_post_meta($postId, $actionValue, $cbValue);
                    } elseif (!\is_null($fieldValues[$triggerValue]) && \is_array($fieldValues[$triggerValue])) {
                        $cbValue = [];
                        foreach ($fieldValues[$triggerValue] as $cbItem) {
                            $cbValue[$cbItem] = true;
                        }
                        update_post_meta($postId, $actionValue, $cbValue);
                    }
                } elseif (($currentField['type'] === 'select' && !empty($currentField['is_multiple']))) {
                    if ($triggerValue === 'custom') {
                        $customValueString = str_replace(' ', '', Common::replaceFieldWithValue($item->customValue, $fieldValues));
                        $customValue = explode(',', $customValueString);
                        update_post_meta($postId, $actionValue, $customValue);
                    } elseif (!\is_null($fieldValues[$triggerValue]) && !\is_array($fieldValues[$triggerValue])) {
                        update_post_meta($postId, $actionValue, explode(',', str_replace(' ', '', $fieldValues[$triggerValue])));
                    } elseif (!\is_null($fieldValues[$triggerValue]) && \is_array($fieldValues[$triggerValue])) {
                        update_post_meta($postId, $actionValue, $fieldValues[$triggerValue]);
                    }
                } else {
                    if ($triggerValue === 'custom') {
                        update_post_meta($postId, $actionValue, Common::replaceFieldWithValue($item->customValue, $fieldValues));
                    } elseif (!\is_null($fieldValues[$triggerValue]) && !\is_array($fieldValues[$triggerValue])) {
                        update_post_meta($postId, $actionValue, $fieldValues[$triggerValue]);
                    } elseif (!\is_null($fieldValues[$triggerValue]) && \is_array($fieldValues[$triggerValue])) {
                        update_post_meta($postId, $actionValue, reset($fieldValues[$triggerValue]));
                    }
                }
            }
        }
    }

    public static function HandleJeCPTFileMap($jeCPTFileMap, $fieldValues, $postId, $fields)
    {
        foreach ($jeCPTFileMap as $key => $item) {
            if (isset($item->formField, $item->jeCPTFile)) {
                $triggerValue = $item->formField;
                $actionValue = $item->jeCPTFile;
                $currentField = self::JeCPTFieldfindByName($fields, $actionValue);
                $currentFieldValue = $fieldValues[$triggerValue] ?? false;

                if (empty($currentFieldValue)) {
                    continue;
                }

                if ($currentField['type'] === 'gallery') {
                    if (\is_array($currentFieldValue)) {
                        $firstValue = reset($currentFieldValue);

                        if (\is_array($firstValue)) {
                            $files = $firstValue;
                        } else {
                            $files = $currentFieldValue;
                        }
                    } else {
                        $files = [$currentFieldValue];
                    }

                    $attachmentIds = Helper::multiFileMoveWpMedia($files, $postId);
                    $attachemnts = [];

                    if (!empty($attachmentIds)) {
                        foreach ($attachmentIds as $attachemntId) {
                            $attachemnts[] = ['id' => $attachemntId, 'url' => wp_get_attachment_url($attachemntId)];
                        }
                    }

                    update_post_meta($postId, $actionValue, $attachemnts);
                } else {
                    if (\is_array($currentFieldValue)) {
                        $firstValue = reset($currentFieldValue);

                        if (\is_array($firstValue)) {
                            $file = reset($firstValue);
                        } else {
                            $file = $firstValue;
                        }
                    } else {
                        $file = $currentFieldValue;
                    }

                    $attachemntId = Helper::singleFileMoveWpMedia($file, $postId);

                    if (!empty($attachemntId)) {
                        update_post_meta($postId, $actionValue, ['id' => $attachemntId, 'url' => wp_get_attachment_url($attachemntId)]);
                    }
                }
            }
        }
    }

    public static function JeCPTFieldfindByName($fields, $name)
    {
        $filter = array_filter($fields, function ($field) use ($name) {
            return $field['name'] === $name;
        });

        return reset($filter);
    }

    public function postFieldData($postData)
    {
        $data = [];
        $data['comment_status'] = isset($postData->comment_status) ? $postData->comment_status : '';
        $data['post_status'] = isset($postData->post_status) ? $postData->post_status : '';
        $data['post_type'] = isset($postData->post_type) ? $postData->post_type : '';

        if (isset($postData->post_author) && $postData->post_author !== 'logged_in_user') {
            $data['post_author'] = $postData->post_author;
        } else {
            $data['post_author'] = get_current_user_id();
        }

        return $data;
    }

    public function execute($integrationData, $fieldValues)
    {
        $flowDetails = $integrationData->flow_details;
        $triggers = ['WPF', 'GF'];
        if (\in_array($fieldValues['bit-integrator%trigger_data%']['triggered_entity'], $triggers)) {
            $fieldValues = Helper::splitStringToarray($fieldValues);
        }
        $actionType = isset($flowDetails->action_type) ? $flowDetails->action_type : 'createNewPost';
        if ($actionType !== 'createNewPost') {
            return $this->executeWordPressPostAction($flowDetails, $fieldValues, $actionType, $integrationData->id);
        }

        $postData = $this->postFieldData($flowDetails);
        $postFieldMap = $flowDetails->post_map;
        $acfFieldMap = $flowDetails->acf_map;
        $acfFileMap = $flowDetails->acf_file_map;

        $mbFieldMap = $flowDetails->metabox_map;
        $mbFileMap = $flowDetails->metabox_file_map;
        $jeCPTFieldMap = $flowDetails->je_cpt_meta_map;
        $jeCPTFileMap = $flowDetails->je_cpt_file_map;

        $postId = wp_insert_post(['post_title' => '(no title)', 'post_content' => '']);

        $postData['post_id'] = $postId;
        $specialTagValue = Flow::specialTagMappingValue($postFieldMap);
        $updatedPostValues = $fieldValues + $specialTagValue;

        $updateData = self::postFieldMapping($postData, $postFieldMap, $updatedPostValues);
        $updateData['ID'] = $postId;

        unset($updateData['_thumbnail_id'] , $updateData['post_id']);

        Hooks::run(Config::withPrefix('add_post_tag'), $postId, $flowDetails->post_tags ?? null);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_add_post_tag` action instead.
         * @since 2.7.8
         */
        Hooks::run('btcbi_add_post_tag', $postId, $flowDetails->post_tags ?? null);

        $result = wp_update_post($updateData, true);

        if (is_wp_error($result) || !$result) {
            $message = is_wp_error($result) ? $result->get_error_message() : 'error';
            LogHandler::save($integrationData->id, 'WP Post Creation', 'error', $message);
        } else {
            self::setPostCategories($postId, $flowDetails->post_categories ?? null);
            LogHandler::save($integrationData->id, 'WP Post Creation', 'success', $result);
        }

        if (class_exists('ACF')) {
            $specialTagValue = Flow::specialTagMappingValue($acfFieldMap);
            $updatedAcfValues = $fieldValues + $specialTagValue;
            $acfFieleData = self::acfFieldMapping($acfFieldMap, $updatedAcfValues);
            self::acfFileMapping($acfFileMap, $fieldValues, $postId);
            foreach ($acfFieleData as $data) {
                if (isset($data['key'], $data['value'])) {
                    add_post_meta($postId, '_' . $data['name'], $data['key']);
                    add_post_meta($postId, $data['name'], $data['value']);
                }
            }
        }

        if (\function_exists('rwmb_meta')) {
            $mbFields = rwmb_get_object_fields($flowDetails->post_type);
            $specialTagValue = Flow::specialTagMappingValue($mbFieldMap);

            $updatedAcfValues = $fieldValues + $specialTagValue;
            $mbFieldData = self::mbFieldMapping($mbFieldMap, $updatedAcfValues, $mbFields, $postId);
            foreach ($mbFieldData as $data) {
                if (isset($data['name'], $data['value'])) {
                    add_post_meta($postId, $data['name'], $data['value']);
                }
            }
            self::mbFileMapping($mbFileMap, $fieldValues, $mbFields, $postId);
        }

        if (is_plugin_active('jet-engine/jet-engine.php')) {
            $specialTagValue = Flow::specialTagMappingValue($jeCPTFieldMap);
            $updatedJeCPTValues = $fieldValues + $specialTagValue;
            $fields = PostController::getJetEngineCPTRawMeta($flowDetails->post_type);

            self::HandleJeCPTFieldMap($jeCPTFieldMap, $updatedJeCPTValues, $postId, $fields);
            self::HandleJeCPTFileMap($jeCPTFileMap, $updatedJeCPTValues, $postId, $fields);
        }
    }

    private function executeWordPressPostAction($flowDetails, $fieldValues, $actionType, $integrationId)
    {
        $defaultResponse = [
            'success' => false,
            'message' => wp_sprintf(
                // translators: %s: Plugin name
                __('%s plugin is not installed or activated', 'bit-integrations'),
                'Bit Integrations Pro'
            ),
        ];

        $response = Hooks::apply(
            Config::withPrefix($actionType),
            $defaultResponse,
            $this->buildRequestDataFromPostMap(isset($flowDetails->post_map) ? $flowDetails->post_map : [], $fieldValues),
        );

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($integrationId, ['type' => 'WP Post Creation', 'type_name' => $actionType], $responseType, $response);

        return true;
    }

    private function buildRequestDataFromPostMap($postMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($postMap as $mapItem) {
            if (empty($mapItem->formField) || empty($mapItem->postField)) {
                continue;
            }

            $triggerValue = $mapItem->formField;
            $actionValue = $mapItem->postField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($mapItem->customValue)
                ? Common::replaceFieldWithValue($mapItem->customValue, $fieldValues)
                : ($fieldValues[$triggerValue] ?? '');
        }

        return $dataFinal;
    }

    private static function setPostCategories($postId, $postCategories)
    {
        if (empty($postCategories)) {
            return;
        }

        $categories = \is_array($postCategories) ? $postCategories : explode(',', $postCategories);
        $categoryIds = array_filter(array_map('intval', $categories));

        if (empty($categoryIds)) {
            return;
        }

        wp_set_post_categories($postId, array_unique($categoryIds), false);
    }

    private static function uploadACFFile($postId, $files, $actionValue, $fieldObject)
    {
        $files = \is_array($files) ? $files : [$files];

        foreach ($files as $file) {
            if (\is_array($file)) {
                static::uploadACFFile($postId, $file, $actionValue, $fieldObject);
            } else {
                $attachMentId = Helper::singleFileMoveWpMedia($file, $postId);

                if (!empty($attachMentId)) {
                    update_post_meta($postId, '_' . $actionValue, $fieldObject['key']);
                    update_post_meta($postId, $fieldObject['name'], wp_json_encode($attachMentId));
                }
            }
        }
    }

    private static function uploadMBFile($postId, $files, $fieldObject)
    {
        $files = \is_array($files) ? $files : [$files];

        foreach ($files as $file) {
            if (\is_array($file)) {
                static::uploadMBFile($postId, $file, $fieldObject);
            } else {
                $attachMentId = Helper::singleFileMoveWpMedia($file, $postId);

                if (!empty($attachMentId)) {
                    add_post_meta($postId, $fieldObject['field_name'], $attachMentId);
                }
            }
        }
    }
}
