import React from 'react';
import {
  Menu,
  GraduationCap,
  Monitor,
  School,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { teacherProfile, presentationMode, setPresentationMode } = useApp();

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all"
    >
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & App Name */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-mobile-sidebar"
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Mở danh mục menu"
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-600 text-white flex items-center justify-center shadow-md shadow-teal-700/10 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  TRỢ LÝ QUẢN TRỊ HỌC TẬP KHTN
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-500" /> THCS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                <span>Cô <strong className="text-slate-700 font-semibold">{teacherProfile.name}</strong></span>
                <span className="text-slate-300">•</span>
                <span className="text-teal-700 font-medium">{teacherProfile.subject}</span>
                <span className="text-slate-300 hidden md:inline">•</span>
                <span className="hidden md:inline-flex items-center text-slate-500">
                  <School className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {teacherProfile.school}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Presentation mode toggle & school badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-toggle-presentation-mode"
            type="button"
            onClick={() => setPresentationMode((prev) => !prev)}
            title="Bật/Tắt chế độ trình chiếu (chữ lớn cho màn hình máy chiếu hoặc bảng tương tác)"
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] cursor-pointer border ${
              presentationMode
                ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">
              {presentationMode ? 'Đang trình chiếu (Chữ lớn)' : 'Chế độ trình chiếu'}
            </span>
          </button>

          <div className="hidden xl:flex items-center px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
            {teacherProfile.academicYear}
          </div>
        </div>
      </div>
    </header>
  );
};
