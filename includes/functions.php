<?php
/**
 * E-LEARN: Öğrenci Eğitim, Sınav ve İstatistik Platformu
 * Yardımcı Fonksiyonlar ve İş Mantığı Katmanı
 */

require_once __DIR__ . '/security.php';

/**
 * KVKK Uyumlu Öğrenci İsmi Maskeleme
 * Örnek: "Ahmet Yılmaz" -> "Ahmet Y."
 */
function maskStudentName(string $firstName, string $lastName): string {
    $first = mb_convert_case(trim($firstName), MB_CASE_TITLE, 'UTF-8');
    $lastClean = trim($lastName);
    $lastInitial = mb_substr($lastClean, 0, 1, 'UTF-8');
    return $first . ' ' . mb_strtoupper($lastInitial, 'UTF-8') . '.';
}

/**
 * Türkçe Tarih ve Saat Biçimlendirici
 */
function formatDateTime(?string $datetime, bool $showTime = true): string {
    if (empty($datetime)) {
        return '-';
    }
    $timestamp = strtotime($datetime);
    if (!$timestamp) {
        return $datetime;
    }

    $aylar = [
        1 => 'Ocak', 2 => 'Şubat', 3 => 'Mart', 4 => 'Nisan',
        5 => 'Mayıs', 6 => 'Haziran', 7 => 'Temmuz', 8 => 'Ağustos',
        9 => 'Eylül', 10 => 'Ekim', 11 => 'Kasım', 12 => 'Aralık'
    ];

    $gun = date('j', $timestamp);
    $ayNo = (int)date('n', $timestamp);
    $yil = date('Y', $timestamp);
    $ay = $aylar[$ayNo] ?? '';

    $formatted = "$gun $ay $yil";
    if ($showTime) {
        $formatted .= ', ' . date('H:i', $timestamp);
    }
    return $formatted;
}

/**
 * Skorboard: Her Dersin En Başarılı Öğrencisini Getirir (KVKK Maskelemeli)
 */
function getTopScoreboard(): array {
    $sql = "SELECT c.id as course_id, c.title as course_title, c.category,
                   s.first_name, s.last_name, s.allow_scoreboard,
                   sc.total_points, sc.success_rate, sc.exam_count
            FROM courses c
            JOIN student_scores sc ON sc.course_id = c.id
            JOIN students s ON s.id = sc.student_id
            WHERE c.is_active = 1 AND s.status = 'active' AND s.allow_scoreboard = 1
            AND sc.total_points = (
                SELECT MAX(sc2.total_points) 
                FROM student_scores sc2 
                JOIN students s2 ON s2.id = sc2.student_id
                WHERE sc2.course_id = c.id AND s2.allow_scoreboard = 1
            )
            GROUP BY c.id
            ORDER BY sc.total_points DESC";

    $rows = dbSelect($sql);
    $results = [];

    foreach ($rows as $row) {
        $results[] = [
            'course_id' => $row['course_id'],
            'course_title' => $row['course_title'],
            'category' => $row['category'],
            'masked_name' => maskStudentName($row['first_name'], $row['last_name']),
            'total_points' => (int)$row['total_points'],
            'success_rate' => (float)$row['success_rate'],
            'exam_count' => (int)$row['exam_count']
        ];
    }

    return $results;
}

/**
 * Ziyaretçi İstatistiklerini Toplu Getir
 */
function getDashboardVisitorStats(): array {
    $today = date('Y-m-d');

    // 1. Bugünkü Ziyaretçi
    $todayTotal = dbSelectOne("SELECT COUNT(*) as count FROM visitor_logs WHERE visit_date = ?", "s", [$today])['count'] ?? 0;
    
    // 2. Günlük Tekil Ziyaretçi (IP veya Session bazlı)
    $todayUnique = dbSelectOne("SELECT COUNT(DISTINCT ip_address) as count FROM visitor_logs WHERE visit_date = ?", "s", [$today])['count'] ?? 0;

    // 3. Toplam Ziyaret
    $allTimeTotal = dbSelectOne("SELECT COUNT(*) as count FROM visitor_logs")['count'] ?? 0;

    // 4. Öğrenci ve Anonim Dağılımı
    $studentVisits = dbSelectOne("SELECT COUNT(*) as count FROM visitor_logs WHERE student_id IS NOT NULL")['count'] ?? 0;
    $anonVisits = $allTimeTotal - $studentVisits;

    // 5. Cihaz Dağılımı
    $deviceRows = dbSelect("SELECT device_type, COUNT(*) as count FROM visitor_logs GROUP BY device_type");
    $deviceDist = ['desktop' => 0, 'mobile' => 0, 'tablet' => 0];
    foreach ($deviceRows as $dr) {
        if (isset($deviceDist[$dr['device_type']])) {
            $deviceDist[$dr['device_type']] = (int)$dr['count'];
        }
    }

    // 6. Tarayıcı Dağılımı
    $browserRows = dbSelect("SELECT browser, COUNT(*) as count FROM visitor_logs GROUP BY browser ORDER BY count DESC LIMIT 5");

    // 7. En Çok Ziyaret Edilen Sayfalar
    $topPages = dbSelect("SELECT page_url, page_title, COUNT(*) as view_count FROM visitor_logs GROUP BY page_url ORDER BY view_count DESC LIMIT 5");

    // 8. Son 7 Günlük Ziyaret Trendi
    $last7Days = dbSelect("SELECT visit_date, COUNT(*) as total, COUNT(DISTINCT ip_address) as unique_ips 
                           FROM visitor_logs 
                           WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                           GROUP BY visit_date 
                           ORDER BY visit_date ASC");

    return [
        'today_total' => (int)$todayTotal,
        'today_unique' => (int)$todayUnique,
        'all_time_total' => (int)$allTimeTotal,
        'student_visits' => (int)$studentVisits,
        'anon_visits' => (int)$anonVisits,
        'device_dist' => $deviceDist,
        'browser_rows' => $browserRows,
        'top_pages' => $topPages,
        'last7_days' => $last7Days
    ];
}

/**
 * CSV Dışa Aktarma Yardımcısı
 */
function outputCsv(string $filename, array $headers, array $rows): void {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=' . $filename);
    
    // Excel UTF-8 BOM
    echo "\xEF\xBB\xBF";
    
    $output = fopen('php://output', 'w');
    fputcsv($output, $headers, ';');
    foreach ($rows as $row) {
        fputcsv($output, $row, ';');
    }
    fclose($output);
    exit;
}
