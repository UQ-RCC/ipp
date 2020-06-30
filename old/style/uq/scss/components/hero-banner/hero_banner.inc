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
function hero_banner_theme($existing, $type, $theme, $path) {
  return array(
    'hero_banner' => array(
      'template'       => 'hero_banner',
      'variables'      => array(
        'title'   => '',
        'classes' => array(),
        'image'   => '',
        'body' => array(),
      ),
      'render options' => array(
        'layout' => array(
          'title'    => 'Layout',
          'children' => array(
            'layout' => array(
              '#type'    => 'select',
              '#options' => array(
                ''       => 'Default',
                'hero-banner--thin' => 'Thin banner'
              )
            )
          )
        ),
        'bottom_spacing' => array(
          'title'    => 'Bottom spacing',
          'children' => array(
            array(
              '#type'     => 'select',
              '#options'  => array(
                ''                                     => 'No spacing',
                'hero-banner--bottom-spacing'        => 'Bottom spacing',
              )
            )
          )
        ),
        'theme'  => array(
          'title'    => 'Theme',
          'children' => array(
            'tint' => array(
              '#type'    => 'select',
              '#options' => array(
                ''       => 'No tint',
                'hero-banner--dark-tint'  => 'Dark tint',
                'hero-banner--light-tint' => 'Light tint'
              )
            ),
            'text' => array(
              '#type'     => 'select',
              //'#multiple' => TRUE,
              '#options'  => array(
                'light-palette' => 'Light text',
                'dark-palette'  => 'Dark text'
              )
            )
          )
        )
      ),
      'path'           => $path,
    )
  );
}

/**
 * @param $var
 */
function preprocess_hero_banner(&$var) {
  if ($var['classes']) {
    $var['classes_array'] = array_merge($var['classes'], $var['classes_array']);
  }

  $var['attributes_array']['class'] = $var['classes_array'];

  if (isset($var['image']) && !empty($var['image'])) {
    $image = file_create_url($var['image']['uri']);

    if ($image) {
      $var['attributes_array']['style'] = 'background-image:url("' . $image . '")';
      $var['attributes_array']['class'][] = 'hero-banner--background-image';
    }
  }
}
