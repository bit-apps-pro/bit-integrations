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
    }

    public function get($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')))) {
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

        $status = isset($data->status) ? (string) $data->status : 'all';
        $search = isset($data->search) ? trim((string) $data->search) : '';
        $hasReexecCols = self::logColumnsReady();

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

    private static function getGroupedLogs($flowId, $limit, $offset)
    {
        global $wpdb;
        $table = $wpdb->prefix . 'btcbi_log';
        $flowId = (int) $flowId;

        $cols = "id, flow_id, job_id, api_type, response_type, response_obj, parent_id, created_at, (field_data IS NOT NULL AND field_data <> '') AS has_field_data";

        $rootWhere = "flow_id = %d AND (parent_id IS NULL OR parent_id NOT IN (SELECT id FROM `{$table}` sub WHERE sub.flow_id = %d))";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Table name from $wpdb->prefix (no input); the two %d placeholders live inside $rootWhere and are bound via prepare()
        $count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `{$table}` WHERE {$rootWhere}", $flowId, $flowId));
        if ($count < 1) {
            return ['count' => 0, 'data' => []];
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber, PluginCheck.Security.DirectDB.UnescapedDBParameter -- $cols is a constant column list, $table from $wpdb->prefix; the extra %d placeholders live inside $rootWhere and are all bound via prepare()
        $tops = $wpdb->get_results($wpdb->prepare("SELECT {$cols} FROM `{$table}` WHERE {$rootWhere} ORDER BY id DESC LIMIT %d OFFSET %d", $flowId, $flowId, (int) $limit, (int) $offset));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- $cols is a constant column list and $table from $wpdb->prefix (no input); the %d value is bound via prepare()
        $descendants = $wpdb->get_results($wpdb->prepare("SELECT {$cols} FROM `{$table}` WHERE flow_id = %d AND parent_id IS NOT NULL ORDER BY id DESC", $flowId));

        $childrenBy = [];
        foreach ((array) $descendants as $row) {
            $pid = (string) $row->parent_id;
            if (!isset($childrenBy[$pid])) {
                $childrenBy[$pid] = [];
            }
            $childrenBy[$pid][] = $row;
        }

        $ordered = [];
        foreach ((array) $tops as $top) {
            self::appendWithChildren($top, 0, $childrenBy, $ordered);
        }

        foreach ($ordered as $row) {
            $row->has_field_data = (bool) (int) $row->has_field_data;
        }

        return ['count' => $count, 'data' => $ordered];
    }

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

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Table from $wpdb->prefix; the %d/%s placeholders live inside $where and are bound via $params in prepare()
        $count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `{$table}` WHERE {$where}", $params));
        if ($count < 1) {
            return ['count' => 0, 'data' => []];
        }

        $rowParams = array_merge($params, [(int) $limit, (int) $offset]);
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber, PluginCheck.Security.DirectDB.UnescapedDBParameter -- $cols/$table are constants; the %d/%s placeholders live inside $where and are all bound via the $rowParams array in prepare()
        $rows = $wpdb->get_results($wpdb->prepare("SELECT {$cols} FROM `{$table}` WHERE {$where} ORDER BY id DESC LIMIT %d OFFSET %d", $rowParams));

        foreach ((array) $rows as $row) {
            $row->depth = 0;
            $row->child_count = 0;
            $row->has_field_data = (bool) (int) $row->has_field_data;
        }

        return ['count' => $count, 'data' => (array) $rows];
    }

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

        $parentId = IntegrationHandler::getReexecuteParent($flow_id);

        $columnsReady = (!empty($field_data) || !empty($parentId)) ? self::ensureLogColumns() : false;

        if ($columnsReady && !empty($field_data)) {
            $logData['field_data'] = \is_string($field_data) ? $field_data : wp_json_encode($field_data);
        }

        if ($columnsReady && !empty($parentId)) {
            $logData['parent_id'] = $parentId;
        }

        $logModel = new LogModel();
        $logModel->insert($logData);

        $isReexecution = !empty($parentId);
        $appConfig = Config::getOption('app_conf', get_option('btcbi_app_conf', []));
        if (!$isReexecution && \in_array($response_type, ['error', 'validation']) && !empty($appConfig->enable_failure_email)) {
            self::sendFailureEmail($flow_id, $api_type, $response_obj);
        }
    }

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

        if ($attempted) {
            return false;
        }
        $attempted = true;

        $migrationLock = Config::VAR_PREFIX . 'log_columns_migrating';

        if (!add_option($migrationLock, time(), '', 'no')) {
            $lockedAt = (int) get_option($migrationLock, 0);

            if ($lockedAt > 0 && (time() - $lockedAt) < 30) {
                return false;
            }

            delete_option($migrationLock);

            if (!add_option($migrationLock, time(), '', 'no')) {
                return false;
            }
        }

        try {
            DB::addFieldDataColumn();
            DB::addParentIdColumn();
            DB::addParentIdIndex();
        } finally {
            delete_option($migrationLock);
        }

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
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')))) {
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

        if (!empty($data->id)) {
            self::deleteDescendants(\is_array($data->id) ? $data->id : [$data->id]);
        }

        return $result;
    }

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

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Table from $wpdb->prefix; $placeholders is a generated list of %d bound to the integer $ids via prepare()
            $childIds = $wpdb->get_col($wpdb->prepare("SELECT id FROM `{$table}` WHERE parent_id IN ({$placeholders})", $ids));
            $childIds = array_values(array_filter(array_map('intval', (array) $childIds)));
            if (empty($childIds)) {
                break;
            }

            $childPlaceholders = implode(', ', array_fill(0, \count($childIds), '%d'));
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Table from $wpdb->prefix; $childPlaceholders is a generated list of %d bound to the integer $childIds via prepare()
            $wpdb->query($wpdb->prepare("DELETE FROM `{$table}` WHERE id IN ({$childPlaceholders})", $childIds));

            $ids = $childIds;
        }
    }

    public static function logAutoDelte($intervalDate)
    {
        $logModel = new LogModel();

        return $logModel->autoLogDelete($intervalDate);
    }

    public static function reexecute($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')))) {
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

        Flow::guardCustomActionFlowDetails($flowData->flow_details ?? null);

        if ($flowData->status != 1) {
            wp_send_json_error(__('Integration is not active', 'bit-integrations'));
        }

        $fieldData = json_decode($log->field_data, true);
        if (empty($fieldData)) {
            wp_send_json_error(__('Invalid field data', 'bit-integrations'));
        }

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

        IntegrationHandler::setReexecuteParent($flowData->id, $data->log_id);

        try {
            Flow::execute($triggered_entity, $triggered_entity_id, $fieldData, [$flowData]);
        } catch (\Throwable $e) {
            IntegrationHandler::clearReexecuteParent($flowData->id);
            wp_send_json_error(__('Re-execution error: ', 'bit-integrations') . $e->getMessage());
        }

        IntegrationHandler::clearReexecuteParent($flowData->id);
        wp_send_json_success(__('Re-execution triggered. See the latest log entry for the result.', 'bit-integrations'));
    }

    public static function getFieldData($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')))) {
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

        $maxLength = 500;
        if (\strlen($error_message) > $maxLength) {
            $error_message = \substr($error_message, 0, $maxLength) . '...';
        }

        EmailNotification::sendFailureNotification($flow_id, $action_name, $trigger_name, $record_type, $error_message);
    }
}
