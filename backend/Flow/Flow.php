<?php

namespace BitApps\Integrations\Flow;

use BitApps\Integrations\Core\Util\Capabilities;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\CustomFuncValidator;
use BitApps\Integrations\Core\Util\IpTool;
use BitApps\Integrations\Core\Util\SmartTags;
use BitApps\Integrations\Core\Util\StoreInCache;
use BitApps\Integrations\Log\LogHandler;
use BitApps\Integrations\Triggers\TriggerController;
use WP_Error;

/**
 * Provides details of available integration and helps to
 * execute available flows
 */
final class Flow
{
    public function triggers()
    {
        return TriggerController::triggerList();
    }

    public function triggerName($triggerName, $triggerId)
    {
        if ($triggerName == 'Post') {
            switch ($triggerId) {
                case 1:
                    return __('Create a new post', 'bit-integrations');
                case 2:
                    return __('Updated a post', 'bit-integrations');
                case 3:
                    return __('Delete a post', 'bit-integrations');
                case 4:
                    return __('User views a post', 'bit-integrations');
                case 5:
                    return __('User comments on a post', 'bit-integrations');
                case 6:
                    return __('Change post status', 'bit-integrations');
                default:
                    return $triggerName;
            }
        }

        return $triggerName;
    }

    public function flowList()
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $integrationHandler = new FlowController();
        $triggers = $this->triggers();
        $integrations = $integrationHandler->get(
            [],
            [
                'id',
                'name',
                'triggered_entity_id',
                'triggered_entity',
                'status',
                'created_at',
            ]
        );
        if (is_wp_error($integrations)) {
            wp_send_json_error($integrations->get_error_message());
        }
        foreach ($integrations as $integration) {
            if (isset($triggers[$integration->triggered_entity])) {
                $entity = $integration->triggered_entity;
                $integration->triggered_entity = $this->triggerName($triggers[$entity]['name'], $integration->triggered_entity_id);
                $integration->isCorrupted = $triggers[$entity]['is_active'];
            }
        }
        wp_send_json_success(['integrations' => $integrations]);
    }

    public function get($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations') || Capabilities::Check('bit_integrations_create_integrations') || Capabilities::Check('bit_integrations_edit_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $missing_field = null;
        if (!property_exists($data, 'id')) {
            $missing_field = 'Integration ID';
        }
        if (!\is_null($missing_field)) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s can\'t be empty', 'bit-integrations'), $missing_field));
        }
        $integrationHandler = new FlowController();
        $integrations = $integrationHandler->get(
            ['id' => $data->id],
            [
                'id',
                'name',
                'triggered_entity',
                'triggered_entity_id',
                'flow_details',
            ]
        );
        if (is_wp_error($integrations)) {
            wp_send_json_error($integrations->get_error_message());
        }
        $integration = $integrations[0];
        if (!($trigger = self::isTriggerExists($integration->triggered_entity))) {
            wp_send_json_error(__('Trigger does not exists', 'bit-integrations'));
        }
        if (\is_string($integration->flow_details)) {
            $integration->flow_details = json_decode($integration->flow_details);
        }
        if (\is_object($integration->flow_details) && !property_exists($integration->flow_details, 'fields') && method_exists($trigger, 'fields')) {
            if ($integration->triggered_entity == 'Elementor' || $integration->triggered_entity == 'Divi' || $integration->triggered_entity == 'Bricks' || $integration->triggered_entity == 'Brizy' || $integration->triggered_entity == 'Breakdance' || $integration->triggered_entity == 'CartFlow') {
                $data = (object) [
                    'id'     => $integration->triggered_entity_id,
                    'postId' => $integration->flow_details->postId,
                ];
                $integration->fields = $trigger::fields($data);
            } elseif (method_exists($trigger, 'formattedParam') && $trigger::formattedParam($integration)->id !== -1) {
                $data = $trigger::formattedParam($integration);
                $integration->fields = $trigger::fields($data);
            } else {
                $integration->fields = $trigger::fields($integration->triggered_entity_id);
            }
        }
        if (property_exists($integration->flow_details, 'fields')) {
            $integration->fields = $integration->flow_details->fields;
        }

        wp_send_json_success(['integration' => $integration]);
    }

    public function save($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations') || Capabilities::Check('bit_integrations_create_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $missing_field = null;
        if (!property_exists($data, 'trigger')) {
            $missing_field = 'Trigger';
        }

        if (!property_exists($data, 'triggered_entity_id')) {
            $missing_field = (\is_null($missing_field) ? null : ', ') . 'Triggered form ID';
        }

        if (!property_exists($data, 'flow_details')) {
            $missing_field = (\is_null($missing_field) ? null : ', ') . 'Integration details';
        }
        if (!\is_null($missing_field)) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s can\'t be empty', 'bit-integrations'), $missing_field));
        }

        // custom action
        if ($data->flow_details->type === 'CustomAction') {
            CustomFuncValidator::functionValidateHandler($data);
        }

        $name = !empty($data->name) ? $data->name : '';
        $integrationHandler = new FlowController();
        $saveStatus = $integrationHandler->save($name, $data->trigger, $data->triggered_entity_id, $data->flow_details);
        static::updateFlowTrigger($saveStatus);

        if (is_wp_error($saveStatus)) {
            wp_send_json_error($saveStatus->get_error_message());
        }

        wp_send_json_success(['id' => $saveStatus, 'msg' => __('Integration saved successfully', 'bit-integrations')]);
    }

    public function flowClone($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations') || Capabilities::Check('bit_integrations_create_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $missingId = null;
        $user_details = IpTool::getUserDetail();
        if (!property_exists($data, 'id')) {
            $missingId = 'Flow ID';
        }
        if (!\is_null($missingId)) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s can\'t be empty', 'bit-integrations'), $missingId));
        }
        $integrationHandler = new FlowController();
        $integrations = $integrationHandler->get(
            ['id' => $data->id],
            [
                'id',
                'name',
                'triggered_entity',
                'triggered_entity_id',
                'flow_details',
            ]
        );
        if (!is_wp_error($integrations) && \count($integrations) > 0) {
            $newInteg = $integrations[0];
            $newInteg->name = 'duplicate of ' . $newInteg->name;
            $saveStatus = $integrationHandler->save($newInteg->name, $newInteg->triggered_entity, $newInteg->triggered_entity_id, $newInteg->flow_details);
            static::updateFlowTrigger($saveStatus);

            if (is_wp_error($saveStatus)) {
                wp_send_json_error($saveStatus->get_error_message());
            }
            wp_send_json_success(['id' => $saveStatus, 'created_at' => $user_details['time']]);
        } else {
            wp_send_json_error(__('Flow ID is not exists', 'bit-integrations'));
        }
    }

    public function update($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations') || Capabilities::Check('bit_integrations_edit_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $missing_field = null;
        if (empty($data->id)) {
            $missing_field = 'Integration id';
        }
        if (empty($data->flow_details)) {
            $missing_field = 'Flow details';
        }
        if (!\is_null($missing_field)) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s can\'t be empty', 'bit-integrations'), $missing_field));
        }

        if ($data->flow_details->type === 'CustomAction') {
            CustomFuncValidator::functionValidateHandler($data);
        }

        $name = !empty($data->name) ? $data->name : '';
        $integrationHandler = new FlowController();
        $updateStatus = $integrationHandler->update(
            $data->id,
            [
                'name'                => $name,
                'triggered_entity'    => $data->trigger,
                'triggered_entity_id' => $data->triggered_entity_id,
                'flow_details'        => \is_string($data->flow_details) ? $data->flow_details : wp_json_encode($data->flow_details),
            ]
        );
        static::updateFlowTrigger($updateStatus);

        if (is_wp_error($updateStatus) && $updateStatus->get_error_code() !== 'result_empty') {
            wp_send_json_error($updateStatus->get_error_message());
        }
        wp_send_json_success(__('Integration updated successfully', 'bit-integrations'));
    }

    public function authorizationStatusChange($data, $status)
    {
        $integrationHandler = new FlowController();
        $integrations = $integrationHandler->get(
            ['id' => $data],
            ['id',
                'name',
                'triggered_entity',
                'triggered_entity_id',
                'flow_details',
            ]
        );
        if (is_wp_error($integrations)) {
            wp_send_json_error($integrations->get_error_message());
        }

        $integration = $integrations[0];
        $flowDetails = json_decode($integration->flow_details);

        $flowDetails->isAuthorized = $status;

        $integrationHandler = new FlowController();
        $updateStatus = $integrationHandler->update(
            $integration->id,
            [
                'name'                => $integration->name,
                'triggered_entity'    => $integration->triggered_entity,
                'triggered_entity_id' => $integration->triggered_entity_id,
                'flow_details'        => \is_string($flowDetails) ? $flowDetails : wp_json_encode($flowDetails),
            ]
        );
    }

    public function delete($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations') || Capabilities::Check('bit_integrations_delete_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to Delete Integration', 'bit-integrations'));
        }
        $missing_field = null;
        if (empty($data->id)) {
            $missing_field = 'Integration id';
        }
        if (!\is_null($missing_field)) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s can\'t be empty', 'bit-integrations'), $missing_field));
        }
        $integrationHandler = new FlowController();
        $deleteStatus = $integrationHandler->delete($data->id);
        static::updateFlowTrigger($deleteStatus);

        if (is_wp_error($deleteStatus)) {
            wp_send_json_error($deleteStatus->get_error_message());
        }
        wp_send_json_success(__('Integration deleted successfully', 'bit-integrations'));
    }

    public function bulkDelete($param)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations') || Capabilities::Check('bit_integrations_delete_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        if (!\is_array($param->flowID) || $param->flowID === []) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s can\'t be empty', 'bit-integrations'), 'Integration id'));
        }

        $integrationHandler = new FlowController();
        $deleteStatus = $integrationHandler->bulkDelete($param->flowID);
        static::updateFlowTrigger($deleteStatus);

        if (is_wp_error($deleteStatus)) {
            wp_send_json_error($deleteStatus->get_error_message());
        }
        wp_send_json_success(__('Integration deleted successfully', 'bit-integrations'));
    }

    public function toggle_status($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check('bit_integrations_manage_integrations') || Capabilities::Check('bit_integrations_edit_integrations'))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $missing_field = null;
        if (!property_exists($data, 'status')) {
            $missing_field = 'status';
        }
        if (empty($data->id)) {
            $missing_field = 'Integration id';
        }
        if (!\is_null($missing_field)) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s can\'t be empty', 'bit-integrations'), $missing_field));
        }
        $integrationHandler = new FlowController();
        $toggleStatus = $integrationHandler->updateStatus($data->id, $data->status);
        static::updateFlowTrigger($toggleStatus);

        if (is_wp_error($toggleStatus)) {
            wp_send_json_error($toggleStatus->get_error_message());
        }
        wp_send_json_success(__('Status changed successfully', 'bit-integrations'));
    }

    /**
     * This function helps to execute Integration
     *
     * @param string $triggered_entity    Trigger name.
     * @param string $triggered_entity_id Entity(form) ID of Triggered app.
     *
     * @return bool|array Returns existings flows or false
     */
    public static function exists($triggered_entity, $triggered_entity_id = '')
    {
        $flowController = new FlowController();

        $conditions = [
            'triggered_entity' => $triggered_entity,
            'status'           => 1,
        ];

        if (!empty($triggered_entity_id)) {
            $conditions['triggered_entity_id'] = $triggered_entity_id;
        }

        $flows = $flowController->get(
            $conditions,
            [
                'id',
                'triggered_entity_id',
                'flow_details',
            ]
        );
        if (is_wp_error($flows)) {
            return false;
        }

        return $flows;
    }

    /**
     * This function helps to execute Integration
     *
     * @param string $triggered_entity    Trigger name.
     * @param string $triggered_entity_id Entity(form) ID of Triggered app.
     * @param array  $data                Values of submitted fields
     * @param array  $flows               Existing Flows
     * @param mixed  $fieldMap
     *
     * @return array Nothing to return
     */
    public static function specialTagMappingValue($fieldMap)
    {
        $specialTagFieldValue = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField ?? $value->formFields ?? null;

            if (isset($triggerValue)) {
                $smartTagValue = SmartTags::getSmartTagValue($triggerValue, true);

                if (!empty($smartTagValue)) {
                    $specialTagFieldValue[$triggerValue] = $smartTagValue;
                }
            }
        }

        return $specialTagFieldValue;
    }

    public static function execute($triggered_entity, $triggered_entity_id, $data, $flows = [])
    {
        if (!is_wp_error($flows) && !empty($flows)) {
            $data['bit-integrator%trigger_data%'] = [
                'triggered_entity'    => $triggered_entity,
                'triggered_entity_id' => $triggered_entity_id,
            ];
            foreach ($flows as $flowData) {
                if (\is_string($flowData->flow_details)) {
                    $flowData->flow_details = json_decode($flowData->flow_details);
                }

                if (
                    property_exists($flowData->flow_details, 'condition')
                    && property_exists($flowData->flow_details->condition, 'logics')
                    && property_exists($flowData->flow_details->condition, 'action_behavior')
                    && $flowData->flow_details->condition->action_behavior
                    && !Common::checkCondition($flowData->flow_details->condition->logics, $data)
                ) {
                    $error = new WP_Error('Conditional Logic False', __('Conditional Logic not matched', 'bit-integrations'));
                    if (isset($flowData->id)) {
                        LogHandler::save($flowData->id, 'Conditional Logic', 'validation', $error);
                    }

                    continue;
                }

                $integrationName = \is_null($flowData->flow_details->type) ? null : ucfirst(str_replace(' ', '', $flowData->flow_details->type));

                switch ($integrationName) {
                    case 'Brevo(Sendinblue)':
                        $integrationName = 'SendinBlue';

                        break;
                    case 'Kit(ConvertKit)':
                        $integrationName = 'ConvertKit';

                        break;
                    case 'Make(Integromat)':
                        $integrationName = 'Integromat';

                        break;
                    case 'Sarbacane(Mailify)':
                        $integrationName = 'Mailify';

                        break;
                    case 'WPPostCreation':
                        $integrationName = 'PostCreation';

                        break;
                    case 'WPUserRegistration':
                        $integrationName = 'Registration';

                        break;
                    case 'ZohoMarketingAutomation(ZohoMarketingHub)':
                        $integrationName = 'ZohoMarketingHub';

                        break;

                    case 'GoHighLevel':
                        $integrationName = 'HighLevel';

                        break;

                    case 'LicenseManagerForWooCommerce':
                        $integrationName = 'LMFWC';

                        break;

                    case 'OttoKit (SureTriggers)':
                        $integrationName = 'SureTriggers';

                        break;

                    case 'UserRegistration&Membership':
                        $integrationName = 'UserRegistrationMembership';

                        break;

                    case 'WPERP':
                        $integrationName = 'WpErp';

                        break;

                    case 'Monday.Com':
                        $integrationName = 'MondayCom';

                        break;

                    default:
                        $integrationName = $integrationName;

                        break;
                }

                if (!\is_null($integrationName) && $integration = static::isActionExists($integrationName)) {
                    $handler = new $integration($flowData->id);
                    if (isset($flowData->flow_details->field_map)) {
                        $sptagData = self::specialTagMappingValue($flowData->flow_details->field_map);
                        // $data = array_merge($data, $sptagData);
                        $data = $data + $sptagData;
                    }
                    $handler->execute($flowData, $data);
                }
            }
        }
    }

    /**
     * Checks a Integration Action Exists or not
     *
     * @param string $name Name of Action
     *
     * @return bool
     */
    protected static function isActionExists($name)
    {
        if (class_exists("BitApps\\Integrations\\Actions\\{$name}\\{$name}Controller")) {
            return "BitApps\\Integrations\\Actions\\{$name}\\{$name}Controller";
        } elseif (class_exists("BitApps\\BTCBI_PRO\\Actions\\{$name}\\{$name}Controller")) {
            return "BitApps\\BTCBI_PRO\\Actions\\{$name}\\{$name}Controller";
        } elseif (class_exists("BitApps\\IntegrationsPro\\Actions\\{$name}\\{$name}Controller")) {
            return "BitApps\\IntegrationsPro\\Actions\\{$name}\\{$name}Controller";
        }

        return false;
    }

    /**
     * Checks a Integration Trigger Exists or not
     *
     * @param string $name Name of Trigger
     *
     * @return bool
     */
    protected static function isTriggerExists($name)
    {
        if (class_exists("BitApps\\Integrations\\Triggers\\{$name}\\{$name}Controller")) {
            return "BitApps\\Integrations\\Triggers\\{$name}\\{$name}Controller";
        } elseif (class_exists("BitApps\\BTCBI_PRO\\Triggers\\{$name}\\{$name}Controller")) {
            return "BitApps\\BTCBI_PRO\\Triggers\\{$name}\\{$name}Controller";
        } elseif (class_exists("BitApps\\IntegrationsPro\\Triggers\\{$name}\\{$name}Controller")) {
            return "BitApps\\IntegrationsPro\\Triggers\\{$name}\\{$name}Controller";
        }

        return false;
    }

    private static function updateFlowTrigger($saveStatus)
    {
        if ($saveStatus) {
            StoreInCache::getActiveFlowEntities(true);
        }
    }
}
