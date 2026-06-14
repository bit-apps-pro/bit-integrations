<?php

namespace BitApps\Integrations\Triggers\FallbackTrigger;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\DateTimeHelper;
use BitApps\Integrations\Core\Util\Helper;
use BitApps\Integrations\Flow\Flow;
use DateTime;
use EDD_Payment;
use FrmEntryValues;
use FrmField;
use FrmFieldsHelper;
use Give_Payment;
use Give_Subscription;
use Groundhogg\DB\Tags;
use IPT_EForm_Form_Elements_Values;
use IPT_FSQM_Form_Elements_Data;
use MeprEvent;
use RCP_Membership;
use WP_Error;
use WPCF7_ContactForm;
use WPCF7_Submission;

final class TriggerFallback
{
    public static function handleFormidableSubmit($conf_method, $form, $form_option, $entry_id, $extra_args)
    {
        $form_id = $form->id;
        if (empty($form_id)) {
            return;
        }

        $flows = Flow::exists('Formidable', $form_id);
        if (empty($flows)) {
            return;
        }

        $file = self::getFormidableFields(($form_id));
        $fileFlds = [];
        foreach ($file as $fldKey => $fldVal) {
            if ($fldVal->type == 'file') {
                $fileFlds[] = $fldVal->name;
            }
        }

        $form_data = self::getFormidableFieldsValues($form, $entry_id);
        $post_id = Helper::getPostIdFromReferer(null);

        if (!empty($form->id)) {
            if (isset($post_id)) {
                $form_data['post_id'] = $post_id;
            }

            foreach ($form_data as $key => $val) {
                if (\in_array($key, $fileFlds)) {
                    if (\is_array($val)) {
                        foreach ($val as $fileKey => $file) {
                            $tmpData = wp_get_attachment_url($form_data[$key][$fileKey]);
                            $form_data[$key][$fileKey] = Common::filePath($tmpData);
                        }
                    } else {
                        $tmpData = wp_get_attachment_url($form_data[$key]);
                        $form_data[$key] = Common::filePath($tmpData);
                    }
                }
            }
        }

        return ['triggered_entity' => 'Formidable', 'triggered_entity_id' => $form_id, 'data' => $form_data, 'flows' => $flows];
    }

    public static function getFormidableFields($form_id)
    {
        $fields = FrmField::get_all_for_form($form_id, '', 'include');
        $field = [];
        if (empty($fields)) {
            wp_send_json_error(__('Form doesn\'t exists any field', 'bit-integrations'));
        }

        $visistedKey = [];

        foreach ($fields as $key => $val) {
            if ($val->type === 'name') {
                $field[] = (object) [
                    'name'  => 'first-name',
                    'label' => 'First Name',
                    'type'  => 'name'
                ];
                $field[] = (object) [
                    'name'  => 'middle-name',
                    'label' => 'Middle Name',
                    'type'  => 'name'
                ];
                $field[] = (object) [
                    'name'  => 'last-name',
                    'label' => 'Last Name',
                    'type'  => 'name'
                ];

                continue;
            } elseif ($val->type === 'address') {
                $allFld = $val->default_value;
                $addressKey = $val->field_key;
                foreach ($allFld as $key => $val) {
                    $field[] = (object) [
                        'name'  => $addressKey . '_' . $key,
                        'label' => 'address_' . $key,
                        'type'  => 'address'
                    ];
                }

                continue;
            } elseif ($val->type === 'divider' || $val->type === 'end_divider') {
                $formName = $val->name;
                $fldKey = $val->field_key;
                $cnt = 0;
                for ($i = $key + 1; $i < \count($fields); $i++) {
                    $id = $fields[$i]->id;
                    if (isset($fields[$i]->form_name) && $fields[$i]->form_name === $formName) {
                        $field[] = (object) [
                            'name'  => $fldKey . '_' . $id,
                            'label' => $formName . ' ' . $fields[$i]->name,
                            'type'  => $fields[$i]->type
                        ];
                    }
                    $cnt++;
                    $visistedKey[] = $fields[$i]->field_key;
                }

                continue;
            }
            if (\in_array($val->field_key, $visistedKey)) {
                // continue;
            }
            $field[] = (object) [
                'name'  => $val->field_key,
                'label' => $val->name,
                'type'  => $val->type
            ];
        }

        return $field;
    }

    public static function getFormidableFieldsValues($form, $entry_id)
    {
        $form_fields = [];
        $fields = FrmFieldsHelper::get_form_fields($form->id);
        $entry_values = new FrmEntryValues($entry_id);
        $field_values = $entry_values->get_field_values();

        foreach ($fields as $field) {
            $key = $field->field_key;

            $val = (isset($field_values[$field->id]) ? $field_values[$field->id]->get_saved_value() : '');

            if (\is_array($val)) {
                if ($field->type === 'name') {
                    if (\array_key_exists('first', $val) || \array_key_exists('middle', $val) || \array_key_exists('last', $val)) {
                        $form_fields['first-name'] = isset($val['first']) ? $val['first'] : '';
                        $form_fields['middle-name'] = isset($val['middle']) ? $val['middle'] : '';
                        $form_fields['last-name'] = isset($val['last']) ? $val['last'] : '';
                    }
                } elseif ($field->type == 'checkbox' || $field->type == 'file') {
                    $form_fields[$key] = $field->type == 'checkbox' && \is_array($val) && \count($val) == 1 ? $val[0] : $val;
                } elseif ($field->type == 'address') {
                    $addressKey = $field->field_key;
                    foreach ($val as $k => $value) {
                        $form_fields[$addressKey . '_' . $k] = $value;
                    }
                } elseif ($field->type == 'divider') {
                    $repeaterFld = $field->field_key;
                    global $wpdb;

                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct queries needed for Formidable repeater fields
                    $allDividerFlds = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}frm_item_metas WHERE item_id IN (SELECT id FROM {$wpdb->prefix}frm_items WHERE parent_item_id = %d)", $entry_id));
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                    $allItemId = $wpdb->get_results($wpdb->prepare("SELECT id FROM {$wpdb->prefix}frm_items WHERE parent_item_id = %d", $entry_id));

                    $repeater = [];
                    foreach ($allItemId as $k => $value) {
                        $itemId = $value->id;
                        foreach ($allDividerFlds as $kTmp => $valueTmp) {
                            $fldId = $valueTmp->field_id;
                            if ($valueTmp->item_id == $itemId) {
                                $form_fields[$repeaterFld . '_' . $fldId . '_' . $itemId] = $valueTmp->meta_value;
                                $repeater[$itemId][] = (object) [
                                    $fldId => $valueTmp->meta_value
                                ];
                            }
                        }
                    }
                    $form_fields[$repeaterFld] = $repeater;
                }

                continue;
            }

            $form_fields[$key] = $val;
        }

        return $form_fields;
    }

    public static function academyHandleCourseEnroll($course_id, $enrollment_id)
    {
        $flows = Flow::exists('AcademyLms', 1);
        $flows = self::academyLmsFlowFilter($flows, 'selectedCourse', $course_id);
        if (!$flows) {
            return;
        }

        $author_id = get_post_field('post_author', $course_id);
        $author_name = get_the_author_meta('display_name', $author_id);

        $student_id = get_post_field('post_author', $enrollment_id);
        $student_name = get_the_author_meta('display_name', $student_id);
        $result_student = [];
        if ($student_id && $student_name) {
            $result_student = [
                'student_id'   => $student_id,
                'student_name' => $student_name,
            ];
        }

        $result_course = [];
        $course = get_post($course_id);
        $result_course = [
            'course_id'     => $course->ID,
            'course_title'  => $course->post_title,
            'course_author' => $author_name,
        ];
        $result = $result_student + $result_course;

        $courseInfo = get_post_meta($course_id);
        $course_temp = [];
        foreach ($courseInfo as $key => $val) {
            if (\is_array($val)) {
                $val = maybe_unserialize($val[0]);
            }
            $course_temp[$key] = $val;
        }

        $result = $result + $course_temp;
        $result['post_id'] = $enrollment_id;

        return ['triggered_entity' => 'AcademyLms', 'triggered_entity_id' => 1, 'data' => $result, 'flows' => $flows];
    }

    public static function academyHandleQuizAttempt($attempt)
    {
        $flows = Flow::exists('AcademyLms', 2);
        $quiz_id = $attempt->quiz_id;

        $flows = $flows ? self::academyLmsFlowFilter($flows, 'selectedQuiz', $quiz_id) : false;
        if (!$flows || empty($flow)) {
            return;
        }

        if ('academy_quiz' !== get_post_type($quiz_id)) {
            return;
        }

        if ('pending' === $attempt->attempt_status) {
            return;
        }

        $attempt_details = [];
        foreach ($attempt as $key => $val) {
            if (\is_array($val)) {
                $val = maybe_unserialize($val[0]);
            }
            $attempt_details[$key] = maybe_unserialize($val);
        }

        return ['triggered_entity' => 'AcademyLms', 'triggered_entity_id' => 2, 'data' => $attempt_details, 'flows' => $flows];
    }

    public static function academyHandleQuizTarget($attempt)
    {
        $flows = Flow::exists('AcademyLms', 5);
        $quiz_id = $attempt->quiz_id;

        $flows = $flows ? self::academyLmsFlowFilter($flows, 'selectedQuiz', $quiz_id) : false;
        if (!$flows) {
            return;
        }

        if ('academy_quiz' !== get_post_type($quiz_id)) {
            return;
        }

        if ('pending' === $attempt->attempt_status) {
            return;
        }

        $attempt_details = [];
        foreach ($attempt as $key => $val) {
            if (\is_array($val)) {
                $val = maybe_unserialize($val[0]);
            }
            $attempt_details[$key] = maybe_unserialize($val);
        }
        foreach ($flows as $flow) {
            $flow_details = $flow->flow_details;
            $reqPercent = $flow_details->requiredPercent;
            $mark = $attempt_details['total_marks'] * ($reqPercent / 100);
            $condition = $flow_details->selectedCondition;
            $achived = self::academyLmsCheckedAchived($condition, $mark, $attempt_details['earned_marks']);
            $attempt_details['achived_status'] = $achived;
        }

        return ['triggered_entity' => 'AcademyLms', 'triggered_entity_id' => 5, 'data' => $attempt_details, 'flows' => $flows];
    }

    public static function academyLmsCheckedAchived($condition, $mark, $earnMark)
    {
        $res = 'Not Achived';

        if ($condition === 'equal_to') {
            if ($earnMark == $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'not_equal_to') {
            if ($earnMark != $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'less_than') {
            if ($earnMark < $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'greater_than') {
            if ($earnMark > $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'greater_than_equal') {
            if ($earnMark >= $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'less_than_equal') {
            if ($earnMark <= $mark) {
                $res = 'Achived';
            }
        }

        return $res;
    }

    public static function academyHandleLessonComplete($topic_type, $course_id, $topic_id, $user_id)
    {
        $flows = Flow::exists('AcademyLms', 3);
        $flows = $flows ? self::academyLmsFlowFilter($flows, 'selectedLesson', $topic_id) : false;
        if (!$flows) {
            return;
        }

        $topicData = [];
        if ($topic_type === 'lesson') {
            $lessonPost = \Academy\Traits\Lessons::get_lesson($topic_id);
            $topicData = [
                'lesson_id'          => $lessonPost->ID,
                'lesson_title'       => $lessonPost->lesson_title,
                'lesson_description' => $lessonPost->lesson_content,
                'lesson_status'      => $lessonPost->lesson_status,
            ];
        }

        if ($topic_type === 'quiz') {
            $quiz = get_post($topic_id);
            $topicData = [
                'quiz_id'          => $quiz->ID,
                'quiz_title'       => $quiz->post_title,
                'quiz_description' => $quiz->post_content,
                'quiz_url'         => $quiz->guid,
            ];
        }

        $user = self::academyLmsGetUserInfo($user_id);
        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $courseData = [];
        $coursePost = get_post($course_id);
        $courseData = [
            'course_id'          => $coursePost->ID,
            'course_title'       => $coursePost->post_title,
            'course_description' => $coursePost->post_content,
            'course_url'         => $coursePost->guid,
        ];

        $lessonDataFinal = $topicData + $courseData + $current_user;
        $lessonDataFinal['post_id'] = $topic_id;

        return ['triggered_entity' => 'AcademyLms', 'triggered_entity_id' => 3, 'data' => $lessonDataFinal, 'flows' => $flows];
    }

    public static function academyHandleCourseComplete($course_id)
    {
        $flows = Flow::exists('AcademyLms', 4);
        $flows = $flows ? self::academyLmsFlowFilter($flows, 'selectedCourse', $course_id) : false;

        if (!$flows) {
            return;
        }

        $coursePost = get_post($course_id);
        $courseData = [
            'course_id'    => $coursePost->ID,
            'course_title' => $coursePost->post_title,
            'course_url'   => $coursePost->guid,
        ];
        $user = self::academyLmsGetUserInfo(get_current_user_id());
        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $courseDataFinal = $courseData + $current_user;
        $courseDataFinal['post_id'] = $course_id;

        return ['triggered_entity' => 'AcademyLms', 'triggered_entity_id' => 4, 'data' => $courseDataFinal, 'flows' => $flows];
    }

    public static function academyLmsGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function affwpNewAffiliateApproved($affiliate_id, $status, $old_status)
    {
        $flows = Flow::exists('Affiliate', 1);
        if (!$flows) {
            return;
        }
        $user_id = affwp_get_affiliate_user_id($affiliate_id);

        if (!$user_id) {
            return;
        }
        if ('pending' === $status) {
            return;
        }

        $affiliate = affwp_get_affiliate($affiliate_id);
        $user = get_user_by('id', $user_id);

        $data = [
            'status'          => $status,
            'flat_rate_basis' => $affiliate->flat_rate_basis,
            'payment_email'   => $affiliate->payment_email,
            'rate_type'       => $affiliate->rate_type,
            'old_status'      => $old_status,

        ];

        return ['triggered_entity' => 'Affiliate', 'triggered_entity_id' => 1, 'data' => $data, 'flows' => $flows];
    }

    public static function affwpUserBecomesAffiliate($affiliate_id, $status, $old_status)
    {
        if ('active' !== $status) {
            return $status;
        }

        $flows = Flow::exists('Affiliate', 2);
        if (!$flows) {
            return;
        }
        $user_id = affwp_get_affiliate_user_id($affiliate_id);

        if (!$user_id) {
            return;
        }

        $affiliate = affwp_get_affiliate($affiliate_id);
        $user = get_user_by('id', $user_id);

        $data = [
            'status'          => $status,
            'flat_rate_basis' => $affiliate->flat_rate_basis,
            'payment_email'   => $affiliate->payment_email,
            'rate_type'       => $affiliate->rate_type,
            'old_status'      => $old_status,

        ];

        return ['triggered_entity' => 'Affiliate', 'triggered_entity_id' => 2, 'data' => $data, 'flows' => $flows];
    }

    public static function affwpAffiliateMakesReferral($referral_id)
    {
        $flows = Flow::exists('Affiliate', 3);
        if (!$flows) {
            return;
        }
        $referral = affwp_get_referral($referral_id);
        $affiliate = affwp_get_affiliate($referral->affiliate_id);
        $user_id = affwp_get_affiliate_user_id($referral->affiliate_id);
        $affiliateNote = maybe_serialize(affwp_get_affiliate_meta($affiliate->affiliate_id, 'notes', true));
        $user = get_user_by('id', $user_id);
        $data = [
            'affiliate_id'         => $referral->affiliate_id,
            'affiliate_url'        => maybe_serialize(affwp_get_affiliate_referral_url(['affiliate_id' => $referral->affiliate_id])),
            'referral_description' => $referral->description,
            'amount'               => $referral->amount,
            'context'              => $referral->context,
            'campaign'             => $referral->campaign,
            'reference'            => $referral->reference,
            'flat_rate_basis'      => $affiliate->flat_rate_basis,
            'account_email'        => $user->user_email,
            'payment_email'        => $affiliate->payment_email,
            'rate_type'            => $affiliate->rate_type,
            'affiliate_note'       => $affiliateNote,

        ];

        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }

        $allTypes = $flowDetails->allType;

        $selectedTypeID = $flowDetails->selectedType;

        foreach ($allTypes as $type) {
            if ($referral->type == $type->type_key && $type->type_id == $selectedTypeID) {
                $execData = ['triggered_entity' => 'Affiliate', 'triggered_entity_id' => 3, 'data' => $data, 'flows' => $flows];

                break;
            }
        }

        if ($selectedTypeID == 'any') {
            $execData = ['triggered_entity' => 'Affiliate', 'triggered_entity_id' => 3, 'data' => $data, 'flows' => $flows];
        }

        return $execData;
    }

    public static function affwpAffiliatesReferralSpecificTypeRejected($referral_id, $new_status, $old_status)
    {
        $flows = Flow::exists('Affiliate', 4);
        if (!$flows) {
            return;
        }

        if ((string) $new_status === (string) $old_status || 'rejected' !== (string) $new_status) {
            return $new_status;
        }

        $referral = affwp_get_referral($referral_id);
        $type = $referral->type;
        $user_id = affwp_get_affiliate_user_id($referral->affiliate_id);
        $user = get_user_by('id', $user_id);
        $affiliate = affwp_get_affiliate($referral->affiliate_id);
        $affiliateNote = maybe_serialize(affwp_get_affiliate_meta($affiliate->affiliate_id, 'notes', true));

        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }

        $allTypes = $flowDetails->allType;

        $selectedTypeID = $flowDetails->selectedType;

        $data = [
            'affiliate_id'         => $referral->affiliate_id,
            'affiliate_url'        => maybe_serialize(affwp_get_affiliate_referral_url(['affiliate_id' => $referral->affiliate_id])),
            'referral_description' => $referral->description,
            'amount'               => $referral->amount,
            'context'              => $referral->context,
            'campaign'             => $referral->campaign,
            'reference'            => $referral->reference,
            'status'               => $new_status,
            'flat_rate_basis'      => $affiliate->flat_rate_basis,
            'account_email'        => $user->user_email,
            'payment_email'        => $affiliate->payment_email,
            'rate_type'            => $affiliate->rate_type,
            'affiliate_note'       => $affiliateNote,
            'old_status'           => $old_status,

        ];

        foreach ($allTypes as $type) {
            if ($referral->type == $type->type_key && $type->type_id == $selectedTypeID) {
                $execData = ['triggered_entity' => 'Affiliate', 'triggered_entity_id' => 4, 'data' => $data, 'flows' => $flows];
            }
        }

        if ($selectedTypeID == 'any') {
            $execData = ['triggered_entity' => 'Affiliate', 'triggered_entity_id' => 4, 'data' => $data, 'flows' => $flows];
        }

        return $execData;
    }

    public static function affwpAffiliatesReferralSpecificTypePaid($referral_id, $new_status, $old_status)
    {
        $flows = Flow::exists('Affiliate', 5);
        if (!$flows) {
            return;
        }

        if ((string) $new_status === (string) $old_status || 'paid' !== (string) $new_status) {
            return $new_status;
        }

        $referral = affwp_get_referral($referral_id);
        $type = $referral->type;
        $user_id = affwp_get_affiliate_user_id($referral->affiliate_id);
        $user = get_user_by('id', $user_id);
        $affiliate = affwp_get_affiliate($referral->affiliate_id);
        $affiliateNote = maybe_serialize(affwp_get_affiliate_meta($affiliate->affiliate_id, 'notes', true));

        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }

        $allTypes = $flowDetails->allType;

        $selectedTypeID = $flowDetails->selectedType;

        $data = [
            'affiliate_id'         => $referral->affiliate_id,
            'affiliate_url'        => maybe_serialize(affwp_get_affiliate_referral_url(['affiliate_id' => $referral->affiliate_id])),
            'referral_description' => $referral->description,
            'amount'               => $referral->amount,
            'context'              => $referral->context,
            'campaign'             => $referral->campaign,
            'reference'            => $referral->reference,
            'status'               => $new_status,
            'flat_rate_basis'      => $affiliate->flat_rate_basis,
            'account_email'        => $user->user_email,
            'payment_email'        => $affiliate->payment_email,
            'rate_type'            => $affiliate->rate_type,
            'affiliate_note'       => $affiliateNote,
            'old_status'           => $old_status,

        ];

        foreach ($allTypes as $type) {
            if ($referral->type == $type->type_key && $type->type_id == $selectedTypeID) {
                $execData = ['triggered_entity' => 'Affiliate', 'triggered_entity_id' => 5, 'data' => $data, 'flows' => $flows];
            }
        }

        if ($selectedTypeID == 'any') {
            $execData = ['triggered_entity' => 'Affiliate', 'triggered_entity_id' => 5, 'data' => $data, 'flows' => $flows];
        }

        return $execData;
    }

    public static function handleArFormSubmit($params, $errors, $form, $item_meta_values)
    {
        $form_id = $form->id;
        $flows = Flow::exists('ARForm', $form_id);
        if (!$flows) {
            return;
        }

        return ['triggered_entity' => 'ARForm', 'triggered_entity_id' => $form_id, 'data' => $item_meta_values, 'flows' => $flows];
    }

    public static function ARMemberHandleRegisterForm($user_id, $post_data)
    {
        if (\array_key_exists('arm_form_id', $post_data) === false) {
            return;
        }
        $form_id = $post_data['arm_form_id'];
        $flows = Flow::exists('ARMember', $form_id = $post_data['arm_form_id']);
        if (empty($flows)) {
            return;
        }
        $userInfo = static::ARMemberGetUserInfo($user_id);
        $post_data['user_id'] = $user_id;
        $post_data['nickname'] = $userInfo['nickname'];
        $post_data['avatar_url'] = $userInfo['avatar_url'];

        return ['triggered_entity' => 'ARMember', 'triggered_entity_id' => $form_id, 'data' => $post_data, 'flows' => $flows];
    }

    public static function ARMemberGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'user_id'    => $user_id,
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function ARMemberHandleUpdateUserByForm($user_ID, $posted_data)
    {
        if (\array_key_exists('form_random_key', $posted_data) === false) {
            return;
        }
        // WP 5.1 compat: strpos() === 0 in place of str_starts_with() (WP 5.9)
        $form_id = strpos($posted_data['form_random_key'], '101') === 0;
        if (!$form_id) {
            return;
        }
        $form_id = '101_2';
        $flows = Flow::exists('ARMember', $form_id);
        if (empty($flows)) {
            return;
        }
        $userInfo = static::ARMemberGetUserInfo($user_ID);
        $posted_data['user_id'] = $user_ID;
        $posted_data['nickname'] = $userInfo['nickname'];
        $posted_data['avatar_url'] = $userInfo['avatar_url'];

        return ['triggered_entity' => 'ARMember', 'triggered_entity_id' => $form_id, 'data' => $posted_data, 'flows' => $flows];
    }

    public static function ARMemberHandleMemberAddByAdmin($user_id, $post_data)
    {
        if (\array_key_exists('action', $post_data) === false) {
            return;
        }
        $form_id = $post_data['form'];
        if (!$form_id) {
            return;
        }
        $form_id = '101_3';
        $flows = Flow::exists('ARMember', $form_id);
        if (empty($flows)) {
            return;
        }
        $userInfo = static::ARMemberGetUserInfo($user_id);
        $post_data['user_id'] = $user_id;
        $post_data['nickname'] = $userInfo['nickname'];
        $post_data['avatar_url'] = $userInfo['avatar_url'];

        return ['triggered_entity' => 'ARMember', 'triggered_entity_id' => $form_id, 'data' => $post_data, 'flows' => $flows];
    }

    public static function ARMemberHandleCancelSubscription($user_id, $plan_id)
    {
        $flows = Flow::exists('ARMember', '4');
        if (empty($flows)) {
            return;
        }
        $finalData = static::ARMemberGetUserInfo($user_id, $plan_id);

        return ['triggered_entity' => 'ARMember', 'triggered_entity_id' => 4, 'data' => $finalData, 'flows' => $flows];
    }

    public static function ARMemberHandlePlanChangeAdmin($user_id, $plan_id)
    {
        $flows = Flow::exists('ARMember', '5');
        if (empty($flows)) {
            return;
        }
        $finalData = static::ARMemberGetUserInfo($user_id, $plan_id);

        return ['triggered_entity' => 'ARMember', 'triggered_entity_id' => 5, 'data' => $finalData, 'flows' => $flows];
    }

    public static function ARMemberHandleRenewSubscriptionPlan($user_id, $plan_id)
    {
        $flows = Flow::exists('ARMember', '6');
        if (empty($flows)) {
            return;
        }
        $finalData = static::ARMemberGetUserInfo($user_id, $plan_id);

        return ['triggered_entity' => 'ARMember', 'triggered_entity_id' => 6, 'data' => $finalData, 'flows' => $flows];
    }

    public static function beaverContactFormSubmitted($mailto, $subject, $template, $headers, $settings, $result)
    {
        $form_id = 'bb_contact_form';
        $flows = Flow::exists('Beaver', $form_id);
        if (!$flows) {
            return;
        }

        $template = str_replace('Name', '|Name', $template);
        $template = str_replace('Email', '|Email', $template);
        $template = str_replace('Phone', '|Phone', $template);
        $template = str_replace('Message', '|Message', $template);

        $filterData = explode('|', $template);
        $filterData = array_map('trim', $filterData);
        $filterData = array_filter($filterData, function ($value) {
            return $value !== '';
        });

        $data = ['subject' => isset($subject) ? $subject : ''];
        foreach ($filterData as $value) {
            $item = explode(':', $value);
            $data[strtolower($item[0])] = trim($item[1]);
        }

        return ['triggered_entity' => 'Beaver', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    public static function beaverLoginFormSubmitted($settings, $password, $name, $template_id, $post_id)
    {
        $form_id = 'bb_login_form';
        $flows = Flow::exists('Beaver', $form_id);
        if (!$flows) {
            return;
        }

        $data = [
            'name'     => isset($name) ? $name : '',
            'password' => isset($password) ? $password : '',
        ];

        return ['triggered_entity' => 'Beaver', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    public static function beaverSubscribeFormSubmitted($response, $settings, $email, $name, $template_id, $post_id)
    {
        $form_id = 'bb_subscription_form';
        $flows = Flow::exists('Beaver', $form_id);
        if (!$flows) {
            return;
        }

        $data = [
            'name'  => isset($name) ? $name : '',
            'email' => isset($email) ? $email : '',
        ];

        return ['triggered_entity' => 'Beaver', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    public static function handleBricksSubmit($form)
    {
        $fields = $form->get_fields();
        $formId = $fields['formId'];
        $files = $form->get_uploaded_files();

        $flows = Flow::exists('Bricks', $formId);
        if (!$flows) {
            return;
        }

        $data = [];
        foreach ($fields as $key => $value) {
            $fieldId = str_replace('form-field-', '', $key);
            $data[$fieldId] = (\is_array($value) && \count($value) == 1) ? $value[0] : $value;
        }
        foreach ($files as $key => $item) {
            $fieldId = str_replace('form-field-', '', $key);

            if (\is_array($item)) {
                foreach ($item as $file) {
                    if (!isset($file['file'])) {
                        continue;
                    }
                    $data[$fieldId][] = $file['file'];
                }
            } else {
                if (!isset($item['file'])) {
                    continue;
                }
                $data[$fieldId] = $item['file'];
            }
        }

        return ['triggered_entity' => 'Bricks', 'triggered_entity_id' => $formId, 'data' => $data, 'flows' => $flows];
    }

    public static function handleBrizySubmit($fields, $form)
    {
        if (!method_exists($form, 'getId')) {
            return ['content' => $fields];
        }
        $form_id = $form->getId();
        $flows = Flow::exists('Brizy', $form_id);
        if (!$flows) {
            return ['content' => $fields];
        }

        $data = [];
        $AllFields = $fields;
        foreach ($AllFields as $element) {
            if ($element->type == 'FileUpload' && !empty($element->value)) {
                $upDir = wp_upload_dir();
                $files = $element->value;
                $value = [];
                $newFileLink = Common::filePath($files);
                $data[$element->name] = $newFileLink;
            } elseif ($element->type == 'checkbox') {
                $value = explode(',', $element->value);
                $data[$element->name] = $value;
            } else {
                $data[$element->name] = $element->value;
            }
        }

        return ['triggered_entity' => 'Brizy', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows, 'content' => $fields];
    }

    public static function BuddyBossGetUserInfo($user_id, $extra = false)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }
        if ($extra == '13') {
            $user['user_profile_url'] = maybe_serialize(bbp_get_user_profile_url($user_id));
        }

        return $user;
    }

    public static function buddyBossHandleAcceptFriendRequest($id, $initiator_user_id, $friend_user_id, $friendship)
    {
        $flows = Flow::exists('BuddyBoss', 1);
        if (!$flows) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($friend_user_id);
        $current_user = [];
        $init_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];
        $user = static::BuddyBossGetUserInfo($initiator_user_id);
        $init_user = [
            'friend_first_name' => $user['first_name'],
            'friend_last_name'  => $user['last_name'],
            'friend_email'      => $user['user_email'],
            'friend_nickname'   => $user['nickname'],
            'friend_avatar_url' => $user['avatar_url'],
            'friend_id'         => $initiator_user_id,
        ];
        $data = $current_user + $init_user;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 1, 'data' => $data, 'flows' => $flows];
    }

    public static function buddyBossHandleSendsFriendRequest($id, $initiator_user_id, $friend_user_id, $friendship)
    {
        $flows = Flow::exists('BuddyBoss', 2);
        if (!$flows) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($initiator_user_id);
        $current_user = [];
        $init_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];
        $user = static::BuddyBossGetUserInfo($friend_user_id);
        $init_user = [
            'friend_first_name' => $user['first_name'],
            'friend_last_name'  => $user['last_name'],
            'friend_email'      => $user['user_email'],
            'friend_nickname'   => $user['nickname'],
            'friend_avatar_url' => $user['avatar_url'],
            'friend_id'         => $friend_user_id,
        ];
        $data = $current_user + $init_user;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 2, 'data' => $data, 'flows' => $flows];
    }

    public static function BuddyBossGetTopicInfo($topic_id)
    {
        $topicInfo = get_post($topic_id);
        $topic = [];
        if ($topicInfo) {
            $topic = [
                'topic_title'   => $topicInfo->post_title,
                'topic_id'      => $topicInfo->ID,
                'topic_url'     => get_permalink($topicInfo->ID),
                'topic_content' => $topicInfo->post_content,
            ];
        }

        return $topic;
    }

    public static function BuddyBossGetForumInfo($forum_id)
    {
        $forumInfo = get_post($forum_id);
        $forum = [];
        if ($forumInfo) {
            $forum = [
                'forum_title' => $forumInfo->post_title,
                'forum_id'    => $forumInfo->ID,
                'forum_url'   => get_permalink($forumInfo->ID),
            ];
        }

        return $forum;
    }

    public static function buddyBossHandleCreateTopic($topic_id, $forum_id, $anonymous_data, $topic_author)
    {
        $flows = Flow::exists('BuddyBoss', 3);
        $flows = static::BuddyBossFlowFilter($flows, 'selectedForum', $forum_id);
        if (!$flows) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($topic_author);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $topics = static::BuddyBossGetTopicInfo($topic_id);
        $forums = static::BuddyBossGetForumInfo($forum_id);
        $data = $current_user + $topics + $forums;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 3, 'data' => $data, 'flows' => $flows];
    }

    public static function buddyBossHandleJoinPublicGroup($group_id, $user_id)
    {
        $flows = Flow::exists('BuddyBoss', 9);
        $flows = static::BuddyBossFlowFilter($flows, 'selectedGroup', $group_id);
        if (!$flows) {
            return;
        }

        $groups = static::BuddyBossGetGroupInfo($group_id, 'public');
        if (!\count($groups)) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($user_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $data = $current_user + $groups;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 9, 'data' => $data, 'flows' => $flows];
    }

    public static function BuddyBossGetGroupInfo($group_id, $status = '', $extra = false)
    {
        global $wpdb;
        if ($status == '') {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for BuddyBoss group info
            $group = $wpdb->get_results(
                $wpdb->prepare("select id,name,description from {$wpdb->prefix}bp_groups where id = %d", $group_id)
            );
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $group = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id,name,description FROM {$wpdb->prefix}bp_groups WHERE id = %d AND status = %s",
                    $group_id,
                    $status
                )
            );
        }

        if (\count($group)) {
            $groupInfo = [
                'group_id'    => $group[0]->id,
                'group_title' => $group[0]->name,
                'group_desc'  => $group[0]->description
            ];
        }
        if ($extra == '9') {
            $group_obj = groups_get_group($group_id);
            $groupInfo['manage_group_request_url'] = maybe_serialize(bp_get_group_permalink($group_obj) . 'admin/membership-requests/');
        }

        return $groupInfo;
    }

    public static function buddyBossHandleJoinPrivateGroup($user_id, $group_id)
    {
        $flows = Flow::exists('BuddyBoss', 10);
        $flows = static::BuddyBossFlowFilter($flows, 'selectedGroup', $group_id);
        if (!$flows) {
            return;
        }

        $groups = static::BuddyBossGetGroupInfo($group_id, 'private');
        if (!\count($groups)) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($user_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $data = $current_user + $groups;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 10, 'data' => $data, 'flows' => $flows];
    }

    public static function buddyBossHandleLeavesGroup($group_id, $user_id)
    {
        $flows = Flow::exists('BuddyBoss', 11);
        $flows = static::BuddyBossFlowFilter($flows, 'selectedGroup', $group_id);
        if (!$flows) {
            return;
        }
        $groups = static::BuddyBossGetGroupInfo($group_id);
        if (!\count($groups)) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($user_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $data = $current_user + $groups;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 11, 'data' => $data, 'flows' => $flows];
    }

    public static function BuddyBossGetActivityInfo($activity_id, $group_id, $user_id)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for BuddyBoss activity
        $activity = $wpdb->get_results($wpdb->prepare("select id,content from {$wpdb->prefix}bp_activity where id = %d", $activity_id));

        $group = groups_get_group($group_id);
        $activityInfo = [];
        if (\count($activity)) {
            $activityInfo = [
                'activity_id'         => $activity[0]->id,
                'activity_url'        => bp_get_group_permalink($group) . 'activity',
                'activity_content'    => $activity[0]->content,
                'activity_stream_url' => bp_core_get_user_domain($user_id) . 'activity/' . $activity_id,
            ];
        }

        return $activityInfo;
    }

    public static function buddyBossHandlePostGroupActivity($content, $user_id, $group_id, $activity_id)
    {
        $flows = Flow::exists('BuddyBoss', 12);
        $flows = static::BuddyBossFlowFilter($flows, 'selectedGroup', $group_id);
        if (!$flows) {
            return;
        }

        $groups = static::BuddyBossGetGroupInfo($group_id);
        if (!\count($groups)) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($user_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $posts = static::BuddyBossGetActivityInfo($activity_id, $group_id, $user_id);
        $data = $current_user + $groups + $posts;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 12, 'data' => $data, 'flows' => $flows];
    }

    public static function BuddyBossGetReplyInfo($reply_id)
    {
        $replyInfo = get_post($reply_id);
        $reply = [];
        if ($replyInfo) {
            $reply = [
                'reply_content' => $replyInfo->post_content,
            ];
        }

        return $reply;
    }

    public static function buddyBossHandleRepliesTopic($reply_id, $topic_id, $forum_id)
    {
        $flows = Flow::exists('BuddyBoss', 4);
        $flows = static::BuddyBossFlowFilter($flows, 'selectedTopic', $topic_id);
        if (!$flows) {
            return;
        }

        $topics = static::BuddyBossGetTopicInfo($topic_id);
        if (!\count($topics)) {
            return;
        }

        $forums = static::BuddyBossGetForumInfo($forum_id);
        if (!\count($forums)) {
            return;
        }

        $replies = static::BuddyBossGetReplyInfo($reply_id);
        if (!\count($replies)) {
            return;
        }

        $user_id = get_current_user_id();
        $user = static::BuddyBossGetUserInfo($user_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $data = $current_user + $topics + $forums + $replies;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 4, 'data' => $data, 'flows' => $flows];
    }

    public static function buddyBossHandleRequestPrivateGroup($user_id, $admins, $group_id, $request_id)
    {
        $flows = Flow::exists('BuddyBoss', 13);
        $flows = static::BuddyBossFlowFilter($flows, 'selectedGroup', $group_id);
        if (!$flows) {
            return;
        }

        $groups = static::BuddyBossGetGroupInfo($group_id, 'private', '13');
        if (!\count($groups)) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($user_id, '13');
        $current_user = [];

        $current_user = [
            'first_name'       => $user['first_name'],
            'last_name'        => $user['last_name'],
            'user_email'       => $user['user_email'],
            'nickname'         => $user['nickname'],
            'avatar_url'       => $user['avatar_url'],
            'user_profile_url' => $user['user_profile_url'],
        ];

        $data = $current_user + $groups;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 13, 'data' => $data, 'flows' => $flows];
    }

    public static function buddyBossHandleSendEmailInvites($user_id, $post)
    {
        $flows = Flow::exists('BuddyBoss', 5);
        if (!$flows) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($user_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $data = $current_user;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 5, 'data' => $data, 'flows' => $flows];
    }

    public static function buddyBossHandleUpdateAvatar($item_id, $type, $avatar_data)
    {
        $flows = Flow::exists('BuddyBoss', 6);
        if (!$flows) {
            return;
        }

        $user_id = $avatar_data['item_id'];

        $user = static::BuddyBossGetUserInfo($user_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $data = $current_user;

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 6, 'data' => $data, 'flows' => $flows];
    }

    public static function BuddyBossFields($id)
    {
        if (empty($id)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        if ($id == 1 || $id == 2) {
            $fields = [
                'First Name' => (object) [
                    'fieldKey'  => 'first_name',
                    'fieldName' => 'First Name'
                ],
                'Last Name' => (object) [
                    'fieldKey'  => 'last_name',
                    'fieldName' => 'Last Name'
                ],
                'Nick Name' => (object) [
                    'fieldKey'  => 'nickname',
                    'fieldName' => 'Nick Name'
                ],
                'Avatar URL' => (object) [
                    'fieldKey'  => 'avatar_url',
                    'fieldName' => 'Avatar URL'
                ],
                'Email' => (object) [
                    'fieldKey'  => 'user_email',
                    'fieldName' => 'Email',
                ],
                'Friend ID' => (object) [
                    'fieldKey'  => 'friend_id',
                    'fieldName' => 'Friend ID',
                ],
                'Friend First Name' => (object) [
                    'fieldKey'  => 'friend_first_name',
                    'fieldName' => 'Friend First Name'
                ],
                'Friend Last Name' => (object) [
                    'fieldKey'  => 'friend_last_name',
                    'fieldName' => 'Friend Last Name'
                ],
                'Fiend Nick Name' => (object) [
                    'fieldKey'  => 'friend_nickname',
                    'fieldName' => 'Fiend Nick Name'
                ],
                'Friend Email' => (object) [
                    'fieldKey'  => 'friend_email',
                    'fieldName' => 'Friend Email'
                ],
                'Friend Avatar URL' => (object) [
                    'fieldKey'  => 'friend_avatar_url',
                    'fieldName' => 'Friend Avatar URL'
                ],

            ];
        } elseif ($id == 3 || $id == 4) {
            $fields = [
                'First Name' => (object) [
                    'fieldKey'  => 'first_name',
                    'fieldName' => 'First Name'
                ],
                'Last Name' => (object) [
                    'fieldKey'  => 'last_name',
                    'fieldName' => 'Last Name'
                ],
                'Nick Name' => (object) [
                    'fieldKey'  => 'nickname',
                    'fieldName' => 'Nick Name'
                ],
                'Avatar URL' => (object) [
                    'fieldKey'  => 'avatar_url',
                    'fieldName' => 'Avatar URL'
                ],
                'Email' => (object) [
                    'fieldKey'  => 'user_email',
                    'fieldName' => 'Email',
                ],
                'Topic Title' => (object) [
                    'fieldKey'  => 'topic_title',
                    'fieldName' => 'Topic Title',
                ],
                'Topic ID' => (object) [
                    'fieldKey'  => 'topic_id',
                    'fieldName' => 'Topic ID',
                ],
                'Topic URL' => (object) [
                    'fieldKey'  => 'topic_url',
                    'fieldName' => 'Topic URL',
                ],
                'Topic Content' => (object) [
                    'fieldKey'  => 'topic_content',
                    'fieldName' => 'Topic Content',
                ],
                'Forum ID' => (object) [
                    'fieldKey'  => 'forum_id',
                    'fieldName' => 'Forum ID',
                ],
                'Forum Title' => (object) [
                    'fieldKey'  => 'forum_title',
                    'fieldName' => 'Forum Title',
                ],
                'Forum URL' => (object) [
                    'fieldKey'  => 'forum_url',
                    'fieldName' => 'Forum URL',
                ],
            ];
            if ($id == 4) {
                $fields['Reply Content'] = (object) [
                    'fieldKey'  => 'reply_content',
                    'fieldName' => 'Reply Content',
                ];
            }
        } elseif ($id == 7) {
            $buddyBossProfileFields = static::getBuddyBossProfileField();
            foreach ($buddyBossProfileFields as $key => $val) {
                $fields[$val->name] = (object) [
                    'fieldKey'  => str_replace(' ', '_', $val->name),
                    'fieldName' => $val->name,
                ];
            }
        } elseif ($id == 9 || $id == 10 || $id == 11 || $id == 13) {
            $fields = [
                'Group Title' => (object) [
                    'fieldKey'  => 'group_title',
                    'fieldName' => 'Group Title',
                ],
                'Group ID' => (object) [
                    'fieldKey'  => 'group_id',
                    'fieldName' => 'Group ID',
                ],
                'Group Description' => (object) [
                    'fieldKey'  => 'group_desc',
                    'fieldName' => 'Group Description',
                ],
                'First Name' => (object) [
                    'fieldKey'  => 'first_name',
                    'fieldName' => 'First Name'
                ],
                'Last Name' => (object) [
                    'fieldKey'  => 'last_name',
                    'fieldName' => 'Last Name'
                ],
                'Nick Name' => (object) [
                    'fieldKey'  => 'nickname',
                    'fieldName' => 'Nick Name'
                ],
                'Avatar URL' => (object) [
                    'fieldKey'  => 'avatar_url',
                    'fieldName' => 'Avatar URL'
                ],
                'Email' => (object) [
                    'fieldKey'  => 'user_email',
                    'fieldName' => 'Email',
                ]
            ];
            if ($id == 13) {
                $fields['User Profile URL'] = (object) [
                    'fieldKey'  => 'user_profile_url',
                    'fieldName' => 'User Profile URL',
                ];

                $fields['Manage Group Request URL'] = (object) [
                    'fieldKey'  => 'manage_group_request_url',
                    'fieldName' => 'Manage Group Request URL',
                ];
            }
        } elseif ($id == 12) {
            $fields = [
                'Group Title' => (object) [
                    'fieldKey'  => 'group_title',
                    'fieldName' => 'Group Title',
                ],
                'Group ID' => (object) [
                    'fieldKey'  => 'group_id',
                    'fieldName' => 'Group ID',
                ],
                'Group Description' => (object) [
                    'fieldKey'  => 'group_desc',
                    'fieldName' => 'Group Description',
                ],
                'First Name' => (object) [
                    'fieldKey'  => 'first_name',
                    'fieldName' => 'First Name'
                ],
                'Last Name' => (object) [
                    'fieldKey'  => 'last_name',
                    'fieldName' => 'Last Name'
                ],
                'Nick Name' => (object) [
                    'fieldKey'  => 'nickname',
                    'fieldName' => 'Nick Name'
                ],
                'Avatar URL' => (object) [
                    'fieldKey'  => 'avatar_url',
                    'fieldName' => 'Avatar URL'
                ],
                'Email' => (object) [
                    'fieldKey'  => 'user_email',
                    'fieldName' => 'Email',
                ],
                'Activity ID' => (object) [
                    'fieldKey'  => 'activity_id',
                    'fieldName' => 'Activity ID',
                ],
                'Activity URL' => (object) [
                    'fieldKey'  => 'activity_url',
                    'fieldName' => 'Activity URL',
                ],
                'Activity Content' => (object) [
                    'fieldKey'  => 'activity_content',
                    'fieldName' => 'Activity Content',
                ],
                'Activity Stream URL' => (object) [
                    'fieldKey'  => 'activity_stream_url',
                    'fieldName' => 'Activity Stream URL',
                ],

            ];
        } else {
            $fields = [
                'First Name' => (object) [
                    'fieldKey'  => 'first_name',
                    'fieldName' => 'First Name'
                ],
                'Last Name' => (object) [
                    'fieldKey'  => 'last_name',
                    'fieldName' => 'Last Name'
                ],
                'Nick Name' => (object) [
                    'fieldKey'  => 'nickname',
                    'fieldName' => 'Nick Name'
                ],
                'Avatar URL' => (object) [
                    'fieldKey'  => 'avatar_url',
                    'fieldName' => 'Avatar URL'
                ],
                'Email' => (object) [
                    'fieldKey'  => 'user_email',
                    'fieldName' => 'Email',
                ],
            ];
        }

        foreach ($fields as $field) {
            $fieldsNew[] = [
                'name'  => $field->fieldKey,
                'type'  => 'text',
                'label' => $field->fieldName,
            ];
        }

        return $fieldsNew;
    }

    public static function getBuddyBossProfileField()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'bp_xprofile_fields';
        $cache_key = Config::withPrefix('buddyboss_profile_fields');
        $cache_group = Config::VAR_PREFIX;

        $cached_fields = wp_cache_get($cache_key, $cache_group);
        if (false !== $cached_fields) {
            return $cached_fields;
        }

        $query = 'SELECT id, type, name FROM ' . esc_sql($table_name);

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.PreparedSQL.NotPrepared -- Querying BuddyBoss custom table directly; table name is static and no user input is used.
        $fields = $wpdb->get_results($query);

        wp_cache_set($cache_key, $fields, $cache_group, 10 * MINUTE_IN_SECONDS);

        return $fields;
    }

    public static function buddyBossHandleUpdateProfile($user_id, $posted_field_ids, $errors, $old_values, $new_values)
    {
        $flows = Flow::exists('BuddyBoss', 7);
        if (!$flows) {
            return;
        }

        $current_user = [];

        $fields = static::BuddyBossFields(7);
        for ($i = 0; $i < \count($fields); $i++) {
            $current_user[$fields[$i]['name']] = $new_values[$i + 1]['value'];
        }

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 7, 'data' => $current_user, 'flows' => $flows];
    }

    public static function buddyBossHandleAccountActive($user_id, $key, $user)
    {
        $flows = Flow::exists('BuddyBoss', 8);
        if (!$flows) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($user_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 8, 'data' => $current_user, 'flows' => $flows];
    }

    public static function buddyBossHandleInviteeActiveAccount($user_id, $inviter_id, $post_id)
    {
        $flows = Flow::exists('BuddyBoss', 14);
        if (!$flows) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($inviter_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 14, 'data' => $current_user, 'flows' => $flows];
    }

    public static function buddyBossHandleInviteeRegisterAccount($user_id, $inviter_id, $post_id)
    {
        $flows = Flow::exists('BuddyBoss', 15);
        if (!$flows) {
            return;
        }

        $user = static::BuddyBossGetUserInfo($inviter_id);
        $current_user = [];

        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        return ['triggered_entity' => 'BuddyBoss', 'triggered_entity_id' => 15, 'data' => $current_user, 'flows' => $flows];
    }

    public static function CartFlowHandleOrderCreateWc($order_id, $importType)
    {
        if (!is_plugin_active('woocommerce/woocommerce.php')) {
            return false;
        }

        $metaData = get_post_meta($order_id);
        $chekoutPageId = (int) $metaData['_wcf_checkout_id'][0];
        $flows = Flow::exists('CartFlow', $chekoutPageId);

        if (!$flows) {
            return false;
        }

        $order = wc_get_order($order_id);
        $finalData = [];
        foreach ($metaData as $key => $value) {
            $finalData[ltrim($key, '_')] = $value[0];
        }
        $finalData['order_products'] = static::CartFlowAccessOrderData($order);
        $finalData['order_id'] = $order_id;

        return ['triggered_entity' => 'CartFlow', 'triggered_entity_id' => $chekoutPageId, 'data' => $finalData, 'flows' => $flows];
    }

    public static function CartFlowAccessOrderData($order)
    {
        $line_items_all = [];
        $count = 0;
        foreach ($order->get_items() as $item_id => $item) {
            $product_id = $item->get_product_id();
            $variation_id = $item->get_variation_id();
            $product = $item->get_product();
            $product_name = $item->get_name();
            $quantity = $item->get_quantity();
            $subtotal = $item->get_subtotal();
            $total = $item->get_total();
            $subtotal_tax = $item->get_subtotal_tax();
            $taxclass = $item->get_tax_class();
            $taxstat = $item->get_tax_status();
            $label = 'line_items_';
            $count++;
            $line_items_all['line_items'][] = (object) [
                'product_id'   => $product_id,
                'variation_id' => $variation_id,
                'product_name' => $product_name,
                'quantity'     => $quantity,
                'subtotal'     => $subtotal,
                'total'        => $total,
                'subtotal_tax' => $subtotal_tax,
                'tax_class'    => $taxclass,
                'tax_status'   => $taxstat,
            ];
        }

        return $line_items_all;
    }

    public static function CF7HandleSubmit()
    {
        $submission = WPCF7_Submission::get_instance();
        $postID = (int) $submission->get_meta('container_post_id');

        if (!$submission || !$posted_data = $submission->get_posted_data()) {
            return;
        }

        if (isset($posted_data['_wpcf7'])) {
            $form_id = $posted_data['_wpcf7'];
        } else {
            $current_form = WPCF7_ContactForm::get_current();
            $form_id = $current_form->id();
        }

        $flows = Flow::exists('CF7', $form_id);

        if (!$flows) {
            return false;
        }

        $files = $submission->uploaded_files();
        $posted_data = array_merge($posted_data, $files);

        if ($postID) {
            $posted_data['post_id'] = $postID;
        }

        // array to string conversion for radio and Select Fields
        $data = [];
        foreach ($posted_data as $key => $value) {
            if (\is_array($value) && \count($value) == 1) {
                $data[$key] = $posted_data[$key][0];
            } else {
                $data[$key] = $posted_data[$key];
            }
        }

        return ['triggered_entity' => 'CF7', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    public static function handleDiviSubmit($et_pb_contact_form_submit, $et_contact_error, $contact_form_info)
    {
        $form_id = $contact_form_info['contact_form_unique_id'] . '_' . $contact_form_info['contact_form_number'];
        $flows = Flow::exists('Divi', $form_id);
        if (!$flows || $et_contact_error) {
            return;
        }

        $data = [];
        $fields = $et_pb_contact_form_submit;
        foreach ($fields as $key => $field) {
            $data[$key] = $field['value'];
        }

        return ['triggered_entity' => 'Divi', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    public static function eddHandlePurchaseProduct($payment_id)
    {
        $flows = Flow::exists('EDD', 1);
        if (!$flows) {
            return;
        }

        $cart_items = edd_get_payment_meta_cart_details($payment_id);
        if (!class_exists('\EDD_Payment') || empty($cart_items)) {
            return;
        }

        $payment = new EDD_Payment($payment_id);

        foreach ($cart_items as $item) {
            $final_data = [
                'user_id'         => $payment->user_id,
                'first_name'      => $payment->first_name,
                'last_name'       => $payment->last_name,
                'user_email'      => $payment->email,
                'product_name'    => $item['name'],
                'product_id'      => $item['id'],
                'order_item_id'   => $item['order_item_id'],
                'discount_codes'  => $payment->discounts,
                'order_discounts' => $item['discount'],
                'order_subtotal'  => $payment->subtotal,
                'order_total'     => $payment->total,
                'order_tax'       => $payment->tax,
                'payment_method'  => $payment->gateway,
            ];
        }

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedProduct = !empty($flowDetails->selectedProduct) ? $flowDetails->selectedProduct : [];

        return ['triggered_entity' => 'EDD', 'triggered_entity_id' => 1, 'data' => $final_data, 'flows' => $flows];
    }

    public static function eddHandlePurchaseProductDiscountCode($payment_id, $payment, $customer)
    {
        $flows = Flow::exists('EDD', 2);
        if (!$flows) {
            return;
        }

        $cart_items = edd_get_payment_meta_cart_details($payment_id);
        if (!class_exists('\EDD_Payment') || empty($cart_items)) {
            return;
        }

        $payment = new EDD_Payment($payment_id);
        foreach ($cart_items as $item) {
            $final_data = [
                'user_id'         => $payment->user_id,
                'first_name'      => $payment->first_name,
                'last_name'       => $payment->last_name,
                'user_email'      => $payment->email,
                'product_name'    => $item['name'],
                'product_id'      => $item['id'],
                'order_item_id'   => $item['order_item_id'],
                'discount_codes'  => $payment->discounts,
                'order_discounts' => $item['discount'],
                'order_subtotal'  => $payment->subtotal,
                'order_total'     => $payment->total,
                'order_tax'       => $payment->tax,
                'payment_method'  => $payment->gateway,
                'status'          => $payment->status,
            ];
        }

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedDiscount = !empty($flowDetails->selectedDiscount) ? $flowDetails->selectedDiscount : [];

        return ['triggered_entity' => 'EDD', 'triggered_entity_id' => 2, 'data' => $final_data, 'flows' => $flows];
    }

    public static function eddHandleOrderRefunded($order_id)
    {
        $flows = Flow::exists('EDD', 3);
        if (!$flows) {
            return;
        }

        $order_detail = edd_get_payment($order_id);
        $total_discount = 0;

        if (empty($order_detail)) {
            return;
        }

        $payment_id = $order_detail->ID;
        $user_id = edd_get_payment_user_id($payment_id);

        if (!$user_id) {
            $user_id = wp_get_current_user()->ID;
        }

        $userInfo = static::eddGetUserInfo($user_id);

        $payment_info = [
            'first_name'      => $userInfo['first_name'],
            'last_name'       => $userInfo['last_name'],
            'nickname'        => $userInfo['nickname'],
            'avatar_url'      => $userInfo['avatar_url'],
            'user_email'      => $userInfo['user_email'],
            'discount_codes'  => $order_detail->discounts,
            'order_discounts' => $total_discount,
            'order_subtotal'  => $order_detail->subtotal,
            'order_total'     => $order_detail->total,
            'order_tax'       => $order_detail->tax,
            'payment_method'  => $order_detail->gateway,
        ];

        return ['triggered_entity' => 'EDD', 'triggered_entity_id' => 3, 'data' => $payment_info, 'flows' => $flows];
    }

    public static function eddGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function essentialBlocksHandler(...$args)
    {
        if ($flows = Flow::exists('EssentialBlocks', current_action())) {
            foreach ($flows as $flow) {
                $flowDetails = json_decode($flow->flow_details);
                if (!isset($flowDetails->primaryKey)) {
                    continue;
                }

                $primaryKeyValue = Helper::extractValueFromPath($args, $flowDetails->primaryKey->key, 'EssentialBlocks');
                if ($flowDetails->primaryKey->value === $primaryKeyValue) {
                    $fieldKeys = [];
                    $formatedData = [];

                    if ($flowDetails->body->data && \is_array($flowDetails->body->data)) {
                        $fieldKeys = array_map(function ($field) use ($args) {
                            return $field->key;
                        }, $flowDetails->body->data);
                    } elseif (isset($flowDetails->field_map) && \is_array($flowDetails->field_map)) {
                        $fieldKeys = array_map(function ($field) use ($args) {
                            return $field->formField;
                        }, $flowDetails->field_map);
                    }

                    foreach ($fieldKeys as $key) {
                        $formatedData[$key] = Helper::extractValueFromPath($args, $key, 'EssentialBlocks');
                    }

                    $execData = ['triggered_entity' => 'EssentialBlocks', 'triggered_entity_id' => current_action(), 'data' => $formatedData, 'flows' => [$flow]];
                }
            }

            return $execData;
        }
    }

    public static function evfHandleSubmission($entry_id, $fields, $entry, $form_id, $form_data)
    {
        $flows = Flow::exists('EVF', $form_id);

        if (!$flows) {
            return;
        }

        $processedEntry = self::evfProcessValues($entry, $fields, $form_data);

        return ['triggered_entity' => 'EVF', 'triggered_entity_id' => 3, 'data' => $processedEntry, 'flows' => $flows];
    }

    public static function evfProcessValues($entry, $fields, $form_data)
    {
        $processedValues = [];

        foreach ($fields as $index => $field) {
            $methodName = 'process' . str_replace(' ', '', ucwords(str_replace('-', ' ', self::evfFieldType($field['type'])))) . 'FieldValue';
            if (method_exists(new self(), $methodName)) {
                $processedValues = array_merge($processedValues, \call_user_func_array([new self(), $methodName], [$index, $field, $form_data]));
            } else {
                $processedValues["{$index}"] = $entry['form_fields'][$index];
            }
        }

        return $processedValues;
    }

    public static function ffHandleSubmit($entryId, $formData, $form)
    {
        $form_id = $form->id;
        if (!empty($form_id) && $flows = Flow::exists('FF', $form_id)) {
            foreach ($formData as $primaryFld => $primaryFldValue) {
                if ($primaryFld === 'repeater_field') {
                    foreach ($primaryFldValue as $secondaryFld => $secondaryFldValue) {
                        foreach ($secondaryFldValue as $tertiaryFld => $tertiaryFldValue) {
                            $formData["{$primaryFld}:{$secondaryFld}-{$tertiaryFld}"] = $tertiaryFldValue;
                        }
                    }
                }
                if (\is_array($primaryFldValue) && array_keys($primaryFldValue) !== range(0, \count($primaryFldValue) - 1)) {
                    foreach ($primaryFldValue as $secondaryFld => $secondaryFldValue) {
                        $formData["{$primaryFld}:{$secondaryFld}"] = $secondaryFldValue;
                    }
                }
            }

            if (isset($form->form_fields, json_decode($form->form_fields)->fields)) {
                $formFields = json_decode($form->form_fields)->fields;
                foreach ($formFields as $fieldInfo) {
                    $attributes = $fieldInfo->attributes;
                    $type = isset($attributes->type) ? $attributes->type : $fieldInfo->element;
                    if ($type === 'file') {
                        $formData[$attributes->name] = Common::filePath($formData[$attributes->name]);
                    }
                    if (property_exists($fieldInfo, 'element') && $fieldInfo->element === 'input_date') {
                        $dateTimeHelper = new DateTimeHelper();
                        $currentDateFormat = $fieldInfo->settings->date_format;
                        $formData[$attributes->name] = $dateTimeHelper->getFormated($formData[$attributes->name], $currentDateFormat, DateTimeHelper::wp_timezone(), 'Y-m-d\TH:i:sP', null);
                    }
                }
            }

            return ['triggered_entity' => 'FF', 'triggered_entity_id' => $form_id, 'data' => $formData, 'flows' => $flows];
        }
    }

    public static function fluentcrmGetContactData($email)
    {
        $contactApi = FluentCrmApi('contacts');
        $contact = $contactApi->getContact($email);
        $customFields = $contact->custom_fields();

        $data = [
            'prefix'         => $contact->prefix,
            'first_name'     => $contact->first_name,
            'last_name'      => $contact->last_name,
            'full_name'      => $contact->full_name,
            'email'          => $contact->email,
            'timezone'       => $contact->timezone,
            'address_line_1' => $contact->address_line_1,
            'address_line_2' => $contact->address_line_2,
            'city'           => $contact->city,
            'state'          => $contact->state,
            'postal_code'    => $contact->postal_code,
            'country'        => $contact->country,
            'ip'             => $contact->ip,
            'phone'          => $contact->phone,
            'source'         => $contact->source,
            'date_of_birth'  => $contact->date_of_birth,
        ];

        if (!empty($customFields)) {
            foreach ($customFields as $key => $value) {
                $data[$key] = $value;
            }
        }

        $lists = $contact->lists;
        $fluentCrmLists = [];
        foreach ($lists as $list) {
            $fluentCrmLists[] = (object) [
                'list_id'    => $list->id,
                'list_title' => $list->title
            ];
        }

        $data['tags'] = implode(', ', array_column($contact->tags->toArray() ?? [], 'title'));
        $data['lists'] = $fluentCrmLists;

        return $data;
    }

    public static function fluentcrmHandleAddTag($tag_ids, $subscriber)
    {
        $flows = Flow::exists('FluentCrm', 'fluentcrm-1');
        $flows = self::fluentcrmFlowFilter($flows, 'selectedTag', $tag_ids);

        if (!$flows) {
            return;
        }

        $email = $subscriber->email;
        $data = ['tag_ids' => $tag_ids];
        $dataContact = self::fluentcrmGetContactData($email);
        $data = $data + $dataContact;

        return ['triggered_entity' => 'FluentCrm', 'triggered_entity_id' => 'fluentcrm-1', 'data' => $data, 'flows' => $flows];
    }

    public static function fluentcrmHandleRemoveTag($tag_ids, $subscriber)
    {
        $flows = Flow::exists('FluentCrm', 'fluentcrm-2');
        $flows = self::fluentcrmFlowFilter($flows, 'selectedTag', $tag_ids);

        if (!$flows) {
            return;
        }

        $email = $subscriber->email;
        $data = ['removed_tag_ids' => $tag_ids];
        $dataContact = self::fluentcrmGetContactData($email);
        $data = $data + $dataContact;

        return ['triggered_entity' => 'FluentCrm', 'triggered_entity_id' => 'fluentcrm-2', 'data' => $data, 'flows' => $flows];
    }

    public static function fluentcrmHandleAddList($list_ids, $subscriber)
    {
        $flows = Flow::exists('FluentCrm', 'fluentcrm-3');
        $flows = self::fluentcrmFlowFilter($flows, 'selectedList', $list_ids);

        if (!$flows) {
            return;
        }

        $email = $subscriber->email;
        $data = ['list_ids' => $list_ids];
        $dataContact = self::fluentcrmGetContactData($email);
        $data = $data + $dataContact;

        return ['triggered_entity' => 'FluentCrm', 'triggered_entity_id' => 'fluentcrm-3', 'data' => $data, 'flows' => $flows];
    }

    public static function fluentcrmHandleRemoveList($list_ids, $subscriber)
    {
        $flows = Flow::exists('FluentCrm', 'fluentcrm-4');
        $flows = self::fluentcrmFlowFilter($flows, 'selectedList', $list_ids);

        if (!$flows) {
            return;
        }

        $email = $subscriber->email;
        $data = ['remove_list_ids' => $list_ids];
        $dataContact = self::fluentcrmGetContactData($email);
        $data = $data + $dataContact;

        return ['triggered_entity' => 'FluentCrm', 'triggered_entity_id' => 'fluentcrm-4', 'data' => $data, 'flows' => $flows];
    }

    public static function fluentcrmHandleContactCreate($subscriber)
    {
        $flows = Flow::exists('FluentCrm', 'fluentcrm-6');
        if (!$flows) {
            return;
        }

        $email = $subscriber->email;
        $data = self::fluentcrmGetContactData($email);

        return ['triggered_entity' => 'FluentCrm', 'triggered_entity_id' => 'fluentcrm-6', 'data' => $data, 'flows' => $flows];
    }

    public static function fluentcrmHandleChangeStatus($subscriber, $old_status)
    {
        $newStatus = [$subscriber->status];

        $flows = Flow::exists('FluentCrm', 'fluentcrm-5');
        $flows = self::fluentcrmFlowFilter($flows, 'selectedStatus', $newStatus);

        $email = $subscriber->email;

        $data = [
            'old_status' => $old_status,
            'new_status' => $newStatus,
        ];

        $dataContact = self::fluentcrmGetContactData($email);
        $data = $data + $dataContact;

        return ['triggered_entity' => 'FluentCrm', 'triggered_entity_id' => 'fluentcrm-5', 'data' => $data, 'flows' => $flows];
    }

    public static function handleFormcraftSubmit($template, $meta, $content, $integrations)
    {
        $form_id = $template['Form ID'];
        $flows = Flow::exists('FormCraft', $form_id);

        if (!$flows) {
            return;
        }

        $finalData = [];
        if (!empty($content)) {
            foreach ($content as $value) {
                if ($value['type'] === 'fileupload') {
                    $finalData[$value['identifier']] = $value['url'][0];
                } else {
                    $finalData[$value['identifier']] = $value['value'];
                }
            }
        }

        return ['triggered_entity' => 'FormCraft', 'triggered_entity_id' => $form_id, 'data' => $finalData, 'flows' => $flows];
    }

    public static function handleForminatorSubmit($entry, $form_id, $form_data)
    {
        $post_id = Helper::getPostIdFromReferer(null);

        if (!empty($form_id) && $flows = Flow::exists('Forminator', $form_id)) {
            $data = [];
            if (isset($post_id)) {
                $data['post_id'] = $post_id;
            }
            foreach ($form_data as $fldDetail) {
                if (\is_array($fldDetail['value'])) {
                    if (\array_key_exists('file', $fldDetail['value'])) {
                        $data[$fldDetail['name']] = [$fldDetail['value']['file']['file_path']];
                    } elseif (explode('-', $fldDetail['name'])[0] == 'name') {
                        if ($fldDetail['name']) {
                            $last_dash_position = strrpos($fldDetail['name'], '-');
                            $index = substr($fldDetail['name'], $last_dash_position + 1);
                        }
                        foreach ($fldDetail['value'] as $nameKey => $nameVal) {
                            $data[$nameKey . '-' . $index] = $nameVal;
                        }
                    } elseif (explode('-', $fldDetail['name'])[0] == 'address') {
                        if ($fldDetail['name']) {
                            $last_dash_position = strrpos($fldDetail['name'], '-');
                            $index = substr($fldDetail['name'], $last_dash_position + 1);
                        }
                        foreach ($fldDetail['value'] as $nameKey => $nameVal) {
                            $data[$nameKey . '-' . $index] = $nameVal;
                        }
                    } else {
                        $val = $fldDetail['value'];
                        if (\array_key_exists('ampm', $val)) {
                            $time = $val['hours'] . ':' . $val['minutes'] . ' ' . $val['ampm'];
                            $data[$fldDetail['name']] = $time;
                        } elseif (\array_key_exists('year', $val)) {
                            $date = $val['year'] . '-' . $val['month'] . '-' . $val['day'];
                            $data[$fldDetail['name']] = $date;
                        } elseif (\array_key_exists('formatting_result', $val)) {
                            $data[$fldDetail['name']] = $fldDetail['value']['formatting_result'];
                        } else {
                            $data[$fldDetail['name']] = $fldDetail['value'];
                        }
                    }
                } else {
                    if (self::ForminatorIsValidDate($fldDetail['value'])) {
                        $dateTmp = new DateTime($fldDetail['value']);
                        $dateFinal = date_format($dateTmp, 'Y-m-d');
                        $data[$fldDetail['name']] = $dateFinal;
                    } else {
                        $data[$fldDetail['name']] = $fldDetail['value'];
                    }
                }
            }

            return ['triggered_entity' => 'Forminator', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
        }
    }

    public static function ForminatorIsValidDate($date, $format = 'd/m/Y')
    {
        $dateTime = DateTime::createFromFormat($format, $date);

        return $dateTime && $dateTime->format($format) === $date;
    }

    public static function gamipressHandleUserEarnRank($user_id, $new_rank, $old_rank, $admin_id, $achievement_id)
    {
        $flows = Flow::exists('GamiPress', 1);

        if (!$flows) {
            return;
        }
        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }

        $userData = self::gamipressGetUserInfo($user_id);

        if ($flowDetails->selectedRank === $new_rank->post_name) {
            $newRankData = [
                'rank_type' => $new_rank->post_type,
                'rank'      => $new_rank->post_name,
            ];

            $data = array_merge($userData, $newRankData);

            return ['triggered_entity' => 'GamiPress', 'triggered_entity_id' => 1, 'data' => $data, 'flows' => $flows];
        }
    }

    public static function gamipressGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name'   => $user_meta['first_name'][0],
                'last_name'    => $user_meta['last_name'][0],
                'user_email'   => $userData->user_email,
                'user_url'     => $userData->user_url,
                'display_name' => $userData->display_name,
            ];
        }

        return $user;
    }

    public static function gamipressHandleAwardAchievement($user_id, $achievement_id, $trigger, $site_id, $args)
    {
        $flows = Flow::exists('GamiPress', 2);
        if (!$flows) {
            return;
        }

        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for GamiPress awards
        $awards = $wpdb->get_results(
            $wpdb->prepare('SELECT ID, post_name, post_title, post_type FROM wp_posts where id = %d', $achievement_id)
        );

        $userData = self::gamipressGetUserInfo($user_id);
        $awardData = [
            'achievement_type' => $awards[0]->post_type,
            'award'            => $awards[0]->post_name,
        ];
        $data = array_merge($userData, $awardData);

        if ($flowDetails->selectedAward === $awards[0]->post_name) {
            return ['triggered_entity' => 'GamiPress', 'triggered_entity_id' => 2, 'data' => $data, 'flows' => $flows];
        }
    }

    public static function gamipressHandleGainAchievementType($user_id, $achievement_id, $trigger, $site_id, $args)
    {
        $flows = Flow::exists('GamiPress', 3);
        if (!$flows) {
            return;
        }
        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }

        $postData = get_post($achievement_id);

        $data = [
            'post_id'        => $achievement_id,
            'post_title'     => $postData->post_title,
            'post_url'       => get_permalink($achievement_id),
            'post_type'      => $postData->post_type,
            'post_author_id' => $postData->post_author,
            // 'post_author_email' => $postData->post_author_email,
            'post_content'   => $postData->post_content,
            'post_parent_id' => $postData->post_parent,
        ];

        if ($flowDetails->selectedAchievementType === $postData->post_type || $flowDetails->selectedAchievementType === 'any-achievement') {
            return ['triggered_entity' => 'GamiPress', 'triggered_entity_id' => 3, 'data' => $data, 'flows' => $flows];
        }
    }

    public static function gamipressHandleRevokeAchieve($user_id, $achievement_id, $earning_id)
    {
        $postData = get_post($achievement_id);
        $expectedData = get_post($postData->post_parent);

        $data = [
            'post_id'        => $achievement_id,
            'post_title'     => !empty($expectedData->post_title) ? $expectedData->post_title : '',
            'post_url'       => get_permalink($achievement_id),
            'post_type'      => isset($expectedData->post_type),
            'post_author_id' => isset($expectedData->post_author),
            // 'post_author_email' => $postData->post_author_email,
            'post_content'   => isset($expectedData->post_content),
            'post_parent_id' => isset($expectedData->post_parent),
        ];

        for ($i = 4; $i <= 5; $i++) {
            if ($i == 4) {
                $flows = Flow::exists('GamiPress', $i);
                Flow::execute('GamiPress', $i, $data, $flows);
            }
            if ($i == 5) {
                $flows = Flow::exists('GamiPress', $i);
                foreach ($flows as $flow) {
                    if (\is_string($flow->flow_details)) {
                        $flow->flow_details = json_decode($flow->flow_details);
                        $flowDetails = $flow->flow_details;
                    }
                }
                if ($flowDetails->selectedAchievementType === $expectedData->post_type || $flowDetails->selectedAchievementType === 'any-achievement') {
                    Flow::execute('GamiPress', $i, $data, $flows);
                }
            }
        }
    }

    public static function gamipressHandleEarnPoints($user_id, $new_points, $total_points, $admin_id, $achievement_id, $points_type, $reason, $log_type)
    {
        $flows = Flow::exists('GamiPress', 6);
        if (!$flows) {
            return;
        }

        $userData = self::gamipressGetUserInfo($user_id);
        unset($userData['user_url']);

        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }
        $pointData = [
            'total_points' => $total_points,
            'new_points'   => $new_points,
            'points_type'  => $points_type,
        ];
        $data = array_merge($userData, $pointData);
        if ($flowDetails->selectedPoint === (string) $total_points || $flowDetails->selectedPoint === '') {
            return ['triggered_entity' => 'GamiPress', 'triggered_entity_id' => 6, 'data' => $data, 'flows' => $flows];
        }
    }

    public static function gformAfterSubmission($entry, $form)
    {
        $form_id = $form['id'];
        if (!empty($form_id) && $flows = Flow::exists('GF', $form_id)) {
            $upDir = wp_upload_dir();
            foreach ($form['fields'] as $key => $value) {
                if ($value->type === 'fileupload' && isset($entry[$value->id])) {
                    if ($value->multipleFiles === false) {
                        $entry[$value->id] = Common::filePath($entry[$value->id]);
                    } else {
                        $entry[$value->id] = Common::filePath(json_decode($entry[$value->id], true));
                    }
                }
                if ($value->type === 'checkbox' && \is_array($value->inputs)) {
                    foreach ($value->inputs as $input) {
                        if (isset($entry[$input['id']])) {
                            $entry[$value->id][] = $entry[$input['id']];
                        }
                    }
                }
            }
            $finalData = $entry + ['title' => $form['title']];

            return ['triggered_entity' => 'GF', 'triggered_entity_id' => $form_id, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function giveHandleUserDonation($payment_id, $status, $old_status)
    {
        $flows = Flow::exists('GiveWp', 1);
        if (!$flows) {
            return;
        }

        if ('publish' !== $status) {
            return;
        }

        $payment = new Give_Payment($payment_id);

        if (empty($payment)) {
            return;
        }
        $payment_exists = $payment->ID;
        if (empty($payment_exists)) {
            return;
        }

        $give_form_id = $payment->form_id;
        $user_id = $payment->user_id;

        if (0 === $user_id) {
            return;
        }

        $finalData = json_decode(wp_json_encode($payment), true);

        $donarUserInfo = give_get_payment_meta_user_info($payment_id);
        if ($donarUserInfo) {
            $finalData['title'] = $donarUserInfo['title'];
            $finalData['first_name'] = $donarUserInfo['first_name'];
            $finalData['last_name'] = $donarUserInfo['last_name'];
            $finalData['email'] = $donarUserInfo['email'];
            $finalData['address1'] = $donarUserInfo['address']['line1'];
            $finalData['address2'] = $donarUserInfo['address']['line2'];
            $finalData['city'] = $donarUserInfo['address']['city'];
            $finalData['state'] = $donarUserInfo['address']['state'];
            $finalData['zip'] = $donarUserInfo['address']['zip'];
            $finalData['country'] = $donarUserInfo['address']['country'];
            $finalData['donar_id'] = $donarUserInfo['donor_id'];
        }

        $finalData['give_form_id'] = $give_form_id;
        $finalData['give_form_title'] = $payment->form_title;
        $finalData['currency'] = $payment->currency;
        $finalData['give_price_id'] = $payment->price_id;
        $finalData['price'] = $payment->total;

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedDonationForm = !empty($flowDetails->selectedDonationForm) ? $flowDetails->selectedDonationForm : [];
        if ($flows && $give_form_id === $selectedDonationForm || $selectedDonationForm === 'any') {
            return ['triggered_entity' => 'GiveWp', 'triggered_entity_id' => 1, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function giveWpGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function giveHandleSubscriptionDonationCancel($subscription_id, $subscription)
    {
        $flows = Flow::exists('GiveWp', 2);
        if (!$flows) {
            return;
        }

        $give_form_id = $subscription->form_id;
        $amount = $subscription->recurring_amount;
        $donor = $subscription->donor;
        $user_id = $donor->user_id;
        $getUserData = static::giveWpGetUserInfo($user_id);
        $finalData = [
            'subscription_id' => $subscription_id,
            'give_form_id'    => $give_form_id,
            'amount'          => $amount,
            'donor'           => $donor,
            'user_id'         => $user_id,
            'first_name'      => $getUserData['first_name'],
            'last_name'       => $getUserData['last_name'],
            'user_email'      => $getUserData['email'],
            'nickname'        => $getUserData['nickname'],
            'avatar_url'      => $getUserData['avatar_url'],
        ];

        if (0 === $user_id) {
            return;
        }

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedRecurringDonationForm = !empty($flowDetails->selectedRecurringDonationForm) ? $flowDetails->selectedRecurringDonationForm : '';
        if ($flows && !empty($selectedRecurringDonationForm) && $give_form_id === $selectedRecurringDonationForm) {
            return ['triggered_entity' => 'GiveWp', 'triggered_entity_id' => 2, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function giveHandleRecurringDonation($status, $row_id, $data, $where)
    {
        $flows = Flow::exists('GiveWp', 3);
        if (!$flows) {
            return;
        }

        $subscription = new Give_Subscription($row_id);
        $recurring_amount = $subscription->recurring_amount;
        $give_form_id = $subscription->form_id;

        $total_payment = $subscription->get_total_payments();
        $donor = $subscription->donor;
        $user_id = $donor->user_id;

        if (0 === absint($user_id)) {
            return;
        }

        if ($total_payment > 1 && 'active' === (string) $data['status']) {
            $user = static::giveWpGetUserInfo($user_id);
            $finalData = [
                'give_form_id'     => $give_form_id,
                'recurring_amount' => $recurring_amount,
                'total_payment'    => $total_payment,
                'donor'            => $donor,
                'user_id'          => $user_id,
                'first_name'       => $user['first_name'],
                'last_name'        => $user['last_name'],
                'user_email'       => $user['user_email'],
                'nickname'         => $user['nickname'],
                'avatar_url'       => $user['avatar_url'],
            ];
        }

        return ['triggered_entity' => 'GiveWp', 'triggered_entity_id' => 3, 'data' => $finalData, 'flows' => $flows];
    }

    public static function groundhoggHandleSubmit($a, $fieldValues)
    {
        $form_id = 1;
        $flows = Flow::exists('Groundhogg', $form_id);
        if (!$flows) {
            return;
        }

        global $wp_rest_server;
        $request = $wp_rest_server->get_raw_data();
        $data = json_decode($request);
        $meta = $data->meta;

        $fieldValues['primary_phone'] = $meta->primary_phone;
        $fieldValues['mobile_phone'] = $meta->mobile_phone;

        if (isset($data->tags)) {
            $fieldValues['tags'] = self::groundhoggSetTagNames($data->tags);
        }

        $data = $fieldValues;

        return ['triggered_entity' => 'Groundhogg', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    public static function groundhoggTagApplied($a, $b)
    {
        $data = $a['data'];
        $form_id = 2;
        $flows = Flow::exists('Groundhogg', $form_id);

        if (!$flows) {
            return;
        }

        $getSelected = $flows[0]->flow_details;
        $enCode = json_decode($getSelected);

        if (isset($a['tags'])) {
            $data['tags'] = self::groundhoggSetTagNames($a['tags']);
        }

        if ($enCode->selectedTag == $b || $enCode->selectedTag == 'any') {
            return ['triggered_entity' => 'Groundhogg', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
        }
    }

    public static function groundhoggTagRemove($a, $b)
    {
        $data = $a['data'];
        $form_id = 3;
        $flows = Flow::exists('Groundhogg', $form_id);

        if (!$flows) {
            return;
        }

        $getSelected = $flows[0]->flow_details;
        $enCode = json_decode($getSelected);

        if (isset($a['tags'])) {
            $data['tags'] = self::groundhoggSetTagNames($a['tags']);
        }

        if ($enCode->selectedTag == $b || $enCode->selectedTag == 'any') {
            return ['triggered_entity' => 'Groundhogg', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
        }
    }

    public static function happySaveImage($base64_img, $title)
    {
        // Upload dir.
        $upload = wp_upload_dir();
        $upload_dir = $upload['basedir'];
        $upload_dir = $upload_dir . '/bihappy';
        if (!is_dir($upload_dir)) {
            wp_mkdir_p($upload_dir);
        }
        $upload_path = $upload_dir;

        $img = str_replace('data:image/png;base64,', '', $base64_img);
        $img = str_replace(' ', '+', $img);
        $decoded = base64_decode($img);
        $filename = $title . '.png';
        $file_type = 'image/png';
        $hashed_filename = md5($filename . microtime()) . '_' . $filename;

        // Save the image in the uploads directory.
        $upload_file = file_put_contents($upload_path . '/' . $hashed_filename, $decoded);
        if ($upload_file) {
            return $upload_path . '/' . $hashed_filename;
        }

        return $base64_img;
    }

    /**
     * Decode a HappyForms field value without instantiating PHP objects.
     * Mirrors maybe_unserialize() but blocks PHP object injection (CWE-502)
     * by passing allowed_classes => false to unserialize(). Legitimate
     * signature/attachment payloads are plain arrays and decode unchanged.
     *
     * @param mixed $value
     *
     * @return mixed
     */
    private static function safeMaybeUnserialize($value)
    {
        if (\is_string($value) && is_serialized($value)) {
            return unserialize($value, ['allowed_classes' => false]);
        }

        return $value;
    }

    public static function happyGetPath($val)
    {
        $img = self::safeMaybeUnserialize($val);
        $hash_ids = array_filter(array_values($img));
        $attachments = happyforms_get_attachment_controller()->get([
            'hash_id' => $hash_ids,
        ]);

        $attachment_ids = wp_list_pluck($attachments, 'ID');
        $links = array_map('wp_get_attachment_url', $attachment_ids);

        return implode(', ', $links);
    }

    public static function handleHappySubmit($submission, $form, $a)
    {
        $post_id = Helper::getPostIdFromReferer(null);
        $form_id = $form['ID'];

        if (!empty($form_id) && $flows = Flow::exists('Happy', $form_id)) {
            $data = [];
            if ($post_id) {
                $data['post_id'] = $post_id;
            }
            $form_data = $submission;

            foreach ($form_data as $key => $val) {
                // WP 5.1 compat: strpos() in place of str_contains() (WP 5.9)
                if (strpos($key, 'signature') !== false) {
                    $decodedSignature = self::safeMaybeUnserialize($val);
                    $baseUrl = \is_array($decodedSignature) ? ($decodedSignature['signature_raster_data'] ?? '') : '';
                    $form_data[$key] = $baseUrl !== '' ? self::happySaveImage($baseUrl, 'sign') : '';
                } elseif (strpos($key, 'date') !== false) {
                    if (strtotime($val)) {
                        $dateTmp = new DateTime($val);
                        $dateFinal = date_format($dateTmp, 'Y-m-d');
                        $form_data[$key] = $dateFinal;
                    }
                } elseif (strpos($key, 'attachment') !== false) {
                    $image = self::happyGetPath($val);
                    $form_data[$key] = Common::filePath($image);
                }
            }

            return ['triggered_entity' => 'Happy', 'triggered_entity_id' => $form_id, 'data' => $form_data, 'flows' => $flows];
        }
    }

    public static function jetEnginePostMetaData($meta_id, $post_id, $meta_key, $meta_value)
    {
        $postCreateFlow = Flow::exists('JetEngine', 1);
        if (!$postCreateFlow) {
            return;
        }

        $postData = get_post($post_id);
        // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key, WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- Array payload keys, not a DB query.
        $finalData = (array) $postData + ['meta_key' => $meta_key, 'meta_value' => $meta_value];
        $postData = get_post($post_id);
        $user_id = get_current_user_id();
        $postType = $postData->post_type;

        $info = isset($postCreateFlow[0]->flow_details) ? json_decode($postCreateFlow[0]->flow_details) : '';
        $selectedPostType = !empty($info->selectedPostType) ? $info->selectedPostType : 'any-post-type';
        $selectedMetaKey = !empty($info->selectedMetaKey) ? $info->selectedMetaKey : '';
        $selectedMetaValue = !empty($info->selectedMetaValue) ? $info->selectedMetaValue : '';

        $isPostTypeMatched = $selectedPostType ? $selectedPostType === $postType : true;
        $isMetaKeyMatched = $selectedMetaKey ? $selectedMetaKey === $meta_key : true;
        $isMetaValueMatched = $selectedMetaValue ? $selectedMetaValue === $meta_value : true;
        $isEditable = $user_id && $postCreateFlow && !($meta_key === '_edit_lock');
        if (1 && $isPostTypeMatched && $isMetaKeyMatched && $isEditable) {
            return ['triggered_entity' => 'JetEngine', 'triggered_entity_id' => 1, 'data' => $finalData, 'flows' => $postCreateFlow];
        }
    }

    public static function jetEnginePostMetaValueCheck($meta_id, $post_id, $meta_key, $meta_value)
    {
        $postCreateFlow = Flow::exists('JetEngine', 2);
        if (!$postCreateFlow) {
            return;
        }

        $postData = get_post($post_id);
        // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key, WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- Array payload keys, not a DB query.
        $finalData = (array) $postData + ['meta_key' => $meta_key, 'meta_value' => $meta_value];
        $postData = get_post($post_id);
        $user_id = get_current_user_id();
        $postType = $postData->post_type;

        $info = isset($postCreateFlow[0]->flow_details) ? json_decode($postCreateFlow[0]->flow_details) : '';
        $selectedPostType = !empty($info->selectedPostType) ? $info->selectedPostType : 'any-post-type';
        $selectedMetaKey = !empty($info->selectedMetaKey) ? $info->selectedMetaKey : '';
        $selectedMetaValue = !empty($info->selectedMetaValue) ? $info->selectedMetaValue : '';

        $isPostTypeMatched = $selectedPostType ? $selectedPostType === $postType : true;
        $isMetaKeyMatched = $selectedMetaKey ? $selectedMetaKey === $meta_key : true;
        $isMetaValueMatched = $selectedMetaValue ? $selectedMetaValue === $meta_value : true;
        $isEditable = $user_id && $postCreateFlow && !($meta_key === '_edit_lock');
        if (2 && $isPostTypeMatched && $isMetaKeyMatched && $isMetaValueMatched && $isEditable) {
            return ['triggered_entity' => 'JetEngine', 'triggered_entity_id' => 2, 'data' => $finalData, 'flows' => $postCreateFlow];
        }
    }

    public static function handleKadenceFormSubmit($form_args, $fields, $form_id, $post_id)
    {
        if (!$form_id) {
            return;
        }
        $flows = Flow::exists('Kadence', $post_id . '_' . $form_id);
        if (!$flows) {
            return;
        }
        $data = [];
        foreach ($fields as $key => $field) {
            $data['kb_field_' . $key] = $field['value'];
        }

        return ['triggered_entity' => 'Kadence', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    public static function getUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name'   => $user_meta['first_name'][0],
                'last_name'    => $user_meta['last_name'][0],
                'user_login'   => $userData->user_login,
                'user_email'   => $userData->user_email,
                'user_url'     => $userData->user_url,
                'display_name' => $userData->display_name,
                'nickname'     => $userData->user_nicename,
                'user_pass'    => $userData->user_pass,
            ];
        }

        return $user;
    }

    public static function learndashHandleCourseEnroll($user_id, $course_id, $access_list, $remove)
    {
        if (!empty($remove)) {
            $flows = Flow::exists('LearnDash', 2);
            $flows = self::flowFilter($flows, 'unenrollCourse', $course_id);
        } else {
            $flows = Flow::exists('LearnDash', 1);
            $flows = self::flowFilter($flows, 'selectedCourse', $course_id);
        }
        if (!$flows) {
            return;
        }

        $course = get_post($course_id);
        $course_url = get_permalink($course_id);
        $result_course = [
            'course_id'    => $course->ID,
            'course_title' => $course->post_title,
            'course_url'   => $course_url,
        ];
        $user = self::getUserInfo($user_id);

        $result = $result_course + $user;

        return ['triggered_entity' => 'LearnDash', 'triggered_entity_id' => 1, 'data' => $result, 'flows' => $flows];
    }

    public static function learndashHandleLessonCompleted($data)
    {
        $user = $data['user']->data;
        $course = $data['course'];
        $lesson = $data['lesson'];
        if ($course && $user) {
            $course_id = $course->ID;
            $lesson_id = $lesson->ID;
            $user_id = $user->ID;
        }
        $flows = Flow::exists('LearnDash', 4);
        $flows = self::flowFilter($flows, 'selectedLesson', $lesson_id);

        if (!$flows) {
            return;
        }

        $course_url = get_permalink($course_id);
        $result_course = [
            'course_id'    => $course->ID,
            'course_title' => $course->post_title,
            'course_url'   => $course_url,
        ];

        $lesson_url = get_permalink($lesson_id);
        $result_lesson = [
            'lesson_id'    => $lesson->ID,
            'lesson_title' => $lesson->post_title,
            'lesson_url'   => $lesson_url,
        ];

        $user = self::getUserInfo($user_id);

        $lessonDataFinal = $result_course + $result_lesson + $user;

        return ['triggered_entity' => 'LearnDash', 'triggered_entity_id' => 4, 'data' => $lessonDataFinal, 'flows' => $flows];
    }

    public static function learndashHandleQuizAttempt($data, $user)
    {
        $user = $user->data;
        $course = $data['course'];
        $lesson = $data['lesson'];
        if ($course && $user) {
            $course_id = $course->ID;
            $lesson_id = $lesson->ID;
            $user_id = $user->ID;
            $quiz_id = $data['quiz'];
            $score = $data['score'];
            $pass = $data['pass'];
            $total_points = $data['total_points'];
            $points = $data['points'];
            $percentage = $data['percentage'];
        }
        for ($i = 6; $i < 9; $i++) {
            $flows = Flow::exists('LearnDash', $i);
            $flows = self::flowFilter($flows, 'selectedQuiz', $quiz_id);

            if (!$flows) {
                continue;
            }
            if ($i == 7 && $pass) {
                continue;
            }
            if ($i == 8 && !$pass) {
                continue;
            }
            $course_url = get_permalink($course_id);
            $result_course = [
                'course_id'    => $course->ID,
                'course_title' => $course->post_title,
                'course_url'   => $course_url,
            ];

            $lesson_url = get_permalink($lesson_id);
            $result_lesson = [
                'lesson_id'    => $lesson->ID,
                'lesson_title' => $lesson->post_title,
                'lesson_url'   => $lesson_url,
            ];

            $quiz_url = get_permalink($quiz_id);

            $quiz_query_args = [
                'post_type'      => 'sfwd-quiz',
                'post_status'    => 'publish',
                'orderby'        => 'post_title',
                'order'          => 'ASC',
                'posts_per_page' => 1,
                'ID'             => $quiz_id,
            ];

            $quizList = get_posts($quiz_query_args);

            $result_quiz = [
                'quiz_id'      => $quiz_id,
                'quiz_title'   => $quizList[0]->post_title,
                'quiz_url'     => $quiz_url,
                'score'        => $score,
                'pass'         => $pass,
                'total_points' => $total_points,
                'points'       => $points,
                'percentage'   => $percentage,
            ];

            $user = self::getUserInfo($user_id);

            $quizAttemptDataFinal = $result_course + $result_lesson + $result_quiz + $user;
            Flow::execute('LearnDash', $i, $quizAttemptDataFinal, $flows);
        }
    }

    public static function learndashHandleTopicCompleted($data)
    {
        if (empty($data)) {
            return;
        }
        $user = $data['user']->data;
        $course = $data['course'];
        $lesson = $data['lesson'];
        $topic = $data['topic'];
        if ($course && $user && $topic) {
            $course_id = $course->ID;
            $lesson_id = $lesson->ID;
            $user_id = $user->ID;
            $topic_id = $topic->ID;
        }
        $flows = Flow::exists('LearnDash', 5);
        $flows = self::flowFilter($flows, 'selectedTopic', $topic_id);

        if (!$flows) {
            return;
        }

        $course_url = get_permalink($course_id);
        $result_course = [
            'course_id'    => $course->ID,
            'course_title' => $course->post_title,
            'course_url'   => $course_url,
        ];

        $lesson_url = get_permalink($lesson_id);
        $result_lesson = [
            'lesson_id'    => $lesson->ID,
            'lesson_title' => $lesson->post_title,
            'lesson_url'   => $lesson_url,
        ];

        $topic_url = get_permalink($topic_id);
        $result_topic = [
            'topic_id'    => $topic->ID,
            'topic_title' => $topic->post_title,
            'topic_url'   => $topic_url,
        ];

        $user = self::getUserInfo($user_id);

        $topicDataFinal = $result_course + $result_lesson + $result_topic + $user;

        return ['triggered_entity' => 'LearnDash', 'triggered_entity_id' => 5, 'data' => $topicDataFinal, 'flows' => $flows];
    }

    public static function learndashHandleCourseCompleted($data)
    {
        $user = $data['user']->data;
        $course = $data['course'];
        if ($course && $user) {
            $course_id = $course->ID;
            $user_id = $user->ID;
        }
        $flows = Flow::exists('LearnDash', 3);
        $flows = self::flowFilter($flows, 'completeCourse', $course_id);
        if (!$flows) {
            return;
        }

        $course_url = get_permalink($course_id);
        $result_course = [
            'course_id'    => $course->ID,
            'course_title' => $course->post_title,
            'course_url'   => $course_url,
        ];
        $user = self::getUserInfo($user_id);
        $result = $result_course + $user;

        return ['triggered_entity' => 'LearnDash', 'triggered_entity_id' => 3, 'data' => $result, 'flows' => $flows];
    }

    public static function learndashHandleAddedGroup($user_id, $group_id)
    {
        if (!$group_id || !$user_id) {
            return;
        }
        $flows = Flow::exists('LearnDash', 9);
        $flows = self::flowFilter($flows, 'selectedGroup', $group_id);

        if (!$flows) {
            return;
        }
        $group = get_post($group_id);
        $group_url = get_permalink($group_id);
        $result_group = [
            'group_id'    => $group->ID,
            'group_title' => $group->post_title,
            'group_url'   => $group_url,
        ];

        $user = self::getUserInfo($user_id);

        $groupDataFinal = $result_group + $user;

        return ['triggered_entity' => 'LearnDash', 'triggered_entity_id' => 9, 'data' => $groupDataFinal, 'flows' => $flows];
    }

    public static function learndashHandleRemovedGroup($user_id, $group_id)
    {
        if (!$group_id || !$user_id) {
            return;
        }
        $flows = Flow::exists('LearnDash', 10);
        $flows = self::flowFilter($flows, 'selectedGroup', $group_id);

        if (!$flows) {
            return;
        }
        $group = get_post($group_id);
        $group_url = get_permalink($group_id);
        $result_group = [
            'group_id'    => $group->ID,
            'group_title' => $group->post_title,
            'group_url'   => $group_url,
        ];

        $user = self::getUserInfo($user_id);

        $groupDataFinal = $result_group + $user;

        return ['triggered_entity' => 'LearnDash', 'triggered_entity_id' => 10, 'data' => $groupDataFinal, 'flows' => $flows];
    }

    public static function learndashHandleAssignmentSubmit($assignment_post_id, $assignment_meta)
    {
        if (!$assignment_post_id || !$assignment_meta) {
            return;
        }
        $file_name = $assignment_meta['file_name'];
        $file_link = $assignment_meta['file_link'];
        $file_path = $assignment_meta['file_path'];
        $user_id = $assignment_meta['user_id'];
        $lesson_id = $assignment_meta['lesson_id'];
        $course_id = $assignment_meta['course_id'];
        $assignment_id = $assignment_post_id;

        $flows = Flow::exists('LearnDash', 11);
        $flows = self::flowFilter($flows, 'selectedGroup', $lesson_id);

        if (!$flows) {
            return;
        }
        $course = get_post($course_id);
        $course_url = get_permalink($course_id);
        $result_course = [
            'course_id'    => $course->ID,
            'course_title' => $course->post_title,
            'course_url'   => $course_url,
        ];

        $lesson = get_post($lesson_id);
        $lesson_url = get_permalink($lesson_id);
        $result_lesson = [
            'lesson_id'    => $lesson->ID,
            'lesson_title' => $lesson->post_title,
            'lesson_url'   => $lesson_url,
        ];

        $result_assignment = [
            'assignment_id' => $assignment_id,
            'file_name'     => $file_name,
            'file_link'     => $file_link,
            'file_path'     => $file_path,
        ];

        $user = self::getUserInfo($user_id);

        $assignmentDataFinal = $result_course + $result_lesson + $result_assignment + $user;

        return ['triggered_entity' => 'LearnDash', 'triggered_entity_id' => 11, 'data' => $assignmentDataFinal, 'flows' => $flows];
    }

    // lifterLms

    public static function lifterLmsGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function lifterLmsGetQuizDetail($quizId)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for LifterLMS quiz details
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, post_title FROM {$wpdb->posts}
                WHERE {$wpdb->posts}.post_status = 'publish' AND {$wpdb->posts}.post_type = 'llms_quiz' AND {$wpdb->posts}.ID = %d",
                $quizId
            )
        );
    }

    public static function lifterLmsHandleAttemptQuiz($user_id, $quiz_id, $quiz_obj)
    {
        $flows = Flow::exists('LifterLms', 1);
        if (!$flows) {
            return;
        }

        $userInfo = self::lifterLmsGetUserInfo($user_id);
        $quizDetail = self::lifterLmsGetQuizDetail($quiz_id);

        $finalData = [
            'user_id'    => $user_id,
            'quiz_id'    => $quiz_id,
            'first_name' => $userInfo['first_name'],
            'last_name'  => $userInfo['last_name'],
            'nickname'   => $userInfo['nickname'],
            'avatar_url' => $userInfo['avatar_url'],
            'user_email' => $userInfo['user_email'],
            'quiz_title' => $quizDetail[0]->post_title,
        ];

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedQuiz = !empty($flowDetails->selectedQuiz) ? $flowDetails->selectedQuiz : [];
        if ($flows && ($quiz_id == $selectedQuiz || $selectedQuiz === 'any')) {
            return ['triggered_entity' => 'LifterLms', 'triggered_entity_id' => 1, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function lifterLmsHandleQuizPass($user_id, $quiz_id, $quiz_obj)
    {
        $flows = Flow::exists('LifterLms', 2);
        if (!$flows) {
            return;
        }

        $userInfo = self::lifterLmsGetUserInfo($user_id);
        $quizDetail = self::lifterLmsGetQuizDetail($quiz_id);

        $finalData = [
            'user_id'    => $user_id,
            'quiz_id'    => $quiz_id,
            'first_name' => $userInfo['first_name'],
            'last_name'  => $userInfo['last_name'],
            'nickname'   => $userInfo['nickname'],
            'avatar_url' => $userInfo['avatar_url'],
            'user_email' => $userInfo['user_email'],
            'quiz_title' => $quizDetail[0]->post_title,
        ];

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedQuiz = !empty($flowDetails->selectedQuiz) ? $flowDetails->selectedQuiz : [];
        if ($flows && ($quiz_id == $selectedQuiz || $selectedQuiz === 'any')) {
            return ['triggered_entity' => 'LifterLms', 'triggered_entity_id' => 2, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function lifterLmsHandleQuizFail($user_id, $quiz_id, $quiz_obj)
    {
        $flows = Flow::exists('LifterLms', 3);
        if (!$flows) {
            return;
        }

        $userInfo = self::lifterLmsGetUserInfo($user_id);
        $quizDetail = self::lifterLmsGetQuizDetail($quiz_id);

        $finalData = [
            'user_id'    => $user_id,
            'quiz_id'    => $quiz_id,
            'first_name' => $userInfo['first_name'],
            'last_name'  => $userInfo['last_name'],
            'nickname'   => $userInfo['nickname'],
            'avatar_url' => $userInfo['avatar_url'],
            'user_email' => $userInfo['user_email'],
            'quiz_title' => $quizDetail[0]->post_title,
        ];

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedQuiz = !empty($flowDetails->selectedQuiz) ? $flowDetails->selectedQuiz : [];
        if ($flows && ($quiz_id == $selectedQuiz || $selectedQuiz === 'any')) {
            return ['triggered_entity' => 'LifterLms', 'triggered_entity_id' => 3, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function lifterLmsGetLessonDetail($lessonId)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for LifterLMS lesson details
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, post_title FROM {$wpdb->posts}
                WHERE {$wpdb->posts}.post_status = 'publish' AND {$wpdb->posts}.post_type = 'lesson' AND {$wpdb->posts}.ID = %d",
                $lessonId
            )
        );
    }

    public static function lifterLmsHandleLessonComplete($user_id, $lesson_id)
    {
        $flows = Flow::exists('LifterLms', 4);
        if (!$flows) {
            return;
        }

        $userInfo = self::lifterLmsGetUserInfo($user_id);
        $lessonDetail = self::lifterLmsGetLessonDetail($lesson_id);

        $finalData = [
            'user_id'      => $user_id,
            'lesson_id'    => $lesson_id,
            'lesson_title' => $lessonDetail[0]->post_title,
            'first_name'   => $userInfo['first_name'],
            'last_name'    => $userInfo['last_name'],
            'nickname'     => $userInfo['nickname'],
            'avatar_url'   => $userInfo['avatar_url'],
            'user_email'   => $userInfo['user_email'],
        ];

        return ['triggered_entity' => 'LifterLms', 'triggered_entity_id' => 4, 'data' => $finalData, 'flows' => $flows];
    }

    public static function lifterLmsGetCourseDetail($courseId)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for LifterLMS course details
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, post_title FROM {$wpdb->posts}
                WHERE {$wpdb->posts}.post_status = 'publish' AND {$wpdb->posts}.post_type = 'course' AND {$wpdb->posts}.ID = %d",
                $courseId
            )
        );
    }

    public static function lifterLmsHandleCourseComplete($user_id, $course_id)
    {
        $flows = Flow::exists('LifterLms', 5);
        if (!$flows) {
            return;
        }

        $userInfo = self::lifterLmsGetUserInfo($user_id);
        $courseDetail = self::lifterLmsGetCourseDetail($course_id);

        $finalData = [
            'user_id'      => $user_id,
            'course_id'    => $course_id,
            'course_title' => $courseDetail[0]->post_title,
            'first_name'   => $userInfo['first_name'],
            'last_name'    => $userInfo['last_name'],
            'nickname'     => $userInfo['nickname'],
            'avatar_url'   => $userInfo['avatar_url'],
            'user_email'   => $userInfo['user_email'],
        ];

        return ['triggered_entity' => 'LifterLms', 'triggered_entity_id' => 5, 'data' => $finalData, 'flows' => $flows];
    }

    public static function lifterLmsHandleCourseEnroll($user_id, $product_id)
    {
        $flows = Flow::exists('LifterLms', 6);
        if (!$flows) {
            return;
        }

        $userInfo = self::lifterLmsGetUserInfo($user_id);
        $courseDetail = self::lifterLmsGetCourseDetail($product_id);

        $finalData = [
            'user_id'      => $user_id,
            'course_id'    => $product_id,
            'course_title' => $courseDetail[0]->post_title,
            'first_name'   => $userInfo['first_name'],
            'last_name'    => $userInfo['last_name'],
            'nickname'     => $userInfo['nickname'],
            'avatar_url'   => $userInfo['avatar_url'],
            'user_email'   => $userInfo['user_email'],
        ];

        return ['triggered_entity' => 'LifterLms', 'triggered_entity_id' => 6, 'data' => $finalData, 'flows' => $flows];
    }

    public static function lifterLmsHandleCourseUnEnroll($student_id, $course_id, $a, $status)
    {
        $flows = Flow::exists('LifterLms', 7);

        if (!$flows || empty($course_id) || $status != 'cancelled') {
            return;
        }

        $userInfo = self::lifterLmsGetUserInfo($student_id);
        $courseDetail = self::lifterLmsGetCourseDetail($course_id);

        $finalData = [
            'user_id'      => $student_id,
            'course_id'    => $course_id,
            'course_title' => $courseDetail[0]->post_title,
            'first_name'   => $userInfo['first_name'],
            'last_name'    => $userInfo['last_name'],
            'nickname'     => $userInfo['nickname'],
            'avatar_url'   => $userInfo['avatar_url'],
            'user_email'   => $userInfo['user_email'],
        ];

        return ['triggered_entity' => 'LifterLms', 'triggered_entity_id' => 7, 'data' => $finalData, 'flows' => $flows];
    }

    public static function lifterLmsGetMembershipDetail($membershipId)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for LifterLMS membership details
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, post_title FROM {$wpdb->posts}
        WHERE {$wpdb->posts}.post_status = 'publish' AND {$wpdb->posts}.post_type = 'llms_membership' AND {$wpdb->posts}.ID = %d",
                $membershipId
            )
        );
    }

    public static function lifterLmsHandleMembershipCancel($data, $user_id, $a, $b)
    {
        $flows = Flow::exists('LifterLms', 8);
        $product_id = $data->get('product_id');

        if (!$flows || !$user_id || !$product_id) {
            return;
        }

        $userInfo = self::lifterLmsGetUserInfo($user_id);
        $membershipDetail = self::lifterLmsGetMembershipDetail($product_id);

        $finalData = [
            'user_id'          => $user_id,
            'membership_title' => $product_id,
            'membership_id'    => $membershipDetail[0]->post_title,
            'first_name'       => $userInfo['first_name'],
            'last_name'        => $userInfo['last_name'],
            'nickname'         => $userInfo['nickname'],
            'avatar_url'       => $userInfo['avatar_url'],
            'user_email'       => $userInfo['user_email'],
        ];

        return ['triggered_entity' => 'LifterLms', 'triggered_entity_id' => 8, 'data' => $finalData, 'flows' => $flows];
    }

    // mail poet

    public static function mailPoetHandleDateField($item)
    {
        if (
            \array_key_exists('year', $item)
            && \array_key_exists('month', $item)
            && \array_key_exists('day', $item)
            && (!empty($item['year']) || !empty($item['month']) || !empty($item['day']))
        ) {
            $year = (int) !empty($item['year']) ? $item['year'] : gmdate('Y');
            $month = (int) !empty($item['month']) ? $item['month'] : 1;
            $day = (int) !empty($item['day']) ? $item['day'] : 1;
        } elseif (
            \array_key_exists('year', $item)
            && \array_key_exists('month', $item)
            && (!empty($item['year']) || !empty($item['month']))
        ) {
            $year = (int) !empty($item['year']) ? $item['year'] : gmdate('Y');
            $month = (int) !empty($item['month']) ? $item['month'] : 1;
            $day = 1;
        } elseif (\array_key_exists('year', $item) && !empty($item['year'])) {
            $year = $item['year'];
            $month = 1;
            $day = 1;
        } elseif (\array_key_exists('month', $item) && !empty($item['month'])) {
            $year = gmdate('Y');
            $month = $item['month'];
            $day = 1;
        }

        if (isset($year, $month, $day)) {
            $date = new DateTime();
            $date->setDate($year, $month, $day);

            return $date->format('Y-m-d');
        }
    }

    public static function handleMailpoetSubmit($data, $segmentIds, $form)
    {
        $formData = [];

        foreach ($data as $key => $item) {
            $keySeparated = explode('_', $key);

            if ($keySeparated[0] === 'cf') {
                if (\is_array($item)) {
                    $formData[$keySeparated[1]] = self::mailPoetHandleDateField($item);
                } else {
                    $formData[$keySeparated[1]] = $item;
                }
            } else {
                if (\is_array($item)) {
                    $formData[$key] = self::mailPoetHandleDateField($item);
                } else {
                    $formData[$key] = $item;
                }
            }
        }

        $form_id = $form->getId();

        if (!empty($form_id) && $flows = Flow::exists('MailPoet', $form_id)) {
            return ['triggered_entity' => 'MailPoet', 'triggered_entity_id' => $form_id, 'data' => $formData, 'flows' => $flows];
        }
    }

    // masterStudy Lms

    public static function masterStudyLmsGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function masterStudyGetCourseDetail($courseId)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for MasterStudy course details
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, post_title,post_content FROM {$wpdb->posts}
                WHERE {$wpdb->posts}.post_status = 'publish' AND {$wpdb->posts}.post_type = 'stm-courses' AND {$wpdb->posts}.ID = %d",
                $courseId
            )
        );
    }

    public static function stmLmsHandleCourseComplete($course_id, $user_id, $progress)
    {
        $flows = Flow::exists('MasterStudyLms', 1);
        if (!$flows) {
            return;
        }

        $userInfo = self::masterStudyLmsGetUserInfo($user_id);
        $courseDetails = self::masterStudyGetCourseDetail($course_id);

        $finalData = [
            'user_id'            => $user_id,
            'course_id'          => $course_id,
            'course_title'       => $courseDetails[0]->post_title,
            'course_description' => $courseDetails[0]->post_content,
            'first_name'         => $userInfo['first_name'],
            'last_name'          => $userInfo['last_name'],
            'nickname'           => $userInfo['nickname'],
            'avatar_url'         => $userInfo['avatar_url'],
            'user_email'         => $userInfo['user_email'],
        ];

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedCourse = !empty($flowDetails->selectedCourse) ? $flowDetails->selectedCourse : [];
        if ($flows && ($course_id == $selectedCourse || $selectedCourse === 'any')) {
            return ['triggered_entity' => 'MasterStudyLms', 'triggered_entity_id' => 1, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function stmLmsHandleCourseEnroll($user_id, $course_id)
    {
        $flows = Flow::exists('MasterStudyLms', 3);
        if (!$flows) {
            return;
        }

        $userInfo = self::masterStudyLmsGetUserInfo($user_id);
        $courseDetails = self::masterStudyGetCourseDetail($course_id);

        $finalData = [
            'user_id'            => $user_id,
            'course_id'          => $course_id,
            'course_title'       => $courseDetails[0]->post_title,
            'course_description' => $courseDetails[0]->post_content,
            'first_name'         => $userInfo['first_name'],
            'last_name'          => $userInfo['last_name'],
            'nickname'           => $userInfo['nickname'],
            'avatar_url'         => $userInfo['avatar_url'],
            'user_email'         => $userInfo['user_email'],
        ];

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedCourse = !empty($flowDetails->selectedCourse) ? $flowDetails->selectedCourse : [];
        if ($flows && ($course_id == $selectedCourse || $selectedCourse === 'any')) {
            return ['triggered_entity' => 'MasterStudyLms', 'triggered_entity_id' => 3, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function masterStudyGetLessonDetail($lessonId)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for MasterStudy lesson details
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, post_title,post_content FROM {$wpdb->posts}
        WHERE {$wpdb->posts}.post_status = 'publish' AND {$wpdb->posts}.post_type = 'stm-lessons' AND {$wpdb->posts}.ID = %d",
                $lessonId
            )
        );
    }

    public static function stmLmsHandleLessonComplete($user_id, $lesson_id)
    {
        $flows = Flow::exists('MasterStudyLms', 2);
        if (!$flows) {
            return;
        }

        $userInfo = self::masterStudyLmsGetUserInfo($user_id);
        $lessonDetails = self::masterStudyGetLessonDetail($lesson_id);

        $finalData = [
            'user_id'            => $user_id,
            'lesson_id'          => $lesson_id,
            'lesson_title'       => $lessonDetails[0]->post_title,
            'lesson_description' => $lessonDetails[0]->post_content,
            'first_name'         => $userInfo['first_name'],
            'last_name'          => $userInfo['last_name'],
            'nickname'           => $userInfo['nickname'],
            'avatar_url'         => $userInfo['avatar_url'],
            'user_email'         => $userInfo['user_email'],
        ];

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedLesson = !empty($flowDetails->selectedLesson) ? $flowDetails->selectedLesson : [];
        if ($flows && ($lesson_id == $selectedLesson || $selectedLesson === 'any')) {
            return ['triggered_entity' => 'MasterStudyLms', 'triggered_entity_id' => 2, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function masterStudyGetQuizDetails($quiz_id)
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for MasterStudy quiz details
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ID, post_title,post_content FROM {$wpdb->posts}
                 WHERE {$wpdb->posts}.post_status = 'publish' AND {$wpdb->posts}.post_type = 'stm-quizzes' AND {$wpdb->posts}.ID = %d",
                $quiz_id
            )
        );
    }

    public static function stmLmsHandleQuizComplete($user_id, $quiz_id, $user_quiz_progress)
    {
        $flows = Flow::exists('MasterStudyLms', 4);
        if (!$flows) {
            return;
        }

        $userInfo = self::masterStudyLmsGetUserInfo($user_id);
        $quizDetails = self::masterStudyGetQuizDetails($quiz_id);

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedCourse = !empty($flowDetails->selectedCourse) ? $flowDetails->selectedCourse : [];
        $courseDetails = self::masterStudyGetCourseDetail($selectedCourse);

        $finalData = [
            'user_id'            => $user_id,
            'course_id'          => $selectedCourse,
            'course_title'       => $courseDetails[0]->post_title,
            'course_description' => $courseDetails[0]->post_content,
            'quiz_id'            => $quiz_id,
            'quiz_title'         => $quizDetails[0]->post_title,
            'quiz_description'   => $quizDetails[0]->post_content,
            'first_name'         => $userInfo['first_name'],
            'last_name'          => $userInfo['last_name'],
            'nickname'           => $userInfo['nickname'],
            'avatar_url'         => $userInfo['avatar_url'],
            'user_email'         => $userInfo['user_email'],
        ];

        $selectedQuiz = !empty($flowDetails->selectedQuiz) ? $flowDetails->selectedQuiz : [];

        if (($quiz_id == $selectedQuiz || $selectedQuiz === 'any')) {
            return ['triggered_entity' => 'MasterStudyLms', 'triggered_entity_id' => 4, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function stmLmsHandleQuizFailed($user_id, $quiz_id, $user_quiz_progress)
    {
        $flows = Flow::exists('MasterStudyLms', 5);
        if (!$flows) {
            return;
        }

        $userInfo = self::masterStudyLmsGetUserInfo($user_id);
        $quizDetails = self::masterStudyGetQuizDetails($quiz_id);

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedCourse = !empty($flowDetails->selectedCourse) ? $flowDetails->selectedCourse : [];
        $courseDetails = self::masterStudyGetCourseDetail($selectedCourse);

        $finalData = [
            'user_id'            => $user_id,
            'course_id'          => $selectedCourse,
            'course_title'       => $courseDetails[0]->post_title,
            'course_description' => $courseDetails[0]->post_content,
            'quiz_id'            => $quiz_id,
            'quiz_title'         => $quizDetails[0]->post_title,
            'quiz_description'   => $quizDetails[0]->post_content,
            'first_name'         => $userInfo['first_name'],
            'last_name'          => $userInfo['last_name'],
            'nickname'           => $userInfo['nickname'],
            'avatar_url'         => $userInfo['avatar_url'],
            'user_email'         => $userInfo['user_email'],
        ];

        $selectedQuiz = !empty($flowDetails->selectedQuiz) ? $flowDetails->selectedQuiz : [];

        if (($quiz_id == $selectedQuiz || $selectedQuiz === 'any')) {
            return ['triggered_entity' => 'MasterStudyLms', 'triggered_entity_id' => 5, 'data' => $finalData, 'flows' => $flows];
        }
    }

    // Memberpress

    public static function MemberpressGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'user_id'    => $user_id,
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function meprOneTimeMembershipSubscribe(MeprEvent $event)
    {
        $transaction = $event->get_data();
        $product = $transaction->product();
        $product_id = $product->ID;
        $user_id = absint($transaction->user()->ID);
        if ('lifetime' !== (string) $product->period_type) {
            return;
        }

        $postData = get_post($product_id);
        $userData = self::MemberpressGetUserInfo($user_id);
        $finalData = array_merge((array) $postData, $userData);

        if ($user_id && $flows = Flow::exists('Memberpress', 1)) {
            return ['triggered_entity' => 'Memberpress', 'triggered_entity_id' => 1, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function meprRecurringMembershipSubscribe(MeprEvent $event)
    {
        $transaction = $event->get_data();
        $product = $transaction->product();
        $product_id = $product->ID;
        $user_id = absint($transaction->user()->ID);
        if ('lifetime' === (string) $product->period_type) {
            return;
        }

        $postData = get_post($product_id);
        $userData = self::MemberpressGetUserInfo($user_id);
        $finalData = array_merge((array) $postData, $userData);

        if ($user_id && $flows = Flow::exists('Memberpress', 2)) {
            return ['triggered_entity' => 'Memberpress', 'triggered_entity_id' => 2, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function meprMembershipSubscribeCancel($old_status, $new_status, $subscription)
    {
        $old_status = (string) $old_status;
        $new_status = (string) $new_status;

        if ($old_status === $new_status && $new_status !== 'cancelled') {
            return;
        }

        $product_id = $subscription->rec->product_id;
        $user_id = \intval($subscription->rec->user_id);
        $userData = self::MemberpressGetUserInfo($user_id);
        $finalData = array_merge((array) $subscription->rec, $userData);

        $flows = Flow::exists('Memberpress', 3);
        if (!$flows) {
            return;
        }

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedCancelMembership = !empty($flowDetails->selectedCancelMembership) ? $flowDetails->selectedCancelMembership : [];

        if ($product_id === $selectedCancelMembership || $selectedCancelMembership === 'any') {
            return ['triggered_entity' => 'Memberpress', 'triggered_entity_id' => 3, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function meprMembershipSubscribeExpire($old_status, $new_status, $subscription)
    {
        $old_status = (string) $old_status;
        $new_statuss = (string) $new_status;

        if ($new_statuss !== 'suspended') {
            return;
        }
        $product_id = $subscription->rec->product_id;
        $user_id = \intval($subscription->rec->user_id);
        $userData = self::MemberpressGetUserInfo($user_id);
        $finalData = array_merge((array) $subscription->rec, $userData);

        $flows = Flow::exists('Memberpress', 5);
        if (!$flows) {
            return;
        }

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedRecurringMembership = !empty($flowDetails->selectedRecurringMembership) ? $flowDetails->selectedRecurringMembership : [];

        if ($product_id === $selectedRecurringMembership || $selectedRecurringMembership === 'any') {
            return ['triggered_entity' => 'Memberpress', 'triggered_entity_id' => 5, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function meprMembershipSubscribePaused(MeprEvent $event)
    {
        $transaction = $event->get_data();
        $product = $transaction->product();
        $product_id = $product->ID;
        $user_id = absint($transaction->user()->ID);

        $postData = get_post($product_id);
        $userData = self::MemberpressGetUserInfo($user_id);
        $finalData = array_merge((array) $postData, $userData);

        $flows = Flow::exists('Memberpress', 4);
        if (!$flows) {
            return;
        }

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedCancelMembership = !empty($flowDetails->selectedCancelMembership) ? $flowDetails->selectedCancelMembership : [];

        if ($product_id === $selectedCancelMembership || $selectedCancelMembership === 'any') {
            return ['triggered_entity' => 'Memberpress', 'triggered_entity_id' => 4, 'data' => $finalData, 'flows' => $flows];
        }
    }

    // metform

    public static function handleMetformProSubmit($form_setting, $form_data, $email_name)
    {
        self::handle_submit_data($form_data['id'], $form_data);
    }

    public static function handleMetformSubmit($form_id, $form_data, $form_settings)
    {
        self::handle_submit_data($form_id, $form_data);
    }

    public static function metaBoxFields($form_id)
    {
        if (\function_exists('rwmb_meta')) {
            $meta_box_registry = rwmb_get_registry('meta_box');
            $fileUploadTypes = ['file_upload', 'single_image', 'file'];
            $form = $meta_box_registry->get($form_id);
            $fieldDetails = $form->meta_box['fields'];
            $fields = [];
            foreach ($fieldDetails as $field) {
                if (!empty($field['id']) && $field['type'] !== 'submit') {
                    $fields[] = [
                        'name'  => $field['id'],
                        'type'  => \in_array($field['type'], $fileUploadTypes) ? 'file' : $field['type'],
                        'label' => $field['name'],
                    ];
                }
            }

            return $fields;
        }
    }

    public static function handleMetaboxSubmit($object)
    {
        $formId = $object->config['id'];
        $fields = self::metaBoxFields($formId);
        $postId = $object->post_id;
        $metaBoxFieldValues = [];

        foreach ($fields as $index => $field) {
            $fieldValues = rwmb_meta($field['name'], $args = [], $postId);
            if (isset($fieldValues)) {
                if ($field['type'] !== 'file') {
                    $metaBoxFieldValues[$field['name']] = $fieldValues;
                } elseif ($field['type'] === 'file') {
                    if (isset($fieldValues['path'])) {
                        $metaBoxFieldValues[$field['name']] = $fieldValues['path'];
                    } elseif (\gettype($fieldValues) === 'array') {
                        foreach (array_values($fieldValues) as $index => $file) {
                            if (isset($file['path'])) {
                                $metaBoxFieldValues[$field['name']][$index] = $file['path'];
                            }
                        }
                    }
                }
            }
        }

        $postFieldValues = (array) get_post($object->post_id);

        $data = array_merge($postFieldValues, $metaBoxFieldValues);

        if (!empty($formId) && $flows = Flow::exists('MetaBox', $formId)) {
            return ['triggered_entity' => 'MetaBox', 'triggered_entity_id' => $formId, 'data' => $data, 'flows' => $flows];
        }
    }

    public static function perchesMembershhipLevelByAdministator($level_id, $user_id, $cancel_level)
    {
        if ($level_id == 0) {
            return;
        }
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for PaidMembershipPro level details
        $levels = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->pmpro_membership_levels} WHERE id = %d", $level_id));
        $userData = self::paidMembershipProgetUserInfo($user_id);
        $finalData = array_merge($userData, (array) $levels[0]);
        $flows = Flow::exists('PaidMembershipPro', 1);
        if (!$flows) {
            return;
        }
        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedMembershipLevel = !empty($flowDetails->selectedMembershipLevel) ? $flowDetails->selectedMembershipLevel : [];
        if ($level_id === $selectedMembershipLevel || $selectedMembershipLevel === 'any') {
            return ['triggered_entity' => 'PaidMembershipPro', 'triggered_entity_id' => 1, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function paidMembershipProgetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'user_id'    => $user_id,
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function cancelMembershhipLevel($level_id, $user_id, $cancel_level)
    {
        if (0 !== absint($level_id)) {
            return;
        }
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $levels = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->pmpro_membership_levels} WHERE id = %d", $cancel_level));
        $userData = self::paidMembershipProgetUserInfo($user_id);
        $finalData = array_merge($userData, (array) $levels[0]);
        $flows = Flow::exists('PaidMembershipPro', 2);
        if (!$flows) {
            return;
        }
        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedMembershipLevel = !empty($flowDetails->selectedMembershipLevel) ? $flowDetails->selectedMembershipLevel : [];
        if (($cancel_level == $selectedMembershipLevel || $selectedMembershipLevel === 'any')) {
            return ['triggered_entity' => 'PaidMembershipPro', 'triggered_entity_id' => 2, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function perchesMembershipLevel($user_id, $morder)
    {
        $user = $morder->getUser();
        $membership = $morder->getMembershipLevel();
        $user_id = $user->ID;
        $membership_id = $membership->id;

        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $levels = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->pmpro_membership_levels} WHERE id = %d", $membership_id));
        $userData = self::paidMembershipProgetUserInfo($user_id);
        $finalData = array_merge($userData, (array) $levels[0]);
        $flows = Flow::exists('PaidMembershipPro', 3);
        if (!$flows) {
            return;
        }
        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedMembershipLevel = !empty($flowDetails->selectedMembershipLevel) ? $flowDetails->selectedMembershipLevel : [];
        if (($membership_id == $selectedMembershipLevel || $selectedMembershipLevel === 'any')) {
            return ['triggered_entity' => 'PaidMembershipPro', 'triggered_entity_id' => 3, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function expiryMembershipLevel($user_id, $membership_id)
    {
        global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $levels = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->pmpro_membership_levels} WHERE id = %d", $membership_id));
        $userData = self::paidMembershipProgetUserInfo($user_id);
        $finalData = array_merge($userData, (array) $levels[0]);
        $flows = Flow::exists('PaidMembershipPro', 4);
        if (!$flows) {
            return;
        }
        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedMembershipLevel = !empty($flowDetails->selectedMembershipLevel) ? $flowDetails->selectedMembershipLevel : [];
        if (($membership_id == $selectedMembershipLevel || $selectedMembershipLevel === 'any')) {
            return ['triggered_entity' => 'PaidMembershipPro', 'triggered_entity_id' => 4, 'data' => $finalData, 'flows' => $flows];
        }
    }

    // PiotnetAddon all functions
    public static function handlePiotnetAddonSubmit($form_submission)
    {
        $form_id = $form_submission['form']['id'];

        $flows = Flow::exists('PiotnetAddon', $form_id);
        if (!$flows) {
            return;
        }

        $data = [];
        $fields = $form_submission['fields'];
        foreach ($fields as $key => $field) {
            $data[$key] = $field['value'];
        }

        return ['triggered_entity' => 'PiotnetAddon', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    // PiotnetAddonForm all functions
    public static function handlePiotnetAddonFormSubmit($form_submission)
    {
        $form_id = $form_submission['form']['id'];

        $flows = Flow::exists('PiotnetAddonForm', $form_id);
        if (!$flows) {
            return;
        }

        $data = [];
        $fields = $form_submission['fields'];
        foreach ($fields as $key => $field) {
            $data[$key] = $field['value'];
        }

        return ['triggered_entity' => 'PiotnetAddonForm', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    // PiotnetForms all functions
    public static function handlePiotnetSubmit($fields)
    {
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Third-party form submission
        if (empty($_REQUEST['post_id'])) {
            return;
        }

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Third-party form submission
        $post_id = sanitize_text_field(
            wp_unslash($_REQUEST['post_id']) // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        );

        $flows = Flow::exists('PiotnetForms', $post_id);
        if (!$flows) {
            return;
        }

        $data = [];
        foreach ($fields as $field) {
            if ((key_exists('type', $field) && ($field['type'] == 'file' || $field['type'] == 'signature')) || (key_exists('image_upload', $field) && $field['image_upload'] > 0)) {
                $field['value'] = Common::filePath($field['value']);
            }
            $data[$field['name']] = $field['value'];
        }

        return ['triggered_entity' => 'PiotnetAddonForm', 'triggered_entity_id' => $post_id, 'data' => $data, 'flows' => $flows];
    }

    // Wp Post All Functions

    public static function createPost($postId, $newPostData, $update, $beforePostData)
    {
        if ('publish' !== $newPostData->post_status || 'revision' === $newPostData->post_type || (!empty($beforePostData->post_status) && 'publish' === $beforePostData->post_status)) {
            return false;
        }

        $postCreateFlow = Flow::exists('Post', 1);

        if ($postCreateFlow) {
            $flowDetails = $postCreateFlow[0]->flow_details;

            if (\is_string($postCreateFlow[0]->flow_details)) {
                $flowDetails = json_decode($postCreateFlow[0]->flow_details);
            }

            if (isset($newPostData->post_content)) {
                $newPostData->post_content = trim(wp_strip_all_tags($newPostData->post_content));
                $newPostData->post_permalink = get_permalink($newPostData);
            }

            if (isset($flowDetails->selectedPostType) && ($flowDetails->selectedPostType == 'any-post-type' || $flowDetails->selectedPostType == $newPostData->post_type)) {
                if (has_post_thumbnail($postId)) {
                    $featured_image_url = get_the_post_thumbnail_url($postId, 'full');
                    $newPostData->featured_image = $featured_image_url;
                }
                if (!$update) {
                    Flow::execute('Post', 1, (array) $newPostData, $postCreateFlow);
                } else {
                    Flow::execute('Post', 1, (array) $newPostData, $postCreateFlow);
                }
            }
        }
    }

    public static function postComment($cmntId, $status, $cmntData)
    {
        $cmntTrigger = Flow::exists('Post', 5);

        if ($cmntTrigger) {
            $flowDetails = $cmntTrigger[0]->flow_details;

            if (\is_string($cmntTrigger[0]->flow_details)) {
                $flowDetails = json_decode($cmntTrigger[0]->flow_details);
            }

            if (isset($flowDetails->selectedPostId) && $flowDetails->selectedPostId == 'any-post' || $flowDetails->selectedPostId == $cmntData['comment_post_ID']) {
                $cmntData['comment_id'] = $cmntId;

                Flow::execute('Post', 5, (array) $cmntData, $cmntTrigger);
            }
        }
    }

    public static function deletePost($postId, $deletedPost)
    {
        $postDeleteTrigger = Flow::exists('Post', 3);

        if ($postDeleteTrigger) {
            $flowDetails = $postDeleteTrigger[0]->flow_details;

            if (\is_string($postDeleteTrigger[0]->flow_details)) {
                $flowDetails = json_decode($postDeleteTrigger[0]->flow_details);
            }

            if (isset($deletedPost->post_content)) {
                $deletedPost->post_content = trim(wp_strip_all_tags($deletedPost->post_content));
                $deletedPost->post_permalink = get_permalink($deletedPost);
            }

            if (isset($flowDetails->selectedPostType) && $flowDetails->selectedPostType == 'any-post-type' || $flowDetails->selectedPostType == $deletedPost->post_type) {
                Flow::execute('Post', 5, (array) $deletedPost, $postDeleteTrigger);
            }
        }
    }

    public static function viewPost($content)
    {
        $postViewTrigger = Flow::exists('Post', 4);

        if (is_single() && !empty($GLOBALS['post'])) {
            if (isset($postViewTrigger[0]->selectedPostId) && $postViewTrigger[0]->selectedPostId == 'any-post' || $GLOBALS['post']->ID == get_the_ID()) {
                Flow::execute('Post', 5, (array) $GLOBALS['post'], $postViewTrigger);
            }
        }

        return ['content' => $content];
    }

    public static function postUpdated($postId, $updatedPostData)
    {
        $postUpdateFlow = Flow::exists('Post', 2);
        if ($postUpdateFlow) {
            $flowDetails = $postUpdateFlow[0]->flow_details;
            if (\is_string($postUpdateFlow[0]->flow_details)) {
                $flowDetails = json_decode($postUpdateFlow[0]->flow_details);
            }
            if (isset($updatedPostData->post_content)) {
                $updatedPostData->post_content = trim(wp_strip_all_tags($updatedPostData->post_content));
                $updatedPostData->post_permalink = get_permalink($updatedPostData);
            }

            if (isset($flowDetails->selectedPostType) && $flowDetails->selectedPostType == 'any-post-type' || $flowDetails->selectedPostType == $updatedPostData->post_type) {
                if (has_post_thumbnail($postId)) {
                    $featured_image_url = get_the_post_thumbnail_url($postId, 'full');
                    $updatedPostData->featured_image = $featured_image_url;
                }
                Flow::execute('Post', 2, (array) $updatedPostData, $postUpdateFlow);
            }
        }
    }

    public static function changePostStatus($newStatus, $oldStatus, $post)
    {
        $statusChangeTrigger = Flow::exists('Post', 6);

        if ($statusChangeTrigger) {
            $flowDetails = $statusChangeTrigger[0]->flow_details;

            if (\is_string($statusChangeTrigger[0]->flow_details)) {
                $flowDetails = json_decode($statusChangeTrigger[0]->flow_details);
            }

            if (isset($post->post_content)) {
                $post->post_content = trim(wp_strip_all_tags($post->post_content));
                $post->post_permalink = get_permalink($post);
            }
            if (has_post_thumbnail($post->id)) {
                $post->featured_image = get_the_post_thumbnail_url($post->id, 'full');
            }

            if (isset($flowDetails->selectedPostType) && $flowDetails->selectedPostType == 'any-post-type' || $flowDetails->selectedPostType == $post->post_type && $newStatus != $oldStatus) {
                Flow::execute('Post', 6, (array) $post, $statusChangeTrigger);
            }
        }
    }

    public static function trashComment($cmntId, $cmntData)
    {
        $cmntTrigger = Flow::exists('Post', 7);
        if ($cmntTrigger) {
            $flowDetails = $cmntTrigger[0]->flow_details;

            if (\is_string($cmntTrigger[0]->flow_details)) {
                $flowDetails = json_decode($cmntTrigger[0]->flow_details);
            }

            $cmntData = (array) $cmntData;
            if (isset($flowDetails->selectedPostId) && $flowDetails->selectedPostId == 'any-post' || $flowDetails->selectedPostId == $cmntData['comment_post_ID']) {
                $cmntData['comment_id'] = $cmntId;
                Flow::execute('Post', 7, (array) $cmntData, $cmntTrigger);
            }
        }
    }

    public static function updateComment($cmntId, $cmntData)
    {
        $cmntTrigger = Flow::exists('Post', 8);
        if ($cmntTrigger) {
            $flowDetails = $cmntTrigger[0]->flow_details;

            if (\is_string($cmntTrigger[0]->flow_details)) {
                $flowDetails = json_decode($cmntTrigger[0]->flow_details);
            }

            $cmntData = (array) $cmntData;
            if (isset($flowDetails->selectedPostId) && $flowDetails->selectedPostId == 'any-post' || $flowDetails->selectedPostId == $cmntData['comment_post_ID']) {
                $cmntData['comment_id'] = $cmntId;
                Flow::execute('Post', 8, (array) $cmntData, $cmntTrigger);
            }
        }
    }

    public static function trashPost($trashPostId)
    {
        $postUpdateFlow = Flow::exists('Post', 9);
        $postData = get_post($trashPostId);
        $postData->post_permalink = get_permalink($postData);

        if ($postUpdateFlow) {
            $flowDetails = $postUpdateFlow[0]->flow_details;

            if (\is_string($postUpdateFlow[0]->flow_details)) {
                $flowDetails = json_decode($postUpdateFlow[0]->flow_details);
            }
            $postData = (array) $postData;
            if (isset($flowDetails->selectedPostType) && $flowDetails->selectedPostType == 'any-post-type' || $flowDetails->selectedPostType == $postData['ID']) {
                Flow::execute('Post', 9, (array) $postData, $postUpdateFlow);
            }
        }
    }

    // Wp Registration All Functions

    public static function userCreate()
    {
        $newUserData = \func_get_args()[1];

        $userCreateFlow = Flow::exists('Registration', 1);

        if ($userCreateFlow) {
            Flow::execute('Registration', 1, $newUserData, $userCreateFlow);
        }
    }

    public static function profileUpdate()
    {
        $userdata = \func_get_args()[2];

        $userUpdateFlow = Flow::exists('Registration', 2);

        if ($userUpdateFlow) {
            Flow::execute('Registration', 2, $userdata, $userUpdateFlow);
        }
    }

    public static function wpLogin($userId, $data)
    {
        $userLoginFlow = Flow::exists('Registration', 3);

        if ($userLoginFlow) {
            $user = [];

            if (isset($data->data)) {
                $user['user_id'] = $userId;
                $user['user_login'] = $data->data->user_login;
                $user['user_email'] = $data->data->user_email;
                $user['user_url'] = $data->data->user_url;
                $user['nickname'] = $data->data->user_nicename;
                $user['display_name'] = $data->data->display_name;
            }
            Flow::execute('Registration', 3, $user, $userLoginFlow);
        }
    }

    public static function wpResetPassword($data)
    {
        $userResetPassFlow = Flow::exists('Registration', 4);

        if ($userResetPassFlow) {
            $user = [];
            if (isset($data->data)) {
                $user['user_id'] = $data->data->ID;
                $user['user_login'] = $data->data->user_login;
                $user['user_email'] = $data->data->user_email;
                $user['user_url'] = $data->data->user_url;
                $user['nickname'] = $data->data->user_nicename;
                $user['display_name'] = $data->data->display_name;
            }

            Flow::execute('Registration', 4, $user, $userResetPassFlow);
        }
    }

    public static function wpUserDeleted()
    {
        $data = \func_get_args()[2];

        $userDeleteFlow = Flow::exists('Registration', 5);

        if ($userDeleteFlow) {
            $user = [];
            if (isset($data->data)) {
                $user['user_id'] = $data->data->ID;
                $user['user_login'] = $data->data->user_login;
                $user['user_email'] = $data->data->user_email;
                $user['user_url'] = $data->data->user_url;
                $user['nickname'] = $data->data->user_nicename;
                $user['display_name'] = $data->data->display_name;
            }

            Flow::execute('Registration', 5, $user, $userDeleteFlow);
        }
    }

    // RestrictContent all functions
    public static function rcpPurchasesMembershipLevel($membership_id, RCP_Membership $RCP_Membership)
    {
        $flows = Flow::exists('RestrictContent', 1);
        if (!$flows) {
            return;
        }
        $user_id = $RCP_Membership->get_user_id();

        if (!$user_id) {
            return;
        }
        $level_id = $RCP_Membership->get_object_id();

        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }

        if ($level_id == $flowDetails->selectedMembership || 'any' == $flowDetails->selectedMembership) {
            $organizedData = [];
            if ($membership_id) {
                $membership = rcp_get_membership($membership_id);
                if (false !== $membership) {
                    $organizedData = [
                        'membership_level'             => $membership->get_membership_level_name(),
                        'membership_payment'           => $membership->get_initial_amount(),
                        'membership_recurring_payment' => $membership->get_recurring_amount(),
                    ];
                }
            }

            return ['triggered_entity' => 'RestrictContent', 'triggered_entity_id' => 1, 'data' => $organizedData, 'flows' => $flows];
        }
    }

    public static function rcpMembershipStatusExpired($old_status, $membership_id)
    {
        $flows = Flow::exists('RestrictContent', 2);
        if (!$flows) {
            return;
        }
        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }
        $membership = rcp_get_membership($membership_id);
        $membership_level = rcp_get_membership_level($membership->get_object_id());
        $level_id = (string) $membership_level->get_id();

        if ($level_id == $flowDetails->selectedMembership || 'any' == $flowDetails->selectedMembership) {
            $organizedData = [];

            if ($membership_id) {
                $membership = rcp_get_membership($membership_id);

                if (false !== $membership) {
                    $organizedData = [
                        'membership_level'             => $membership->get_membership_level_name(),
                        'membership_payment'           => $membership->get_initial_amount(),
                        'membership_recurring_payment' => $membership->get_recurring_amount(),
                    ];
                }
            }

            return ['triggered_entity' => 'RestrictContent', 'triggered_entity_id' => 2, 'data' => $organizedData, 'flows' => $flows];
        }
    }

    public static function rcpMembershipStatusCancelled($old_status, $membership_id)
    {
        $flows = Flow::exists('RestrictContent', 3);
        if (!$flows) {
            return;
        }

        $organizedData = [];
        $membership = rcp_get_membership($membership_id);
        $membership_level = rcp_get_membership_level($membership->get_object_id());
        $level_id = $membership_level->get_id();

        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
                $flowDetails = $flow->flow_details;
            }
        }

        if ($level_id == $flowDetails->selectedMembership || 'any' == $flowDetails->selectedMembership) {
            if ($membership_id) {
                $membership = rcp_get_membership($membership_id);

                if (false !== $membership) {
                    $organizedData = [
                        'membership_level'             => $membership->get_membership_level_name(),
                        'membership_payment'           => $membership->get_initial_amount(),
                        'membership_recurring_payment' => $membership->get_recurring_amount(),
                    ];
                }
            }

            return ['triggered_entity' => 'RestrictContent', 'triggered_entity_id' => 3, 'data' => $organizedData, 'flows' => $flows];
        }
    }

    // SliceWp all functions
    public static function newAffiliateCreated($affiliate_id, $affiliate_data)
    {
        $userData = self::sliceWpgetUserInfo($affiliate_data['user_id']);
        $finalData = $affiliate_data + $userData + ['affiliate_id' => $affiliate_id];

        $flows = Flow::exists('SliceWp', 1);
        if (!$flows) {
            return;
        }

        if (!$affiliate_data['user_id'] || !$flows) {
            return;
        }

        return ['triggered_entity' => 'SliceWp', 'triggered_entity_id' => 1, 'data' => $finalData, 'flows' => $flows];
    }

    public static function userEarnCommission($commission_id, $commission_data)
    {
        $finalData = $commission_data + ['commission_id' => $commission_id];
        $flows = Flow::exists('SliceWp', 2);
        if (!$flows) {
            return;
        }
        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedCommissionType = !empty($flowDetails->selectedCommissionType) ? $flowDetails->selectedCommissionType : [];

        if (($commission_data['type'] == $selectedCommissionType || $selectedCommissionType === 'any')) {
            return ['triggered_entity' => 'SliceWp', 'triggered_entity_id' => 2, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function sliceWpgetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'user_id'    => $user_id,
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    // NewSolidAffiliate all functions
    public static function newSolidAffiliateCreated($affiliate)
    {
        $attributes = $affiliate->__get('attributes');

        $flows = Flow::exists('SolidAffiliate', 1);
        if (!$flows) {
            return;
        }

        return ['triggered_entity' => 'SolidAffiliate', 'triggered_entity_id' => 1, 'data' => $attributes, 'flows' => $flows];
    }

    public static function newSolidAffiliateReferralCreated($referral_accepted)
    {
        $affiliateReferralData = $referral_accepted->__get('attributes');
        $flows = Flow::exists('SolidAffiliate', 2);
        if (!$flows) {
            return;
        }

        return ['triggered_entity' => 'SolidAffiliate', 'triggered_entity_id' => 2, 'data' => $affiliateReferralData, 'flows' => $flows];
    }

    // Spectra all functions
    public static function spectraHandler(...$args)
    {
        if (Config::getOption('test_uagb_form_success') !== false) {
            Config::updateOption('test_uagb_form_success', $args);
        }

        if ($flows = Flow::exists('Spectra', current_action())) {
            foreach ($flows as $flow) {
                $flowDetails = json_decode($flow->flow_details);
                if (!isset($flowDetails->primaryKey)) {
                    continue;
                }

                $primaryKeyValue = self::extractValueFromPath($args, $flowDetails->primaryKey->key);
                if ($flowDetails->primaryKey->value === $primaryKeyValue) {
                    $fieldKeys = [];
                    $formatedData = [];

                    if ($flowDetails->body->data && \is_array($flowDetails->body->data)) {
                        $fieldKeys = array_map(function ($field) use ($args) {
                            return $field->key;
                        }, $flowDetails->body->data);
                    } elseif (isset($flowDetails->field_map) && \is_array($flowDetails->field_map)) {
                        $fieldKeys = array_map(function ($field) use ($args) {
                            return $field->formField;
                        }, $flowDetails->field_map);
                    }

                    foreach ($fieldKeys as $key) {
                        $formatedData[$key] = self::extractValueFromPath($args, $key);
                    }

                    return ['triggered_entity' => 'Spectra', 'triggered_entity_id' => current_action(), 'data' => $formatedData, 'flows' => [$flow]];
                }
            }
        }

        return rest_ensure_response(['status' => 'success']);
    }

    public static function studiocartNewOrderCreated($status, $order_data, $order_type = 'main')
    {
        $studiocartActions = [
            'newOrderCreated' => [
                'id'    => 2,
                'title' => 'New Order Created'
            ],
        ];

        $flows = Flow::exists('StudioCart', $studiocartActions['newOrderCreated']['id']);

        if (!$flows) {
            return;
        }

        $data = [];
        foreach ($order_data as $key => $field_value) {
            $data[$key] = $field_value;
        }

        return ['triggered_entity' => 'StudioCart', 'triggered_entity_id' => $studiocartActions['newOrderCreated']['id'], 'data' => $data, 'flows' => $flows];
    }

    public static function surecartPurchaseProduct($data)
    {
        if (!self::surecartPluginActive()) {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated.', 'bit-integrations'), 'SureCart'));
        }
        $accountDetails = \SureCart\Models\Account::find();
        $product = \SureCart\Models\Product::find($data['product_id']);
        $finalData = self::SureCartDataProcess($data, $product, $accountDetails);
        $flows = Flow::exists('SureCart', 1);

        if (!$flows) {
            return;
        }
        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedProduct = !empty($flowDetails->selectedProduct) ? $flowDetails->selectedProduct : [];

        if ($flows && ($data['product_id'] == $selectedProduct || $selectedProduct === 'any')) {
            return ['triggered_entity' => 'SureCart', 'triggered_entity_id' => 1, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function SureCartDataProcess($data, $product, $accountDetails)
    {
        $purchaseFinalData = self::surecartPurchaseDataProcess($data['id']);

        return [
            'store_name'          => $accountDetails['name'],
            'store_url'           => $accountDetails['url'],
            'product_name'        => $product['name'],
            'product_id'          => $product['id'],
            'product_description' => $product['description'],
            'product_thumb_id'    => $purchaseFinalData['product_thumb_id'],
            'product_thumb'       => $purchaseFinalData['product_thumb'],
            'product_price'       => $product->price,
            'product_price_id'    => $purchaseFinalData['product_price_id'],
            'product_quantity'    => $data['quantity'],
            'max_price_amount'    => $product['metrics']->max_price_amount,
            'min_price_amount'    => $product['metrics']->min_price_amount,
            'order_id'            => $purchaseFinalData['order_id'],
            'order_paid_amount'   => $data['order_paid_amount'],
            'payment_currency'    => $accountDetails['currency'],
            'payment_method'      => $purchaseFinalData['payment_method'],
            'customer_id'         => $data['customer_id'],
            'subscriptions_id'    => $purchaseFinalData['subscriptions_id'],
            'order_number'        => $purchaseFinalData['order_number'],
            'order_date'          => $purchaseFinalData['order_date'],
            'order_status'        => $purchaseFinalData['order_status'],
            'order_paid_amount'   => $purchaseFinalData['order_paid_amount'],
            'order_subtotal'      => $purchaseFinalData['order_subtotal'],
            'order_total'         => $purchaseFinalData['order_total'],

        ];
    }

    public static function surecartPurchaseDataProcess($id)
    {
        $purchase_data = self::surecartPurchaseDetails($id);
        $price = self::surecartGetPrice($purchase_data);
        $chekout = $purchase_data->initial_order->checkout;

        return [
            'product'           => $purchase_data->product->name,
            'product_id'        => $purchase_data->product->id,
            'product_thumb_id'  => isset($purchase_data->product->image) ? $purchase_data->product->image : '',
            'product_thumb'     => isset($purchase_data->product->image_url) ? $purchase_data->product->image_url : '',
            'product_price_id'  => isset($price->id) ? $price->id : '',
            'order_id'          => $purchase_data->initial_order->id,
            'subscription_id'   => isset($purchase_data->subscription->id) ? $purchase_data->subscription->id : '',
            'order_number'      => $purchase_data->initial_order->number,
            'order_date'        => gmdate(get_option('date_format', 'F j, Y'), $purchase_data->initial_order->created_at),
            'order_status'      => $purchase_data->initial_order->status,
            'order_paid_amount' => self::surecartFormatAmount($chekout->charge->amount),
            'order_subtotal'    => self::surecartFormatAmount($chekout->subtotal_amount),
            'order_total'       => self::surecartFormatAmount($chekout->total_amount),
            'payment_method'    => isset($chekout->payment_method->processor_type) ? $chekout->payment_method->processor_type : '',
        ];
    }

    public static function surecartPurchaseDetails($id)
    {
        return \SureCart\Models\Purchase::with(['initial_order', 'order.checkout', 'checkout.shipping_address', 'checkout.payment_method', 'checkout.discount', 'discount.coupon', 'checkout.charge', 'product', 'product.downloads', 'download.media', 'license.activations', 'line_items', 'line_item.price', 'subscription'])->find($id);
    }

    public static function surecartGetPrice($purchase_data)
    {
        if (empty($purchase_data->line_items->data[0])) {
            return;
        }

        $line_item = $purchase_data->line_items->data[0];

        return $line_item->price;
    }

    public static function surecartFormatAmount($amount)
    {
        return $amount / 100;
    }

    public static function surecartPluginActive($option = null)
    {
        if (is_plugin_active('surecart/surecart.php')) {
            return $option === 'get_name' ? 'surecart/surecart.php' : true;
        }

        return false;
    }

    public static function surecartPurchaseRevoked($data)
    {
        $accountDetails = \SureCart\Models\Account::find();
        $finalData = [
            'store_name'          => $accountDetails['name'],
            'store_url'           => $accountDetails['url'],
            'purchase_id'         => $data->id,
            'revoke_date'         => $data->revoked_at,
            'customer_id'         => $data->customer,
            'product_id'          => $data->product->id,
            'product_description' => $data->product->description,
            'product_name'        => $data->product->name,
            'product_image_id'    => $data->product->image,
            'product_price'       => ($data->product->prices->data[0]->full_amount) / 100,
            'product_currency'    => $data->product->prices->data[0]->currency,

        ];

        $flows = Flow::exists('SureCart', 2);

        if (!$flows) {
            return;
        }

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedProduct = !empty($flowDetails->selectedProduct) ? $flowDetails->selectedProduct : [];

        if ($flows && ($data->product->id == $selectedProduct || $selectedProduct === 'any')) {
            return ['triggered_entity' => 'SureCart', 'triggered_entity_id' => 2, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function surecartPurchaseUnrevoked($data)
    {
        $accountDetails = \SureCart\Models\Account::find();
        $finalData = [
            'store_name'          => $accountDetails['name'],
            'store_url'           => $accountDetails['url'],
            'purchase_id'         => $data->id,
            'revoke_date'         => $data->revoked_at,
            'customer_id'         => $data->customer,
            'product_id'          => $data->product->id,
            'product_description' => $data->product->description,
            'product_name'        => $data->product->name,
            'product_image_id'    => $data->product->image,
            'product_price'       => ($data->product->prices->data[0]->full_amount) / 100,
            'product_currency'    => $data->product->prices->data[0]->currency,
        ];

        $flows = Flow::exists('SureCart', 3);

        if (!$flows) {
            return;
        }

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedProduct = !empty($flowDetails->selectedProduct) ? $flowDetails->selectedProduct : [];

        if ($flows && ($data->product->id == $selectedProduct || $selectedProduct === 'any')) {
            return ['triggered_entity' => 'SureCart', 'triggered_entity_id' => 3, 'data' => $finalData, 'flows' => $flows];
        }
    }

    // main function was empty in the orginal file
    public static function handleThemifySubmit()
    {
    }

    public static function thriveApprenticeHandleCourseComplete($course_details, $user_details)
    {
        $flows = Flow::exists('ThriveApprentice', 1);
        if (!$flows) {
            return;
        }

        $userInfo = self::thriveApprenticeGetUserInfo($user_details['user_id']);

        $finalData = [
            'user_id'      => $user_details['user_id'],
            'course_id'    => $course_details['course_id'],
            'course_title' => $course_details['course_title'],
            'first_name'   => $userInfo['first_name'],
            'last_name'    => $userInfo['last_name'],
            'nickname'     => $userInfo['nickname'],
            'avatar_url'   => $userInfo['avatar_url'],
            'user_email'   => $userInfo['user_email'],
        ];

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedCourse = !empty($flowDetails->selectedCourse) ? $flowDetails->selectedCourse : [];

        if ($course_details['course_id'] == $selectedCourse || $selectedCourse === 'any') {
            return ['triggered_entity' => 'ThriveApprentice', 'triggered_entity_id' => 1, 'data' => $finalData, 'flows' => $flows];
        }
    }

    // main function was unavailable in the orginal file
    public static function thriveApprenticeHandleLessonComplete()
    {
    }

    public static function thriveApprenticeHandleModuleComplete($module_details, $user_details)
    {
        $flows = Flow::exists('ThriveApprentice', 3);
        if (!$flows) {
            return;
        }

        $userInfo = self::thriveApprenticeGetUserInfo($user_details['user_id']);

        $finalData = [
            'user_id'      => $user_details['user_id'],
            'module_id'    => $module_details['module_id'],
            'module_title' => $module_details['module_title'],
            'first_name'   => $userInfo['first_name'],
            'last_name'    => $userInfo['last_name'],
            'nickname'     => $userInfo['nickname'],
            'avatar_url'   => $userInfo['avatar_url'],
            'user_email'   => $userInfo['user_email'],
        ];

        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedModule = !empty($flowDetails->selectedModule) ? $flowDetails->selectedModule : [];

        if ($module_details['module_id'] == $selectedModule || $selectedModule === 'any') {
            return ['triggered_entity' => 'ThriveApprentice', 'triggered_entity_id' => 3, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function thriveApprenticeGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function TutorLmsHandleCourseEnroll($course_id, $enrollment_id)
    {
        $flows = Flow::exists('TutorLms', 1);
        $flows = self::TutorLmsFlowFilter($flows, 'selectedCourse', $course_id);
        if (!$flows) {
            return;
        }

        $author_id = get_post_field('post_author', $course_id);
        $author_name = get_the_author_meta('display_name', $author_id);
        $student_id = get_post_field('post_author', $enrollment_id);
        $userData = get_userdata($student_id);
        $result_student = [];

        if ($student_id && $userData) {
            $result_student = [
                'student_id'         => $student_id,
                'student_name'       => $userData->display_name,
                'student_first_name' => $userData->user_firstname,
                'student_last_name'  => $userData->user_lastname,
                'student_email'      => $userData->user_email,
            ];
        }

        $result_course = [];
        $course = get_post($course_id);
        $result_course = [
            'course_id'     => $course->ID,
            'course_title'  => $course->post_title,
            'course_author' => $author_name,
        ];
        $result = $result_student + $result_course;

        $courseInfo = get_post_meta($course_id);
        $course_temp = [];
        foreach ($courseInfo as $key => $val) {
            if (\is_array($val)) {
                $val = maybe_unserialize($val[0]);
            }
            $course_temp[$key] = $val;
        }

        $result = $result + $course_temp;
        $result['post_id'] = $enrollment_id;

        return ['triggered_entity' => 'TutorLms', 'triggered_entity_id' => 1, 'data' => $result, 'flows' => $flows];
    }

    public static function TutorLmsHandleQuizAttempt($attempt_id)
    {
        $flows = Flow::exists('TutorLms', 2);

        $attempt = tutor_utils()->get_attempt($attempt_id);

        $quiz_id = $attempt->quiz_id;

        $flows = self::TutorLmsFlowFilter($flows, 'selectedQuiz', $quiz_id);
        if (!$flows) {
            return;
        }

        if ('tutor_quiz' !== get_post_type($quiz_id)) {
            return;
        }

        if ('attempt_ended' !== $attempt->attempt_status) {
            return;
        }

        $attempt_details = [];
        $attempt_info = [];

        foreach ($attempt as $key => $val) {
            if (\is_array($val)) {
                $val = maybe_unserialize($val[0]);
            }
            $attempt_details[$key] = maybe_unserialize($val);
        }

        if (\array_key_exists('attempt_info', $attempt_details)) {
            $attempt_info_tmp = $attempt_details['attempt_info'];
            unset($attempt_details['attempt_info']);

            foreach ($attempt_info_tmp as $key => $val) {
                $attempt_info[$key] = maybe_unserialize($val);
            }

            $attempt_details['passing_grade'] = $attempt_info['passing_grade'];
            $totalMark = $attempt_details['total_marks'];
            $earnMark = $attempt_details['earned_marks'];
            $passGrade = $attempt_details['passing_grade'];
            $mark = $totalMark * ($passGrade / 100);

            if ($earnMark >= $mark) {
                $attempt_details['result_status'] = 'Passed';
            } else {
                $attempt_details['result_status'] = 'Failed';
            }
        }

        $attempt_details['post_id'] = $attempt_id;

        return ['triggered_entity' => 'TutorLms', 'triggered_entity_id' => 2, 'data' => $attempt_details, 'flows' => $flows];
    }

    public static function TutorLmsHandleLessonComplete($lesson_id)
    {
        $flows = Flow::exists('TutorLms', 3);
        $flows = self::TutorLmsFlowFilter($flows, 'selectedLesson', $lesson_id);

        if (!$flows) {
            return;
        }
        $lessonPost = get_post($lesson_id);

        $lessonData = [];
        $lessonData = [
            'lesson_id'          => $lessonPost->ID,
            'lesson_title'       => $lessonPost->post_title,
            'lesson_description' => $lessonPost->post_content,
            'lesson_url'         => $lessonPost->guid,
        ];

        $user = self::TutorLmsGetUserInfo(get_current_user_id());
        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $courseData = [];
        $topicPost = get_post($lessonPost->post_parent);
        $topicData = [
            'topic_id'          => $topicPost->ID,
            'topic_title'       => $topicPost->post_title,
            'topic_description' => $topicPost->post_content,
            'topic_url'         => $topicPost->guid,
        ];
        $coursePost = get_post($topicPost->post_parent);
        $courseData = [
            'course_id'          => $coursePost->ID,
            'course_name'        => $coursePost->post_title,
            'course_description' => $coursePost->post_content,
            'course_url'         => $coursePost->guid,
        ];

        $lessonDataFinal = $lessonData + $topicData + $courseData + $current_user;
        $lessonDataFinal['post_id'] = $lesson_id;

        return ['triggered_entity' => 'TutorLms', 'triggered_entity_id' => 3, 'data' => $lessonDataFinal, 'flows' => $flows];
    }

    public static function TutorLmsHandleCourseComplete($course_id)
    {
        $flows = Flow::exists('TutorLms', 4);
        $flows = self::TutorLmsFlowFilter($flows, 'selectedCourse', $course_id);

        if (!$flows) {
            return;
        }

        $coursePost = get_post($course_id);

        $courseData = [];
        $courseData = [
            'course_id'    => $coursePost->ID,
            'course_title' => $coursePost->post_title,
            'course_url'   => $coursePost->guid,
        ];

        $user = self::TutorLmsGetUserInfo(get_current_user_id());
        $current_user = [
            'first_name' => $user['first_name'],
            'last_name'  => $user['last_name'],
            'user_email' => $user['user_email'],
            'nickname'   => $user['nickname'],
            'avatar_url' => $user['avatar_url'],
        ];

        $courseDataFinal = $courseData + $current_user;
        $courseDataFinal['post_id'] = $course_id;

        return ['triggered_entity' => 'TutorLms', 'triggered_entity_id' => 4, 'data' => $courseDataFinal, 'flows' => $flows];
    }

    public static function TutorLmsHandleQuizTarget($attempt_id)
    {
        $flows = Flow::exists('TutorLms', 5);

        $attempt = tutor_utils()->get_attempt($attempt_id);

        $quiz_id = $attempt->quiz_id;

        $flows = self::TutorLmsFlowFilter($flows, 'selectedQuiz', $quiz_id);
        if (!$flows) {
            return;
        }

        if ('tutor_quiz' !== get_post_type($quiz_id)) {
            return;
        }

        if ('attempt_ended' !== $attempt->attempt_status) {
            return;
        }

        $attempt_details = [];
        $attempt_info = [];

        foreach ($attempt as $key => $val) {
            if (\is_array($val)) {
                $val = maybe_unserialize($val[0]);
            }
            $attempt_details[$key] = maybe_unserialize($val);
        }

        if (\array_key_exists('attempt_info', $attempt_details)) {
            $attempt_info_tmp = $attempt_details['attempt_info'];
            unset($attempt_details['attempt_info']);

            foreach ($attempt_info_tmp as $key => $val) {
                $attempt_info[$key] = maybe_unserialize($val);
            }

            $attempt_details['passing_grade'] = $attempt_info['passing_grade'];
            $totalMark = $attempt_details['total_marks'];
            $earnMark = $attempt_details['earned_marks'];
            $passGrade = $attempt_details['passing_grade'];
            $mark = $totalMark * ($passGrade / 100);

            if ($earnMark >= $mark) {
                $attempt_details['result_status'] = 'Passed';
            } else {
                $attempt_details['result_status'] = 'Failed';
            }

            foreach ($flows as $flow) {
                $flow_details = $flow->flow_details;
                $reqPercent = $flow_details->requiredPercent;
                $mark = $totalMark * ($reqPercent / 100);
                $condition = $flow_details->selectedCondition;
                $achived = self::TutorLmsCheckedAchived($condition, $mark, $earnMark);
                $attempt_details['achived_status'] = $achived;

                $attempt_details['post_id'] = $attempt_id;

                Flow::execute('TutorLms', 5, $attempt_details, [$flow]);
            }
        }
    }

    public static function TutorLmsGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function TutorLmsCheckedAchived($condition, $mark, $earnMark)
    {
        $res = 'Not Achived';

        if ($condition === 'equal_to') {
            if ($earnMark == $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'not_equal_to') {
            if ($earnMark != $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'less_than') {
            if ($earnMark < $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'greater_than') {
            if ($earnMark > $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'greater_than_equal') {
            if ($earnMark >= $mark) {
                $res = 'Achived';
            }
        } elseif ($condition === 'less_than_equal') {
            if ($earnMark <= $mark) {
                $res = 'Achived';
            }
        }

        return $res;
    }

    public static function ultimateMemberHandleUserSpecificRoleChange($user_id, $role, $old_roles)
    {
        $form_id = 'roleSpecificChange';
        $flows = Flow::exists('UltimateMember', $form_id);
        if (empty($flows)) {
            return;
        }
        $flowDetails = json_decode($flows[0]->flow_details);
        $selectedRole = !empty($flowDetails->selectedRole) ? $flowDetails->selectedRole : [];
        $finalData = self::ultimateMemberGetUserInfo($user_id);
        $finalData['role'] = $role;

        if ($finalData && $role === $selectedRole) {
            return ['triggered_entity' => 'UltimateMember', 'triggered_entity_id' => $form_id, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function ultimateMemberHandleUserRoleChange($user_id, $role, $old_roles)
    {
        $form_id = 'roleChange';
        $flows = Flow::exists('UltimateMember', $form_id);
        if (empty($flows)) {
            return;
        }
        $finalData = self::ultimateMemberGetUserInfo($user_id);
        $finalData['role'] = $role;

        if ($finalData) {
            return ['triggered_entity' => 'UltimateMember', 'triggered_entity_id' => $form_id, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function ultimateMemberHandleUserRegisViaForm($user_id, $um_args)
    {
        $form_id = $um_args['form_id'];
        $flows = Flow::exists('UltimateMember', $form_id);

        if (empty($flows)) {
            return;
        }

        if (!empty($um_args['submitted'])) {
            return ['triggered_entity' => 'UltimateMember', 'triggered_entity_id' => $form_id, 'data' => $um_args['submitted'], 'flows' => $flows];
        }
    }

    public static function ultimateMemberHandleUserLogViaForm($um_args)
    {
        if (!isset($um_args['form_id']) || !\function_exists('um_user')) {
            return;
        }
        $user_id = um_user('ID');
        $form_id = $um_args['form_id'];
        $flows = Flow::exists('UltimateMember', $form_id);
        if (empty($flows)) {
            return;
        }
        $finalData = self::ultimateMemberGetUserInfo($user_id);
        $finalData['username'] = $um_args['username'];

        if ($finalData) {
            return ['triggered_entity' => 'UltimateMember', 'triggered_entity_id' => $form_id, 'data' => $finalData, 'flows' => $flows];
        }
    }

    public static function ultimateMemberGetUserInfo($user_id)
    {
        $userInfo = get_userdata($user_id);
        $user = [];
        if ($userInfo) {
            $userData = $userInfo->data;
            $user_meta = get_user_meta($user_id);
            $user = [
                'user_id'    => $user_id,
                'first_name' => $user_meta['first_name'][0],
                'last_name'  => $user_meta['last_name'][0],
                'user_email' => $userData->user_email,
                'nickname'   => $userData->user_nicename,
                'avatar_url' => get_avatar_url($user_id),
            ];
        }

        return $user;
    }

    public static function handleWeformsSubmit($entry_id, $form_id, $page_id, $form_settings)
    {
        $flows = Flow::exists('WeForms', $form_id);

        if (!$flows) {
            return;
        }

        $dataAll = weforms_get_entry_data($entry_id);

        foreach ($dataAll['fields'] as $key => $field) {
            if ($field['type'] === 'image_upload' || $field['type'] === 'file_upload') {
                $dataAll['data'][$key] = explode('"', $dataAll['data'][$key])[1];
            }
        }

        $submittedData = $dataAll['data'];

        foreach ($submittedData as $key => $value) {
            $str = "{$key}";
            $pattern = '/name/i';
            $isName = preg_match($pattern, $str);
            if ($isName) {
                unset($submittedData[$key]);
                $nameValues = explode('|', $value);
                if (\count($nameValues) == 2) {
                    $nameOrganized = [
                        'first_name' => $nameValues[0],
                        'last_name'  => $nameValues[1]

                    ];
                } else {
                    $nameOrganized = [
                        'first_name'  => $nameValues[0],
                        'middle_name' => $nameValues[1],
                        'last_name'   => $nameValues[2]
                    ];
                }
            }
        }

        $finalData = array_merge($submittedData, $nameOrganized);

        return ['triggered_entity' => 'WeForms', 'triggered_entity_id' => $form_id, 'data' => $finalData, 'flows' => $flows];
    }

    public static function wpcwUserEnrolledCourse($userId, $courses)
    {
        $user = get_user_by('id', $userId);
        $flows = Flow::exists('WPCourseware', 'userEnrolledCourse');

        if (!$flows || !$user || !\function_exists('WPCW_courses_getCourseDetails')) {
            return;
        }

        foreach ($courses as $courseId) {
            $course = WPCW_courses_getCourseDetails($courseId);

            if (!$course) {
                continue;
            }

            $data = [
                'enroll_user_id'    => $userId,
                'enroll_user_name'  => $user->display_name,
                'enroll_user_email' => $user->user_email,
                'course_id'         => $courseId,
                'course_title'      => $course->course_title,
            ];

            return ['triggered_entity' => 'WPCourseware', 'triggered_entity_id' => 'userEnrolledCourse', 'data' => $data, 'flows' => $flows];
        }
    }

    public static function wpcwCourseCompleted($userId, $unitId, $course)
    {
        $flows = Flow::exists('WPCourseware', 'courseCompleted');
        $flows = self::wpcwFlowFilter($flows, 'selectedCourse', $course->course_id);

        if (!$flows) {
            return;
        }

        $user = get_user_by('id', $userId);

        if (!$user) {
            return;
        }

        $data = [
            'enroll_user_id'    => $userId,
            'enroll_user_name'  => $user->display_name,
            'enroll_user_email' => $user->user_email,
            'course_id'         => $course->course_id,
            'course_title'      => $course->course_title,
        ];

        return ['triggered_entity' => 'WPCourseware', 'triggered_entity_id' => 'courseCompleted', 'data' => $data, 'flows' => $flows];
    }

    public static function wpcwModuleCompleted($userId, $unitId, $module)
    {
        $flows = Flow::exists('WPCourseware', 'moduleCompleted');
        $flows = self::wpcwFlowFilter($flows, 'selectedModule', $module->module_id);

        if (!$flows) {
            return;
        }

        $user = get_user_by('id', $userId);

        if (!$user) {
            return;
        }

        $data = [
            'enroll_user_id'    => $userId,
            'enroll_user_name'  => $user->display_name,
            'enroll_user_email' => $user->user_email,
            'module_id'         => $module->module_id,
            'module_title'      => $module->module_title,
            'course_title'      => $module->course_title,
        ];

        return ['triggered_entity' => 'WPCourseware', 'triggered_entity_id' => 'moduleCompleted', 'data' => $data, 'flows' => $flows];
    }

    public static function wpcwUnitCompleted($userId, $unitId, $unitData)
    {
        $flows = Flow::exists('WPCourseware', 'unitCompleted');
        $flows = self::wpcwFlowFilter($flows, 'selectedUnit', $unitId);

        if (!$flows) {
            return;
        }

        $unit = get_post($unitId);
        $user = get_user_by('id', $userId);
        if (!$unit || !$user) {
            return;
        }

        $data = [
            'enroll_user_id'    => $userId,
            'enroll_user_name'  => $user->display_name,
            'enroll_user_email' => $user->user_email,
            'unit_id'           => $unitId,
            'unit_title'        => $unit->post_title,
            'module_title'      => $unitData->module_title,
            'course_title'      => $unitData->course_title,
        ];

        return ['triggered_entity' => 'WPCourseware', 'triggered_entity_id' => 'unitCompleted', 'data' => $data, 'flows' => $flows];
    }

    public static function wpefHandleSubmission($data)
    {
        if (!($data instanceof IPT_FSQM_Form_Elements_Data)) {
            return;
        }
        $form_id = $data->form_id;

        if (empty($form_id)) {
            return;
        }

        $flows = Flow::exists('WPEF', $form_id);

        if (!$flows) {
            return;
        }

        $entry = array_merge(
            self::wpefProcessValues($data, 'pinfo'),
            self::wpefProcessValues($data, 'freetype'),
            self::wpefProcessValues($data, 'mcq')
        );

        return ['triggered_entity' => 'WPEF', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    public static function wpefProcessValues($data, $type)
    {
        $formID = $data->form_id;
        $dataID = $data->data_id;
        $fields = $data->data->{$type};
        $processedValues = [];

        foreach ($fields as $index => $field) {
            if ($field['type'] == 'datetime') {
                $processedValues["{$field['m_type']}.{$index}"] = self::wpefProcessDateFieldValue($index, $field, $data);
            } elseif ($field['type'] == 'feedback_matrix') {
                $processedValues["{$field['m_type']}.{$index}"] = $field['rows'];
            } elseif ($field['type'] == 'gps') {
                $processedValues["{$field['m_type']}.{$index}"] = $field['lat'] . ', ' . $field['long'];
            } elseif ($field['type'] == 'upload') {
                $processedValues["{$field['m_type']}.{$index}"] = self::wpefProcessUploadFieldValue($index, $field, $data);
            } elseif ($field['type'] == 'address') {
                $processedValues = array_merge($processedValues, self::wpefProcessAddressFieldValue($index, $field, $data));
            } else {
                $processedValues["{$field['m_type']}.{$index}"] = '';
                if (isset($field['value'])) {
                    $processedValues["{$field['m_type']}.{$index}"] = $field['value'];
                } elseif (isset($field['values'])) {
                    $processedValues["{$field['m_type']}.{$index}"] = $field['values'];
                } elseif (isset($field['options'])) {
                    $processedValues["{$field['m_type']}.{$index}"] = \is_array($field['options']) && \count($field['options']) == 1 ? $field['options'][0] : $field['options'];
                } elseif (isset($field['rows'])) {
                    $processedValues["{$field['m_type']}.{$index}"] = $field['rows'];
                } elseif (isset($field['order'])) {
                    $processedValues["{$field['m_type']}.{$index}"] = $field['order'];
                }
            }
        }

        return $processedValues;
    }

    public static function wpefProcessDateFieldValue($index, $field, $data)
    {
        $processedValue = '';
        $fieldInfo = $data->{$field['m_type']}[$index];
        $dateTimeHelper = new DateTimeHelper();
        $f_date_format = $fieldInfo['settings']['date_format'];
        $f_time_format = $fieldInfo['settings']['time_format'];
        if ($f_date_format == 'mm/dd/yy') {
            $date_format = 'm/d/Y';
        } elseif ($f_date_format == 'yy-mm-dd') {
            $date_format = 'Y-m-d';
        } elseif ($f_date_format == 'dd.mm.yy') {
            $date_format = 'd.m.Y';
        } else {
            $date_format = 'd-m-Y';
        }

        if ($f_time_format == 'HH:mm:ss') {
            $time_format = 'H:i:s';
        } else {
            $time_format = 'h:i:s A';
        }

        $date_time_format = "{$date_format} {$time_format}";

        return $dateTimeHelper->getFormated($field['value'], $date_time_format, DateTimeHelper::wp_timezone(), 'Y-m-d\TH:i', null);
    }

    public static function wpefProcessUploadFieldValue($index, $field, $data)
    {
        $processedValue = [];
        $elementValueHelper = new IPT_EForm_Form_Elements_Values($data->data_id, $data->form_id);
        $elementValueHelper->reassign($data->data_id, $data);
        foreach ($field['id'] as $value) {
            $fileInfo = $elementValueHelper->value_upload($data->{$field['m_type']}[$index], $field, 'json', 'label', $value);
            foreach ($fileInfo as $f) {
                if (isset($f['guid'])) {
                    $processedValue[] = Common::filePath($f['guid']);
                }
            }
        }

        return $processedValue;
    }

    public static function wpefProcessAddressFieldValue($index, $field, $data)
    {
        $processedValue = [];
        foreach ($field['values'] as $key => $value) {
            $processedValue["{$field['m_type']}.{$index}.{$key}"] = $value;
        }

        return $processedValue;
    }

    public static function handleWsFormSubmit($form, $submit)
    {
        $form_id = $submit->form_id;

        $flows = Flow::exists('WSForm', $form_id);
        if (!$flows) {
            return;
        }

        $data = [];
        if (isset($submit->meta)) {
            foreach ($submit->meta as $key => $field_value) {
                if (empty($field_value) || (\is_array($field_value) && !\array_key_exists('id', $field_value))) {
                    continue;
                }
                $value = wsf_submit_get_value($submit, $key);

                if (($field_value['type'] == 'file' || $field_value['type'] == 'signature') && !empty($value)) {
                    $upDir = wp_upload_dir();
                    $files = $value;
                    $value = [];

                    if (\is_array($files)) {
                        foreach ($files as $k => $file) {
                            if (\array_key_exists('hash', $file)) {
                                continue;
                            }
                            $value[$k] = $upDir['basedir'] . '/' . $file['path'];
                        }
                    }
                } elseif ($field_value['type'] == 'radio') {
                    $value = \is_array($value) ? $value[0] : $value;
                }
                $data[$key] = $value;
            }
        }

        return ['triggered_entity' => 'WSForm', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    protected static function academyLmsFlowFilter($flows, $key, $value)
    {
        $filteredFlows = [];
        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
            }
            if (!isset($flow->flow_details->{$key}) || $flow->flow_details->{$key} === 'any' || $flow->flow_details->{$key} == $value || $flow->flow_details->{$key} === '') {
                $filteredFlows[] = $flow;
            }
        }

        return $filteredFlows;
    }

    protected static function BuddyBossFlowFilter($flows, $key, $value)
    {
        $filteredFlows = [];
        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
            }
            if (!isset($flow->flow_details->{$key}) || $flow->flow_details->{$key} === 'any' || $flow->flow_details->{$key} == $value || $flow->flow_details->{$key} === '') {
                $filteredFlows[] = $flow;
            }
        }

        return $filteredFlows;
    }

    protected static function fluentcrmFlowFilter($flows, $key, $value)
    {
        $filteredFlows = [];
        if (\is_array($flows) || \is_object($flows)) {
            foreach ($flows as $flow) {
                if (\is_string($flow->flow_details)) {
                    $flow->flow_details = json_decode($flow->flow_details);
                }
                if (!isset($flow->flow_details->{$key}) || $flow->flow_details->{$key} === 'any' || \in_array($flow->flow_details->{$key}, $value) || $flow->flow_details->{$key} === '') {
                    $filteredFlows[] = $flow;
                }
            }
        }

        return $filteredFlows;
    }

    // LearnDash

    protected static function flowFilter($flows, $key, $value)
    {
        $filteredFlows = [];
        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
            }
            if (!isset($flow->flow_details->{$key}) || $flow->flow_details->{$key} === 'any' || $flow->flow_details->{$key} == $value || $flow->flow_details->{$key} === '') {
                $filteredFlows[] = $flow;
            }
        }

        return $filteredFlows;
    }

    protected static function TutorLmsFlowFilter($flows, $key, $value)
    {
        $filteredFlows = [];
        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
            }
            if (!isset($flow->flow_details->{$key}) || $flow->flow_details->{$key} === 'any' || $flow->flow_details->{$key} == $value || $flow->flow_details->{$key} === '') {
                $filteredFlows[] = $flow;
            }
        }

        return $filteredFlows;
    }

    protected static function wpcwFlowFilter($flows, $key, $value)
    {
        $filteredFlows = [];
        foreach ($flows as $flow) {
            if (\is_string($flow->flow_details)) {
                $flow->flow_details = json_decode($flow->flow_details);
            }
            if (!isset($flow->flow_details->{$key}) || $flow->flow_details->{$key} === 'any' || $flow->flow_details->{$key} == $value || $flow->flow_details->{$key} === '') {
                $filteredFlows[] = $flow;
            }
        }

        return $filteredFlows;
    }

    private static function evfFieldType($type)
    {
        switch ($type) {
            case 'first-name':
            case 'last-name':
            case 'range-slider':
            case 'payment-quantity':
            case 'payment-total':
            case 'rating':
                return 'text';
            case 'phone':
                return 'tel';
            case 'privacy-policy':
            case 'payment-checkbox':
            case 'payment-multiple':
                return 'checkbox';
            case 'payment-single':
                return 'radio';
            case 'image-upload':
            case 'file-upload':
            case 'signature':
                return 'file';

            default:
                return $type;
        }
    }

    private static function groundhoggSetTagNames($tag_ids)
    {
        $tags = new Tags();
        $tag_list = [];
        foreach ($tag_ids as $tag_id) {
            $tag_list[] = $tags->get_tag($tag_id)->tag_name;
        }

        return implode(',', $tag_list);
    }

    private static function handle_submit_data($form_id, $form_data)
    {
        if (!$form_id) {
            return;
        }
        $flows = Flow::exists('Met', $form_id);
        if (!$flows) {
            return;
        }

        unset($form_data['action'], $form_data['form_nonce'], $form_data['id']);
        $data = $form_data;

        return ['triggered_entity' => 'Met', 'triggered_entity_id' => $form_id, 'data' => $data, 'flows' => $flows];
    }

    private static function extractValueFromPath($data, $path)
    {
        $parts = \is_array($path) ? $path : explode('.', $path);
        if (\count($parts) === 0) {
            return $data;
        }

        $currentPart = array_shift($parts);

        if (\is_array($data)) {
            if (!isset($data[$currentPart])) {
                wp_send_json_error(new WP_Error('Spectra', __('Index out of bounds or invalid', 'bit-integrations')));
            }

            return self::extractValueFromPath($data[$currentPart], $parts);
        }

        if (\is_object($data)) {
            if (!property_exists($data, $currentPart)) {
                wp_send_json_error(new WP_Error('Spectra', __('Invalid path', 'bit-integrations')));
            }

            return self::extractValueFromPath($data->{$currentPart}, $parts);
        }

        wp_send_json_error(new WP_Error('Spectra', __('Invalid path', 'bit-integrations')));
    }
}
