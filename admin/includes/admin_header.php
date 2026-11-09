<?php
/**
 * E-LEARN: Yönetim Paneli Başlık ve Sidebar Şablonu (admin_header.php)
 */

require_once __DIR__ . '/../../config/settings.php';
require_once __DIR__ . '/../../includes/functions.php';
require_once __DIR__ . '/../../includes/auth.php';

// Yönetici Yetki Kontrolü
if (!isAdminLoggedIn()) {
    header("Location: /admin/login.php");
    exit;
}

$admin = $_SESSION['admin_user'];
$activePage = $activePage ?? 'dashboard';
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo e($pageTitle ?? 'Yönetim Paneli – E-LEARN'); ?></title>

  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- FontAwesome 6 -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
  <!-- Chart.js 4 -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>

  <style>
    :root {
      --admin-sidebar-bg: #0f172a;
      --admin-sidebar-hover: #1e293b;
      --admin-accent: #0d9488;
      --admin-accent-blue: #0284c7;
    }
    body {
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .admin-sidebar {
      background-color: var(--admin-sidebar-bg);
      min-height: 100vh;
      color: #94a3b8;
    }
    .admin-nav-link {
      color: #94a3b8;
      padding: 0.65rem 1rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .admin-nav-link:hover, .admin-nav-link.active {
      color: #ffffff;
      background-color: var(--admin-sidebar-hover);
      border-left: 3px solid var(--admin-accent);
    }
    .admin-card {
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      background-color: #ffffff;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    }
  </style>
</head>
<body>

<div class="d-flex">
  <!-- Yan Menü (Sidebar) -->
  <aside class="admin-sidebar p-3 d-flex flex-column" style="width: 260px; min-width: 260px;">
    <div class="d-flex align-items-center gap-2 mb-4 px-2 pt-2">
      <div class="bg-primary text-white p-2 rounded-3"><i class="fa-solid fa-graduation-cap"></i></div>
      <div>
        <h6 class="fw-bold text-white mb-0">E-LEARN ADMIN</h6>
        <small class="text-secondary">Yönetim & İstatistik</small>
      </div>
    </div>

    <div class="small fw-bold text-uppercase text-secondary px-2 mb-2">İstatistik & Loglar</div>
    <nav class="nav flex-column gap-1 mb-3">
      <a href="/admin/dashboard.php" class="admin-nav-link <?php echo $activePage === 'dashboard' ? 'active' : ''; ?>">
        <i class="fa-solid fa-chart-line text-info"></i> Genel Bakış
      </a>
      <a href="/admin/visitors.php" class="admin-nav-link <?php echo $activePage === 'visitors' ? 'active' : ''; ?>">
        <i class="fa-solid fa-network-wired text-primary"></i> IP Ziyaret Logları
      </a>
      <a href="/admin/login_logs.php" class="admin-nav-link <?php echo $activePage === 'login_logs' ? 'active' : ''; ?>">
        <i class="fa-solid fa-right-to-bracket text-warning"></i> Öğrenci Giriş Logları
      </a>
      <a href="/admin/register_logs.php" class="admin-nav-link <?php echo $activePage === 'register_logs' ? 'active' : ''; ?>">
        <i class="fa-solid fa-user-check text-success"></i> Öğrenci Kayıt Logları
      </a>
    </nav>

    <div class="small fw-bold text-uppercase text-secondary px-2 mb-2">Eğitim & Sınav</div>
    <nav class="nav flex-column gap-1 mb-3">
      <a href="/admin/students.php" class="admin-nav-link <?php echo $activePage === 'students' ? 'active' : ''; ?>">
        <i class="fa-solid fa-users text-teal"></i> Öğrenci Yönetimi
      </a>
      <a href="/admin/courses.php" class="admin-nav-link <?php echo $activePage === 'courses' ? 'active' : ''; ?>">
        <i class="fa-solid fa-book-bookmark text-primary"></i> Ders Yönetimi
      </a>
      <a href="/admin/topics.php" class="admin-nav-link <?php echo $activePage === 'topics' ? 'active' : ''; ?>">
        <i class="fa-solid fa-layer-group text-info"></i> Konu Yönetimi
      </a>
      <a href="/admin/questions.php" class="admin-nav-link <?php echo $activePage === 'questions' ? 'active' : ''; ?>">
        <i class="fa-solid fa-circle-question text-warning"></i> Soru Havuzu
      </a>
      <a href="/admin/exams.php" class="admin-nav-link <?php echo $activePage === 'exams' ? 'active' : ''; ?>">
        <i class="fa-solid fa-file-pen text-danger"></i> Vize Sınavları
      </a>
      <a href="/admin/results.php" class="admin-nav-link <?php echo $activePage === 'results' ? 'active' : ''; ?>">
        <i class="fa-solid fa-square-poll-vertical text-success"></i> Sınav Sonuçları
      </a>
      <a href="/admin/scoreboard.php" class="admin-nav-link <?php echo $activePage === 'scoreboard' ? 'active' : ''; ?>">
        <i class="fa-solid fa-trophy text-warning"></i> Skorboard Yönetimi
      </a>
    </nav>

    <div class="small fw-bold text-uppercase text-secondary px-2 mb-2">Sistem Ayarları</div>
    <nav class="nav flex-column gap-1 mb-auto">
      <a href="/admin/team.php" class="admin-nav-link <?php echo $activePage === 'team' ? 'active' : ''; ?>">
        <i class="fa-solid fa-people-group text-info"></i> Ekip Yönetimi
      </a>
      <a href="/admin/contact.php" class="admin-nav-link <?php echo $activePage === 'contact' ? 'active' : ''; ?>">
        <i class="fa-solid fa-address-book text-primary"></i> İletişim Bilgileri
      </a>
      <a href="/admin/settings.php" class="admin-nav-link <?php echo $activePage === 'settings' ? 'active' : ''; ?>">
        <i class="fa-solid fa-sliders text-teal"></i> Site & KVKK Ayarları
      </a>
    </nav>

    <div class="border-top border-secondary border-opacity-25 pt-3 mt-3">
      <div class="d-flex align-items-center justify-content-between px-2">
        <div>
          <div class="text-white small fw-bold"><?php echo e($admin['full_name']); ?></div>
          <div class="text-secondary" style="font-size: 11px;"><?php echo e($admin['role']); ?></div>
        </div>
        <a href="/admin/logout.php" class="btn btn-outline-danger btn-sm p-1 px-2" title="Çıkış Yap">
          <i class="fa-solid fa-power-off"></i>
        </a>
      </div>
    </div>
  </aside>

  <!-- Ana İçerik Alanı -->
  <div class="flex-grow-1 d-flex flex-column min-vh-100" style="overflow-x: hidden;">
    <!-- Üst Başlık Çubuğu -->
    <header class="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold text-navy mb-0"><?php echo e($pageTitle ?? 'Genel Bakış'); ?></h5>
      <div class="d-flex align-items-center gap-3">
        <a href="/" target="_blank" class="btn btn-outline-secondary btn-sm">
          <i class="fa-solid fa-arrow-up-right-from-square me-1"></i> Siteye Git
        </a>
        <span class="badge bg-light text-muted border"><?php echo date('d.m.Y H:i'); ?></span>
      </div>
    </header>

    <main class="p-4 flex-grow-1">
