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
function menu_tree_grid_theme($existing, $type, $theme, $path) {
  return array(
    'menu_tree_grid' => array(
      'template' => 'menu_tree_grid',
      'variables' => array(
        'menu_tree' => array() //Need to be of type theme menu_links
      ),
      'path' => $path,
    ),
    'menu_tree_grid_link' => array(
      'function' => 'menu_tree_grid_link',
      'render element' => 'element',
      'path' => $path,
      'file' => 'menu_tree_grid.inc'
    )
  );
}

/**
 * @param $vars
 * @return string
 */
function preprocess_menu_tree_grid(&$vars) {
  $size = sizeof($vars['menu_tree']);

  if ($size < 1) {
    return '';
  }

  $vars['menu_tree'] = array_chunk($vars['menu_tree'], 4);
  foreach ($vars['menu_tree'] as &$row) {
    if (sizeof($row) == 2) {
      $classes = array(
        'col-0' => array(
          'columns',
          'large-3',
          'medium-6',
          'large-push-3'
        ),
        'col-1' => array(
          'columns',
          'large-3',
          'medium-6',
          'large-pull-3'
        )
      );
    }
    else {
      $classes = array(
        'columns',
        'large-3',
        'medium-6'
      );
    }

    foreach ($row as $key => &$link) {
      array_unshift($link['#theme'], 'menu_tree_grid_link');
      $link['#attributes']['class'] = empty($link['#attributes']['class']) ? array() : $link['#attributes']['class'];
      $link['#attributes']['class'] = array_merge($link['#attributes']['class'], isset($classes['col-' . $key]) ? $classes['col-' . $key] : $classes);
      $link['#localized_options']['attributes']['class'][] = 'menu_tree_grid__link';
    }
  }
}

/**
 * @param $vars
 * @return string
 */
function menu_tree_grid_link(&$vars) {
  $element = $vars['element'];
  $sub_menu = '';

  if ($element ['#below']) {
    // We won't be rendering child menus for now
//    $sub_menu = drupal_render($element ['#below']);
  }

  $output = l($element ['#title'], $element ['#href'], $element ['#localized_options']);

  return '<div' . drupal_attributes($element ['#attributes']) . '>' . $output . "</div>";
}
