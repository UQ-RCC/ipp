<?php
/**
 * @file
 */

/**
 *
 * Implements hook_theme().
 * @param $existing
 * @param $type
 * @param $theme
 * @param $path
 * @return array
 */
function sections_theme($existing, $type, $theme, $path) {
  return array(
    'section' => array(
      'template'       => 'section',
      'variables'      => array(
        'content'          => array(),
        'title'            => '',
        'title_element'    => 'h2',
        'footer'           => '',
        'summary'          => array(),
        'attributes_array' => array(),
        'image'            => ''
      ),
      'path'           => $path,
      'file'           => 'sections.inc',
      'render options' => array(
        'top_spacing' => array(
          'title'    => 'Top spacing',
          'children' => array(
            array(
              '#type'    => 'select',
              '#options' => array(
                ''                                  => 'Default padding',
                'section--large-top-spacing'        => 'Large padding',
                'section--extra-large-top-spacing'  => 'Extra large padding',
                'section--no-top-spacing'           => 'No padding',
              ),
            ),
          )
        ),
        'bottom_spacing' => array(
          'title'    => 'Bottom spacing',
          'children' => array(
            array(
              '#type'     => 'select',
              '#options'  => array(
                ''                                     => 'Default padding',
                'section--large-bottom-spacing'        => 'Large padding',
                'section--extra-large-bottom-spacing'  => 'Extra large padding',
                'section--no-bottom-spacing'           => 'No padding',
              )
            )
          )
        ),
        'theme'   => array(
          'title'    => 'Theme',
          'children' => array(
            array(
              '#type'    => 'select',
              '#options' => array(
                ''                    => 'Default',
                'section--shaded'     => 'Shaded background',
                'section--dark-tint'  => 'Dark tint',
                'section--light-tint' => 'Light tint',
                'pattern--noise' => 'Noise texture background',
                'pattern--black-pinstripe' => 'Black pinstripe background',
                'pattern--cardboard' => 'Cardboard texture background',
                'pattern--mesh' => 'Mesh texture background',
                'pattern--dark-grid' => 'Dark grid texture background',
                'pattern--light-grid' => 'Light grid texture background',
                'pattern--thatched' => 'Thatched texture background',
              )
            ),
            array(
              '#type'     => 'checkboxes',
              '#multiple' => FALSE,
              '#options'  => array(
                'section--light-text' => 'Light text (section title, summary, footer)',
                'section--dark-text'  => 'Dark text (section title, summary, footer)'
              )
            )
          )
        ),
        'layout'  => array(
          'title'    => 'Layout',
          'children' => array(
            array(
              '#type'    => 'select',
              '#options' => array(
                'section--centered'                    => 'Single column, centered',
                ''                    => 'Single column, left-aligned',
                'section--horizontal' => 'Two column, left-aligned',
              )
            )
          )
        ),
        'utility' => array(
          'title'    => 'Utility',
          'children' => array(
            array(
              '#type'    => 'checkboxes',
              '#multiple' => TRUE,
              '#options' => array(
                'section--allow-overflow' => 'Allow overflow',
              )
            )
          )
        )
      )
    )
  );
}

/**
 * @param $var
 */
function preprocess_section(&$var) {
  //Unset contextual links for content as there seems to be a double up
  if (isset($var['content']['#contextual_links'])) {
    unset($var['content']['#contextual_links']);
  }


  if (is_array($var['content'])) {
    $var['content'] = drupal_render($var['content']);
  }

  if (isset($var['image']) && !empty($var['image'])) {
    $image = file_create_url($var['image']);

    if ($image) {
      $var['attributes_array']['style'] = 'background-image:url("' . $image . '")';
      $var['attributes_array']['class'][] = 'section--background-image';
    }
  }

  $var['attributes_array']['class'][] = 'section';

  if (isset($var['classes_array']) && $var['classes_array']) {
    $var['attributes_array']['class'][] = implode(" ", $var['classes_array']);
  }
}
