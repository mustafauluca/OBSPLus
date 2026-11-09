<?php
/**
 * E-LEARN: Vize Sınavları Yönetimi (admin/exams.php)
 */

$pageTitle = 'Vize Sınavları Yönetimi';
$activePage = 'exams';
require_once __DIR__ . '/includes/admin_header.php';

$courses = dbSelect("SELECT id, title FROM courses ORDER BY sort_order ASC");

// Sınav Kaydet (POST)
$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_exam') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $msg = ['type' => 'danger', 'text' => 'CSRF hatası.'];
    } else {
        $examId = (int)($_POST['exam_id'] ?? 0);
        $courseId = (int)($_POST['course_id'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $duration = (int)($_POST['duration_minutes'] ?? 30);
        $passingGrade = (int)($_POST['passing_grade'] ?? 50);
        $qCount = (int)($_POST['question_count'] ?? 10);
        $maxAttempts = (int)($_POST['max_attempts'] ?? 2);
        $startDate = $_POST['start_date'] ?? date('Y-m-d H:i:s');
        $endDate = $_POST['end_date'] ?? date('Y-m-d H:i:s', strtotime('+1 year'));
        $isActive = !empty($_POST['is_active']) ? 1 : 0;

        if ($examId > 0) {
            dbExecute(
                "UPDATE exams SET course_id = ?, title = ?, description = ?, duration_minutes = ?, passing_grade = ?, question_count = ?, max_attempts = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?",
                "issiiiissii",
                [$courseId, $title, $description, $duration, $passingGrade, $qCount, $maxAttempts, $startDate, $endDate, $isActive, $examId]
            );
            $msg = ['type' => 'success', 'text' => 'Vize sınavı başarıyla güncellendi.'];
        } else {
            dbExecute(
                "INSERT INTO exams (course_id, title, description, duration_minutes, passing_grade, question_count, max_attempts, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                "issiiiissi",
                [$courseId, $title, $description, $duration, $passingGrade, $qCount, $maxAttempts, $startDate, $endDate, $isActive]
            );
            $msg = ['type' => 'success', 'text' => 'Yeni vize sınavı oluşturuldu.'];
        }
    }
}

// Sınav Sil
if (isset($_GET['delete_id'])) {
    $delId = (int)$_GET['delete_id'];
    dbExecute("DELETE FROM exams WHERE id = ?", "i", [$delId]);
    header("Location: /admin/exams.php");
    exit;
}

$exams = dbSelect(
    "SELECT e.*, c.title as course_title,
     (SELECT COUNT(*) FROM exam_attempts WHERE target_id = e.id AND exam_type = 'exam') as attempt_count
     FROM exams e
     JOIN courses c ON c.id = e.course_id
     ORDER BY e.id DESC"
);
?>

<?php if ($msg): ?>
  <div class="alert alert-<?php echo $msg['type']; ?> alert-dismissible fade show" role="alert">
    <?php echo e($msg['text']); ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <h6 class="text-secondary mb-0">Ders bazlı online dönem sonu vize sınavları</h6>
  <button class="btn btn-teal btn-sm fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#examModal" onclick="resetExamForm()">
    <i class="fa-solid fa-plus me-1"></i> Yeni Vize Sınavı Tanımla
  </button>
</div>

<div class="admin-card overflow-hidden">
  <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
    <span class="small fw-semibold text-secondary">Toplam <strong><?php echo count($exams); ?></strong> Sınav Tanımlı</span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle small mb-0">
      <thead class="table-light">
        <tr>
          <th>Ders</th>
          <th>Sınav Başlığı</th>
          <th class="text-center">Süre (Dk)</th>
          <th class="text-center">Soru Sayısı</th>
          <th class="text-center">Geçme Notu</th>
          <th class="text-center">Azami Hak</th>
          <th>Tarih Aralığı</th>
          <th>Durum</th>
          <th class="text-end">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($exams as $ex): ?>
          <tr>
            <td class="fw-bold text-navy"><?php echo e($ex['course_title']); ?></td>
            <td class="fw-semibold text-dark">
              <?php echo e($ex['title']); ?>
              <div class="text-muted small"><?php echo $ex['attempt_count']; ?> Öğrenci Katıldı</div>
            </td>
            <td class="text-center"><?php echo $ex['duration_minutes']; ?> dk</td>
            <td class="text-center"><?php echo $ex['question_count']; ?> Soru</td>
            <td class="text-center fw-bold text-success"><?php echo $ex['passing_grade']; ?></td>
            <td class="text-center"><?php echo $ex['max_attempts']; ?></td>
            <td class="text-muted" style="font-size: 11px;">
              <?php echo date('d.m.Y', strtotime($ex['start_date'])); ?> - <?php echo date('d.m.Y', strtotime($ex['end_date'])); ?>
            </td>
            <td>
              <span class="badge <?php echo $ex['is_active'] ? 'bg-success' : 'bg-danger'; ?>">
                <?php echo $ex['is_active'] ? 'Aktif' : 'Pasif'; ?>
              </span>
            </td>
            <td class="text-end">
              <a href="/admin/results.php?exam_id=<?php echo $ex['id']; ?>" class="btn btn-outline-primary btn-sm py-0 me-1">Sonuçlar</a>
              <a href="?delete_id=<?php echo $ex['id']; ?>" class="btn btn-light btn-sm text-danger py-0" onclick="return confirm('Sınavı silmek istediğinize emin misiniz?');">
                <i class="fa-solid fa-trash"></i>
              </a>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- Vize Sınavı Ekleme Modali -->
<div class="modal fade" id="examModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-navy text-white">
        <h6 class="modal-title fw-bold">Yeni Vize Sınavı Tanımla</h6>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form method="POST">
        <?php echo csrfField(); ?>
        <input type="hidden" name="action" value="save_exam">
        <input type="hidden" name="exam_id" id="examId" value="0">
        <div class="modal-body p-4 small">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Ders Seçimi</label>
              <select name="course_id" id="examCourseId" class="form-select form-select-sm" required>
                <?php foreach ($courses as $c): ?>
                  <option value="<?php echo $c['id']; ?>"><?php echo e($c['title']); ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Sınav Başlığı</label>
              <input type="text" name="title" id="examTitle" class="form-control form-control-sm" required placeholder="Örn: 2026 Bahar Dönemi Vize Sınavı">
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Sınav Açıklaması ve Yönergesi</label>
            <textarea name="description" id="examDescription" rows="2" class="form-control form-control-sm" placeholder="Sınav kuralları ve kapsamı"></textarea>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-3">
              <label class="form-label fw-semibold">Süre (Dakika)</label>
              <input type="number" name="duration_minutes" id="examDuration" class="form-control form-control-sm" value="30">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Geçme Notu (0-100)</label>
              <input type="number" name="passing_grade" id="examPassingGrade" class="form-control form-control-sm" value="50">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Soru Sayısı</label>
              <input type="number" name="question_count" id="examQuestionCount" class="form-control form-control-sm" value="10">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-semibold">Tekrar Giriş Hakkı</label>
              <input type="number" name="max_attempts" id="examMaxAttempts" class="form-control form-control-sm" value="2">
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Başlangıç Tarihi</label>
              <input type="datetime-local" name="start_date" id="examStartDate" class="form-control form-control-sm" value="<?php echo date('Y-m-d\TH:i'); ?>">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Bitiş Tarihi</label>
              <input type="datetime-local" name="end_date" id="examEndDate" class="form-control form-control-sm" value="<?php echo date('Y-m-d\TH:i', strtotime('+3 months')); ?>">
            </div>
          </div>

          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="is_active" id="examIsActive" value="1" checked>
            <label class="form-check-label fw-semibold" for="examIsActive">Sınavı Aktifleştir / Yayına Al</label>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">İptal</button>
          <button type="submit" class="btn btn-teal btn-sm fw-bold">Sınavı Kaydet</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
  function resetExamForm() {
    document.getElementById('examId').value = '0';
    document.getElementById('examTitle').value = '';
    document.getElementById('examDescription').value = '';
    document.getElementById('examDuration').value = '30';
    document.getElementById('examPassingGrade').value = '50';
    document.getElementById('examQuestionCount').value = '10';
    document.getElementById('examMaxAttempts').value = '2';
    document.getElementById('examIsActive').checked = true;
  }
</script>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
