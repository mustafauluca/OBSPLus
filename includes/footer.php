<?php
/**
 * E-LEARN: Öğrenci Eğitim, Sınav ve İstatistik Platformu
 * Genel Alt Bilgi ve Modal Şablonu (footer.php)
 */

$contact = $contact ?? getContactSettings();
?>
  <!-- Alt Bilgi (Footer) -->
  <footer class="bg-navy text-white mt-auto pt-5 pb-4 border-top border-secondary border-opacity-25">
    <div class="container">
      <div class="row g-4">
        <!-- Site Bilgisi -->
        <div class="col-lg-4 col-md-6">
          <h5 class="fw-bold text-white d-flex align-items-center gap-2">
            <span class="badge bg-primary p-2 fs-6 rounded-3"><i class="fa-solid fa-book-open"></i></span>
            <span>E-LEARN<span class="text-teal">.edu</span></span>
          </h5>
          <p class="text-white-50 small mt-2">
            <?php echo e(getSiteSetting('about_summary')); ?>
          </p>
          <div class="d-flex gap-3 mt-3">
            <?php if (!empty($contact['whatsapp'])): ?>
              <a href="https://wa.me/<?php echo e($contact['whatsapp']); ?>" target="_blank" class="text-white-50 fs-5"><i class="fa-brands fa-whatsapp"></i></a>
            <?php endif; ?>
            <?php if (!empty($contact['instagram'])): ?>
              <a href="https://instagram.com/<?php echo e($contact['instagram']); ?>" target="_blank" class="text-white-50 fs-5"><i class="fa-brands fa-instagram"></i></a>
            <?php endif; ?>
            <?php if (!empty($contact['facebook'])): ?>
              <a href="https://facebook.com/<?php echo e($contact['facebook']); ?>" target="_blank" class="text-white-50 fs-5"><i class="fa-brands fa-facebook"></i></a>
            <?php endif; ?>
            <?php if (!empty($contact['youtube'])): ?>
              <a href="https://youtube.com/<?php echo e($contact['youtube']); ?>" target="_blank" class="text-white-50 fs-5"><i class="fa-brands fa-youtube"></i></a>
            <?php endif; ?>
          </div>
        </div>

        <!-- Hızlı Bağlantılar -->
        <div class="col-lg-2 col-md-6">
          <h6 class="text-uppercase fw-bold text-teal mb-3">E-LEARN</h6>
          <ul class="list-unstyled small space-y-2">
            <li class="mb-2"><a href="/" class="text-white-50 text-decoration-none">Ana Sayfa</a></li>
            <li class="mb-2"><a href="/elearn/" class="text-white-50 text-decoration-none">Dersler & Konular</a></li>
            <li class="mb-2"><a href="/#skorboard" class="text-white-50 text-decoration-none">Skorboard</a></li>
            <li class="mb-2"><a href="/#ekip" class="text-white-50 text-decoration-none">Akademik Ekip</a></li>
            <li class="mb-2"><a href="/#iletisim" class="text-white-50 text-decoration-none">İletişim</a></li>
          </ul>
        </div>

        <!-- İletişim Detayları -->
        <div class="col-lg-3 col-md-6">
          <h6 class="text-uppercase fw-bold text-teal mb-3">İletişim Bilgileri</h6>
          <p class="text-white-50 small mb-2">
            <i class="fa-solid fa-location-dot me-2 text-teal"></i><?php echo e($contact['address']); ?>
          </p>
          <p class="text-white-50 small mb-2">
            <i class="fa-solid fa-phone me-2 text-teal"></i><?php echo e($contact['phone']); ?>
          </p>
          <p class="text-white-50 small mb-2">
            <i class="fa-solid fa-envelope me-2 text-teal"></i><?php echo e($contact['email']); ?>
          </p>
          <p class="text-white-50 small mb-2">
            <i class="fa-solid fa-clock me-2 text-teal"></i><?php echo e($contact['working_hours']); ?>
          </p>
        </div>

        <!-- KVKK ve Yasal -->
        <div class="col-lg-3 col-md-6">
          <h6 class="text-uppercase fw-bold text-teal mb-3">Yasal & Güvenlik</h6>
          <p class="text-white-50 small">
            Öğrenci verileri 6698 sayılı KVKK kapsamında şifrelenmiş altyapıda saklanmaktadır. Şifreler hiçbir koşulda açık metin tutulmaz.
          </p>
          <button type="button" class="btn btn-outline-secondary btn-sm text-white-50" data-bs-toggle="modal" data-bs-target="#kvkkModal">
            <i class="fa-solid fa-shield-halved me-1"></i> KVKK Aydınlatma Metni
          </button>
        </div>
      </div>

      <hr class="border-secondary border-opacity-25 my-4">

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center text-white-50 small">
        <div><?php echo e(getSiteSetting('footer_text', '© 2026 E-LEARN. Tüm Hakları Saklıdır.')); ?></div>
        <div class="mt-2 mt-md-0">Türkiye Standart Saati: <strong><?php echo date('d.m.Y H:i'); ?> (Europe/Istanbul)</strong></div>
      </div>
    </div>
  </footer>

  <!-- ÖĞRENCİ GİRİŞ MODALİ -->
  <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-navy text-white">
          <h5 class="modal-title fw-bold" id="loginModalLabel"><i class="fa-solid fa-right-to-bracket text-teal me-2"></i>Öğrenci Girişi</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Kapat"></button>
        </div>
        <form action="/auth_action.php" method="POST">
          <?php echo csrfField(); ?>
          <input type="hidden" name="action" value="student_login">
          <div class="modal-body p-4">
            <div class="mb-3">
              <label for="loginStudentNo" class="form-label fw-semibold small">Öğrenci Numarası</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-id-card text-muted"></i></span>
                <input type="text" class="form-control" id="loginStudentNo" name="student_no" required placeholder="Örn: 202610101">
              </div>
            </div>
            <div class="mb-3">
              <label for="loginPassword" class="form-label fw-semibold small">Şifre</label>
              <div class="input-group">
                <span class="input-group-text"><i class="fa-solid fa-lock text-muted"></i></span>
                <input type="password" class="form-control" id="loginPassword" name="password" required placeholder="••••••••">
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="rememberMe" name="remember_me" value="1">
                <label class="form-check-label small" for="rememberMe">Beni Hatırla</label>
              </div>
              <a href="#" class="small text-decoration-none text-teal" onclick="alert('Lütfen öğrenci işleri ile iletişime geçiniz: <?php echo e($contact['phone']); ?>'); return false;">Şifremi Unuttum</a>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">İptal</button>
            <button type="submit" class="btn btn-teal btn-sm px-4">Giriş Yap</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- ÖĞRENCİ KAYIT MODALİ -->
  <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-navy text-white">
          <h5 class="modal-title fw-bold" id="registerModalLabel"><i class="fa-solid fa-user-plus text-teal me-2"></i>Öğrenci Kayıt Formu</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Kapat"></button>
        </div>
        <form action="/auth_action.php" method="POST">
          <?php echo csrfField(); ?>
          <input type="hidden" name="action" value="student_register">
          <div class="modal-body p-4">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Öğrenci Numarası <span class="text-danger">*</span></label>
                <input type="text" class="form-control" name="student_no" required placeholder="Örn: 202610105">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">E-Posta Adresi <span class="text-danger">*</span></label>
                <input type="email" class="form-control" name="email" required placeholder="ogrenci@edu.tr">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Adınız <span class="text-danger">*</span></label>
                <input type="text" class="form-control" name="first_name" required placeholder="Adınız">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Soyadınız <span class="text-danger">*</span></label>
                <input type="text" class="form-control" name="last_name" required placeholder="Soyadınız">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Telefon Numarası <span class="text-danger">*</span></label>
                <input type="tel" class="form-control" name="phone" required placeholder="05XXXXXXXXX">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Skorboard Tercihi</label>
                <div class="form-check mt-2">
                  <input class="form-check-input" type="checkbox" name="allow_scoreboard" value="1" id="allowScoreboard" checked>
                  <label class="form-check-label small" for="allowScoreboard">
                    Başarı sıralamasında maskelenmiş adım gösterilsin (Örn: Ahmet Y.)
                  </label>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Şifre <span class="text-danger">*</span></label>
                <input type="password" class="form-control" name="password" required minlength="6" placeholder="En az 6 karakter">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Şifre Tekrarı <span class="text-danger">*</span></label>
                <input type="password" class="form-control" name="password_confirm" required minlength="6" placeholder="Şifrenizi tekrar giriniz">
              </div>
            </div>

            <div class="mt-4 p-3 bg-light rounded-3 border">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" name="kvkk_accepted" value="1" id="kvkkCheck" required>
                <label class="form-check-label small text-muted" for="kvkkCheck">
                  6698 Sayılı KVKK Aydınlatma Metnini okudum, anladım ve kabul ediyorum.
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">İptal</button>
            <button type="submit" class="btn btn-teal btn-sm px-4 fw-bold">Kaydı Tamamla</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- KVKK MODALİ -->
  <div class="modal fade" id="kvkkModal" tabindex="-1" aria-labelledby="kvkkModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-navy text-white">
          <h5 class="modal-title fw-bold" id="kvkkModalLabel"><i class="fa-solid fa-shield-halved text-teal me-2"></i>KVKK Aydınlatma Metni</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Kapat"></button>
        </div>
        <div class="modal-body p-4 small text-secondary">
          <h6 class="fw-bold text-dark">1. Veri Sorumlusu</h6>
          <p><?php echo e(getSiteSetting('site_name')); ?> olarak kişisel verilerinizin güvenliğine azami önem vermekteyiz.</p>
          <h6 class="fw-bold text-dark">2. İşlenen Kişisel Veriler ve Amaç</h6>
          <p>Öğrenci numarası, ad soyad, e-posta, telefon ve sınav başarı kayıtlarınız eğitim faaliyetlerinin yürütülmesi, ölçme ve değerlendirme süreçlerinin gerçekleştirilmesi amacıyla işlenmektedir.</p>
          <h6 class="fw-bold text-dark">3. Veri Güvenliği ve Şifreleme</h6>
          <p>Kullanıcı şifreleri tek yönlü bcrypt algoritması ile saklanmakta, giriş ve kayıt loglarında şifre bilgisi hiçbir suretle tutulmamaktadır.</p>
          <h6 class="fw-bold text-dark">4. Saklama Süresi ve İmha</h6>
          <p>Log kayıtları azami <?php echo e(getSiteSetting('data_retention_days', '365')); ?> gün süreyle saklanır ve süre sonunda otomatik veya periyodik olarak anonimleştirilir.</p>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Anladım</button>
        </div>
      </div>
    </div>
  </div>

  <!-- JS Kütüphaneleri -->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
</body>
</html>
