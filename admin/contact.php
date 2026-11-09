<?php
/**
 * E-LEARN: İletişim Bilgileri Yönetimi (admin/contact.php)
 */

$pageTitle = 'İletişim Bilgileri Yönetimi';
$activePage = 'contact';
require_once __DIR__ . '/includes/admin_header.php';

$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $msg = ['type' => 'danger', 'text' => 'CSRF hatası.'];
    } else {
        $phone = trim($_POST['phone'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $address = trim($_POST['address'] ?? '');
        $whatsapp = trim($_POST['whatsapp'] ?? '');
        $instagram = trim($_POST['instagram'] ?? '');
        $facebook = trim($_POST['facebook'] ?? '');
        $youtube = trim($_POST['youtube'] ?? '');
        $workingHours = trim($_POST['working_hours'] ?? '');

        dbExecute(
            "UPDATE contact_settings SET phone = ?, email = ?, address = ?, whatsapp = ?, instagram = ?, facebook = ?, youtube = ?, working_hours = ? WHERE id = 1",
            "ssssssss",
            [$phone, $email, $address, $whatsapp, $instagram, $facebook, $youtube, $workingHours]
        );
        $msg = ['type' => 'success', 'text' => 'İletişim bilgileri başarıyla güncellendi.'];
    }
}

$c = getContactSettings();
?>

<?php if ($msg): ?>
  <div class="alert alert-<?php echo $msg['type']; ?> alert-dismissible fade show" role="alert">
    <?php echo e($msg['text']); ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="row justify-content-center">
  <div class="col-lg-8">
    <div class="admin-card p-4">
      <h6 class="fw-bold text-navy mb-4"><i class="fa-solid fa-address-book text-primary me-2"></i>Genel İletişim & Sosyal Medya Ayarları</h6>
      
      <form method="POST">
        <?php echo csrfField(); ?>
        
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Telefon Numarası</label>
            <input type="text" name="phone" class="form-control" value="<?php echo e($c['phone']); ?>" required>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Resmi E-Posta</label>
            <input type="email" name="email" class="form-control" value="<?php echo e($c['email']); ?>" required>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-semibold">Fiziksel Adres / Kampüs</label>
          <textarea name="address" rows="2" class="form-control" required><?php echo e($c['address']); ?></textarea>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label small fw-semibold">WhatsApp Destek Hattı</label>
            <input type="text" name="whatsapp" class="form-control" value="<?php echo e($c['whatsapp']); ?>" placeholder="905XXXXXXXXX">
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Çalışma Saatleri</label>
            <input type="text" name="working_hours" class="form-control" value="<?php echo e($c['working_hours']); ?>" placeholder="Pazartesi - Cuma: 08:30 - 18:00">
          </div>
        </div>

        <h6 class="fw-bold text-navy mt-4 mb-3 border-top pt-3">Sosyal Medya Hesapları</h6>
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <label class="form-label small fw-semibold"><i class="fa-brands fa-instagram text-danger me-1"></i>Instagram</label>
            <input type="text" name="instagram" class="form-control" value="<?php echo e($c['instagram']); ?>">
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-semibold"><i class="fa-brands fa-facebook text-primary me-1"></i>Facebook</label>
            <input type="text" name="facebook" class="form-control" value="<?php echo e($c['facebook']); ?>">
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-semibold"><i class="fa-brands fa-youtube text-danger me-1"></i>YouTube</label>
            <input type="text" name="youtube" class="form-control" value="<?php echo e($c['youtube']); ?>">
          </div>
        </div>

        <button type="submit" class="btn btn-teal fw-bold px-4">
          <i class="fa-solid fa-floppy-disk me-2"></i>Bilgileri Güncelle
        </button>
      </form>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
