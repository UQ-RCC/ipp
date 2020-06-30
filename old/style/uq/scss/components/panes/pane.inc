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
function pane_theme($existing, $type, $theme, $path) {
  return array(
    'pane_grid' => array(
      'template' => 'pane_grid',
      'variables' => array(
        'content' => ''
      ),
      'render options' => array(
        'spacing' => array(
          'title' => 'Spacing',
          'children' => array(
            'layout' => array(
              '#type' => 'select',
              '#options' => array(
                '' => 'Default',
                'pane-grid--vertical-spacing' => 'Vertical spacing'
              )
            )
          )
        ),
        'theme' => array(
          'title' => 'Theme',
          'children' => array(
            'tint' => array(
              '#type' => 'select',
              '#options' => array(
                '' => 'Default',
                'pane-grid--shaded' => 'Shaded background',
                'pane-grid--white' => 'White background',
                'pane-grid--outline' => 'Full border',
                'pane-grid--ruled' => 'Top & bottom border',
                'pane-grid--dark-tint' => 'Dark tint'
              )
            )
          )
        ),
        'column' => array(
          'title' => 'Column',
          'children' => array(
            'column' => array(
              '#type' => 'select',
              '#options' => array(
                '2' => '2 Columns',
                '3' => '3 Columns'
              )
            )
          )
        )
      ),
      'path' => $path,
    ),
    'pane' => array(
      'template' => 'pane',
      'variables' => array(
        'title' => '',
        'content' => ''
      ),
      'render options' => array(
        'spacing' => array(
          'title' => 'Spacing',
          'children' => array(
            'layout' => array(
              '#type' => 'select',
              '#options' => array(
                '' => 'Default',
                'pane--vertical-spacing' => 'Vertical spacing'
              )
            )
          )
        ),
        'theme' => array(
          'title' => 'Theme',
          'children' => array(
            'tint' => array(
              '#type' => 'select',
              '#options' => array(
                '' => 'Default',
                'pane--shaded' => 'Shaded background',
                'pane--white' => 'White background',
                'pane--outline' => 'Full border',
                'pane--ruled' => 'Top & bottom border',
                'pane--dark-tint' => 'Dark tint'
              )
            )
          )
        )
      ),
      'path' => $path,
    )
  );
}
