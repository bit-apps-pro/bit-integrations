<?php

/**
 * Mailster Record Api
 */

namespace BitApps\Integrations\Actions\Mailster;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;
use MailsterSubscribers;

class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integId)
    {
        $this->_integrationID = $integId;
    }

    public function addSubscriber($finalData, $selectedStatus, $selectedLists, $selectedTags)
    {
        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        if (!empty($selectedStatus)) {
            $finalData['status'] = $selectedStatus;
        }

        $mailsterSubscribers = new MailsterSubscribers();

        $subscriberAdd = $mailsterSubscribers->add($finalData);

        if (is_wp_error($subscriberAdd)) {
            return $subscriberAdd;
        }

        if (!empty($selectedLists)) {
            $mailsterSubscribers->assign_lists($subscriberAdd, explode(',', $selectedLists));
        }

        if (!empty($selectedTags)) {
            $mailsterSubscribers->assign_tags($subscriberAdd, explode(',', $selectedTags));
        }

        return $subscriberAdd;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->mailsterFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = \is_array($data[$triggerValue]) ? implode(',', $data[$triggerValue]) : $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $selectedStatus, $selectedLists, $selectedTags)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $response = $this->addSubscriber($finalData, $selectedStatus, $selectedLists, $selectedTags);

        if (!is_wp_error($response)) {
            $res = ['message' => __('Subscriber added successfully', 'bit-integrations')];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'subscriber', 'type_name' => 'Subscriber add']), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => '', 'type_name' => 'Adding subscriber']), 'error', wp_json_encode($response));
        }

        return $response;
    }
}
