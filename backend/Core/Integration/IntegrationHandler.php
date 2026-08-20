<?php

namespace BitApps\Integrations\Core\Integration;

class IntegrationHandler
{
    private static $fieldValues = [];

    private static $reexecuteParent = [];

    public static function executeWithCapture($flowData, $fieldValues, $handler)
    {
        self::storeFieldValues($flowData->id, $fieldValues);

        return $handler->execute($flowData, $fieldValues);
    }

    public static function getFieldValues($flowId)
    {
        if (isset(self::$fieldValues[$flowId])) {
            return self::$fieldValues[$flowId];
        }

        return null;
    }

    public static function setReexecuteParent($flowId, $parentLogId)
    {
        self::$reexecuteParent[$flowId] = $parentLogId;
    }

    public static function getReexecuteParent($flowId)
    {
        return isset(self::$reexecuteParent[$flowId]) ? self::$reexecuteParent[$flowId] : null;
    }

    public static function clearReexecuteParent($flowId = null)
    {
        if (null === $flowId) {
            self::$reexecuteParent = [];

            return;
        }

        unset(self::$reexecuteParent[$flowId]);
    }

    private static function storeFieldValues($flowId, $fieldValues)
    {
        self::$fieldValues[$flowId] = $fieldValues;
    }
}
