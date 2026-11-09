<?php
/**
 * E-LEARN: Akademik Ekip Yönetimi (admin/team.php)
 */

$pageTitle = 'Ekip ve Danışman Heyeti Yönetimi';
$activePage = 'team';
require_once __DIR__ . '/includes/admin_header.php';

// Ekip Üyesi Kaydet / Güncelle (POST)
$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_member') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        $msg = ['type' => 'danger', 'text' => 'CSRF hatası.'];
    } else {
        $id = (int)($_POST['member_id'] ?? 0);
        $fullName = trim($_POST['full_name'] ?? '');
        $roleTitle = trim($_POST['role_title'] ?? '');
        $photoUrl = trim($_POST['photo_url'] ?? '');
        $biography = trim($_POST['biography'] ?? '');
        $education = trim($_POST['education'] ?? '');
        $specialties = trim($_POST['specialties'] ?? '');
        $sortOrder = (int)($_POST['sort_order'] ?? 1);
        $isActive = !empty($_POST['is_active']) ? 1 : 0;

        if ($id > 0) {
            dbExecute(
                "UPDATE team_members SET full_name = ?, role_title = ?, photo_url = ?, biography = ?, education = ?, specialties = ?, sort_order = ?, is_active = ? WHERE id = ?",
                "ssssssiii",
                [$fullName, $roleTitle, $photoUrl, $biography, $education, $specialties, $sortOrder, $isActive, $id]
            );
            $msg = ['type' => 'success', 'text' => 'Ekip üyesi bilgileri güncellendi.'];
        } else {
            dbExecute(
                "INSERT INTO team_members (full_name, role_title, photo_url, biography, education, specialties, sort_order, is_active, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)",
                "ssssssii",
                [$fullName, $roleTitle, $photoUrl, $biography, $education, $specialties, $sortOrder, $isActive]
            );
            $msg = ['type' => 'success', 'text' => 'Yeni ekip üyesi başarıyla eklendi.'];
        }
    }
}

// Ekip Üyesi Sil
if (isset($_GET['delete_id'])) {
    $delId = (int)$_GET['delete_id'];
    dbExecute("DELETE FROM team_members WHERE id = ?", "i", [$delId]);
    header("Location: /admin/team.php");
    exit;
}

$teamMembers = dbSelect("SELECT * FROM team_members ORDER BY sort_order ASC");
?>

<?php if ($msg): ?>
  <div class="alert alert-<?php echo $msg['type']; ?> alert-dismissible fade show" role="alert">
    <?php echo e($msg['text']); ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <h6 class="text-secondary mb-0">Ana sayfada listelenen akademik danışma ve koordinatör heyeti</h6>
  <button class="btn btn-teal btn-sm fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#teamModal" onclick="resetTeamForm()">
    <i class="fa-solid fa-plus me-1"></i> Yeni Ekip Üyesi Ekle
  </button>
</div>

<div class="row g-4">
  <?php foreach ($teamMembers as $m): ?>
    <div class="col-lg-4 col-md-6">
      <div class="admin-card p-3 h-100 d-flex flex-column">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img src="<?php echo e($m['photo_url'] ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'); ?>" class="rounded-circle object-fit-cover border border-2 border-primary" style="width: 64px; height: 64px;" alt="<?php echo e($m['full_name']); ?>">
          <div>
            <h6 class="fw-bold text-navy mb-0"><?php echo e($m['full_name']); ?></h6>
            <div class="badge bg-primary-subtle text-primary small mt-1"><?php echo e($m['role_title']); ?></div>
          </div>
        </div>
        <p class="small text-muted flex-grow-1"><?php echo e($m['biography']); ?></p>
        <div class="small border-top pt-2 mt-2">
          <div><strong class="text-secondary">Eğitim:</strong> <?php echo e($m['education']); ?></div>
          <div><strong class="text-secondary">Uzmanlık:</strong> <?php echo e($m['specialties']); ?></div>
        </div>
        <div class="pt-3 border-top mt-3 d-flex justify-content-between align-items-center">
          <span class="badge <?php echo $m['is_active'] ? 'bg-success' : 'bg-danger'; ?>">
            <?php echo $m['is_active'] ? 'Yayında' : 'Gizli'; ?>
          </span>
          <div class="d-flex gap-1">
            <button class="btn btn-light btn-sm text-primary py-0" onclick="editTeamMember(<?php echo htmlspecialchars(json_encode($m)); ?>)">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <a href="?delete_id=<?php echo $m['id']; ?>" class="btn btn-light btn-sm text-danger py-0" onclick="return confirm('Bu ekip üyesini silmek istediğinize emin misiniz?');">
              <i class="fa-solid fa-trash"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>

<!-- Ekip Üyesi Modali -->
<div class="modal fade" id="teamModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header bg-navy text-white">
        <h6 class="modal-title fw-bold" id="teamModalTitle">Yeni Ekip Üyesi</h6>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form method="POST">
        <?php echo csrfField(); ?>
        <input type="hidden" name="action" value="save_member">
        <input type="hidden" name="member_id" id="memberId" value="0">
        <div class="modal-body p-4 small">
          <div class="mb-2">
            <label class="form-label fw-semibold">Adı Soyadı</label>
            <input type="text" name="full_name" id="memName" class="form-control form-control-sm" required placeholder="Prof. Dr. Ad Soyad">
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Görevi / Rolü</label>
            <input type="text" name="role_title" id="memRole" class="form-control form-control-sm" required placeholder="Eğitim Koordinatörü">
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Fotoğraf URL</label>
            <input type="url" name="photo_url" id="memPhoto" class="form-control form-control-sm" placeholder="https://images.unsplash.com/...">
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Özgeçmiş / Biyografi</label>
            <textarea name="biography" id="memBio" rows="3" class="form-control form-control-sm"></textarea>
          </div>
          <div class="mb-2">
            <label class="form-label fw-semibold">Mezuniyet Bilgisi</label>
            <input type="text" name="education" id="memEdu" class="form-control form-control-sm" placeholder="Üniversite - Bölüm">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Uzmanlık Alanları</label>
            <input type="text" name="specialties" id="memSpec" class="form-control form-control-sm" placeholder="Müfredat, Bilişsel Psikoloji vb.">
          </div>
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label fw-semibold">Sıralama</label>
              <input type="number" name="sort_order" id="memOrder" class="form-control form-control-sm" value="1">
            </div>
            <div class="col-6 d-flex align-items-center pt-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" name="is_active" id="memActive" value="1" checked>
                <label class="form-check-label fw-semibold" for="memActive">Aktif / Yayında</label>
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
  function resetTeamForm() {
    document.getElementById('teamModalTitle').textContent = 'Yeni Ekip Üyesi';
    document.getElementById('memberId').value = '0';
    document.getElementById('memName').value = '';
    document.getElementById('memRole').value = '';
    document.getElementById('memPhoto').value = '';
    document.getElementById('memBio').value = '';
    document.getElementById('memEdu').value = '';
    document.getElementById('memSpec').value = '';
    document.getElementById('memOrder').value = '1';
    document.getElementById('memActive').checked = true;
  }

  function editTeamMember(m) {
    document.getElementById('teamModalTitle').textContent = 'Ekip Üyesini Düzenle';
    document.getElementById('memberId').value = m.id;
    document.getElementById('memName').value = m.full_name;
    document.getElementById('memRole').value = m.role_title;
    document.getElementById('memPhoto').value = m.photo_url || '';
    document.getElementById('memBio').value = m.biography || '';
    document.getElementById('memEdu').value = m.education || '';
    document.getElementById('memSpec').value = m.specialties || '';
    document.getElementById('memOrder').value = m.sort_order;
    document.getElementById('memActive').checked = m.is_active == 1;
    new bootstrap.Modal(document.getElementById('teamModal')).show();
  }
</script>

<?php require_once __DIR__ . '/includes/admin_footer.php'; ?>
