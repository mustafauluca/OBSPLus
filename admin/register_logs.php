<?php
/**
 * E-LEARN: Öğrenci Kayıt Denemesi Logları (admin/register_logs.php)
 */

$pageTitle = 'Öğrenci Kayıt Logları';
$activePage = 'register_logs';
require_once __DIR__ . '/includes/admin_header.php';

$filterStatus = trim($_GET['status'] ?? '');
$filterStudentNo = trim($_GET['student_no'] ?? '');
$filterIp = trim($_GET['ip'] ?? '');
$page = max(1, (int)($_GET['p'] ?? 1));
$limit = 20;
$offset = ($page - 1) * $limit;

// CSV İndirme
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    $rows = dbSelect("SELECT id, student_no, full_name, email, ip_address, status, verification_status, failure_reason, created_at FROM student_register_logs ORDER BY id DESC LIMIT 1000");
    outputCsv('ogrenci_kayit_loglari_' . date('Ymd_His') . '.csv', ['ID', 'Öğrenci No', 'Ad Soyad', 'E-Posta', 'IP Adresi', 'Durum', 'Doğrulama', 'Hata', 'Tarih'], $rows);
}

// Filtreler
$where = ["1=1"];
$params = [];
$types = '';

if (!empty($filterStatus)) {
    $where[] = "status = ?";
    $params[] = $filterStatus;
    $types .= 's';
}
if (!empty($filterStudentNo)) {
    $where[] = "student_no LIKE ?";
    $params[] = "%$filterStudentNo%";
    $types .= 's';
}
if (!empty($filterIp)) {
    $where[] = "ip_address LIKE ?";
    $params[] = "%$filterIp%";
    $types .= 's';
}

$whereClause = implode(' AND ', $where);

$totalRecords = dbSelectOne("SELECT COUNT(*) as c FROM student_register_logs WHERE $whereClause", $types, $params)['c'] ?? 0;
$totalPages = ceil($totalRecords / $limit);

$logs = dbSelect("SELECT * FROM student_register_logs WHERE $whereClause ORDER BY id DESC LIMIT $limit OFFSET $offset", $types, $params);
?>

<div class="admin-card p-4 mb-4">
  <form method="GET" class="row g-3 align-items-end">
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Öğrenci Numarası</label>
      <input type="text" name="student_no" class="form-control form-control-sm" placeholder="Örn: 202610101" value="<?php echo e($filterStudentNo); ?>">
    </div>
    <div class="col-md-3">
      <label class="form-label small fw-semibold">Durum</label>
      <select name="status" class="form-select form-select-sm">
        <option value="">Tümü</option>
        <option value="success" <?php echo $filterStatus === 'success' ? 'selected' : ''; ?>>Başarılı</option>
        <option value="failed" <?php echo $filterStatus === 'failed' ? 'selected' : ''; ?>>Başarısız</option>
      </select>
    </div>
    <div class="col-md-3">
      <label class="form-label small fw-semibold">IP Adresi</label>
      <input type="text" name="ip" class="form-control form-control-sm" placeholder="Örn: 176.234" value="<?php echo e($filterIp); ?>">
    </div>
    <div class="col-md-2 d-flex gap-2">
      <button type="submit" class="btn btn-primary btn-sm flex-grow-1 fw-bold">Filtrele</button>
      <a href="/admin/register_logs.php?export=csv" class="btn btn-outline-success btn-sm" title="CSV İndir"><i class="fa-solid fa-file-csv"></i></a>
    </div>
  </form>
</div>

<div class="admin-card overflow-hidden">
  <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
    <span class="small fw-semibold text-secondary">Toplam <strong><?php echo number_format($totalRecords); ?></strong> Kayıt Girişimi</span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle small mb-0">
      <thead class="table-light">
        <tr>
          <th>ID</th>
          <th>Öğrenci No</th>
          <th>Ad Soyad</th>
          <th>E-Posta</th>
          <th>IP Adresi</th>
          <th>Durum</th>
          <th>Doğrulama</th>
          <th>Açıklama / Hata</th>
          <th>Tarih ve Saat</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($logs)): ?>
          <tr><td colspan="9" class="text-center text-muted py-4">Kriterlere uygun kayıt bulunamadı.</td></tr>
        <?php else: ?>
          <?php foreach ($logs as $l): ?>
            <tr>
              <td class="text-muted">#<?php echo $l['id']; ?></td>
              <td class="font-monospace fw-bold text-navy"><?php echo e($l['student_no']); ?></td>
              <td><?php echo e($l['full_name']); ?></td>
              <td><?php echo e($l['email']); ?></td>
              <td>
                <a href="/admin/visitors.php?ip_detail=<?php echo urlencode($l['ip_address']); ?>" class="font-monospace text-primary text-decoration-none">
                  <?php echo e($l['ip_address']); ?>
                </a>
              </td>
              <td>
                <span class="badge <?php echo $l['status'] === 'success' ? 'bg-success' : 'bg-danger'; ?>">
                  <?php echo $l['status'] === 'success' ? 'BAŞARILI' : 'BAŞARISIZ'; ?>
                </span>
              </td>
              <td>
                <span class="badge bg-light text-muted border"><?php echo e($l['verification_status'] ?? 'verified'); ?></span>
              </td>
              <td class="small text-muted"><?php echo e($l['failure_reason'] ?? 'Onaylandı'); ?></td>
              <td class="text-muted"><?php echo formatDateTime($l['created_at']); ?></td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>

  <?php if ($totalPages > 1): ?>
    <div class="p-3 border-top d-flex justify-content-center">
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <?php for ($i = 1; $i <= min(10, $totalPages); $i++): ?>
            <li class="page-item <?php echo $page === $i ? 'active' : ''; ?>">
              <a class="page-link" href="?p=<?php echo $i; ?>&student_no=<?php echo urlencode($filterStudentNo); ?>&status=<?php echo urlencode($filterStatus); ?>&ip=<?php echo urlencode($filterIp); ?>"><?php echo $i; ?></a>
            </li>
          <?php endfor; ?>
        </ul>
      </nav>
    </div>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
