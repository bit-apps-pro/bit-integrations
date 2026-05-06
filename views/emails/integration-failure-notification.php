<?php
/**
 * Email Template: Integration Failure Notification
 *
 * Variables available from parent scope:
 *
 * @var int    $flowId        Integration flow ID
 * @var string $actionName    Integration action name
 * @var string $triggerName   Integration trigger name
 * @var string $recordType    Record type
 * @var string $errorMessage  Error message from failed integration
 * @var string $siteName      Site name
 * @var string $adminUrl      URL to edit integration
 * @var string $logUrl        URL to view integration logs
 * @var string $timestamp     Current timestamp
 */
if (! defined('ABSPATH')) {
    exit;
}

$bit_integrations_title = esc_html__('Integration Failure Alert', 'bit-integrations');
$bit_integrations_greeting = sprintf(
    // translators: %s: Placeholder value
    esc_html__('Hello, an integration on your site %s has failed to execute.', 'bit-integrations'),
    '<strong>' . esc_html($siteName) . '</strong>'
);
$bit_integrations_details_title = esc_html__('Failure Details', 'bit-integrations');
$bit_integrations_flow_label = esc_html__('Integration ID', 'bit-integrations');
$bit_integrations_action_name_label = esc_html__('Action Name', 'bit-integrations');
$bit_integrations_trigger_name_label = esc_html__('Trigger Name', 'bit-integrations');
$bit_integrations_record_type_label = esc_html__('Record Type', 'bit-integrations');
$bit_integrations_time_label = esc_html__('Time', 'bit-integrations');
$bit_integrations_error_label = esc_html__('Error Message', 'bit-integrations');
$bit_integrations_resolve_text = esc_html__('To resolve this issue, review the integration settings and check the logs for more context.', 'bit-integrations');
$bit_integrations_view_integration = esc_html__('View Integration', 'bit-integrations');
$bit_integrations_view_logs = esc_html__('View Logs', 'bit-integrations');
$bit_integrations_footer_text = sprintf(
    // translators: %s: Placeholder value
    esc_html__('You received this email because failure notifications are enabled in %s. You can disable these notifications in the plugin settings.', 'bit-integrations'),
    '<strong>Bit Integrations</strong>'
);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html($bit_integrations_title); ?></title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f1f5f9; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px;">

                    <!-- Brand Bar -->
                    <tr>
                        <td style="padding-bottom: 0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 12px 0 6px;">
                                        <img src="<?php echo esc_url(plugins_url('assets/logo.svg', BTCBI_PLUGIN_MAIN_FILE)); ?>" width="162" height="22" alt="Bit Integrations" style="display: inline-block; border: 0; max-width: 162px; height: auto;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);">

                            <!-- Alert Header -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="background-color: #dc2626; padding: 28px 32px 24px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="vertical-align: middle;">
                                                    <!-- Alert icon using table layout (email-safe) -->
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="vertical-align: middle; padding-right: 14px;">
                                                                <div style="width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; line-height: 40px; font-size: 20px; color: #ffffff; font-weight: 700;">!</div>
                                                            </td>
                                                            <td style="vertical-align: middle;">
                                                                <p style="margin: 0 0 2px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.75); text-transform: uppercase; letter-spacing: 0.1em;"><?php esc_html_e('Action Required', 'bit-integrations'); ?></p>
                                                                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">
                                                                    <?php echo esc_html($bit_integrations_title); ?>
                                                                </h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td style="text-align: right; vertical-align: middle;">
                                                    <span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.04em; border: 1px solid rgba(255,255,255,0.35);">FAILED</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Body Content -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 28px 32px 0;">
                                        <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.65;">
                                            <?php echo wp_kses_post($bit_integrations_greeting); ?>
                                        </p>
                                    </td>
                                </tr>

                                <!-- Details Section -->
                                <tr>
                                    <td style="padding: 24px 32px 0;">
                                        <p style="margin: 0 0 12px; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">
                                            <?php echo esc_html($bit_integrations_details_title); ?>
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                            <tr style="background-color: #f9fafb;">
                                                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px; font-weight: 500; width: 40%; border-bottom: 1px solid #e5e7eb;">
                                                    <?php echo esc_html($bit_integrations_flow_label); ?>
                                                </td>
                                                <td style="padding: 12px 16px; color: #111827; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">
                                                    <span style="display: inline-block; background-color: #f3e8ff; color: #7902F8; padding: 2px 8px; border-radius: 4px; font-family: 'Courier New', monospace;">#<?php echo absint($flowId); ?></span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px; font-weight: 500; width: 40%; border-bottom: 1px solid #e5e7eb;">
                                                    <?php echo esc_html($bit_integrations_trigger_name_label); ?>
                                                </td>
                                                <td style="padding: 12px 16px; color: #111827; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">
                                                    <?php echo esc_html($triggerName); ?>
                                                </td>
                                            </tr>
                                            <tr style="background-color: #f9fafb;">
                                                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px; font-weight: 500; width: 40%; border-bottom: 1px solid #e5e7eb;">
                                                    <?php echo esc_html($bit_integrations_action_name_label); ?>
                                                </td>
                                                <td style="padding: 12px 16px; color: #111827; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">
                                                    <?php echo esc_html($actionName); ?>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px; font-weight: 500; width: 40%; border-bottom: 1px solid #e5e7eb;">
                                                    <?php echo esc_html($bit_integrations_record_type_label); ?>
                                                </td>
                                                <td style="padding: 12px 16px; color: #111827; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">
                                                    <?php echo esc_html($recordType); ?>
                                                </td>
                                            </tr>
                                            <tr style="background-color: #f9fafb;">
                                                <td style="padding: 12px 16px; color: #6b7280; font-size: 13px; font-weight: 500; width: 40%;">
                                                    <?php echo esc_html($bit_integrations_time_label); ?>
                                                </td>
                                                <td style="padding: 12px 16px; color: #111827; font-size: 13px; font-weight: 600;">
                                                    <?php echo esc_html($timestamp); ?>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Error Message -->
                                <tr>
                                    <td style="padding: 20px 32px 0;">
                                        <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">
                                            <?php echo esc_html($bit_integrations_error_label); ?>
                                        </p>
                                        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 6px; padding: 14px 16px;">
                                            <p style="margin: 0; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Courier New', monospace; font-size: 13px; color: #991b1b; line-height: 1.6; word-break: break-all;">
                                                <?php echo esc_html($errorMessage); ?>
                                            </p>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Divider -->
                                <tr>
                                    <td style="padding: 24px 32px 0;">
                                        <div style="height: 1px; background-color: #f3f4f6;"></div>
                                    </td>
                                </tr>

                                <!-- CTA Section -->
                                <tr>
                                    <td style="padding: 24px 32px 32px;">
                                        <p style="margin: 0 0 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                                            <?php echo esc_html($bit_integrations_resolve_text); ?>
                                        </p>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 10px;">
                                                    <a href="<?php echo esc_url($adminUrl); ?>" style="display: block; background: linear-gradient(135deg, #7902F8 0%, #391794 100%); color: #ffffff; padding: 13px 22px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 0.01em; text-align: center;">
                                                        <?php echo esc_html($bit_integrations_view_integration); ?>
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <a href="<?php echo esc_url($logUrl); ?>" style="display: block; background-color: #ffffff; color: #374151; padding: 12px 22px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 0.01em; border: 1px solid #d1d5db; text-align: center;">
                                                        <?php echo esc_html($bit_integrations_view_logs); ?>
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 8px 8px;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6; text-align: center;">
                                <?php echo wp_kses_post($bit_integrations_footer_text); ?>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
