import { AuditAction, AuditLog } from '../../types';

// In-memory and localStorage backed audit logging engine
const AUDIT_STORAGE_KEY = 'diplomatr_audit_logs';
const CLIENT_IP_STORAGE_KEY = 'diplomatr_client_ip';

// Get simulated or stored client IP
export function getStoredClientIp(): string {
  try {
    const existing = localStorage.getItem(CLIENT_IP_STORAGE_KEY);
    if (existing) return existing;
    
    // Generate realistic Turkish ISP public IP (e.g. Türk Telekom / Superonline subnet)
    const octet2 = Math.floor(Math.random() * 50) + 180;
    const octet3 = Math.floor(Math.random() * 200) + 20;
    const octet4 = Math.floor(Math.random() * 240) + 10;
    const generatedIp = `176.${octet2}.${octet3}.${octet4}`;
    localStorage.setItem(CLIENT_IP_STORAGE_KEY, generatedIp);
    return generatedIp;
  } catch {
    return '176.234.88.14';
  }
}

// Fetch real public IP asynchronously if available
export async function fetchLiveClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        localStorage.setItem(CLIENT_IP_STORAGE_KEY, data.ip);
        return data.ip;
      }
    }
  } catch {
    // Fall back to generated realistic IP
  }
  return getStoredClientIp();
}

// Initial realistic audit logs
const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-11-08 10:14:22',
    userId: 'usr-admin-1',
    userName: 'Prof. Dr. Murat DOĞAN',
    userRole: 'admin',
    action: 'login',
    ipAddress: '176.240.112.44',
    details: 'Yönetici oturumu açıldı. YÖK İntibak mevzuatı güncellemesi kontrol edildi.',
  },
  {
    id: 'log-102',
    timestamp: '2026-11-08 10:30:05',
    userId: 'usr-adv-2',
    userName: 'Ceyda SÖZER (Akademik Danışman)',
    userRole: 'advisor',
    action: 'advisor_review',
    ipAddress: '88.255.94.12',
    details: 'Adalet & YBS intibak ders müfredatı danışman onayından geçti.',
  },
  {
    id: 'log-103',
    timestamp: '2026-11-08 11:02:18',
    userId: 'usr-std-88',
    userName: 'Ahmet Yılmaz',
    userRole: 'student',
    action: 'register',
    ipAddress: '176.234.88.14',
    details: 'Yeni öğrenci kaydı oluşturuldu: Bilgisayar Programcılığı (Af İntibak Başvurusu).',
  },
  {
    id: 'log-104',
    timestamp: '2026-11-08 11:05:41',
    userId: 'usr-std-88',
    userName: 'Ahmet Yılmaz',
    userRole: 'student',
    action: 'login',
    ipAddress: '176.234.88.14',
    details: 'Öğrenci Bilgi Sistemi (OBS) girişi yapıldı.',
  },
];

export function getAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_LOGS;
}

export function logAuditEvent(
  action: AuditAction,
  user: { id?: string; name: string; role: 'student' | 'admin' | 'advisor' | 'system' },
  details: string,
  ipOverride?: string
): AuditLog {
  const currentLogs = getAuditLogs();
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  
  const ip = ipOverride || getStoredClientIp();

  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    userId: user.id || `usr-${Math.floor(Math.random() * 90000) + 10000}`,
    userName: user.name,
    userRole: user.role,
    action,
    ipAddress: ip,
    details,
  };

  const updated = [newLog, ...currentLogs];
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated.slice(0, 300))); // keep latest 300
  } catch (err) {
    console.error('Failed to save audit log:', err);
  }

  return newLog;
}

export function clearAuditLogs(): void {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }
}
