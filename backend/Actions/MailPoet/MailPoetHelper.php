<?php

namespace BitApps\Integrations\Actions\MailPoet;

class MailPoetHelper
{
    /**
     * Validate if Mail Poet plugin exists or not. If not exits then terminate
     * request and send an error response.
     *
     * @return void
     */
    public static function isExists()
    {
        if (!class_exists(\MailPoet\API\API::class)) {
            wp_send_json_error(
                __(
                    'MailPoet is not activate or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshNeswLetter()
    {
        self::isExists();
        $mailpoet_api = \MailPoet\API\API::MP('v1');
        $newsletterList = $mailpoet_api->getLists();

        $allList = [];

        foreach ($newsletterList as $newsletter) {
            $allList[$newsletter['name']] = (object) [
                'newsletterId'   => $newsletter['id'],
                'newsletterName' => $newsletter['name']
            ];
        }
        $response['newsletterList'] = $allList;
        wp_send_json_success($response, 200);
    }

    public static function mailPoetListHeaders()
    {
        self::isExists();
        $mailpoet_api = \MailPoet\API\API::MP('v1');
        $subscriber_form_fields = $mailpoet_api->getSubscriberFields();

        $allList = [];

        foreach ($subscriber_form_fields as $fields) {
            $allList[$fields['name']] = (object) [
                'id'       => $fields['id'],
                'name'     => $fields['name'],
                'required' => $fields['params']['required']
            ];
        }
        $response['mailPoetFields'] = $allList;
        wp_send_json_success($response, 200);
    }
}
