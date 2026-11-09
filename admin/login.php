<?php
/**
 * E-LEARN: Yönetici Güvenli Giriş Ekranı (admin/login.php)
 */

require_once __DIR__ . '/../config/settings.php';
require_once __DIR__ . '/../includes/security.php';
require_once __DIR__ . '/../includes/auth.php';




    

if (isAdminLoggedIn()) {
    header("Location: /admin/dashboard.php");
    exit;
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	

	
	
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $error = "Güvenlik hatası: CSRF doğrulanamadı.";
    } else {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        $res = loginAdmin($username, $password);

        if ($res['success']) {
            header("Location: /admin/dashboard.php");
            exit;
        } else {
            $error = $res['message'];
        }
    }
	
		
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yönetici Girişi – E-LEARN Platformu</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
  <style>
    body {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .login-card {
      background: #ffffff;
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 420px;
    }
  </style>
</head>
<body class="p-3">

  <div class="login-card p-4 p-sm-5">
    <div class="text-center mb-4">
      <div class="d-inline-flex bg-primary text-white p-3 rounded-4 shadow-sm mb-2">
        <i class="fa-solid fa-shield-halved fs-3"></i>
      </div>
      <?php  $hash = password_hash('Admin@2026!', PASSWORD_DEFAULT); ?>
      <h4 class="fw-bold text-dark mt-2">E-LEARN Yönetim</h4>
      <p class="text-muted small">Yetkili personel ve yönetici giriş paneli</p>
    </div>

    <?php if ($error): ?>
      <div class="alert alert-danger small p-2 text-center mb-3">
        <i class="fa-solid fa-circle-exclamation me-1"></i> <?php echo e($error); ?>
      </div>
    <?php endif; ?>

    <form method="POST" action="">
      <?php echo csrfField(); ?>
      <div class="mb-3">
        <label for="adminUsername" class="form-label small fw-semibold text-secondary">Kullanıcı Adı</label>
        <div class="input-group">
          <span class="input-group-text bg-light"><i class="fa-solid fa-user text-muted"></i></span>
          <input type="text" class="form-control" id="adminUsername" name="username" required autofocus placeholder="Kullanıcı adınız">
        </div>
      </div>

      <div class="mb-4">
        <label for="adminPassword" class="form-label small fw-semibold text-secondary">Yönetici Şifresi</label>
        <div class="input-group">
          <span class="input-group-text bg-light"><i class="fa-solid fa-lock text-muted"></i></span>
          <input type="password" class="form-control" id="adminPassword" name="password" required placeholder="••••••••">
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-100 fw-bold py-2.5 shadow-sm">
        <i class="fa-solid fa-right-to-bracket me-2"></i>Güvenli Giriş Yap
      </button>
    </form>

    
    <div class="text-center mt-3">
      <a href="/" class="small text-decoration-none text-muted">← Ana Sayfaya Dön</a>
    </div>
  </div>

</body>
</html>
