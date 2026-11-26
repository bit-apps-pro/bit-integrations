<?php

namespace BitApps\Integrations\Actions\Voxel;

use BitApps\Integrations\Core\Util\Post;

class VoxelHelper
{
    public static function updateVoxelPost($finalData, $postType, $postId)
    {
        if (!class_exists('Voxel\Post') || !class_exists('Voxel\Post_Type')) {
            return false;
        }

        $post = \Voxel\Post::force_get($postId);

        if (!$post) {
            return false;
        }

        $postType = \Voxel\Post_Type::get($postType);
        $postFields = $postType->get_fields();

        if (!\is_array($postFields) || empty($postFields)) {
            return false;
        }

        $finalData['multiselect'] = array_map('trim', explode(',', $finalData['multiselect'] ?? ''));

        foreach ($postFields as $postField) {
            $fieldType = $postField->get_type();

            if (\in_array($fieldType, ['ui-step', 'ui-html', 'ui-heading', 'ui-image', 'repeater'], true)) {
                continue;
            }

            $fieldKey = $postField->get_key();
            $field = $post->get_field($fieldKey);

            switch ($fieldType) {
                case 'event-date':
                case 'recurring-date':
                    $eventDateValue = VoxelHelper::getEventFieldData($fieldKey, $finalData);

                    if (!empty($eventDateValue)) {
                        $field->update([$eventDateValue]);
                    }

                    break;
                case 'location':
                    $locationValue = VoxelHelper::getLocationFieldData($fieldKey, $finalData);

                    if (!empty($locationValue)) {
                        $field->update($locationValue);
                    }

                    break;
                case 'work-hours':
                    $finalWorkHours = VoxelHelper::getWorkHoursFieldData($fieldKey, $finalData);

                    if (!empty($finalWorkHours)) {
                        $field->update([$finalWorkHours]);
                    }

                    break;
                case 'multiselect':
                    $multiSelectValues = \is_array($finalData[$fieldKey]) ? $finalData[$fieldKey] : array_map('trim', explode(',', $finalData[$fieldKey] ?? ''));

                    if (!empty($multiSelectValues)) {
                        $field->update($multiSelectValues);
                    }

                    break;
                case 'file':
                case 'image':
                case 'profile-avatar':
                case 'gallery':
                case 'cover':
                    $attachmentValues = [];

                    if (!\is_array($finalData[$fieldKey]) && !empty($finalData[$fieldKey])) {
                        $attchmentIds = explode(',', $finalData[$fieldKey]);

                        foreach ($attchmentIds as $attchmentId) {
                            $attachmentValues[] = [
                                'source'  => 'existing',
                                'file_id' => (int) $attchmentId,
                            ];
                        }
                    }

                    if (!empty($attachmentValues)) {
                        $field->update($attachmentValues);
                    }

                    break;
                case 'post-relation':
                    if (!empty($finalData[$fieldKey])) {
                        $value = array_map(
                            'intval',
                            explode(',', $finalData[$fieldKey])
                        );

                        if (!empty($value)) {
                            $field->update($value);
                        }
                    }

                    break;
                case 'taxonomy':
                    if (!empty($finalData[$fieldKey])) {
                        $value = explode(',', $finalData[$fieldKey]);

                        if (!empty($value)) {
                            $field->update($value);
                        }
                    }

                    break;
                case 'product':
                    if (!empty($finalData[$fieldKey])) {
                        $productData = explode(',', $finalData[$fieldKey]);
                        $previousData = $field->get_value();
                        $updatedData = array_merge($previousData ?? [], $productData);
                        $field->update($updatedData);
                    }

                    break;
                default:
                    if (!empty($finalData[$fieldKey])) {
                        $field->update($finalData[$fieldKey]);
                    }

                    break;
            }
        }
    }

    public static function getEventFields($fieldKey, $postField)
    {
        return [
            VoxelHelper::generateFields(
                $fieldKey . '_event_start_date',
                // translators: %s: Placeholder value
                wp_sprintf(__('Event Start Date (%s)', 'bit-integrations'), $postField->get_label()),
                false
            ),
            VoxelHelper::generateFields(
                $fieldKey . '_event_end_date',
                // translators: %s: Placeholder value
                wp_sprintf(__('Event End Date (%s)', 'bit-integrations'), $postField->get_label()),
                false
            ),
            VoxelHelper::generateFields(
                $fieldKey . '_event_frequency',
                // translators: %s: Placeholder value
                wp_sprintf(__('Event Frequency (%s)', 'bit-integrations'), $postField->get_label()),
                false
            ),
            VoxelHelper::generateFields(
                $fieldKey . '_repeat_every',
                // translators: %s: Placeholder value
                wp_sprintf(__('Event unit (%s)', 'bit-integrations'), $postField->get_label()),
                false
            ),
            VoxelHelper::generateFields(
                $fieldKey . '_event_until',
                // translators: %s: Placeholder value
                wp_sprintf(__('Event Until (%s)', 'bit-integrations'), $postField->get_label()),
                false
            )
        ];
    }

    public static function getLocationFields($fieldKey, $postField)
    {
        return [
            VoxelHelper::generateFields(
                $fieldKey . '_address',
                // translators: %s: Placeholder value
                wp_sprintf(__('Address (%s)', 'bit-integrations'), $postField->get_label()),
                false
            ),
            VoxelHelper::generateFields(
                $fieldKey . '_latitude',
                // translators: %s: Placeholder value
                wp_sprintf(__('Latitude (%s)', 'bit-integrations'), $postField->get_label()),
                false
            ),
            VoxelHelper::generateFields(
                $fieldKey . '_longitude',
                // translators: %s: Placeholder value
                wp_sprintf(__('Longitude (%s)', 'bit-integrations'), $postField->get_label()),
                false
            )
        ];
    }

    public static function getWorkHoursFields($fieldKey, $postField)
    {
        return [
            VoxelHelper::generateFields(
                $fieldKey . '_work_days',
                // translators: %s: Placeholder value
                wp_sprintf(__('Work Days (%s)', 'bit-integrations'), $postField->get_label()),
                false
            ),
            VoxelHelper::generateFields(
                $fieldKey . '_work_hours',
                // translators: %s: Placeholder value
                wp_sprintf(__('Work Hours (%s)', 'bit-integrations'), $postField->get_label()),
                false
            ),
            VoxelHelper::generateFields(
                $fieldKey . '_work_status',
                // translators: %s: Placeholder value
                wp_sprintf(__('Work Status (%s)', 'bit-integrations'), $postField->get_label()),
                false
            )
        ];
    }

    public static function getCommonFieldsAndMap($selectedTask, $isUpdateTask)
    {
        $fields = $fieldMap = [];

        switch ($selectedTask) {
            case VoxelTasks::NEW_PROFILE:
                $fields[] = VoxelHelper::generateFields(
                    'user_email',
                    __('User Email', 'bit-integrations'),
                    !$isUpdateTask
                );

                $fieldMap[] = (object) ['formField' => '', 'voxelField' => 'user_email'];

                break;

            case VoxelTasks::UPDATE_PROFILE:
                $fields[] = VoxelHelper::generateFields(
                    'profile_id',
                    __('Profile ID', 'bit-integrations'),
                    true
                );

                $fieldMap[] = (object) ['formField' => '', 'voxelField' => 'profile_id'];

                break;

            default:
                $fields[] = VoxelHelper::generateFields(
                    'post_author_email',
                    __('Post Author Email', 'bit-integrations'),
                    !$isUpdateTask
                );

                $fieldMap[] = (object) ['formField' => '', 'voxelField' => 'post_author_email'];

                break;
        }

        return [$fields, $fieldMap];
    }

    public static function generateFields($fieldKey, $fieldLabel, $required)
    {
        return [
            'key'      => $fieldKey,
            'label'    => $fieldLabel,
            'required' => $required
        ];
    }

    public static function checkIfVoxelExists()
    {
        if (wp_get_theme()->get_template() === 'voxel') {
            return true;
        }

        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s is not active or installed!', 'bit-integrations'), 'Voxel'), 400);
    }

    public function getPostTypes()
    {
        self::checkIfVoxelExists();

        $postTypeList = $voxelPostTypes = [];

        if (class_exists('\Voxel\Post_Type')) {
            $voxelPostTypes = \Voxel\Post_Type::get_voxel_types();
        }

        if (!empty($voxelPostTypes)) {
            foreach ($voxelPostTypes as $key => $voxelPostType) {
                $postType = get_post_type_object($key);

                if (!$postType) {
                    continue;
                }

                if (\in_array($postType->name, ['collection', 'profile'], true)) {
                    continue;
                }

                $postTypeList[] = (object) [
                    'value' => $postType->name,
                    'label' => $postType->labels->singular_name,
                ];
            }
        }

        wp_send_json_success($postTypeList, 200);
    }

    public function getPosts($request)
    {
        self::checkIfVoxelExists();

        if (empty($request->postType)) {
            wp_send_json_error(__('No post type found!', 'bit-integrations'), 400);
        }

        $posts = Post::all(['post_type' => $request->postType]);

        if (empty($posts) || !$posts) {
            wp_send_json_error(__('No post found!', 'bit-integrations'), 400);
        }

        foreach ($posts as $post) {
            $postList[] = (object) ['value' => (string) $post->ID, 'label' => $post->post_title];
        }

        wp_send_json_success($postList, 200);
    }

    public function getPostFields($request)
    {
        self::checkIfVoxelExists();

        if (empty($request->postType)) {
            wp_send_json_error(__('No post type found!', 'bit-integrations'), 400);
        }

        $fields = $fieldMap = [];

        if (!class_exists('Voxel\Post_Type')) {
            return ['fields' => $fields, 'fieldMap' => $fieldMap];
        }

        $selectedTask = $request->selectedTask;
        $isUpdateTask = \in_array($selectedTask, [VoxelTasks::UPDATE_POST, VoxelTasks::UPDATE_COLLECTION_POST, VoxelTasks::UPDATE_PROFILE]);

        $postType = \Voxel\Post_Type::get($request->postType);
        $postFields = $postType->get_fields();

        if (\is_array($postFields) && !empty($postFields)) {
            [$fields, $fieldMap] = VoxelHelper::getCommonFieldsAndMap($selectedTask, $isUpdateTask);

            foreach ($postFields as $postField) {
                $fieldType = $postField->get_type();

                if (\in_array($fieldType, ['ui-step', 'ui-html', 'ui-heading', 'ui-image', 'repeater'], true)) {
                    continue;
                }

                $fieldKey = $postField->get_key();

                switch ($fieldType) {
                    case 'event-date':
                    case 'recurring-date':
                        $eventFields = VoxelHelper::getEventFields($fieldKey, $postField);
                        $fields = array_merge($fields, $eventFields);

                        break;
                    case 'location':
                        $locationFields = VoxelHelper::getLocationFields($fieldKey, $postField);
                        $fields = array_merge($fields, $locationFields);

                        break;
                    case 'work-hours':
                        $workHoursFields = VoxelHelper::getWorkHoursFields($fieldKey, $postField);
                        $fields = array_merge($fields, $workHoursFields);

                        break;
                    default:
                        $required = $isUpdateTask ? false : $postField->is_required();
                        $fields[] = VoxelHelper::generateFields(
                            $fieldKey,
                            $postField->get_label(),
                            $required
                        );

                        if (!$isUpdateTask && $postField->is_required()) {
                            $fieldMap[] = (object) ['formField' => '', 'voxelField' => $fieldKey];
                        }

                        break;
                }
            }
        }

        if ($isUpdateTask && $selectedTask !== VoxelTasks::UPDATE_PROFILE) {
            $fieldMap = [(object) ['formField' => '', 'voxelField' => '']];
        }

        wp_send_json_success(['fields' => $fields, 'fieldMap' => $fieldMap], 200);
    }

    private static function getEventFieldData(string $fieldKey, array $finalData)
    {
        $fields = [
            'event_start_date' => 'start',
            'event_end_date'   => 'end',
            'event_frequency'  => 'frequency',
            'repeat_every'     => 'unit',
            'event_until'      => 'until'
        ];

        return VoxelHelper::getFieldData($fields, $fieldKey, $finalData);
    }

    private static function getLocationFieldData(string $fieldKey, array $finalData)
    {
        $fields = [
            'address'   => 'address',
            'latitude'  => 'latitude',
            'longitude' => 'longitude',
        ];

        return VoxelHelper::getFieldData($fields, $fieldKey, $finalData);
    }

    private static function getWorkHoursFieldData(string $fieldKey, array $finalData)
    {
        $finalWorkHours = [];

        // receive work days as string e.g. sat, sun, mon; and convert it to array
        if (!empty($finalData[$fieldKey . '_work_days'])) {
            $days = preg_split('/, ?/', $finalData[$fieldKey . '_work_days']);
            $finalWorkHours['days'] = $days;
        }

        // receive work hours as string e.g. 09:00-12:00 or 09:00-11:00, 12:00-14:00; and convert it to array (with multi hours also)
        if (!empty($finalData[$fieldKey . '_work_hours'])) {
            $multiHours = preg_split('/, ?/', $finalData[$fieldKey . '_work_hours']);
            $formattedHours = [];

            foreach ($multiHours as $hours) {
                $splitHours = preg_split('/ ?- ?/', $hours);
                $formattedHours[] = [
                    'from' => isset($splitHours[0]) ? $splitHours[0] : '',
                    'to'   => isset($splitHours[1]) ? $splitHours[1] : '',
                ];
            }

            $finalWorkHours['hours'] = $formattedHours;
        }

        if (!empty($finalData[$fieldKey . '_work_status'])) {
            $finalWorkHours['status'] = $finalData[$fieldKey . '_work_status'];
        }

        return $finalWorkHours;
    }

    /**
     * @param array  $fileds    receives field key and field data key (key value pair)
     * @param string $fieldKey
     * @param array  $finalData
     *
     * @return array
     */
    private static function getFieldData(array $fields, string $fieldKey, array $finalData)
    {
        $data = [];

        foreach ($fields as $key => $value) {
            if (!empty($finalData[$fieldKey . '_' . $key])) {
                $data[$value] = $finalData[$fieldKey . '_' . $key];
            }
        }

        return $data;
    }
}
