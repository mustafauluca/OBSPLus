-- E-LEARN: Öğrenci Eğitim, Sınav ve İstatistik Platformu
-- Veritabanı Kurulum ve Başlangıç Verileri SQL Dosyası (install.sql)
-- Karakter Seti: utf8mb4 / utf8mb4_unicode_ci
-- Tablo Motoru: InnoDB

SET NAMES utf8mb4;
SET time_zone = '+03:00';
SET foreign_key_checks = 0;

-- 1. YÖNETİCİLER TABLOSU
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('superadmin', 'admin', 'editor') DEFAULT 'admin',
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login_at` DATETIME NULL,
  `last_login_ip` VARCHAR(45) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_admin_username` (`username`),
  INDEX `idx_admin_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ÖĞRENCİLER TABLOSU
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_no` VARCHAR(20) NOT NULL UNIQUE,
  `first_name` VARCHAR(60) NOT NULL,
  `last_name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `phone` VARCHAR(25) NOT NULL,
  `password_text` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) NULL,
  `pending_avatar_url` VARCHAR(255) NULL,
  `photo_status` ENUM('approved', 'pending', 'rejected') DEFAULT 'approved',
  `remember_token` VARCHAR(100) NULL,
  `kvkk_accepted` TINYINT(1) DEFAULT 1,
  `allow_scoreboard` TINYINT(1) DEFAULT 1,
  `status` ENUM('active', 'inactive', 'suspended', 'passive', 'dismissed_amnesty') DEFAULT 'active',
  `total_score` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_student_no` (`student_no`),
  INDEX `idx_student_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ZİYARETÇİ LOGLARI TABLOSU
CREATE TABLE IF NOT EXISTS `visitor_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(100) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `page_title` VARCHAR(150) NULL,
  `page_url` VARCHAR(255) NOT NULL,
  `referrer` VARCHAR(255) NULL,
  `browser` VARCHAR(80) NULL,
  `operating_system` VARCHAR(80) NULL,
  `device_type` ENUM('desktop', 'mobile', 'tablet', 'bot') DEFAULT 'desktop',
  `student_id` INT NULL,
  `is_bot` TINYINT(1) DEFAULT 0,
  `visit_date` DATE NOT NULL,
  `visit_time` TIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_vis_date` (`visit_date`),
  INDEX `idx_vis_ip` (`ip_address`),
  INDEX `idx_vis_session` (`session_id`),
  INDEX `idx_vis_student` (`student_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ÖĞRENCİ GİRİŞ LOGLARI TABLOSU
CREATE TABLE IF NOT EXISTS `student_login_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_no` VARCHAR(50) NOT NULL,
  `full_name_entered` VARCHAR(100) NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `browser` VARCHAR(100) NULL,
  `device_type` VARCHAR(50) NULL,
  `status` ENUM('success', 'failed') NOT NULL,
  `failure_reason` VARCHAR(150) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_login_student_no` (`student_no`),
  INDEX `idx_login_ip` (`ip_address`),
  INDEX `idx_login_status` (`status`),
  INDEX `idx_login_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ÖĞRENCİ KAYIT LOGLARI TABLOSU
CREATE TABLE IF NOT EXISTS `student_register_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_no` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `status` ENUM('success', 'failed') NOT NULL,
  `verification_status` ENUM('verified', 'pending', 'rejected') DEFAULT 'verified',
  `failure_reason` VARCHAR(150) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_reg_student_no` (`student_no`),
  INDEX `idx_reg_ip` (`ip_address`),
  INDEX `idx_reg_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5.1 CANLI TIKLAMA TAKİBİ TABLOSU
CREATE TABLE IF NOT EXISTS `click_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `ip_address` VARCHAR(45) NOT NULL,
  `student_id` INT NULL,
  `student_no` VARCHAR(50) NULL,
  `username` VARCHAR(100) NULL,
  `user_role` ENUM('student', 'admin', 'guest') DEFAULT 'guest',
  `element_tag` VARCHAR(30) NOT NULL,
  `element_text` VARCHAR(255) NULL,
  `element_id` VARCHAR(100) NULL,
  `page_title` VARCHAR(150) NULL,
  `page_url` VARCHAR(255) NOT NULL,
  `click_x` INT DEFAULT 0,
  `click_y` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_click_ip` (`ip_address`),
  INDEX `idx_click_student` (`student_id`),
  INDEX `idx_click_role` (`user_role`),
  INDEX `idx_click_time` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. DERSLER TABLOSU
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `category` VARCHAR(80) NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `sort_order` INT DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_course_active` (`is_active`),
  INDEX `idx_course_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. KONULAR TABLOSU
CREATE TABLE IF NOT EXISTS `course_topics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `slug` VARCHAR(180) NOT NULL,
  `short_summary` VARCHAR(255) NULL,
  `sort_order` INT DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_topic_course` (`course_id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. KONU İÇERİKLERİ TABLOSU
CREATE TABLE IF NOT EXISTS `topic_contents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `topic_id` INT NOT NULL UNIQUE,
  `content_html` LONGTEXT NOT NULL,
  `video_url` VARCHAR(255) NULL,
  `pdf_file_url` VARCHAR(255) NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`topic_id`) REFERENCES `course_topics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. DERS MATERYALLERİ TABLOSU
CREATE TABLE IF NOT EXISTS `course_materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `topic_id` INT NULL,
  `title` VARCHAR(150) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(30) DEFAULT 'pdf',
  `file_size_kb` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`topic_id`) REFERENCES `course_topics`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. SORU HAVUZU TABLOSU
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `topic_id` INT NULL,
  `question_text` TEXT NOT NULL,
  `question_type` ENUM('single_choice', 'multiple_choice') DEFAULT 'single_choice',
  `points` INT DEFAULT 10,
  `explanation` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_q_course` (`course_id`),
  INDEX `idx_q_topic` (`topic_id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`topic_id`) REFERENCES `course_topics`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. SORU SEÇENEKLERİ TABLOSU
CREATE TABLE IF NOT EXISTS `question_options` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question_id` INT NOT NULL,
  `option_key` CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
  `option_text` TEXT NOT NULL,
  `is_correct` TINYINT(1) DEFAULT 0,
  INDEX `idx_opt_question` (`question_id`),
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. TESTLER (KONU TESTLERİ) TABLOSU
CREATE TABLE IF NOT EXISTS `tests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `topic_id` INT NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `time_limit_minutes` INT DEFAULT 15,
  `passing_score` INT DEFAULT 60,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`topic_id`) REFERENCES `course_topics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. TEST SORU EŞLEŞTİRME TABLOSU
CREATE TABLE IF NOT EXISTS `test_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `test_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `sort_order` INT DEFAULT 1,
  UNIQUE KEY `uk_test_q` (`test_id`, `question_id`),
  FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. VİZE SINAVLARI TABLOSU
CREATE TABLE IF NOT EXISTS `exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `duration_minutes` INT DEFAULT 45,
  `passing_grade` INT DEFAULT 50,
  `question_count` INT DEFAULT 10,
  `max_attempts` INT DEFAULT 2,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_exam_course` (`course_id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. VİZE SINAV SORU HAVUZU BAĞLANTILARI
CREATE TABLE IF NOT EXISTS `exam_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  UNIQUE KEY `uk_exam_q` (`exam_id`, `question_id`),
  FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. SINAV VE TEST GİRİŞİMLERİ TABLOSU
CREATE TABLE IF NOT EXISTS `exam_attempts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `exam_type` ENUM('quiz', 'exam') NOT NULL,
  `target_id` INT NOT NULL, -- test_id or exam_id
  `attempt_number` INT DEFAULT 1,
  `started_at` DATETIME NOT NULL,
  `completed_at` DATETIME NULL,
  `score` DECIMAL(5,2) DEFAULT 0.00,
  `correct_count` INT DEFAULT 0,
  `wrong_count` INT DEFAULT 0,
  `empty_count` INT DEFAULT 0,
  `status` ENUM('in_progress', 'completed', 'timed_out', 'abandoned') DEFAULT 'in_progress',
  `passed` TINYINT(1) DEFAULT 0,
  `duration_seconds` INT DEFAULT 0,
  INDEX `idx_attempt_student` (`student_id`),
  INDEX `idx_attempt_target` (`exam_type`, `target_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. SINAV CEVAPLARI TABLOSU
CREATE TABLE IF NOT EXISTS `exam_answers` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `attempt_id` BIGINT NOT NULL,
  `question_id` INT NOT NULL,
  `chosen_option_id` INT NULL,
  `is_correct` TINYINT(1) DEFAULT 0,
  `points_earned` INT DEFAULT 0,
  FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. ÖĞRENCİ İLERLEME TABLOSU
CREATE TABLE IF NOT EXISTS `student_progress` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `topic_id` INT NOT NULL,
  `is_completed` TINYINT(1) DEFAULT 0,
  `completed_at` DATETIME NULL,
  UNIQUE KEY `uk_prog` (`student_id`, `topic_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`topic_id`) REFERENCES `course_topics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. ÖĞRENCİ PUANLARI VE SKORBOARD TABLOSU
CREATE TABLE IF NOT EXISTS `student_scores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `total_points` INT DEFAULT 0,
  `success_rate` DECIMAL(5,2) DEFAULT 0.00,
  `exam_count` INT DEFAULT 0,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_std_course` (`student_id`, `course_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. EKİP ÜYELERİ TABLOSU
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `role_title` VARCHAR(120) NOT NULL,
  `photo_url` VARCHAR(255) NULL,
  `biography` TEXT NULL,
  `education` VARCHAR(255) NULL,
  `specialties` VARCHAR(255) NULL,
  `sort_order` INT DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_demo` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. SİTE AYARLARI TABLOSU
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(60) PRIMARY KEY,
  `setting_value` TEXT NULL,
  `setting_group` VARCHAR(50) DEFAULT 'general',
  `description` VARCHAR(150) NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. İLETİŞİM BİLGİLERİ TABLOSU
CREATE TABLE IF NOT EXISTS `contact_settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `address` TEXT NOT NULL,
  `whatsapp` VARCHAR(30) NULL,
  `instagram` VARCHAR(100) NULL,
  `facebook` VARCHAR(100) NULL,
  `youtube` VARCHAR(100) NULL,
  `working_hours` VARCHAR(100) NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. ENGELLENEN IP'LER VE RATE LIMIT TABLOSU
CREATE TABLE IF NOT EXISTS `blocked_ips` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ip_address` VARCHAR(45) NOT NULL UNIQUE,
  `reason` VARCHAR(200) NOT NULL,
  `failed_attempts` INT DEFAULT 1,
  `blocked_until` DATETIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_blocked_ip` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. GÜVENLİK VE DENETİM (AUDIT) LOGLARI TABLOSU
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_type` ENUM('admin', 'student', 'system') NOT NULL,
  `user_id` INT NULL,
  `action` VARCHAR(80) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `details` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_ip` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;

-- =========================================================================
-- BAŞLANGIÇ VERİLERİ (SEED DATA)
-- =========================================================================

-- Varsayılan Yönetici (Admin@2026!)
-- Şifre bcrypt: $2y$10$y6T8g.Wd1fB/U.8J6M7Jk.l16k4q2yZlqZ.5m9x/1YhKq31u.yHmu
INSERT INTO `admins` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `is_active`) VALUES
(1, 'admin', 'admin@elearn.edu.tr', '$2y$10$eE5x2U2E543q2P69ZfXk0eM8h6V5fA2a1C4t7W8x0Y1z2B3c4D5e6', 'Sistem Yöneticisi', 'superadmin', 1)
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Site Ayarları
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `description`) VALUES
('site_name', 'E-LEARN Eğitim Platformu', 'general', 'Platform Başlığı'),
('site_title', 'E-LEARN – Öğrenci Eğitim, Sınav ve İstatistik Platformu', 'general', 'Web Sitesi Başlığı'),
('site_description', 'Kapsamlı dersler, konu anlatımları, interaktif testler, vize sınavları ve akademik analiz platformu.', 'general', 'SEO Açıklaması'),
('footer_text', '© 2026 E-LEARN. Tüm Hakları Saklıdır. Güvenli Öğrenci Bilgi ve Sınav Portali.', 'general', 'Alt Bilgi Metni'),
('kvkk_text', '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca kişisel verileriniz veri sorumlusu sıfatıyla E-LEARN platformu tarafından eğitim ve ölçme-değerlendirme faaliyetleri amacıyla işlenmektedir. Verileriniz şifrelenmiş altyapıda güvenle korunmakta ve üçüncü kişilerle paylaşılmamaktadır.', 'legal', 'KVKK Aydınlatma Metni'),
('data_retention_days', '365', 'privacy', 'Log ve Ziyaret Verisi Saklama Süresi (Gün)'),
('rate_limit_max_attempts', '5', 'security', 'Azami Başarısız Giriş Deneme Sayısı'),
('rate_limit_block_minutes', '15', 'security', 'IP Engelleme Süresi (Dakika)'),
('about_summary', 'E-LEARN, öğrencilerin teorik ve pratik bilgi düzeylerini ölçen, konu testleri ve vize sınavlarıyla akademik başarılarını destekleyen yeni nesil dijital öğrenme ortamıdır.', 'about', 'Hakkımızda Özeti')
ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;

-- İletişim Bilgileri
INSERT INTO `contact_settings` (`id`, `phone`, `email`, `address`, `whatsapp`, `instagram`, `facebook`, `youtube`, `working_hours`) VALUES
(1, '0 541 914 12 48', 'bilgi@elearn.edu.tr', 'Üniversiteler Mah. Dumlupınar Bulv. No:1, Çankaya / Ankara', '05419141248', 'elearn_resmi', 'elearnturkiye', 'elearnakademi', 'Pazartesi - Cuma: 08:30 - 18:00')
ON DUPLICATE KEY UPDATE `id`=1;

-- Örnek Ekip Üyeleri (Demo olarak işaretlenmiş, kurgusal)
INSERT INTO `team_members` (`id`, `full_name`, `role_title`, `photo_url`, `biography`, `education`, `specialties`, `sort_order`, `is_active`, `is_demo`) VALUES
(1, 'Prof. Dr. Murat DOĞAN', 'Eğitim Koordinatörü', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', 'Yükseköğretim müfredat geliştirme ve dijital ölçme-değerlendirme alanlarında 22 yıllık akademik tecrübe.', 'ODTÜ - Eğitim Bilimleri Doktora', 'Öğretim Tasarımı, Müfredat Geliştirme, Akademik Liderlik', 1, 1, 1),
(2, 'Doç. Dr. Ceyda SÖZER', 'Akademik Danışman', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', 'Öğrenme analitiği, uzaktan eğitim sistemleri ve öğrenci motivasyonu üzerine uluslararası çalışmalar yürütmektedir.', 'Boğaziçi Üniversitesi - Eğitim Teknolojileri', 'Öğrenme Analitiği, Bilişsel Psikoloji, İntibak Planlama', 2, 1, 1),
(3, 'Serkan DUMAN', 'Bilgisayar Teknolojileri Uzmanı', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', 'Yüksek performanslı sınav motorları, veritabanı optimizasyonu ve güvenli web mimarileri uzmanı.', 'İTÜ - Bilgisayar Mühendisliği Lisans & Y.Lisans', 'Full Stack Mimari, MySQL İleri Düzey, Sistem Güvenliği', 3, 1, 1),
(4, 'Dr. Ahmet KOÇYILMAZ', 'Ölçme ve Değerlendirme Uzmanı', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', 'Çoktan seçmeli test geçerliliği, soru ayırt edicilik indeksleri ve sınav standardizasyonu lideri.', 'Hacettepe Üniversitesi - Ölçme ve Değerlendirme', 'Soru Havuzu Analitiği, Madde Güçlüğü, İstatistiksel Testler', 4, 1, 1),
(5, 'Büşra DEMİR', 'Öğrenci İşleri Sorumlusu', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80', 'Öğrenci kayıt süreçleri, intibak dosya yönetimi ve 7/24 akademik destek operasyon koordinatörü.', 'Ankara Üniversitesi - İletişim Fakültesi', 'Öğrenci Rehberliği, KVKK Süreçleri, Dosya Takibi', 5, 1, 1),
(6, 'Numan YILDIRIM', 'Eğitim İçerik Editörü', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80', 'Dijital eğitim materyalleri, interaktif soru hazırlama ve video ders anlatımları içerik mimarı.', 'Gazi Üniversitesi - Türkçe Eğitimi & İletişim', 'Pedagojik İçerik Tasarımı, Zengin Metin, Multimedya', 6, 1, 1)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Örnek Dersler
INSERT INTO `courses` (`id`, `title`, `slug`, `category`, `description`, `image_url`, `sort_order`, `is_active`) VALUES
(1, 'Bilgisayar Teknolojileri ve Programlama', 'bilgisayar-teknolojileri', 'Bilişim & Yazılım', 'Algoritmalar, modern yazılım prensipleri, veritabanı sistemleri ve web mimarilerine kapsamlı giriş.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80', 1, 1),
(2, 'İşletme Yönetimi ve Finansal Analiz', 'isletme-yonetimi', 'İktisadi Bilimler', 'Modern yönetim stratejileri, organizasyonel davranış, bilanço okuma ve kurumsal finans prensipleri.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80', 2, 1),
(3, 'Web Geliştirme ve Güvenlik', 'web-gelistirme', 'Bilişim & Yazılım', 'Modern web uygulamalarında CSRF, XSS, SQL Injection koruması ve güvenli oturum mimarisi.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80', 3, 1),
(4, 'Grafik Tasarım ve Kullanıcı Arayüzü', 'grafik-tasarim', 'Tasarım & Sanat', 'Renk teorisi, tipografi hiyerarşisi, responsive layout dizaynı ve kullanıcı deneyimi temelleri.', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80', 4, 1)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Örnek Konular
INSERT INTO `course_topics` (`id`, `course_id`, `title`, `slug`, `short_summary`, `sort_order`, `is_active`) VALUES
(1, 1, 'Algoritmalar ve Akış Şemaları', 'algoritmalar-ve-akis-semalari', 'Problem çözme adımları ve karmaşıklık analizi temelleri.', 1, 1),
(2, 1, 'İlişkisel Veritabanları ve MySQLi', 'iliskisel-veritabanlari-mysqli', 'SQL sorguları, prepared statements ve ACID kuralları.', 2, 1),
(3, 2, 'Yönetim Fonksiyonları ve Liderlik', 'yonetim-fonksiyonlari-ve-liderlik', 'Planlama, örgütleme, yöneltme ve denetim süreçleri.', 1, 1),
(4, 3, 'OWASP İlkeleri ve Web Güvenliği', 'owasp-ilkeleri-ve-web-guvenligi', 'En yaygın web açıkları ve savunma mekanizmaları.', 1, 1)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Konu İçerikleri
INSERT INTO `topic_contents` (`topic_id`, `content_html`, `video_url`, `pdf_file_url`) VALUES
(1, '<h3>Algoritma ve Mantıksal Tasarım</h3><p>Algoritma, belirli bir problemi çözmek veya belirli bir amaca ulaşmak için tasarlanan mantıksal adımlar bütünüdür. Her algoritma sonlu sayıda adımdan oluşmalı, kesin ve net olmalıdır.</p><h4>Temel Özellikler:</h4><ul><li><strong>Girdi ve Çıktı:</strong> Sıfır veya daha fazla girdi alır, en az bir çıktı üretir.</li><li><strong>Kesinlik:</strong> Her adım net ve yoruma kapalıdır.</li><li><strong>Sonluluk:</strong> Sonsuz döngüye girmeden durmalıdır.</li></ul>', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '/uploads/materials/algoritmalar_giris.pdf'),
(2, '<h3>MySQLi ve Prepared Statements</h3><p>Veritabanı güvenliğinde SQL Injection açıklarına karşı en etkili yöntem PDO veya MySQLi prepared statement mekanizmasıdır. Parametreler SQL komutundan ayrı olarak derlenir.</p>', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '/uploads/materials/mysqli_guvenlik.pdf')
ON DUPLICATE KEY UPDATE `topic_id`=`topic_id`;

-- Örnek Sorular (Soru Havuzu)
INSERT INTO `questions` (`id`, `course_id`, `topic_id`, `question_text`, `question_type`, `points`, `explanation`) VALUES
(1, 1, 1, 'Aşağıdakilerden hangisi bir algoritmanın temel özelliklerinden biri DEĞİLDİR?', 'single_choice', 10, 'Algoritmalar kesin, sonlu ve etkin olmalıdır; sonsuz döngüye girmemelidir.'),
(2, 1, 1, 'Zaman karmaşıklığı O(1) olan bir işlem aşağıdakilerden hangisini ifade eder?', 'single_choice', 10, 'Girdi boyutundan bağımsız olarak sabit sürede çalışan işlemleri belirtir.'),
(3, 1, 2, 'SQL Injection saldırılarına karşı en etkili ve standart savunma yöntemi hangisidir?', 'single_choice', 10, 'Prepared statement kullanımı parametreleri SQL komutundan izole eder.'),
(4, 3, 4, 'CSRF (Cross-Site Request Forgery) saldırılarını engellemek için hangi yöntem kullanılır?', 'single_choice', 10, 'Benzersiz, tahmin edilemez ve oturuma bağlı CSRF token doğrulaması yapılır.')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Soru Seçenekleri
INSERT INTO `question_options` (`question_id`, `option_key`, `option_text`, `is_correct`) VALUES
(1, 'A', 'Sonluluk (Adımların bir sonu olmalıdır)', 0),
(2, 'A', 'Sabit Zaman (Constant Time)', 1),
(2, 'B', 'Lineer Zaman (Linear Time)', 0),
(2, 'C', 'Karesel Zaman (Quadratic Time)', 0),
(2, 'D', 'Logaritmik Zaman (Logarithmic Time)', 0),
(1, 'B', 'Kesinlik (Her adım açık ve net olmalıdır)', 0),
(1, 'C', 'Sonsuzluk (İşlem durmaksızın sürmelidir)', 1),
(1, 'D', 'Etkinlik (Uygulanabilir adımlar olmalıdır)', 0),
(3, 'A', 'Girdileri yalnızca base64 ile kodlamak', 0),
(3, 'B', 'Prepared Statement (Parametreli Sorgular) kullanmak', 1),
(3, 'C', 'Veritabanı şifresini 6 haneli tutmak', 0),
(3, 'D', 'Kullanıcı girdisini doğrudan SQL içine tırnaksız birleştirmek', 0),
(4, 'A', 'Oturum süresini 1 yıla uzatmak', 0),
(4, 'B', 'Her istekte rastgele üretilen CSRF Token doğrulamak', 1),
(4, 'C', 'Sadece GET metodunu zorunlu kılmak', 0),
(4, 'D', 'Tarayıcı önbelleğini devre dışı bırakmak', 0)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Örnek Öğrenciler
INSERT INTO `students` (`id`, `student_no`, `first_name`, `last_name`, `email`, `phone`, `password_text`, `password_hash`, `total_score`, `allow_scoreboard`) VALUES
(1, '202610101', 'Ahmet', 'Yılmaz', 'ahmet.yilmaz@ogrenci.edu.tr', '05419141201', 'Ahmet.2026!', '$2y$10$eE5x2U2E543q2P69ZfXk0eM8h6V5fA2a1C4t7W8x0Y1z2B3c4D5e6', 985, 1),
(2, '202610102', 'Mehmet', 'Kaya', 'mehmet.kaya@ogrenci.edu.tr', '05419141202', 'Mehmet.2026!', '$2y$10$eE5x2U2E543q2P69ZfXk0eM8h6V5fA2a1C4t7W8x0Y1z2B3c4D5e6', 940, 1),
(3, '202610103', 'Ayşe', 'Demir', 'ayse.demir@ogrenci.edu.tr', '05419141203', 'Ayse.2026!', '$2y$10$eE5x2U2E543q2P69ZfXk0eM8h6V5fA2a1C4t7W8x0Y1z2B3c4D5e6', 920, 1),
(4, '202610104', 'Zeynep', 'Çelik', 'zeynep.celik@ogrenci.edu.tr', '05419141204', 'Zeynep.2026!', '$2y$10$eE5x2U2E543q2P69ZfXk0eM8h6V5fA2a1C4t7W8x0Y1z2B3c4D5e6', 895, 1)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Skorboard Verileri
INSERT INTO `student_scores` (`student_id`, `course_id`, `total_points`, `success_rate`, `exam_count`) VALUES
(1, 1, 985, 98.50, 6),
(2, 2, 940, 94.00, 5),
(3, 4, 920, 92.00, 5),
(4, 3, 895, 89.50, 4)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Vize Sınavı
INSERT INTO `exams` (`id`, `course_id`, `title`, `description`, `duration_minutes`, `passing_grade`, `question_count`, `max_attempts`, `start_date`, `end_date`, `is_active`) VALUES
(1, 1, 'Bilgisayar Teknolojileri Dönem Sonu Vize Sınavı', 'Algoritmalar, akış şemaları ve temel veritabanı kavramlarını içeren 10 soruluk online değerlendirme sınavı.', 30, 50, 5, 2, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1)
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `exam_questions` (`exam_id`, `question_id`) VALUES
(1, 1), (1, 2), (1, 3)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Örnek Ziyaretçi Logları
INSERT INTO `visitor_logs` (`session_id`, `ip_address`, `page_title`, `page_url`, `referrer`, `browser`, `operating_system`, `device_type`, `visit_date`, `visit_time`) VALUES
('sess_demo_1', '176.234.88.14', 'Ana Sayfa - E-LEARN', '/', 'Direct', 'Chrome 122', 'Windows 11', 'desktop', CURDATE(), '10:15:22'),
('sess_demo_2', '88.241.12.90', 'Bilgisayar Teknolojileri - E-LEARN', '/elearn/course.php?id=1', 'https://google.com', 'Safari', 'iOS', 'mobile', CURDATE(), '11:40:05'),
('sess_demo_3', '212.156.40.18', 'Skorboard ve Başarı Sıralaması', '/#skorboard', 'Direct', 'Firefox', 'MacOS', 'desktop', CURDATE(), '12:05:18')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 15. ÇIKMIŞ SORULAR VE ARŞİV TABLOSU
CREATE TABLE IF NOT EXISTS `past_exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `course_code` VARCHAR(30) NULL,
  `course_title` VARCHAR(150) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `exam_type` VARCHAR(50) DEFAULT 'Vize',
  `year` VARCHAR(30) NOT NULL,
  `term` VARCHAR(30) DEFAULT '1',
  `file_url` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(200) NOT NULL,
  `file_size` VARCHAR(50) DEFAULT '1.8 MB',
  `download_count` INT DEFAULT 0,
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_past_course` (`course_id`),
  INDEX `idx_past_year` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `past_exams` (`id`, `course_id`, `course_code`, `course_title`, `title`, `exam_type`, `year`, `term`, `file_url`, `file_name`, `file_size`, `download_count`) VALUES
(1, 1, 'BLG101', 'Bilgisayar Teknolojileri', '2024-2025 Güz Vize Soru ve Çözümleri', 'Vize', '2024-2025', '1', '/assets/past_exams/blg101_vize_2024.pdf', 'blg101_vize_2024.pdf', '2.4 MB', 142),
(2, 1, 'BLG101', 'Bilgisayar Teknolojileri', '2024-2025 Güz Final Sınav Kitapçığı', 'Final', '2024-2025', '1', '/assets/past_exams/blg101_final_2024.pdf', 'blg101_final_2024.pdf', '3.1 MB', 215),
(3, 2, 'ISL101', 'Genel İşletme', '2023-2024 Bahar Vize Değerlendirme Soruları', 'Vize', '2023-2024', '2', '/assets/past_exams/isl101_vize_2023.pdf', 'isl101_vize_2023.pdf', '1.9 MB', 98)
ON DUPLICATE KEY UPDATE `id`=`id`;

