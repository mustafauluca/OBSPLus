<?php
/**
 * E-LEARN: Öğrenci Yönetimi (admin/students.php)
 */

$pageTitle = 'Öğrenci Yönetimi';
$activePage = 'students';
require_once __DIR__ . '/includes/admin_header.php';

// Durum Değiştirme (Aktif / Askıya Al)
if (isset($_GET['toggle_status']) && isset($_GET['id'])) {
    $stdId = (int)$_GET['id'];
    $currentStatus = $_GET['toggle_status'];
    $newStatus = $currentStatus === 'active' ? 'suspended' : 'active';
    dbExecute("UPDATE students SET status = ? WHERE id = ?", "si", [$newStatus, $stdId]);
    logAuditAction('admin', $admin['id'], 'student_status_change', getClientIp(), "Öğrenci #$stdId durumu $newStatus yapıldı.");
    header("Location: /admin/students.php");
    exit;
}

// Yeni Öğrenci Ekleme (POST)
$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_student') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $msg = ['type' => 'danger', 'text' => 'CSRF hatası.'];
    } else {
        $res = registerStudent($_POST);
        $msg = ['type' => $res['success'] ? 'success' : 'danger', 'text' => $res['message']];
    }
}

$search = trim($_GET['q'] ?? '');
$sql = "SELECT s.*, 
        (SELECT COUNT(*) FROM exam_attempts ea WHERE ea.student_id = s.id) as total_exams 
        FROM students s WHERE 1=1";
$params = [];
$types = '';

if (!empty($search)) {
    $sql .= " AND (s.student_no LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ?)";
    $params = array_fill(0, 4, "%$search%");
    $types = 'ssss';
}

$sql .= " ORDER BY s.id DESC";
$students = dbSelect($sql, $types, $params);
?>

<?php if ($msg): ?>
  <div class="alert alert-<?php echo $msg['type']; ?> alert-dismissible fade show" role="alert">
    <?php echo e($msg['text']); ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <form method="GET" class="d-flex gap-2" style="max-width: 360px;">
    <input type="text" name="q" value="<?php echo e($search); ?>" class="form-control form-control-sm" placeholder="Öğrenci no, ad veya e-posta...">
    <button type="submit" class="btn btn-primary btn-sm fw-bold">Ara</button>
  </form>
  <button class="btn btn-teal btn-sm fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#addStudentModal">
    <i class="fa-solid fa-user-plus me-1"></i> Yeni Öğrenci Tanımla
  </button>
</div>

<div class="admin-card overflow-hidden">
  <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
    <span class="small fw-semibold text-secondary">Toplam <strong><?php echo count($students); ?></strong> Kayıtlı Öğrenci</span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle small mb-0">
      <thead class="table-light">
        <tr>
          <th>Öğrenci No</th>
          <th>Adı Soyadı</th>
          <th>E-Posta / Telefon</th>
          <th class="text-center">Toplam Puan</th>
          <th class="text-center">Sınav Sayısı</th>
          <th class="text-center">Skorboard İzni</th>
          <th>Durum</th>
          <th class="text-end">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($students as $s): ?>
          <tr>
            <td class="font-monospace fw-bold text-navy"><?php echo e($s['student_no']); ?></td>
            <td class="fw-semibold text-dark"><?php echo e($s['first_name'] . ' ' . $s['last_name']); ?></td>
            <td>
              <div><?php echo e($s['email']); ?></div>
              <div class="text-muted" style="font-size: 11px;"><?php echo e($s['phone'] ?: '-'); ?></div>
            </td>
            <td class="text-center fw-bold fs-6 text-primary"><?php echo $s['total_score']; ?></td>
            <td class="text-center"><?php echo $s['total_exams']; ?></td>
            <td class="text-center">
              <?php if ($s['allow_scoreboard']): ?>
                <span class="badge bg-success-subtle text-success">İzinli (<?php echo maskStudentName($s['first_name'], $s['last_name']); ?>)</span>
              <?php else: ?>
                <span class="badge bg-secondary-subtle text-secondary">Gizli</span>
              <?php endif; ?>
            </td>
            <td>
              <span class="badge <?php echo $s['status'] === 'active' ? 'bg-success' : 'bg-danger'; ?>">
                <?php echo $s['status'] === 'active' ? 'Aktif' : 'Askıda'; ?>
              </span>
            </td>
            <td class="text-end">
              <a href="?toggle_status=<?php echo $s['status']; ?>&id=<?php echo $s['id']; ?>" class="btn btn-outline-<?php echo $s['status'] === 'active' ? 'warning' : 'success'; ?> btn-sm py-0" onclick="return confirm('Öğrenci durumunu değiştirmek istediğinize emin misiniz?');">
                <?php echo $s['status'] === 'active' ? 'Askıya Al' : 'Aktifleştir'; ?>
              </a>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- Yeni Öğrenci Ekleme Modali -->
<div class="modal fade" id="addStudentModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header bg-navy text-white">
        <h6 class="modal-title fw-bold">Yeni Öğrenci Tanımla</h6>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form method="POST">
        <?php echo csrfField(); ?>
        <input type="hidden" name="action" value="add_student">
        <div class="modal-body p-4 small">
          <div class="mb-2">
            <label class="form-label fw-semibold">Öğrenci Numarası</label>
            <input type="text" name="student_no" class="form-control form-control-sm" required placeholder="202610109">
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-semibold">Ad</label>
              <input type="text" name="first_name" class="form-control form-control-sm" required>
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Soyad</label>
              <input type="text" name="last_name" class="form-control form-control-sm" required>
            </div>
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">E-Posta</label>
            <input type="email" name="email" class="form-control form-control-sm" required>
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Şifre</label>
            <input type="password" name="password" class="form-control form-control-sm" required minlength="6">
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Şifre Tekrar</label>
            <input type="password" name="password_confirm" class="form-control form-control-sm" required minlength="6">
          </div>
          <input type="hidden" name="kvkk_accepted" value="1">
          <input type="hidden" name="allow_scoreboard" value="1">
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">İptal</button>
          <button type="submit" class="btn btn-teal btn-sm fw-bold">Öğrenciyi Kaydet</button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
