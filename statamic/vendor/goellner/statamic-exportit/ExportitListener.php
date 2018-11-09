<?php

namespace Statamic\Addons\Exportit;

use Statamic\API\Nav;
use Statamic\Extend\Listener;

class ExportitListener extends Listener
{
    public $events = [
        'cp.nav.created' => 'addNavItems'
    ];

    public function addNavItems($nav)
    {
        $exportit = Nav::item('Exportit')->title('Export Data')->route('addons.exportit')->icon('export');
        $nav->addTo('tools', $exportit);
    }
}