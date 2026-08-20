<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;
use RuntimeException;

class Hash
{
    /**
     * Legacy cipher — retained for READING pre-existing stored values only.
     * New writes use the authenticated GCM envelope below.
     */
    public const CIPHER = 'aes-256-cbc';

    public const CIPHER_GCM = 'aes-256-gcm';

    private const V2_PREFIX = 'v2:';

    private const GCM_IV_LENGTH = 12;

    private const GCM_TAG_LENGTH = 16;

    private static $cachedKey;

    public static function encrypt($data)
    {
        if ($data === null || $data === '') {
            return $data;
        }

        $key = self::gcmKey();
        $iv = random_bytes(self::GCM_IV_LENGTH);
        $tag = '';
        $cipherRaw = openssl_encrypt(
            (string) $data,
            self::CIPHER_GCM,
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            self::GCM_TAG_LENGTH
        );

        if ($cipherRaw === false) {
            throw new RuntimeException('Unable to encrypt value: ' . esc_html((string) openssl_error_string()));
        }

        return self::V2_PREFIX . rawurlencode(base64_encode($iv . $tag . $cipherRaw));
    }

    public static function decrypt($encryptedData)
    {
        if ($encryptedData === null || $encryptedData === '') {
            return $encryptedData;
        }

        $encryptedData = (string) $encryptedData;

        if (strncmp($encryptedData, self::V2_PREFIX, \strlen(self::V2_PREFIX)) === 0) {
            $envelope = base64_decode(urldecode(substr($encryptedData, \strlen(self::V2_PREFIX))), true);

            if ($envelope === false || \strlen($envelope) <= self::GCM_IV_LENGTH + self::GCM_TAG_LENGTH) {
                return;
            }

            $iv = substr($envelope, 0, self::GCM_IV_LENGTH);
            $tag = substr($envelope, self::GCM_IV_LENGTH, self::GCM_TAG_LENGTH);
            $cipherRaw = substr($envelope, self::GCM_IV_LENGTH + self::GCM_TAG_LENGTH);

            $decrypted = openssl_decrypt($cipherRaw, self::CIPHER_GCM, self::gcmKey(), OPENSSL_RAW_DATA, $iv, $tag);

            if ($decrypted === false) {
                return;
            }

            return $decrypted;
        }

        // Legacy CBC path — reads pre-encryption plaintext and old CBC values unchanged.
        $secretKey = self::secretKey();
        $decode = urldecode($encryptedData);
        $ivLength = openssl_cipher_iv_length(self::CIPHER);

        if (\strlen($decode) <= $ivLength) {
            return $encryptedData;
        }

        $iv = substr($decode, 0, $ivLength);
        $cipherText = substr($decode, $ivLength);

        $decrypted = openssl_decrypt($cipherText, self::CIPHER, $secretKey, 0, $iv);

        return $decrypted === false ? $encryptedData : $decrypted;
    }

    private static function gcmKey()
    {
        return hash('sha256', self::secretKey(), true);
    }

    private static function secretKey()
    {
        if (self::$cachedKey !== null) {
            return self::$cachedKey;
        }

        $secretKey = Config::getOption('secret_key');

        if (!$secretKey) {
            if (\defined('BIT_INTEGRATIONS_SECRET_KEY') && \is_string(\constant('BIT_INTEGRATIONS_SECRET_KEY')) && \constant('BIT_INTEGRATIONS_SECRET_KEY') !== '') {
                self::$cachedKey = \constant('BIT_INTEGRATIONS_SECRET_KEY');

                return self::$cachedKey;
            }

            $generated = \function_exists('wp_generate_password')
                ? wp_generate_password(64, true, true)
                : Config::VAR_PREFIX . bin2hex(random_bytes(32));

            Config::addOption('secret_key', $generated, true);

            wp_cache_delete('alloptions', 'options');
            $secretKey = Config::getOption('secret_key');

            if (!$secretKey) {
                $secretKey = $generated;
            }
        }

        self::$cachedKey = $secretKey;

        return $secretKey;
    }
}
