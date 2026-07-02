<?php

namespace BitApps\Integrations\Core\Integration;

/**
 * Integration Handler Wrapper
 * Automatically captures field data for every execution so a flow can be re-executed.
 */
class IntegrationHandler
{
    /**
     * Execute an integration with automatic field data capture.
     * Only captures field values; execution and any thrown exception behave exactly as a direct
     * $handler->execute() call (no added catch), preserving the pre-feature error-handling behavior.
     *
     * @param object $flowData    Integration flow data
     * @param mixed  $fieldValues Field values from trigger
     * @param object $handler     Integration handler instance
     *
     * @return mixed
     */
    public static function executeWithCapture($flowData, $fieldValues, $handler)
    {
        // Store the field values so LogHandler::save() can persist them for this execution.
        self::storeFieldValues($flowData->id, $fieldValues);

        return $handler->execute($flowData, $fieldValues);
    }

    /**
     * Get stored field values for a flow.
     *
     * @param int $flowId Flow ID
     *
     * @return mixed|null
     */
    public static function getFieldValues($flowId)
    {
        global $btcbi_current_field_values;

        if (isset($btcbi_current_field_values[$flowId])) {
            return $btcbi_current_field_values[$flowId];
        }

        return null;
    }

    /**
     * Mark that a specific flow is being re-executed from a specific parent log entry.
     * Keyed by flow id so only that flow's log rows are linked to the parent — a different flow
     * that fires synchronously during the re-run (e.g. via a WP hook) is not mis-stamped.
     *
     * @param int $flowId      The flow being re-executed
     * @param int $parentLogId The log id being re-executed
     *
     * @return void
     */
    public static function setReexecuteParent($flowId, $parentLogId)
    {
        global $btcbi_reexecute_parent;

        if (!isset($btcbi_reexecute_parent)) {
            $btcbi_reexecute_parent = [];
        }

        $btcbi_reexecute_parent[$flowId] = $parentLogId;
    }

    /**
     * Get the parent log id a given flow is currently being re-executed from, if any.
     *
     * @param int $flowId The flow id being logged
     *
     * @return int|null
     */
    public static function getReexecuteParent($flowId)
    {
        global $btcbi_reexecute_parent;

        return isset($btcbi_reexecute_parent[$flowId]) ? $btcbi_reexecute_parent[$flowId] : null;
    }

    /**
     * Clear the re-execution parent marker for a flow (or all flows).
     *
     * @param int|null $flowId Flow id to clear, or null to clear every marker
     *
     * @return void
     */
    public static function clearReexecuteParent($flowId = null)
    {
        global $btcbi_reexecute_parent;

        if (null === $flowId) {
            $btcbi_reexecute_parent = [];

            return;
        }

        unset($btcbi_reexecute_parent[$flowId]);
    }

    /**
     * Store field values temporarily for this request.
     *
     * @param int   $flowId      Flow ID
     * @param mixed $fieldValues Field values
     *
     * @return void
     */
    private static function storeFieldValues($flowId, $fieldValues)
    {
        global $btcbi_current_field_values;

        if (!isset($btcbi_current_field_values)) {
            $btcbi_current_field_values = [];
        }

        $btcbi_current_field_values[$flowId] = $fieldValues;
    }
}
