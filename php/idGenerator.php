<?php
function id ($prefix) {
      $id = uniqid($prefix, true );
      return($id);
}
