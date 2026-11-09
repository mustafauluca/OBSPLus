<?php
/**
 * E-LEARN: Sınav ve Test Sonuçları Yönetimi (admin/results.php)
 */

$pageTitle = 'Sınav Sonuçları ve Değerlendirme';
$activePage = 'results';
require_once __DIR__ . '/includes/admin_header.php';

$filterType = trim($_GET['type'] ?? '');
$filterExamId = (int)($_GET['exam_id'] ?? 0);
$search = trim($_GET['q'] ?? '');

$sql = "SELECT ea.*, s.student_no, s.first_name, s.last_name, s.email,
        CASE 
          WHEN ea.exam_type = 'exam' THEN (SELECT title FROM exams WHERE id = ea.target_id)
          ELSE (SELECT title FROM tests WHERE id = ea.target_id)
        END as target_title
        FROM exam_attempts ea
        JOIN students s ON s.id = ea.student_id
        WHERE 1=1";
$params = [];
$types = '';

if (!empty($filterType)) {
    $sql .= " AND ea.exam_type = ?";
    $params[] = $filterType;
    $types .= 's';
}
if ($filterExamId > 0) {
    $sql .= " AND ea.target_id = ? AND ea.exam_type = 'exam'";
    $params[] = $filterExamId;
    $types .= 'i';
}
if (!empty($search)) {
    $sql .= " AND (s.student_no LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $types .= 'sss';
}

$sql .= " ORDER BY ea.id DESC LIMIT 100";
$results = dbSelect($sql, $types, $params);
?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <form method="GET" class="d-flex gap-2">
    <select name="type" class="form-select form-select-sm" onchange="this.form.submit()">
      <option value="">Tüm Sınav Türleri</option>
      <option value="exam" <?php echo $filterType === 'exam' ? 'selected' : ''; ?>>Vize Sınavları</option>
      <option value="quiz" <?php echo $filterType === 'quiz' ? 'selected' : ''; ?>>Konu Testleri</option>
    </select>
    <input type="text" name="q" value="<?php echo e($search); ?>" class="form-control form-control-sm" placeholder="Öğrenci no veya ad...">
    <button type="submit" class="btn btn-primary btn-sm fw-bold">Ara</button>
  </form>
</div>

<div class="admin-card overflow-hidden">
  <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
    <span class="small fw-semibold text-secondary">Toplam <strong><?php echo count($results); ?></strong> Tamamlanan Sınav Kaydı</span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle small mb-0">
      <thead class="table-light">
        <tr>
          <th>Girişim ID</th>
          <th>Öğrenci No</th>
          <th>Adı Soyadı</th>
          <th>Sınav / Modül</th>
          <th>Tür</th>
          <th class="text-center">Doğru / Yanlış / Boş</th>
          <th class="text-center">Puan</th>
          <th class="text-center">Durum</th>
          <th>Tarih</th>
          <th class="text-end">Rapor</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($results)): ?>
          <tr><td colspan="10" class="text-center text-muted py-4">Sınav sonucu bulunamadı.</td></tr>
        <?php else: ?>
          <?php foreach ($results as $r): ?>
            <tr>
              <td class="text-muted">#<?php echo $r['id']; ?></td>
              <td class="font-monospace fw-bold text-navy"><?php echo e($r['student_no']); ?></td>
              <td class="fw-semibold text-dark"><?php echo e($r['first_name'] . ' ' . $r['last_name']); ?></td>
              <td><?php echo e($r['target_title'] ?? 'Değerlendirme Sınavı'); ?></td>
              <td>
                <span class="badge <?php echo $r['exam_type'] === 'exam' ? 'bg-warning text-dark' : 'bg-secondary'; ?>">
                  <?php echo $r['exam_type'] === 'exam' ? 'Vize' : 'Quiz'; ?>
                </span>
              </td>
              <td class="text-center">
                <span class="text-success fw-bold"><?php echo $r['correct_count']; ?> D</span> • 
                <span class="text-danger fw-bold"><?php echo $r['wrong_count']; ?> Y</span> • 
                <span class="text-muted"><?php echo $r['empty_count']; ?> B</span>
              </td>
              <td class="text-center fw-bold fs-6 <?php echo $r['passed'] ? 'text-success' : 'text-danger'; ?>">
                <?php echo number_format($r['score'], 1); ?>
              </td>
              <td class="text-center">
                <span class="badge <?php echo $r['passed'] ? 'bg-success' : 'bg-danger'; ?>">
                  <?php echo $r['passed'] ? 'GEÇTİ' : 'KALDI'; ?>
                </span>
              </td>
              <td class="text-muted"><?php echo formatDateTime($r['completed_at']); ?></td>
              <td class="text-end">
                <a href="/elearn/result.php?attempt_id=<?php echo $r['id']; ?>" target="_blank" class="btn btn-outline-primary btn-sm py-0">
                  İncele
                </a>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
