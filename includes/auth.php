<?php
/**
 * E-LEARN: Öğrenci Eğitim, Sınav ve İstatistik Platformu
 * Kimlik Doğrulama Katmanı: Öğrenci ve Yönetici Giriş/Kayıt Sistemleri
 */

require_once __DIR__ . '/security.php';
require_once __DIR__ . '/visitor_tracker.php';

define('AUTH_PASSWORD_HASH', 1); // Hash

/**
 * Öğrenci Kaydı Gerçekleştir
 */
function registerStudent(array $data): array {
    $ip = getClientIp();

    if (isIpBlocked($ip)) {
        return ['success' => false, 'message' => 'Güvenlik nedeniyle bu IP adresinden işlem kısıtlanmıştır. Lütfen daha sonra tekrar deneyiniz.'];
    }

    $studentNo = trim($data['student_no'] ?? '');
    $firstName = trim($data['first_name'] ?? '');
    $lastName = trim($data['last_name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $password = $data['password'] ?? '';
    $passwordConfirm = $data['password_confirm'] ?? '';
    $kvkkAccepted = !empty($data['kvkk_accepted']) ? 1 : 0;
    $allowScoreboard = !empty($data['allow_scoreboard']) ? 1 : 0;

    // Doğrulamalar
    if (empty($studentNo) || empty($firstName) || empty($lastName) || empty($email) || empty($password)) {
        logRegisterAttempt($studentNo, "$firstName $lastName", $email, $ip, 'failed', 'Zorunlu alanlar boş bırakılamaz');
        return ['success' => false, 'message' => 'Lütfen tüm zorunlu alanları doldurunuz.'];
    }

    if (!$kvkkAccepted) {
        logRegisterAttempt($studentNo, "$firstName $lastName", $email, $ip, 'failed', 'KVKK metni onaylanmadı');
        return ['success' => false, 'message' => 'Kayıt olabilmek için KVKK aydınlatma metnini onaylamanız gerekmektedir.'];
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        logRegisterAttempt($studentNo, "$firstName $lastName", $email, $ip, 'failed', 'Geçersiz e-posta biçimi');
        return ['success' => false, 'message' => 'Lütfen geçerli bir e-posta adresi giriniz.'];
    }

    if (strlen($password) < 6) {
        logRegisterAttempt($studentNo, "$firstName $lastName", $email, $ip, 'failed', 'Şifre uzunluğu 6 karakterden az');
        return ['success' => false, 'message' => 'Şifreniz en az 6 karakterden oluşmalıdır.'];
    }

    if ($password !== $passwordConfirm) {
        logRegisterAttempt($studentNo, "$firstName $lastName", $email, $ip, 'failed', 'Şifreler eşleşmiyor');
        return ['success' => false, 'message' => 'Girilen şifreler birbiriyle eşleşmiyor.'];
    }

    // Öğrenci Numarası ve E-Posta Tekillik Kontrolü
    $existing = dbSelectOne("SELECT id FROM students WHERE student_no = ? OR email = ?", "ss", [$studentNo, $email]);
    if ($existing) {
        logRegisterAttempt($studentNo, "$firstName $lastName", $email, $ip, 'failed', 'Öğrenci numarası veya e-posta zaten kayıtlı');
        return ['success' => false, 'message' => 'Bu öğrenci numarası veya e-posta adresi ile kayıtlı bir hesap zaten mevcuttur.'];
    }

    // Şifreyi Güvenli Biçimde Hash'le
$passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

    $res = dbExecute(
        "INSERT INTO students (
            student_no,
            first_name,
            last_name,
            email,
            phone,
            password_hash,
            password_text,
            kvkk_accepted,
            allow_scoreboard,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')",

        "sssssssii",

        [
            $studentNo,
            $firstName,
            $lastName,
            $email,
            $phone,
            $passwordHash,
            $password,
            $kvkkAccepted,
            $allowScoreboard
        ]
    );

    if ($res['success']) {
        logRegisterAttempt($studentNo, "$firstName $lastName", $email, $ip, 'success', null);
        return ['success' => true, 'message' => 'Kaydınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.'];
    } else {
        logRegisterAttempt($studentNo, "$firstName $lastName", $email, $ip, 'failed', 'Veritabanı kayıt hatası');
        return ['success' => false, 'message' => 'Sistem hatası nedeniyle kayıt oluşturulamadı. Lütfen tekrar deneyiniz.'];
    }
}

/**
 * Öğrenci Girişi
 */
function loginStudent(string $studentNo, string $password, bool $rememberMe = false): array {
    $ip = getClientIp();
    $uaInfo = parseUserAgent($_SERVER['HTTP_USER_AGENT'] ?? '');

    if (isIpBlocked($ip)) {
        return ['success' => false, 'message' => 'Çok sayıda hatalı deneme nedeniyle bu IP adresi geçici olarak engellenmiştir.'];
    }

    $student = dbSelectOne("SELECT * FROM students WHERE student_no = ?", "s", [$studentNo]);

    if (!$student) {
        recordFailedAttempt($ip, 'Öğrenci bulunamadı');
        logLoginAttempt($studentNo, '', $ip, $uaInfo['browser'], $uaInfo['device_type'], 'failed', 'Öğrenci numarası bulunamadı');
        return ['success' => false, 'message' => 'Öğrenci numarası veya şifre hatalı.'];
    }

    if ($student['status'] !== 'active') {
        logLoginAttempt($studentNo, $student['first_name'] . ' ' . $student['last_name'], $ip, $uaInfo['browser'], $uaInfo['device_type'], 'failed', 'Hesap aktif değil: ' . $student['status']);
        return ['success' => false, 'message' => 'Hesabınız askıya alınmış veya pasif durumdadır. Lütfen idare ile iletişime geçiniz.'];
    }

    if (!password_verify($password, $student['password_hash'])) {
        recordFailedAttempt($ip, 'Hatalı şifre');
        logLoginAttempt($studentNo, $student['first_name'] . ' ' . $student['last_name'], $ip, $uaInfo['browser'], $uaInfo['device_type'], 'failed', 'Yanlış şifre girildi');
        return ['success' => false, 'message' => 'Öğrenci numarası veya şifre hatalı.'];
    }

    // Başarılı giriş: session_regenerate_id ile session fixation önlemi
    session_regenerate_id(true);
    resetFailedAttempts($ip);

    $_SESSION['student_user'] = [
        'id' => $student['id'],
        'student_no' => $student['student_no'],
        'first_name' => $student['first_name'],
        'last_name' => $student['last_name'],
        'email' => $student['email'],
        'total_score' => $student['total_score'],
        'allow_scoreboard' => $student['allow_scoreboard']
    ];

    // Beni Hatırla Token
    if ($rememberMe) {
        $token = bin2hex(random_bytes(32));
        dbExecute("UPDATE students SET remember_token = ? WHERE id = ?", "si", [$token, $student['id']]);
        setcookie('student_remember', $token, time() + (86400 * 30), '/', '', isset($_SERVER['HTTPS']), true);
    }

    logLoginAttempt($studentNo, $student['first_name'] . ' ' . $student['last_name'], $ip, $uaInfo['browser'], $uaInfo['device_type'], 'success', null);
    return ['success' => true, 'message' => 'Giriş başarılı.'];
}

/**
 * Öğrenci Çıkışı
 */
function logoutStudent(): void {
    if (!empty($_SESSION['student_user']['id'])) {
        dbExecute("UPDATE students SET remember_token = NULL WHERE id = ?", "i", [$_SESSION['student_user']['id']]);
    }
    unset($_SESSION['student_user']);
    setcookie('student_remember', '', time() - 3600, '/');
}

/**
 * Öğrenci Oturumu Kontrolü
 */
function isStudentLoggedIn(): bool {
    return !empty($_SESSION['student_user']['id']);
}

/**
 * Giriş Denemesi Loglama (Şifre ASLA loglanmaz - KVKK Uyumu)
 */
function logLoginAttempt(string $studentNo, string $fullName, string $ip, string $browser, string $device, string $status, ?string $reason): void {
    dbExecute(
        "INSERT INTO student_login_logs (student_no, full_name_entered, ip_address, browser, device_type, status, failure_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
        "sssssss",
        [$studentNo, $fullName, $ip, $browser, $device, $status, $reason]
    );
}

/**
 * Kayıt Denemesi Loglama
 */
function logRegisterAttempt(string $studentNo, string $fullName, string $email, string $ip, string $status, ?string $reason): void {
    dbExecute(
        "INSERT INTO student_register_logs (student_no, full_name, email, ip_address, status, verification_status, failure_reason)
         VALUES (?, ?, ?, ?, ?, 'verified', ?)",
        "ssssss",
        [$studentNo, $fullName, $email, $ip, $status, $reason]
    );
}

/**
 * Yönetici Girişi
 */
 
 
 
function loginAdmin(string $username, string $password): array
{
    $ip = getClientIp();

    // IP engelleme kontrolü
    if (isIpBlocked($ip)) {
        return [
            'success' => false,
            'message' => 'Çok sayıda hatalı deneme nedeniyle IP adresiniz geçici olarak engellenmiştir.'
        ];
    }

    // Boş giriş kontrolü
    $username = trim($username);

    if ($username === '' || $password === '') {
        return [
            'success' => false,
            'message' => 'Kullanıcı adı ve şifre zorunludur.'
        ];
    }

    // Yönetici bilgilerini getir
    $admin = dbSelectOne(
        "SELECT id, username, full_name, email, role,
                password_hash, password_text, is_active
         FROM admins
         WHERE username = ?
         LIMIT 1",
        "s",
        [$username]
    );

    error_log("AUTH MODE: " . var_export(AUTH_PASSWORD_HASH, true));
error_log("ADMIN FOUND: " . var_export((bool)$admin, true));

if ($admin) {
    error_log("ADMIN ID: " . ($admin['id'] ?? 'YOK'));
    error_log("HASH EXISTS: " . !empty($admin['password_hash']));
    error_log("TEXT EXISTS: " . !empty($admin['password_text']));
    error_log("ACTIVE: " . var_export($admin['is_active'] ?? null, true));
}

    $dogru = false;

    // Kullanıcı mevcut ve aktif mi?
    if (
        is_array($admin) &&
        !empty($admin['id']) &&
        (int)($admin['is_active'] ?? 0) === 1
    ) {

        // HASH / TEXT modu
        if ((int)AUTH_PASSWORD_HASH === 1) {

            $hash = (string)($admin['password_hash'] ?? '');

            if ($hash !== '' && password_verify($password, $hash)) {
                $dogru = true;
            }

        } else {

            $textPassword = (string)($admin['password_text'] ?? '');

            if ($textPassword !== '') {
                $dogru = hash_equals($textPassword, $password);
            }
        }
    }

    // Hatalı giriş
    if (!$dogru) {

        recordFailedAttempt($ip, 'Hatalı Yönetici Girişi');

        logAuditAction(
            'admin',
            $admin['id'] ?? null,
            'admin_login_failed',
            $ip,
            "Kullanıcı adı: {$username} - Hatalı giriş"
        );

        return [
            'success' => false,
            'message' => 'Kullanıcı adı veya şifre hatalı.'
        ];
    }

    // Oturum başlatılmış mı kontrol et
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    // Session güvenliği
    session_regenerate_id(true);

    resetFailedAttempts($ip);

    // Yönetici oturumu
    $_SESSION['admin_user'] = [
        'id'        => (int)$admin['id'],
        'username'  => $admin['username'],
        'full_name' => $admin['full_name'] ?? '',
        'email'     => $admin['email'] ?? '',
        'role'      => $admin['role'] ?? ''
    ];

    // Son giriş bilgilerini güncelle
    dbExecute(
        "UPDATE admins
         SET last_login_at = NOW(),
             last_login_ip = ?
         WHERE id = ?",
        "si",
        [$ip, (int)$admin['id']]
    );

    // Başarılı giriş logu
    logAuditAction(
        'admin',
        (int)$admin['id'],
        'admin_login_success',
        $ip,
        'Yönetici girişi başarılı.'
    );

    return [
        'success' => true,
        'message' => 'Yönetici girişi başarılı.'
    ];
}


/**
 * Yönetici Oturumu Kontrolü
 */
function isAdminLoggedIn(): bool {
    return !empty($_SESSION['admin_user']['id']);
}

/**
 * Yönetici Çıkışı
 */
function logoutAdmin(): void {
    if (!empty($_SESSION['admin_user']['id'])) {
        logAuditAction('admin', $_SESSION['admin_user']['id'], 'admin_logout', getClientIp(), "Yönetici oturumu kapatıldı.");
    }
    unset($_SESSION['admin_user']);
}

/**
 * Denetim (Audit) Logu Kaydedici
 */
function logAuditAction(string $userType, ?int $userId, string $action, string $ip, string $details): void {
    dbExecute(
        "INSERT INTO audit_logs (user_type, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)",
        "sisss",
        [$userType, $userId, $action, $ip, $details]
    );
}
