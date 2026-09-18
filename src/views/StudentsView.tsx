import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  Award,
  CheckCircle,
  Upload,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, StudentStatus } from '../types';
import { Modal } from '../components/Modal';
import { ExcelStudentImporter } from '../components/ExcelStudentImporter';

export const StudentsView: React.FC = () => {
  const {
    students,
    classes,
    addStudent,
    updateStudent,
    deleteStudent,
    exportStudentsCSV,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [addMode, setAddMode] = useState<'manual' | 'excel'>('manual');

  // Quick Score & Feedback Modal
  const [quickScoreStudent, setQuickScoreStudent] = useState<Student | null>(null);
  const [quickScore, setQuickScore] = useState('');
  const [quickFeedback, setQuickFeedback] = useState('');
  const [quickStatus, setQuickStatus] = useState<StudentStatus>('Tốt');

  // Form State
  const [formData, setFormData] = useState<{
    fullName: string;
    studentCode: string;
    classId: string;
    gender: 'Nam' | 'Nữ';
    latestScore: string;
    latestFeedback: string;
    status: StudentStatus;
    notes: string;
  }>({
    fullName: '',
    studentCode: '',
    classId: classes[0]?.id || '',
    gender: 'Nữ',
    latestScore: '8.0',
    latestFeedback: '',
    status: 'Tốt',
    notes: '',
  });

  // Delete Confirm Modal
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.latestFeedback && s.latestFeedback.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = selectedClassFilter === 'all' || s.classId === selectedClassFilter;
    const matchesStatus = selectedStatusFilter === 'all' || s.status === selectedStatusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setAddMode('manual');
    const defaultClass = classes[0];
    const generatedCode = `KHTN-${Math.floor(1000 + Math.random() * 9000)}`;

    setFormData({
      fullName: '',
      studentCode: generatedCode,
      classId: (selectedClassFilter !== 'all' ? selectedClassFilter : defaultClass?.id) || '',
      gender: 'Nữ',
      latestScore: '8.0',
      latestFeedback: '',
      status: 'Tốt',
      notes: '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenExcelImport = () => {
    setEditingStudent(null);
    setAddMode('excel');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setFormData({
      fullName: st.fullName,
      studentCode: st.studentCode,
      classId: st.classId,
      gender: st.gender,
      latestScore: st.latestScore,
      latestFeedback: st.latestFeedback || '',
      status: st.status,
      notes: st.notes || '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const targetClass = classes.find((c) => c.id === formData.classId);
    const className = targetClass ? targetClass.name : 'Chưa phân lớp';

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        fullName: formData.fullName.trim(),
        studentCode: formData.studentCode.trim(),
        classId: formData.classId,
        className,
        gender: formData.gender,
        latestScore: formData.latestScore.trim(),
        latestFeedback: formData.latestFeedback.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
      });
    } else {
      addStudent({
        fullName: formData.fullName.trim(),
        studentCode: formData.studentCode.trim(),
        classId: formData.classId,
        className,
        gender: formData.gender,
        latestScore: formData.latestScore.trim() || 'Chưa đánh giá',
        latestFeedback: formData.latestFeedback.trim() || 'Học sinh mới thêm.',
        status: formData.status,
        notes: formData.notes.trim(),
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleOpenQuickScore = (st: Student) => {
    setQuickScoreStudent(st);
    setQuickScore(st.latestScore);
    setQuickFeedback(st.latestFeedback || '');
    setQuickStatus(st.status);
  };

  const handleSaveQuickScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickScoreStudent) {
      updateStudent(quickScoreStudent.id, {
        latestScore: quickScore.trim() || 'Đạt',
        latestFeedback: quickFeedback.trim(),
        status: quickStatus,
      });
      setQuickScoreStudent(null);
    }
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'Tốt':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Khá':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Đang tiến bộ':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Cần cố gắng':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="students-management-view" className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>Quản Lý Học Sinh KHTN</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng số: <strong className="text-slate-800 font-bold">{students.length} học sinh</strong> trong danh sách theo dõi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportStudentsCSV(selectedClassFilter !== 'all' ? selectedClassFilter : undefined)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition min-h-[44px] cursor-pointer"
            title="Xuất danh sách học sinh ra file CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            id="btn-open-excel-import"
            type="button"
            onClick={handleOpenExcelImport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-teal-300 bg-teal-50/70 hover:bg-teal-100 text-teal-800 font-semibold text-xs sm:text-sm transition min-h-[44px] cursor-pointer"
            title="Nhập danh sách học sinh từ file Excel hoặc CSV"
          >
            <Upload className="w-4 h-4 text-teal-600" />
            <span>Nhập từ Excel</span>
          </button>

          <button
            id="btn-add-student"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-student"
            type="text"
            placeholder="Tìm theo họ tên, mã học sinh (KHTN-60101...), hoặc nhận xét..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Lớp:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[40px]"
            >
              <option value="all">Tất cả lớp ({students.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Lớp {cls.name} ({students.filter((s) => s.classId === cls.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[40px]"
            >
              <option value="all">Tất cả</option>
              <option value="Tốt">Tốt</option>
              <option value="Khá">Khá</option>
              <option value="Đang tiến bộ">Đang tiến bộ</option>
              <option value="Cần cố gắng">Cần cố gắng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-700">Chưa có học sinh nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Không tìm thấy học sinh theo từ khóa tìm kiếm hoặc bộ lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedClassFilter('all');
                setSelectedStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">STT</th>
                  <th className="py-3.5 px-4">Mã HS</th>
                  <th className="py-3.5 px-4">Họ và tên</th>
                  <th className="py-3.5 px-4">Lớp</th>
                  <th className="py-3.5 px-4">Giới tính</th>
                  <th className="py-3.5 px-4">Điểm gần nhất</th>
                  <th className="py-3.5 px-4">Trạng thái học tập</th>
                  <th className="py-3.5 px-4">Nhận xét của giáo viên</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((st, index) => (
                  <tr
                    key={st.id}
                    id={`student-row-${st.id}`}
                    className="hover:bg-teal-50/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-xs text-slate-500">
                      {st.studentCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {st.fullName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {st.className}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{st.gender}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenQuickScore(st)}
                        title="Bấm để cập nhật nhanh điểm hoặc nhận xét"
                        className="inline-flex items-center gap-1 font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer border border-teal-200/60"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{st.latestScore || 'Chưa chấm'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          st.status
                        )}`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate" title={st.latestFeedback}>
                      {st.latestFeedback || <span className="italic text-slate-400">Chưa có nhận xét</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenQuickScore(st)}
                          aria-label={`Đánh giá nhanh cho ${st.fullName}`}
                          title="Đánh giá nhanh"
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(st)}
                          aria-label={`Sửa học sinh ${st.fullName}`}
                          title="Sửa thông tin"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(st)}
                          aria-label={`Xóa học sinh ${st.fullName}`}
                          title="Xóa học sinh"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={
          editingStudent
            ? `Chỉnh sửa: ${editingStudent.fullName}`
            : addMode === 'excel'
            ? 'Nhập danh sách học sinh từ file Excel / CSV'
            : 'Thêm học sinh KHTN mới'
        }
        subtitle={
          editingStudent
            ? `Mã HS: ${editingStudent.studentCode} • Lớp ${editingStudent.className}`
            : addMode === 'excel'
            ? 'Tải lên bảng tính để nhập nhanh học sinh vào lớp học'
            : 'Hồ sơ quản lý học tập môn Khoa học tự nhiên'
        }
        maxWidth={addMode === 'excel' && !editingStudent ? '2xl' : 'lg'}
      >
        {/* Tab switch for new student creation */}
        {!editingStudent && (
          <div className="flex border-b border-slate-200 mb-5">
            <button
              type="button"
              id="tab-mode-manual"
              onClick={() => setAddMode('manual')}
              className={`flex items-center gap-2 py-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 transition cursor-pointer ${
                addMode === 'manual'
                  ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm 1 học sinh</span>
            </button>

            <button
              type="button"
              id="tab-mode-excel"
              onClick={() => setAddMode('excel')}
              className={`flex items-center gap-2 py-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 transition cursor-pointer ${
                addMode === 'excel'
                  ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Nhập từ file Excel / CSV</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                Cả lớp
              </span>
            </button>
          </div>
        )}

        {!editingStudent && addMode === 'excel' ? (
          <ExcelStudentImporter
            defaultClassId={selectedClassFilter !== 'all' ? selectedClassFilter : formData.classId}
            onSuccess={(_count, classId) => {
              setIsAddEditModalOpen(false);
              if (classId) {
                setSelectedClassFilter(classId);
              }
            }}
            onCancel={() => setIsAddEditModalOpen(false)}
          />
        ) : (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            {!editingStudent && (
              <div className="p-3 bg-teal-50/80 border border-teal-200/90 rounded-xl text-xs text-teal-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cô muốn thêm cả danh sách lớp nhanh chóng?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAddMode('excel')}
                  className="font-bold text-teal-700 hover:text-teal-900 underline whitespace-nowrap cursor-pointer"
                >
                  Nhập file Excel ngay ➔
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và tên học sinh *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Văn An"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã học sinh / Mã nội bộ
              </label>
              <input
                type="text"
                placeholder="Ví dụ: KHTN-60105"
                value={formData.studentCode}
                onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lớp học *
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Lớp {cls.name} (Khối {cls.grade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Nam' | 'Nữ' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                <option value="Nữ">Nữ</option>
                <option value="Nam">Nam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trạng thái học tập
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                <option value="Tốt">Tốt</option>
                <option value="Khá">Khá</option>
                <option value="Đang tiến bộ">Đang tiến bộ</option>
                <option value="Cần cố gắng">Cần cố gắng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Điểm / Đánh giá gần nhất
              </label>
              <input
                type="text"
                placeholder="VD: 8.5 hoặc Đạt"
                value={formData.latestScore}
                onChange={(e) => setFormData({ ...formData, latestScore: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nhận xét gần nhất của giáo viên
              </label>
              <input
                type="text"
                placeholder="VD: Quan sát mẫu vật tốt, làm bài đúng hạn..."
                value={formData.latestFeedback}
                onChange={(e) => setFormData({ ...formData, latestFeedback: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi chú riêng về học sinh
            </label>
            <textarea
              rows={2}
              placeholder="Sở thích, lưu ý về năng lực thực hành, liên lạc phụ huynh..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition min-h-[44px] cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition min-h-[44px] cursor-pointer"
            >
              {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
            </button>
          </div>
        </form>
      )}
      </Modal>

      {/* Quick Score Modal */}
      {quickScoreStudent && (
        <Modal
          isOpen={!!quickScoreStudent}
          onClose={() => setQuickScoreStudent(null)}
          title={`Đánh giá nhanh: ${quickScoreStudent.fullName}`}
          subtitle={`Lớp ${quickScoreStudent.className} • Mã HS: ${quickScoreStudent.studentCode}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveQuickScore} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Điểm số hoặc Mức đánh giá *
              </label>
              <input
                type="text"
                required
                placeholder="VD: 8.5, 9.0, Đạt, Hoàn thành tốt..."
                value={quickScore}
                onChange={(e) => setQuickScore(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trạng thái học tập
              </label>
              <select
                value={quickStatus}
                onChange={(e) => setQuickStatus(e.target.value as StudentStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                <option value="Tốt">Tốt</option>
                <option value="Khá">Khá</option>
                <option value="Đang tiến bộ">Đang tiến bộ</option>
                <option value="Cần cố gắng">Cần cố gắng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lời nhận xét / Động viên của cô Bùi Thị Nguyên
              </label>
              <textarea
                rows={3}
                placeholder="Nhận xét mang tính xây dựng, động viên nỗ lực học tập..."
                value={quickFeedback}
                onChange={(e) => setQuickFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickScoreStudent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 min-h-[44px] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm min-h-[44px] cursor-pointer"
              >
                Lưu đánh giá
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        title="Xác nhận xóa học sinh"
        subtitle="Hành động này sẽ xóa học sinh khỏi danh sách lớp"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Cô có chắc chắn muốn xóa học sinh {studentToDelete?.fullName}?</p>
              <p className="mt-1">
                Lớp {studentToDelete?.className} (Mã: {studentToDelete?.studentCode}).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStudentToDelete(null)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 min-h-[44px] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm min-h-[44px] cursor-pointer"
            >
              Đồng ý xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
