<?php

namespace BitApps\Integrations\Log;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Database\DB;
use BitApps\Integrations\Core\Database\LogModel;
use BitApps\Integrations\Core\Integration\IntegrationHandler;
use BitApps\Integrations\Core\Util\Capabilities;
use BitApps\Integrations\Core\Util\EmailNotification;
use BitApps\Integrations\Flow\Flow;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

final class LogHandler
{
    public function __construct()
    {
        //
    }

    public function get($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }

        if (!isset($data->id)) {
            wp_send_json_error(__('Integration Id can\'t be empty', 'bit-integrations'));
        }
        $offset = isset($data->offset) ? (int) $data->offset : 0;
        $limit = 10;
        if (isset($data->pageSize)) {
            $limit = (int) $data->pageSize;
        }
        if (isset($data->limit)) {
            $limit = (int) $data->limit;
        }

        // Grouped mode: paginate original runs and nest their re-executions (children) underneath,
        // so a re-run always appears with its parent regardless of which page the parent lands on.
        $status = isset($data->status) ? (string) $data->status : 'all';
        $search = isset($data->search) ? trim((string) $data->search) : '';
        $hasReexecCols = self::logColumnsReady();

        // Any active status/search filter is served by a correctly-paginated FLAT query — even on
        // installs where the re-execution columns are missing (it queries base columns only there).
        if ('all' !== $status || '' !== $search) {
            $filtered = self::getFilteredLogs($data->id, $limit, $offset, $status, $search, $hasReexecCols);
            wp_send_json_success(
                [
                    'count' => $filtered['count'],
                    'data'  => $filtered['data'],
                ]
            );
        }

        if ($hasReexecCols) {
            $grouped = self::getGroupedLogs($data->id, $limit, $offset);
            wp_send_json_success(
                [
                    'count' => $grouped['count'],
                    'data'  => $grouped['data'],
                ]
            );
        }

        // Fallback (columns not migrated yet, no filter active): flat, unnested list.
        $logModel = new LogModel();
        $countResult = $logModel->count(['flow_id' => $data->id]);
        if (is_wp_error($countResult)) {
            wp_send_json_success(['count' => 0, 'data' => []]);
        }
        $count = $countResult[0]->count;
        if ($count < 1) {
            wp_send_json_success(['count' => 0, 'data' => []]);
        }

        $result = $logModel->get('*', ['flow_id' => $data->id], $limit, $offset, 'id', 'desc');
        if (is_wp_error($result)) {
            wp_send_json_success(['count' => 0, 'data' => []]);
        }

        wp_send_json_success(
            [
                'count' => \intval($count),
                'data'  => $result,
            ]
        );
    }

    /**
     * Whether the re-execution columns exist. Cached (static + option) to avoid an
     * INFORMATION_SCHEMA lookup on every log/get request.
     *
     * @return bool
     */
    private static function logColumnsReady()
    {
        static $ready = null;

        if (null !== $ready) {
            return $ready;
        }

        if (Config::getOption('log_columns_ready') === '2') {
            $ready = true;

            return true;
        }

        $ready = DB::logColumnsExist();

        return $ready;
    }

    /**
     * Fetch a page of original log entries with their re-executions nested underneath.
     * Returns a depth-ordered flat list (each original followed by its descendant re-runs) plus the
     * total count of ORIGINAL entries (used for pagination).
     *
     * @param int $flowId Flow id
     * @param int $limit  Page size (originals per page)
     * @param int $offset Offset into the originals
     *
     * @return array{count:int, data:array}
     */
    private static function getGroupedLogs($flowId, $limit, $offset)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'btcbi_log';
        $flowId = (int) $flowId;

        // Select explicit columns and expose only a boolean for the heavy field_data LONGTEXT, so the
        // list never loads or ships the full trigger payloads (fetched lazily per row for the preview).
        $cols = "id, flow_id, job_id, api_type, response_type, response_obj, parent_id, created_at, (field_data IS NOT NULL AND field_data <> '') AS has_field_data";

        // A row is a "top-level" entry when it is an original (parent_id IS NULL) OR its parent has
        // been deleted (orphaned re-run) — so nothing is ever hidden from the list.
        $rootWhere = "flow_id = %d AND (parent_id IS NULL OR parent_id NOT IN (SELECT id FROM `{$table}` sub WHERE sub.flow_id = %d))";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name from $wpdb->prefix; values prepared
        $count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `{$table}` WHERE {$rootWhere}", $flowId, $flowId));
        if ($count < 1) {
            return ['count' => 0, 'data' => []];
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name from $wpdb->prefix; values prepared
        $tops = $wpdb->get_results($wpdb->prepare("SELECT {$cols} FROM `{$table}` WHERE {$rootWhere} ORDER BY id DESC LIMIT %d OFFSET %d", $flowId, $flowId, (int) $limit, (int) $offset));

        // Re-executions are rare, so fetch them all for this flow (without the LONGTEXT payload) and nest.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name from $wpdb->prefix; values prepared
        $descendants = $wpdb->get_results($wpdb->prepare("SELECT {$cols} FROM `{$table}` WHERE flow_id = %d AND parent_id IS NOT NULL ORDER BY id DESC", $flowId));

        $childrenBy = [];
        foreach ((array) $descendants as $row) {
            $pid = (string) $row->parent_id;
            if (!isset($childrenBy[$pid])) {
                $childrenBy[$pid] = [];
            }
            $childrenBy[$pid][] = $row;
        }

        // Nest each re-run under the exact entry it was re-executed from (true tree).
        $ordered = [];
        foreach ((array) $tops as $top) {
            self::appendWithChildren($top, 0, $childrenBy, $ordered);
        }

        foreach ($ordered as $row) {
            // has_field_data arrives as the string "1"/"0" from the DB; normalise to a real boolean.
            $row->has_field_data = (bool) (int) $row->has_field_data;
        }

        return ['count' => $count, 'data' => $ordered];
    }

    /**
     * Fetch a correctly-paginated FLAT list of log rows for the active status/search filter.
     * Runs entirely server-side so counts and paging reflect the whole flow, not just one page.
     *
     * @param int    $flowId        Flow id
     * @param int    $limit         Page size
     * @param int    $offset        Offset
     * @param string $status        'all' | 'success' | 'failed'
     * @param string $search        Free-text search
     * @param bool   $hasReexecCols Whether the field_data/parent_id columns exist
     *
     * @return array{count:int, data:array}
     */
    private static function getFilteredLogs($flowId, $limit, $offset, $status, $search, $hasReexecCols = true)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'btcbi_log';
        $cols = $hasReexecCols
            ? "id, flow_id, job_id, api_type, response_type, response_obj, parent_id, created_at, (field_data IS NOT NULL AND field_data <> '') AS has_field_data"
            : 'id, flow_id, job_id, api_type, response_type, response_obj, created_at, 0 AS has_field_data';

        $where = 'flow_id = %d';
        $params = [(int) $flowId];

        if ('success' === $status) {
            $where .= " AND response_type = 'success'";
        } elseif ('failed' === $status) {
            $where .= " AND response_type IN ('error', 'validation')";
        }

        if ('' !== $search) {
            $like = '%' . $wpdb->esc_like(ltrim($search, '#')) . '%';
            $where .= ' AND (CAST(id AS CHAR) LIKE %s OR response_type LIKE %s OR api_type LIKE %s OR response_obj LIKE %s)';
            array_push($params, $like, $like, $like, $like);
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table from prefix; WHERE clause is literal SQL with %d/%s placeholders bound below
        $count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `{$table}` WHERE {$where}", $params));
        if ($count < 1) {
            return ['count' => 0, 'data' => []];
        }

        $rowParams = array_merge($params, [(int) $limit, (int) $offset]);
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table/columns are constants; WHERE is literal SQL; values bound below
        $rows = $wpdb->get_results($wpdb->prepare("SELECT {$cols} FROM `{$table}` WHERE {$where} ORDER BY id DESC LIMIT %d OFFSET %d", $rowParams));

        foreach ((array) $rows as $row) {
            $row->depth = 0;
            $row->child_count = 0;
            $row->has_field_data = (bool) (int) $row->has_field_data;
        }

        return ['count' => $count, 'data' => (array) $rows];
    }

    /**
     * Depth-first append a row and its re-execution descendants, tagging each with its nesting depth.
     *
     * @param object $row        Log row
     * @param int    $depth      Nesting depth (0 = original)
     * @param array  $childrenBy Map of parent id => child rows
     * @param array  $ordered    Output accumulator (by reference)
     *
     * @return void
     */
    private static function appendWithChildren($row, $depth, $childrenBy, &$ordered)
    {
        $kids = isset($childrenBy[(string) $row->id]) ? $childrenBy[(string) $row->id] : [];
        $row->depth = $depth;
        $row->child_count = \count($kids);
        $ordered[] = $row;

        foreach ($kids as $kid) {
            self::appendWithChildren($kid, $depth + 1, $childrenBy, $ordered);
        }
    }

    public static function save($flow_id, $api_type, $response_type, $response_obj, $field_data = null)
    {
        if (empty($flow_id)) {
            return;
        }

        $flow = new Flow();
        $flow->authorizationStatusChange($flow_id, $response_type == 'success' ? true : false);

        // If field data was not passed explicitly, fall back to the values captured for this execution.
        if (empty($field_data)) {
            $field_data = IntegrationHandler::getFieldValues($flow_id);
        }

        $logData = [
            'flow_id'       => $flow_id,
            'api_type'      => \is_string($api_type) ? $api_type : wp_json_encode($api_type),
            'response_type' => \is_string($response_type) ? $response_type : wp_json_encode($response_type),
            'response_obj'  => \is_string($response_obj) ? $response_obj : wp_json_encode($response_obj),
            'created_at'    => current_time('mysql')
        ];

        // When this save happens during a re-execution of THIS flow, link the new (child) row to the
        // parent log. Keyed by flow id so unrelated flows firing in the same request are not stamped.
        $parentId = IntegrationHandler::getReexecuteParent($flow_id);

        // Only write the re-execution columns once we have confirmed they exist. The migration that
        // adds them is gated behind an admin capability check, but logging also runs on anonymous
        // front-end requests; if the columns cannot be ensured, we skip them so the core log row
        // still saves instead of the whole INSERT failing.
        $columnsReady = (!empty($field_data) || !empty($parentId)) ? self::ensureLogColumns() : false;

        // Persist the trigger field values so this log entry can be re-executed. Stored on each row so
        // every execution stays re-executable even when one flow fires many times in a single request.
        if ($columnsReady && !empty($field_data)) {
            $logData['field_data'] = \is_string($field_data) ? $field_data : wp_json_encode($field_data);
        }

        if ($columnsReady && !empty($parentId)) {
            $logData['parent_id'] = $parentId;
        }

        $logModel = new LogModel();
        $logModel->insert($logData);

        // Skip the failure email for re-execution runs: the admin is actively retrying from the log UI
        // and does not need a duplicate alert for each manual retry of a still-broken flow.
        $isReexecution = !empty($parentId);
        $appConfig = Config::getOption('app_conf', get_option('btcbi_app_conf', []));
        if (!$isReexecution && \in_array($response_type, ['error', 'validation']) && !empty($appConfig->enable_failure_email)) {
            self::sendFailureEmail($flow_id, $api_type, $response_obj);
        }
    }

    /**
     * Make sure the btcbi_log re-execution columns (field_data, parent_id) exist before writing to
     * them. The schema migration is gated behind an admin capability check, whereas logging happens
     * on anonymous front-end requests, so this guarantees the columns once per install (cached).
     * The version stamp lets new columns added later re-run the check on existing installs.
     *
     * @return bool True when the columns are present
     */
    private static function ensureLogColumns()
    {
        $columnsVersion = '2';
        static $ensured = false;
        static $attempted = false;

        if ($ensured) {
            return true;
        }

        if (Config::getOption('log_columns_ready') === $columnsVersion) {
            $ensured = true;

            return true;
        }

        // Attempt the DDL at most once per request: if it cannot succeed (e.g. the DB user lacks
        // ALTER), avoid re-running the migration + INFORMATION_SCHEMA lookups on every logged row.
        if ($attempted) {
            return false;
        }
        $attempted = true;

        DB::addFieldDataColumn();
        DB::addParentIdColumn();
        DB::addParentIdIndex();

        // Only cache "ready" once the columns are confirmed present; otherwise a failed ALTER would be
        // cached permanently and break every future write. Leaving the option unset lets a LATER
        // request retry (the per-request $attempted guard just prevents retrying within this request).
        if (!DB::logColumnsExist()) {
            return false;
        }

        Config::updateOption('log_columns_ready', $columnsVersion);
        $ensured = true;

        return true;
    }

    public static function deleteLog($data)
    {
        if (empty($data->id) && empty($data->flow_id)) {
            wp_send_json_error(__('Integration Id or Log Id required', 'bit-integrations'));
        }
        $deleteStatus = self::delete($data);
        if (is_wp_error($deleteStatus)) {
            wp_send_json_error($deleteStatus->get_error_code());
        }
        wp_send_json_success(__('Log deleted successfully', 'bit-integrations'));
    }

    public static function delete($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $condition = null;
        if (!empty($data->id)) {
            if (\is_array($data->id)) {
                $condition = [
                    'id' => $data->id
                ];
            } else {
                $condition = [
                    'id' => $data->id
                ];
            }
        }
        if (!empty($data->flow_id)) {
            $condition = [
                'flow_id' => $data->flow_id
            ];
        }
        $logModel = new LogModel();
        $result = $logModel->bulkDelete($condition);

        // When deleting specific log rows, also remove their re-execution descendants so a collapsed
        // group is deleted as a whole and its hidden re-runs do not reappear as orphaned top-level rows.
        if (!empty($data->id)) {
            self::deleteDescendants(\is_array($data->id) ? $data->id : [$data->id]);
        }

        return $result;
    }

    /**
     * Delete every re-execution descendant of the given log ids (iteratively, any depth).
     *
     * @param array $ids Parent log ids whose descendants should be removed
     *
     * @return void
     */
    private static function deleteDescendants(array $ids)
    {
        if (!DB::logColumnsExist()) {
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'btcbi_log';
        $ids = array_values(array_filter(array_map('intval', $ids)));

        while (!empty($ids)) {
            $placeholders = implode(', ', array_fill(0, \count($ids), '%d'));

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table from prefix; ids are integers bound via placeholders
            $childIds = $wpdb->get_col($wpdb->prepare("SELECT id FROM `{$table}` WHERE parent_id IN ({$placeholders})", $ids));
            $childIds = array_values(array_filter(array_map('intval', (array) $childIds)));
            if (empty($childIds)) {
                break;
            }

            $childPlaceholders = implode(', ', array_fill(0, \count($childIds), '%d'));
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table from prefix; ids are integers bound via placeholders
            $wpdb->query($wpdb->prepare("DELETE FROM `{$table}` WHERE id IN ({$childPlaceholders})", $childIds));

            $ids = $childIds;
        }
    }

    public static function logAutoDelte($intervalDate)
    {
        $logModel = new LogModel();

        return $logModel->autoLogDelete($intervalDate);
    }

    /**
     * Re-execute an integration using the field data stored on a log entry.
     *
     * @param object $data Contains log_id of the entry to re-execute
     *
     * @return void
     */
    public static function reexecute($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }

        if (empty($data->log_id)) {
            wp_send_json_error(__('Log ID is required', 'bit-integrations'));
        }

        $logModel = new LogModel();
        $logEntry = $logModel->get('*', ['id' => $data->log_id]);

        if (is_wp_error($logEntry) || empty($logEntry) || !isset($logEntry[0])) {
            wp_send_json_error(__('Log entry not found', 'bit-integrations'));
        }

        $log = $logEntry[0];

        if (empty($log->field_data)) {
            wp_send_json_error(__('No field data available for re-execution. This log entry cannot be re-executed.', 'bit-integrations'));
        }

        $flowController = new FlowController();
        $flows = $flowController->get(['id' => $log->flow_id]);

        if (is_wp_error($flows) || empty($flows) || !isset($flows[0])) {
            wp_send_json_error(__('Integration flow not found', 'bit-integrations'));
        }

        $flowData = $flows[0];

        if ($flowData->status != 1) {
            wp_send_json_error(__('Integration is not active', 'bit-integrations'));
        }

        $fieldData = json_decode($log->field_data, true);
        if (empty($fieldData)) {
            wp_send_json_error(__('Invalid field data', 'bit-integrations'));
        }

        // Recover the trigger information from the captured field data, falling back to the flow record.
        $triggered_entity = null;
        $triggered_entity_id = null;

        if (isset($fieldData['bit-integrator%trigger_data%'])) {
            $triggerData = $fieldData['bit-integrator%trigger_data%'];
            $triggered_entity = isset($triggerData['triggered_entity']) ? $triggerData['triggered_entity'] : null;
            $triggered_entity_id = isset($triggerData['triggered_entity_id']) ? $triggerData['triggered_entity_id'] : null;
        }

        if (empty($triggered_entity)) {
            $triggered_entity = isset($flowData->triggered_entity) ? $flowData->triggered_entity : null;
            $triggered_entity_id = isset($flowData->triggered_entity_id) ? $flowData->triggered_entity_id : null;
        }

        if (empty($triggered_entity)) {
            wp_send_json_error(__('Triggered entity is required for re-execution', 'bit-integrations'));
        }

        if (!isset($triggered_entity_id)) {
            wp_send_json_error(__('Triggered entity ID is required for re-execution', 'bit-integrations'));
        }

        // Mark this flow's run so the resulting (child) log rows nest under the entry re-executed.
        IntegrationHandler::setReexecuteParent($flowData->id, $data->log_id);

        try {
            // Replay through the full Flow::execute() path so conditions and field mapping run correctly.
            // Flow::execute() returns void and each action records its own success/error log row, so the
            // real outcome is the newly created log entry rather than this acknowledgement.
            Flow::execute($triggered_entity, $triggered_entity_id, $fieldData, [$flowData]);
        } catch (\Throwable $e) {
            // Catch Throwable (not just Exception) so a fatal Error/TypeError from replaying stale
            // trigger data still clears the parent marker and returns a clean JSON error.
            IntegrationHandler::clearReexecuteParent($flowData->id);
            wp_send_json_error(__('Re-execution error: ', 'bit-integrations') . $e->getMessage());
        }

        IntegrationHandler::clearReexecuteParent($flowData->id);
        wp_send_json_success(__('Re-execution triggered. See the latest log entry for the result.', 'bit-integrations'));
    }

    /**
     * Return the stored trigger field data (input) for a single log entry.
     * Fetched lazily by the preview UI so the log list response stays lightweight.
     *
     * @param object $data Contains log_id
     *
     * @return void
     */
    public static function getFieldData($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }

        if (empty($data->log_id)) {
            wp_send_json_error(__('Log ID is required', 'bit-integrations'));
        }

        $logModel = new LogModel();
        $logEntry = $logModel->get('field_data', ['id' => $data->log_id]);

        if (is_wp_error($logEntry) || empty($logEntry) || !isset($logEntry[0])) {
            wp_send_json_error(__('Log entry not found', 'bit-integrations'));
        }

        wp_send_json_success(isset($logEntry[0]->field_data) ? $logEntry[0]->field_data : '');
    }

    /**
     * Send email notification for integration failure
     *
     * @param int   $flow_id      Integration flow ID
     * @param mixed $api_type     API type/integration name
     * @param mixed $response_obj Error response object
     *
     * @return void
     */
    private static function sendFailureEmail($flow_id, $api_type, $response_obj)
    {
        $integrationHandler = new FlowController();
        $integrations = $integrationHandler->get(
            ['id' => $flow_id],
            [
                'id',
                'name',
                'triggered_entity',
            ]
        );

        $action_name = 'Unknown';
        $trigger_name = 'Unknown';
        $record_type = wp_json_encode($api_type);

        if (!is_wp_error($integrations) && !empty($integrations) && isset($integrations[0])) {
            $action_name = $integrations[0]->name;
            $trigger_name = $integrations[0]->triggered_entity;
        }

        // Get error message
        $error_message = 'An error occurred during integration execution.';

        if (\is_string($response_obj)) {
            $error_message = $response_obj;
        } elseif (\is_array($response_obj)) {
            $error_message = isset($response_obj['message']) ? $response_obj['message'] : wp_json_encode($response_obj);
        } elseif (\is_object($response_obj)) {
            if ($response_obj instanceof WP_Error) {
                $error_message = $response_obj->get_error_message();
            } elseif (isset($response_obj->message)) {
                $error_message = $response_obj->message;
            } else {
                $error_message = wp_json_encode($response_obj);
            }
        }

        // Truncate long error messages
        $maxLength = 500;
        if (\strlen($error_message) > $maxLength) {
            $error_message = \substr($error_message, 0, $maxLength) . '...';
        }

        // Send the email notification
        EmailNotification::sendFailureNotification($flow_id, $action_name, $trigger_name, $record_type, $error_message);
    }
}
