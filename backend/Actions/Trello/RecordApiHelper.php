<?php

/**
 * trello Record Api
 */

namespace BitApps\Integrations\Actions\Trello;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, upsert
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function insertCard($data)
    {
        $insertRecordEndpoint = 'https://api.trello.com/1/cards/?idList=' . $this->_integrationDetails->listId . '&key=' . $this->_integrationDetails->clientId . '&token=' . $this->_integrationDetails->accessToken;

        return HttpHelper::post($insertRecordEndpoint, $data);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->trelloFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $customFieldMap)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $finalData['pos'] = $this->_integrationDetails->pos;

        if ($this->isRichTextDescEnabled() && !empty($this->_integrationDetails->descRichText)) {
            // markup is converted first so field values are never treated as tags
            $description = static::htmlToMarkdown($this->_integrationDetails->descRichText);
            $finalData['desc'] = Common::replaceFieldWithValue($description, $fieldValues);
        }
        $apiResponse = $this->insertCard($finalData);

        if (property_exists($apiResponse, 'errors')) {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Card', 'type_name' => 'add-Card']), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Card', 'type_name' => 'add-Card']), 'success', wp_json_encode($apiResponse));
        }

        if (!empty($apiResponse->id) && !empty($customFieldMap)) {
            Hooks::run(Config::withPrefix('trello_store_custom_fields'), $apiResponse->id, $customFieldMap, $fieldValues, $this->_integrationID, $this->_integrationDetails);

            /**
             * @deprecated 2.7.8 Use `bit_integrations_trello_store_custom_fields` action instead.
             * @since 2.7.8
             */
            Hooks::run('btcbi_trello_store_custom_fields', $apiResponse->id, $customFieldMap, $fieldValues, $this->_integrationID, $this->_integrationDetails);
        }

        return $apiResponse;
    }

    /**
     * Converts the rich text editor output to the Markdown flavor Trello renders in card descriptions.
     *
     * @param string $html
     *
     * @return string
     */
    public static function htmlToMarkdown($html)
    {
        if (empty($html) || !\is_string($html)) {
            return '';
        }

        $markdown = str_replace(["\r\n", "\r"], "\n", $html);
        $markdown = preg_replace('#<(script|style)\b[^>]*>.*?</\1>#is', '', $markdown);

        // Preformatted blocks first so their inner markup is not converted.
        $markdown = preg_replace_callback(
            '#<pre\b[^>]*>(?:\s*<code\b[^>]*>)?(.*?)(?:</code>\s*)?</pre>#is',
            function ($matches) {
                return "\n```\n" . trim(wp_strip_all_tags($matches[1])) . "\n```\n";
            },
            $markdown
        );

        $markdown = preg_replace_callback(
            '#<h([1-6])\b[^>]*>(.*?)</h\1>#is',
            function ($matches) {
                return "\n" . str_repeat('#', (int) $matches[1]) . ' ' . trim($matches[2]) . "\n";
            },
            $markdown
        );

        $markdown = preg_replace_callback(
            '#<blockquote\b[^>]*>(.*?)</blockquote>#is',
            function ($matches) {
                $lines = explode("\n", trim($matches[1]));

                return "\n> " . implode("\n> ", $lines) . "\n";
            },
            $markdown
        );

        $markdown = self::convertLists($markdown);

        $markdown = preg_replace_callback(
            '#<img\b[^>]*>#is',
            function ($matches) {
                $src = preg_match('#\bsrc=["\']([^"\']*)["\']#i', $matches[0], $found) ? $found[1] : '';
                $alt = preg_match('#\balt=["\']([^"\']*)["\']#i', $matches[0], $found) ? $found[1] : '';

                return $src === '' ? '' : '![' . $alt . '](' . $src . ')';
            },
            $markdown
        );

        $markdown = preg_replace_callback(
            '#<a\b[^>]*>(.*?)</a>#is',
            function ($matches) {
                $href = preg_match('#\bhref=["\']([^"\']*)["\']#i', $matches[0], $found) ? $found[1] : '';
                $text = trim($matches[1]);

                if ($href === '') {
                    return $text;
                }

                return '[' . ($text === '' ? $href : $text) . '](' . $href . ')';
            },
            $markdown
        );

        $inlinePatterns = [
            '#<(strong|b)\b[^>]*>(.*?)</\1>#is'     => '**$2**',
            '#<(em|i)\b[^>]*>(.*?)</\1>#is'         => '_$2_',
            '#<(del|s|strike)\b[^>]*>(.*?)</\1>#is' => '~~$2~~',
            '#<code\b[^>]*>(.*?)</code>#is'         => '`$1`',
            '#<hr\b[^>]*/?>#i'                      => "\n---\n",
            '#<br\b[^>]*/?>#i'                      => "\n",
            '#</p\s*>#i'                            => "\n\n",
            '#</(div|tr|li|h[1-6])\s*>#i'           => "\n",
        ];
        $markdown = preg_replace(array_keys($inlinePatterns), array_values($inlinePatterns), $markdown);

        // Remove whatever markup is left, then bring encoded characters back as literals.
        $markdown = wp_strip_all_tags($markdown);
        $markdown = html_entity_decode($markdown, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $markdown = str_replace("\xC2\xA0", ' ', $markdown);

        // Collapse the blank lines the block conversions leave behind.
        $markdown = preg_replace('/[ \t]+$/m', '', $markdown);
        $markdown = preg_replace('/\n{3,}/', "\n\n", $markdown);

        return trim($markdown);
    }

    /**
     * Converts list markup innermost first so nested lists keep their indentation.
     *
     * @param string $html
     *
     * @return string
     */
    private static function convertLists($html)
    {
        // Matches only lists that hold no other list, so nesting resolves bottom up.
        $listPattern = '#<(ul|ol)\b[^>]*>((?:(?!<(?:ul|ol)\b).)*?)</\1\s*>#is';
        $depthGuard = 0;

        while ($depthGuard < 10 && preg_match($listPattern, $html)) {
            $html = preg_replace_callback(
                $listPattern,
                function ($matches) {
                    $isOrdered = strtolower($matches[1]) === 'ol';
                    $lines = [];
                    $position = 0;

                    if (preg_match_all('#<li\b[^>]*>(.*?)</li\s*>#is', $matches[2], $items)) {
                        foreach ($items[1] as $item) {
                            ++$position;
                            $marker = $isOrdered ? $position . '. ' : '- ';
                            // Nested lists are already converted, indent them under this item.
                            $item = str_replace("\n", "\n" . str_repeat(' ', \strlen($marker)), trim($item));
                            $lines[] = $marker . $item;
                        }
                    }

                    return empty($lines) ? '' : "\n" . implode("\n", $lines) . "\n";
                },
                $html
            );
            ++$depthGuard;
        }

        return $html;
    }

    /**
     * @return bool
     */
    private function isRichTextDescEnabled()
    {
        $actions = $this->_integrationDetails->actions ?? null;

        if (\is_object($actions)) {
            return !empty($actions->richTextDesc);
        }

        if (\is_array($actions)) {
            return !empty($actions['richTextDesc']);
        }

        return false;
    }
}
