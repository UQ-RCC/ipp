<?php
/**
 * @file
 */

/**
 * Implements hook_theme().
 * Outputs a menu tree as two columns
 * @param $existing
 * @param $type
 * @param $theme
 * @param $path
 * @return array
 */
function menu_tree_two_column_theme($existing, $type, $theme, $path) {
  return array(
    'menu_tree_two_column' => array(
      'function' => 'menu_tree_two_column',
      'variables' => array(
        'menu_tree' => array()
      ),
      'path' => $path,
      'file' => 'menu_tree_two_column.inc'
    )
  );
}

/**
 * @param $vars
 * @return string
 */
function menu_tree_two_column($vars) {
  $menu_tree = $vars['menu_tree'];
  $length = sizeof($menu_tree);
  $size = ceil($length / 2);
  $start_at = $size + 1;
  $i = 1;
  $render = array(
    '#prefix' => '<div class="menu-block menu-block--two-column"><div class="row">',
    'col1' => array(
      '#prefix' => '<div class="columns medium-6"><ol>',
      '#suffix' => '</ol></div>'
    ),
    'col2' => array(
      '#prefix' => '<div class="columns medium-6"><ol start="' . $start_at . '">',
      '#suffix' => '</ol></div>'
    ),
    '#suffix' => '</div></div>',
  );

  foreach ($menu_tree as $id => &$menu_link) {
    if ($i <= $size) {
      $render['col1'][$id] = $menu_link;
    }
    else {
      $render['col2'][$id] = $menu_link;
    }
    $i++;
  }

  return render($render);
}
