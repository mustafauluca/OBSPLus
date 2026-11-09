<?php
/**
 * E-LEARN: Yönetici Gösterge Paneli ve İstatistik Analitiği (admin/dashboard.php)
 */

$pageTitle = 'Genel Bakış & Ziyaretçi İstatistikleri';
$activePage = 'dashboard';
require_once __DIR__ . '/includes/admin_header.php';

// İstatistik Verilerini Çek
$stats = getDashboardVisitorStats();

// Ek sayaçlar
$studentCount = dbSelectOne("SELECT COUNT(*) as c FROM students")['c'] ?? 0;
$courseCount = dbSelectOne("SELECT COUNT(*) as c FROM courses")['c'] ?? 0;
$examCount = dbSelectOne("SELECT COUNT(*) as c FROM exams")['c'] ?? 0;
$recentAttempts = dbSelect("SELECT ea.*, s.first_name, s.last_name, s.student_no 
                            FROM exam_attempts ea 
                            JOIN students s ON s.id = ea.student_id 
                            ORDER BY ea.id DESC LIMIT 5");

// Son 7 Günlük Grafiğe Uygun Diziler
$chartDates = [];
$chartTotals = [];
$chartUniques = [];
foreach ($stats['last7_days'] as $d) {
    $chartDates[] = date('d/m', strtotime($d['visit_date']));
    $chartTotals[] = (int)$d['total'];
    $chartUniques[] = (int)$d['unique_ips'];
}
?>

<!-- İstatistik Sayaçları (Kutular) -->
<div class="row g-3 mb-4">
  <div class="col-sm-6 col-xl-3">
    <div class="admin-card p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <div class="text-muted small fw-semibold">Bugünkü Ziyaretçi</div>
          <div class="fs-3 fw-bold text-navy mt-1"><?php echo number_format($stats['today_total']); ?></div>
          <div class="small text-success mt-1"><i class="fa-solid fa-arrow-trend-up me-1"></i>Tekil: <strong><?php echo $stats['today_unique']; ?></strong></div>
        </div>
        <div class="bg-primary-subtle text-primary p-3 rounded-4 fs-4"><i class="fa-solid fa-users"></i></div>
      </div>
    </div>
  </div>

  <div class="col-sm-6 col-xl-3">
    <div class="admin-card p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <div class="text-muted small fw-semibold">Toplam Ziyaret Kaydı</div>
          <div class="fs-3 fw-bold text-navy mt-1"><?php echo number_format($stats['all_time_total']); ?></div>
          <div class="small text-muted mt-1">Öğrenci: <?php echo $stats['student_visits']; ?> • Anonim: <?php echo $stats['anon_visits']; ?></div>
        </div>
        <div class="bg-teal-subtle text-teal p-3 rounded-4 fs-4"><i class="fa-solid fa-chart-line"></i></div>
      </div>
    </div>
  </div>

  <div class="col-sm-6 col-xl-3">
    <div class="admin-card p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <div class="text-muted small fw-semibold">Kayıtlı Öğrenciler</div>
          <div class="fs-3 fw-bold text-navy mt-1"><?php echo number_format($studentCount); ?></div>
          <div class="small text-muted mt-1">Aktif Öğrenci Hesapları</div>
        </div>
        <div class="bg-warning-subtle text-warning-emphasis p-3 rounded-4 fs-4"><i class="fa-solid fa-user-graduate"></i></div>
      </div>
    </div>
  </div>

  <div class="col-sm-6 col-xl-3">
    <div class="admin-card p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <div class="text-muted small fw-semibold">Aktif Eğitim & Sınavlar</div>
          <div class="fs-3 fw-bold text-navy mt-1"><?php echo $courseCount; ?> / <?php echo $examCount; ?></div>
          <div class="small text-muted mt-1">Ders / Vize Sınavı</div>
        </div>
        <div class="bg-info-subtle text-info p-3 rounded-4 fs-4"><i class="fa-solid fa-book-open-reader"></i></div>
      </div>
    </div>
  </div>
</div>

<!-- Grafikler Alanı (Chart.js) -->
<div class="row g-4 mb-4">
  <!-- Son 7 Günlük Ziyaret Grafiği -->
  <div class="col-lg-8">
    <div class="admin-card p-4 h-100">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold text-navy mb-0"><i class="fa-solid fa-chart-area text-primary me-2"></i>Son 7 Günlük Ziyaretçi Trendi</h6>
        <span class="badge bg-light text-muted border">Günlük Toplam ve Tekil IP</span>
      </div>
      <div style="height: 280px;">
        <canvas id="visitorTrendChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Cihaz Dağılımı -->
  <div class="col-lg-4">
    <div class="admin-card p-4 h-100">
      <h6 class="fw-bold text-navy mb-3"><i class="fa-solid fa-mobile-screen-button text-teal me-2"></i>Cihaz Türü Dağılımı</h6>
      <div style="height: 220px;">
        <canvas id="deviceChart"></canvas>
      </div>
      <div class="d-flex justify-content-around mt-3 small text-center text-muted">
        <div>Masaüstü: <strong><?php echo $stats['device_dist']['desktop']; ?></strong></div>
        <div>Mobil: <strong><?php echo $stats['device_dist']['mobile']; ?></strong></div>
        <div>Tablet: <strong><?php echo $stats['device_dist']['tablet']; ?></strong></div>
      </div>
    </div>
  </div>
</div>

<div class="row g-4">
  <!-- En Çok Ziyaret Edilen Sayfalar -->
  <div class="col-lg-6">
    <div class="admin-card p-4 h-100">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold text-navy mb-0"><i class="fa-solid fa-fire text-danger me-2"></i>En Çok Ziyaret Edilen Sayfalar</h6>
        <a href="/admin/visitors.php" class="btn btn-outline-secondary btn-sm py-0">Tümünü Gör</a>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-hover align-middle small">
          <thead class="table-light">
            <tr>
              <th>Sayfa URL</th>
              <th>Başlık</th>
              <th class="text-end">Görüntülenme</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($stats['top_pages'] as $tp): ?>
              <tr>
                <td class="font-monospace text-primary"><?php echo e($tp['page_url']); ?></td>
                <td class="text-truncate" style="max-width: 180px;"><?php echo e($tp['page_title'] ?: 'Ana Sayfa'); ?></td>
                <td class="text-end fw-bold"><?php echo number_format($tp['view_count']); ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Son Sınav Girişimleri -->
  <div class="col-lg-6">
    <div class="admin-card p-4 h-100">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold text-navy mb-0"><i class="fa-solid fa-clock-rotate-left text-warning me-2"></i>Son Tamamlanan Sınavlar</h6>
        <a href="/admin/results.php" class="btn btn-outline-secondary btn-sm py-0">Tüm Sonuçlar</a>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-hover align-middle small">
          <thead class="table-light">
            <tr>
              <th>Öğrenci</th>
              <th>Tür</th>
              <th class="text-center">Puan</th>
              <th class="text-end">Durum</th>
            </tr>
          </thead>
          <tbody>
            <?php if (empty($recentAttempts)): ?>
              <tr><td colspan="4" class="text-center text-muted py-3">Henüz sınav kaydı yok.</td></tr>
            <?php else: ?>
              <?php foreach ($recentAttempts as $ra): ?>
                <tr>
                  <td>
                    <div class="fw-semibold text-navy"><?php echo e($ra['first_name'] . ' ' . $ra['last_name']); ?></div>
                    <div class="text-muted" style="font-size: 11px;"><?php echo e($ra['student_no']); ?></div>
                  </td>
                  <td>
                    <span class="badge <?php echo $ra['exam_type'] === 'exam' ? 'bg-warning text-dark' : 'bg-secondary'; ?>">
                      <?php echo $ra['exam_type'] === 'exam' ? 'Vize' : 'Quiz'; ?>
                    </span>
                  </td>
                  <td class="text-center fw-bold"><?php echo number_format($ra['score'], 1); ?></td>
                  <td class="text-end">
                    <?php if ($ra['passed']): ?>
                      <span class="badge bg-success">Geçti</span>
                    <?php else: ?>
                      <span class="badge bg-danger">Kaldı</span>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- Chart.js Başlatma Scripti -->
<script>
  // Ziyaret Trend Grafiği (Line Chart)
  const ctxTrend = document.getElementById('visitorTrendChart').getContext('2d');
  new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: <?php echo json_encode(!empty($chartDates) ? $chartDates : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']); ?>,
      datasets: [
        {
          label: 'Toplam Ziyaret',
          data: <?php echo json_encode(!empty($chartTotals) ? $chartTotals : [24, 45, 62, 58, 80, 75, 90]); ?>,
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Tekil IP',
          data: <?php echo json_encode(!empty($chartUniques) ? $chartUniques : [18, 30, 42, 40, 55, 50, 68]); ?>,
          borderColor: '#0d9488',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // Cihaz Dağılım Grafiği (Doughnut Chart)
  const ctxDevice = document.getElementById('deviceChart').getContext('2d');
  new Chart(ctxDevice, {
    type: 'doughnut',
    data: {
      labels: ['Masaüstü', 'Mobil', 'Tablet'],
      datasets: [{
        data: [
          <?php echo $stats['device_dist']['desktop'] ?: 150; ?>,
          <?php echo $stats['device_dist']['mobile'] ?: 85; ?>,
          <?php echo $stats['device_dist']['tablet'] ?: 12; ?>
        ],
        backgroundColor: ['#0f172a', '#0284c7', '#0d9488']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
</script>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
