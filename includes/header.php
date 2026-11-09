<?php
/**
 * E-LEARN: Öğrenci Eğitim, Sınav ve İstatistik Platformu
 * Genel Başlık ve Menü Şablonu (header.php)
 */

require_once __DIR__ . '/../config/settings.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/visitor_tracker.php';

// Otomatik Ziyaretçi Kaydı
$pageTitle = $pageTitle ?? getSiteSetting('site_title', 'E-LEARN – Eğitim ve Sınav Platformu');
trackVisitor($pageTitle);

$contact = getContactSettings();
$isStudent = isStudentLoggedIn();
$studentUser = $_SESSION['student_user'] ?? null;
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo e($pageTitle); ?></title>
  <meta name="description" content="<?php echo e(getSiteSetting('site_description')); ?>">

  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- FontAwesome 6 -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
  <!-- Custom Modern Palette -->
  <style>
    :root {
      --primary-navy: #0f172a;
      --secondary-navy: #1e293b;
      --accent-blue: #0284c7;
      --accent-teal: #0d9488;
      --light-gray: #f8fafc;
      --card-border: #e2e8f0;
    }
    body {
      background-color: #f8fafc;
      color: #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    .bg-navy { background-color: var(--primary-navy) !important; }
    .bg-navy-light { background-color: var(--secondary-navy) !important; }
    .text-teal { color: var(--accent-teal) !important; }
    .btn-teal {
      background-color: var(--accent-teal);
      color: #ffffff;
      font-weight: 600;
      border: none;
    }
    .btn-teal:hover {
      background-color: #0f766e;
      color: #ffffff;
    }
    .navbar-elearn {
      background-color: rgba(15, 23, 42, 0.98);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .scoreboard-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-radius: 1rem;
      border: 1px solid var(--card-border);
    }
    .scoreboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body class="d-flex flex-column min-vh-100">

  <!-- Üst Duyuru & İletişim Şeridi -->
  <div class="bg-navy py-1 text-light border-bottom border-secondary border-opacity-25 small">
    <div class="container d-flex justify-content-between align-items-center">
      <div class="d-none d-md-flex align-items-center gap-3">
        <span><i class="fa-solid fa-graduation-cap text-teal me-1"></i> E-LEARN Akademik Eğitim ve Sınav Portali</span>
        <span class="text-white-50">|</span>
        <span><i class="fa-solid fa-phone text-teal me-1"></i> <?php echo e($contact['phone']); ?></span>
      </div>
      <div class="ms-auto d-flex align-items-center gap-2">
        <a href="/admin/login.php" class="text-white-50 text-decoration-none hover-white me-2">
          <i class="fa-solid fa-lock me-1"></i> Yönetim Paneli
        </a>
      </div>
    </div>
  </div>

  <!-- Ana Gezinme Çubuğu (Navbar) -->
  <nav class="navbar navbar-expand-lg navbar-dark navbar-elearn sticky-top">
    <div class="container">
      <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="/">
        <span class="badge bg-primary p-2 fs-6 rounded-3"><i class="fa-solid fa-book-open"></i></span>
        <span>E-LEARN<span class="text-teal">.edu</span></span>
      </a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link text-white fw-semibold" href="/">Ana Sayfa</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white fw-semibold" href="/elearn/">Dersler & Konular</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white fw-semibold" href="/#skorboard">Skorboard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white fw-semibold" href="/#ekip">Akademik Ekip</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white fw-semibold" href="/#iletisim">İletişim</a>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-2">
          <?php if ($isStudent): ?>
            <a href="/elearn/profile.php" class="btn btn-outline-light btn-sm fw-bold">
              <i class="fa-solid fa-user me-1 text-teal"></i> <?php echo e($studentUser['first_name']); ?>
            </a>
            <a href="/elearn/logout.php" class="btn btn-danger btn-sm">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Çıkış
            </a>
          <?php else: ?>
            <button class="btn btn-outline-light btn-sm fw-semibold" data-bs-toggle="modal" data-bs-target="#loginModal">
              <i class="fa-solid fa-right-to-bracket me-1"></i> Öğrenci Girişi
            </button>
            <button class="btn btn-teal btn-sm fw-bold" data-bs-toggle="modal" data-bs-target="#registerModal">
              <i class="fa-solid fa-user-plus me-1"></i> Kayıt Ol
            </button>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </nav>
