import React, { useState, useRef } from 'react';
import {
  Settings,
  User,
  School,
  BookOpen,
  RotateCcw,
  Download,
  Upload,
  Monitor,
  AlertTriangle,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';

export const SettingsView: React.FC = () => {
  const {
    teacherProfile,
    updateTeacherProfile,
    presentationMode,
    setPresentationMode,
    resetToSampleData,
    exportJSON,
    importJSON,
  } = useApp();

  const [name, setName] = useState(teacherProfile.name);
  const [subject, setSubject] = useState(teacherProfile.subject);
  const [school, setSchool] = useState(teacherProfile.school);
  const [academicYear, setAcademicYear] = useState(teacherProfile.academicYear);
  const [email, setEmail] = useState(teacherProfile.email || '');
  const [phone, setPhone] = useState(teacherProfile.phone || '');

  // Reset confirmation modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacherProfile({
      name: name.trim(),
      subject: subject.trim(),
      school: school.trim(),
      academicYear: academicYear.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div id="settings-management-view" className="space-y-6 animate-fade-in max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-600" />
            <span>Cài Đặt Hệ Thống & Thông Tin Giáo Viên</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tùy chỉnh thông tin công tác, hiển thị và quản lý dữ liệu lưu trữ
          </p>
        </div>
      </div>

      {/* Teacher Profile Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Thông tin giáo viên phụ trách</h3>
            <p className="text-xs text-slate-500">Thông tin xuất hiện trên trang chủ và đầu các báo cáo</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và tên giáo viên *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Môn giảng dạy *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Đơn vị trường công tác *
              </label>
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Năm học hiện tại
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email liên hệ
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyen.buithi@thcsphanboichau.edu.vn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số điện thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="098x xxx xxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition min-h-[44px] cursor-pointer"
            >
              Lưu thông tin giáo viên
            </button>
          </div>
        </form>
      </div>

      {/* Display & Presentation Mode */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Tùy chọn hiển thị & Trình chiếu</h3>
            <p className="text-xs text-slate-500">Tối ưu cho máy tính cá nhân hoặc máy chiếu lớp học</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/60">
          <div className="space-y-0.5 max-w-lg">
            <div className="text-sm font-bold text-slate-800">
              Chế độ trình chiếu màn hình lớn (Phông chữ lớn)
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tự động tăng kích thước văn bản và độ tương phản bảng biểu để học sinh ngồi xa trong phòng học hoặc hội trường dễ dàng theo dõi trên máy chiếu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPresentationMode((prev) => !prev)}
            aria-label="Bật tắt chế độ trình chiếu"
            className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer shrink-0 ${
              presentationMode ? 'bg-teal-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                presentationMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Sao lưu & Khôi phục dữ liệu</h3>
            <p className="text-xs text-slate-500">
              Dữ liệu được lưu trữ trực tiếp trên trình duyệt máy tính của cô. Cô có thể tải file về lưu trữ an toàn hoặc chuyển sang máy khác.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-teal-600" />
                <span>Sao lưu toàn bộ dữ liệu</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tải tệp JSON chứa tất cả lớp học, học sinh, bài học, nhiệm vụ và điểm số về máy.
              </p>
            </div>

            <button
              type="button"
              onClick={exportJSON}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition min-h-[44px] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải file sao lưu (.json)</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Khôi phục từ tệp tin</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Nhập file sao lưu JSON trước đó để phục hồi lại dữ liệu giảng dạy.
              </p>
            </div>

            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition min-h-[44px] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Chọn file sao lưu để nạp</span>
            </button>
          </div>
        </div>

        {/* Reset to sample data button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-800">Đặt lại dữ liệu mẫu</div>
            <p className="text-xs text-slate-500">Khôi phục lại danh sách lớp, bài học KHTN và học sinh mẫu ban đầu</p>
          </div>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition min-h-[40px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại dữ liệu mẫu</span>
          </button>
        </div>
      </div>

      {/* Guide section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          <span>Hướng dẫn thao tác nhanh cho giáo viên THCS</span>
        </div>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5 leading-relaxed">
          <li>
            <strong>Quản lý lớp học:</strong> Bấm vào thẻ lớp học để xem danh sách học sinh thuộc lớp đó và xuất bảng danh sách riêng của lớp.
          </li>
          <li>
            <strong>Đánh giá nhanh:</strong> Tại mục Quản lý học sinh, cô có thể bấm trực tiếp vào cột điểm để mở hộp thoại nhập điểm và nhận xét ngay mà không cần chuyển trang.
          </li>
          <li>
            <strong>Trình chiếu bài học:</strong> Khi kết nối máy chiếu trên lớp, hãy bấm nút "Chế độ trình chiếu" ở góc trên cùng bên phải để chữ hiển thị to rõ hơn cho cả lớp cùng xem.
          </li>
          <li>
            <strong>Bảo toàn dữ liệu:</strong> Web app tự động lưu trên trình duyệt (localStorage), không cần máy chủ, không cần đăng nhập và không phụ thuộc vào internet.
          </li>
        </ul>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Xác nhận đặt lại dữ liệu mẫu"
        subtitle="Hệ thống sẽ tải lại dữ liệu mẫu ban đầu của cô Bùi Thị Nguyên"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Cô có muốn nạp lại dữ liệu mẫu ban đầu?</p>
              <p className="mt-1">
                Các chỉnh sửa chưa sao lưu ra file JSON có thể bị ghi đè bởi bộ dữ liệu mẫu mặc định.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 min-h-[44px] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                resetToSampleData();
                setName(teacherProfile.name);
                setSubject(teacherProfile.subject);
                setSchool(teacherProfile.school);
                setIsResetModalOpen(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm min-h-[44px] cursor-pointer"
            >
              Đồng ý đặt lại
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
