<?php

namespace BitApps\Integrations\controller;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Capabilities;

final class IntegrationTagController
{
    public function get()
    {
        if (!$this->canManageIntegrationTags()) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }

        $tagData = Config::getOption('integration_tags', []);

        return $this->normalizeTagData($tagData);
    }

    public function save($data)
    {
        if (!$this->canManageIntegrationTags()) {
            wp_send_json_error(__('User don\'t have permission to access this page', 'bit-integrations'));
        }

        if (!$this->hasValidTagDataStructure($data)) {
            wp_send_json_error(__('Invalid tag data', 'bit-integrations'), 400);
        }

        $normalizedTagData = $this->normalizeTagData($data);

        Config::updateOption('integration_tags', $normalizedTagData);

        return $normalizedTagData;
    }

    private function canManageIntegrationTags()
    {
        return Capabilities::Check('manage_options')
            || Capabilities::Check(Config::withPrefix('manage_integrations'))
            || Capabilities::Check(Config::withPrefix('create_integrations'))
            || Capabilities::Check(Config::withPrefix('edit_integrations'));
    }

    private function hasValidTagDataStructure($data)
    {
        if (\is_object($data)) {
            $hasTags = property_exists($data, 'tags') && \is_array($data->tags);
            $hasIntegrationTags = (property_exists($data, 'integrationTags') && (\is_array($data->integrationTags) || \is_object($data->integrationTags)))
                || (property_exists($data, 'mapping') && (\is_array($data->mapping) || \is_object($data->mapping)));

            return $hasTags && $hasIntegrationTags;
        }

        if (\is_array($data)) {
            $hasTags = isset($data['tags']) && \is_array($data['tags']);
            $hasIntegrationTags = (isset($data['integrationTags']) && (\is_array($data['integrationTags']) || \is_object($data['integrationTags'])))
                || (isset($data['mapping']) && (\is_array($data['mapping']) || \is_object($data['mapping'])));

            return $hasTags && $hasIntegrationTags;
        }

        return false;
    }

    private function normalizeTagData($data)
    {
        $rawTags = [];
        $rawIntegrationTags = [];

        if (\is_object($data)) {
            $rawTags = property_exists($data, 'tags') && \is_array($data->tags) ? $data->tags : [];

            if (property_exists($data, 'integrationTags') && (\is_array($data->integrationTags) || \is_object($data->integrationTags))) {
                $rawIntegrationTags = $data->integrationTags;
            } elseif (property_exists($data, 'mapping') && (\is_array($data->mapping) || \is_object($data->mapping))) {
                $rawIntegrationTags = $data->mapping;
            }
        } elseif (\is_array($data)) {
            $rawTags = isset($data['tags']) && \is_array($data['tags']) ? $data['tags'] : [];

            if (isset($data['integrationTags']) && (\is_array($data['integrationTags']) || \is_object($data['integrationTags']))) {
                $rawIntegrationTags = $data['integrationTags'];
            } elseif (isset($data['mapping']) && (\is_array($data['mapping']) || \is_object($data['mapping']))) {
                $rawIntegrationTags = $data['mapping'];
            }
        }

        $sanitizedTags = [];
        $seenTagIds = [];
        $seenTagNames = [];

        foreach ($rawTags as $tag) {
            if (\is_array($tag)) {
                $tag = (object) $tag;
            }

            if (!\is_object($tag)) {
                continue;
            }

            $tagName = isset($tag->name) ? sanitize_text_field((string) $tag->name) : '';
            if (empty($tagName)) {
                continue;
            }

            $tagId = isset($tag->id) ? sanitize_text_field((string) $tag->id) : '';

            if (empty($tagId)) {
                $tagId = sanitize_title($tagName);
            }

            if (empty($tagId) || isset($seenTagIds[$tagId])) {
                continue;
            }

            $tagNameKey = strtolower($tagName);
            if (isset($seenTagNames[$tagNameKey])) {
                continue;
            }

            $seenTagIds[$tagId] = true;
            $seenTagNames[$tagNameKey] = true;

            $sanitizedTags[] = [
                'id'    => $tagId,
                'name'  => $tagName,
                'color' => '#6f42c1'
            ];
        }

        if (\is_object($rawIntegrationTags)) {
            $rawIntegrationTags = (array) $rawIntegrationTags;
        }

        $allowedTagIds = array_flip(array_column($sanitizedTags, 'id'));
        $sanitizedIntegrationTags = [];

        if (\is_array($rawIntegrationTags)) {
            foreach ($rawIntegrationTags as $integrationId => $tagIds) {
                $integrationKey = (string) absint($integrationId);
                if (empty($integrationKey) || $integrationKey === '0') {
                    continue;
                }

                if (\is_object($tagIds)) {
                    $tagIds = (array) $tagIds;
                }

                if (!\is_array($tagIds)) {
                    continue;
                }

                $normalizedTagIds = [];
                foreach ($tagIds as $tagId) {
                    $tagId = sanitize_text_field((string) $tagId);
                    if (empty($tagId) || !isset($allowedTagIds[$tagId])) {
                        continue;
                    }
                    $normalizedTagIds[$tagId] = $tagId;
                }

                if (!empty($normalizedTagIds)) {
                    $sanitizedIntegrationTags[$integrationKey] = array_values($normalizedTagIds);
                }
            }
        }

        return [
            'tags'            => $sanitizedTags,
            'integrationTags' => $sanitizedIntegrationTags
        ];
    }
}
