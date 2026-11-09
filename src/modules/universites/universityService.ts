import { CourseDefinition, Department, University } from '../../types';
import { INITIAL_UNIVERSITIES, DEPARTMENTS } from '../../data/departmentsAndUniversities';

const UNIVERSITIES_STORAGE_KEY = 'diplomatr_universities';

export function getStoredUniversities(): University[] {
  try {
    const raw = localStorage.getItem(UNIVERSITIES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_UNIVERSITIES;
}

export function saveUniversities(unis: University[]): void {
  try {
    localStorage.setItem(UNIVERSITIES_STORAGE_KEY, JSON.stringify(unis));
  } catch (err) {
    console.error('Failed to save universities:', err);
  }
}

export function addUniversity(newUni: University): University[] {
  const current = getStoredUniversities();
  const updated = [...current, newUni];
  saveUniversities(updated);
  return updated;
}

export function deleteUniversity(id: string): University[] {
  const current = getStoredUniversities();
  const updated = current.filter(u => u.id !== id);
  saveUniversities(updated);
  return updated;
}

export function getAllDepartments(): Department[] {
  return DEPARTMENTS;
}

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find(d => d.id === id);
}

export function getUniversityById(id: string, unis: University[] = getStoredUniversities()): University | undefined {
  return unis.find(u => u.id === id);
}
