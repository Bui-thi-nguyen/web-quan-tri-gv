import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';

import { DashboardView } from './views/DashboardView';
import { ClassesView } from './views/ClassesView';
import { StudentsView } from './views/StudentsView';
import { LessonsView } from './views/LessonsView';
import { TasksView } from './views/TasksView';
import { ResultsView } from './views/ResultsView';
import { ReportsView } from './views/ReportsView';
import { NotesView } from './views/NotesView';
import { SettingsView } from './views/SettingsView';
import { School, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, presentationMode, teacherProfile } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'classes':
        return <ClassesView />;
      case 'students':
        return <StudentsView />;
      case 'lessons':
        return <LessonsView />;
      case 'tasks':
        return <TasksView />;
      case 'results':
        return <ResultsView />;
      case 'reports':
        return <ReportsView />;
      case 'notes':
        return <NotesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div
      id="app-root-container"
      className={`min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased ${
        presentationMode ? 'presentation-mode' : ''
      }`}
    >
      <Toast />

      {/* Header */}
      <Header onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />

      {/* Main Body */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 gap-6">
        {/* Navigation Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic View Content */}
        <main
          id="main-app-content"
          tabIndex={-1}
          className="flex-1 min-w-0 pb-12 focus:outline-none"
        >
          {renderActiveView()}
        </main>
      </div>

      {/* App Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-5 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-[10px]">
              KHTN
            </div>
            <span className="font-semibold text-slate-700">
              TRỢ LÝ QUẢN TRỊ HỌC TẬP KHTN – BÙI THỊ NGUYÊN
            </span>
            <span className="hidden md:inline">• {teacherProfile.school}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Ứng dụng chạy trực tiếp trên trình duyệt máy tính & máy tính bảng</span>
            <span className="hidden sm:inline">• Lưu trữ bảo mật nội bộ</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
