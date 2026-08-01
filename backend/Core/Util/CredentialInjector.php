<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Authorization\AuthorizationFactory;
use stdClass;
use Throwable;

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

            // connection_id arrives from the request/flow and is only ever an integer,
            // so nothing about it says which app it belongs to. Bind it to the
            // controller asking for it: otherwise pointing a MailChimp action at a
            // Salesforce connection_id would decrypt Salesforce's token and ship it to
            // MailChimp's endpoint.
            if (!self::belongsToIntegration($handler->getConnection(), $config)) {
                self::debug($controllerClass, "connection {$connectionId} belongs to a different app");

                return;
            }

            $authDetails = $handler->getAuthDetails();
        } catch (Throwable $e) {
            // Unknown auth type or a decrypt error can throw here. Skip injection so
            // the action runs with its own (un-injected) fields and fails its own
            // validation — this keeps the "no exception escapes Flow::execute" invariant.
            self::debug($controllerClass, $e->getMessage());

            return;
        }

        // A missing connection or a decrypt failure otherwise surfaces as null or an
        // empty set. Skip injection rather than flattening empty strings onto every
        // field — which would silently ship blank credentials to the action.
        if (!\is_array($authDetails) || $authDetails === []) {
            // getLastError() carries the real reason (expired refresh, decrypt failure);
            // without it the action only reports "missing parameters".
            $reason = method_exists($handler, 'getLastError') ? $handler->getLastError() : null;
            self::debug($controllerClass, $reason['message'] ?? 'no auth details resolved');

            return;
        }

        foreach ($config['fields'] as $oldField => $authKey) {
            if ($oldField === '__object') {
                // Nested object injection: $authKey = [$targetProp, [$key1, $key2, ...]]
                [$targetProp, $keys] = $authKey;
                $obj = new stdClass();
                foreach ($keys as $key) {
                    if ($key === 'generates_on' && empty($authDetails[$key]) && !empty($authDetails['generated_at'])) {
                        $obj->{$key} = (int) $authDetails['generated_at'];

                        continue;
                    }

                    if ($key === 'generated_at' && empty($authDetails[$key]) && !empty($authDetails['generates_on'])) {
                        $obj->{$key} = (int) $authDetails['generates_on'];

                        continue;
                    }

                    $obj->{$key} = $authDetails[$key] ?? '';
                }
                $target->{$targetProp} = $obj;
            } else {
                $target->{$oldField} = $authDetails[$authKey] ?? '';
            }
        }
    }

    /**
     * Whether $connection was created for the integration declaring $config.
     *
     * app_slug is stored as the integration's display name ("Zoho CRM") while
     * $authConfig carries a bare slug ("zohocrm"), so both sides are reduced to
     * alphanumerics before comparing. Names that carry a second brand word
     * ("Brevo(Sendinblue)" for slug "sendinblue") cannot reduce to the slug at all,
     * so those integrations declare the stored names in $authConfig['aliases'] —
     * an explicit list rather than a substring match, which would let a "Zoho"
     * connection satisfy every zoho* controller. A connection that cannot be
     * loaded at all is left to the caller's own null handling.
     *
     * @param mixed                $connection
     * @param array<string, mixed> $config     Controller's $authConfig
     */
    private static function belongsToIntegration($connection, array $config): bool
    {
        if (empty($connection) || empty($connection->app_slug)) {
            return true;
        }

        $normalize = static function ($value) {
            return strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $value));
        };

        $accepted = array_map($normalize, array_merge([$config['slug']], $config['aliases'] ?? []));

        return \in_array($normalize($connection->app_slug), $accepted, true);
    }

    /**
     * Credential resolution fails silently by design — the flow must not fatal — but
     * silence made a broken connection indistinguishable from a missing field. Log the
     * reason under WP_DEBUG only, and never the credentials themselves.
     */
    private static function debug(string $controllerClass, string $reason): void
    {
        if (!\defined('WP_DEBUG') || !WP_DEBUG) {
            return;
        }

        // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Diagnostic, not leftover debug code: this path swallows every credential-resolution failure to keep the flow from fataling, which otherwise reports a broken connection as a missing parameter. Gated on WP_DEBUG and logs only the controller and the reason — never auth details.
        error_log(\sprintf('CredentialInjector: skipped injection for %s — %s', $controllerClass, $reason));
    }
}
