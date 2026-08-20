<?php

/**
 * Zoho CRM Meta Data Api Helper
 */

namespace BitApps\Integrations\Actions\ZohoCRM;

use BitApps\Integrations\Core\Util\HttpHelper;

final class MetaDataApiHelper
{
    private $_defaultHeader;

    private $_apiDomain;

    private $_module;

    public function __construct($tokenDetails, $minorV = false)
    {
        $this->_defaultHeader['Authorization'] = "Zoho-oauthtoken {$tokenDetails->access_token}";
        $this->_apiDomain = urldecode($tokenDetails->api_domain) . '/crm/v2.1/settings';
    }

    /**
     * Helps to get Assignment rules of a Zoho CRM module
     *
     * @param $module Name of the module for which Assignment rules needs to retrive
     *
     * @return object $relatedLists Assignment rules
     */
    public function getAssignmentRules($module)
    {
        $getAssignmentRulesEndpoint = "{$this->_apiDomain}/automation/assignment_rules";
        $getAssignmentRulesResponse = HttpHelper::get($getAssignmentRulesEndpoint, ['module' => $module], $this->_defaultHeader);
        if (is_wp_error($getAssignmentRulesResponse)) {
            return $getAssignmentRulesResponse;
        }
        $assignment_rules = [];
        if (!empty($getAssignmentRulesResponse->assignment_rules)) {
            foreach ($getAssignmentRulesResponse->assignment_rules as $rulesDetails) {
                $assignment_rules[$rulesDetails->name] = $rulesDetails->id;
            }
        } else {
            return $getAssignmentRulesResponse;
        }

        return (object) $assignment_rules;
    }

    /**
     * Helps to get Related Lists of a Zoho CRM module
     *
     * @param $module Name of the module for which related lists needs to retrive
     *
     * @return array $relatedLists Related Lists
     */
    public function getRelatedLists($module)
    {
        $getRelatedListsEndpoint = "{$this->_apiDomain}/related_lists";
        $getRelatedListsResponse = HttpHelper::get($getRelatedListsEndpoint, ['module' => $module], $this->_defaultHeader);
        if (is_wp_error($getRelatedListsResponse)) {
            return $getRelatedListsResponse;
        }

        if ($module !== 'Tasks' || $module !== 'Events' || $module !== 'Calls') {
            $related_lists = [
                'Tasks' => (object) [
                    'name'     => 'Tasks',
                    'api_name' => 'Tasks',
                    'href'     => null,
                    'module'   => 'Tasks',
                ],
                'Events' => (object) [
                    'name'     => 'Events',
                    'api_name' => 'Events',
                    'href'     => null,
                    'module'   => 'Events',
                ],
                'Calls' => (object) [
                    'name'     => 'Calls',
                    'api_name' => 'Calls',
                    'href'     => null,
                    'module'   => 'Calls',
                ],
            ];
        }

        $relatedModuleToRemove = ['Attachments', 'Products', 'Activities', 'Activities_History', 'Emails', 'Invited_Events', 'Campaigns', 'Social', 'CheckLists', 'Zoho_Survey', 'Visits_Zoho_Livedesk', 'ZohoSign_Documents', 'Lead_Quote', 'Zoho_ShowTime'];
        if (!empty($getRelatedListsResponse->related_lists)) {
            foreach ($getRelatedListsResponse->related_lists as $relatedListsDetails) {
                if (!\in_array($relatedListsDetails->api_name, $relatedModuleToRemove)) {
                    $related_lists[$relatedListsDetails->api_name] = (object) [
                        'name'     => $relatedListsDetails->name,
                        'api_name' => $relatedListsDetails->api_name,
                        'href'     => $relatedListsDetails->href,
                        'module'   => $relatedListsDetails->module,
                    ];
                }
            }
        } else {
            return $getRelatedListsResponse;
        }

        return $related_lists;
    }
}
