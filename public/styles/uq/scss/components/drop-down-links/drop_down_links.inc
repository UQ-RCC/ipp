<?php
/**
 * @file
 */

/**
 * Implements hook_theme().
 * @param $existing
 * @param $type
 * @param $theme
 * @param $path
 * @return array
 */
function drop_down_links_theme($existing, $type, $theme, $path) {
  return array(
    'drop_down_links' => array(
      'template'       => 'drop_down_links',
      'render element' => 'element',
      'path'           => $path,
      'file'           => 'drop_down_links.inc',
      'function'       => 'theme_drop_down_links'
    )
  );
}

/**
 * @param $var
 * @return string
 * @throws \Exception
 */
function theme_drop_down_links($var) {
  $element = $var['element'];
  $items = array();
  foreach ($var['element']['#items'] as $item) {
    $items[] = theme('link_formatter_link_default', array('element' => $item));
  }

  $id = 'dropdown-' . rand(0, 1000);
  $link = '<a class="button button--white dropdown" data-dropdown="' . $id . '" aria-controls="' . $id . '">' . $var['element']['title'] . '</a>';
  $list = theme(
    'item_list', array(
      'items'      => $items,
      'attributes' => array(
        'id'          => $id,
        'class'       => array('f-dropdown'),
        'data-dropdown-content',
        'aria-hidden' => TRUE
      )
    )
  );

  $attrs = array(
    'class' => array('dropdown-links')
  );

  if (isset($var['element']['class']) && $var['element']['class']) {
    $attrs['class'][] = $var['element']['class'];
  }

  return '<div ' . drupal_attributes($attrs) . '>' . $link . render($list) . '</div>';
}