<?php
/**
 * E-LEARN: Vize Sınavı Ekranı (/elearn/exam.php)
 */

$examId = (int)($_GET['id'] ?? 0);
require_once __DIR__ . '/../includes/header.php';

$exam = dbSelectOne(
    "SELECT e.*, c.title as course_title 
     FROM exams e 
     JOIN courses c ON c.id = e.course_id 
     WHERE e.id = ? AND e.is_active = 1",
    "i",
    [$examId]
);

if (!$exam) {
    echo "<div class='container py-5 text-center'><h3>Sınav bulunamadı veya süresi dolmuştur.</h3><a href='/elearn/' class='btn btn-primary mt-3'>Kataloğa Dön</a></div>";
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

// Sınav Tarih Kontrolü
$now = date('Y-m-d H:i:s');
if ($now < $exam['start_date'] || $now > $exam['end_date']) {
    echo "<div class='container py-5 text-center'><h3>Bu sınav şu anda aktif değildir.</h3><p class='text-muted'>Sınav Dönemi: " . formatDateTime($exam['start_date']) . " - " . formatDateTime($exam['end_date']) . "</p><a href='/elearn/' class='btn btn-primary mt-3'>Kataloğa Dön</a></div>";
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

// Girişim Hakkı Kontrolü
$studentId = $studentUser['id'] ?? 1;
$pastAttemptsCount = dbSelectOne(
    "SELECT COUNT(*) as c FROM exam_attempts WHERE student_id = ? AND target_id = ? AND exam_type = 'exam'",
    "ii",
    [$studentId, $examId]
)['c'] ?? 0;

if ($pastAttemptsCount >= $exam['max_attempts']) {
    echo "<div class='container py-5 text-center'>
            <div class='alert alert-warning d-inline-block p-4 rounded-4 shadow-sm'>
              <h4 class='fw-bold text-dark'>Sınav Giriş Hakkınız Dolmuştur</h4>
              <p class='mb-3'>Bu sınav için azami hak sayısına (" . $exam['max_attempts'] . ") ulaştınız.</p>
              <a href='/elearn/profile.php' class='btn btn-primary'>Sınav Geçmişimi Görüntüle</a>
            </div>
          </div>";
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

// Sınav Sorularını Çek
$questions = dbSelect(
    "SELECT q.* FROM questions q
     JOIN exam_questions eq ON eq.question_id = q.id
     WHERE eq.exam_id = ?
     ORDER BY q.id ASC
     LIMIT ?",
    "ii",
    [$examId, $exam['question_count']]
);

// Yedek: Eğer exam_questions tablosunda yeterli soru yoksa derse ait sorulardan tamamla
if (count($questions) < $exam['question_count']) {
    $needed = $exam['question_count'] - count($questions);
    $extraQuestions = dbSelect(
        "SELECT * FROM questions WHERE course_id = ? ORDER BY RAND() LIMIT ?",
        "ii",
        [$exam['course_id'], $needed]
    );
    $questions = array_merge($questions, $extraQuestions);
}

// Seçenekleri Getir
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
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'submit_exam') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        die("CSRF doğrulaması başarısız.");
    }

    // Çift Gönderim Kontrolü (Oturum Koruması)
    if (!empty($_SESSION['last_submitted_exam']) && $_SESSION['last_submitted_exam'] === $examId && (time() - $_SESSION['last_submitted_exam_time'] < 10)) {
        header("Location: /elearn/profile.php");
        exit;
    }
    $_SESSION['last_submitted_exam'] = $examId;
    $_SESSION['last_submitted_exam_time'] = time();

    $answers = $_POST['answers'] ?? [];
    $totalPoints = 0;
    $earnedPoints = 0;
    $correctCount = 0;
    $wrongCount = 0;
    $emptyCount = 0;

    $startTime = date('Y-m-d H:i:s', time() - ($exam['duration_minutes'] * 30));
    $resAttempt = dbExecute(
        "INSERT INTO exam_attempts (student_id, exam_type, target_id, attempt_number, started_at, status) 
         VALUES (?, 'exam', ?, ?, ?, 'in_progress')",
        "iiis",
        [$studentId, $examId, $pastAttemptsCount + 1, $startTime]
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

    $finalScore = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0;
    $passed = $finalScore >= $exam['passing_grade'] ? 1 : 0;

    dbExecute(
        "UPDATE exam_attempts SET completed_at = NOW(), score = ?, correct_count = ?, wrong_count = ?, empty_count = ?, status = 'completed', passed = ?, duration_seconds = 1200 
         WHERE id = ?",
        "diiii",
        [$finalScore, $correctCount, $wrongCount, $emptyCount, $passed, $attemptId]
    );

    // Skorboard Güncellemesi
    if ($isStudent) {
        dbExecute(
            "INSERT INTO student_scores (student_id, course_id, total_points, success_rate, exam_count) 
             VALUES (?, ?, ?, ?, 1) 
             ON DUPLICATE KEY UPDATE total_points = total_points + ?, success_rate = (success_rate + ?) / 2, exam_count = exam_count + 1",
            "iiiddi",
            [$studentId, $exam['course_id'], $earnedPoints, $finalScore, $earnedPoints, $finalScore]
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
        <span class="badge bg-warning text-dark mb-1 fw-bold"><?php echo e($exam['course_title']); ?> • Resmi Vize Sınavı</span>
        <h1 class="h3 fw-bold mb-0"><?php echo e($exam['title']); ?></h1>
      </div>
      <div class="d-flex align-items-center gap-3">
        <div class="badge bg-danger p-2 px-3 fs-6 rounded-pill d-flex align-items-center gap-2">
          <i class="fa-regular fa-clock"></i>
          <span>Kalan Süre: <span id="examTimer"><?php echo $exam['duration_minutes']; ?>:00</span></span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-lg-9">
      <!-- Sınav Bilgilendirme Bandı -->
      <div class="card border-0 shadow-sm p-4 rounded-4 mb-4 bg-light">
        <div class="row text-center g-3 small">
          <div class="col-3">
            <div class="text-muted">Soru Sayısı</div>
            <div class="fw-bold fs-6 text-navy"><?php echo count($questions); ?> Soru</div>
          </div>
          <div class="col-3">
            <div class="text-muted">Süre</div>
            <div class="fw-bold fs-6 text-navy"><?php echo $exam['duration_minutes']; ?> Dk</div>
          </div>
          <div class="col-3">
            <div class="text-muted">Geçme Notu</div>
            <div class="fw-bold fs-6 text-success"><?php echo $exam['passing_grade']; ?> / 100</div>
          </div>
          <div class="col-3">
            <div class="text-muted">Girişim</div>
            <div class="fw-bold fs-6 text-primary"><?php echo $pastAttemptsCount + 1; ?> / <?php echo $exam['max_attempts']; ?></div>
          </div>
        </div>
      </div>

      <form id="examForm" method="POST" action="">
        <?php echo csrfField(); ?>
        <input type="hidden" name="action" value="submit_exam">

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
                    <input class="form-check-input ms-0 me-3" type="radio" name="answers[<?php echo $q['id']; ?>]" id="opt_ex_<?php echo $opt['id']; ?>" value="<?php echo $opt['id']; ?>">
                    <label class="form-check-label w-100 fw-semibold text-secondary" for="opt_ex_<?php echo $opt['id']; ?>">
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
          <h5 class="fw-bold text-navy mb-2">Vize Sınavını Tamamlamak Üzeresiniz</h5>
          <p class="text-muted small mb-4">Tüm sorulara verdiğiniz cevaplar kaydedilecektir. Onaylıyor musunuz?</p>
          <button type="submit" class="btn btn-warning btn-lg fw-bold px-5 shadow">
            <i class="fa-solid fa-check-double me-2"></i>Vize Sınavını Tamamla ve Notu Gör
          </button>
        </div>
      </form>

      <script>
        let durationMinutes = <?php echo (int)($exam['duration_minutes'] ?? 30); ?>;
        let timeLeft = durationMinutes * 60;
        const timerEl = document.getElementById('examTimer');
        const examTimer = setInterval(() => {
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          timerEl.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          if (timeLeft <= 0) {
            clearInterval(examTimer);
            alert('Sınav süreniz doldu! Cevaplarınız otomatik gönderiliyor.');
            document.getElementById('examForm').submit();
          }
          timeLeft--;
        }, 1000);
      </script>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
