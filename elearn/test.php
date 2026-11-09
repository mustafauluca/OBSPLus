<?php
/**
 * E-LEARN: Konu Testi Çözme Ekranı (/elearn/test.php)
 */

$topicId = (int)($_GET['topic_id'] ?? 0);
require_once __DIR__ . '/../includes/header.php';

// Konu ve Testi Getir
$topic = dbSelectOne(
    "SELECT ct.*, c.title as course_title, c.id as course_id 
     FROM course_topics ct 
     JOIN courses c ON c.id = ct.course_id 
     WHERE ct.id = ? AND ct.is_active = 1",
    "i",
    [$topicId]
);

if (!$topic) {
    echo "<div class='container py-5 text-center'><h3>Test konusu bulunamadı.</h3><a href='/elearn/' class='btn btn-primary mt-3'>Geri Dön</a></div>";
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

// Test kaydı
$test = dbSelectOne("SELECT * FROM tests WHERE topic_id = ? AND is_active = 1", "i", [$topicId]);
if (!$test) {
    // Otomatik test oluştur (test tablosunda yoksa bile soruları çekebilmek için)
    $res = dbExecute("INSERT INTO tests (topic_id, title, time_limit_minutes, passing_score) VALUES (?, ?, 15, 60)", "is", [$topicId, $topic['title'] . ' Konu Testi']);
    $test = dbSelectOne("SELECT * FROM tests WHERE topic_id = ?", "i", [$topicId]);
}

// Soruları ve Seçenekleri Çek
$questions = dbSelect("SELECT * FROM questions WHERE topic_id = ? ORDER BY id ASC", "i", [$topicId]);

// Sorular için seçenekleri hazırla
$questionIds = array_column($questions, 'id');
$optionsByQuestion = [];
if (!empty($questionIds)) {
    $in = implode(',', array_map('intval', $questionIds));
    $optionsRows = dbSelect("SELECT * FROM question_options WHERE question_id IN ($in) ORDER BY option_key ASC");
    foreach ($optionsRows as $opt) {
        $optionsByQuestion[$opt['question_id']][] = $opt;
    }
}

// Sınav Gönderimi (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit_quiz') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        die("CSRF token doğrulanamadı.");
    }

    $studentId = $studentUser['id'] ?? 1; // Oturum açmamışsa demo öğrenci
    $answers = $_POST['answers'] ?? [];
    $totalPoints = 0;
    $earnedPoints = 0;
    $correctCount = 0;
    $wrongCount = 0;
    $emptyCount = 0;

    // Girişim Kaydı Başlat
    $startTime = date('Y-m-d H:i:s', time() - 300); // 5 dk önce başladı varsayımı
    $resAttempt = dbExecute(
        "INSERT INTO exam_attempts (student_id, exam_type, target_id, attempt_number, started_at, status) 
         VALUES (?, 'quiz', ?, 1, ?, 'in_progress')",
        "iis",
        [$studentId, $test['id'], $startTime]
    );
    $attemptId = $resAttempt['insert_id'];

    foreach ($questions as $q) {
        $qId = $q['id'];
        $qPoints = (int)$q['points'];
        $totalPoints += $qPoints;
        $chosenOptId = isset($answers[$qId]) ? (int)$answers[$qId] : null;

        if ($chosenOptId === null) {
            $emptyCount++;
            dbExecute("INSERT INTO exam_answers (attempt_id, question_id, chosen_option_id, is_correct, points_earned) VALUES (?, ?, NULL, 0, 0)", "ii", [$attemptId, $qId]);
            continue;
        }

        // Doğru mu kontrol et
        $opt = dbSelectOne("SELECT is_correct FROM question_options WHERE id = ? AND question_id = ?", "ii", [$chosenOptId, $qId]);
        if ($opt && $opt['is_correct'] == 1) {
            $correctCount++;
            $earnedPoints += $qPoints;
            dbExecute("INSERT INTO exam_answers (attempt_id, question_id, chosen_option_id, is_correct, points_earned) VALUES (?, ?, ?, 1, ?)", "iiii", [$attemptId, $qId, $chosenOptId, $qPoints]);
        } else {
            $wrongCount++;
            dbExecute("INSERT INTO exam_answers (attempt_id, question_id, chosen_option_id, is_correct, points_earned) VALUES (?, ?, ?, 0, 0)", "iiii", [$attemptId, $qId, $chosenOptId]);
        }
    }

    $finalScore = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;
    $passed = $finalScore >= $test['passing_score'] ? 1 : 0;

    // Girişimi Güncelle
    dbExecute(
        "UPDATE exam_attempts SET completed_at = NOW(), score = ?, correct_count = ?, wrong_count = ?, empty_count = ?, status = 'completed', passed = ?, duration_seconds = 240 
         WHERE id = ?",
        "diiii",
        [$finalScore, $correctCount, $wrongCount, $emptyCount, $passed, $attemptId]
    );

    // Öğrenci Puanını ve Skorboardını Güncelle
    if ($isStudent) {
        dbExecute(
            "INSERT INTO student_scores (student_id, course_id, total_points, success_rate, exam_count) 
             VALUES (?, ?, ?, ?, 1) 
             ON DUPLICATE KEY UPDATE total_points = total_points + ?, success_rate = (success_rate + ?) / 2, exam_count = exam_count + 1",
            "iiiddi",
            [$studentId, $topic['course_id'], $earnedPoints, $finalScore, $earnedPoints, $finalScore]
        );
        dbExecute("UPDATE students SET total_score = total_score + ? WHERE id = ?", "ii", [$earnedPoints, $studentId]);
    }

    header("Location: /elearn/result.php?attempt_id=" . $attemptId);
    exit;
}
?>

<div class="bg-navy py-4 text-white">
  <div class="container">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
      <div>
        <span class="badge bg-teal mb-1"><?php echo e($topic['course_title']); ?></span>
        <h1 class="h3 fw-bold mb-0"><?php echo e($test['title']); ?></h1>
      </div>
      <div class="d-flex align-items-center gap-3">
        <div class="badge bg-danger p-2 px-3 fs-6 rounded-pill d-flex align-items-center gap-2">
          <i class="fa-regular fa-clock"></i>
          <span>Kalan Süre: <span id="quizTimer">15:00</span></span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-lg-9">
      <?php if (empty($questions)): ?>
        <div class="card border-0 shadow-sm p-5 text-center rounded-4">
          <div class="fs-1 text-muted mb-3"><i class="fa-solid fa-clipboard-question"></i></div>
          <h4 class="fw-bold text-navy">Bu konu için henüz soru tanımlanmamıştır.</h4>
          <p class="text-muted">Lütfen daha sonra tekrar deneyiniz veya diğer konuların testlerini inceleyiniz.</p>
          <a href="/elearn/course.php?id=<?php echo $topic['course_id']; ?>" class="btn btn-primary mt-2">Ders Konularına Dön</a>
        </div>
      <?php else: ?>
        <form id="quizForm" method="POST" action="">
          <?php echo csrfField(); ?>
          <input type="hidden" name="action" value="submit_quiz">

          <div class="space-y-4">
            <?php foreach ($questions as $index => $q): ?>
              <div class="card border-0 shadow-sm p-4 rounded-4 mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="badge bg-primary rounded-pill px-3 py-1">Soru <?php echo $index + 1; ?> / <?php echo count($questions); ?></span>
                  <span class="badge bg-secondary-subtle text-secondary"><?php echo $q['points']; ?> Puan</span>
                </div>

                <h5 class="fw-bold text-navy mb-4 lh-base"><?php echo e($q['question_text']); ?></h5>

                <div class="options-container space-y-2">
                  <?php $opts = $optionsByQuestion[$q['id']] ?? []; ?>
                  <?php foreach ($opts as $opt): ?>
                    <div class="form-check p-3 border rounded-3 mb-2 bg-light hover-shadow">
                      <input class="form-check-input ms-0 me-3" type="radio" name="answers[<?php echo $q['id']; ?>]" id="opt_<?php echo $opt['id']; ?>" value="<?php echo $opt['id']; ?>">
                      <label class="form-check-label w-100 fw-semibold text-secondary" for="opt_<?php echo $opt['id']; ?>">
                        <span class="badge bg-navy text-white me-2"><?php echo $opt['option_key']; ?></span>
                        <?php echo e($opt['option_text']); ?>
                      </label>
                    </div>
                  <?php endforeach; ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>

          <div class="card border-0 shadow-sm p-4 rounded-4 text-center bg-light">
            <h5 class="fw-bold text-navy mb-2">Testi Tamamlamak Üzeresiniz</h5>
            <p class="text-muted small mb-4">Cevaplarınızı kontrol ettiyseniz "Testi Bitir ve Sonucu Gör" butonuna tıklayınız.</p>
            <button type="submit" class="btn btn-teal btn-lg fw-bold px-5 shadow">
              <i class="fa-solid fa-check-double me-2"></i>Testi Bitir ve Sonucu Gör
            </button>
          </div>
        </form>

        <script>
          // Test Geri Sayım Sayacı (15 Dakika)
          let timeLeft = <?php echo ($test['time_limit_minutes'] ?? 15) * 60; ?>;
          const timerEl = document.getElementById('quizTimer');
          const quizTimer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerEl.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (timeLeft <= 0) {
              clearInterval(quizTimer);
              alert('Süreniz doldu! Testiniz otomatik olarak gönderiliyor.');
              document.getElementById('quizForm').submit();
            }
            timeLeft--;
          }, 1000);
        </script>
      <?php endif; ?>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
