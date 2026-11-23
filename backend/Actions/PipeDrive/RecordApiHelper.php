<?php

namespace BitApps\Integrations\Actions\PipeDrive;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    public const V2_BASE_URL = 'https://api.pipedrive.com/api/v2/';

    private const V2_MODULES = ['persons', 'organizations', 'deals', 'activities', 'products'];

    private const V1_BASE_URL = 'https://api.pipedrive.com/v1/';

    private const FIELDS_ENDPOINT = [
        'persons'       => 'personFields',
        'organizations' => 'organizationFields',
        'deals'         => 'dealFields',
        'activities'    => 'activityFields',
        'products'      => 'productFields',
    ];

    private const NUMERIC_FIELDS = [
        'owner_id', 'org_id', 'person_id', 'stage_id', 'pipeline_id', 'deal_id', 'visible_to', 'channel', 'industry', 'priority', 'outcome',
        'value', 'probability', 'tax', 'annual_revenue', 'employee_count',
    ];

    private const SUB_FIELDS = [
        'currency', 'until', 'timezone_id', 'lat', 'long', 'subpremise', 'street_number', 'route', 'sublocality', 'locality',
        'admin_area_level_1', 'admin_area_level_2', 'country', 'postal_code', 'formatted_address',
    ];

    private const NUMERIC_TYPES =['double', 'monetary', 'int', 'user', 'org', 'people', 'stage', 'visible_to'];

    private const CACHE_TTL = 12 * HOUR_IN_SECONDS;

    private static $fieldMeta = [];

    private static $fieldMetaRefreshed = [];

    private static $defaultCurrency = [];

    private $_integrationDetails;

    private $_integrationID;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function insertRecord(
        $module,
        $finalData
    ) {
        $moduleData = $this->_integrationDetails->moduleData;
        $actions = $this->_integrationDetails->actions;

        if ($module !== 'products') {
            if (isset($moduleData->organization_id)) {
                if ($module !== 'leads') {
                    $finalData['org_id'] = $moduleData->organization_id;
                } else {
                    $finalData['organization_id'] = $moduleData->organization_id;
                }
            }
            if (isset($moduleData->person_id)) {
                $finalData['person_id'] = $moduleData->person_id;
            }
            if ($module === 'leads' && isset($actions->currency) && !empty($actions->currency)) {
                $finalData['value'] = (object) [
                    'amount'   => isset($finalData['value']) ? (int) $finalData['value'] : 0,
                    'currency' => $moduleData->currency,
                ];
                unset($finalData['currency']);
            }
            if ($module === 'leads' && !isset($actions->currency) && isset($finalData['value'])) {
                $finalData['value'] = (object) [
                    'amount' => (int) $finalData['value']
                ];
                unset($finalData['value']);
            }
        }
        if (isset($moduleData->owner) && !empty($moduleData->owner)) {
            $finalData[$module === 'notes' ? 'user_id' : 'owner_id'] = (int) $moduleData->owner;
        }
        if (isset($moduleData->lead_label) && !empty($moduleData->lead_label)) {
            $finalData['label_ids'] = explode(',', $moduleData->lead_label);
        }
        if (isset($moduleData->deal_stage) && !empty($moduleData->deal_stage)) {
            $finalData['stage_id'] = (int) $moduleData->deal_stage;
        }
        if (isset($moduleData->activities_type) && !empty($moduleData->activities_type)) {
            $finalData['type'] = $moduleData->activities_type;
        }
        if (isset($actions->busy_flag) && !empty($actions->busy_flag)) {
            $finalData['busy_flag'] = true;
        }
        if (isset($actions->active_flag) && !empty($actions->active_flag)) {
            $finalData['active_flag'] = 0;
        }

        if (isset($actions->currency) && !empty($actions->currency)) {
            if ($module === 'deals') {
                $finalData['currency'] = $moduleData->currency;
            }

            if ($module === 'products') {
                $finalData['prices'] = [(object) [
                    'currency'      => $moduleData->currency,
                    'price'         => isset($finalData['price']) ? (int) $finalData['price'] : 0,
                    'cost'          => isset($finalData['cost']) ? (int) $finalData['cost'] : 0,
                    'overhead_cost' => isset($finalData['overhead_cost']) ? (int) $finalData['overhead_cost'] : 0,
                ]];
                unset($finalData['price'], $finalData['cost'],$finalData['overhead_cost']);
            }
        }
        if ($module === 'products' && !isset($actions->currency)) {
            $finalData['prices'] = [(object) [
                'price'         => isset($finalData['price']) ? (int) $finalData['price'] : 0,
                'cost'          => isset($finalData['cost']) ? (int) $finalData['cost'] : 0,
                'overhead_cost' => isset($finalData['overhead_cost']) ? (int) $finalData['overhead_cost'] : 0,
            ]];
            unset($finalData['price'], $finalData['cost'],$finalData['overhead_cost']);
        }
        if (isset($actions->deal_status) && !empty($actions->deal_status)) {
            $finalData['status'] = $moduleData->deal_status;
        }

        if (isset($actions->visible_to) && !empty($actions->visible_to)) {
            $finalData['visible_to'] = $moduleData->visible_to;
        }

        if (isset($actions->activities_participants) && !empty($actions->activities_participants)) {
            $participants = explode(',', $moduleData->activities_participants);
            $allParticipants = [];
            foreach ($participants as $participant) {
                $allParticipants[] = (object) [
                    'person_id'    => (int) $participant,
                    'primary_flag' => false
                ];
            }
            $finalData['participants'] = $allParticipants;
        }

        $apiKey = !empty($this->_integrationDetails->api_key) ? $this->_integrationDetails->api_key : ($this->_integrationDetails->value ?? '');

        $deleteAfterCreate = ($module === 'deals' && !empty($actions->deal_status) && ($moduleData->deal_status ?? '') === 'deleted')
            || ($module === 'products' && !empty($actions->active_flag));

        return static::createRecord($module, $finalData, (string) $apiKey, $deleteAfterCreate);
    }

    public static function createRecord($module, $payload, $apiKey, $deleteAfterCreate = false)
    {
        $headers = ['content-type' => 'application/json'];

        if (!\in_array($module, self::V2_MODULES, true)) {
            return HttpHelper::post(self::V1_BASE_URL . $module . '?api_token=' . rawurlencode($apiKey), wp_json_encode($payload), $headers);
        }

        $body = static::toV2Payload($module, $payload, $apiKey);
        $response = HttpHelper::post(static::v2Url($module, $apiKey), wp_json_encode((object) $body), $headers);
        $rejectedParams = static::rejectedParams($response);

        if (!empty($rejectedParams)) {
            $response = HttpHelper::post(static::v2Url($module, $apiKey), wp_json_encode((object) static::withoutParams($body, $rejectedParams)), $headers);

            if (\is_object($response)) {
                $response->ignored_fields = $rejectedParams;
            }
        }

        if ($deleteAfterCreate && !empty($response->success) && isset($response->data->id)) {
            HttpHelper::delete(static::v2Url($module . '/' . (int) $response->data->id, $apiKey), null, $headers);
        }

        return $response;
    }

    public static function v2Url($path, $apiKey, $query = [])
    {
        $query['api_token'] = $apiKey;

        return self::V2_BASE_URL . $path . '?' . http_build_query($query);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->pipeDriveFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = \is_array($data[$triggerValue]) ? implode(',', $data[$triggerValue]) : $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute(
        $fieldValues,
        $fieldMap,
        $module
    ) {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->insertRecord(
            $module,
            $finalData
        );

        if (is_wp_error($apiResponse) || empty($apiResponse->success)) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $module, 'type_name' => 'add-' . $module]), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $module, 'type_name' => 'add-' . $module]), 'success', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private static function toV2Payload($module, $payload, $apiKey)
    {
        $payload = static::renameV1Keys($module, $payload);
        $subFields = static::extractSubFields($payload);
        $body = [];
        $customFields = [];

        foreach ($payload as $key => $value) {
            if ($value === null || $value === '' || $value === []) {
                continue;
            }

            if (static::isCustomFieldKey($key)) {
                $customFields[$key] = static::castCustomField($module, $apiKey, $key, $value, $payload);
            } else {
                $body[$key] = static::castStandardField($module, $apiKey, $key, $value);
            }
        }

        foreach ($subFields as $parent => $parts) {
            if (static::isCustomFieldKey($parent)) {
                $customFields[$parent] = static::mergeSubFields($customFields[$parent] ?? null, $parts);
            } else {
                $body[$parent] = static::mergeSubFields($body[$parent] ?? null, $parts);
            }
        }

        $body = array_filter($body, fn ($value) => $value !== null);
        $customFields = array_filter($customFields, fn ($value) => $value !== null);

        if (!empty($customFields)) {
            $body['custom_fields'] = $customFields;
        }

        switch ($module) {
            case 'persons':
                return static::shapePerson($body);
            case 'organizations':
                if (isset($body['address']) && \is_scalar($body['address'])) {
                    $body['address'] = ['value' => (string) $body['address']];
                }

                return $body;
            case 'activities':
                return static::shapeActivity($body);
            case 'products':
                return static::shapeProduct($body, $apiKey);
        }

        return $body;
    }

    private static function renameV1Keys($module, $payload)
    {
        if (isset($payload['user_id']) && !isset($payload['owner_id'])) {
            $payload['owner_id'] = $payload['user_id'];
        }

        if (isset($payload['busy_flag']) && $module === 'activities') {
            $payload['busy'] = (bool) $payload['busy_flag'];
        }

        if (isset($payload['label']) && !isset($payload['label_ids'])) {
            $payload['label_ids'] = $payload['label'];
        }

        if ($module === 'deals' && isset($payload['status']) && $payload['status'] === 'deleted') {
            unset($payload['status']);
        }

        unset($payload['user_id'], $payload['busy_flag'], $payload['label'], $payload['active_flag']);

        return $payload;
    }

    private static function extractSubFields(&$payload)
    {
        $subFields = [];
        $pattern = '/^([a-f0-9]{40}|address|location|postal_address)_(' . implode('|', self::SUB_FIELDS) . ')$/';

        foreach ($payload as $key => $value) {
            if (!preg_match($pattern, (string) $key, $match)) {
                continue;
            }

            unset($payload[$key]);

            if ($value !== null && $value !== '' && !\in_array($match[2], ['lat', 'long'], true)) {
                $subFields[$match[1]][$match[2]] = (string) $value;
            }
        }

        return $subFields;
    }

    private static function mergeSubFields($parentValue, $parts)
    {
        $formattedAddress = $parts['formatted_address'] ?? null;
        unset($parts['formatted_address']);

        if ($parentValue !== null && !\is_array($parentValue)) {
            $parentValue = ['value' => (string) $parentValue];
        }

        if (!isset($parentValue['value'])) {
            $addressParts = array_diff_key($parts, array_flip(['currency', 'until', 'timezone_id']));

            if ($formattedAddress === null && empty($addressParts)) {
                return $parentValue;
            }

            $parentValue['value'] = $formattedAddress ?? implode(', ', $addressParts);
        }

        return array_merge($parentValue, $parts);
    }

    private static function rejectedParams($response)
    {
        if (!\is_object($response) || ($response->code ?? '') !== 'ERR_SCHEMA_VALIDATION_FAILED') {
            return [];
        }

        preg_match_all("/Parameter '([^']+)' is not allowed/", (string) ($response->error ?? ''), $matches);

        return array_values(array_unique($matches[1]));
    }

    private static function withoutParams($body, $params)
    {
        foreach ($params as $param) {
            $path = explode('.', $param);

            if (\count($path) === 1 && !\array_key_exists($param, $body)) {
                $path = ['custom_fields', $param];
            }

            $last = array_pop($path);
            $node = &$body;

            foreach ($path as $key) {
                if (!isset($node[$key]) || !\is_array($node[$key])) {
                    unset($node);

                    continue 2;
                }

                $node = &$node[$key];
            }

            unset($node[$last], $node);
        }

        if (isset($body['custom_fields']) && empty($body['custom_fields'])) {
            unset($body['custom_fields']);
        }

        return $body;
    }

    private static function castStandardField($module, $apiKey, $key, $value)
    {
        if ($key === 'label_ids') {
            return array_map([static::class, 'toNumber'], static::toList($value));
        }

        if (\in_array($key, self::NUMERIC_FIELDS, true)) {
            return static::toNumber($value);
        }

        if (\in_array($key, ['busy', 'done'], true)) {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }

        if (!\is_scalar($value)) {
            return $value;
        }

        $meta = static::fieldMeta($module, $apiKey, $key);
        $options = $meta['options'] ?? [];

        switch ($meta['type'] ?? '') {
            case 'enum':
                return static::optionId($value, $options);
            case 'set':
                return array_map(fn ($item) => static::optionId($item, $options), static::toList($value));
            case 'address':
                return ['value' => (string) $value];
            case 'date':
                return static::toDate($value);
        }

        return \in_array($meta['type'] ?? '', self::NUMERIC_TYPES, true) ? static::toNumber($value) : $value;
    }

    private static function castCustomField($module, $apiKey, $key, $value, $payload)
    {
        if (!\is_scalar($value)) {
            return $value;
        }

        $meta = static::fieldMeta($module, $apiKey, $key);
        $options = $meta['options'] ?? [];

        switch ($meta['type'] ?? '') {
            case 'monetary':
                return ['value' => static::toNumber($value), 'currency' => $payload['currency'] ?? static::defaultCurrency($apiKey)];
            case 'enum':
                return static::optionId($value, $options);
            case 'set':
                return array_map(fn ($item) => static::optionId($item, $options), static::toList($value));
            case 'address':
                return ['value' => (string) $value];
            case 'date':
                return static::toDate($value);
            case 'daterange':
                $date = static::toDate($value);

                return $date === null ? null : ['value' => $date];
            case 'time':
            case 'timerange':
                return ['value' => static::toTime($value)];
        }

        return \in_array($meta['type'] ?? '', self::NUMERIC_TYPES, true) ? static::toNumber($value) : $value;
    }

    private static function shapePerson($body)
    {
        foreach (['email' => 'emails', 'phone' => 'phones'] as $v1Key => $v2Key) {
            if (isset($body[$v1Key]) && !isset($body[$v2Key])) {
                $body[$v2Key] = [['value' => (string) $body[$v1Key], 'primary' => true, 'label' => 'work']];
            }
            unset($body[$v1Key]);
        }

        return $body;
    }

    private static function shapeActivity($body)
    {
        if (isset($body['location']) && \is_scalar($body['location'])) {
            $body['location'] = ['value' => (string) $body['location']];
        }

        $primaryPersonId = isset($body['person_id']) ? (int) $body['person_id'] : 0;
        $participants = [];

        foreach ((array) ($body['participants'] ?? []) as $participant) {
            $personId = (int) (((array) $participant)['person_id'] ?? 0);
            if ($personId && $personId !== $primaryPersonId) {
                $participants[] = ['person_id' => $personId, 'primary' => false];
            }
        }

        if ($primaryPersonId) {
            array_unshift($participants, ['person_id' => $primaryPersonId, 'primary' => true]);
        }

        unset($body['person_id'], $body['participants'], $body['visible_to']);

        if (!empty($participants)) {
            $body['participants'] = $participants;
        }

        return $body;
    }

    private static function shapeProduct($body, $apiKey)
    {
        $currency = $body['currency'] ?? null;
        $prices = isset($body['prices']) ? array_map(fn ($price) => (array) $price, (array) $body['prices']) : [];

        if (empty($prices) && (isset($body['price']) || isset($body['cost']) || isset($body['overhead_cost']))) {
            $prices[] = ['price' => $body['price'] ?? 0, 'cost' => $body['cost'] ?? 0, 'overhead_cost' => $body['overhead_cost'] ?? 0];
        }

        unset($body['prices'], $body['price'], $body['cost'], $body['overhead_cost'], $body['currency']);

        foreach ($prices as $price) {
            $body['prices'][] = [
                'price'       => static::toNumber($price['price'] ?? 0),
                'cost'        => static::toNumber($price['cost'] ?? 0),
                'direct_cost' => static::toNumber($price['direct_cost'] ?? $price['overhead_cost'] ?? 0),
                'currency'    => $price['currency'] ?? $currency ?? static::defaultCurrency($apiKey),
            ];
        }

        return $body;
    }

    private static function fieldMeta($module, $apiKey, $key)
    {
        $cacheKey = $module . '_' . md5($apiKey);

        if (!isset(self::$fieldMeta[$cacheKey])) {
            self::$fieldMeta[$cacheKey] = static::loadFieldMeta($module, $apiKey, false);
        }

        if (!isset(self::$fieldMeta[$cacheKey][$key]) && static::isCustomFieldKey($key) && empty(self::$fieldMetaRefreshed[$cacheKey])) {
            self::$fieldMetaRefreshed[$cacheKey] = true;
            self::$fieldMeta[$cacheKey] = static::loadFieldMeta($module, $apiKey, true) ?: self::$fieldMeta[$cacheKey];
        }

        return self::$fieldMeta[$cacheKey][$key] ?? [];
    }

    private static function loadFieldMeta($module, $apiKey, $refresh)
    {
        $transientKey = Config::withPrefix('pipedrive_fields_' . md5($apiKey . $module));
        $cached = $refresh ? false : get_transient($transientKey);

        if (\is_array($cached)) {
            return $cached;
        }

        $response = HttpHelper::get(self::V1_BASE_URL . self::FIELDS_ENDPOINT[$module] . '?limit=500&api_token=' . rawurlencode($apiKey), null);

        if (empty($response->success)) {
            return [];
        }

        $meta = [];
        foreach ((array) $response->data as $field) {
            $options = [];
            foreach ((array) ($field->options ?? []) as $option) {
                $options[strtolower(trim((string) $option->label))] = $option->id;
            }

            $meta[$field->key] = ['type' => $field->field_type ?? '', 'options' => $options];
        }

        set_transient($transientKey, $meta, self::CACHE_TTL);

        return $meta;
    }

    private static function defaultCurrency($apiKey)
    {
        $cacheKey = md5($apiKey);

        if (\array_key_exists($cacheKey, self::$defaultCurrency)) {
            return self::$defaultCurrency[$cacheKey];
        }

        $transientKey = Config::withPrefix('pipedrive_currency_' . $cacheKey);
        $currency = get_transient($transientKey);

        if (!$currency) {
            $response = HttpHelper::get(self::V1_BASE_URL . 'users/me?api_token=' . rawurlencode($apiKey), null);
            $currency = $response->data->default_currency ?? '';

            if ($currency) {
                set_transient($transientKey, $currency, self::CACHE_TTL);
            }
        }

        return self::$defaultCurrency[$cacheKey] = $currency ?: null;
    }

    private static function isCustomFieldKey($key)
    {
        return (bool) preg_match('/^[a-f0-9]{40}$/', (string) $key);
    }

    private static function toNumber($value)
    {
        if (\is_string($value)) {
            $value = trim($value);
        }

        return is_numeric($value) ? $value + 0 : $value;
    }

    private static function toList($value)
    {
        if (\is_array($value)) {
            return $value;
        }

        return array_values(array_filter(array_map('trim', explode(',', (string) $value)), 'strlen'));
    }

    private static function optionId($value, $options)
    {
        if (is_numeric($value)) {
            return (int) $value;
        }

        $label = strtolower(trim((string) $value));

        if (!isset($options[$label])) {
            return $value;
        }

        return is_numeric($options[$label]) ? (int) $options[$label] : $options[$label];
    }

    private static function toDate($value)
    {
        $value = trim((string) $value);

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return $value;
        }

        $timestamp = strtotime($value);

        return $timestamp === false ? null : gmdate('Y-m-d', $timestamp);
    }

    private static function toTime($value)
    {
        $value = trim((string) $value);

        return preg_match('/^\d{1,2}:\d{2}$/', $value) ? $value . ':00' : $value;
    }
}
