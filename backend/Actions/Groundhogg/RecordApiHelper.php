<?php

/**
 * Groundhogg Record Api
 */

namespace BitApps\Integrations\Actions\Groundhogg;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    private $apiResponseSuccess;

    private $apiResponseError;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $key => $value) {
            if (!empty($value->GroundhoggMapField)) {
                $triggerValue = $value->formField;
                $actionValue = $value->GroundhoggMapField;
                if ($triggerValue === 'custom') {
                    $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
                } elseif (isset($data[$triggerValue]) && !\is_null($data[$triggerValue])) {
                    $dataFinal[$actionValue] = $data[$triggerValue];
                }
            }
        }

        return $dataFinal;
    }

    public function generateMetaDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->GroundhoggMetaMapField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customMetaFormValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            } else {
                $dataFinal[$actionValue] = $triggerValue;
            }
        }

        return $dataFinal;
    }

    public static function createContact($finalData, $integrationDetails)
    {
        if (empty($integrationDetails->token) || empty($integrationDetails->public_key) || empty($integrationDetails->domainName)) {
            wp_send_json_error(
                __(
                    'Request parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $authorizationHeader = [
            'Gh-Token'      => $integrationDetails->token,
            'Gh-Public-Key' => $integrationDetails->public_key
        ];
        $finalData['optin_status'] = (int) $integrationDetails->optin_status;
        $apiEndpoint = $integrationDetails->domainName . '/index.php?rest_route=/gh/v3/contacts';

        if (isset($finalData['note'])) {
            $noteData = [
                'object_type' => 'contact',
                'type'        => 'note',
                'content'     => $finalData['note'],
            ];
        }

        $response = HttpHelper::post($apiEndpoint, $finalData, $authorizationHeader);
        if (isset($noteData)) {
            $noteData[0]['object_id'] = $response->contact->ID;
            $apiEndpoint = $integrationDetails->domainName . '/index.php?rest_route=/gh/v4/notes/';

            return $response = HttpHelper::post($apiEndpoint, wp_json_encode(['data' => $noteData]), $authorizationHeader);
        }

        return $response;
    }

    public static function createTag($diffTags, $integrationDetails)
    {
        if (empty($integrationDetails->token) || empty($integrationDetails->public_key) || empty($integrationDetails->domainName)) {
            wp_send_json_error(
                __(
                    'Request parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $authorizationHeader = [
            'Gh-Token'      => $integrationDetails->token,
            'Gh-Public-Key' => $integrationDetails->public_key
        ];

        $apiEndpoint = $integrationDetails->domainName . '/index.php?rest_route=/gh/v3/tags';

        return HttpHelper::post($apiEndpoint, $diffTags, $authorizationHeader);
    }

    public static function checkExitsTagsOrCreate($integrationDetails, $finalReorganizedTags)
    {
        $authorizationParams = [
            'Gh-Token'      => $integrationDetails->token,
            'Gh-Public-Key' => $integrationDetails->public_key
        ];
        $exitsTags = [];

        $apiEndpoint = $integrationDetails->domainName . '/index.php?rest_route=/gh/v3/tags';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $authorizationParams);
        if ($apiResponse->status === 'success') {
            $tags = $apiResponse->tags;
            foreach ($tags as $tag) {
                $exitsTags[] = $tag->tag_name;
            }
        } else {
            return;
        }

        $diffTags['tags'] = array_diff($finalReorganizedTags, $exitsTags);

        if ($diffTags) {
            self::createTag($diffTags, $integrationDetails);
        }
    }

    public static function addTagsToExitsUser($addTagsToUser, $integrationDetails, $addTagToEmail)
    {
        $authorizationParams = [
            'Gh-Token'      => $integrationDetails->token,
            'Gh-Public-Key' => $integrationDetails->public_key
        ];
        $prePraperData = [
            'id_or_email' => $addTagToEmail,
            'tags'        => $addTagsToUser,
        ];
        $apiEndpoint = $integrationDetails->domainName . '/index.php?rest_route=/gh/v3/contacts/apply_tags';

        return HttpHelper::request($apiEndpoint, 'PUT', $prePraperData, $authorizationParams);
    }

    public function execute(
        $fieldValues,
        $fieldMap,
        $integrationDetails,
        $actions
    ) {
        $mainAction = $integrationDetails->mainAction;
        $fieldData = [];
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        // 1 = create contact with tag
        if ($mainAction === '1') {
            if ($integrationDetails->showMeta) {
                $fieldMapMeta = $integrationDetails->field_map_meta;
                $metaData = $this->generateMetaDataFromFieldMap($fieldValues, $fieldMapMeta);
                $finalData['meta'] = $metaData;
            }
            if ($actions->tags) {
                $finalReorganizedTags = [];
                $tags = explode(',', $actions->tags);
                foreach ($tags as $tag) {
                    if (isset($fieldValues[$tag])) {
                        $finalReorganizedTags[] = $fieldValues[$tag];
                    } else {
                        $sanitize = ltrim($tag, 'ground-');
                        $finalReorganizedTags[] = $sanitize;
                    }
                }
                $finalData['tags'] = $finalReorganizedTags;
                $this->checkExitsTagsOrCreate($integrationDetails, $finalReorganizedTags);
            }
            $apiResponseContact = $this->createContact($finalData, $integrationDetails);
        }
        // 2 = add tag to contact
        if ($mainAction === '2') {
            $addTagsToUser = [];
            $addTagToEmails = [];
            $allSelectedEmails = explode(',', $integrationDetails->emailAddress);
            foreach ($allSelectedEmails as $emailAddress) {
                $addTagToEmails[] = $fieldValues[$emailAddress];
            }

            if ($integrationDetails->addTagToUser) {
                $tags = explode(',', $integrationDetails->addTagToUser);
                foreach ($tags as $tag) {
                    if (isset($fieldValues[$tag])) {
                        $addTagsToUser[] = $fieldValues[$tag];
                    } else {
                        $sanitize = ltrim($tag, 'ground-');
                        $addTagsToUser[] = $sanitize;
                    }
                }
                $finalData['tags'] = $addTagsToUser;
            }
            $this->checkExitsTagsOrCreate($integrationDetails, $addTagsToUser);
            foreach ($addTagToEmails as $addTagToEmail) {
                $apiResponse = $this->addTagsToExitsUser($addTagsToUser, $integrationDetails, $addTagToEmail);
                if (property_exists($apiResponse, 'code')) {
                    $apiResponseError[$addTagToEmail] = $apiResponse;
                } else {
                    $apiResponseSuccess[$addTagToEmail] = $apiResponse;
                }
            }
        }

        if ($mainAction === '1') {
            if ($apiResponseContact->status === 'success') {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'add-contact']), 'success', $apiResponseContact);
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'add-contact']), 'error', $apiResponseContact);
            }
        }
        if ($mainAction === '2') {
            if (!empty($apiResponseSuccess)) {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'add-tags-contact']), 'success', $apiResponseSuccess);
            } elseif (!empty($apiResponseError)) {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'add-tags-contact']), 'error', $apiResponseError);
            }
        }

        return $apiResponse;
    }
}
