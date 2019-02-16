<?php

namespace Statamic\SiteHelpers;

use Statamic\Extend\Tags as AbstractTags;

class Tags extends AbstractTags {
	public function sprite() {
		$id = $this->getParam('id');
		$w = $this->getParam('width') ?: "16";
		$h = $this->getParam('height') ?: "16";
		$class = $this->getParam('class') ?: "";

		$sprite = "<svg class='sprite sprite--{$id} {$class}' viewBox='0 0 {$w} {$h}' preserveAspectRatio='xMinYMin meet'>";
		$sprite .= "<use xlink:href='/site/themes/tes/assets/images/sprite.svg#{$id}'></use>";
		$sprite .= "</svg>";

		return $sprite;
	}

	public function randomYear() {
		return rand(1950, (int)date("Y"));
	}
}
