<?php

namespace BitApps\Integrations\controller;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Capabilities;

final class PostController
{
    public function __construct()
    {
        //
    }

    public function getPostTypes()
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')) || Capabilities::Check(Config::withPrefix('create_integrations')) || Capabilities::Check(Config::withPrefix('edit_integrations')))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $cptArguments = [
            'public'          => true,
            'capability_type' => 'post',
        ];

        $types = get_post_types($cptArguments, 'object');

        $lists = [];

        foreach ($types as $key => $type) {
            $lists[$key]['id'] = $type->name;
            $lists[$key]['title'] = $type->label;
        }
        wp_send_json_success(array_values($lists));
    }

    public function getPostCategories($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')) || Capabilities::Check(Config::withPrefix('create_integrations')) || Capabilities::Check(Config::withPrefix('edit_integrations')))) {
            wp_send_json_error(__('User doesn\'t have permission to access this page', 'bit-integrations'));
        }

        $postType = isset($data->post_type) ? sanitize_text_field($data->post_type) : '';

        if (empty($postType)) {
            wp_send_json_success([], 200);
        }

        $categories = [];
        $taxonomies = get_object_taxonomies($postType, 'objects');

        foreach ($taxonomies as $taxonomy) {
            if (empty($taxonomy->hierarchical)) {
                continue;
            }

            $terms = get_terms(
                [
                    'taxonomy'   => $taxonomy->name,
                    'hide_empty' => false,
                ]
            );

            if (empty($terms) || is_wp_error($terms)) {
                continue;
            }

            $categories = array_merge(
                $categories,
                array_map(
                    function ($term) {
                        return [
                            'label' => $term->name,
                            'value' => $term->term_id,
                        ];
                    },
                    $terms
                )
            );
        }

        wp_send_json_success($categories, 200);
    }

    public static function getAcfFields($postType)
    {
        $acfFields = [];
        $acfFiles = [];
        $filterFile = ['file', 'image', 'gallery'];
        if (class_exists('ACF')) {
            $groups = acf_get_field_groups(['post_type' => $postType]);
            foreach ($groups as $group) {
                foreach (acf_get_fields($group['key']) as $acfField) {
                    if (\in_array($acfField['type'], $filterFile)) {
                        $acfFiles[] = [
                            'key'      => $acfField['key'],
                            'name'     => $acfField['label'],
                            'required' => $acfField['required'] == 1 ? true : false,
                        ];
                    } else {
                        $acfFields[] = [
                            'key'      => $acfField['key'],
                            'name'     => $acfField['label'],
                            'required' => $acfField['required'] == 1 ? true : false,
                        ];
                    }
                }
            }
        }

        return ['fields' => $acfFields, 'files' => $acfFiles];
    }

    public static function getMetaboxFields($postType)
    {
        $metaboxFields = [];
        $metaboxFile = [];
        $fileTypes = [
            'image',
            'image_upload',
            'file_advanced',
            'file_upload',
            'single_image',
            'file',
            'image_advanced',
            'video',
        ];

        if (\function_exists('rwmb_meta')) {
            $fields = rwmb_get_object_fields($postType);
            foreach ($fields as $index => $field) {
                if (!\in_array($field['type'], $fileTypes)) {
                    // if (!in_array($field['type'], $filterTypes)) {
                    //     $metaboxFields[$index]['name'] = $field['name'];
                    // }
                    $metaboxFields[$index]['name'] = $field['name'];
                    $metaboxFields[$index]['key'] = $field['id'];
                    $metaboxFields[$index]['required'] = $field['required'] == 1 ? true : false;
                } else {
                    $metaboxFile[$index]['name'] = $field['name'];
                    $metaboxFile[$index]['key'] = $field['id'];
                    $metaboxFile[$index]['required'] = $field['required'] == 1 ? true : false;
                }
            }
        }

        return ['fields' => array_values($metaboxFields), 'files' => $metaboxFile];
    }

    public static function getJetEngineCPTMetaFields($postType)
    {
        $fields = $files = [];

        if (is_plugin_active('jet-engine/jet-engine.php')) {
            $postTypeObject = get_post_type_object($postType);

            if ($postTypeObject && !is_wp_error($postTypeObject)) {
                $id = $postTypeObject->id;
                $postTypeData = jet_engine()->cpt->data->get_item_for_edit($id);
                if (!empty($postTypeData) && !empty($postTypeData['meta_fields'])) {
                    foreach ($postTypeData['meta_fields'] as $item) {
                        if ($item['object_type'] === 'field') {
                            if ($item['type'] === 'media' || $item['type'] === 'gallery') {
                                $files[] = [
                                    'key'      => $item['name'],
                                    'name'     => $item['title'],
                                    'required' => false,
                                ];
                            } else {
                                $fields[] = [
                                    'key'      => $item['name'],
                                    'name'     => $item['title'],
                                    'required' => (isset($item['is_required']) && $item['is_required']) ? true : false,
                                ];
                            }
                        }
                    }
                }
            }
        }

        return ['fields' => $fields, 'files' => $files];
    }

    public static function getJetEngineCPTRawMeta($postType)
    {
        if (is_plugin_active('jet-engine/jet-engine.php')) {
            $postTypeObject = get_post_type_object($postType);

            if ($postTypeObject && !is_wp_error($postTypeObject)) {
                $id = $postTypeObject->id;
                $postTypeData = jet_engine()->cpt->data->get_item_for_edit($id);
                if (!empty($postTypeData) && !empty($postTypeData['meta_fields'])) {
                    return $postTypeData['meta_fields'];
                }
            }
        }

        return [];
    }

    public function getCustomFields($data)
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')) || Capabilities::Check(Config::withPrefix('create_integrations')) || Capabilities::Check(Config::withPrefix('edit_integrations')))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }

        $acf = self::getAcfFields($data->post_type);

        $metabox = self::getMetaboxFields($data->post_type);
        $jetEngineCPTMeta = self::getJetEngineCPTMetaFields($data->post_type);
        $fields = [
            'acf_fields'    => $acf['fields'],
            'acf_files'     => $acf['files'],
            'mb_fields'     => $metabox['fields'],
            'mb_files'      => $metabox['files'],
            'je_cpt_fields' => $jetEngineCPTMeta['fields'],
            'je_cpt_files'  => $jetEngineCPTMeta['files']
        ];

        wp_send_json_success($fields, 200);
    }

    public function getPages()
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')) || Capabilities::Check(Config::withPrefix('create_integrations')))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $pages = get_pages(['post_status' => 'publish', 'sort_column' => 'post_date', 'sort_order' => 'desc']);
        $allPages = [];
        foreach ($pages as $pageKey => $pageDetails) {
            $allPages[$pageKey]['title'] = $pageDetails->post_title;
            $allPages[$pageKey]['url'] = get_page_link($pageDetails->ID);
        }

        return $allPages;
    }

    public function getPodsPostType()
    {
        if (!(Capabilities::Check('manage_options') || Capabilities::Check(Config::withPrefix('manage_integrations')) || Capabilities::Check(Config::withPrefix('create_integrations')) || Capabilities::Check(Config::withPrefix('edit_integrations')))) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }
        $users = get_users(['fields' => ['ID', 'display_name']]);
        $pods = [];
        $podsAdminExists = is_plugin_active('pods/init.php');

        if ($podsAdminExists) {
            $allPods = pods_api()->load_pods();
            foreach (array_values($allPods) as $index => $pod) {
                $pods[$index]['name'] = $pod['name'];
                $pods[$index]['label'] = $pod['label'];
            }
        }
        $data = ['users' => $users, 'post_types' => $pods];
        wp_send_json_success($data, 200);
    }

    public function getPodsField($data)
    {
        $podsAdminExists = is_plugin_active('pods/init.php');
        $podField = [];
        $podFile = [];
        if ($podsAdminExists) {
            $pods = pods($data->post_type);
            $i = 0;
            foreach (array_values($pods->fields) as $field) {
                $i++;
                if ($field['type'] === 'file') {
                    $podFile[$i]['key'] = $field['name'];
                    $podFile[$i]['name'] = $field['label'];
                    $podFile[$i]['required'] = $field['options']['required'] == 1 ? true : false;
                } else {
                    $podField[$i]['key'] = $field['name'];
                    $podField[$i]['name'] = $field['label'];
                    $podField[$i]['required'] = $field['options']['required'] == 1 ? true : false;
                }
            }
        }
        // echo wp_json_encode(array_values($pods->fields) );
        wp_send_json_success(['podFields' => $podField, 'podFiles' => $podFile], 200);
    }
}
