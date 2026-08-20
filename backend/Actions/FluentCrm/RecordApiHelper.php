<?php

/**
 * Fluent CRM Record Api
 */

namespace BitApps\Integrations\Actions\FluentCrm;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;
use FluentCrm\App\Models\Subscriber;

class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integId)
    {
        $this->_integrationID = $integId;
    }

    public function insertRecord($data, $actions)
    {
        $subscriber = Subscriber::where('email', $data['email'])->first();

        if ($subscriber && isset($actions->skip_if_exists) && $actions->skip_if_exists) {
            $response = [
                'success'  => false,
                'messages' => __('Contact already exists!', 'bit-integrations')
            ];
        } else {
            if (!$subscriber) {
                if (isset($actions->double_opt_in) && $actions->double_opt_in) {
                    $data['status'] = 'pending';
                } else {
                    $data['status'] = 'subscribed';
                }

                $subscriber = FluentCrmApi('contacts')->createOrUpdate($data, false, false);

                if ($subscriber->status === 'pending') {
                    $subscriber->sendDoubleOptinEmail();
                }
                if ($subscriber) {
                    $response = [
                        'success'  => true,
                        'messages' => __('Insert successfully!', 'bit-integrations')
                    ];
                } else {
                    $response = [
                        'success'  => false,
                        'messages' => __('Something wrong!', 'bit-integrations')
                    ];
                }
            } else {
                $hasDouBleOptIn = isset($actions->double_opt_in) && $actions->double_opt_in;

                $forceSubscribed = !$hasDouBleOptIn && ($subscriber->status != 'subscribed');

                if ($forceSubscribed) {
                    $data['status'] = 'subscribed';
                }

                $subscriber = FluentCrmApi('contacts')->createOrUpdate($data, $forceSubscribed, false);

                if ($hasDouBleOptIn && ($subscriber->status === 'pending' || $subscriber->status === 'unsubscribed')) {
                    $subscriber->sendDoubleOptinEmail();
                }
                if ($subscriber) {
                    $response = [
                        'success'  => true,
                        'messages' => __('Insert successfully!', 'bit-integrations')
                    ];
                } else {
                    $response = [
                        'success'  => false,
                        'messages' => __('Something wrong!', 'bit-integrations')
                    ];
                }
            }
        }

        return $response;
    }

    public function insertDeleteTag($data, $actionName)
    {
        $subscriber = Subscriber::where('email', $data['email'])->first();

        if (!$subscriber) {
            return ['success' => false, 'messages' => __("Contact doesn't exists!", 'bit-integrations')];
        }

        $tags = $data['tags'];

        if ($actionName === 'add-tag') {
            $subscriber->attachTags($tags);
            $message = __('Tag added successfully!', 'bit-integrations');
        } else {
            $subscriber->detachTags($tags);
            $message = __('Tag remove successfully!', 'bit-integrations');
        }

        unset($data['tags']);
        FluentCrmApi('contacts')->createOrUpdate($data, false, false);

        return ['success' => true, 'messages' => $message];
    }

    public function removeUser($data)
    {
        $subscriber = Subscriber::where('email', $data['email'])->first();

        if (!$subscriber) {
            return $response = [
                'success'  => false,
                'messages' => __("Contact doesn't exists!", 'bit-integrations')
            ];
        }

        $listId = $data['lists'];

        $subscriber->detachLists($listId);

        return $response = [
            'success'  => true,
            'messages' => __('User remove from list successfully!', 'bit-integrations')
        ];
    }

    public function execute($fieldValues, $fieldMap, $actions, $list_id, $tags, $actionName)
    {
        $fieldData = Hooks::apply(Config::withPrefix('fluent_crm_assign_company'), [], (array) $actions);

        if (empty($fieldData)) {
            $fieldData = Hooks::apply('btcbi_fluent_crm_assign_company', [], (array) $actions);
        }

        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->fluentCRMField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->fluentCRMField] = $fieldPair->customValue;
                } else {
                    $fieldData[$fieldPair->fluentCRMField] = $fieldValues[$fieldPair->formField];
                }
            }
        }

        if (!\is_null($list_id)) {
            $fieldData['lists'] = [$list_id];
        }
        if (!\is_null($tags)) {
            $fieldData['tags'] = $tags;
        }

        switch ($actionName) {
            case 'add-tag':
            case 'remove-tag':
                $recordApiResponse = $this->insertDeleteTag($fieldData, $actionName);

                break;
            case 'add-user':
                $recordApiResponse = $this->insertRecord($fieldData, $actions);

                break;
            case 'remove-user':
                $recordApiResponse = $this->removeUser($fieldData);

                break;
        }

        if ($recordApiResponse['success']) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $actionName], 'success', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $actionName], 'error', $recordApiResponse);
        }

        return $recordApiResponse;
    }
}
