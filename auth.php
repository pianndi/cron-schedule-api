<?php
// Mendapatkan PHPSESSID dari argumen terminal
if ($argc > 1) {
  $phpsessid = $argv[1];
  // Mengatur ID sesi
  session_id($phpsessid);

  // Memulai sesi
  session_start();

  // Memeriksa apakah ada data di dalam sesi
  if (isset($_SESSION) && !empty($_SESSION)) {
    echo "200";
  } else {
    echo "401";
  }
} else {
  echo "401";
} ?>

