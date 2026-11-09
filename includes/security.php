<?php
/**
 * E-LEARN: Öğrenci Eğitim, Sınav ve İstatistik Platformu
 * Güvenlik Katmanı: CSRF, XSS, Güvenli IP, Rate Limit ve IP Engelleme
 */

require_once __DIR__ . '/../config/settings.php';

/**
 * XSS Korumalı Çıktı Üretici
 */
function e(?string $string): string {
    return htmlspecialchars($string ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Güvenli İstemci IP Adresi Alıcı
 * Proxy başlıklarını yalnızca güvenilir proxy yapılandırmasında dikkate alır
 */
function getClientIp(): string {
    // Güvenilir proxy IP listesi (isteğe bağlı ortam değişkeninden)
    $trustedProxies = array_filter(explode(',', getenv('TRUSTED_PROXIES') ?: ''));

    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

    // Güvenilir proxy arkasındaysa X-Forwarded-For kontrol edilir
    if (!empty($trustedProxies) && in_array($remoteAddr, $trustedProxies, true)) {
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $clientIp = trim($ips[0]);
            if (filter_var($clientIp, FILTER_VALIDATE_IP)) {
                return $clientIp;
            }
        }
    }

    if (filter_var($remoteAddr, FILTER_VALIDATE_IP)) {
        return $remoteAddr;
    }

    return '127.0.0.1';
}

/**
 * CSRF Token Üretici
 */
function generateCsrfToken(): string {
    if (empty($_SESSION['csrf_token']) || empty($_SESSION['csrf_token_time']) || (time() - $_SESSION['csrf_token_time'] > 7200)) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    }
    return $_SESSION['csrf_token'];
}

/**
 * CSRF Token HTML Input Çıktısı
 */
function csrfField(): string {
    $token = generateCsrfToken();
    return '<input type="hidden" name="csrf_token" value="' . e($token) . '">';
}

/**
 * CSRF Token Doğrulama
 */
function validateCsrfToken(?string $token): bool {
    if (empty($token) || empty($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * IP Engelleme Kontrolü (Rate Limiting)
 */
function isIpBlocked(string $ip): bool {
    $row = dbSelectOne(
        "SELECT blocked_until FROM blocked_ips WHERE ip_address = ? AND blocked_until > NOW()",
        "s",
        [$ip]
    );
    return !empty($row);
}

/**
 * Başarısız Giriş Denemesini Kaydet ve Gerekirse IP'yi Engelle
 */
function recordFailedAttempt(string $ip, string $reason = 'Hatalı Giriş'): void {
    $maxAttempts = (int)getSiteSetting('rate_limit_max_attempts', '5');
    $blockMinutes = (int)getSiteSetting('rate_limit_block_minutes', '15');

    // Mevcut kaydı sorgula
    $row = dbSelectOne("SELECT id, failed_attempts FROM blocked_ips WHERE ip_address = ?", "s", [$ip]);

    if ($row) {
        $attempts = $row['failed_attempts'] + 1;
        if ($attempts >= $maxAttempts) {
            $blockedUntil = date('Y-m-d H:i:s', strtotime("+{$blockMinutes} minutes"));
            dbExecute(
                "UPDATE blocked_ips SET failed_attempts = ?, blocked_until = ?, reason = ? WHERE id = ?",
                "issi",
                [$attempts, $blockedUntil, $reason, $row['id']]
            );
        } else {
            dbExecute(
                "UPDATE blocked_ips SET failed_attempts = ? WHERE id = ?",
                "ii",
                [$attempts, $row['id']]
            );
        }
    } else {
        $blockedUntil = date('Y-m-d H:i:s', strtotime("+1 minute"));
        dbExecute(
            "INSERT INTO blocked_ips (ip_address, reason, failed_attempts, blocked_until) VALUES (?, ?, 1, ?)",
            "sss",
            [$ip, $reason, $blockedUntil]
        );
    }
}

/**
 * Başarılı Girişte IP Deneme Sayacını Sıfırla
 */
function resetFailedAttempts(string $ip): void {
    dbExecute("DELETE FROM blocked_ips WHERE ip_address = ?", "s", [$ip]);
}

/**
 * Güvenli Dosya Yükleme Kontrolü
 */
function validateUploadedFile(array $file, array $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'], int $maxSizeBytes = 5242880): array {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['valid' => false, 'error' => 'Dosya yükleme hatası oluştu (Kod: ' . $file['error'] . ')'];
    }

    if ($file['size'] > $maxSizeBytes) {
        return ['valid' => false, 'error' => 'Dosya boyutu 5MB sınırını aşamaz.'];
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        return ['valid' => false, 'error' => 'Desteklenmeyen dosya uzantısı (İzin verilenler: ' . implode(', ', $allowedExtensions) . ')'];
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowedMimes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'pdf' => 'application/pdf'
    ];

    if (!isset($allowedMimes[$extension]) || $allowedMimes[$extension] !== $mime) {
        return ['valid' => false, 'error' => 'Dosya içerik tipi (MIME) geçersiz.'];
    }

    return ['valid' => true, 'extension' => $extension, 'mime' => $mime];
}
