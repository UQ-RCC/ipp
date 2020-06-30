<?php
/**
 * @file
 */
?>
<div <?php print drupal_attributes($attributes_array); ?>>
  <div class="hero-banner__container">
    <div class="hero-banner__content">
      <?php if ($title): ?>
        <h1 class="hero-banner__title"><?php print $title; ?></h1>
      <?php endif; ?>
      <?php if ($body): ?>
        <div class="hero-banner__body">
          <?php print render($body); ?>
        </div>
      <?php endif; ?>
    </div>

    <?php if (isset($body['field_uq_banner_caption'])): ?>
      <?php print render($body['field_uq_banner_caption']); ?>
    <?php endif; ?>
  </div>
</div>
