<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthorizationFactory;

/**
 * Injects resolved connection credentials into flow_details or request params
 * before action code runs. Only fires when connection_id is present (new flows).
 * Old flows (inline credentials, no connection_id) are never touched.
 */
class CredentialInjector
{
    /**
     * @param object $target          $flowDetails or $requestParams — mutated in place
     * @param string $controllerClass Action controller class name
     */
    public static function inject(object $target, string $controllerClass): void
    {
        $connectionId = (int) ($target->connection_id ?? 0);

        if ($connectionId <= 0) {
            return;
        }

        if (!property_exists($controllerClass, 'authConfig')) {
            return;
        }

        $config = $controllerClass::$authConfig;

        try {
            $handler = AuthorizationFactory::getAuthorizationHandler(
                $config['authType'],
                $connectionId,
                $config['slug']
            );
            $authDetails = $handler->getAuthDetails();
        } catch (\Throwable $e) {
            // Unknown auth type or a decrypt error can throw here. Skip injection so
            // the action runs with its own (un-injected) fields and fails its own
            // validation — this keeps the "no exception escapes Flow::execute" invariant.
            return;
        }

        // A missing connection or a decrypt failure otherwise surfaces as null or an
        // empty set. Skip injection rather than flattening empty strings onto every
        // field — which would silently ship blank credentials to the action.
        if (!\is_array($authDetails) || $authDetails === []) {
            return;
        }

        foreach ($config['fields'] as $oldField => $authKey) {
            if ($oldField === '__object') {
                // Nested object injection: $authKey = [$targetProp, [$key1, $key2, ...]]
                [$targetProp, $keys] = $authKey;
                $obj = new \stdClass();
                foreach ($keys as $key) {
                    if ($key === 'generates_on' && empty($authDetails[$key]) && !empty($authDetails['generated_at'])) {
                        $obj->$key = (int) $authDetails['generated_at'];
                        continue;
                    }

                    if ($key === 'generated_at' && empty($authDetails[$key]) && !empty($authDetails['generates_on'])) {
                        $obj->$key = (int) $authDetails['generates_on'];
                        continue;
                    }

                    $obj->$key = $authDetails[$key] ?? '';
                }
                $target->$targetProp = $obj;
            } else {
                $target->$oldField = $authDetails[$authKey] ?? '';
            }
        }
    }
}
