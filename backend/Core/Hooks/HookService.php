<?php

namespace BitApps\Integrations\Core\Hooks;

use FilesystemIterator;
use BitApps\Integrations\Config;
use BitApps\Integrations\Admin\AdminAjax;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\Request;
use BitApps\Integrations\Core\Util\Route;
use BitApps\Integrations\Core\Util\StoreInCache;

class HookService
{
    public function __construct()
    {
        $this->loadTriggersHooks();
        $this->loadTriggersRoutes();
        $this->loadAppHooks();
        $this->loadActionsHooks();
        $this->loadAdminAjax();
        Hooks::add('rest_api_init', [$this, 'loadApi']);
    }

    /**
     * Helps to register admin side ajax
     *
     * @return null
     */
    public function loadAdminAjax()
    {
        (new AdminAjax())->register();
    }

    /**
     * Helps to register integration ajax
     *
     * @return void
     */
    public function loadActionsHooks()
    {
        $this->_includeActionTaskHooks('Actions');
    }

    public function loadApi()
    {
        if (is_readable(Config::get('BACKEND_DIR') . DIRECTORY_SEPARATOR . 'Routes' . DIRECTORY_SEPARATOR . 'api.php')) {
            include Config::get('BACKEND_DIR') . DIRECTORY_SEPARATOR . 'Routes' . DIRECTORY_SEPARATOR . 'api.php';
        }
    }

    protected function loadAppHooks()
    {
        if (Request::Check('ajax') && is_readable(Config::get('BACKEND_DIR') . DIRECTORY_SEPARATOR . 'Routes' . DIRECTORY_SEPARATOR . 'ajax.php')) {
            include Config::get('BACKEND_DIR') . DIRECTORY_SEPARATOR . 'Routes' . DIRECTORY_SEPARATOR . 'ajax.php';
        }
        if (is_readable(Config::get('BACKEND_DIR') . DIRECTORY_SEPARATOR . 'hooks.php')) {
            include Config::get('BACKEND_DIR') . DIRECTORY_SEPARATOR . 'hooks.php';
        }
    }

    /**
     * Helps to register Triggers ajax
     *
     * @return null
     */
    protected function loadTriggersHooks()
    {
        $activeTrigger = StoreInCache::getActiveFlowEntities() ?? [];

        if (!$activeTrigger) {
            $activeTrigger = [];
        }

        $listedTrigger = Config::getOption('selected_trigger', []);
        $activeTrigger = array_unique(
            array_merge(
                $activeTrigger,
                \is_string($listedTrigger)
                    ? [$listedTrigger]
                    : $listedTrigger
            )
        );

        if (empty($activeTrigger) || !\is_array($activeTrigger)) {
            return;
        }

        foreach ($activeTrigger as $key => $triggerName) {
            $this->_includeTriggerTaskHooks($triggerName);
        }
    }

    private function _includeTriggerTaskHooks($task_name)
    {
        if (!\is_string($task_name) || empty($task_name)) {
            return;
        }

        $task_dir = Config::get('BACKEND_DIR') . DIRECTORY_SEPARATOR;
        $task_path = $task_dir . 'Triggers' . DIRECTORY_SEPARATOR . $task_name . DIRECTORY_SEPARATOR;
        if (is_readable($task_path . 'Hooks.php')) {
            include $task_path . 'Hooks.php';
        }
    }

    private function loadTriggersRoutes()
    {
        $task_dir = Config::get('BACKEND_DIR') . DIRECTORY_SEPARATOR . 'Triggers';
        $dirs = new FilesystemIterator($task_dir);

        // Trigger-owned routes fetch forms/fields and write test data without checking
        // capabilities themselves, so they get the stricter baseline. Reset afterwards so
        // it never leaks onto routes registered later in the request.
        Route::defaultAccess('write');

        try {
            foreach ($dirs as $dirInfo) {
                if ($dirInfo->isDir()) {
                    $task_name = basename($dirInfo);
                    $task_path = $task_dir . DIRECTORY_SEPARATOR . $task_name . DIRECTORY_SEPARATOR;
                    if (is_readable($task_path . 'Routes.php') && Request::Check('ajax') && Request::Check('admin')) {
                        include $task_path . 'Routes.php';
                    }
                }
            }
        } finally {
            Route::defaultAccess('any');
        }
    }

    private function _includeActionTaskHooks($task_name)
    {
        $task_dir = Config::get('BACKEND_DIR') . DIRECTORY_SEPARATOR . $task_name;
        $dirs = new FilesystemIterator($task_dir);

        // Action-owned routes authorize credentials and call third-party APIs with no
        // capability check of their own — a read-only role must not reach them.
        Route::defaultAccess('write');

        try {
            foreach ($dirs as $dirInfo) {
                if ($dirInfo->isDir()) {
                    $task_name = basename($dirInfo);
                    $task_path = $task_dir . DIRECTORY_SEPARATOR . $task_name . DIRECTORY_SEPARATOR;
                    if (is_readable($task_path . 'Routes.php') && Request::Check('ajax') && Request::Check('admin')) {
                        include $task_path . 'Routes.php';
                    }
                    if (is_readable($task_path . 'Hooks.php')) {
                        include $task_path . 'Hooks.php';
                    }
                }
            }
        } finally {
            Route::defaultAccess('any');
        }
    }
}
