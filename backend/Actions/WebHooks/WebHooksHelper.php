<?php

namespace BitApps\Integrations\Actions\WebHooks;

use BitApps\Integrations\Core\Util\HttpHelper;

class WebHooksHelper
{
    public static function testWebhook($webhookDetails)
    {
        $data['flow_details'] = $webhookDetails->hookDetails;
        $response = WebHooksAction::execute((object) $data, [], true);
        $responseCode = HttpHelper::$responseCode;

        if (is_wp_error($response)) {
            wp_send_json_error(
                empty($response) ? 'Unknown Error Occurred' : $response->get_error_message(),
                400
            );
        }

        if (self::hasFailed($response, $responseCode)) {
            wp_send_json_error(
                \sprintf(
                    // translators: %s: http status code returned by the webhook url
                    __('Webhook responded with status %s', 'bit-integrations'),
                    $responseCode
                ),
                400
            );
        }

        wp_send_json_success(
            empty($responseCode)
                ? __('Test webhook executed successfully', 'bit-integrations')
                : \sprintf(
                    // translators: %s: http status code returned by the webhook url
                    __('Test webhook executed successfully (status %s)', 'bit-integrations'),
                    $responseCode
                ),
            200
        );
    }

    /**
     * Decides whether a webhook run failed.
     *
     * A remote that answers 404 or 500 still returns a decoded body, so the status
     * code is the only reliable signal. An unknown code (transport level failure
     * already covered by is_wp_error) is not treated as a failure on its own.
     *
     * @param mixed    $response
     * @param null|int $responseCode
     *
     * @return bool
     */
    public static function hasFailed($response, $responseCode)
    {
        if (is_wp_error($response)) {
            return true;
        }

        if (\is_object($response) && !empty($response->error)) {
            return true;
        }

        if (empty($responseCode) || !is_numeric($responseCode)) {
            return false;
        }

        return $responseCode < 200 || $responseCode >= 300;
    }
}
