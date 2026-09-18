import React from 'react';
import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  ClipboardList,
  GraduationCap,
  BarChart3,
  BookmarkCheck,
  Settings,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, classes, students, lessons, tasks, notes } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'classes', label: 'Lớp học', icon: School, badge: classes.length },
    { id: 'students', label: 'Học sinh', icon: Users, badge: students.length },
    { id: 'lessons', label: 'Bài học', icon: BookOpen, badge: lessons.length },
    { id: 'tasks', label: 'Nhiệm vụ', icon: ClipboardList, badge: tasks.length },
    { id: 'results', label: 'Kết quả học tập', icon: GraduationCap },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'notes', label: 'Ghi chú', icon: BookmarkCheck, badge: notes.length },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-backdrop"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-navigation-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-10 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header Inside Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Danh Mục Chức Năng</span>
          </div>
          <button
            id="btn-close-mobile-sidebar"
            type="button"
            onClick={onCloseMobile}
            aria-label="Đóng menu"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section title */}
        <div className="hidden lg:block px-5 pt-5 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Hệ Thống Quản Lý KHTN
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all min-h-[48px] cursor-pointer text-left ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      isActive
                        ? 'bg-teal-200/70 text-teal-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer teacher badge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="rounded-xl p-3 bg-white border border-slate-200/70 shadow-xs">
            <div className="text-xs font-bold text-slate-800">Trường THCS Phan Bội Châu</div>
            <div className="text-[11px] text-teal-700 font-medium mt-0.5">
              Tổ Khoa học Tự nhiên
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Phiên bản quản trị 2025.1</div>
          </div>
        </div>
      </aside>
    </>
  );
};
