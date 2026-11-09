<?php
/**
 * E-LEARN: Site Ayarları ve KVKK Yapılandırması (admin/settings.php)
 */

$pageTitle = 'Site Ayarları & KVKK Yönetimi';
$activePage = 'settings';
require_once __DIR__ . '/includes/admin_header.php';

$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $msg = ['type' => 'danger', 'text' => 'CSRF hatası.'];
    } else {
        $keys = [
            'site_name', 'site_title', 'site_description', 
            'footer_text', 'kvkk_text', 'about_summary',
            'data_retention_days', 'rate_limit_max_attempts', 'rate_limit_block_minutes'
        ];

        foreach ($keys as $k) {
            if (isset($_POST[$k])) {
                dbExecute(
                    "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE setting_value = ?",
                    "sss",
                    [$k, $_POST[$k], $_POST[$k]]
                );
            }
        }

        $msg = ['type' => 'success', 'text' => 'Site ve güvenlik ayarları başarıyla güncellendi.'];
    }
}
?>

<?php if ($msg): ?>
  <div class="alert alert-<?php echo $msg['type']; ?> alert-dismissible fade show" role="alert">
    <?php echo e($msg['text']); ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="row justify-content-center">
  <div class="col-lg-9">
    <div class="admin-card p-4">
      <h6 class="fw-bold text-navy mb-4"><i class="fa-solid fa-sliders text-teal me-2"></i>Platform ve Güvenlik Parametreleri</h6>

      <form method="POST">
        <?php echo csrfField(); ?>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Platform Adı</label>
            <input type="text" name="site_name" class="form-control" value="<?php echo e(getSiteSetting('site_name')); ?>" required>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-semibold">Tarayıcı Başlığı (Title)</label>
            <input type="text" name="site_title" class="form-control" value="<?php echo e(getSiteSetting('site_title')); ?>" required>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-semibold">Site Açıklaması (Meta Description)</label>
          <textarea name="site_description" rows="2" class="form-control"><?php echo e(getSiteSetting('site_description')); ?></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-semibold">Hakkımızda Özeti</label>
          <textarea name="about_summary" rows="2" class="form-control"><?php echo e(getSiteSetting('about_summary')); ?></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label small fw-semibold">Footer Alt Bilgi Metni</label>
          <input type="text" name="footer_text" class="form-control" value="<?php echo e(getSiteSetting('footer_text')); ?>">
        </div>

        <h6 class="fw-bold text-navy mt-4 mb-3 border-top pt-3">
          <i class="fa-solid fa-shield-halved text-success me-2"></i>KVKK ve Veri Güvenliği Ayarları
        </h6>

        <div class="row g-3 mb-3">
          <div class="col-md-4">
            <label class="form-label small fw-semibold">Log Saklama Süresi (Gün)</label>
            <input type="number" name="data_retention_days" class="form-control" value="<?php echo e(getSiteSetting('data_retention_days', '365')); ?>">
            <div class="form-text small">Bu süreden eski ziyaretçi ve giriş logları temizlenebilir.</div>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-semibold">Azami Hatalı Giriş Sayısı</label>
            <input type="number" name="rate_limit_max_attempts" class="form-control" value="<?php echo e(getSiteSetting('rate_limit_max_attempts', '5')); ?>">
            <div class="form-text small">Eşik aşılınca IP engellenir.</div>
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-semibold">IP Engelleme Süresi (Dakika)</label>
            <input type="number" name="rate_limit_block_minutes" class="form-control" value="<?php echo e(getSiteSetting('rate_limit_block_minutes', '15')); ?>">
            <div class="form-text small">Geçici engelleme müddeti.</div>
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label small fw-semibold">KVKK Aydınlatma Metni İçeriği</label>
          <textarea name="kvkk_text" rows="5" class="form-control"><?php echo e(getSiteSetting('kvkk_text')); ?></textarea>
        </div>

        <button type="submit" class="btn btn-teal fw-bold px-4">
          <i class="fa-solid fa-floppy-disk me-2"></i>Ayarları Kaydet
        </button>
      </form>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
