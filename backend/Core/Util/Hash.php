<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;

class Hash
{
    /**
     * Legacy cipher — retained for READING pre-existing stored values only.
     * New writes use the authenticated GCM envelope below.
     */
    public const CIPHER = 'aes-256-cbc';

    /**
     * Authenticated cipher used for all new writes (AEAD).
     */
    public const CIPHER_GCM = 'aes-256-gcm';

    /**
     * Version prefix marking an authenticated-encryption envelope.
     */
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

        return self::V2_PREFIX . urlencode(base64_encode($iv . $tag . $cipherRaw));
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
                error_log('[bit-integrations] auth credential decrypt failed (tampered or key rotated)');

                return null;
            }

            $iv = substr($envelope, 0, self::GCM_IV_LENGTH);
            $tag = substr($envelope, self::GCM_IV_LENGTH, self::GCM_TAG_LENGTH);
            $cipherRaw = substr($envelope, self::GCM_IV_LENGTH + self::GCM_TAG_LENGTH);

            $decrypted = openssl_decrypt($cipherRaw, self::CIPHER_GCM, self::gcmKey(), OPENSSL_RAW_DATA, $iv, $tag);

            if ($decrypted === false) {
                error_log('[bit-integrations] auth credential decrypt failed (tampered or key rotated)');

                return null;
            }

            return $decrypted;
        }

        // Legacy CBC path — reads pre-encryption plaintext and old CBC values unchanged.
        $secretKey = self::secretKey();
        $decode = urldecode($encryptedData);
        $ivLength = openssl_cipher_iv_length(self::CIPHER);

        if (strlen($decode) <= $ivLength) {
            return $encryptedData;
        }

        $iv = substr($decode, 0, $ivLength);
        $cipherText = substr($decode, $ivLength);

        $decrypted = openssl_decrypt($cipherText, self::CIPHER, $secretKey, 0, $iv);

        return $decrypted === false ? $encryptedData : $decrypted;
    }

    /**
     * Derive a 32-byte GCM key from the raw secret string.
     */
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
            $secretKey = function_exists('wp_generate_password')
                ? wp_generate_password(64, true, true)
                : Config::VAR_PREFIX . bin2hex(random_bytes(32));

            // Autoloaded so encrypt/decrypt loops avoid repeated DB hits.
            Config::addOption('secret_key', $secretKey, true);
        }

        self::$cachedKey = $secretKey;

        return $secretKey;
    }
}
