<?php
class DensityField extends BaseField {
	static public $fieldname = 'density';
	static public $assets = array(
		'js' => array(
			'script.js',
		),
		'css' => array(
			'style.css',
		)
	);

	public function input() {
		$html = snippet(
			'keyword-density',
			array(
				'field' => $this,
				'page' => $this->page()
			),
			true
		);
		return $html;
	}

	public function element() {
		$element = parent::element();
		$element->data('field', self::$fieldname);
		$element->data('limit', $this->limit());
		$element->data('text', $this->text());
		$element->data('keywords', $this->keywords());
		$element->data('words', $this->words());
		return $element;
	}
}