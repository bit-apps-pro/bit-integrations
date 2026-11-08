<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Triggers\BitConnect\BitConnectController;

Hooks::add('bit_connect_topic_created', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_topic_status_changed', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_topic_voted', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_poll_voted', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_comment_created', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_comment_voted', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_member_registered', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_member_logged_in', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_badge_awarded', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_group_joined', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_group_left', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_report_filed', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_report_resolved', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_moderation_action', [BitConnectController::class, 'handleForumEvent'], 20, 1);
Hooks::add('bit_connect_event', [BitConnectController::class, 'handleAnyEvent'], 20, 2);
