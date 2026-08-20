<?php

/**
 * Provides Base Model Class
 */

namespace BitApps\Integrations\Core\Database;

class LogModel extends Model
{
    protected static $table = 'btcbi_log';

    public function autoLogDelete($intervalDays)
    {
        global $wpdb;
        if (
            !\is_null($intervalDays)
        ) {
            $tableName = esc_sql($wpdb->prefix . static::$table);
            $intervalDays = absint($intervalDays);

            // phpcs:disable WordPress.DB.PreparedSQL.NotPrepared
            $result = $this->app_db->get_results(
                $wpdb->prepare(
                    'DELETE FROM ' . $tableName . ' WHERE DATE_ADD(date(created_at), INTERVAL %d DAY) < CURRENT_DATE',
                    $intervalDays
                ),
                OBJECT_K
            );
            // phpcs:enable

            return $result;
        }
    }
}
