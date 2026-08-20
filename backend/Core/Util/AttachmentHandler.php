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

    private static function getAltText($attachmentId)
    {
        return get_post_meta($attachmentId, '_wp_attachment_image_alt', true) ?: '';
    }
}
