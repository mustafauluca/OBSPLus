import React, { useState } from 'react';
import { ElearnProvider, useElearn } from './context/ElearnContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { ElearnCatalogView } from './views/ElearnCatalogView';
import { CourseDetailView } from './views/CourseDetailView';
import { TopicView } from './views/TopicView';
import { QuizView } from './views/QuizView';
import { ExamView } from './views/ExamView';
import { ResultView } from './views/ResultView';
import { PastExamsView } from './views/PastExamsView';
import { CalculatorsView } from './views/CalculatorsView';
import { StudentProfileView } from './views/StudentProfileView';
import { AdminLoginView } from './views/AdminLoginView';
import { PhpDistributionView } from './views/PhpDistributionView';
import { OgrenciOBS } from './modules/ogrenci/OgrenciOBS';

// Admin Tabs & Layout
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboardTab } from './views/admin/AdminDashboardTab';
import { AdminClicksTab } from './views/admin/AdminClicksTab';
import { AdminVisitorsTab } from './views/admin/AdminVisitorsTab';
import { AdminLoginLogsTab } from './views/admin/AdminLoginLogsTab';
import { AdminRegisterLogsTab } from './views/admin/AdminRegisterLogsTab';
import { AdminStudentsTab } from './views/admin/AdminStudentsTab';
import { AdminPastExamsTab } from './views/admin/AdminPastExamsTab';
import { AdminCoursesTab } from './views/admin/AdminCoursesTab';
import { AdminTopicsTab } from './views/admin/AdminTopicsTab';
import { AdminQuestionsTab } from './views/admin/AdminQuestionsTab';
import { AdminExamsTab } from './views/admin/AdminExamsTab';
import { AdminResultsTab } from './views/admin/AdminResultsTab';
import { AdminScoreboardTab } from './views/admin/AdminScoreboardTab';
import { AdminTeamTab } from './views/admin/AdminTeamTab';
import { AdminSettingsTab } from './views/admin/AdminSettingsTab';
import { AdminContactTab } from './views/admin/AdminContactTab';

// Modals
import { StudentCardModal } from './components/StudentCardModal';
import { DiplomaModal } from './components/DiplomaModal';
import { AuthModals } from './components/AuthModals';
import { VisitorIpModal } from './components/VisitorIpModal';

// Initial Reference Data
import { INITIAL_UNIVERSITIES, INITIAL_DEPARTMENTS } from './data/departmentsAndUniversities';
import { StudentProfile } from './types';

function AppContent() {
  const { currentStudent, students, updateStudentProfile, visitorIp } = useElearn();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<Record<string, any>>({});

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isKvkkModalOpen, setIsKvkkModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [isDiplomaModalOpen, setIsDiplomaModalOpen] = useState(false);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);

  // Admin Tab State
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  const handleNavigate = (view: string, params: Record<string, any> = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine active profile for OBS / Cards
  const activeStudent: StudentProfile = (currentStudent || students[0]) as StudentProfile;

  const activeUniversity =
    INITIAL_UNIVERSITIES.find((u) => u.id === activeStudent.universityId) ||
    INITIAL_UNIVERSITIES[0];

  const activeDepartment =
    INITIAL_DEPARTMENTS.find((d: any) => d.id === activeStudent.departmentId) ||
    INITIAL_DEPARTMENTS[0];

  const handleUpdateProfile = (updated: StudentProfile) => {
    updateStudentProfile(updated.id, updated);
  };

  // Handle Admin Dashboard Layout
  if (currentView === 'admin_dashboard') {
    return (
      <AdminLayout
        currentTab={adminTab}
        setCurrentTab={setAdminTab}
        setCurrentView={handleNavigate}
      >
        {adminTab === 'dashboard' && <AdminDashboardTab />}
        {adminTab === 'clicks' && <AdminClicksTab />}
        {adminTab === 'visitors' && <AdminVisitorsTab onSelectIp={(ip) => setSelectedIp(ip)} />}
        {adminTab === 'login_logs' && <AdminLoginLogsTab onSelectIp={(ip) => setSelectedIp(ip)} />}
        {adminTab === 'register_logs' && <AdminRegisterLogsTab />}
        {adminTab === 'students' && <AdminStudentsTab />}
        {adminTab === 'past_exams' && <AdminPastExamsTab />}
        {adminTab === 'courses' && <AdminCoursesTab />}
        {adminTab === 'topics' && <AdminTopicsTab />}
        {adminTab === 'questions' && <AdminQuestionsTab />}
        {adminTab === 'exams' && <AdminExamsTab />}
        {adminTab === 'results' && <AdminResultsTab />}
        {adminTab === 'scoreboard' && <AdminScoreboardTab />}
        {adminTab === 'team' && <AdminTeamTab />}
        {adminTab === 'settings' && <AdminSettingsTab />}
        {adminTab === 'contact' && <AdminContactTab />}

        {/* Global IP Modal if clicked */}
        <VisitorIpModal ipAddress={selectedIp} onClose={() => setSelectedIp(null)} />
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={handleNavigate}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onOpenIdCard={() => setIsIdCardModalOpen(true)}
        onOpenDiploma={() => setIsDiplomaModalOpen(true)}
        onOpenVisitorIp={() => setSelectedIp(visitorIp)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            setCurrentView={handleNavigate}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentView === 'obs' && (
          <OgrenciOBS
            profile={activeStudent}
            university={activeUniversity}
            department={activeDepartment}
            onUpdateProfile={handleUpdateProfile}
            onOpenIdCard={() => setIsIdCardModalOpen(true)}
            onOpenDiploma={() => setIsDiplomaModalOpen(true)}
            onReturnToHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'elearn_catalog' && (
          <ElearnCatalogView setCurrentView={handleNavigate} />
        )}

        {currentView === 'course_detail' && (
          <CourseDetailView
            courseId={viewParams.courseId || 1}
            setCurrentView={handleNavigate}
          />
        )}

        {currentView === 'topic' && (
          <TopicView
            topicId={viewParams.topicId || 1}
            setCurrentView={handleNavigate}
          />
        )}

        {currentView === 'quiz' && (
          <QuizView
            topicId={viewParams.topicId || 1}
            setCurrentView={handleNavigate}
          />
        )}

        {currentView === 'exam' && (
          <ExamView
            examId={viewParams.examId || 1}
            setCurrentView={handleNavigate}
          />
        )}

        {currentView === 'result' && (
          <ResultView
            attemptId={viewParams.attemptId || 1}
            setCurrentView={handleNavigate}
          />
        )}

        {currentView === 'past_exams' && (
          <PastExamsView setCurrentView={handleNavigate} />
        )}

        {currentView === 'calculators' && (
          <CalculatorsView setCurrentView={handleNavigate} />
        )}

        {currentView === 'student_profile' && (
          <StudentProfileView
            setCurrentView={handleNavigate}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentView === 'admin_login' && (
          <AdminLoginView setCurrentView={handleNavigate} />
        )}

        {currentView === 'php_distribution' && (
          <PhpDistributionView />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        setCurrentView={handleNavigate}
        onOpenKvkk={() => setIsKvkkModalOpen(true)}
      />

      {/* Auth Modals */}
      <AuthModals
        loginOpen={isLoginModalOpen}
        registerOpen={isRegisterModalOpen}
        kvkkOpen={isKvkkModalOpen}
        onCloseLogin={() => setIsLoginModalOpen(false)}
        onCloseRegister={() => setIsRegisterModalOpen(false)}
        onCloseKvkk={() => setIsKvkkModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onOpenKvkkFromRegister={() => {
          setIsKvkkModalOpen(true);
        }}
      />

      {/* Student ID Card Modal */}
      <StudentCardModal
        isOpen={isIdCardModalOpen}
        onClose={() => setIsIdCardModalOpen(false)}
        profile={activeStudent}
        university={activeUniversity}
        department={activeDepartment}
      />

      {/* Official Diploma Modal */}
      <DiplomaModal
        isOpen={isDiplomaModalOpen}
        onClose={() => setIsDiplomaModalOpen(false)}
        profile={activeStudent}
        university={activeUniversity}
        department={activeDepartment}
      />

      {/* Visitor IP Audit Trail Modal */}
      <VisitorIpModal
        ipAddress={selectedIp}
        onClose={() => setSelectedIp(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ElearnProvider>
      <AppContent />
    </ElearnProvider>
  );
}
