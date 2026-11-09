<?php
/**
 * E-LEARN: Ders Yönetimi (admin/courses.php)
 */

$pageTitle = 'Ders Yönetimi';
$activePage = 'courses';
require_once __DIR__ . '/includes/admin_header.php';

// Ders Ekleme / Güncelleme (POST)
$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $msg = ['type' => 'danger', 'text' => 'CSRF hatası.'];
    } elseif ($_POST['action'] === 'save_course') {
        $title = trim($_POST['title'] ?? '');
        $category = trim($_POST['category'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $imageUrl = trim($_POST['image_url'] ?? '');
        $sortOrder = (int)($_POST['sort_order'] ?? 1);
        $isActive = !empty($_POST['is_active']) ? 1 : 0;
        $courseId = (int)($_POST['course_id'] ?? 0);

        // Basit slug üretici
        $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($title));
        $slug = trim($slug, '-');

        if ($courseId > 0) {
            dbExecute(
                "UPDATE courses SET title = ?, category = ?, description = ?, image_url = ?, sort_order = ?, is_active = ? WHERE id = ?",
                "ssssiii",
                [$title, $category, $description, $imageUrl, $sortOrder, $isActive, $courseId]
            );
            $msg = ['type' => 'success', 'text' => 'Ders bilgileri güncellendi.'];
        } else {
            dbExecute(
                "INSERT INTO courses (title, slug, category, description, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
                "sssssii",
                [$title, $slug . '-' . rand(100, 999), $category, $description, $imageUrl, $sortOrder, $isActive]
            );
            $msg = ['type' => 'success', 'text' => 'Yeni ders başarıyla oluşturuldu.'];
        }
    }
}

// Ders Silme
if (isset($_GET['delete_id'])) {
    $delId = (int)$_GET['delete_id'];
    dbExecute("DELETE FROM courses WHERE id = ?", "i", [$delId]);
    header("Location: /admin/courses.php");
    exit;
}

$courses = dbSelect("SELECT c.*, (SELECT COUNT(*) FROM course_topics WHERE course_id = c.id) as topic_count FROM courses c ORDER BY c.sort_order ASC");
?>

<?php if ($msg): ?>
  <div class="alert alert-<?php echo $msg['type']; ?> alert-dismissible fade show" role="alert">
    <?php echo e($msg['text']); ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <h6 class="text-secondary mb-0">Platformda yayınlanan eğitim programları</h6>
  <button class="btn btn-teal btn-sm fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#courseModal" onclick="resetCourseForm()">
    <i class="fa-solid fa-plus me-1"></i> Yeni Ders Oluştur
  </button>
</div>

<div class="row g-4">
  <?php foreach ($courses as $c): ?>
    <div class="col-lg-4 col-md-6">
      <div class="admin-card overflow-hidden h-100 d-flex flex-column">
        <img src="<?php echo e($c['image_url'] ?: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'); ?>" style="height: 160px; object-fit: cover;" alt="<?php echo e($c['title']); ?>">
        <div class="p-3 d-flex flex-column flex-grow-1">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-secondary-subtle text-secondary small"><?php echo e($c['category']); ?></span>
            <span class="badge <?php echo $c['is_active'] ? 'bg-success' : 'bg-danger'; ?>">
              <?php echo $c['is_active'] ? 'Aktif' : 'Pasif'; ?>
            </span>
          </div>
          <h5 class="fw-bold text-navy fs-6"><?php echo e($c['title']); ?></h5>
          <p class="text-muted small flex-grow-1"><?php echo e(mb_strimwidth($c['description'] ?? '', 0, 90, '...')); ?></p>
          <div class="pt-3 border-top mt-2 d-flex justify-content-between align-items-center">
            <a href="/admin/topics.php?course_id=<?php echo $c['id']; ?>" class="btn btn-outline-primary btn-sm">
              <i class="fa-solid fa-layer-group me-1"></i> <?php echo $c['topic_count']; ?> Konu
            </a>
            <div class="d-flex gap-1">
              <button class="btn btn-light btn-sm text-primary" onclick="editCourse(<?php echo htmlspecialchars(json_encode($c)); ?>)" title="Düzenle">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <a href="?delete_id=<?php echo $c['id']; ?>" class="btn btn-light btn-sm text-danger" onclick="return confirm('Dersi ve tüm bağlı konuları silmek istediğinize emin misiniz?');" title="Sil">
                <i class="fa-solid fa-trash"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>

<!-- Ders Ekleme/Düzenleme Modali -->
<div class="modal fade" id="courseModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header bg-navy text-white">
        <h6 class="modal-title fw-bold" id="courseModalTitle">Yeni Ders Oluştur</h6>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form method="POST">
        <?php echo csrfField(); ?>
        <input type="hidden" name="action" value="save_course">
        <input type="hidden" name="course_id" id="courseId" value="0">
        <div class="modal-body p-4 small">
          <div class="mb-3">
            <label class="form-label fw-semibold">Ders Başlığı</label>
            <input type="text" name="title" id="courseTitle" class="form-control form-control-sm" required placeholder="Örn: Veri Yapıları ve Algoritmalar">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Kategori</label>
            <input type="text" name="category" id="courseCategory" class="form-control form-control-sm" required placeholder="Örn: Bilişim & Yazılım">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Açıklama</label>
            <textarea name="description" id="courseDescription" rows="3" class="form-control form-control-sm" placeholder="Dersin hedefleri ve içeriği"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Görsel URL</label>
            <input type="url" name="image_url" id="courseImageUrl" class="form-control form-control-sm" placeholder="https://images.unsplash.com/...">
          </div>
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label fw-semibold">Sıralama</label>
              <input type="number" name="sort_order" id="courseSortOrder" class="form-control form-control-sm" value="1">
            </div>
            <div class="col-6 d-flex align-items-center pt-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" name="is_active" id="courseIsActive" value="1" checked>
                <label class="form-check-label fw-semibold" for="courseIsActive">Aktif / Yayınla</label>
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
  function resetCourseForm() {
    document.getElementById('courseModalTitle').textContent = 'Yeni Ders Oluştur';
    document.getElementById('courseId').value = '0';
    document.getElementById('courseTitle').value = '';
    document.getElementById('courseCategory').value = '';
    document.getElementById('courseDescription').value = '';
    document.getElementById('courseImageUrl').value = '';
    document.getElementById('courseSortOrder').value = '1';
    document.getElementById('courseIsActive').checked = true;
  }

  function editCourse(c) {
    document.getElementById('courseModalTitle').textContent = 'Dersi Düzenle: ' + c.title;
    document.getElementById('courseId').value = c.id;
    document.getElementById('courseTitle').value = c.title;
    document.getElementById('courseCategory').value = c.category;
    document.getElementById('courseDescription').value = c.description;
    document.getElementById('courseImageUrl').value = c.image_url;
    document.getElementById('courseSortOrder').value = c.sort_order;
    document.getElementById('courseIsActive').checked = c.is_active == 1;
    new bootstrap.Modal(document.getElementById('courseModal')).show();
  }
</script>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
