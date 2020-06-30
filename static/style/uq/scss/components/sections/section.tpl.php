<?php
/**
 * @file
 */
?>
<div <?php print drupal_attributes($attributes_array); ?>>
  <?php
    if ($title_suffix) {
      print render($title_suffix);
    }
  ?>
  <div class="section__container">
    <?php if ($title || $summary): ?>
      <div class="section__header">
        <?php if ($title): ?>
          <<?php print $title_element; ?> class="section__title"><?php print $title; ?></<?php print $title_element; ?>>
        <?php endif; ?>

        <?php if ($summary): ?>
          <p class="section__summary"><?php print $summary ?></p>
        <?php endif; ?>
      </div>
    <?php endif; ?>
    <div class="section__content">
      <?php
      print $content;
      ?>
    </div>

    <?php if ($footer): ?>
      <div class="section__footer"><?php print $footer ?></div>
    <?php endif; ?>
  </div>
</div>