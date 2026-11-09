<?php
/**
 * E-LEARN: Skorboard ve Başarı Sıralaması Yönetimi (admin/scoreboard.php)
 */

$pageTitle = 'Skorboard Yönetimi';
$activePage = 'scoreboard';
require_once __DIR__ . '/includes/admin_header.php';

// Yeniden Hesaplama İşlemi (POST)
$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'recalculate_scores') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $msg = ['type' => 'danger', 'text' => 'CSRF hatası.'];
    } else {
        // Tüm öğrencilerin skorlarını exam_attempts tablosundan tekrar hesapla
        $courses = dbSelect("SELECT id FROM courses");
        foreach ($courses as $c) {
            $cId = $c['id'];
            dbExecute(
                "INSERT INTO student_scores (student_id, course_id, total_points, success_rate, exam_count)
                 SELECT ea.student_id, ?, SUM(ea.score), AVG(ea.score), COUNT(ea.id)
                 FROM exam_attempts ea
                 WHERE ea.status = 'completed'
                 GROUP BY ea.student_id
                 ON DUPLICATE KEY UPDATE total_points = VALUES(total_points), success_rate = VALUES(success_rate), exam_count = VALUES(exam_count)",
                "i",
                [$cId]
            );
        }
        $msg = ['type' => 'success', 'text' => 'Skorboard ve başarı puanları başarıyla yeniden hesaplandı.'];
    }
}

$scoreboardRows = dbSelect(
    "SELECT sc.*, c.title as course_title, s.student_no, s.first_name, s.last_name, s.allow_scoreboard 
     FROM student_scores sc 
     JOIN courses c ON c.id = sc.course_id 
     JOIN students s ON s.id = sc.student_id 
     ORDER BY sc.course_id ASC, sc.total_points DESC"
);
?>

<?php if ($msg): ?>
  <div class="alert alert-<?php echo $msg['type']; ?> alert-dismissible fade show" role="alert">
    <?php echo e($msg['text']); ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <h6 class="text-secondary mb-0">Ders bazlı öğrenci başarı sıralaması ve puan tablosu</h6>
  <form method="POST">
    <?php echo csrfField(); ?>
    <input type="hidden" name="action" value="recalculate_scores">
    <button type="submit" class="btn btn-warning btn-sm fw-bold shadow-sm" onclick="return confirm('Puanları ve başarı oranlarını yeniden hesaplamak istiyor musunuz?');">
      <i class="fa-solid fa-arrows-rotate me-1"></i> Skorları Yeniden Hesapla
    </button>
  </form>
</div>

<div class="admin-card overflow-hidden">
  <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
    <span class="small fw-semibold text-secondary">Ana sayfada yalnızca her dersin en yüksek puanlı öğrencisi maskelenmiş olarak yayınlanır.</span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle small mb-0">
      <thead class="table-light">
        <tr>
          <th>Ders</th>
          <th>Öğrenci No</th>
          <th>Gerçek Ad Soyad</th>
          <th>Halka Açık Görünüm (KVKK)</th>
          <th class="text-center">Toplam Puan</th>
          <th class="text-center">Başarı Oranı</th>
          <th class="text-center">Sınav Sayısı</th>
          <th>Yayın İzni</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($scoreboardRows as $row): ?>
          <tr>
            <td class="fw-bold text-navy"><?php echo e($row['course_title']); ?></td>
            <td class="font-monospace fw-bold"><?php echo e($row['student_no']); ?></td>
            <td class="fw-semibold text-dark"><?php echo e($row['first_name'] . ' ' . $row['last_name']); ?></td>
            <td class="font-monospace text-primary fw-bold">
              <?php echo maskStudentName($row['first_name'], $row['last_name']); ?>
            </td>
            <td class="text-center fw-bold fs-6 text-primary"><?php echo $row['total_points']; ?></td>
            <td class="text-center fw-bold text-success">%<?php echo number_format($row['success_rate'], 1); ?></td>
            <td class="text-center"><?php echo $row['exam_count']; ?> Sınav</td>
            <td>
              <?php if ($row['allow_scoreboard']): ?>
                <span class="badge bg-success-subtle text-success">Yayınlanıyor</span>
              <?php else: ?>
                <span class="badge bg-secondary-subtle text-secondary">Öğrenci İzin Vermedi</span>
              <?php endif; ?>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
