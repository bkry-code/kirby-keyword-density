<?php
$kirby->set('field', 'density', __DIR__ . DS . 'fields' . DS . 'density');
if( site()->user() ) {
	$kirby->set('snippet', 'keyword-density', __DIR__ . '/snippets/keyword-density.php');
}