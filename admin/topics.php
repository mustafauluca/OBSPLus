<?php
/**
 * E-LEARN: Konu Yönetimi (admin/topics.php)
 */

$pageTitle = 'Konu Yönetimi';
$activePage = 'topics';
require_once __DIR__ . '/includes/admin_header.php';

$filterCourseId = (int)($_GET['course_id'] ?? 0);
$courses = dbSelect("SELECT id, title FROM courses ORDER BY sort_order ASC");

// Konu Kaydet (POST)
$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_topic') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $msg = ['type' => 'danger', 'text' => 'CSRF hatası.'];
    } else {
        $topicId = (int)($_POST['topic_id'] ?? 0);
        $courseId = (int)($_POST['course_id'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $summary = trim($_POST['short_summary'] ?? '');
        $contentHtml = $_POST['content_html'] ?? '';
        $videoUrl = trim($_POST['video_url'] ?? '');
        $pdfUrl = trim($_POST['pdf_file_url'] ?? '');
        $sortOrder = (int)($_POST['sort_order'] ?? 1);
        $isActive = !empty($_POST['is_active']) ? 1 : 0;

        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($title));
        $slug = trim($slug, '-');

        if ($topicId > 0) {
            dbExecute(
                "UPDATE course_topics SET course_id = ?, title = ?, short_summary = ?, sort_order = ?, is_active = ? WHERE id = ?",
                "issiii",
                [$courseId, $title, $summary, $sortOrder, $isActive, $topicId]
            );
            dbExecute(
                "INSERT INTO topic_contents (topic_id, content_html, video_url, pdf_file_url) VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE content_html = ?, video_url = ?, pdf_file_url = ?",
                "issssss",
                [$topicId, $contentHtml, $videoUrl, $pdfUrl, $contentHtml, $videoUrl, $pdfUrl]
            );
            $msg = ['type' => 'success', 'text' => 'Konu ve içerik güncellendi.'];
        } else {
            $res = dbExecute(
                "INSERT INTO course_topics (course_id, title, slug, short_summary, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)",
                "isssii",
                [$courseId, $title, $slug . '-' . rand(100, 999), $summary, $sortOrder, $isActive]
            );
            $newTopicId = $res['insert_id'];
            dbExecute(
                "INSERT INTO topic_contents (topic_id, content_html, video_url, pdf_file_url) VALUES (?, ?, ?, ?)",
                "isss",
                [$newTopicId, $contentHtml, $videoUrl, $pdfUrl]
            );
            $msg = ['type' => 'success', 'text' => 'Yeni konu ve içeriği başarıyla eklendi.'];
        }
    }
}

// Konu Sil
if (isset($_GET['delete_id'])) {
    $delId = (int)$_GET['delete_id'];
    dbExecute("DELETE FROM course_topics WHERE id = ?", "i", [$delId]);
    header("Location: /admin/topics.php" . ($filterCourseId ? "?course_id=$filterCourseId" : ''));
    exit;
}

$sql = "SELECT ct.*, c.title as course_title, tc.content_html, tc.video_url, tc.pdf_file_url 
        FROM course_topics ct 
        JOIN courses c ON c.id = ct.course_id 
        LEFT JOIN topic_contents tc ON tc.topic_id = ct.id 
        WHERE 1=1";
$params = [];
$types = '';

if ($filterCourseId > 0) {
    $sql .= " AND ct.course_id = ?";
    $params[] = $filterCourseId;
    $types .= 'i';
}
$sql .= " ORDER BY c.sort_order ASC, ct.sort_order ASC";

$topics = dbSelect($sql, $types, $params);
?>

<?php if ($msg): ?>
  <div class="alert alert-<?php echo $msg['type']; ?> alert-dismissible fade show" role="alert">
    <?php echo e($msg['text']); ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <form method="GET" class="d-flex gap-2" style="max-width: 320px;">
    <select name="course_id" class="form-select form-select-sm" onchange="this.form.submit()">
      <option value="0">Tüm Derslerin Konuları</option>
      <?php foreach ($courses as $c): ?>
        <option value="<?php echo $c['id']; ?>" <?php echo $filterCourseId === $c['id'] ? 'selected' : ''; ?>>
          <?php echo e($c['title']); ?>
        </option>
      <?php endforeach; ?>
    </select>
  </form>
  <button class="btn btn-teal btn-sm fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#topicModal" onclick="resetTopicForm()">
    <i class="fa-solid fa-plus me-1"></i> Yeni Konu Ekle
  </button>
</div>

<div class="admin-card overflow-hidden">
  <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
    <span class="small fw-semibold text-secondary">Toplam <strong><?php echo count($topics); ?></strong> Konu Listelendi</span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle small mb-0">
      <thead class="table-light">
        <tr>
          <th>Sıra</th>
          <th>Ders</th>
          <th>Konu Başlığı</th>
          <th>Özet</th>
          <th class="text-center">Video / PDF</th>
          <th>Durum</th>
          <th class="text-end">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($topics as $t): ?>
          <tr>
            <td class="fw-bold text-muted"><?php echo $t['sort_order']; ?></td>
            <td class="fw-bold text-navy"><?php echo e($t['course_title']); ?></td>
            <td class="fw-semibold text-dark"><?php echo e($t['title']); ?></td>
            <td class="text-muted small text-truncate" style="max-width: 250px;"><?php echo e($t['short_summary']); ?></td>
            <td class="text-center">
              <?php if (!empty($t['video_url'])): ?>
                <span class="badge bg-danger-subtle text-danger" title="Video Var"><i class="fa-solid fa-video"></i></span>
              <?php endif; ?>
              <?php if (!empty($t['pdf_file_url'])): ?>
                <span class="badge bg-primary-subtle text-primary" title="PDF Var"><i class="fa-solid fa-file-pdf"></i></span>
              <?php endif; ?>
            </td>
            <td>
              <span class="badge <?php echo $t['is_active'] ? 'bg-success' : 'bg-danger'; ?>">
                <?php echo $t['is_active'] ? 'Aktif' : 'Pasif'; ?>
              </span>
            </td>
            <td class="text-end">
              <a href="/admin/questions.php?topic_id=<?php echo $t['id']; ?>" class="btn btn-outline-info btn-sm py-0 me-1" title="Soruları Gör">
                Sorular
              </a>
              <button class="btn btn-light btn-sm text-primary py-0" onclick="editTopic(<?php echo htmlspecialchars(json_encode($t)); ?>)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <a href="?delete_id=<?php echo $t['id']; ?>" class="btn btn-light btn-sm text-danger py-0" onclick="return confirm('Konuyu silmek istediğinize emin misiniz?');">
                <i class="fa-solid fa-trash"></i>
              </a>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- Konu Ekleme/Düzenleme Modali -->
<div class="modal fade" id="topicModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-navy text-white">
        <h6 class="modal-title fw-bold" id="topicModalTitle">Yeni Konu Ekle</h6>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form method="POST">
        <?php echo csrfField(); ?>
        <input type="hidden" name="action" value="save_topic">
        <input type="hidden" name="topic_id" id="topicId" value="0">
        <div class="modal-body p-4 small">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Bağlı Olduğu Ders</label>
              <select name="course_id" id="topicCourseId" class="form-select form-select-sm" required>
                <?php foreach ($courses as $c): ?>
                  <option value="<?php echo $c['id']; ?>"><?php echo e($c['title']); ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Konu Başlığı</label>
              <input type="text" name="title" id="topicTitle" class="form-control form-control-sm" required placeholder="Örn: SQL Prepared Statements">
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Kısa Açıklama / Özet</label>
            <input type="text" name="short_summary" id="topicSummary" class="form-control form-control-sm" placeholder="Konunun 1-2 cümlelik özeti">
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Zengin Metin Anlatım İçeriği (HTML)</label>
            <textarea name="content_html" id="topicContentHtml" rows="5" class="form-control form-control-sm" placeholder="<p>Ders anlatım metni ve başlıklar...</p>"></textarea>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Video URL (YouTube/Vimeo)</label>
              <input type="url" name="video_url" id="topicVideoUrl" class="form-control form-control-sm" placeholder="https://www.youtube.com/watch?v=...">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">PDF Materyali Dosya Yolu</label>
              <input type="text" name="pdf_file_url" id="topicPdfUrl" class="form-control form-control-sm" placeholder="/uploads/materials/ders_ozeti.pdf">
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Sıralama</label>
              <input type="number" name="sort_order" id="topicSortOrder" class="form-control form-control-sm" value="1">
            </div>
            <div class="col-md-6 d-flex align-items-center pt-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" name="is_active" id="topicIsActive" value="1" checked>
                <label class="form-check-label fw-semibold" for="topicIsActive">Aktif / Öğrencilere Göster</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">İptal</button>
          <button type="submit" class="btn btn-teal btn-sm fw-bold">Kaydet</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
  function resetTopicForm() {
    document.getElementById('topicModalTitle').textContent = 'Yeni Konu Ekle';
    document.getElementById('topicId').value = '0';
    document.getElementById('topicTitle').value = '';
    document.getElementById('topicSummary').value = '';
    document.getElementById('topicContentHtml').value = '';
    document.getElementById('topicVideoUrl').value = '';
    document.getElementById('topicPdfUrl').value = '';
    document.getElementById('topicSortOrder').value = '1';
    document.getElementById('topicIsActive').checked = true;
  }

  function editTopic(t) {
    document.getElementById('topicModalTitle').textContent = 'Konuyu Düzenle: ' + t.title;
    document.getElementById('topicId').value = t.id;
    document.getElementById('topicCourseId').value = t.course_id;
    document.getElementById('topicTitle').value = t.title;
    document.getElementById('topicSummary').value = t.short_summary || '';
    document.getElementById('topicContentHtml').value = t.content_html || '';
    document.getElementById('topicVideoUrl').value = t.video_url || '';
    document.getElementById('topicPdfUrl').value = t.pdf_file_url || '';
    document.getElementById('topicSortOrder').value = t.sort_order;
    document.getElementById('topicIsActive').checked = t.is_active == 1;
    new bootstrap.Modal(document.getElementById('topicModal')).show();
  }
</script>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
