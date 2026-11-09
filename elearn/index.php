<?php
/**
 * E-LEARN: Ders Kataloğu ve Eğitim Merkezi (/elearn/index.php)
 */

$pageTitle = 'Eğitim Kataloğu – Dersler ve Modüller';
require_once __DIR__ . '/../includes/header.php';

$search = trim($_GET['q'] ?? '');
$category = trim($_GET['cat'] ?? '');

$sql = "SELECT c.*, 
        (SELECT COUNT(*) FROM course_topics ct WHERE ct.course_id = c.id AND ct.is_active = 1) as topic_count,
        (SELECT COUNT(*) FROM exams e WHERE e.course_id = c.id AND e.is_active = 1) as exam_count
        FROM courses c WHERE c.is_active = 1";
$params = [];
$types = '';

if (!empty($search)) {
    $sql .= " AND (c.title LIKE ? OR c.description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $types .= 'ss';
}

if (!empty($category)) {
    $sql .= " AND c.category = ?";
    $params[] = $category;
    $types .= 's';
}

$sql .= " ORDER BY c.sort_order ASC";

$courses = dbSelect($sql, $types, $params);
$categories = dbSelect("SELECT DISTINCT category FROM courses WHERE is_active = 1");
?>

<div class="bg-navy py-4 text-white">
  <div class="container">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-1 small">
            <li class="breadcrumb-item"><a href="/" class="text-white-50 text-decoration-none">Ana Sayfa</a></li>
            <li class="breadcrumb-item active text-teal" aria-current="page">E-LEARN Modülü</li>
          </ol>
        </nav>
        <h1 class="h3 fw-bold mb-0">E-LEARN Akademik Eğitim Merkezi</h1>
      </div>
      <div>
        <span class="badge bg-teal p-2 px-3 fs-6 rounded-pill">
          <i class="fa-solid fa-graduation-cap me-1"></i> <?php echo count($courses); ?> Aktif Ders
        </span>
      </div>
    </div>
  </div>
</div>

<div class="container py-5">
  <!-- Arama ve Filtreleme -->
  <div class="card border-0 shadow-sm p-4 rounded-4 mb-5">
    <form method="GET" class="row g-3 align-items-center">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
          <input type="text" name="q" value="<?php echo e($search); ?>" class="form-control" placeholder="Ders adı veya açıklamasında ara...">
        </div>
      </div>
      <div class="col-md-4">
        <select name="cat" class="form-select">
          <option value="">Tüm Kategoriler</option>
          <?php foreach ($categories as $cat): ?>
            <option value="<?php echo e($cat['category']); ?>" <?php echo $category === $cat['category'] ? 'selected' : ''; ?>>
              <?php echo e($cat['category']); ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="col-md-2">
        <button type="submit" class="btn btn-teal w-100 fw-bold">Filtrele</button>
      </div>
    </form>
  </div>

  <!-- Ders Kartları -->
  <div class="row g-4">
    <?php if (empty($courses)): ?>
      <div class="col-12 text-center py-5">
        <div class="fs-1 text-muted mb-3"><i class="fa-solid fa-folder-open"></i></div>
        <h5 class="text-navy fw-bold">Aramanızla eşleşen ders bulunamadı.</h5>
        <p class="text-muted small">Farklı bir arama terimi deneyebilir veya filtreyi temizleyebilirsiniz.</p>
        <a href="/elearn/" class="btn btn-outline-secondary btn-sm mt-2">Tüm Dersleri Göster</a>
      </div>
    <?php else: ?>
      <?php foreach ($courses as $c): ?>
        <div class="col-lg-4 col-md-6">
          <div class="card h-100 border-0 shadow-sm scoreboard-card overflow-hidden">
            <img src="<?php echo e($c['image_url'] ?: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'); ?>" class="card-img-top" style="height: 200px; object-fit: cover;" alt="<?php echo e($c['title']); ?>">
            <div class="card-body d-flex flex-column p-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-primary-subtle text-primary small"><?php echo e($c['category']); ?></span>
                <span class="text-muted small"><i class="fa-solid fa-layer-group me-1"></i><?php echo $c['topic_count']; ?> Konu</span>
              </div>
              <h4 class="card-title fw-bold text-navy fs-5 mb-2"><?php echo e($c['title']); ?></h4>
              <p class="card-text text-muted small flex-grow-1"><?php echo e(mb_strimwidth($c['description'] ?? '', 0, 120, '...')); ?></p>
              
              <div class="pt-3 border-top mt-3 d-flex gap-2">
                <a href="/elearn/course.php?id=<?php echo $c['id']; ?>" class="btn btn-teal btn-sm fw-bold flex-grow-1">
                  Derse Başla →
                </a>
                <?php if ($c['exam_count'] > 0): ?>
                  <span class="badge bg-warning-subtle text-warning-emphasis d-flex align-items-center px-2" title="Vize Sınavı Mevcut">
                    <i class="fa-solid fa-file-signature"></i>
                  </span>
                <?php endif; ?>
              </div>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
