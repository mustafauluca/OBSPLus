<?php
/**
 * E-LEARN: Öğrenci Eğitim, Sınav ve İstatistik Platformu
 * Genel Yapılandırma ve Sistem Ayarları
 */

require_once __DIR__ . '/database.php';

// Güvenli Oturum (Session) Yapılandırması
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', 1);
    }
    session_start();
}

/**
 * Dinamik Ayar Getirici (Cache'li)
 */
function getSiteSetting(string $key, string $default = ''): string {
    static $settingsCache = null;

    if ($settingsCache === null) {
        $settingsCache = [];
        $rows = dbSelect("SELECT setting_key, setting_value FROM site_settings");
        foreach ($rows as $row) {
            $settingsCache[$row['setting_key']] = $row['setting_value'];
        }
    }

    return $settingsCache[$key] ?? $default;
}

/**
 * İletişim Bilgilerini Getirici
 */
function getContactSettings(): array {
    static $contact = null;
    if ($contact === null) {
        $data = dbSelectOne("SELECT * FROM contact_settings WHERE id = 1");
        if ($data) {
            $contact = $data;
        } else {
            // Varsayılan İletişim Bilgileri
            $contact = [
                'phone' => '0 541 914 12 48',
                'email' => 'bilgi@elearn.edu.tr',
                'address' => 'Üniversiteler Mah. Dumlupınar Bulv. No:1, Çankaya / Ankara',
                'whatsapp' => '05419141248',
                'instagram' => 'elearn_resmi',
                'facebook' => 'elearnturkiye',
                'youtube' => 'elearnakademi',
                'working_hours' => 'Pazartesi - Cuma: 08:30 - 18:00'
            ];
        }
    }
    return $contact;
}
