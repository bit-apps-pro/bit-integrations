<?php

/**
 * RestrictContent Record Api
 */

namespace BitApps\Integrations\Actions\RestrictContent;

use BitApps\Integrations\Log\LogHandler;
use RCP_Payments;
use WP_Error;

class RecordApiHelper
{
    protected $action;

    protected $integrationDetails;

    private $_integrationID;

    public function __construct($integId, $actionName, $integrationDetails)
    {
        $this->_integrationID = $integId;
        $this->action = $actionName;
        $this->integrationDetails = $integrationDetails;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $fieldPair) {
            if (!empty($fieldPair->restrictField) && !empty($fieldPair->formField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $dataFinal[$fieldPair->restrictField] = $fieldPair->customValue;
                } else {
                    $dataFinal[$fieldPair->restrictField] = $data[$fieldPair->formField];
                }
            }
        }

        return $dataFinal;
    }

    public function insertMember($data)
    {
        $levelId = $this->integrationDetails->level_id;
        $actionName = $this->action;
        $expiry_date = $this->integrationDetails->exp_date;

        $level_ids = rcp_get_membership_levels(
            [
                'status' => 'active',
                'fields' => 'id',
            ]
        );
        if (empty($level_ids)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('You must have at least one active membership level.', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }

        $user_id = get_current_user_id();
        $customer = rcp_get_customer_by_user_id($user_id);
        $newest_time = current_time('timestamp');
        $created_date = gmdate('Y-m-d H:i:s', $newest_time);

        if (empty($customer)) {
            $customer_id = rcp_add_customer(
                [
                    'user_id'         => absint($user_id),
                    'date_registered' => $created_date,
                ]
            );
        } else {
            $customer_id = $customer->get_id();
        }

        $status = 'active';
        $membership_args = [
            'customer_id'      => absint($customer_id),
            'user_id'          => $user_id,
            'object_id'        => !empty($levelId) ? $levelId : $level_ids[array_rand($level_ids)],
            'status'           => $status,
            'created_date'     => $created_date,
            'gateway'          => 'manual',
            'subscription_key' => rcp_generate_subscription_key(),
        ];
        if (!empty($expiry_date)) {
            $membership_args['expiration_date'] = gmdate('Y-m-d H:i:s', strtotime($expiry_date));
        }
        $membership_id = rcp_add_membership($membership_args);

        rcp_add_membership_meta($membership_id, 'rcp_generated_via_UA', $this->_integrationID);

        $membership = rcp_get_membership($membership_id);

        $auth_key = \defined('AUTH_KEY') ? AUTH_KEY : '';
        $transaction_id = strtolower(md5($membership_args['subscription_key'] . gmdate('Y-m-d H:i:s') . $auth_key . uniqid('rcp', true)));

        $payment_args = [
            'subscription'     => rcp_get_subscription_name($membership_args['object_id']),
            'object_id'        => $membership_args['object_id'],
            'date'             => $membership_args['created_date'],
            'amount'           => $membership->get_initial_amount(),
            'subtotal'         => $membership->get_initial_amount(),
            'user_id'          => $user_id,
            'subscription_key' => $membership_args['subscription_key'],
            'transaction_id'   => $transaction_id,
            'status'           => 'pending' == $membership_args['status'] ? 'pending' : 'complete',
            'gateway'          => 'manual',
            'customer_id'      => $customer_id,
            'membership_id'    => $membership_id,
        ];

        $rcp_payments = new RCP_Payments();
        $payment_id = $rcp_payments->insert($payment_args);

        $rcp_payments->add_meta($payment_id, 'rcp_generated_via_UA', $this->_integrationID);
        if ($membership_id) {
            return $membership_id;
        }

        return false;
    }

    public function removeMember()
    {
        $levelId = $this->integrationDetails->level_id;
        $actionName = $this->action;
        $user_id = get_current_user_id();
        $ans = [];
        if ($levelId == 'all') {
            $customer = rcp_get_customer_by_user_id($user_id);
            if ($customer->get_id()) {
                rcp_disable_customer_memberships($customer->get_id());
            } else {
                return $ans['error'] = 'No customer found';
            }
        } else {
            $customer = rcp_get_customer_by_user_id($user_id);
            if ($customer->get_id()) {
                $args = [
                    'customer_id' => absint($customer->get_id()),
                    'number'      => 1,
                    'orderby'     => 'id',
                    'order'       => 'ASC',
                    'object_id'   => $levelId,
                ];
                $user_memberships = rcp_get_memberships($args);
                if (!empty($user_memberships)) {
                    $user_memberships[0]->disable();
                }
            } else {
                return $ans['error'] = 'No customer found';
            }
        }
        $ans['success'] = 'Membership removed';

        return $ans;
    }

    public function execute($fieldValues, $fieldMap, $integrationDetails)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($this->action == 'add-member-level') {
            $apiResponse = $this->insertMember($finalData);
            $type = 'add-member-level';
            $type_name = 'Add member to a Level';
        } elseif ($this->action == 'remove-member-level') {
            $apiResponse = $this->removeMember();
            $type = 'remove-member-level';
            $type_name = 'Remove member from a Level';
        }

        if (!$apiResponse) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $type_name]), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $type_name]), 'success', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
