<?php

namespace BitApps\Integrations\Actions\GoogleCalendar;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use DateTime;
use DateTimeZone;

class RecordApiHelper
{
    protected $token;

    protected $timeZone;

    protected $calendarId;

    public function __construct($token, $calendarId, $timeZone)
    {
        $this->token = $token;
        $this->timeZone = $timeZone;
        $this->calendarId = $calendarId;
    }

    public function insertEvent($data)
    {
        $apiEndpoint = 'https://www.googleapis.com/calendar/v3/calendars/' . $this->calendarId . '/events';
        $headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $this->token,
        ];

        return HttpHelper::post($apiEndpoint, wp_json_encode($data), $headers);
    }

    public function freeSlotCheck($startTime, $endTime)
    {
        $apiEndpoint = 'https://www.googleapis.com/calendar/v3/freeBusy';
        $headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $this->token,
        ];
        $body = [
            'timeMin'  => $startTime,
            'timeMax'  => $endTime,
            'timeZone' => $this->timeZone,
            'items'    => [[
                'id' => $this->calendarId,
            ]],
        ];

        return HttpHelper::post($apiEndpoint, wp_json_encode($body), $headers);
    }

    public function handleInsert($fieldData, $reminderFieldMap, $actions)
    {
        $data = [];
        $dateType = 'dateTime';
        foreach ($fieldData as $title => $value) {
            if ($title === 'start' || $title === 'end') {
                $date = new DateTime(Helper::formatToISO8601($value), new DateTimeZone($this->timeZone));
                if (isset($actions->allDayEvent)) {
                    $data[$title]['date'] = $title === 'end' ? $date->modify('+1 day')->format('Y-m-d') : $date->format('Y-m-d');
                    $dateType = 'date';
                } else {
                    $data[$title]['dateTime'] = Helper::formatToISO8601($value, $this->timeZone);
                }
                $data[$title]['timeZone'] = $this->timeZone;

                continue;
            }
            $data[$title] = $value;
        }

        if (isset($actions->reminders) && \count($reminderFieldMap) > 0) {
            $data['reminders'] = [
                'useDefault' => false,
                'overrides'  => $reminderFieldMap
            ];
        }
        if (isset($actions->skipIfSlotNotEmpty)) {
            $apiResponse = $this->freeSlotCheck($data['start'][$dateType], $data['end'][$dateType]);

            if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
                return $apiResponse;
            }
            if (empty($apiResponse->calendars->{$this->calendarId}->busy)) {
                return $this->insertEvent($data);
            }

            return 'No free slot at this time';
        }

        return $this->insertEvent($data);
    }

    public function executeRecordApi($integrationId, $fieldValues, $fieldMap, $reminderFieldMap, $actions, $descRichText = '')
    {
        $fieldData = [];
        foreach ($fieldMap as $value) {
            if (!empty($value->googleCalendarFormField)) {
                if ($value->formField === 'custom') {
                    $replaceFieldWithValue = Common::replaceFieldWithValue($value->customValue, $fieldValues);
                    if (isset($replaceFieldWithValue)) {
                        $fieldData[$value->googleCalendarFormField] = $replaceFieldWithValue;
                    }
                } else {
                    $fieldData[$value->googleCalendarFormField] = \is_array($fieldValues[$value->formField]) ? wp_json_encode($fieldValues[$value->formField]) : $fieldValues[$value->formField];
                }
            }
        }
        if (!empty($actions->richTextDesc) && !empty($descRichText)) {
            $fieldData['description'] = self::sanitizeDescription(
                Common::replaceFieldWithValue(self::markdownToHtml($descRichText), $fieldValues)
            );
        }

        $reminderFieldMap = [...array_filter($reminderFieldMap, fn ($value) => !empty($value->method) && !empty($value->minutes))];

        $apiResponse = $this->handleInsert($fieldData, $reminderFieldMap, $actions);

        if (!isset($apiResponse->id)) {
            if (isset($apiResponse->error)) {
                LogHandler::save($integrationId, wp_json_encode(['type' => 'record', 'type_name' => 'insert']), 'error', $apiResponse);
            }
            LogHandler::save($integrationId, wp_json_encode(['type' => 'record', 'type_name' => 'insert']), 'error', __('Please check if your have access to insert event in this selected calendar', 'bit-integrations'));
        } else {
            LogHandler::save($integrationId, wp_json_encode(['type' => 'record', 'type_name' => 'insert']), 'success', $apiResponse);
        }
    }

    private static function markdownToHtml($markdown)
    {
        $lines = explode("\n", str_replace(["\r\n", "\r"], "\n", (string) $markdown));

        $html = '';
        $paragraph = [];
        $listType = null;
        $codeLines = null;

        $flushParagraph = function () use (&$paragraph, &$html) {
            if (!empty($paragraph)) {
                $html .= '<p>' . implode('<br>', $paragraph) . '</p>';
                $paragraph = [];
            }
        };

        $flushList = function () use (&$listType, &$html) {
            if (!\is_null($listType)) {
                $html .= '</' . $listType . '>';
                $listType = null;
            }
        };

        foreach ($lines as $line) {
            if (preg_match('/^\s*```/', $line)) {
                if (\is_null($codeLines)) {
                    $flushParagraph();
                    $flushList();
                    $codeLines = [];
                } else {
                    $html .= '<p><span>' . implode('<br>', $codeLines) . '</span></p>';
                    $codeLines = null;
                }

                continue;
            }

            if (!\is_null($codeLines)) {
                $codeLines[] = esc_html($line);

                continue;
            }

            if (trim($line) === '') {
                $flushParagraph();
                $flushList();

                continue;
            }

            if (preg_match('/^(#{1,6})\s+(.*)$/', $line, $heading)) {
                $flushParagraph();
                $flushList();
                $html .= '<p><b>' . self::inlineMarkdownToHtml($heading[2]) . '</b></p>';

                continue;
            }

            if (preg_match('/^\s*[-*+]\s+(.*)$/', $line, $bullet)) {
                $flushParagraph();
                if ($listType !== 'ul') {
                    $flushList();
                    $html .= '<ul>';
                    $listType = 'ul';
                }
                $html .= '<li>' . self::inlineMarkdownToHtml($bullet[1]) . '</li>';

                continue;
            }

            if (preg_match('/^\s*\d+\.\s+(.*)$/', $line, $ordered)) {
                $flushParagraph();
                if ($listType !== 'ol') {
                    $flushList();
                    $html .= '<ol>';
                    $listType = 'ol';
                }
                $html .= '<li>' . self::inlineMarkdownToHtml($ordered[1]) . '</li>';

                continue;
            }

            $flushList();

            if (preg_match('/^\s*>\s?(.*)$/', $line, $quote)) {
                $paragraph[] = self::inlineMarkdownToHtml($quote[1]);

                continue;
            }

            $paragraph[] = self::inlineMarkdownToHtml($line);
        }

        if (!\is_null($codeLines)) {
            $html .= '<p><span>' . implode('<br>', $codeLines) . '</span></p>';
        }

        $flushParagraph();
        $flushList();

        return $html;
    }

    private static function inlineMarkdownToHtml($text)
    {
        $smartTags = [];
        $text = preg_replace_callback(
            '/\$\{[^}]*\}/',
            function ($matched) use (&$smartTags) {
                $placeholder = '%%BITMD' . \count($smartTags) . '%%';
                $smartTags[$placeholder] = $matched[0];

                return $placeholder;
            },
            $text
        );

        $text = esc_html($text);
        $text = preg_replace(
            '/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:)[^\s)]+)\)/i',
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
            $text
        );
        $text = preg_replace('/\*\*(.+?)\*\*/s', '<b>$1</b>', $text);
        $text = preg_replace('/~~(.+?)~~/s', '<s>$1</s>', $text);
        $text = preg_replace('/(?<!\w)_(.+?)_(?!\w)/s', '<i>$1</i>', $text);
        $text = preg_replace('/`([^`]+)`/', '<span>$1</span>', $text);

        return empty($smartTags) ? $text : strtr($text, $smartTags);
    }

    private static function sanitizeDescription($description)
    {
        return wp_kses($description, [
            'a'      => ['href' => [], 'target' => [], 'rel' => []],
            'b'      => [],
            'strong' => [],
            'i'      => [],
            'em'     => [],
            'u'      => [],
            'br'     => [],
            's'      => [],
            'p'      => [],
            'span'   => [],
            'ul'     => [],
            'ol'     => [],
            'li'     => [],
        ]);
    }
}
