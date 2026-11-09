<?php
/**
 * E-LEARN: Öğrenci Eğitim, Sınav ve İstatistik Platformu
 * Otomatik Ziyaretçi ve İstatistik Takip Katmanı
 */

require_once __DIR__ . '/security.php';

/**
 * Kullanıcı Tarayıcı, İşletim Sistemi ve Cihaz Bilgisini Ayrıştır
 */
function parseUserAgent(?string $ua): array {
    $ua = $ua ?? ($_SERVER['HTTP_USER_AGENT'] ?? '');
    
    $browser = 'Bilinmeyen Tarayıcı';
    $os = 'Bilinmeyen İşletim Sistemi';
    $deviceType = 'desktop';
    $isBot = false;

    // Bot tespiti
    if (preg_match('/(bot|crawl|slurp|spider|mediapartners|lighthouse|headless|curl|wget)/i', $ua)) {
        return [
            'browser' => 'Web Botu / Crawler',
            'os' => 'Sunucu / Bot',
            'device_type' => 'bot',
            'is_bot' => 1
        ];
    }

    // Tarayıcı tespiti
    if (preg_match('/Edg/i', $ua)) {
        $browser = 'Microsoft Edge';
    } elseif (preg_match('/Chrome/i', $ua)) {
        $browser = 'Google Chrome';
    } elseif (preg_match('/Firefox/i', $ua)) {
        $browser = 'Mozilla Firefox';
    } elseif (preg_match('/Safari/i', $ua)) {
        $browser = 'Apple Safari';
    } elseif (preg_match('/Opera|OPR/i', $ua)) {
        $browser = 'Opera';
    }

    // İşletim sistemi tespiti
    if (preg_match('/Windows NT 10.0/i', $ua)) {
        $os = 'Windows 10/11';
    } elseif (preg_match('/Windows/i', $ua)) {
        $os = 'Windows';
    } elseif (preg_match('/Macintosh|Mac OS X/i', $ua)) {
        $os = 'macOS';
    } elseif (preg_match('/iPhone|iPad|iPod/i', $ua)) {
        $os = 'iOS';
    } elseif (preg_match('/Android/i', $ua)) {
        $os = 'Android';
    } elseif (preg_match('/Linux/i', $ua)) {
        $os = 'Linux';
    }

    // Cihaz türü tespiti
    if (preg_match('/iPad|tablet/i', $ua)) {
        $deviceType = 'tablet';
    } elseif (preg_match('/Mobile|iPhone|Android/i', $ua)) {
        $deviceType = 'mobile';
    }

    return [
        'browser' => $browser,
        'os' => $os,
        'device_type' => $deviceType,
        'is_bot' => 0
    ];
}

/**
 * Sayfa Ziyaretini Otomatik Olarak Kaydet
 */
function trackVisitor(string $pageTitle = ''): void {
    // Statik dosya ve API taleplerini atla
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i', $uri)) {
        return;
    }

    $ip = getClientIp();
    $sessionId = session_id();
    $pageUrl = $uri;
    $referrer = $_SERVER['HTTP_REFERER'] ?? 'Direct';
    $uaInfo = parseUserAgent($_SERVER['HTTP_USER_AGENT'] ?? '');
    $studentId = $_SESSION['student_user']['id'] ?? null;
    $visitDate = date('Y-m-d');
    $visitTime = date('H:i:s');

    // Bot filtresi: Aşırı bot yükünü önlemek için
    $isBot = $uaInfo['is_bot'];

    // Veritabanına kaydet
    $sql = "INSERT INTO visitor_logs (session_id, ip_address, page_title, page_url, referrer, browser, operating_system, device_type, student_id, is_bot, visit_date, visit_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    dbExecute($sql, 'ssssssssiiss', [
        $sessionId,
        $ip,
        $pageTitle,
        $pageUrl,
        $referrer,
        $uaInfo['browser'],
        $uaInfo['os'],
        $uaInfo['device_type'],
        $studentId,
        $isBot,
        $visitDate,
        $visitTime
    ]);
}
