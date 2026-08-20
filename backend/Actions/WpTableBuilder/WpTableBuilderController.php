<?php

/**
 * WP Table Builder Integration
 */

namespace BitApps\Integrations\Actions\WpTableBuilder;

use BitApps\Integrations\Core\Util\Post;
use DOMDocument;
use DOMXPath;
use WP_Error;

class WpTableBuilderController
{
    public const POST_TYPE = 'wptb-tables';

    public const CONTENT_META_KEY = '_wptb_content_';

    public static function isExists()
    {
        if (!\defined('WPTB_PLUGIN_DIR')) {
            wp_send_json_error(
                __(
                    'WP Table Builder is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function refreshTables()
    {
        self::isExists();

        $tables = Post::all(
            [
                'post_type'   => self::POST_TYPE,
                'post_status' => ['publish', 'draft', 'pending', 'private', 'future'],
                'numberposts' => -1,
                'orderby'     => 'title',
                'order'       => 'ASC',
            ]
        );

        $response['tables'] = array_map(
            function ($table) {
                // translators: %d is the table's post ID.
                $fallbackTitle = wp_sprintf(__('Table #%d', 'bit-integrations'), $table->ID);

                return [
                    'value' => (string) $table->ID,
                    'label' => $table->post_title === '' ? $fallbackTitle : $table->post_title,
                ];
            },
            $tables
        );

        wp_send_json_success($response);
    }

    public static function refreshColumns($requestParams)
    {
        self::isExists();

        if (empty($requestParams->selectedTable)) {
            wp_send_json_error(__('Select a table first', 'bit-integrations'), 400);
        }

        $table = get_post((int) $requestParams->selectedTable);

        if (!$table || $table->post_type !== self::POST_TYPE) {
            wp_send_json_error(__('Table not found', 'bit-integrations'), 400);
        }

        $columns = self::readColumnLabels(get_post_meta($table->ID, self::CONTENT_META_KEY, true));

        if (empty($columns)) {
            wp_send_json_error(
                __('No columns found. Open the table in WP Table Builder and add at least one row.', 'bit-integrations'),
                400
            );
        }

        wp_send_json_success(['columns' => $columns]);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }

    private static function readColumnLabels($content)
    {
        if (empty($content) || !\class_exists('DOMDocument')) {
            return [];
        }

        $dom = new DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $dom->loadHTML(
            '<?xml encoding="utf-8" ?>' . $content,
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $xpath = new DOMXPath($dom);
        $firstRow = $xpath->query('//tr')->item(0);

        if (!$firstRow) {
            return [];
        }

        $columns = [];

        foreach ($xpath->query('.//th|.//td', $firstRow) as $index => $cell) {
            $label = trim($cell->textContent);

            // translators: %d is the column number.
            $fallbackLabel = wp_sprintf(__('Column %d', 'bit-integrations'), $index + 1);

            $columns[] = [
                'key'      => 'cell_' . $index,
                'label'    => $label === '' ? $fallbackLabel : $label,
                'required' => false,
            ];
        }

        return $columns;
    }
}
