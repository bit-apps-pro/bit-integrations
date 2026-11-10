<?php

namespace BitApps\Integrations\Triggers\Webhook;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Flow\Flow;
use WP_Error;
use WP_REST_Request;

class WebhookController
{
    protected $webhookIntegrationsList = ['BitAssist', 'PaymentForm'];

    public function getNewHook()
    {
        $hook_id = wp_generate_uuid4();

        if (!$hook_id) {
            wp_send_json_error(__('Failed to generate new hook', 'bit-integrations'));
        }
        Config::addOption('webhook_' . $hook_id, []);
        wp_send_json_success(['hook_id' => $hook_id]);
    }

    public function getTestData($data)
    {
        $missing_field = null;

        if (!property_exists($data, 'hook_id') || (property_exists($data, 'hook_id') && !wp_is_uuid($data->hook_id))) {
            $missing_field = \is_null($missing_field) ? 'Webhook ID' : $missing_field . ', Webhook ID';
        }
        if (!\is_null($missing_field)) {
            // translators: %s: Placeholder value
            wp_send_json_error(\sprintf(__('%s can\'t be empty or need to be valid', 'bit-integrations'), $missing_field));
        }

        $testData = Config::getOption('webhook_' . $data->hook_id);
        if ($testData === false) {
            Config::updateOption('webhook_' . $data->hook_id, []);
        }
        if (!$testData || empty($testData)) {
            wp_send_json_error(new WP_Error('webhook_test', __('Webhook data is empty', 'bit-integrations')));
        }
        wp_send_json_success(['webhook' => $testData]);
    }

    public function removeTestData($data)
    {
        $missing_field = null;

        if (!Helper::isUserLoggedIn()) {
            wp_send_json_error(__('Logged in user required!', 'bit-integrations'));
        }
        if (!property_exists($data, 'hook_id') || (property_exists($data, 'hook_id') && !wp_is_uuid($data->hook_id))) {
            $missing_field = \is_null($missing_field) ? 'Webhook ID' : $missing_field . ', Webhook ID';
        }
        if (!\is_null($missing_field)) {
            // translators: %s: Placeholder value
            wp_send_json_error(\sprintf(__('%s can\'t be empty or need to be valid', 'bit-integrations'), $missing_field));
        }

        if (property_exists($data, 'reset') && $data->reset) {
            $testData = Config::updateOption('webhook_' . $data->hook_id, []);
        } else {
            $testData = Config::deleteOption('webhook_' . $data->hook_id);
        }
        if (!$testData) {
            wp_send_json_error(new WP_Error('webhook_test', __('Failed to remove test data', 'bit-integrations')));
        }
        wp_send_json_success(__('Webhook test data removed successfully', 'bit-integrations'));
    }

    public function handle(WP_REST_Request $request)
    {
        $headers = (array) $request->get_headers();
        $queryParams = $request->get_query_params();
        $fileParams = $request->get_file_params() ?? [];

        $bodyParams = $request->get_body_params();
        $decodedBodyParams = \is_array($bodyParams) ? $bodyParams : [];

        $rawBody = (string) $request->get_body();

        $decodedRawBody = Helper::isJson($rawBody)
        ? json_decode($rawBody, true, 512, JSON_THROW_ON_ERROR)
        : [$rawBody];

        $body = array_merge($decodedBodyParams, $decodedRawBody);

        $flattenedBody = self::flattenPreserveOriginal($body);
        $data = array_merge($headers, $flattenedBody, $queryParams, $fileParams);

        $params = $request->get_params();
        $hookId = $params['hook_id'] ?? null;

        if (empty($hookId)) {
            return rest_ensure_response(['status' => 'failed', 'Hook Id is required.']);
        }

        unset($data['hook_id']);

        $finalData = self::overrideDataWithBody($data, $flattenedBody);

        $optionKey = Config::withPrefix('webhook_' . $hookId);
        if (get_option($optionKey) !== false) {
            update_option($optionKey, $data);
        }

        $flows = Flow::exists($this->webhookIntegrationsList, $hookId);

        if (empty($flows)) {
            return;
        }

        Flow::execute('Webhook', $hookId, $finalData, $flows);

        return rest_ensure_response(['status' => 'success']);
    }

    public static function flattenPreserveOriginal($array, $prefix = '', $depth = 0, $maxDepth = 30)
    {
        if ($depth > $maxDepth || !\is_array($array)) {
            return [];
        }

        $result = [];

        foreach ($array as $key => $value) {
            $newKey = $prefix === '' ? $key : $prefix . '_' . $key;

            if (\is_array($value)) {
                $result[$newKey] = $value;
                $result = array_merge($result, self::flattenPreserveOriginal($value, $newKey, $depth + 1, $maxDepth));
            } else {
                $result[$newKey] = $value;
            }
        }

        return $result;
    }

    private static function overrideDataWithBody($data, $body)
    {
        foreach ($data as $key => $value) {
            if (isset($body[$key]) && !empty($body[$key])) {
                $data[$key] = $body[$key];
            }
        }

        return $data;
    }
}
