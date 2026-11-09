<?php
/**
 * E-LEARN: Öğrenci Eğitim, Sınav ve İstatistik Platformu
 * Veritabanı Yapılandırma ve MySQLi Bağlantı Katmanı
 * 
 * Veritabanı Bilgileri:
 * DB_HOST: localhost
 * DB_NAME: u988165477_eventpi
 * DB_USER: u988165477_eventpi
 */

if (!defined('ELEARN_APP')) {
    define('ELEARN_APP', true);
}

// Türkiye Saat Dilimi Ayarı
date_default_timezone_set('Europe/Istanbul');

// Ortam değişkenlerinden veya varsayılan yapılandırmadan oku
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u988165477_eventpi');
define('DB_USER', getenv('DB_USER') ?: 'u988165477_eventpi');
define('DB_PASS', getenv('DB_PASS') ?: 'even+Pi.2026');
define('DB_PORT', (int)(getenv('DB_PORT') ?: 3306));
define('DB_CHARSET', 'utf8mb4');

/**
 * Tekil MySQLi Veritabanı Bağlantısı (Singleton Pattern)
 * PDO KULLANILMAZ - Şartname gereği MySQLi esas alınmıştır.
 *
 * @return mysqli|null
 */
function getDbConnection(): ?mysqli {
    static $connection = null;

    if ($connection !== null) {
        return $connection;
    }

    // Hata raporlama ayarları (Üretim ortamında gizle, log dosyasına yaz)
    mysqli_report(MYSQLI_REPORT_OFF);

    try {
        $conn = mysqli_init();
        if (!$conn) {
            error_log("[E-LEARN DB ERROR] mysqli_init failed");
            return null;
        }

        // 3 saniye bağlantı zaman aşımı
        $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 3);

        $connected = @$conn->real_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

        if (!$connected || $conn->connect_errno) {
            error_log("[E-LEARN DB CONNECTION FAILED] Errno: " . $conn->connect_errno . " - " . $conn->connect_error);
            return null;
        }

        // utf8mb4 Karakter Seti
        if (!$conn->set_charset(DB_CHARSET)) {
            error_log("[E-LEARN DB CHARSET ERROR] " . $conn->error);
        }

        // Türkiye Saat Dilimi MySQL Oturumu
        $conn->query("SET time_zone = '+03:00'");

        $connection = $conn;
        return $connection;
    } catch (\Throwable $e) {
        error_log("[E-LEARN DB EXCEPTION] " . $e->getMessage());
        return null;
    }
}

/**
 * Güvenli Prepared Statement Çalıştırıcı (SELECT için)
 *
 * @param string $sql SQL sorgusu
 * @param string $types Parametre tipleri ('s', 'i', 'd', 'b')
 * @param array $params Parametre dizisi
 * @return array Sonuç dizisi
 */
function dbSelect(string $sql, string $types = '', array $params = []): array {
    $conn = getDbConnection();
    if (!$conn) {
        return [];
    }

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("[E-LEARN PREPARE ERROR] " . $conn->error . " in SQL: " . $sql);
        return [];
    }

    if (!empty($types) && !empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
        error_log("[E-LEARN EXECUTE ERROR] " . $stmt->error);
        $stmt->close();
        return [];
    }

    $result = $stmt->get_result();
    if (!$result) {
        $stmt->close();
        return [];
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    $stmt->close();
    return $data;
}

/**
 * Tekil Satır Getirici (SELECT LIMIT 1)
 */
function dbSelectOne(string $sql, string $types = '', array $params = []): ?array {
    $rows = dbSelect($sql, $types, $params);
    return !empty($rows) ? $rows[0] : null;
}

/**
 * Güvenli Prepared Statement Çalıştırıcı (INSERT, UPDATE, DELETE için)
 *
 * @return array ['affected_rows' => int, 'insert_id' => int, 'success' => bool]
 */
function dbExecute(string $sql, string $types = '', array $params = []): array {
    $conn = getDbConnection();
    if (!$conn) {
        return ['affected_rows' => 0, 'insert_id' => 0, 'success' => false];
    }

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("[E-LEARN PREPARE ERROR] " . $conn->error . " in SQL: " . $sql);
        return ['affected_rows' => 0, 'insert_id' => 0, 'success' => false];
    }

    if (!empty($types) && !empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $success = $stmt->execute();
    $affected = $stmt->affected_rows;
    $insertId = $conn->insert_id;

    if (!$success) {
        error_log("[E-LEARN EXECUTE ERROR] " . $stmt->error);
    }

    $stmt->close();
    return [
        'affected_rows' => $affected,
        'insert_id' => $insertId,
        'success' => $success
    ];
}
