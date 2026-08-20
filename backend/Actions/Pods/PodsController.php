<?php

/**
 * Wordpress Post Creation
 * Added Pods Custom Fields
 */

namespace BitApps\Integrations\Actions\Pods;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Flow\Flow;
use BitApps\Integrations\Log\LogHandler;

final class PodsController
{
    public function execute($integrationData, $fieldValues)
    {
        $flowDetails = $integrationData->flow_details;
        $triggers = ['WPF', 'GF'];
        if (\in_array($fieldValues['bit-integrator%trigger_data%']['triggered_entity'], $triggers)) {
            $fieldValues = Helper::splitStringToarray($fieldValues);
        }
        $postData = $this->postFieldData($flowDetails);
        $postFieldMap = $flowDetails->post_map;
        $podFieldMap = $flowDetails->pod_field_map;
        $podFileMap = $flowDetails->pod_file_map;

        $postId = wp_insert_post(['post_title' => '(no title)', 'post_content' => '']);
        $postData['post_id'] = $postId;

        $specialTagValue = Flow::specialTagMappingValue($postFieldMap);
        $updatedPostvalues = $specialTagValue + $fieldValues;

        $updateData = $this->postFieldMapping($postData, $postFieldMap, $updatedPostvalues);
        $updateData['ID'] = $postId;

        unset($updateData['_thumbnail_id'] , $updateData['post_id']);

        $updated = wp_update_post($updateData, true);

        if (is_wp_error($updated) || !$updated) {
            $message = is_wp_error($updated) ? $updated->get_error_message() : 'error';
            LogHandler::save($integrationData->id, 'WP Post Creation', 'error', $message);
        } else {
            LogHandler::save($integrationData->id, 'WP Post Creation', 'success', $updated);
        }

        if (is_plugin_active('pods/init.php')) {
            $specialTagValue = Flow::specialTagMappingValue($podFieldMap);
            $updatedPodtvalues = $specialTagValue + $fieldValues;
            $podFields = pods($flowDetails->post_type);
            $podFieldData = $this->podMappingField($podFieldMap, $updatedPodtvalues);
            $this->podFileMapping($podFileMap, $fieldValues, $podFields->fields, $postId);
            foreach ($podFieldData as $key => $data) {
                if (\is_array($data)) {
                    $count = \count($data);
                    for ($i = 0; $i < $count; $i++) {
                        add_post_meta($postId, $key, $data[$i]);
                    }
                } else {
                    add_post_meta($postId, $key, $data);
                }
            }
        }
    }

    private function podMappingField($mappingFields, $fieldValues)
    {
        $podsFieldData = [];
        foreach ($mappingFields as $mapped) {
            if (isset($mapped->formField, $mapped->podField)) {
                $triggerValue = $mapped->formField;
                $actionValue = $mapped->podField;
                if ($triggerValue === 'custom' && !empty($mapped->customValue)) {
                    $podsFieldData[$actionValue] = Common::replaceFieldWithValue($mapped->customValue, $fieldValues);
                } else {
                    $podsFieldData[$actionValue] = $fieldValues[$triggerValue];
                }
            }
        }

        return $podsFieldData;
    }

    private function postFieldData($postData)
    {
        $data = [];
        $data['comment_status'] = isset($postData->comment_status) ? $postData->comment_status : '';
        $data['post_status'] = isset($postData->post_status) ? $postData->post_status : '';
        $data['post_type'] = isset($postData->post_type) ? $postData->post_type : '';
        if (isset($postData->post_author) && $postData->post_author !== 'logged_in_user') {
            $datat['post_author'] = $postData->post_author;
        } else {
            $data['post_author'] = get_current_user_id();
        }

        return $data;
    }

    private function postFieldMapping($postData, $mappingFields, $fieldValues)
    {
        foreach ($mappingFields as $key => $mapped) {
            if (isset($mapped->formField, $mapped->postFormField)) {
                $triggerValue = $mapped->formField;
                $actionValue = $mapped->postFormField;

                if ($triggerValue === 'custom') {
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

    private function podFileMapping($mappingFields, $fieldValues, $podFields, $postId)
    {
        foreach ($mappingFields as $mapped) {
            if (isset($mapped->formField)) {
                $triggerValue = $mapped->formField;
                $actionValue = $mapped->podFile;
                $fieldObject = $podFields[$actionValue];
                if (isset($fieldValues[$triggerValue])) {
                    if ($fieldObject['file_format_type'] == 'multi' && \gettype($fieldValues[$triggerValue]) === 'array') {
                        $attachmentId = Helper::multiFileMoveWpMedia($fieldValues[$triggerValue], $postId);
                        if (!empty($attachmentId)) {
                            update_post_meta($postId, $actionValue, $attachmentId);
                            update_post_meta($postId, '_pods_' . $actionValue, wp_json_encode($attachmentId));
                        }
                    } else {
                        $file = \is_array($fieldValues[$triggerValue]) ? $fieldValues[$triggerValue][0] : $fieldValues[$triggerValue];
                        $attachmentId = Helper::singleFileMoveWpMedia($file, $postId);
                        if (!empty($attachmentId)) {
                            update_post_meta($postId, $actionValue, $attachmentId);
                            update_post_meta($postId, '_pods_' . $actionValue, wp_json_encode($attachmentId));
                        }
                    }
                }
            }
        }
    }
}
