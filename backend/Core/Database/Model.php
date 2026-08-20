<?php

/**
 * Provides Base Model Class
 */

namespace BitApps\Integrations\Core\Database;

use WP_Error;

class Model
{
    protected static $table;

    protected static $primary_key;

    protected $app_db;

    protected $table_name;

    protected $db_response;

    public function __construct()
    {
        global $wpdb;
        $this->app_db = $wpdb;
        $this->table_name = $wpdb->prefix . static::$table;
    }

    public function insert($data = [])
    {
        if (\is_null($data)) {
            return new WP_Error('empty_data', __('Form data is empty', 'bit-integrations'));
        }
        $result = $this->app_db->insert(
            $this->table_name,
            $data
        );

        return $this->getResult($result);
    }

    public function get($item = '*', $condition = [], $limit = null, $offset = null, $order_by = null, $order_follow = null)
    {
        if (\is_array($item)) {
            $column_to_select = implode(',', $item);
        } else {
            $column_to_select = $item;
        }
        $checkCondition = $this->checkCondition($condition);
        if (is_wp_error($checkCondition)) {
            return $checkCondition;
        }
        $order = null;
        if (!\is_null($order_by)) {
            $order_follow = \is_null($order_follow) ? 'ASC' : $order_follow;
            $order .= " ORDER BY {$order_by} {$order_follow}";
        }
        $paginate = null;
        if (!\is_null($limit)) {
            $limit = \intval($limit);
            $paginate .= " LIMIT {$limit} ";
        }
        if (!\is_null($offset)) {
            $offset = \intval($offset);
            $paginate .= " OFFSET  {$offset} ";
        }
        if (empty($condition)) {
            $sql = "SELECT {$column_to_select} FROM `{$this->table_name}` {$order} {$paginate}";
            $all_values = null;
        } else {
            $formatted_conditions = $this->getFormatedCondition($condition);
            if ($formatted_conditions) {
                $condition_to_check = $formatted_conditions['conditions'];
                $all_values = $formatted_conditions['values'];
            } else {
                $condition_to_check = null;
                $all_values = null;
            }
            $sql = "SELECT {$column_to_select} FROM `{$this->table_name}`"
                . $condition_to_check . $order . $paginate;
        }

        return $this->execute($sql, $all_values)->getResult();
    }

    public function count($condition = null)
    {
        $checkCondition = $this->checkCondition($condition);
        if (is_wp_error($checkCondition)) {
            return $checkCondition;
        }
        if (empty($condition)) {
            $result = $this->app_db->query(
                "SELECT COUNT(*) FROM `{$this->table_name}`"
            );
        } else {
            $formatted_conditions = $this->getFormatedCondition($condition);
            if ($formatted_conditions) {
                $condition_to_check = $formatted_conditions['conditions'];
                $all_values = $formatted_conditions['values'];
            } else {
                $condition_to_check = null;
                $all_values = null;
            }
            $result = $this->app_db->query(
                $this->app_db->prepare(
                    "SELECT COUNT(*) as count FROM `{$this->table_name}`"
                        . $condition_to_check,
                    $all_values
                )
            );
        }
        if (!$result) {
            if ($this->app_db->last_error) {
                return new WP_Error('db_error', $this->app_db->last_error);
            }

            return new WP_Error(
                'db_error',
                (\function_exists('is_textdomain_loaded') && is_textdomain_loaded('bit-integrations'))
                    ? __('Result is empty', 'bit-integrations')
                    : 'Result is empty'
            );
        }

        return $this->app_db->last_result;
    }

    public function update(array $data, array $condition)
    {
        if (
            !\is_null($data)
            && \is_array($data)
            && array_keys($data) !== range(0, \count($data) - 1)
        ) {
            $data_to_update = $data;
        } else {
            return new WP_Error(
                'update_error',
                __('Nothing to update', 'bit-integrations')
            );
        }
        $update_condition = (!\is_null($condition)
            && array_keys($condition) !== range(0, \count($condition) - 1)) ? $condition : null;
        $result = $this->app_db->update(
            $this->table_name,
            $data_to_update,
            $update_condition
        );

        return $this->getResult($result);
    }

    public function bulkUpdate(array $data = null, array $condition = null)
    {
        if (
            !\is_null($data)
            && \is_array($data)
            && array_keys($data) !== range(0, \count($data) - 1)
        ) {
            $data_to_update = $data;
        } else {
            return new WP_Error(
                'update_error',
                __('Nothing to update', 'bit-integrations')
            );
        }

        $update_fields = '';
        $all_values = [];
        $index_checker = 0;
        $data_count = \count($data_to_update) - 1;
        foreach ($data_to_update as $field_name => $field_value) {
            $update_fields .= $field_name . ' = ' . $this->getFieldFormat($field_value);
            if ($index_checker < $data_count) {
                $update_fields .= ',';
            }
            $index_checker = $index_checker + 1;
            $all_values[] = $field_value;
        }
        $update_condition = (!\is_null($condition)
            && array_keys($condition) !== range(0, \count($condition) - 1)) ? $condition : null;
        $formatted_conditions = $this->getFormatedCondition($update_condition);
        if ($formatted_conditions) {
            $condition_to_check = $formatted_conditions['conditions'];
            $all_values = array_merge($all_values, $formatted_conditions['values']);
        } else {
            $condition_to_check = null;
        }
        $result = $this->app_db->query(
            $this->app_db->prepare(
                "UPDATE {$this->table_name} SET {$update_fields} {$condition_to_check}",
                $all_values
            )
        );

        return $this->getResult($result);
    }

    public function duplicate(array $columns, array $duplicate, array $condition)
    {
        if (!(!\is_null($columns)
            && \is_array($columns)
            && array_keys($columns) === range(0, \count($columns) - 1)
            && !\is_null($duplicate)
            && \is_array($duplicate)
            && array_keys($duplicate) === range(0, \count($duplicate) - 1))) {
            return new WP_Error(
                'duplicate_error',
                __('Nothing to duplicate', 'bit-integrations')
            );
        }

        $dupCol = '';
        $insCol = implode(',', $columns);
        $all_values = [];
        $data_count = \count($duplicate) - 1;
        foreach ($duplicate as $dupKey => $dupColName) {
            if (\in_array($dupColName, $columns)) {
                $dupCol .= $dupColName;
            } else {
                $dupCol .= $this->getFieldFormat($dupColName);
                $all_values[] = $dupColName;
            }
            if ($dupKey < $data_count) {
                $dupCol .= ',';
            }
        }
        $condition_to_check = null;
        $update_condition = (!\is_null($condition)
            && array_keys($condition) !== range(0, \count($condition) - 1)) ? $condition : null;
        $formatted_conditions = $this->getFormatedCondition($update_condition);
        if ($formatted_conditions) {
            $condition_to_check = $formatted_conditions['conditions'];
            $all_values = array_merge($all_values, $formatted_conditions['values']);
        }
        $query = "INSERT INTO {$this->table_name} ({$insCol})
        SELECT {$dupCol} FROM {$this->table_name} {$condition_to_check}";
        $this->execute($query, $all_values);

        return $this->getResult($result);
    }

    public function trash(array $condition = null)
    {
        if (
            !\is_null($condition)
            && \is_array($condition)
            && array_keys($condition) !== range(0, \count($condition) - 1)
        ) {
            $delete_condition = $condition;
        } else {
            return new WP_Error(
                'deletion_error',
                __('At least 1 condition needed', 'bit-integrations')
            );
        }
        $update_condition = (!\is_null($condition)
            && array_keys($condition) !== range(0, \count($condition) - 1)) ? $condition : null;
        $result = $this->app_db->update(
            $this->table_name,
            $data_to_update,
            $update_condition
        );

        return $this->getResult($result);
    }

    public function delete(array $condition = null)
    {
        if (
            !\is_null($condition)
            && \is_array($condition)
            && array_keys($condition) !== range(0, \count($condition) - 1)
        ) {
            $delete_condition = $condition;
        } else {
            return new WP_Error(
                'deletion_error',
                __('At least 1 condition needed', 'bit-integrations')
            );
        }
        $result = $this->app_db->delete(
            $this->table_name,
            $delete_condition
        );

        return $this->getResult($result);
    }

    public function bulkDelete(array $condition = null)
    {
        if (
            !\is_null($condition)
            && \is_array($condition)
            && array_keys($condition) !== range(0, \count($condition) - 1)
        ) {
            $delete_condition = $condition;
        } else {
            return new WP_Error(
                'deletion_error',
                __('At least 1 condition needed', 'bit-integrations')
            );
        }
        $formatted_conditions = $this->getFormatedCondition($delete_condition);
        if ($formatted_conditions) {
            $condition_to_check = $formatted_conditions['conditions'];
            $all_values = $formatted_conditions['values'];
        } else {
            $condition_to_check = null;

            return new WP_Error(
                'deletion_error',
                __('At least 1 condition needed', 'bit-integrations')
            );
        }
        $result = $this->app_db->query(
            $this->app_db->prepare(
                "DELETE FROM {$this->table_name} {$condition_to_check}",
                $all_values
            )
        );

        return $this->getResult($result);
    }

    protected function getFieldFormat($value)
    {
        return (\gettype($value) == 'integer')
            ? '%d' : ((\gettype($value) == 'double') ? '%f' : '%s');
    }

    protected function getFormatedCondition($condition, $check_operator = null, $join_operator = ' AND ')
    {
        if (\is_null($condition)) {
            return false;
        }
        $no_condition = \count($condition);
        $index_checker = 0;
        $condition_to_check = ' WHERE ';
        $all_values = [];
        foreach ($condition as $key => $value) {
            $value_type = '';
            if (\is_array($value)) {
                if (isset($value['operator'])) {
                    $set_check_operator = $value['operator'];
                    $value_type .= $this->getFieldFormat($value['value']);
                    $all_values[] = $value['value'];
                } else {
                    $set_check_operator = \is_null($check_operator) ? 'in' : $check_operator;
                    $value_type .= ' ( ';
                    $value_index_checker = 0;
                    $value_count = \count($value) - 1;
                    foreach ($value as $condKey => $condValue) {
                        $value_type .= $this->getFieldFormat($condValue);
                        $all_values[] = $condValue;
                        if ($value_index_checker < $value_count) {
                            $value_type .= ', ';
                        }
                        $value_index_checker = $value_index_checker + 1;
                    }
                    $value_type .= ' )';
                }
            } else {
                $set_check_operator = \is_null($check_operator) ? '=' : $check_operator;
                $value_type .= $this->getFieldFormat($value);
                $all_values[] = $value;
            }
            $condition_to_check = $condition_to_check . $key . " {$set_check_operator} " . $value_type;
            if ($index_checker < $no_condition - 1) {
                $condition_to_check = $condition_to_check . " {$join_operator} ";
            }
            $index_checker = $index_checker + 1;
        }

        return [
            'conditions' => $condition_to_check,
            'values'     => $all_values
        ];
    }

    protected function checkCondition(array $condition)
    {
        if (!\is_null($condition) && array_keys($condition) === range(0, \count($condition) - 1)) {
            return new WP_Error(
                'get_condition',
                __('Require ASSOC_ARRAY but found N_ARRAY', 'bit-integrations')
            );
        }

        return true;
    }

    protected function execute($sql, $values = null)
    {
        if (\is_null($values)) {
            $preparedQuery = $sql;
        } else {
            $preparedQuery = $this->app_db->prepare($sql, $values);
        }
        if (empty($preparedQuery)) {
            $this->db_response = new WP_Error('null_query', __('prepared query is empty', 'bit-integrations'));
        } else {
            $this->db_response = stripos($preparedQuery, 'DELETE') !== false ? $this->app_db->query($preparedQuery)
                : $this->app_db->get_results($preparedQuery, OBJECT_K);
        }

        return $this;
    }

    protected function getResult($db_response = null)
    {
        $db_response = !empty($this->db_response) ? $this->db_response : $db_response;

        if (!empty($this->app_db->last_error)) {
            return new WP_Error('db_error', $this->app_db->last_error);
        }

        if (!$db_response) {
            if ($this->app_db->num_rows > 0) {
                $response = $this->app_db->num_rows;
            }
            if (is_wp_error($db_response)) {
                $response = $db_response;
            }

            $response = new WP_Error(
                'result_empty',
                (\function_exists('is_textdomain_loaded') && is_textdomain_loaded('bit-integrations'))
                    ? __('Result is empty', 'bit-integrations')
                    : 'Result is empty'
            );
        } elseif (\is_array($this->app_db->last_result) && !empty($this->app_db->last_result)) {
            $response = $this->app_db->last_result;
        } elseif ($this->app_db->insert_id) {
            $response = $this->app_db->insert_id;
        } else {
            $response = $db_response;
        }

        $this->app_db->flush();

        return $response;
    }
}
