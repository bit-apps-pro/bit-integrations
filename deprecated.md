# Deprecated Elements - Bit Integrations v2.7.8

> ⚠️ **Quick Reference**: All `btcbi_*` prefixed elements are deprecated. Use `bit_integrations_*` or the `Config` class instead.

---

## Quick Migration Cheatsheet

| Type | Old (❌ Deprecated) | New (✅ Use This) |
|------|---------------------|-------------------|
| **Version** | `BTCBI_VERSION` | `Config::VERSION` |
| **DB Version** | `$btcbi_db_version` | `Config::DB_VERSION` |
| **Plugin File** | `BTCBI_PLUGIN_MAIN_FILE` | `BIT_INTEGRATIONS_PLUGIN_FILE` |
| **Base Dir** | `BTCBI_PLUGIN_BASEDIR` | `Config::get('BASEDIR')` |
| **Base Name** | `BTCBI_PLUGIN_BASENAME` | `Config::get('BASENAME')` |
| **Root URI** | `BTCBI_ROOT_URI` | `Config::get('ROOT_URI')` |
| **Asset URI** | `BTCBI_ASSET_URI` | `Config::get('ASSET_URI')` |
| **Filter** | `btcbi_localized_script` | `bit_integrations_localized_script` |
| **Option** | `btcbi_app_conf` | `bit_integrations_app_conf` |
| **Option** | `btcbi_changelog_version` | `bit_integrations_changelog_version` |
| **Option** | `btcbi_installed` | `bit_integrations_installed` |
| **Option** | `btcbi_version` | `bit_integrations_version` |
| **Option** | `btcbi_selected_trigger` | `bit_integrations_selected_trigger` |
| **Option** | `btcbi_{$triggerName}_test` | `bit_integrations_{$triggerName}_test` |
| **Cache Group** | `'btcbi'` | `Config::VAR_PREFIX` (`'bit_integrations_'`) |
| **Cache Key** | `btcbi_pmpro_membership_levels` | `Config::withPrefix('pmpro_membership_levels')` |
| **Cache Key** | `btcbi_buddyboss_groups` | `Config::withPrefix('buddyboss_groups')` |
| **Field Prefix** | `btcbi_cf_` | `Config::withPrefix('cf_')` (Freshdesk) |
| **Table** | `btcbi_log` | Use Model classes |
| **Table** | `btcbi_flow` | Use Model classes |
| **Table** | `btcbi_auth` | Use Model classes |

---

## 📦 Deprecated Constants

### PHP Constants

```php
// ❌ DEPRECATED - bitwpfi.php
define('BTCBI_VERSION', '2.7.8');
define('BTCBI_PLUGIN_MAIN_FILE', __FILE__);

// ❌ DEPRECATED - backend/loader.php
define('BTCBI_PLUGIN_BASENAME', plugin_basename(BIT_INTEGRATIONS_PLUGIN_FILE));
define('BTCBI_PLUGIN_BASEDIR', plugin_dir_path(BIT_INTEGRATIONS_PLUGIN_FILE));
define('BTCBI_ROOT_URI', set_url_scheme(plugins_url('', BIT_INTEGRATIONS_PLUGIN_FILE)));
define('BTCBI_PLUGIN_DIR_PATH', plugin_dir_path(BIT_INTEGRATIONS_PLUGIN_FILE));
define('BTCBI_ASSET_URI', BTCBI_ROOT_URI . '/assets');

// ✅ USE THIS INSTEAD
use BitApps\Integrations\Config;

Config::VERSION           // '2.7.8'
Config::DB_VERSION        // '1.1'
BIT_INTEGRATIONS_PLUGIN_FILE
Config::get('BASENAME')
Config::get('BASEDIR')
Config::get('ROOT_URI')
Config::get('ASSET_URI')
```

### Global Variable

```php
// ❌ DEPRECATED - bitwpfi.php
global $btcbi_db_version;

// ✅ USE THIS INSTEAD
use BitApps\Integrations\Config;
Config::DB_VERSION
```

### Pro Version Constant

```php
// ❌ DEPRECATED
defined('BTCBI_PRO_VERSION')

// ✅ USE THIS INSTEAD
// Check for pro version via Config or other means
```

**Source Files:** 
- `bitwpfi.php` (lines 25-40)
- `backend/loader.php` (lines 7-16)
- `backend/Config.php` (line 197)
- `views/view-root.php` (lines 6, 16)
- `backend/Core/Util/Activation.php` (line 52)

---

## 🛠 Deprecated Functions

```php
// ❌ DEPRECATED - bitwpfi.php
btcbi_activate_plugin($network_wide);
btcbi_deactivate_plugin($network_wide);
btcbi_uninstall_plugin();

// ✅ USE THIS INSTEAD
bit_integrations_activate_plugin($network_wide);
bit_integrations_deactivate_plugin($network_wide);
bit_integrations_uninstall_plugin();
```

**Source File:** `bitwpfi.php` (lines 52-115)

---

## 🪝 Deprecated Hooks

### Filters

```php
// ❌ DEPRECATED FILTERS
'btcbi_localized_script'                          // Use: 'bit_integrations_localized_script'
'btcbi_high_level_v2_create_contact'              // Use: 'bit_integrations_high_level_v2_create_contact'
'btcbi_high_level_v2_update_contact'              // Use: 'bit_integrations_high_level_v2_update_contact'
'btcbi_high_level_v2_create_task'                 // Use: 'bit_integrations_high_level_v2_create_task'
'btcbi_high_level_v2_update_task'                 // Use: 'bit_integrations_high_level_v2_update_task'
'btcbi_high_level_v2_create_opportunity'          // Use: 'bit_integrations_high_level_v2_create_opportunity'
'btcbi_high_level_v2_update_opportunity'          // Use: 'bit_integrations_high_level_v2_update_opportunity'
'btcbi_high_level_contact_utilities'              // Use: 'bit_integrations_high_level_contact_utilities'
'btcbi_high_level_opportunity_utilities'          // Use: 'bit_integrations_high_level_opportunity_utilities'
'btcbi_smartSuite_create_table'                   // Use: 'bit_integrations_smartsuite_create_table'
'btcbi_smartSuite_create_record'                  // Use: 'bit_integrations_smartsuite_create_record'
'btcbi_moosend_map_custom_fields'                 // Use: 'bit_integrations_moosend_map_custom_fields'
'btcbi_jet_engine_create_post_type_actions'       // Use: 'bit_integrations_jet_engine_create_post_type_actions'
'btcbi_jet_engine_create_content_type_actions'    // Use: 'bit_integrations_jet_engine_create_content_type_actions'
'btcbi_jet_engine_create_taxonomy_actions'        // Use: 'bit_integrations_jet_engine_create_taxonomy_actions'
'btcbi_jet_engine_create_relation_actions'        // Use: 'bit_integrations_jet_engine_create_relation_actions'
'btcbi_trello_get_all_custom_fields'              // Use: 'bit_integrations_trello_get_all_custom_fields'
'btcbi_freshsales_upsert_record'                  // Use: 'bit_integrations_freshsales_upsert_record'
'btcbi_dokan_vendor_crud_actions'                 // Use: 'bit_integrations_dokan_vendor_crud_actions'
'btcbi_lmfwc_update_licence'                      // Use: 'bit_integrations_lmfwc_update_licence'
'btcbi_lmfwc_update_generator'                    // Use: 'bit_integrations_lmfwc_update_generator'
'btcbi_lmfwc_create_generator'                    // Use: 'bit_integrations_lmfwc_create_generator'
'btcbi_lmfwc_activate_licence'                    // Use: 'bit_integrations_lmfwc_activate_licence'
'btcbi_lmfwc_deactivate_licence'                  // Use: 'bit_integrations_lmfwc_deactivate_licence'
'btcbi_lmfwc_reactivate_licence'                  // Use: 'bit_integrations_lmfwc_reactivate_licence'
'btcbi_lmfwc_delete_licence'                      // Use: 'bit_integrations_lmfwc_delete_licence'
'btcbi_salesforce_get_lead_utilities'             // Use: 'bit_integrations_salesforce_get_lead_utilities'
'btcbi_salesforce_update_record'                  // Use: 'bit_integrations_salesforce_update_record'
'btcbi_salesforce_add_lead_utilities'             // Use: 'bit_integrations_salesforce_add_lead_utilities'
'btcbi_klaviyo_custom_properties'                 // Use: 'bit_integrations_klaviyo_custom_properties'
'btcbi_klaviyo_update_profile'                    // Use: 'bit_integrations_klaviyo_update_profile'
'btcbi_zbigin_get_tags'                           // Use: 'bit_integrations_zbigin_get_tags'
'btcbi_zbigin_add_tags_to_records'                // Use: 'bit_integrations_zbigin_add_tags_to_records'
'btcbi_whatsapp_send_text_messages'               // Use: 'bit_integrations_whatsapp_send_text_messages'
'btcbi_whatsapp_send_media_messages'              // Use: 'bit_integrations_whatsapp_send_media_messages'
'btcbi_whatsapp_send_contact_messages'            // Use: 'bit_integrations_whatsapp_send_contact_messages'
'btcbi_mailerpress_delete_contact'                // Use: 'bit_integrations_mailerpress_delete_contact'
'btcbi_mailerpress_add_tags'                      // Use: 'bit_integrations_mailerpress_add_tags'
'btcbi_mailerpress_remove_tags'                   // Use: 'bit_integrations_mailerpress_remove_tags'
'btcbi_mailerpress_add_to_lists'                  // Use: 'bit_integrations_mailerpress_add_to_lists'
'btcbi_mailerpress_remove_from_lists'             // Use: 'bit_integrations_mailerpress_remove_from_lists'
'btcbi_mailerlite_delete_subscriber'              // Use: 'bit_integrations_mailerlite_delete_subscriber'
'btcbi_omnisend_custom_properties'                // Use: 'bit_integrations_omnisend_custom_properties'
'btcbi_getresponse_autoresponder_day'             // Use: 'bit_integrations_getresponse_autoresponder_day'
'btcbi_hubspot_update_entity'                     // Use: 'bit_integrations_hubspot_update_entity'
'btcbi_fabman_update_member'                      // Use: 'bit_integrations_fabman_update_member'
'btcbi_fluent_crm_assign_company'                 // Use: 'bit_integrations_fluent_crm_assign_company'
'btcbi_line_reply_message'                        // Use: 'bit_integrations_line_reply_message'
'btcbi_line_broadcast_message'                    // Use: 'bit_integrations_line_broadcast_message'
'btcbi_sendPulse_refresh_fields'                  // Use: 'bit_integrations_sendPulse_refresh_fields'
'btcbi_seopress_update_post_meta'                 // Use: 'bit_integrations_seopress_update_post_meta'
'btcbi_mailpoet_update_subscriber'                // Use: 'bit_integrations_mailpoet_update_subscriber'
'btcbi_mailchimp_add_remove_tag'                  // Use: 'bit_integrations_mailchimp_add_remove_tag'
'btcbi_mailchimp_map_language'                    // Use: 'bit_integrations_mailchimp_map_language'
'btcbi_bento_store_event'                         // Use: 'bit_integrations_bento_store_event'
'btcbi_bento_get_user_fields'                     // Use: 'bit_integrations_bento_get_user_fields'
'btcbi_bento_get_event_fields'                    // Use: 'bit_integrations_bento_get_event_fields'
'btcbi_bento_get_all_tags'                        // Use: 'bit_integrations_bento_get_all_tags'
'btcbi_acpt_update_cpt'                           // Use: 'bit_integrations_acpt_update_cpt'
'btcbi_wpcafe_create_reservation'                 // Use: 'bit_integrations_wpcafe_create_reservation'
'btcbi_wpcafe_update_reservation'                 // Use: 'bit_integrations_wpcafe_update_reservation'
'btcbi_wpcafe_delete_reservation'                 // Use: 'bit_integrations_wpcafe_delete_reservation'
'btcbi_wishlist_update_level'                     // Use: 'bit_integrations_wishlist_update_level'
'btcbi_wishlist_delete_level'                     // Use: 'bit_integrations_wishlist_delete_level'
'btcbi_wishlist_create_member'                    // Use: 'bit_integrations_wishlist_create_member'
'btcbi_wishlist_update_member'                    // Use: 'bit_integrations_wishlist_update_member'
'btcbi_wishlist_delete_member'                    // Use: 'bit_integrations_wishlist_delete_member'
'btcbi_wishlist_add_member_to_level'              // Use: 'bit_integrations_wishlist_add_member_to_level'
'btcbi_wishlist_remove_member_from_level'         // Use: 'bit_integrations_wishlist_remove_member_from_level'
'btcbi_teams_for_wc_memberships_add_member'       // Use: 'bit_integrations_teams_for_wc_memberships_add_member'
'btcbi_teams_for_wc_memberships_remove_member'    // Use: 'bit_integrations_teams_for_wc_memberships_remove_member'
'btcbi_teams_for_wc_memberships_invite_user'      // Use: 'bit_integrations_teams_for_wc_memberships_invite_user'
'btcbi_teams_for_wc_memberships_update_role'      // Use: 'bit_integrations_teams_for_wc_memberships_update_role'
'btcbi_fluentcart_create_order'                   // Use: 'bit_integrations_fluentcart_create_order'
'btcbi_fluentcart_delete_order'                   // Use: 'bit_integrations_fluentcart_delete_order'
'btcbi_fluentcart_update_order_status'            // Use: 'bit_integrations_fluentcart_update_order_status'
'btcbi_fluentcart_update_payment_status'          // Use: 'bit_integrations_fluentcart_update_payment_status'
'btcbi_fluentcart_update_shipping_status'         // Use: 'bit_integrations_fluentcart_update_shipping_status'
'btcbi_fluentcart_create_customer'                // Use: 'bit_integrations_fluentcart_create_customer'
'btcbi_fluentcart_update_customer'                // Use: 'bit_integrations_fluentcart_update_customer'
'btcbi_fluentcart_delete_customer'                // Use: 'bit_integrations_fluentcart_delete_customer'
'btcbi_fluentcart_create_product'                 // Use: 'bit_integrations_fluentcart_create_product'
'btcbi_fluentcart_delete_product'                 // Use: 'bit_integrations_fluentcart_delete_product'
'btcbi_fluentcart_create_coupon'                  // Use: 'bit_integrations_fluentcart_create_coupon'
'btcbi_fluentcart_delete_coupon'                  // Use: 'bit_integrations_fluentcart_delete_coupon'
'btcbi_cf7_get_advance_custom_html_fields'        // Use: 'bit_integrations_cf7_get_advance_custom_html_fields'
'btcbi_woocommerce_flexible_checkout_fields'      // Use: 'bit_integrations_woocommerce_flexible_checkout_fields'
'btcbi_woocommerce_flexible_checkout_fields_value' // Use: 'bit_integrations_woocommerce_flexible_checkout_fields_value'

// ✅ USE THIS INSTEAD
// Replace all 'btcbi_' prefix with 'bit_integrations_'
```

### Actions

```php
// ❌ DEPRECATED ACTIONS
'btcbi_pipedrive_store_related_list'              // Use: 'bit_integrations_pipedrive_store_related_list'
'btcbi_trello_store_custom_fields'                // Use: 'bit_integrations_trello_store_custom_fields'
'btcbi_fluent_support_upload_ticket_attachments'  // Use: 'bit_integrations_fluent_support_upload_ticket_attachments'
'btcbi_add_post_tag'                              // Use: 'bit_integrations_add_post_tag'
'btcbi_bento_update_user_data'                    // Use: 'bit_integrations_bento_update_user_data'
'btcbi_mailchimp_store_gdpr_permission'           // Use: 'bit_integrations_mailchimp_store_gdpr_permission'
'btcbi_deactivation'                              // Use: 'bit_integrations_deactivation'

// ✅ USE THIS INSTEAD
// Replace all 'btcbi_' prefix with 'bit_integrations_'
```

### WC Subscription Hooks (Deprecated - Use WC Subscriptions Trigger)

```php
// ❌ DEPRECATED - backend/Triggers/WC/Hooks.php
woocommerce_subscription_payment_complete
woocommerce_subscription_status_cancelled
woocommerce_subscription_status_expired
woocommerce_subscription_status_updated
woocommerce_scheduled_subscription_trial_end

// ✅ USE: WC Subscriptions trigger instead
```

### WC Booking Hooks (Deprecated - Use WC Bookings Trigger)

```php
// ❌ DEPRECATED - backend/Triggers/WC/Hooks.php
woocommerce_new_booking

// ✅ USE: WC Bookings trigger instead
```

**Source Files:** 
- `backend/Config.php` (line 205)
- `backend/Core/Util/Helper.php` (line 212)
- `backend/Triggers/WC/Hooks.php` (lines 28-36)
- Multiple action integration files

---

## 💾 Deprecated Options

```php
// ❌ DEPRECATED OPTIONS
'btcbi_app_conf'              → 'bit_integrations_app_conf'
'btcbi_changelog_version'     → 'bit_integrations_changelog_version'
'btcbi_installed'             → 'bit_integrations_installed'
'btcbi_version'               → 'bit_integrations_version'
'btcbi_selected_trigger'      → 'bit_integrations_selected_trigger'
'btcbi_db_version'            → 'bit_integrations_db_version'
"btcbi_{$triggerName}_test"   → Config::withPrefix("{$triggerName}_test")

// ✅ USE THIS INSTEAD
use BitApps\Integrations\Config;

Config::getOption('app_conf');
Config::getOption('changelog_version');
Config::getOption('installed');
Config::getOption('version');
Config::getOption('selected_trigger');
Config::withPrefix("{$triggerName}_test");  // For test data options

// Or via WP functions
get_option('bit_integrations_app_conf');
get_option('bit_integrations_changelog_version');
```

**Source Files:** 
- `backend/Config.php` (line 214)
- `backend/Admin/AdminAjax.php` (line 32)
- `backend/Core/Hooks/HookService.php` (line 84)
- `backend/Core/Util/UnInstallation.php` (lines 29, 38-42)
- `backend/Core/Util/Activation.php` (lines 64, 67, 107-109)
- `backend/Triggers/TriggerController.php` (lines 64, 67, 82, 84)
- `backend/Triggers/BitSocial/BitSocialController.php` (line 122)

---

## 🗃️ Deprecated Cache Keys

### Object Cache Keys

```php
// ❌ DEPRECATED CACHE KEYS (group: 'btcbi')
'btcbi_pmpro_membership_levels'            → Config::withPrefix('pmpro_membership_levels')
'btcbi_pmpro_membership_level_' . $id      → Config::withPrefix('pmpro_membership_level_') . $id
'btcbi_mailmint_custom_fields'             → Config::withPrefix('mailmint_custom_fields')
'btcbi_lifterlms_courses'                  → Config::withPrefix('lifterlms_courses')
'btcbi_lifterlms_memberships'              → Config::withPrefix('lifterlms_memberships')
'btcbi_gamipress_rank_types'               → Config::withPrefix('gamipress_rank_types')
'btcbi_gamipress_ranks_' . $hash           → Config::withPrefix('gamipress_ranks_') . $hash
'btcbi_gamipress_achievement_types'        → Config::withPrefix('gamipress_achievement_types')
'btcbi_gamipress_achievements_' . $hash    → Config::withPrefix('gamipress_achievements_') . $hash
'btcbi_gamipress_point_types'              → Config::withPrefix('gamipress_point_types')
'btcbi_buddyboss_groups_all_statuses'      → Config::withPrefix('buddyboss_groups_all_statuses')
'btcbi_buddyboss_group_' . $id             → Config::withPrefix('buddyboss_group_') . $id
'btcbi_buddyboss_groups'                   → Config::withPrefix('buddyboss_groups')
'btcbi_wp_users_basic'                     → Config::withPrefix('wp_users_basic')
'btcbi_affiliate_wp_all_affiliates'        → Config::withPrefix('affiliate_wp_all_affiliates')
'btcbi_buddyboss_profile_fields'           → Config::withPrefix('buddyboss_profile_fields')
'btcbi_multisite_site_ids_' . $siteid      → Config::withPrefix('multisite_site_ids_') . $siteid

// ❌ DEPRECATED CACHE GROUP
'btcbi'                                    → Config::VAR_PREFIX  // 'bit_integrations_'

// ✅ USE THIS INSTEAD
use BitApps\Integrations\Config;

$cache_key = Config::withPrefix('pmpro_membership_levels');
$cache_group = Config::VAR_PREFIX;

wp_cache_get($cache_key, $cache_group);
wp_cache_set($cache_key, $data, $cache_group, 10 * MINUTE_IN_SECONDS);
```

**Source Files:**
- `backend/Actions/PaidMembershipPro/RecordApiHelper.php`
- `backend/Actions/PaidMembershipPro/PaidMembershipProController.php`
- `backend/Actions/MailMint/MailMintController.php`
- `backend/Actions/LifterLms/LifterLmsController.php`
- `backend/Actions/GamiPress/GamiPressController.php`
- `backend/Actions/BuddyBoss/RecordApiHelper.php`
- `backend/Actions/BuddyBoss/BuddyBossController.php`
- `backend/Actions/Affiliate/AffiliateController.php`
- `backend/Triggers/FallbackTrigger/TriggerFallback.php`
- `backend/Core/Util/Multisite.php`

---

## 🗄️ Deprecated Database Tables

```php
// ❌ DEPRECATED TABLE NAMES (Use Model classes instead)
$wpdb->prefix . 'btcbi_log'    → Use LogModel class
$wpdb->prefix . 'btcbi_flow'   → Use FlowModel class
$wpdb->prefix . 'btcbi_auth'   → Use AuthModel class

// ✅ USE THIS INSTEAD
use BitApps\Integrations\Core\Database\LogModel;
use BitApps\Integrations\Core\Database\FlowModel;
use BitApps\Integrations\Core\Database\AuthModel;

LogModel::all();
FlowModel::find($id);
AuthModel::create($data);
```

**Source Files:** 
- `backend/Core/Database/DB.php` (lines 39-98)
- `backend/Core/Database/LogModel.php` (line 14)
- `backend/Core/Database/FlowModel.php` (line 14)
- `backend/Core/Database/AuthModel.php` (line 14)
- `backend/Core/Util/UnInstallation.php` (lines 53-54)

---

## 🎯 Deprecated Trigger Events (WooCommerce)

### WC Subscriptions Constants (Moved to WC Subscriptions Trigger)

```php
// ❌ DEPRECATED - backend/Triggers/WC/WCController.php
WCController::USER_SUBSCRIBE_PRODUCT             // 12
WCController::USER_CANCELLED_SUBSCRIPTION_PRODUCT // 13
WCController::PRODUCT_SUBSCRIPTION_EXPIRED       // 14
WCController::SUBSCRIPTION_PRODUCT_STATUS_CHANGED // 15
WCController::END_SUBSCRIPTION_TRIAL_PERIOD      // 16

// ✅ USE: WC Subscriptions trigger instead
```

### WC Bookings Constants (Moved to WC Bookings Trigger)

```php
// ❌ DEPRECATED - backend/Triggers/WC/WCController.php
WCController::BOOKING_CREATED                    // 18

// ✅ USE: WC Bookings trigger instead
```

**Source File:** `backend/Triggers/WC/WCController.php` (lines 71-84, 120-128)

---

## 🔧 Code Migration Examples

### Example 1: Plugin URL in Scripts

```php
// ❌ BEFORE
wp_enqueue_script(
    'my-script',
    BTCBI_ASSET_URI . '/js/app.js',
    [],
    BTCBI_VERSION
);

// ✅ AFTER
use BitApps\Integrations\Config;

wp_enqueue_script(
    'my-script',
    Config::get('ASSET_URI') . '/js/app.js',
    [],
    Config::VERSION
);
```

### Example 2: Plugin Path

```php
// ❌ BEFORE
require_once BTCBI_PLUGIN_BASEDIR . 'includes/helper.php';

// ✅ AFTER
use BitApps\Integrations\Config;

require_once Config::get('BASEDIR') . 'includes/helper.php';
```

### Example 3: Custom Filter

```php
// ❌ BEFORE
add_filter('btcbi_localized_script', function($config) {
    $config['api_url'] = rest_url('my-api/v1');
    return $config;
});

// ✅ AFTER
add_filter('bit_integrations_localized_script', function($config) {
    $config['api_url'] = rest_url('my-api/v1');
    return $config;
});
```

### Example 4: Store/Retrieve Options

```php
// ❌ BEFORE
update_option('btcbi_app_conf', ['key' => 'value']);
$conf = get_option('btcbi_app_conf', []);

// ✅ AFTER
use BitApps\Integrations\Config;

Config::updateOption('app_conf', ['key' => 'value']);
$conf = Config::getOption('app_conf', []);
```

### Example 5: Database Queries

```php
// ❌ BEFORE
global $wpdb;
$results = $wpdb->get_results(
    "SELECT * FROM {$wpdb->prefix}btcbi_log WHERE flow_id = $id"
);

// ✅ AFTER
use BitApps\Integrations\Core\Database\LogModel;

$results = LogModel::where('flow_id', $id)->get();
```

### Example 6: Integration-Specific Filters

```php
// ❌ BEFORE
apply_filters('btcbi_high_level_v2_create_contact', $data, $params);
apply_filters('btcbi_salesforce_update_record', $response, $endpoint);

// ✅ AFTER
apply_filters('bit_integrations_high_level_v2_create_contact', $data, $params);
apply_filters('bit_integrations_salesforce_update_record', $response, $endpoint);
```

### Example 7: Object Cache Keys

```php
// ❌ BEFORE
$cache_key = 'btcbi_buddyboss_groups';
$cache_group = 'btcbi';
$groups = wp_cache_get($cache_key, $cache_group);
wp_cache_set($cache_key, $groups, $cache_group, 10 * MINUTE_IN_SECONDS);

// ✅ AFTER
use BitApps\Integrations\Config;

$cache_key = Config::withPrefix('buddyboss_groups');
$cache_group = Config::VAR_PREFIX;
$groups = wp_cache_get($cache_key, $cache_group);
wp_cache_set($cache_key, $groups, $cache_group, 10 * MINUTE_IN_SECONDS);
```

### Example 8: Test Data Options

```php
// ❌ BEFORE
$testData = get_option("btcbi_{$triggerName}_test");
update_option("btcbi_{$triggerName}_test", []);
delete_option("btcbi_{$triggerName}_test");

// ✅ AFTER
use BitApps\Integrations\Config;

$testData = get_option(Config::withPrefix("{$triggerName}_test"));
update_option(Config::withPrefix("{$triggerName}_test"), []);
delete_option(Config::withPrefix("{$triggerName}_test"));
```

---

## 🚀 Database Migration Script

Run once to migrate existing options:

```php
function bit_integrations_migrate_deprecated_options() {
    $option_migrations = [
        'btcbi_app_conf'              => 'bit_integrations_app_conf',
        'btcbi_changelog_version'     => 'bit_integrations_changelog_version',
        'btcbi_installed'             => 'bit_integrations_installed',
        'btcbi_version'               => 'bit_integrations_version',
        'btcbi_selected_trigger'      => 'bit_integrations_selected_trigger',
        'btcbi_db_version'            => 'bit_integrations_db_version',
    ];

    foreach ($option_migrations as $old => $new) {
        $value = get_option($old, false);
        if ($value !== false) {
            update_option($new, $value);
            delete_option($old);
        }
    }
}

// Migrate scheduled hooks
function bit_integrations_migrate_scheduled_hooks() {
    $timestamp = wp_next_scheduled('btcbi_delete_integ_log');
    if ($timestamp) {
        wp_unschedule_event($timestamp, 'btcbi_delete_integ_log');
        wp_schedule_event(time(), 'daily', 'bit_integrations_delete_integ_log');
    }
}
```

---

## 📋 Find & Replace

### Search patterns in your codebase:

```bash
# Find deprecated constants
grep -r "BTCBI_" . --include="*.php"
grep -r "btcbi_" . --include="*.php"

# Find deprecated hooks
grep -r "btcbi_" . --include="*.php" | grep -E "(apply_filters|do_action)"

# Find deprecated options
grep -r "btcbi_" . --include="*.php" | grep -E "(get_option|update_option|delete_option)"
```

### IDE Find/Replace (All Files):

| Find | Replace |
|------|---------|
| `BTCBI_VERSION` | `Config::VERSION` |
| `BTCBI_ASSET_URI` | `Config::get('ASSET_URI')` |
| `BTCBI_PLUGIN_BASEDIR` | `Config::get('BASEDIR')` |
| `BTCBI_ROOT_URI` | `Config::get('ROOT_URI')` |
| `BTCBI_PLUGIN_BASENAME` | `Config::get('BASENAME')` |
| `btcbi_localized_script` | `bit_integrations_localized_script` |
| `btcbi_app_conf` | `bit_integrations_app_conf` |
| `btcbi_changelog_version` | `bit_integrations_changelog_version` |
| `btcbi_activate_plugin` | `bit_integrations_activate_plugin` |
| `btcbi_deactivate_plugin` | `bit_integrations_deactivate_plugin` |
| `btcbi_uninstall_plugin` | `bit_integrations_uninstall_plugin` |
| `btcbi_installed` | `bit_integrations_installed` |
| `btcbi_version` | `bit_integrations_version` |
| `btcbi_selected_trigger` | `bit_integrations_selected_trigger` |
| `btcbi_db_version` | `bit_integrations_db_version` |
| `btcbi_delete_integ_log` | `bit_integrations_delete_integ_log` |

### Integration Filters (Bulk Replace):

```bash
# All btcbi_ filters/actions should become bit_integrations_
s/btcbi_/bit_integrations_/g
```

---

## 📂 Files with Deprecated Code

| File | Deprecated Elements Count |
|------|---------------------------|
| `bitwpfi.php` | 6 (constants, functions, variable) |
| `backend/loader.php` | 5 (constants) |
| `backend/Config.php` | 2 (filters, options) |
| `backend/Core/Util/Helper.php` | 1 (filter) |
| `backend/Core/Util/Activation.php` | 4 (options, hooks) |
| `backend/Core/Util/Deactivation.php` | 2 (hooks) |
| `backend/Core/Util/UnInstallation.php` | 7 (options, tables) |
| `backend/Core/Util/Multisite.php` | 1 (cache key) |
| `backend/Core/Database/DB.php` | 10 (tables, options) |
| `backend/Core/Hooks/HookService.php` | 1 (option) |
| `backend/Admin/AdminAjax.php` | 1 (option) |
| `backend/Triggers/WC/WCController.php` | 6 (constants) |
| `backend/Triggers/WC/Hooks.php` | 6 (WP hooks) |
| `backend/Triggers/TriggerController.php` | 3 (options) |
| `backend/Triggers/BitSocial/BitSocialController.php` | 1 (option) |
| `backend/Triggers/FallbackTrigger/TriggerFallback.php` | 1 (cache key) |
| `views/view-root.php` | 1 (constant) |
| Cache key files (10 files) | 17 (cache keys) + 1 (cache group) |
| Integration action files (40+ files) | 110+ (filters/actions) |

---

## 🧱 Renamed Action Classes (v2.11.0)

Action integrations under `backend/Actions/<Name>/` move from `Controller` + `RecordApiHelper`
to three classes. Folder names, route names, hook names and their arguments, and every stored
flow value stay the same, so saved flows and bound filters keep working.

| Old class | New class | Holds |
|-----------|-----------|-------|
| `Actions\<Name>\<Name>Controller` | `Actions\<Name>\<Name>Action` | `$authConfig`, the constructor, `execute()` (what Flow dispatches) |
| `Actions\<Name>\<Name>Controller` | `Actions\<Name>\<Name>Helper` | route handlers, plugin checks, token refresh |
| `Actions\<Name>\RecordApiHelper` | `Actions\<Name>\<Name>Service` | field mapping, API calls, hook fire points, log rows |
| `Actions\<Name>\<Role>ApiHelper` | `Actions\<Name>\<Name><Role>Service` | e.g. `ZohoCRMFilesService`, `ZohoCRMTagService` |

- Dispatch goes through `Core\Integration\ActionResolver`, which tries `<Name>Action` first and
  still falls back to `<Name>Controller`, so an add-on that ships its own `<Name>Controller`
  keeps working.
- Kept permanently for Bit Integrations Pro 2.6.11–2.8.5, which resolve them by name:
  `Actions\Salesforce\SalesforceController` (now an empty subclass of `SalesforceHelper`) and
  `Actions\Moosend\MoosendHelper::formatPhoneNumber()`.
- Code that calls a free action class directly should resolve the new name first, e.g.
  `bit_integrations_get_class('Actions\\<Name>\\<Name>Helper')`, then fall back to the old one.

---

## ⚠️ Backward Compatibility

| Status | Details |
|--------|---------|
| **Current** | ✅ Still functional in v2.7.8 |
| **Support** | ⚠️ Limited support for deprecated elements |
| **Removal** | 🔴 Expected in v3.0.0 |
| **Recommendation** | Migrate ASAP |

---

## 📚 References

### Core Files
- **Config Class:** `backend/Config.php`
- **Main File:** `bitwpfi.php`
- **Loader:** `backend/loader.php`
- **Models:** `backend/Core/Database/*.php`

### Trigger Files
- **WC Controller:** `backend/Triggers/WC/WCController.php`
- **WC Hooks:** `backend/Triggers/WC/Hooks.php`

### Utility Files
- **Activation:** `backend/Core/Util/Activation.php`
- **Deactivation:** `backend/Core/Util/Deactivation.php`
- **UnInstallation:** `backend/Core/Util/UnInstallation.php`
- **Helper:** `backend/Core/Util/Helper.php`

### Admin Files
- **AdminAjax:** `backend/Admin/AdminAjax.php`
- **HookService:** `backend/Core/Hooks/HookService.php`

---

## 📝 Complete Deprecated Elements List

### Constants (8)
1. `BTCBI_VERSION`
2. `BTCBI_PLUGIN_MAIN_FILE`
3. `BTCBI_PLUGIN_BASENAME`
4. `BTCBI_PLUGIN_BASEDIR`
5. `BTCBI_ROOT_URI`
6. `BTCBI_PLUGIN_DIR_PATH`
7. `BTCBI_ASSET_URI`
8. `$btcbi_db_version` (global)

### Functions (3)
1. `btcbi_activate_plugin()`
2. `btcbi_deactivate_plugin()`
3. `btcbi_uninstall_plugin()`

### Options (7)
1. `btcbi_app_conf`
2. `btcbi_changelog_version`
3. `btcbi_installed`
4. `btcbi_version`
5. `btcbi_selected_trigger`
6. `btcbi_db_version`
7. `btcbi_{$triggerName}_test`

### Cache Keys (17) & Cache Group (1)
1. `btcbi_pmpro_membership_levels`
2. `btcbi_pmpro_membership_level_{id}` (dynamic)
3. `btcbi_mailmint_custom_fields`
4. `btcbi_lifterlms_courses`
5. `btcbi_lifterlms_memberships`
6. `btcbi_gamipress_rank_types`
7. `btcbi_gamipress_ranks_{md5}` (dynamic)
8. `btcbi_gamipress_achievement_types`
9. `btcbi_gamipress_achievements_{md5}` (dynamic)
10. `btcbi_gamipress_point_types`
11. `btcbi_buddyboss_groups_all_statuses`
12. `btcbi_buddyboss_group_{id}` (dynamic)
13. `btcbi_buddyboss_groups`
14. `btcbi_wp_users_basic`
15. `btcbi_affiliate_wp_all_affiliates`
16. `btcbi_buddyboss_profile_fields`
17. `btcbi_multisite_site_ids_{siteid}` (dynamic)
- Cache group: `'btcbi'`

### Database Tables (3)
1. `btcbi_log`
2. `btcbi_flow`
3. `btcbi_auth`

### WC Trigger Constants (6)
1. `USER_SUBSCRIBE_PRODUCT`
2. `USER_CANCELLED_SUBSCRIPTION_PRODUCT`
3. `PRODUCT_SUBSCRIPTION_EXPIRED`
4. `SUBSCRIPTION_PRODUCT_STATUS_CHANGED`
5. `END_SUBSCRIPTION_TRIAL_PERIOD`
6. `BOOKING_CREATED`

### WordPress Hooks (6)
1. `woocommerce_subscription_payment_complete`
2. `woocommerce_subscription_status_cancelled`
3. `woocommerce_subscription_status_expired`
4. `woocommerce_subscription_status_updated`
5. `woocommerce_scheduled_subscription_trial_end`
6. `woocommerce_new_booking`

### Plugin Filters/Actions (110+)
All `btcbi_*` prefixed hooks including:
- `btcbi_localized_script`
- `btcbi_high_level_*` (8 hooks)
- `btcbi_jet_engine_*` (8 hooks)
- `btcbi_lmfwc_*` (7 hooks)
- `btcbi_salesforce_*` (4 hooks)
- `btcbi_fluentcart_*` (12 hooks)
- `btcbi_wishlist_*` (7 hooks)
- `btcbi_mailerpress_*` (5 hooks)
- `btcbi_whatsapp_*` (3 hooks)
- `btcbi_teams_for_wc_memberships_*` (4 hooks)
- `btcbi_bento_*` (5 hooks)
- `btcbi_mailchimp_*` (3 hooks)
- `btcbi_wpcafe_*` (3 hooks)
- `btcbi_smartSuite_*` (2 hooks)
- `btcbi_klaviyo_*` (2 hooks)
- `btcbi_zbigin_*` (2 hooks)
- `btcbi_line_*` (2 hooks)
- `btcbi_woocommerce_*` (2 hooks)
- `btcbi_cf7_*` (1 hook)
- And more single-hook integrations...

---

**Version:** 2.7.8 | **Updated:** 2026-02-18 | **Total Deprecated Elements:** 150+
