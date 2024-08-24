<?php
session_start();
$id = $_SESSION['admin'];
if (empty($id)) {
  echo 200;
  exit;
}
echo 200;
