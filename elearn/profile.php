<?php
/**
 * E-LEARN: Öğrenci Profili, Başarı Geçmişi ve Sertifikalar (/elearn/profile.php)
 */

require_once __DIR__ . '/../includes/header.php';

if (!$isStudent) {
    header("Location: /?login_required=1");
    exit;
}

$studentId = $studentUser['id'];
$student = dbSelectOne("SELECT * FROM students WHERE id = ?", "i", [$studentId]);

$pageTitle = 'Öğrenci Profilim – ' . $student['first_name'] . ' ' . $student['last_name'];

// Tamamlanan ve Devam Eden Dersler
$progressCourses = dbSelect(
    "SELECT c.id, c.title, c.category,
            COUNT(DISTINCT sp.topic_id) as completed_topics,
            (SELECT COUNT(*) FROM course_topics ct WHERE ct.course_id = c.id AND ct.is_active = 1) as total_topics
     FROM courses c
     LEFT JOIN student_progress sp ON sp.course_id = c.id AND sp.student_id = ? AND sp.is_completed = 1
     WHERE c.is_active = 1
     GROUP BY c.id",
    "i",
    [$studentId]
);

// Sınav Geçmişi
$attempts = dbSelect(
    "SELECT ea.*, 
            CASE 
              WHEN ea.exam_type = 'exam' THEN (SELECT title FROM exams WHERE id = ea.target_id)
              ELSE (SELECT title FROM tests WHERE id = ea.target_id)
            END as target_title
     FROM exam_attempts ea
     WHERE ea.student_id = ?
     ORDER BY ea.id DESC",
    "i",
    [$studentId]
);

// Sıralama Hesabı
$rankRow = dbSelectOne(
    "SELECT COUNT(*) + 1 as rank_pos FROM students WHERE total_score > ? AND status = 'active'",
    "i",
    [$student['total_score']]
);
$rank = $rankRow['rank_pos'] ?? 1;

// Toplam Öğrenci
$totalStudents = dbSelectOne("SELECT COUNT(*) as c FROM students WHERE status = 'active'")['c'] ?? 1;
?>

<div class="bg-navy py-5 text-white">
  <div class="container">
    <div class="row align-items-center g-4">
      <div class="col-md-2 text-center text-md-start">
        <div class="bg-teal text-white rounded-circle d-inline-flex align-items-center justify-content-center fw-bold fs-1 border border-3 border-white shadow" style="width: 100px; height: 100px;">
          <?php echo mb_substr($student['first_name'], 0, 1) . mb_substr($student['last_name'], 0, 1); ?>
        </div>
      </div>
      <div class="col-md-7">
        <div class="badge bg-white bg-opacity-10 text-teal mb-2">No: <?php echo e($student['student_no']); ?></div>
        <h1 class="h2 fw-bold mb-1"><?php echo e($student['first_name'] . ' ' . $student['last_name']); ?></h1>
        <p class="text-white-50 small mb-0">
          <i class="fa-solid fa-envelope me-1"></i> <?php echo e($student['email']); ?> 
          <?php if (!empty($student['phone'])): ?>
            • <i class="fa-solid fa-phone me-1"></i> <?php echo e($student['phone']); ?>
          <?php endif; ?>
        </p>
      </div>
      <div class="col-md-3 text-md-end">
        <a href="/elearn/logout.php" class="btn btn-outline-danger btn-sm">
          <i class="fa-solid fa-arrow-right-from-bracket me-1"></i> Oturumu Kapat
        </a>
      </div>
    </div>
  </div>
</div>

<div class="container py-5">
  <!-- 4 İstatistik Kartı -->
  <div class="row g-4 mb-5">
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm p-4 rounded-4 text-center h-100">
        <div class="text-muted small fw-semibold">Toplam Kazanılan Puan</div>
        <div class="fs-2 fw-black text-primary mt-1"><?php echo $student['total_score']; ?></div>
        <div class="small text-success mt-1"><i class="fa-solid fa-star me-1"></i>Akademik Seviye</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm p-4 rounded-4 text-center h-100">
        <div class="text-muted small fw-semibold">Genel Sıralama</div>
        <div class="fs-2 fw-black text-warning mt-1">#<?php echo $rank; ?></div>
        <div class="small text-muted mt-1"><?php echo $totalStudents; ?> Öğrenci Arasında</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm p-4 rounded-4 text-center h-100">
        <div class="text-muted small fw-semibold">Katılınan Sınavlar</div>
        <div class="fs-2 fw-black text-navy mt-1"><?php echo count($attempts); ?></div>
        <div class="small text-muted mt-1">Test & Vize Girişimi</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm p-4 rounded-4 text-center h-100">
        <div class="text-muted small fw-semibold">Hak Edilen Sertifikalar</div>
        <div class="fs-2 fw-black text-teal mt-1"><?php echo $student['total_score'] >= 100 ? 1 : 0; ?></div>
        <div class="small text-muted mt-1">Başarı Belgesi</div>
      </div>
    </div>
  </div>

  <div class="row g-5">
    <!-- Sol Kolon: Ders İlerlemeleri -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm p-4 rounded-4 h-100">
        <h4 class="fw-bold text-navy mb-4 d-flex align-items-center justify-content-between">
          <span><i class="fa-solid fa-chart-pie text-teal me-2"></i>Ders İlerleme Durumu</span>
          <span class="badge bg-light text-muted border"><?php echo count($progressCourses); ?> Ders</span>
        </h4>

        <div class="space-y-4">
          <?php foreach ($progressCourses as $pc): ?>
            <?php 
              $totalT = max(1, (int)$pc['total_topics']);
              $compT = (int)$pc['completed_topics'];
              $pct = round(($compT / $totalT) * 100);
            ?>
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <h6 class="fw-bold text-navy mb-0"><?php echo e($pc['title']); ?></h6>
                  <span class="text-muted small"><?php echo $compT; ?> / <?php echo $totalT; ?> Konu Tamamlandı</span>
                </div>
                <span class="badge bg-teal fw-bold">%<?php echo $pct; ?></span>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-teal" role="progressbar" style="width: <?php echo $pct; ?>%"></div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

    <!-- Sağ Kolon: Sınav Geçmişi -->
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm p-4 rounded-4 h-100">
        <h4 class="fw-bold text-navy mb-4 d-flex align-items-center justify-content-between">
          <span><i class="fa-solid fa-clock-rotate-left text-teal me-2"></i>Sınav ve Test Geçmişi</span>
          <span class="badge bg-light text-muted border"><?php echo count($attempts); ?> Girişim</span>
        </h4>

        <?php if (empty($attempts)): ?>
          <div class="text-center py-5 text-muted">
            <i class="fa-solid fa-file-circle-question fs-1 mb-3 text-secondary"></i>
            <p>Henüz katıldığınız bir test veya vize sınavı bulunmuyor.</p>
            <a href="/elearn/" class="btn btn-outline-primary btn-sm">Derslere Göz At</a>
          </div>
        <?php else: ?>
          <div class="table-responsive">
            <table class="table table-hover align-middle small">
              <thead class="table-light">
                <tr>
                  <th>Sınav / Test</th>
                  <th>Tür</th>
                  <th class="text-center">Puan</th>
                  <th class="text-center">Durum</th>
                  <th class="text-end">Rapor</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($attempts as $att): ?>
                  <tr>
                    <td class="fw-semibold text-navy">
                      <?php echo e($att['target_title'] ?? 'Değerlendirme Sınavı'); ?>
                      <div class="text-muted small"><?php echo formatDateTime($att['completed_at']); ?></div>
                    </td>
                    <td>
                      <span class="badge <?php echo $att['exam_type'] === 'exam' ? 'bg-warning text-dark' : 'bg-secondary'; ?>">
                        <?php echo $att['exam_type'] === 'exam' ? 'Vize Sınavı' : 'Konu Testi'; ?>
                      </span>
                    </td>
                    <td class="text-center fw-bold fs-6">
                      <?php echo number_format($att['score'], 1); ?>
                    </td>
                    <td class="text-center">
                      <?php if ($att['passed']): ?>
                        <span class="badge bg-success">Geçti</span>
                      <?php else: ?>
                        <span class="badge bg-danger">Kaldı</span>
                      <?php endif; ?>
                    </td>
                    <td class="text-end">
                      <a href="/elearn/result.php?attempt_id=<?php echo $att['id']; ?>" class="btn btn-outline-primary btn-sm py-0">
                        İncele
                      </a>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
