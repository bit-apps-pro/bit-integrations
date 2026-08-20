<?php

namespace BitApps\Integrations\Actions;

use BitApps\Integrations\Core\Http\OauthCallbackController;
use WP_Error;
use WP_REST_Request;

final class ActionController
{
    /**
     * Legacy OAuth redirect endpoint, kept for apps still registered with it.
     */
    public function handleRedirect(WP_REST_Request $request)
    {
        $state = $request->get_param('state');

        $params = $request->get_params();
        unset($params['rest_route'], $params['state']);

        if (!OauthCallbackController::redirectToState($state, $params)) {
            return new WP_Error('invalid_state', __('Invalid redirect state.', 'bit-integrations'), ['status' => 404]);
        }
    }
}
