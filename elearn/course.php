<?php
/**
 * E-LEARN: Ders Detayı ve Konu Listesi (/elearn/course.php)
 */

$courseId = (int)($_GET['id'] ?? 0);
require_once __DIR__ . '/../includes/header.php';

$course = dbSelectOne("SELECT * FROM courses WHERE id = ? AND is_active = 1", "i", [$courseId]);

if (!$course) {
    echo "<div class='container py-5 text-center'><h3>Ders bulunamadı veya pasif durumdadır.</h3><a href='/elearn/' class='btn btn-primary mt-3'>Kataloğa Dön</a></div>";
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

$pageTitle = $course['title'] . ' – E-LEARN';

// Konular
$topics = dbSelect("SELECT * FROM course_topics WHERE course_id = ? AND is_active = 1 ORDER BY sort_order ASC", "i", [$courseId]);

// Materyaller
$materials = dbSelect("SELECT * FROM course_materials WHERE course_id = ? ORDER BY id DESC", "i", [$courseId]);

// Vize Sınavı
$exam = dbSelectOne("SELECT * FROM exams WHERE course_id = ? AND is_active = 1 AND NOW() BETWEEN start_date AND end_date", "i", [$courseId]);

// Öğrenci İlerleme Durumu
$completedTopicIds = [];
if ($isStudent && $studentUser) {
    $progressRows = dbSelect("SELECT topic_id FROM student_progress WHERE student_id = ? AND course_id = ? AND is_completed = 1", "ii", [$studentUser['id'], $courseId]);
    $completedTopicIds = array_column($progressRows, 'topic_id');
}
?>

<div class="bg-navy py-5 text-white">
  <div class="container">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb mb-2 small">
        <li class="breadcrumb-item"><a href="/" class="text-white-50 text-decoration-none">Ana Sayfa</a></li>
        <li class="breadcrumb-item"><a href="/elearn/" class="text-white-50 text-decoration-none">Dersler</a></li>
        <li class="breadcrumb-item active text-teal" aria-current="page"><?php echo e($course['title']); ?></li>
      </ol>
    </nav>
    <div class="row align-items-center g-4">
      <div class="col-lg-8">
        <span class="badge bg-teal mb-2"><?php echo e($course['category']); ?></span>
        <h1 class="display-6 fw-bold"><?php echo e($course['title']); ?></h1>
        <p class="lead text-white-50 small mb-0"><?php echo e($course['description']); ?></p>
      </div>
      <div class="col-lg-4 text-lg-end">
        <?php if ($exam): ?>
          <a href="/elearn/exam.php?id=<?php echo $exam['id']; ?>" class="btn btn-warning btn-lg fw-bold px-4 shadow">
            <i class="fa-solid fa-file-pen me-2"></i>Dönem Sonu Vize Sınavı
          </a>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<div class="container py-5">
  <div class="row g-4">
    <!-- Konu Listesi -->
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm p-4 rounded-4 mb-4">
        <h4 class="fw-bold text-navy mb-4 d-flex align-items-center justify-content-between">
          <span><i class="fa-solid fa-list-check text-teal me-2"></i>Ders Konuları ve Modülleri</span>
          <span class="badge bg-secondary-subtle text-secondary fs-6"><?php echo count($topics); ?> Konu</span>
        </h4>

        <?php if (empty($topics)): ?>
          <div class="alert alert-info small">Bu ders için henüz aktif konu eklenmemiştir.</div>
        <?php else: ?>
          <div class="list-group list-group-flush">
            <?php foreach ($topics as $index => $t): ?>
              <?php $isDone = in_array($t['id'], $completedTopicIds, true); ?>
              <div class="list-group-item px-0 py-3 d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-3">
                  <span class="badge <?php echo $isDone ? 'bg-success' : 'bg-primary-subtle text-primary'; ?> rounded-circle p-2" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                    <?php echo $isDone ? '<i class="fa-solid fa-check"></i>' : ($index + 1); ?>
                  </span>
                  <div>
                    <h6 class="mb-1 fw-bold text-navy">
                      <a href="/elearn/topic.php?id=<?php echo $t['id']; ?>" class="text-decoration-none text-navy hover-teal">
                        <?php echo e($t['title']); ?>
                      </a>
                    </h6>
                    <p class="mb-0 text-muted small"><?php echo e($t['short_summary'] ?? 'Konu anlatımı ve test soruları.'); ?></p>
                  </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <a href="/elearn/topic.php?id=<?php echo $t['id']; ?>" class="btn btn-outline-primary btn-sm fw-semibold">
                    Anlatımı Aç
                  </a>
                  <a href="/elearn/test.php?topic_id=<?php echo $t['id']; ?>" class="btn btn-teal btn-sm fw-bold">
                    Testi Çöz
                  </a>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
    </div>

    <!-- Yan Panel: Vize Sınavı & Materyaller -->
    <div class="col-lg-4">
      <?php if ($exam): ?>
        <div class="card border-0 shadow-sm p-4 rounded-4 mb-4 bg-warning bg-opacity-10 border border-warning border-opacity-25">
          <div class="d-flex align-items-center gap-2 text-warning-emphasis fw-bold mb-2">
            <i class="fa-solid fa-bell"></i> Resmi Vize Sınavı Aktif
          </div>
          <h5 class="fw-bold text-navy"><?php echo e($exam['title']); ?></h5>
          <p class="text-muted small"><?php echo e($exam['description']); ?></p>
          <ul class="list-unstyled small text-secondary mb-3">
            <li class="mb-1"><i class="fa-regular fa-clock me-2 text-warning-emphasis"></i>Süre: <strong><?php echo $exam['duration_minutes']; ?> Dakika</strong></li>
            <li class="mb-1"><i class="fa-solid fa-check-double me-2 text-warning-emphasis"></i>Geçme Notu: <strong><?php echo $exam['passing_grade']; ?> / 100</strong></li>
            <li class="mb-1"><i class="fa-solid fa-arrow-rotate-left me-2 text-warning-emphasis"></i>Azami Hak: <strong><?php echo $exam['max_attempts']; ?> Girişim</strong></li>
          </ul>
          <a href="/elearn/exam.php?id=<?php echo $exam['id']; ?>" class="btn btn-warning w-100 fw-bold shadow-sm">
            Sınava Giriş Yap →
          </a>
        </div>
      <?php endif; ?>

      <div class="card border-0 shadow-sm p-4 rounded-4">
        <h5 class="fw-bold text-navy mb-3"><i class="fa-solid fa-file-pdf text-danger me-2"></i>Ders Materyalleri</h5>
        <?php if (empty($materials)): ?>
          <p class="text-muted small">Bu derse ait henüz ek materyal yüklenmemiştir.</p>
        <?php else: ?>
          <ul class="list-group list-group-flush">
            <?php foreach ($materials as $m): ?>
              <li class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center small">
                <span><i class="fa-regular fa-file-lines me-2 text-primary"></i><?php echo e($m['title']); ?></span>
                <a href="<?php echo e($m['file_path']); ?>" target="_blank" class="btn btn-outline-secondary btn-sm py-0">İndir</a>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
