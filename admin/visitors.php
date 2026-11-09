<?php
/**
 * E-LEARN: Ziyaretçi ve IP Logları Yönetim Ekranı (admin/visitors.php)
 */

$pageTitle = 'Ziyaretçi ve IP Logları';
$activePage = 'visitors';
require_once __DIR__ . '/includes/admin_header.php';

// Filtreler
$filterDate = trim($_GET['date'] ?? '');
$filterIp = trim($_GET['ip'] ?? '');
$filterDevice = trim($_GET['device'] ?? '');
$search = trim($_GET['q'] ?? '');
$page = max(1, (int)($_GET['p'] ?? 1));
$limit = 20;
$offset = ($page - 1) * $limit;

// IP Detay Parametresi
$detailIp = trim($_GET['ip_detail'] ?? '');

// CSV İndirme
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    $rows = dbSelect("SELECT id, ip_address, page_title, page_url, browser, operating_system, device_type, visit_date, visit_time FROM visitor_logs ORDER BY id DESC LIMIT 1000");
    outputCsv('ziyaretci_loglari_' . date('Ymd_His') . '.csv', ['ID', 'IP Adresi', 'Sayfa Başlığı', 'URL', 'Tarayıcı', 'İşletim Sistemi', 'Cihaz', 'Tarih', 'Saat'], $rows);
}

// SQL Sorgusu Oluşturma
$where = ["1=1"];
$params = [];
$types = '';

if (!empty($filterDate)) {
    $where[] = "visit_date = ?";
    $params[] = $filterDate;
    $types .= 's';
}
if (!empty($filterIp)) {
    $where[] = "ip_address LIKE ?";
    $params[] = "%$filterIp%";
    $types .= 's';
}
if (!empty($filterDevice)) {
    $where[] = "device_type = ?";
    $params[] = $filterDevice;
    $types .= 's';
}
if (!empty($search)) {
    $where[] = "(page_title LIKE ? OR page_url LIKE ? OR referrer LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $types .= 'sss';
}

$whereClause = implode(' AND ', $where);

// Toplam Kayıt
$countRow = dbSelectOne("SELECT COUNT(*) as c FROM visitor_logs WHERE $whereClause", $types, $params);
$totalRecords = $countRow['c'] ?? 0;
$totalPages = ceil($totalRecords / $limit);

// Sayfalı Veri
$sql = "SELECT * FROM visitor_logs WHERE $whereClause ORDER BY id DESC LIMIT $limit OFFSET $offset";
$logs = dbSelect($sql, $types, $params);

// IP Detay Bilgisi (Tıklanan IP için)
$ipHistory = null;
if (!empty($detailIp)) {
    $ipVisits = dbSelect("SELECT * FROM visitor_logs WHERE ip_address = ? ORDER BY id DESC LIMIT 20", "s", [$detailIp]);
    $ipLogins = dbSelect("SELECT * FROM student_login_logs WHERE ip_address = ? ORDER BY id DESC LIMIT 20", "s", [$detailIp]);
    $ipRegisters = dbSelect("SELECT * FROM student_register_logs WHERE ip_address = ? ORDER BY id DESC LIMIT 20", "s", [$detailIp]);
    $ipBlocked = dbSelectOne("SELECT * FROM blocked_ips WHERE ip_address = ?", "s", [$detailIp]);

    $ipHistory = [
        'ip' => $detailIp,
        'visits' => $ipVisits,
        'logins' => $ipLogins,
        'registers' => $ipRegisters,
        'blocked' => $ipBlocked
    ];
}
?>

<!-- IP Detay Modali / Görüntüleyici -->
<?php if ($ipHistory): ?>
  <div class="card border-0 shadow-lg p-4 rounded-4 mb-4 bg-navy text-white">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <span class="badge bg-teal mb-1">IP Denetim Analizi</span>
        <h4 class="fw-bold mb-0"><i class="fa-solid fa-server me-2"></i><?php echo e($ipHistory['ip']); ?></h4>
      </div>
      <a href="/admin/visitors.php" class="btn btn-outline-light btn-sm">✕ Paneli Kapat</a>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <div class="p-3 bg-white bg-opacity-10 rounded-3">
          <div class="text-white-50 small">Toplam Ziyaret</div>
          <div class="fs-4 fw-bold"><?php echo count($ipHistory['visits']); ?>+ Sayfa</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="p-3 bg-white bg-opacity-10 rounded-3">
          <div class="text-white-50 small">Giriş Denemeleri</div>
          <div class="fs-4 fw-bold"><?php echo count($ipHistory['logins']); ?> İşlem</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="p-3 bg-white bg-opacity-10 rounded-3">
          <div class="text-white-50 small">Kayıt Denemeleri</div>
          <div class="fs-4 fw-bold"><?php echo count($ipHistory['registers']); ?> İşlem</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="p-3 bg-white bg-opacity-10 rounded-3">
          <div class="text-white-50 small">Güvenlik Durumu</div>
          <div class="fs-5 fw-bold <?php echo $ipHistory['blocked'] ? 'text-danger' : 'text-success'; ?>">
            <?php echo $ipHistory['blocked'] ? 'Engellenmiş (Rate Limit)' : 'Güvenli / Normal'; ?>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="bg-white text-dark p-3 rounded-3 shadow-xs">
          <h6 class="fw-bold text-navy mb-2"><i class="fa-solid fa-clock-rotate-left me-1"></i>Son Sayfa Ziyaretleri</h6>
          <div class="table-responsive" style="max-height: 200px;">
            <table class="table table-sm small mb-0">
              <thead><tr><th>Zaman</th><th>URL</th><th>Cihaz</th></tr></thead>
              <tbody>
                <?php foreach ($ipHistory['visits'] as $v): ?>
                  <tr>
                    <td><?php echo $v['visit_time']; ?></td>
                    <td class="font-monospace text-primary"><?php echo e($v['page_url']); ?></td>
                    <td><?php echo e($v['browser']); ?></td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="bg-white text-dark p-3 rounded-3 shadow-xs">
          <h6 class="fw-bold text-navy mb-2"><i class="fa-solid fa-key me-1"></i>Giriş ve Doğrulama Denemeleri</h6>
          <div class="table-responsive" style="max-height: 200px;">
            <table class="table table-sm small mb-0">
              <thead><tr><th>Zaman</th><th>Öğrenci No</th><th>Durum</th><th>Neden</th></tr></thead>
              <tbody>
                <?php if (empty($ipHistory['logins'])): ?>
                  <tr><td colspan="4" class="text-muted text-center">Bu IP'den giriş denemesi yok.</td></tr>
                <?php else: ?>
                  <?php foreach ($ipHistory['logins'] as $l): ?>
                    <tr>
                      <td><?php echo formatDateTime($l['created_at']); ?></td>
                      <td class="font-monospace fw-bold"><?php echo e($l['student_no']); ?></td>
                      <td>
                        <span class="badge <?php echo $l['status'] === 'success' ? 'bg-success' : 'bg-danger'; ?>">
                          <?php echo $l['status']; ?>
                        </span>
                      </td>
                      <td class="small text-muted"><?php echo e($l['failure_reason'] ?? '-'); ?></td>
                    </tr>
                  <?php endforeach; ?>
                <?php endif; ?>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
<?php endif; ?>

<!-- Arama ve Filtreleme Formu -->
<div class="admin-card p-4 mb-4">
  <form method="GET" class="row g-3 align-items-end">
    <div class="col-md-3">
      <label class="form-label small fw-semibold">Tarih</label>
      <input type="date" name="date" class="form-control form-control-sm" value="<?php echo e($filterDate); ?>">
    </div>
    <div class="col-md-3">
      <label class="form-label small fw-semibold">IP Adresi</label>
      <input type="text" name="ip" class="form-control form-control-sm" placeholder="Örn: 176.234" value="<?php echo e($filterIp); ?>">
    </div>
    <div class="col-md-2">
      <label class="form-label small fw-semibold">Cihaz Türü</label>
      <select name="device" class="form-select form-select-sm">
        <option value="">Tümü</option>
        <option value="desktop" <?php echo $filterDevice === 'desktop' ? 'selected' : ''; ?>>Masaüstü</option>
        <option value="mobile" <?php echo $filterDevice === 'mobile' ? 'selected' : ''; ?>>Mobil</option>
        <option value="tablet" <?php echo $filterDevice === 'tablet' ? 'selected' : ''; ?>>Tablet</option>
      </select>
    </div>
    <div class="col-md-2">
      <label class="form-label small fw-semibold">Sayfa / Arama</label>
      <input type="text" name="q" class="form-control form-control-sm" placeholder="URL veya başlık" value="<?php echo e($search); ?>">
    </div>
    <div class="col-md-2 d-flex gap-2">
      <button type="submit" class="btn btn-primary btn-sm flex-grow-1 fw-bold">
        <i class="fa-solid fa-filter me-1"></i> Filtrele
      </button>
      <a href="/admin/visitors.php?export=csv" class="btn btn-outline-success btn-sm" title="CSV Olarak İndir">
        <i class="fa-solid fa-file-csv"></i>
      </a>
    </div>
  </form>
</div>

<!-- Tablo -->
<div class="admin-card overflow-hidden">
  <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
    <span class="small fw-semibold text-secondary">Toplam <strong><?php echo number_format($totalRecords); ?></strong> Ziyaret Kaydı Bulundu</span>
    <span class="small text-muted">Sayfa <?php echo $page; ?> / <?php echo max(1, $totalPages); ?></span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle small mb-0">
      <thead class="table-light">
        <tr>
          <th>ID</th>
          <th>IP Adresi (Tıklanabilir)</th>
          <th>Açılan Sayfa</th>
          <th>Tarayıcı / İşletim Sistemi</th>
          <th>Cihaz</th>
          <th>Kullanıcı</th>
          <th>Tarih ve Saat</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($logs)): ?>
          <tr><td colspan="7" class="text-center text-muted py-4">Kriterlere uygun kayıt bulunamadı.</td></tr>
        <?php else: ?>
          <?php foreach ($logs as $log): ?>
            <tr>
              <td class="text-muted">#<?php echo $log['id']; ?></td>
              <td>
                <a href="/admin/visitors.php?ip_detail=<?php echo urlencode($log['ip_address']); ?>" class="fw-bold text-primary font-monospace text-decoration-none" title="Bu IP'nin tüm geçmişini ve girişlerini gör">
                  <i class="fa-solid fa-arrow-up-right-from-square me-1 small"></i><?php echo e($log['ip_address']); ?>
                </a>
              </td>
              <td>
                <div class="fw-semibold text-navy text-truncate" style="max-width: 250px;"><?php echo e($log['page_title'] ?: 'Ana Sayfa'); ?></div>
                <div class="text-muted font-monospace" style="font-size: 11px;"><?php echo e($log['page_url']); ?></div>
              </td>
              <td>
                <div><?php echo e($log['browser']); ?></div>
                <div class="text-muted" style="font-size: 11px;"><?php echo e($log['operating_system']); ?></div>
              </td>
              <td>
                <span class="badge <?php echo $log['device_type'] === 'mobile' ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'; ?>">
                  <?php echo e($log['device_type']); ?>
                </span>
              </td>
              <td>
                <?php if (!empty($log['student_id'])): ?>
                  <span class="badge bg-teal">Öğrenci #<?php echo $log['student_id']; ?></span>
                <?php else: ?>
                  <span class="badge bg-light text-muted border">Anonim</span>
                <?php endif; ?>
              </td>
              <td class="text-muted">
                <?php echo date('d.m.Y', strtotime($log['visit_date'])); ?> <strong><?php echo $log['visit_time']; ?></strong>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>

  <!-- Sayfalama -->
  <?php if ($totalPages > 1): ?>
    <div class="p-3 border-top d-flex justify-content-center">
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <?php for ($i = 1; $i <= min(10, $totalPages); $i++): ?>
            <li class="page-item <?php echo $page === $i ? 'active' : ''; ?>">
              <a class="page-link" href="?p=<?php echo $i; ?>&date=<?php echo urlencode($filterDate); ?>&ip=<?php echo urlencode($filterIp); ?>&device=<?php echo urlencode($filterDevice); ?>&q=<?php echo urlencode($search); ?>"><?php echo $i; ?></a>
            </li>
          <?php endfor; ?>
        </ul>
      </nav>
    </div>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
