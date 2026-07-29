<?php

namespace BitApps\Integrations\Actions\WeDocs;

use WP_Post;

/**
 * Provide functionality for weDocs integration.
 */
class WeDocsController
{
    private const DOC_POST_TYPE = 'docs';

    private const ALLOWED_POST_STATUSES = ['publish', 'draft', 'pending', 'private'];

    public static function getDocumentations()
    {
        self::checkPluginExists();

        $allDocumentations = get_posts(
            [
                'post_type'      => self::DOC_POST_TYPE,
                'post_status'    => self::ALLOWED_POST_STATUSES,
                'posts_per_page' => -1,
                'post_parent'    => 0,
                'orderby'        => 'title',
                'order'          => 'ASC',
            ]
        );

        $documentations = array_map(
            function ($doc) {
                return (object) [
                    'value' => (string) $doc->ID,
                    'label' => $doc->post_title,
                ];
            },
            $allDocumentations
        );

        wp_send_json_success(['documentations' => $documentations], 200);
    }

    public static function getSections($request)
    {
        self::checkPluginExists();

        $documentationId = self::sanitizeId($request->documentation_id ?? '');

        if ($documentationId > 0) {
            $documentation = get_post($documentationId);

            if (!self::isValidDocumentation($documentation)) {
                wp_send_json_error(__('Selected documentation is invalid.', 'bit-integrations'), 400);
            }
        }

        $queryArgs = [
            'post_type'      => self::DOC_POST_TYPE,
            'post_status'    => self::ALLOWED_POST_STATUSES,
            'posts_per_page' => -1,
            'orderby'        => 'title',
            'order'          => 'ASC',
        ];

        if ($documentationId > 0) {
            $queryArgs['post_parent'] = $documentationId;
        }

        $sections = get_posts($queryArgs);

        if ($documentationId <= 0) {
            $sections = array_values(array_filter($sections, [__CLASS__, 'isValidSection']));
        }

        $options = array_map(
            function ($section) {
                return (object) [
                    'value' => (string) $section->ID,
                    'label' => $section->post_title,
                ];
            },
            $sections
        );

        wp_send_json_success(['sections' => $options], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map ?? [];

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integrationData->id);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }

    private static function checkPluginExists()
    {
        if (!class_exists('WeDocs')) {
            wp_send_json_error(__('weDocs is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    private static function sanitizeId($value)
    {
        if (empty($value)) {
            return 0;
        }

        return absint($value);
    }

    private static function isValidDocsPost($post)
    {
        return $post instanceof WP_Post && $post->post_type === self::DOC_POST_TYPE;
    }

    private static function isValidDocumentation($post)
    {
        return self::isValidDocsPost($post) && (int) $post->post_parent === 0;
    }

    private static function isValidSection($post)
    {
        if (!self::isValidDocsPost($post)) {
            return false;
        }

        $parentId = (int) $post->post_parent;

        if ($parentId <= 0) {
            return false;
        }

        return (int) wp_get_post_parent_id($parentId) === 0;
    }
}
