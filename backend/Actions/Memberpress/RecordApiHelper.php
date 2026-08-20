<?php

namespace BitApps\Integrations\Actions\Memberpress;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;
use MeprEvent;
use MeprHooks;
use MeprProduct;
use MeprSubscription;
use MeprTransaction;
use MeprUser;
use MeprUtils;

class RecordApiHelper
{
    private static $integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        self::$integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->memberpressFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function crateMember($integrationDetails, $finalData)
    {
        $statusId = $integrationDetails->statusId;
        $gateway = $integrationDetails->gatewayId;
        $user_id = get_current_user_id();

        $product_id = $integrationDetails->selectedMembership;
        $allData = new MeprTransaction();
        $user = new MeprUser();
        $user->load_user_data_by_id($user_id);

        $allData->user_id = $user->ID;
        $allData->product_id = sanitize_key($product_id);

        $allData->amount = (float) $finalData['sub_total'] ?? 0;
        $allData->tax_amount = (float) $finalData['tax_amount'] ?? 0;
        $allData->tax_rate = (float) $finalData['taxrate'] ?? 0;

        $allData->total = ($allData->amount + $allData->tax_amount);
        $allData->status = sanitize_text_field($statusId);
        $allData->gateway = sanitize_text_field($gateway);
        $allData->created_at = MeprUtils::ts_to_mysql_date(time());

        $expiration_date = $finalData['expiration_date'] ?? null;

        if (empty($expiration_date)) {
            $obj = new MeprProduct(sanitize_key($product_id));
            $expires_at_ts = $obj->get_expires_at();
            if (\is_null($expires_at_ts)) {
                $allData->expires_at = MeprUtils::db_lifetime();
            } else {
                $allData->expires_at = MeprUtils::ts_to_mysql_date($expires_at_ts, 'Y-m-d 23:59:59');
            }
        } else {
            $allData->expires_at = MeprUtils::ts_to_mysql_date(strtotime($expiration_date), 'Y-m-d 23:59:59');
        }

        $apiResponse = $allData->store();

        if ($allData->status == MeprTransaction::$complete_str) {
            MeprEvent::record('transaction-completed', $allData);

            // This is a recurring payment
            if (($sub = $allData->subscription()) && $sub->txn_count > 1) {
                MeprEvent::record(
                    'recurring-transaction-completed',
                    $allData
                );
            } elseif (!$sub) {
                MeprEvent::record(
                    'non-recurring-transaction-completed',
                    $allData
                );
            }
        }

        return $apiResponse;
    }

    public function removeUserFormMembership($integrationDetails, $finalData)
    {
        $membership = $integrationDetails->selectedMembership;
        $user_id = get_current_user_id();
        $user_obj = get_user_by('id', $user_id);
        $table = MeprSubscription::account_subscr_table(
            'created_at',
            'DESC',
            '',
            '',
            'any',
            '',
            false,
            [
                'member'   => $user_obj->user_login,
                'statuses' => [
                    MeprSubscription::$active_str,
                    MeprSubscription::$suspended_str,
                    MeprSubscription::$cancelled_str,
                ],
            ],
            MeprHooks::apply_filters(
                'mepr_user_subscriptions_query_cols',
                [
                    'id',
                    'product_id',
                    'created_at',
                ]
            )
        );

        if ($table['count'] > 0) {
            foreach ($table['results'] as $row) {
                if ($row->product_id == $membership || $membership == - 1) {
                    if ($row->sub_type == 'subscription') {
                        $sub = new MeprSubscription($row->id);
                    } elseif ($row->sub_type == 'transaction') {
                        $sub = new MeprTransaction($row->id);
                    }
                    $apiResponse = $sub->destroy();
                    $member = $sub->user();
                    $member->update_member_data();
                }
            }

            return $apiResponse;
        }
    }

    public function execute(
        $mainAction,
        $fieldValues,
        $fieldMap,
        $integrationDetails
    ) {
        $fieldData = [];
        $apiResponse = null;
        if ($mainAction === '1') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = $this->crateMember($integrationDetails, $finalData);
            if (!empty($apiResponse) && \gettype($apiResponse) !== 'integer') {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'add user', 'type_name' => 'Add the user to a membership']), 'error', wp_json_encode(__('Failed to add user to membership', 'bit-integrations')));
            } else {
                // translators: %s: Placeholder value
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'add user', 'type_name' => 'Add the user to a membership']), 'success', wp_json_encode(wp_sprintf(__('Successfully user added to the membership and id is: %s', 'bit-integrations'), $apiResponse)));
            }
        } elseif ($mainAction === '2') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = $this->removeUserFormMembership($integrationDetails, $finalData);
            if ($apiResponse) {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'add user', 'type_name' => 'Add the user to a membership']), 'success', wp_json_encode(__('Successfully user removed form membership', 'bit-integrations')));
            } else {
                LogHandler::save(self::$integrationID, wp_json_encode(['type' => 'remove user', 'type_name' => 'Remove user to a membership']), 'error', wp_json_encode(__('Failed to remove user form membership', 'bit-integrations')));
            }
        }

        return $apiResponse;
    }
}
