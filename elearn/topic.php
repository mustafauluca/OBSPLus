<?php
/**
 * E-LEARN: Konu Anlatımı ve Ders İçeriği (/elearn/topic.php)
 */

$topicId = (int)($_GET['id'] ?? 0);
require_once __DIR__ . '/../includes/header.php';

$topic = dbSelectOne(
    "SELECT ct.*, c.title as course_title, c.id as course_id 
     FROM course_topics ct 
     JOIN courses c ON c.id = ct.course_id 
     WHERE ct.id = ? AND ct.is_active = 1",
    "i",
    [$topicId]
);

if (!$topic) {
    echo "<div class='container py-5 text-center'><h3>Konu bulunamadı.</h3><a href='/elearn/' class='btn btn-primary mt-3'>Derslere Dön</a></div>";
    require_once __DIR__ . '/../includes/footer.php';
    exit;
}

$pageTitle = $topic['title'] . ' – ' . $topic['course_title'];

// Konu İçeriği
$content = dbSelectOne("SELECT * FROM topic_contents WHERE topic_id = ?", "i", [$topicId]);

// İlerleme İşlemi (Konuyu Tamamlandı Olarak İşaretle)
$isCompleted = false;
if ($isStudent && $studentUser) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'complete_topic') {
        dbExecute(
            "INSERT INTO student_progress (student_id, course_id, topic_id, is_completed, completed_at) 
             VALUES (?, ?, ?, 1, NOW()) 
             ON DUPLICATE KEY UPDATE is_completed = 1, completed_at = NOW()",
            "iii",
            [$studentUser['id'], $topic['course_id'], $topicId]
        );
    }

    $prog = dbSelectOne(
        "SELECT is_completed FROM student_progress WHERE student_id = ? AND topic_id = ?",
        "ii",
        [$studentUser['id'], $topicId]
    );
    $isCompleted = !empty($prog['is_completed']);
}

// Konuya Bağlı Test
$test = dbSelectOne("SELECT * FROM tests WHERE topic_id = ? AND is_active = 1", "i", [$topicId]);
?>

<div class="bg-navy py-4 text-white">
  <div class="container">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb mb-1 small">
        <li class="breadcrumb-item"><a href="/" class="text-white-50 text-decoration-none">Ana Sayfa</a></li>
        <li class="breadcrumb-item"><a href="/elearn/" class="text-white-50 text-decoration-none">Dersler</a></li>
        <li class="breadcrumb-item"><a href="/elearn/course.php?id=<?php echo $topic['course_id']; ?>" class="text-white-50 text-decoration-none"><?php echo e($topic['course_title']); ?></a></li>
        <li class="breadcrumb-item active text-teal" aria-current="page"><?php echo e($topic['title']); ?></li>
      </ol>
    </nav>
    <div class="d-flex justify-content-between align-items-center">
      <h1 class="h3 fw-bold mb-0"><?php echo e($topic['title']); ?></h1>
      <?php if ($test): ?>
        <a href="/elearn/test.php?topic_id=<?php echo $topicId; ?>" class="btn btn-teal btn-sm fw-bold">
          <i class="fa-solid fa-circle-question me-1"></i> Konu Testini Başlat
        </a>
      <?php endif; ?>
    </div>
  </div>
</div>

<div class="container py-5">
  <div class="row g-4">
    <!-- Ana İçerik -->
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm p-4 rounded-4 mb-4">
        <?php if (!empty($content['video_url'])): ?>
          <div class="mb-4 ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
            <iframe src="<?php echo $content['video_url'];?> title="Eğitim Videosu" allowfullscreen></iframe>
          </div>
        <?php endif; ?>

        <div class="topic-content-body text-secondary lh-lg mb-4">
          <?php echo $content['content_html'] ?? '<p>Bu konunun detaylı metin içeriği hazırlanmaktadır.</p>'; ?>
        </div>

        <hr class="my-4">

        <!-- Tamamlama Butonu -->
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <?php if ($isStudent): ?>
              <?php if ($isCompleted): ?>
                <span class="badge bg-success-subtle text-success p-2 fs-6">
                  <i class="fa-solid fa-circle-check me-1"></i> Bu konuyu tamamladınız
                </span>
              <?php else: ?>
                <form method="POST">
                  <?php echo csrfField(); ?>
                  <input type="hidden" name="action" value="complete_topic">
                  <button type="submit" class="btn btn-outline-success fw-bold">
                    <i class="fa-regular fa-square-check me-1"></i> Konuyu Tamamlandı Olarak İşaretle
                  </button>
                </form>
              <?php endif; ?>
            <?php else: ?>
              <small class="text-muted">İlerlemenizi kaydetmek için lütfen <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal">öğrenci girişi</a> yapınız.</small>
            <?php endif; ?>
          </div>

          <?php if ($test): ?>
            <a href="/elearn/test.php?topic_id=<?php echo $topicId; ?>" class="btn btn-teal fw-bold">
              Konu Testini Çöz →
            </a>
          <?php endif; ?>
        </div>
      </div>
    </div>

    <!-- Yan Panel -->
    <div class="col-lg-4">
      <div class="card border-0 shadow-sm p-4 rounded-4 mb-4">
        <h5 class="fw-bold text-navy mb-3">Ders Navigasyonu</h5>
        <a href="/elearn/course.php?id=<?php echo $topic['course_id']; ?>" class="btn btn-outline-secondary btn-sm w-100 mb-2">
          ← <?php echo e($topic['course_title']); ?> Dersine Dön
        </a>
      </div>

      <?php if (!empty($content['pdf_file_url'])): ?>
        <div class="card border-0 shadow-sm p-4 rounded-4 bg-light border">
          <h6 class="fw-bold text-navy mb-2"><i class="fa-solid fa-file-pdf text-danger me-2"></i>Konu Özeti PDF</h6>
          <p class="small text-muted">Bu ders modülüne ait çalışma özetini PDF formatında cihazınıza indirebilirsiniz.</p>
          <a href="<?php echo e($content['pdf_file_url']); ?>" class="btn btn-danger btn-sm fw-bold w-100" target="_blank">
            PDF Dosyasını İndir
          </a>
        </div>
      <?php endif; ?>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
