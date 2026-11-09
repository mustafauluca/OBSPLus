<?php
/**
 * E-LEARN: Öğrenci Çıkış Uç Noktası
 */
require_once __DIR__ . '/../includes/auth.php';
logoutStudent();
header('Location: /?logout=1');
exit;
