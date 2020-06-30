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
function previous_next_links_theme($existing, $type, $theme, $path) {
  return array(
    'prev_next_links' => array(
      'variables' => array(
        'prev_link' => NULL,
        'next_link' => NULL
      ),
      'template'  => 'previous_next_links',
      'path'      => $path
    )
  );
}

/**
 * @param $vars
 */
function preprocess_prev_next_links(&$vars) {
  if ($vars['prev_link']) {
    $vars['prev'] = l(
      $vars['prev_link']['#title'] . ' <span class="link-previous__description">Previous</span>', $vars['prev_link']['#href'], array(
        'html' => TRUE,
        'fragment' => $vars['prev_link']['#id'],
        'attributes' => array(
          'class' => array('link-previous'),
        )
      )
    );
  }

  if ($vars['next_link']) {
    $vars['next'] = l(
      $vars['next_link']['#title'] . ' <span class="link-next__description">Next</span>', $vars['next_link']['#href'], array(
        'html' => TRUE,
        'fragment' => $vars['next_link']['#id'],
        'attributes' => array(
          'class' => array('link-next')
        )
      )
    );
  }
}
