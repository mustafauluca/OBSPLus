<?php
/**
 * E-LEARN: Sınav ve Test Sonuç Değerlendirme Ekranı (/elearn/result.php)
 */

$attemptId = (int)($_GET['attempt_id'] ?? 0);
require_once __DIR__ . '/../includes/header.php';

$attempt = dbSelectOne("SELECT * FROM exam_attempts WHERE id = ?", "i", [$attemptId]);

if (!$attempt) {
    echo "<div class='container py-5 text-center'><h3>Sınav sonucu bulunamadı.</h3><a href='/elearn/' class='btn btn-primary mt-3'>Kataloğa Dön</a></div>";
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

$pageTitle = 'Sınav Değerlendirme Raporu – E-LEARN';

// Cevap Detaylarını Çek
$answers = dbSelect(
    "SELECT ea.*, q.question_text, q.explanation, q.points,
            qo_chosen.option_key as chosen_key, qo_chosen.option_text as chosen_text,
            qo_correct.option_key as correct_key, qo_correct.option_text as correct_text
     FROM exam_answers ea
     JOIN questions q ON q.id = ea.question_id
     LEFT JOIN question_options qo_chosen ON qo_chosen.id = ea.chosen_option_id
     LEFT JOIN question_options qo_correct ON qo_correct.question_id = q.id AND qo_correct.is_correct = 1
     WHERE ea.attempt_id = ?
     ORDER BY ea.id ASC",
    "i",
    [$attemptId]
);

$passed = (bool)$attempt['passed'];
?>

<div class="bg-navy py-4 text-white">
  <div class="container text-center">
    <span class="badge <?php echo $passed ? 'bg-success' : 'bg-danger'; ?> fs-6 px-3 py-1 mb-2">
      <?php echo $passed ? '<i class="fa-solid fa-circle-check me-1"></i> Başarılı (GEÇTİ)' : '<i class="fa-solid fa-circle-xmark me-1"></i> Başarısız (KALDI)'; ?>
    </span>
    <h1 class="h2 fw-bold mb-1">Sınav Değerlendirme ve Başarı Karnesi</h1>
    <p class="text-white-50 small mb-0">İşlem Tarihi: <?php echo formatDateTime($attempt['completed_at']); ?></p>
  </div>
</div>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-lg-10">

      <!-- Puan ve İstatistik Kartı -->
      <div class="card border-0 shadow-sm p-4 rounded-4 mb-4 text-center">
        <div class="row g-4 align-items-center">
          <div class="col-md-3 border-end">
            <div class="text-muted small fw-semibold">Alınan Puan</div>
            <div class="display-5 fw-black <?php echo $passed ? 'text-success' : 'text-danger'; ?>">
              <?php echo number_format($attempt['score'], 1); ?>
            </div>
            <div class="small text-muted">/ 100 Tam Puan</div>
          </div>
          <div class="col-md-9">
            <div class="row text-center g-3">
              <div class="col-4">
                <div class="p-3 bg-success-subtle text-success rounded-3">
                  <div class="fs-4 fw-bold"><?php echo $attempt['correct_count']; ?></div>
                  <div class="small fw-semibold">Doğru Cevap</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-3 bg-danger-subtle text-danger rounded-3">
                  <div class="fs-4 fw-bold"><?php echo $attempt['wrong_count']; ?></div>
                  <div class="small fw-semibold">Yanlış Cevap</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-3 bg-secondary-subtle text-secondary rounded-3">
                  <div class="fs-4 fw-bold"><?php echo $attempt['empty_count']; ?></div>
                  <div class="small fw-semibold">Boş Bırakılan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Soru Bazlı Cevap Analizi -->
      <div class="card border-0 shadow-sm p-4 rounded-4 mb-4">
        <h4 class="fw-bold text-navy mb-4 d-flex align-items-center justify-content-between">
          <span><i class="fa-solid fa-magnifying-glass-chart text-teal me-2"></i>Madde ve Cevap Analizi</span>
          <span class="badge bg-light text-muted border"><?php echo count($answers); ?> Soru İncelendi</span>
        </h4>

        <div class="space-y-4">
          <?php foreach ($answers as $index => $ans): ?>
            <?php $isCorrect = (bool)$ans['is_correct']; ?>
            <div class="p-4 rounded-3 border <?php echo $isCorrect ? 'border-success bg-success bg-opacity-10' : 'border-danger bg-danger bg-opacity-10'; ?> mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-bold text-navy">Soru <?php echo $index + 1; ?>:</span>
                <?php if ($isCorrect): ?>
                  <span class="badge bg-success"><i class="fa-solid fa-check me-1"></i> Doğru (+<?php echo $ans['points_earned']; ?> Puan)</span>
                <?php elseif (empty($ans['chosen_key'])): ?>
                  <span class="badge bg-secondary"><i class="fa-solid fa-minus me-1"></i> Boş Bırakıldı (0 Puan)</span>
                <?php else: ?>
                  <span class="badge bg-danger"><i class="fa-solid fa-xmark me-1"></i> Yanlış (0 Puan)</span>
                <?php endif; ?>
              </div>

              <h6 class="fw-semibold text-dark mb-3"><?php echo e($ans['question_text']); ?></h6>

              <div class="row g-2 small">
                <div class="col-md-6">
                  <div class="p-2 rounded bg-white border">
                    <span class="text-muted">Sizin Cevabınız:</span> 
                    <strong>
                      <?php if (!empty($ans['chosen_key'])): ?>
                        <?php echo e($ans['chosen_key']); ?>) <?php echo e($ans['chosen_text']); ?>
                      <?php else: ?>
                        <span class="text-muted italic">Cevap Verilmedi</span>
                      <?php endif; ?>
                    </strong>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="p-2 rounded bg-white border border-success">
                    <span class="text-success fw-bold">Doğru Seçenek:</span> 
                    <strong><?php echo e($ans['correct_key']); ?>) <?php echo e($ans['correct_text']); ?></strong>
                  </div>
                </div>
              </div>

              <?php if (!empty($ans['explanation'])): ?>
                <div class="mt-2 p-2 rounded bg-white bg-opacity-80 small text-secondary border">
                  <i class="fa-solid fa-lightbulb text-warning me-1"></i> <strong>Soru Açıklaması:</strong> <?php echo e($ans['explanation']); ?>
                </div>
              <?php endif; ?>
            </div>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Aksiyon Butonları -->
      <div class="d-flex justify-content-between">
        <a href="/elearn/" class="btn btn-outline-secondary">
          <i class="fa-solid fa-arrow-left me-1"></i> Ders Kataloğuna Dön
        </a>
        <a href="/elearn/profile.php" class="btn btn-teal fw-bold">
          <i class="fa-solid fa-user me-1"></i> Öğrenci Profilime Git →
        </a>
      </div>

    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
