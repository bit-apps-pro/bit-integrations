<?php

namespace BitApps\Integrations\Core\Util;

use BitApps\Integrations\Config;
use BitApps\Integrations\Triggers\TriggerController;
use DateTime;
use DateTimeZone;
use Exception;
use stdClass;
use WP_Error;

/**
 * bit-integration helper class
 *
 * @since 1.0.0
 */
final class Helper
{
    /**
     * string to array convert with separator
     *
     * @param mixed $data
     */
    public static function splitStringToarray($data)
    {
        $params = new stdClass();
        $params->id = $data['bit-integrator%trigger_data%']['triggered_entity_id'];
        $trigger = $data['bit-integrator%trigger_data%']['triggered_entity'];
        $fields = TriggerController::getTriggerField($trigger, $params);
        if (\count($fields) > 0) {
            foreach ($fields as $field) {
                if (isset($data[$field['name']])) {
                    if (\gettype($data[$field['name']]) === 'string' && isset($field['separator'])) {
                        if (!empty($field['separator'])) {
                            $data[$field['name']] = $field['separator'] === 'str_array' ? json_decode($data[$field['name']]) : explode($field['separator'], $data[$field['name']]);
                        }
                    }
                }
            }
        }

        return $data;
    }

    public static function formatToISO8601($dateString, $timezone = 'UTC')
    {
        try {
            $timezoneObj = new DateTimeZone($timezone);

            if (is_numeric($dateString)) {
                if ($dateString > 10000000000) {
                    $dateString = $dateString / 1000;
                }

                $date = new DateTime("@{$dateString}");
                $date->setTimezone($timezoneObj);
            } else {
                $date = new DateTime($dateString, $timezoneObj);
            }

            return $date->format(DateTime::ATOM); // DateTime::ATOM is the ISO-8601 format
        } catch (Exception $e) {
            return $dateString;
        }
    }

    public static function uploadFeatureImg($filePath, $postID)
    {
        require_once ABSPATH . 'wp-load.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $files = (array) $filePath;

        foreach ($files as $file) {
            if (\is_array($file)) {
                static::uploadFeatureImg($file, $postID);

                continue;
            }

            if (!file_exists($file) && !filter_var($file, FILTER_VALIDATE_URL)) {
                continue;
            }

            $fileType = wp_check_filetype($file);
            if (empty($fileType['ext']) || !\in_array($fileType['ext'], ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'])) {
                continue;
            }

            $imgFileName = basename($file);

            // Get file content using WordPress HTTP API for remote files
            if (filter_var($file, FILTER_VALIDATE_URL)) {
                $response = Common::safeRemoteGet($file);
                if (is_wp_error($response)) {
                    continue;
                }
                $fileContent = wp_remote_retrieve_body($response);
            } else {
                $safeFilePath = Common::safeUploadFilePath($file);
                if ($safeFilePath === '') {
                    continue;
                }
                $fileContent = file_get_contents($safeFilePath);
            }

            // prepare upload image to WordPress Media Library
            $upload = wp_upload_bits($imgFileName, null, $fileContent);

            if (!empty($upload['error']) || !isset($upload['file'])) {
                continue;
            }

            // check and return file type
            $imageFile = $upload['file'];
            $wpFileType = wp_check_filetype($imageFile, null);
            // Attachment attributes for file
            $attachment = [
                'post_mime_type' => $wpFileType['type'],
                'post_title'     => sanitize_file_name($imgFileName), // sanitize and use image name as file name
                'post_content'   => '',
                'post_status'    => 'inherit',
            ];

            // insert and return attachment id
            $attachmentId = wp_insert_attachment($attachment, $imageFile, $postID);

            if (!is_wp_error($attachmentId)) {
                $attachmentData = @wp_generate_attachment_metadata($attachmentId, $imageFile);
                wp_update_attachment_metadata($attachmentId, $attachmentData);
                set_post_thumbnail($postID, $attachmentId);
            }
        }
    }

    public static function singleFileMoveWpMedia($filePath, $postId)
    {
        require_once ABSPATH . 'wp-load.php';

        $filePath = Common::filePath($filePath);

        if (file_exists($filePath)) {
            $imgFileName = basename($filePath);
            // prepare upload image to WordPress Media Library
            $upload = wp_upload_bits($imgFileName, null, file_get_contents($filePath, FILE_USE_INCLUDE_PATH));

            $imageFile = $upload['file'];
            $wpFileType = wp_check_filetype($imageFile, null);
            // Attachment attributes for file
            $attachment = [
                'post_mime_type' => $wpFileType['type'],
                'post_title'     => sanitize_file_name($imgFileName), // sanitize and use image name as file name
                'post_content'   => '',
                'post_status'    => 'inherit',
                'post_parent'    => $postId,
            ];
            // insert and return attachment id
            $attachmentId = wp_insert_attachment($attachment, $imageFile, $postId);
            require_once ABSPATH . 'wp-admin/includes/image.php';
            // insert and return attachment metadata
            $attachmentData = wp_generate_attachment_metadata($attachmentId, $imageFile);
            wp_update_attachment_metadata($attachmentId, $attachmentData);

            return $attachmentId;
        }
    }

    public static function multiFileMoveWpMedia($files, $postId)
    {
        require_once ABSPATH . 'wp-load.php';
        $attachMentId = [];
        require_once ABSPATH . 'wp-admin/includes/image.php';
        foreach ($files as $file) {
            $file = Common::filePath($file);
            if (file_exists($file)) {
                $imgFileName = basename($file);
                // prepare upload image to WordPress Media Library
                $upload = wp_upload_bits($imgFileName, null, file_get_contents($file, FILE_USE_INCLUDE_PATH));

                $imageFile = $upload['file'];
                // echo $imageFile;
                $wpFileType = wp_check_filetype($imageFile, null);
                // Attachment attributes for file
                $attachment = [
                    'post_mime_type' => $wpFileType['type'],
                    'post_title'     => sanitize_file_name($imgFileName), // sanitize and use image name as file name
                    'post_content'   => '',
                    'post_status'    => 'inherit',
                    'post_parent'    => $postId,
                ];
                // insert and return attachment id
                $attachmentId = wp_insert_attachment($attachment, $imageFile, $postId);
                // $attachMentId[]=$attachmentId;
                $attachMentId[] = $attachmentId;

                // insert and return attachment metadata
                $attachmentData = wp_generate_attachment_metadata($attachmentId, $imageFile);
                // update and return attachment metadata
                wp_update_attachment_metadata($attachmentId, $attachmentData);
            }
        }

        return $attachMentId;
    }

    public static function isProActivate()
    {
        $config = Hooks::apply(Config::withPrefix('localized_script'), []);

        if (empty($config)) {
            /**
             * @deprecated 2.7.8 Use `bit_integrations_localized_script` filter instead.
             * @since 2.7.8
             */
            $config = Hooks::apply('btcbi_localized_script', $config);
        }

        return $config['is_pro'] ?? false;
    }

    public static function isUserLoggedIn()
    {
        return is_user_logged_in();
    }

    public static function isJson($string)
    {
        if (!\is_string($string) || trim($string) === '') {
            return false;
        }

        json_decode($string);

        return json_last_error() === JSON_ERROR_NONE;
    }

    public static function extractValueFromPath($data, $path, $triggerEntity = 'trigger')
    {
        $parts = \is_array($path) ? $path : explode('.', $path ?? '');
        if (\count($parts) === 0) {
            return $data;
        }

        $currentPart = array_shift($parts);

        if (\is_array($data)) {
            if (!isset($data[$currentPart])) {
                // wp_send_json_error(new WP_Error($triggerEntity, __('Index out of bounds or invalid', 'bit-integrations')));
                return;
            }

            return self::extractValueFromPath($data[$currentPart], $parts, $triggerEntity);
        }

        if (\is_object($data)) {
            if (!property_exists($data, $currentPart)) {
                // wp_send_json_error(new WP_Error($triggerEntity, __('Invalid path', 'bit-integrations')));
                return;
            }

            return self::extractValueFromPath($data->{$currentPart}, $parts, $triggerEntity);
        }

        // wp_send_json_error(new WP_Error($triggerEntity, __('Invalid path', 'bit-integrations')));
    }

    public static function parseFlowDetails($flowDetails)
    {
        return \is_string($flowDetails) ? json_decode($flowDetails) : $flowDetails;
    }

    public static function formatPhoneNumber($field, $split = false, $splitPerDig = 3)
    {
        if (!preg_match('/^\+?[0-9\s\-\(\)]+$/', $field)) {
            return $field;
        }

        $leadingPlus = $field[0] === '+' ? '+' : '';
        $cleanedNumber = preg_replace('/[^\d]/', '', $field);
        $formattedDigits = $split ? trim(chunk_split($cleanedNumber, $splitPerDig, ' ')) : trim($cleanedNumber);

        return $leadingPlus . $formattedDigits;
    }

    public static function acfGetFieldGroups($type = [])
    {
        if (!class_exists('ACF')) {
            return [];
        }

        return array_filter(acf_get_field_groups(), function ($group) use ($type) {
            return $group['active'] && isset($group['location'][0][0]['value']) && \is_array($type) && \in_array($group['location'][0][0]['value'], $type);
        });
    }

    public static function getAcfFieldData($acfFieldGroups, $postId)
    {
        if (!class_exists('ACF')) {
            return [];
        }

        $data = [];

        foreach ($acfFieldGroups as $group) {
            foreach (acf_get_fields($group['ID']) as $field) {
                $data[$field['_name']] = get_post_meta($postId, $field['_name'])[0];
            }
        }

        return $data;
    }

    public static function getWCCustomCheckoutData($order)
    {
        if (!class_exists('WooCommerce')) {
            return [];
        }

        $data = [];
        $checkoutFields = WC()->checkout()->get_checkout_fields();

        if (empty($checkoutFields)) {
            return $data;
        }

        $isOrderObject = \is_object($order) && method_exists($order, 'get_meta');
        $orderData = \is_object($order) && method_exists($order, 'get_data') ? $order->get_data() : (array) $order;

        foreach ($checkoutFields as $groupKey => $group) {
            foreach ($group as $fieldKey => $field) {
                $fieldName = $field['name'] ?? $fieldKey;
                $metaKey = null;

                // if field matches booster for woocommerce plugin custom key format
                if (strpos($fieldKey, "{$groupKey}_wcj_checkout_field_") !== false) {
                    if ($isOrderObject) {
                        if ($order->meta_exists($fieldName)) {
                            $metaKey = $fieldName;
                        } elseif ($order->meta_exists("_{$fieldName}")) {
                            $metaKey = "_{$fieldName}";
                        }

                        $data[$fieldName] = $metaKey ? $order->get_meta($metaKey, true) : '';
                    } else {
                        $data[$fieldName] = $orderData[$fieldName] ?? '';
                    }
                } elseif ($isOrderObject && $order->meta_exists($fieldName)) {
                    $data[$fieldName] = $order->get_meta($fieldName, true) ?? '';
                } else {
                    $data[$fieldName] = $orderData[$fieldName] ?? '';
                }
            }
        }

        return $data;
    }

    public static function getFlexibleCheckoutData($order)
    {
        if (!class_exists('WooCommerce')) {
            return [];
        }

        $data = [];
        $order = \is_object($order) && method_exists($order, 'get_data') ? $order->get_data() : (array) $order;
        $checkoutFields = WC()->checkout()->get_checkout_fields();

        foreach ($checkoutFields as $groupKey => $group) {
            if ($groupKey == 'shipping') {
                continue;
            }

            foreach ($group as $fieldKey => $field) {
                if (empty($field['custom_field'])) {
                    continue;
                }

                $fieldKey = $field['name'] ?? $fieldKey;
                $data[$fieldKey] = $order[$fieldKey] ?? '';
            }
        }

        return $data;
    }

    public static function isPrimaryKeysMatch($recordData, $PrimaryKeys)
    {
        foreach ($PrimaryKeys as $primaryKey) {
            if ($primaryKey->value != Helper::extractValueFromPath($recordData, $primaryKey->key, 'PieForms')) {
                return false;
            }
        }

        return true;
    }

    public static function setTestData($optionKey, $formData, $primaryKey = null, $primaryKeyId = null)
    {
        if (get_option($optionKey) !== false) {
            $value = ['formData' => $formData];

            if (!empty($primaryKey) && !empty($primaryKeyId)) {
                $value['primaryKey'] = [(object) ['key' => $primaryKey, 'value' => $primaryKeyId]];
            }

            update_option($optionKey, $value);
        }
    }

    public static function prepareFetchFormatFields(array $data, $path = '', $formattedData = [])
    {
        foreach ($data as $key => $value) {
            if (\is_string($key) && ctype_upper($key)) {
                $key = strtolower($key);
            }

            $currentKey = strtolower(preg_replace(['/[^A-Za-z0-9_]/', '/([A-Z])/'], ['', '_$1'], $key));
            $currentPath = $path ? "{$path}_{$currentKey}" : $currentKey;

            if (empty($currentPath)) {
                continue;
            }

            $label = ucwords(str_replace('_', ' ', $path ? $currentPath : $key));

            if (\is_string($value) && static::isJson($value)) {
                $value = json_decode($value, true);
            }

            if (\is_array($value) || \is_object($value)) {
                $formattedData[$currentPath] = [
                    'name'  => $currentPath . '.value',
                    'type'  => static::getVariableType($value),
                    'label' => $label . ' ( array )',
                    'value' => $value,
                ];

                $formattedData = static::prepareFetchFormatFields((array) $value, $currentPath, $formattedData);
            } else {
                $labelValue = \is_string($value) && \strlen($value) > 20 ? substr($value, 0, 20) . '...' : $value;
                $label = preg_replace("/\b(\w+)\s+\\1\b/i", '$1', $label) . ' (' . $labelValue . ')';

                $formattedData[$currentPath] = [
                    'name'  => $currentPath . '.value',
                    'type'  => static::getVariableType($value),
                    'label' => $label,
                    'value' => $value,
                ];
            }
        }

        return $formattedData;
    }

    public static function flattenNestedData($resultArray, $parentKey, $nestedData)
    {
        if (\is_object($nestedData)) {
            $nestedData = !empty($nestedData->getAttributes()) ? $nestedData->getAttributes() : wp_json_encode($nestedData);
        }

        if (!(\is_array($nestedData) || \is_object($nestedData))) {
            return $resultArray;
        }

        $nestedData = (array) $nestedData;

        foreach ($nestedData as $itemKey => $itemValue) {
            $newKey = static::sanitizeKey($parentKey, $itemKey);

            if (\is_array($itemValue) || \is_object($itemValue)) {
                $resultArray = static::flattenNestedData($resultArray, $newKey, $itemValue);
            } else {
                $resultArray[$newKey] = static::sanitizeValue($itemValue);
            }
        }

        return $resultArray;
    }

    public static function decodeHtmlEntities($input)
    {
        if (\is_array($input)) {
            foreach ($input as $index => $item) {
                $input[$index] = static::decodeSingleEntity($item);
            }

            return $input;
        }

        return static::decodeSingleEntity($input);
    }

    /**
     * Convert string to array.
     *
     * @param null|array|string $data
     * @param string            $separator
     *
     * @return array
     */
    public static function convertStringToArray($data, $separator = ',')
    {
        if (empty($data)) {
            return [];
        }

        if (\is_array($data)) {
            return array_map('trim', $data);
        }

        return array_map('trim', explode($separator, $data));
    }

    public static function jsonEncodeDecode($data)
    {
        return json_decode(json_encode($data), true);
    }

    public static function getPostIdFromReferer($referer)
    {
        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized on next line
        if ($referer === null && isset($_SERVER['HTTP_REFERER'])) {
            // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized immediately
            $referer = sanitize_text_field(wp_unslash($_SERVER['HTTP_REFERER']));
        }

        if (empty($referer)) {
            return;
        }

        if (!\is_string($referer)) {
            return;
        }

        return url_to_postid($referer);
    }

    private static function getVariableType($val)
    {
        $types = [
            'boolean'           => 'boolean',
            'integer'           => 'number',
            'double'            => 'number',
            'string'            => 'text',
            'array'             => 'array',
            'resource (closed)' => 'file',
            'NULL'              => 'textarea',
            'unknown type'      => 'unknown'
        ];

        return $types[\gettype($val)] ?? 'text';
    }

    private static function decodeSingleEntity($string)
    {
        return html_entity_decode($string);
    }

    /**
     * Sanitize the key by removing unwanted characters.
     *
     * @param string $parentKey The parent key to prepend.
     * @param string $itemKey   The current key.
     *
     * @return string The sanitized and combined key.
     */
    private static function sanitizeKey($parentKey, $itemKey)
    {
        return $parentKey . '_' . str_replace(['*', \chr(0)], '', $itemKey);
    }

    /**
     * Sanitize the value by trimming spaces and handling empty values.
     *
     * @param mixed $value The value to sanitize.
     *
     * @return mixed The sanitized value.
     */
    private static function sanitizeValue($value)
    {
        return $value ? trim($value) : $value;
    }
}
