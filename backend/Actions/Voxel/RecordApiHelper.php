<?php

/**
 * Voxel Record Api
 */

namespace BitApps\Integrations\Actions\Voxel;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integId)
    {
        $this->_integrationID = $integId;
    }

    public function newPost($finalData, $selectedOptions)
    {
        if (empty($finalData['post_author_email'])) {
            return ['success' => false, 'message' => __('Request parameter(s) empty!', 'bit-integrations'), 'code' => 400];
        }

        $authorEmail = $finalData['post_author_email'];
        $postType = !empty($selectedOptions['selectedPostType']) ? $selectedOptions['selectedPostType'] : 'post';
        $postStatus = !empty($selectedOptions['selectedPostStatus']) ? $selectedOptions['selectedPostStatus'] : 'draft';
        $postTitle = !empty($finalData['title']) ? $finalData['title'] : '';

        if (is_email($authorEmail)) {
            $user = get_user_by('email', $authorEmail);
            $userId = $user ? $user->ID : 1;
        } else {
            $userId = 1;
        }

        $postData = [
            'post_type'   => $postType,
            'post_title'  => $postTitle,
            'post_status' => $postStatus,
            'post_author' => $userId,
        ];

        $postId = wp_insert_post($postData);

        VoxelHelper::updateVoxelPost($finalData, $postType, $postId);

        return ['success' => true, 'message' => __('New post created successfully. Post ID: ', 'bit-integrations') . $postId];
    }

    public function newCollectionPost($finalData, $selectedOptions)
    {
        if (empty($finalData['post_author_email'])) {
            return ['success' => false, 'message' => __('Request parameter(s) empty!', 'bit-integrations'), 'code' => 400];
        }

        $authorEmail = $finalData['post_author_email'];
        $postType = VoxelTasks::COLLECTION_POST_TYPE;
        $postStatus = !empty($selectedOptions['selectedPostStatus']) ? $selectedOptions['selectedPostStatus'] : 'draft';
        $postTitle = !empty($finalData['title']) ? $finalData['title'] : '';

        if (is_email($authorEmail)) {
            $user = get_user_by('email', $authorEmail);
            $userId = $user ? $user->ID : 1;
        } else {
            $userId = 1;
        }

        $postData = [
            'post_type'   => $postType,
            'post_title'  => $postTitle,
            'post_status' => $postStatus,
            'post_author' => $userId,
        ];

        $postId = wp_insert_post($postData);

        VoxelHelper::updateVoxelPost($finalData, $postType, $postId);

        return ['success' => true, 'message' => __('New collection post created successfully. Post ID: ', 'bit-integrations') . $postId];
    }

    public function newProfile($finalData)
    {
        if (empty($finalData['user_email'])) {
            return ['success' => false, 'message' => __('User email not found!', 'bit-integrations'), 'code' => 400];
        }

        $userEmail = $finalData['user_email'];

        if (!is_email($userEmail)) {
            return ['success' => false, 'message' => __('User email is not valid!', 'bit-integrations'), 'code' => 400];
        }

        $user = get_user_by('email', $userEmail);

        if (!$user) {
            return ['success' => false, 'message' => __('User not found!', 'bit-integrations'), 'code' => 400];
        }

        $userId = $user->ID;
        $voxelUser = \Voxel\User::get($userId);
        $profileId = $user->get_profile_id();

        if (!$profileId) {
            $profile = $voxelUser->get_or_create_profile();
            $profileId = $profile->get_id();
        }

        VoxelHelper::updateVoxelPost($finalData, VoxelTasks::PROFILE_POST_TYPE, $profileId);

        return ['success' => true, 'message' => __('New profile created successfully. Profile ID: ', 'bit-integrations') . $profileId];
    }

    public function updatePost($finalData, $selectedOptions)
    {
        if (empty($selectedOptions['selectedPostStatus']) || empty($selectedOptions['selectedPost']) || empty($selectedOptions['selectedPostType'])) {
            return ['success' => false, 'message' => __('Request parameter(s) empty!', 'bit-integrations'), 'code' => 400];
        }

        $postId = $selectedOptions['selectedPost'];
        $postType = $selectedOptions['selectedPostType'];
        $postStatus = $selectedOptions['selectedPostStatus'];
        $postTitle = !empty($finalData['title']) ? $finalData['title'] : '';

        $args = [
            'ID'          => $postId,
            'post_status' => $postStatus
        ];

        if (!empty($postTitle)) {
            $args['post_title'] = $postTitle;
        }

        wp_update_post($args);

        VoxelHelper::updateVoxelPost($finalData, $postType, $postId);

        return ['success' => true, 'message' => __('Post updated successfully. Post ID: ', 'bit-integrations') . $postId];
    }

    public function updateCollectionPost($finalData, $selectedOptions)
    {
        if (empty($selectedOptions['selectedPostStatus']) || empty($selectedOptions['selectedPost'])) {
            return ['success' => false, 'message' => __('Request parameter(s) empty!', 'bit-integrations'), 'code' => 400];
        }

        $postId = $selectedOptions['selectedPost'];
        $postStatus = $selectedOptions['selectedPostStatus'];
        $postTitle = !empty($finalData['title']) ? $finalData['title'] : '';

        $args = [
            'ID'          => $postId,
            'post_status' => $postStatus
        ];

        if (!empty($postTitle)) {
            $args['post_title'] = $postTitle;
        }

        wp_update_post($args);

        VoxelHelper::updateVoxelPost($finalData, VoxelTasks::COLLECTION_POST_TYPE, $postId);

        return ['success' => true, 'message' => __('Collection post updated successfully. Post ID: ', 'bit-integrations') . $postId];
    }

    public function updateProfile($finalData)
    {
        if (empty($finalData['profile_id'])) {
            return ['success' => false, 'message' => __('Profile id not found!', 'bit-integrations'), 'code' => 400];
        }

        $profileId = $finalData['profile_id'];
        $profile = \Voxel\User::get_by_profile_id($profileId);

        if (!$profile) {
            return ['success' => false, 'message' => __('Profile not found!', 'bit-integrations'), 'code' => 400];
        }

        VoxelHelper::updateVoxelPost($finalData, VoxelTasks::PROFILE_POST_TYPE, $profileId);

        return ['success' => true, 'message' => __('Profile updated successfully. Profile ID: ', 'bit-integrations') . $profileId];
    }

    public function setPostVerified($finalData)
    {
        if (empty($finalData['post_id'])) {
            return ['success' => false, 'message' => __('Post id not found!', 'bit-integrations'), 'code' => 400];
        }

        $postId = $finalData['post_id'];

        $post = \Voxel\Post::force_get($postId);

        if (!$post) {
            return ['success' => false, 'message' => __('Post not found!', 'bit-integrations'), 'code' => 400];
        }

        $post->set_verified(true);

        return ['success' => true, 'message' => __('Post set as verified. Post ID: ', 'bit-integrations') . $postId];
    }

    public function setCollectionPostVerified($finalData)
    {
        if (empty($finalData['post_id'])) {
            return ['success' => false, 'message' => __('Post id not found!', 'bit-integrations'), 'code' => 400];
        }

        $postId = $finalData['post_id'];
        $postType = get_post_type($postId);

        if ($postType !== VoxelTasks::COLLECTION_POST_TYPE) {
            return ['success' => false, 'message' => __('Post type not matched!', 'bit-integrations'), 'code' => 400];
        }

        $post = \Voxel\Post::force_get($postId);

        if (!$post) {
            return ['success' => false, 'message' => __('Post not found!', 'bit-integrations'), 'code' => 400];
        }

        $post->set_verified(true);

        return ['success' => true, 'message' => __('Post collection set as verified. Post ID: ', 'bit-integrations') . $postId];
    }

    public function setProfileVerified($finalData)
    {
        if (empty($finalData['profile_id'])) {
            return ['success' => false, 'message' => __('Profile id not found!', 'bit-integrations'), 'code' => 400];
        }

        $profileId = $finalData['profile_id'];
        $postType = get_post_type($profileId);

        if ($postType !== VoxelTasks::PROFILE_POST_TYPE) {
            return ['success' => false, 'message' => __('Post type not matched!', 'bit-integrations'), 'code' => 400];
        }

        $profile = \Voxel\Post::force_get($profileId);

        $profile->set_verified(true);

        return ['success' => true, 'message' => __('Profile set as verified. Profile ID: ', 'bit-integrations') . $profileId];
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->voxelField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $selectedTask, $selectedOptions)
    {
        if (isset($fieldMap[0]) && empty($fieldMap[0]->formField)) {
            $finalData = [];
        } else {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        }

        $type = $typeName = '';

        switch ($selectedTask) {
            case VoxelTasks::NEW_POST:
                $response = $this->newPost($finalData, $selectedOptions);
                $type = 'New Post';
                $typeName = 'Create New Post';

                break;
            case VoxelTasks::NEW_COLLECTION_POST:
                $response = $this->newCollectionPost($finalData, $selectedOptions);
                $type = 'New Collection Post';
                $typeName = 'Create New Collection Post';

                break;
            case VoxelTasks::NEW_PROFILE:
                $response = $this->newProfile($finalData);
                $type = 'New Profile';
                $typeName = 'Create New Profile';

                break;
            case VoxelTasks::UPDATE_POST:
                $response = $this->updatePost($finalData, $selectedOptions);
                $type = 'Update Post';
                $typeName = 'Update Post of a specific type';

                break;
            case VoxelTasks::UPDATE_COLLECTION_POST:
                $response = $this->updateCollectionPost($finalData, $selectedOptions);
                $type = 'Update Collection Post';
                $typeName = 'Update Collection Post';

                break;
            case VoxelTasks::UPDATE_PROFILE:
                $response = $this->updateProfile($finalData);
                $type = 'Update Profile';
                $typeName = 'Update Profile';

                break;
            case VoxelTasks::SET_POST_VERIFIED:
                $response = $this->setPostVerified($finalData);
                $type = 'Set Verified';
                $typeName = 'Set Post as Verified';

                break;
            case VoxelTasks::SET_COLLECTION_POST_VERIFIED:
                $response = $this->setCollectionPostVerified($finalData);
                $type = 'Set Verified';
                $typeName = 'Set Collection Post as Verified';

                break;
            case VoxelTasks::SET_PROFILE_VERIFIED:
                $response = $this->setProfileVerified($finalData);
                $type = 'Set Verified';
                $typeName = 'Set Profile as Verified';

                break;

            default:
                break;
        }

        if ($response['success']) {
            $res = ['message' => $response['message']];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $typeName]), 'error', wp_json_encode($response));
        }

        return $response;
    }
}
