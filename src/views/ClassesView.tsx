import React, { useState } from 'react';
import {
  School,
  Plus,
  Search,
  Filter,
  Users,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
  BookOpen,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassRoom, GradeLevel } from '../types';
import { Modal } from '../components/Modal';

export const ClassesView: React.FC = () => {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    students,
    setActiveTab,
    exportStudentsCSV,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    grade: GradeLevel;
    studentCount: number;
    roomNumber: string;
    notes: string;
  }>({
    name: '',
    grade: '6',
    studentCount: 35,
    roomNumber: '',
    notes: '',
  });

  // Delete confirm modal
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);

  // Detail view modal
  const [viewingClass, setViewingClass] = useState<ClassRoom | null>(null);

  // Filtered classes
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.notes && cls.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cls.roomNumber && cls.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGrade = selectedGrade === 'all' || cls.grade === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      grade: '6',
      studentCount: 35,
      roomNumber: '',
      notes: '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      studentCount: cls.studentCount,
      roomNumber: cls.roomNumber || '',
      notes: cls.notes || '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClass) {
      updateClass(editingClass.id, {
        name: formData.name.trim(),
        grade: formData.grade,
        studentCount: Number(formData.studentCount) || 0,
        roomNumber: formData.roomNumber.trim(),
        notes: formData.notes.trim(),
      });
    } else {
      addClass({
        name: formData.name.trim(),
        grade: formData.grade,
        studentCount: Number(formData.studentCount) || 0,
        roomNumber: formData.roomNumber.trim(),
        notes: formData.notes.trim(),
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (classToDelete) {
      deleteClass(classToDelete.id);
      if (viewingClass?.id === classToDelete.id) {
        setViewingClass(null);
      }
      setClassToDelete(null);
    }
  };

  return (
    <div id="classes-management-view" className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <School className="w-6 h-6 text-teal-600" />
            <span>Quản Lý Lớp Học KHTN</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng cộng <strong className="text-slate-700">{classes.length} lớp</strong> đang phân công giảng dạy
          </p>
        </div>

        <button
          id="btn-add-class"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition min-h-[44px] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm lớp học mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-class"
            type="text"
            placeholder="Tìm kiếm theo tên lớp (6A1, 7A2...), phòng học hoặc ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <span className="text-xs font-semibold text-slate-500 hidden sm:block shrink-0">Khối:</span>
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {['all', '6', '7', '8', '9'].map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[38px] ${
                  selectedGrade === grade
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {grade === 'all' ? 'Tất cả khối' : `Khối ${grade}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <School className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-700">Chưa có lớp học phù hợp</p>
          <p className="text-xs text-slate-400 mt-1">
            Không tìm thấy lớp nào theo từ khóa hoặc bộ lọc đã chọn.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedGrade('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition cursor-pointer"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => {
            const classStudents = students.filter((s) => s.classId === cls.id);
            const actualCount = classStudents.length > 0 ? classStudents.length : cls.studentCount;

            return (
              <div
                key={cls.id}
                id={`class-card-${cls.id}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-sm transition p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 font-extrabold text-xl flex items-center justify-center shrink-0">
                        {cls.name}
                      </div>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          Khối {cls.grade}
                        </span>
                        <div className="text-xs text-slate-400 mt-1">
                          {cls.roomNumber || 'Chưa xếp phòng'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cls)}
                        aria-label={`Sửa lớp ${cls.name}`}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setClassToDelete(cls)}
                        aria-label={`Xóa lớp ${cls.name}`}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        title="Xóa lớp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                      <span className="flex items-center gap-1.5 font-medium text-slate-600">
                        <Users className="w-4 h-4 text-teal-600" />
                        Sĩ số học sinh:
                      </span>
                      <strong className="text-slate-900 font-bold text-sm">{actualCount} em</strong>
                    </div>

                    {cls.notes ? (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                        "{cls.notes}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Chưa có ghi chú đặc biệt cho lớp này.</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingClass(cls)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition min-h-[40px] cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem chi tiết lớp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingClass ? `Chỉnh sửa lớp ${editingClass.name}` : 'Thêm lớp học KHTN mới'}
        subtitle="Điền thông tin lớp học phụ trách của cô Bùi Thị Nguyên"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên lớp học *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: 6A1, 7A2, 8A1..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Khối lớp *
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as GradeLevel })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                <option value="6">Khối 6</option>
                <option value="7">Khối 7</option>
                <option value="8">Khối 8</option>
                <option value="9">Khối 9</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sĩ số học sinh dự kiến
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.studentCount}
                onChange={(e) => setFormData({ ...formData, studentCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phòng học / Địa điểm
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Phòng 201 - Dãy A / Phòng thực hành KHTN"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi chú của giáo viên
            </label>
            <textarea
              rows={3}
              placeholder="Đặc điểm học sinh, ghi chú về tiết thực hành hoặc nề nếp lớp..."
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
              {editingClass ? 'Lưu thay đổi' : 'Thêm lớp học'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!classToDelete}
        onClose={() => setClassToDelete(null)}
        title="Xác nhận xóa lớp học"
        subtitle="Hành động này không thể hoàn tác nếu tiếp tục"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Cô có chắc chắn muốn xóa lớp {classToDelete?.name}?</p>
              <p className="mt-1">
                Các học sinh thuộc lớp này có thể sẽ bị ảnh hưởng hoặc cần phân lại lớp.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setClassToDelete(null)}
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

      {/* View Class Detail Modal */}
      {viewingClass && (
        <Modal
          isOpen={!!viewingClass}
          onClose={() => setViewingClass(null)}
          title={`Chi tiết lớp học: ${viewingClass.name}`}
          subtitle={`Khối ${viewingClass.grade} • Trường THCS Phan Bội Châu`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Quick stats in modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Tên lớp</span>
                <div className="text-base font-bold text-slate-800">{viewingClass.name}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Khối</span>
                <div className="text-base font-bold text-slate-800">Khối {viewingClass.grade}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Phòng học</span>
                <div className="text-sm font-semibold text-slate-800">{viewingClass.roomNumber || 'Chưa đặt'}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Số học sinh đã lưu</span>
                <div className="text-base font-bold text-teal-700">
                  {students.filter((s) => s.classId === viewingClass.id).length} học sinh
                </div>
              </div>
            </div>

            {viewingClass.notes && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Ghi chú giáo viên:</strong> {viewingClass.notes}
              </div>
            )}

            {/* List of students in this class */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Danh sách học sinh lớp {viewingClass.name}</span>
                </h4>

                <button
                  type="button"
                  onClick={() => exportStudentsCSV(viewingClass.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition min-h-[36px] cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Xuất Excel / CSV</span>
                </button>
              </div>

              {students.filter((s) => s.classId === viewingClass.id).length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  Chưa có hồ sơ học sinh nào thuộc lớp này.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Mã HS</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3">Giới tính</th>
                        <th className="py-2.5 px-3">Đánh giá gần nhất</th>
                        <th className="py-2.5 px-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {students
                        .filter((s) => s.classId === viewingClass.id)
                        .map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-500">{s.studentCode}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{s.fullName}</td>
                            <td className="py-2.5 px-3">{s.gender}</td>
                            <td className="py-2.5 px-3 font-semibold text-teal-700">{s.latestScore}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick actions for this class */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewingClass(null);
                  setActiveTab('students');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                <span>Chuyển sang Quản lý học sinh đầy đủ</span>
                →
              </button>

              <button
                type="button"
                onClick={() => setViewingClass(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold min-h-[38px] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
