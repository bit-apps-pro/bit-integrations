<?php

namespace BitApps\Integrations\Actions\BitConnect;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        $mainAction = $this->_integrationDetails->mainAction ?? '';

        if (!BitConnectController::isPluginActive()) {
            $response = ['success' => false, 'message' => BitConnectController::inactiveMessage()];
            LogHandler::save($this->_integrationID, ['type' => 'BitConnect', 'type_name' => $mainAction], 'error', $response);

            return $response;
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        switch ($mainAction) {
            case 'create_post':
                $response = BitConnectActionHelper::createPost($fieldData, $this->_integrationDetails);
                $type = 'post';

                break;

            case 'set_post_status':
                $response = BitConnectActionHelper::setPostStatus($fieldData, $this->_integrationDetails);
                $type = 'post';

                break;

            case 'vote_for_post':
                $response = BitConnectActionHelper::voteForPost($fieldData);
                $type = 'post';

                break;

            case 'add_comment':
                $response = BitConnectActionHelper::addComment($fieldData);
                $type = 'comment';

                break;

            case 'award_badge':
                $response = BitConnectActionHelper::awardBadge($fieldData, $this->_integrationDetails);
                $type = 'member';

                break;

            case 'add_member_to_group':
                $response = BitConnectActionHelper::addMemberToGroup($fieldData, $this->_integrationDetails);
                $type = 'group';

                break;

            case 'remove_member_from_group':
                $response = BitConnectActionHelper::removeMemberFromGroup($fieldData, $this->_integrationDetails);
                $type = 'group';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'BitConnect';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ((array) $fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->bitConnectField ?? '';

            if (empty($triggerValue) || empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
