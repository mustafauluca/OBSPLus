<?php
/**
 * E-LEARN: Soru Havuzu Yönetimi (admin/questions.php)
 */

$pageTitle = 'Soru Havuzu';
$activePage = 'questions';
require_once __DIR__ . '/includes/admin_header.php';

$filterCourseId = (int)($_GET['course_id'] ?? 0);
$filterTopicId = (int)($_GET['topic_id'] ?? 0);

$courses = dbSelect("SELECT id, title FROM courses ORDER BY sort_order ASC");
$topics = dbSelect("SELECT id, title, course_id FROM course_topics ORDER BY sort_order ASC");

// Soru Kaydet (POST)
$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_question') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $msg = ['type' => 'danger', 'text' => 'CSRF hatası.'];
    } else {
        $questionId = (int)($_POST['question_id'] ?? 0);
        $courseId = (int)($_POST['course_id'] ?? 0);
        $topicId = !empty($_POST['topic_id']) ? (int)$_POST['topic_id'] : null;
        $questionText = trim($_POST['question_text'] ?? '');
        $points = (int)($_POST['points'] ?? 10);
        $explanation = trim($_POST['explanation'] ?? '');
        $correctOptionKey = $_POST['correct_option'] ?? 'A';
        $optionTexts = $_POST['options'] ?? []; // ['A' => '...', 'B' => '...']

        if ($questionId > 0) {
            dbExecute(
                "UPDATE questions SET course_id = ?, topic_id = ?, question_text = ?, points = ?, explanation = ? WHERE id = ?",
                "iisisi",
                [$courseId, $topicId, $questionText, $points, $explanation, $questionId]
            );
            // Seçenekleri güncelle
            dbExecute("DELETE FROM question_options WHERE question_id = ?", "i", [$questionId]);
            foreach ($optionTexts as $key => $txt) {
                if (trim($txt) !== '') {
                    $isCorrect = ($key === $correctOptionKey) ? 1 : 0;
                    dbExecute("INSERT INTO question_options (question_id, option_key, option_text, is_correct) VALUES (?, ?, ?, ?)", "issi", [$questionId, $key, trim($txt), $isCorrect]);
                }
            }
            $msg = ['type' => 'success', 'text' => 'Soru ve seçenekler güncellendi.'];
        } else {
            $res = dbExecute(
                "INSERT INTO questions (course_id, topic_id, question_text, points, explanation) VALUES (?, ?, ?, ?, ?)",
                "iisis",
                [$courseId, $topicId, $questionText, $points, $explanation]
            );
            $newQId = $res['insert_id'];
            foreach ($optionTexts as $key => $txt) {
                if (trim($txt) !== '') {
                    $isCorrect = ($key === $correctOptionKey) ? 1 : 0;
                    dbExecute("INSERT INTO question_options (question_id, option_key, option_text, is_correct) VALUES (?, ?, ?, ?)", "issi", [$newQId, $key, trim($txt), $isCorrect]);
                }
            }
            $msg = ['type' => 'success', 'text' => 'Yeni soru soru havuzuna eklendi.'];
        }
    }
}

// Soru Sil
if (isset($_GET['delete_id'])) {
    $delId = (int)$_GET['delete_id'];
    dbExecute("DELETE FROM questions WHERE id = ?", "i", [$delId]);
    header("Location: /admin/questions.php");
    exit;
}

$sql = "SELECT q.*, c.title as course_title, ct.title as topic_title,
        (SELECT COUNT(*) FROM question_options WHERE question_id = q.id) as option_count,
        (SELECT option_key FROM question_options WHERE question_id = q.id AND is_correct = 1 LIMIT 1) as correct_key
        FROM questions q
        JOIN courses c ON c.id = q.course_id
        LEFT JOIN course_topics ct ON ct.id = q.topic_id
        WHERE 1=1";
$params = [];
$types = '';

if ($filterCourseId > 0) {
    $sql .= " AND q.course_id = ?";
    $params[] = $filterCourseId;
    $types .= 'i';
}
if ($filterTopicId > 0) {
    $sql .= " AND q.topic_id = ?";
    $params[] = $filterTopicId;
    $types .= 'i';
}
$sql .= " ORDER BY q.id DESC";

$questions = dbSelect($sql, $types, $params);
?>

<?php if ($msg): ?>
  <div class="alert alert-<?php echo $msg['type']; ?> alert-dismissible fade show" role="alert">
    <?php echo e($msg['text']); ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <form method="GET" class="d-flex gap-2">
    <select name="course_id" class="form-select form-select-sm" onchange="this.form.submit()">
      <option value="0">Tüm Dersler</option>
      <?php foreach ($courses as $c): ?>
        <option value="<?php echo $c['id']; ?>" <?php echo $filterCourseId === $c['id'] ? 'selected' : ''; ?>>
          <?php echo e($c['title']); ?>
        </option>
      <?php endforeach; ?>
    </select>
  </form>
  <button class="btn btn-teal btn-sm fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#questionModal" onclick="resetQuestionForm()">
    <i class="fa-solid fa-plus me-1"></i> Havuza Soru Ekle
  </button>
</div>

<div class="admin-card overflow-hidden">
  <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
    <span class="small fw-semibold text-secondary">Toplam <strong><?php echo count($questions); ?></strong> Soru Kayıtlı</span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle small mb-0">
      <thead class="table-light">
        <tr>
          <th>ID</th>
          <th>Ders / Konu</th>
          <th>Soru Metni</th>
          <th class="text-center">Seçenek Sayısı</th>
          <th class="text-center">Doğru Cevap</th>
          <th class="text-center">Puan</th>
          <th class="text-end">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($questions as $q): ?>
          <tr>
            <td class="text-muted">#<?php echo $q['id']; ?></td>
            <td>
              <div class="fw-bold text-navy"><?php echo e($q['course_title']); ?></div>
              <div class="text-muted small"><?php echo e($q['topic_title'] ?? 'Genel'); ?></div>
            </td>
            <td class="fw-semibold text-dark text-truncate" style="max-width: 320px;">
              <?php echo e($q['question_text']); ?>
            </td>
            <td class="text-center"><?php echo $q['option_count']; ?> Seçenek</td>
            <td class="text-center">
              <span class="badge bg-success font-monospace px-2 py-1 fs-6"><?php echo e($q['correct_key'] ?? '-'); ?></span>
            </td>
            <td class="text-center fw-bold text-primary"><?php echo $q['points']; ?></td>
            <td class="text-end">
              <a href="?delete_id=<?php echo $q['id']; ?>" class="btn btn-light btn-sm text-danger" onclick="return confirm('Bu soruyu havuzdan silmek istediğinize emin misiniz?');">
                <i class="fa-solid fa-trash"></i>
              </a>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- Soru Ekleme Modali -->
<div class="modal fade" id="questionModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-navy text-white">
        <h6 class="modal-title fw-bold">Havuza Yeni Soru Ekle</h6>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form method="POST">
        <?php echo csrfField(); ?>
        <input type="hidden" name="action" value="save_question">
        <input type="hidden" name="question_id" id="questionId" value="0">
        <div class="modal-body p-4 small">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Ders Seçimi</label>
              <select name="course_id" id="qCourseId" class="form-select form-select-sm" required>
                <?php foreach ($courses as $c): ?>
                  <option value="<?php echo $c['id']; ?>"><?php echo e($c['title']); ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold">Konu (İsteğe Bağlı)</label>
              <select name="topic_id" id="qTopicId" class="form-select form-select-sm">
                <option value="">Genel / Ders Havuzu</option>
                <?php foreach ($topics as $t): ?>
                  <option value="<?php echo $t['id']; ?>"><?php echo e($t['title']); ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label fw-semibold">Soru Puanı</label>
              <input type="number" name="points" id="qPoints" class="form-control form-control-sm" value="10">
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Soru Metni</label>
            <textarea name="question_text" id="qText" rows="3" class="form-control form-control-sm" required placeholder="Soruyu net bir şekilde yazınız..."></textarea>
          </div>

          <div class="card p-3 bg-light border mb-3">
            <h6 class="fw-bold text-navy mb-2">Çoktan Seçmeli Seçenekler & Doğru Cevap</h6>
            <?php foreach (['A', 'B', 'C', 'D', 'E'] as $optKey): ?>
              <div class="input-group input-group-sm mb-2">
                <div class="input-group-text">
                  <input class="form-check-input mt-0 me-1" type="radio" name="correct_option" value="<?php echo $optKey; ?>" <?php echo $optKey === 'A' ? 'checked' : ''; ?>>
                  <strong><?php echo $optKey; ?></strong>
                </div>
                <input type="text" name="options[<?php echo $optKey; ?>]" class="form-control" placeholder="<?php echo $optKey; ?> seçeneği metni" <?php echo in_array($optKey, ['A', 'B', 'C', 'D']) ? 'required' : ''; ?>>
              </div>
            <?php endforeach; ?>
            <div class="form-text text-muted">Radyo butonunu işaretlediğiniz seçenek doğru cevap kabul edilecektir. (E seçeneği isteğe bağlıdır).</div>
          </div>

          <div class="mb-2">
            <label class="form-label fw-semibold">Soru Çözüm Açıklaması (Sınav Sonunda Öğrenciye Gösterilir)</label>
            <textarea name="explanation" id="qExplanation" rows="2" class="form-control form-control-sm" placeholder="Bu sorunun doğru cevabının gerekçesi..."></textarea>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">İptal</button>
          <button type="submit" class="btn btn-teal btn-sm fw-bold">Soruyu Kaydet</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
  function resetQuestionForm() {
    document.getElementById('questionId').value = '0';
    document.getElementById('qText').value = '';
    document.getElementById('qPoints').value = '10';
    document.getElementById('qExplanation').value = '';
  }
</script>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
