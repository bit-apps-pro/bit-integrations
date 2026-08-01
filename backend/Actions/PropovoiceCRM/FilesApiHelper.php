<?php

namespace BitApps\Integrations\Actions\PropovoiceCRM;

use BitApps\Integrations\Core\Util\Common;
use WP_Error;

/**
 * Provide functionality for Record insert, upsert
 */
final class FilesApiHelper
{
    public function uploadFile($file_data)
    {
        $file = self::simulateFileUpload($file_data);
        $allowed_file_types = ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'];
        $reg_errors = new WP_Error();

        if (!empty($file) && !empty($file['name'])) {
            if (!\in_array($file['type'], $allowed_file_types)) {
                $valid_file_type = str_replace(
                    'image/',
                    '',
                    implode(', ', $allowed_file_types)
                );
                $error_file_type = str_replace('image/', '', $file['type']);

                // translators: %s: Placeholder value
                $reg_errors->add('field', wp_sprintf(__('Invalid file type: %1$s. Supported file types: %2$s', 'bit-integrations'), $error_file_type, $valid_file_type));
            }

            if (!empty($reg_errors->get_error_messages())) {
                wp_send_json_error($reg_errors->get_error_messages());
            } else {
                if (!\function_exists('wp_handle_upload')) {
                    require_once ABSPATH . 'wp-admin/includes/file.php';
                }
                $upload_overrides = ['test_form' => false, 'test_upload' => false];
                $uploaded = wp_handle_sideload($file, $upload_overrides);

                if ($uploaded && !isset($uploaded['error'])) {
                    $filename = $uploaded['file'];
                    $filetype = wp_check_filetype(basename($filename), null);

                    $attach_id = wp_insert_attachment(
                        [
                            'guid'       => $uploaded['url'],
                            'post_title' => sanitize_text_field(
                                preg_replace(
                                    '/\.[^.]+$/',
                                    '',
                                    basename($filename)
                                )
                            ),
                            'post_excerpt'   => '',
                            'post_content'   => '',
                            'post_mime_type' => sanitize_text_field(
                                $filetype['type']
                            ),
                            'comments_status' => 'closed',
                        ],
                        $uploaded['file'],
                        0
                    );

                    $file_info = [];
                    if (!is_wp_error($attach_id)) {
                        // wp_update_attachment_metadata($attach_id, wp_generate_attachment_metadata($attach_id, $filename));
                        update_post_meta(
                            $attach_id,
                            'ws_id',
                            ndpv()->get_workspace()
                        );
                        update_post_meta(
                            $attach_id,
                            'ndpv_attach_type',
                            $attach_type
                        );

                        $file_info = [
                            'id'   => $attach_id,
                            'type' => get_post_mime_type($attach_id),
                            'name' => basename(get_attached_file($attach_id)),
                            'src'  => wp_get_attachment_image_url(
                                $attach_id,
                                'thumbnail'
                            ),
                        ];

                        if ($file_info['type'] == 'application/pdf') {
                            $file_info['name'] = basename(get_attached_file($attach_id));
                            $file_info['src'] = wp_get_attachment_url($attach_id);
                        }
                    }

                    return $file_info;
                }
                wp_send_json_error($uploaded['error']);
            }
        }
    }

    private static function simulateFileUpload($file_path)
    {
        $file_path = Common::safeUploadFilePath($file_path);

        if ($file_path === '') {
            return false;
        }

        return [
            'name'     => basename($file_path),
            'type'     => mime_content_type($file_path),
            'tmp_name' => $file_path,
            'error'    => 0,
            'size'     => filesize($file_path),
        ];
    }
}
