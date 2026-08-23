<?php

/**
 * GamiPress Record Api
 */

namespace BitApps\Integrations\Actions\GamiPress;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private static $integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        self::$integrationID = $integId;
    }

    public static function getIntegrationId()
    {
        return $integrationID = self::$integrationID;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->gamiPressFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public static function addRankToUser($selectedRank, $mainAction)
    {
        $user_id = get_current_user_id();
        if ($mainAction === '1') {
            return gamipress_update_user_rank($user_id, (int) $selectedRank);
        }
        $rank_types = gamipress_get_rank_types();

        $rank_id = (int) $selectedRank;
        $rank = get_post($rank_id);

        if (! $rank || ! isset($rank_types[$rank->post_type])) {
            return;
        }

        $user_rank_id = gamipress_get_user_rank_id(absint($user_id), $rank->post_type);

        if (! empty($user_rank_id) && $rank_id == $user_rank_id) {
            return gamipress_revoke_rank_to_user(absint($user_id), $user_rank_id, 0, ['admin_id' => absint($user_id)]);

            $user_rank_id = gamipress_get_user_rank_id(absint($user_id), $rank->post_type);
            if (! empty($user_rank_id) && $rank_id == $user_rank_id) {
                $meta = "_gamipress_{$rank->post_type}_rank";

                return gamipress_delete_user_meta($user_id, $meta);
            }
        } else {
            return false;
        }
    }

    public static function addAchievementToUser($achievementId, $mainAction)
    {
        $user_id = get_current_user_id();
        if ($mainAction === '2') {
            if (!empty($achievementId) && !empty($user_id) && is_numeric((int) $achievementId)) {
                gamipress_award_achievement_to_user(absint((int) $achievementId), absint($user_id), get_current_user_id());

                return true;
            }

            return false;
        }
        if (!empty($achievementId) && !empty($user_id) && is_numeric((int) $achievementId)) {
            gamipress_revoke_achievement_to_user(absint((int) $achievementId), absint($user_id));

            return true;
        }

        return false;
    }

    public static function addPointToUser($pointType, $points, $mainAction)
    {
        $user_id = get_current_user_id();
        if ($mainAction === '3') {
            return gamipress_award_points_to_user(absint($user_id), absint($points), $pointType);
        }
        $deduct_points = 0;

        $points_type = $pointType;

        $existing_points = gamipress_get_user_points(absint($user_id), $points_type);

        if (($existing_points - absint($points)) < 0) {
            $deduct_points = absint($points) + ($existing_points - absint($points));
        } else {
            $deduct_points = absint($points);
        }

        return gamipress_deduct_points_to_user(absint($user_id), absint($deduct_points), $points_type);
    }

    public function execute(
        $mainAction,
        $fieldValues,
        $integrationDetails,
        $integrationData,
        $fieldMap
    ) {
        $fieldData = [];
        if ($mainAction === '1') {
            $apiResponse = self::addRankToUser($integrationDetails->selectedRank, $mainAction);
            if ($apiResponse) {
                // translators: %s: Placeholder value
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-rank']), 'success', wp_json_encode(wp_sprintf(__('Added successfully, post id %1$s and post title %2$s', 'bit-integrations'), $apiResponse->ID, $apiResponse->post_title)));
            } else {
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-rank']), 'error', wp_json_encode(__('Failed to add rank', 'bit-integrations')));
            }
        }

        if ($mainAction === '2') {
            $apiResponse = self::addAchievementToUser($integrationDetails->selectedAchievement, $mainAction);
            if ($apiResponse) {
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-award']), 'success', wp_json_encode(__('Achievement added successfully', 'bit-integrations')));
            } else {
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-award']), 'error', wp_json_encode(__('Failed to add achievement', 'bit-integrations')));
            }
        }

        if ($mainAction === '3') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $point = (int) $finalData['point'];
            if (!empty($point) && is_numeric($point)) {
                $apiResponse = self::addPointToUser($integrationDetails->selectedPointType, $point, $mainAction);
                if ($apiResponse) {
                    // translators: %s: Placeholder value
                    LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-point']), 'success', wp_json_encode(wp_sprintf(__('Point added successfully and total points are %s', 'bit-integrations'), $apiResponse)));
                } else {
                    LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-point']), 'error', wp_json_encode(__('Failed to add point', 'bit-integrations')));
                }
            } else {
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-point']), 'error', wp_json_encode(__('Failed to add point', 'bit-integrations')));
            }
        }

        if ($mainAction === '4') {
            $apiResponse = self::addRankToUser($integrationDetails->selectedRank, $mainAction);
            if ($apiResponse) {
                // translators: %s: Placeholder value
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'revoke', 'type_name' => 'revoke-rank']), 'success', wp_json_encode(wp_sprintf(__('Revoked rank successfully, post id %1$s and post title %2$s', 'bit-integrations'), $apiResponse->ID, $apiResponse->post_title)));
            } else {
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'revoke', 'type_name' => 'revoke-rank']), 'error', wp_json_encode(__('Failed to revoke rank', 'bit-integrations')));
            }
        }

        if ($mainAction === '5') {
            $apiResponse = self::addAchievementToUser($integrationDetails->selectedAchievement, $mainAction);
            if ($apiResponse) {
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'revoke', 'type_name' => 'revoke-achievement']), 'success', wp_json_encode(__('Achievement revoked successfully', 'bit-integrations')));
            } else {
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'revoke', 'type_name' => 'revoke-achievement']), 'error', wp_json_encode(__('Failed to revoke achievement', 'bit-integrations')));
            }
        }

        if ($mainAction === '6') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $point = (int) $finalData['point'];
            if (!empty($point) && is_numeric($point)) {
                $apiResponse = self::addPointToUser($integrationDetails->selectedPointType, $point, $mainAction);
                if ($apiResponse) {
                    // translators: %s: Placeholder value
                    LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-point']), 'success', wp_json_encode(wp_sprintf(__('Point revoked successfully and total points are %s', 'bit-integrations'), $apiResponse)));
                } else {
                    LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-point']), 'error', wp_json_encode(__('Failed to revoke point', 'bit-integrations')));
                }
            } else {
                LogHandler::save(self::getIntegrationId(), wp_json_encode(['type' => 'insert', 'type_name' => 'update-point']), 'error', wp_json_encode(__('Failed operation , point is not valid number', 'bit-integrations')));
            }
        }

        return $apiResponse;
    }
}
