<?php
/**
 * @file
 */
?>
<div class="previous-next-links">
  <div class="row">
    <div class="columns medium-6">
      <?php
      if (isset($prev)) {
        print $prev;
      }
      ?>
    </div>

    <div class="columns medium-6">
      <?php
      if (isset($next)) {
        print $next;
      }
      ?>
    </div>
  </div>
</div>