<?php

namespace BitApps\Integrations\Core\Util;

class AttachmentHandler
{
    public static function fetchAttachmentDetails($attachmentId)
    {
        $attachmentPost = self::getAttachmentPost($attachmentId);

        if (!$attachmentPost) {
            return [];
        }

        return self::formatAttachmentDetails($attachmentPost);
    }

    private static function getAttachmentPost($attachmentId)
    {
        return get_post($attachmentId) ?: null;
    }

    /**
     * Format the attachment details into an array.
     *
     * @param WP_Post $attachmentPost The attachment post object.
     *
     * @return array The formatted attachment details.
     */
    private static function formatAttachmentDetails($attachmentPost)
    {
        return [
            'title'       => $attachmentPost->post_title,
            'source'      => $attachmentPost->guid,
            'caption'     => $attachmentPost->post_excerpt,
            'description' => $attachmentPost->post_content,
            'alt_text'    => self::getAltText($attachmentPost->ID),
            'permalink'   => get_permalink($attachmentPost->ID),
        ];
    }

    /**
     * Retrieve the alt text for the attachment.
     *
     * @param int $attachmentId The attachment post ID.
     *
     * @return string The alt text for the attachment.
     */
    private static function getAltText($attachmentId)
    {
        return get_post_meta($attachmentId, '_wp_attachment_image_alt', true) ?: '';
    }
}
