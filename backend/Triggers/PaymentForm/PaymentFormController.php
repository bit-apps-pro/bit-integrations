<?php

namespace BitApps\Integrations\Triggers\PaymentForm;

use BitApps\Integrations\Triggers\Webhook\WebhookController;

final class PaymentFormController extends WebhookController
{
    public static function info()
    {
        return [
            'name'              => 'PaymentForm.io',
            'title'             => __('Get PaymentForm.io submission, payment and subscription events through a webhook URL', 'bit-integrations'),
            'type'              => 'webhook',
            'documentation_url' => 'https://paymentform.io/docs/global-settings/webhooks-and-integrations/',
            'tutorial_url'      => '#',
            'is_active'         => true,
            'isPro'             => false
        ];
    }
}
