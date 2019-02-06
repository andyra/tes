<?php

namespace Statamic\Addons\Andy;

use Statamic\Extend\Tags;

class AndyTags extends Tags
{
    /**
     * The {{ andy }} tag
     *
     * @return string|array
     */
    public function index()
    {
        return "GGGG";
    }

    /**
     * The {{ andy:example }} tag
     *
     * @return string|array
     */
    public function example()
    {
        //
    }
}
