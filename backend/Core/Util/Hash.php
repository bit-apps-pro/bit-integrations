<?php

namespace BitApps\Integrations\Core\Util;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;

class Hash
{
    public const CIPHER = 'aes-256-cbc';

    private static $cachedKey;

    public static function encrypt($data)
    {
        if ($data === null || $data === '') {
            return $data;
        }

        $secretKey = self::secretKey();
        $ivLength = openssl_cipher_iv_length(self::CIPHER);
        $iv = random_bytes($ivLength);
        $cipherText = openssl_encrypt((string) $data, self::CIPHER, $secretKey, 0, $iv);

        return urlencode($iv . $cipherText);
    }

    public static function decrypt($encryptedData)
    {
        if ($encryptedData === null || $encryptedData === '') {
            return $encryptedData;
        }

        $secretKey = self::secretKey();
        $decode = urldecode((string) $encryptedData);
        $ivLength = openssl_cipher_iv_length(self::CIPHER);

        if (strlen($decode) <= $ivLength) {
            return $encryptedData;
        }

        $iv = substr($decode, 0, $ivLength);
        $cipherText = substr($decode, $ivLength);

        $decrypted = openssl_decrypt($cipherText, self::CIPHER, $secretKey, 0, $iv);

        return $decrypted === false ? $encryptedData : $decrypted;
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
