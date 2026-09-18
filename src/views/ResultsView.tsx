import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  Plus,
  FileSpreadsheet,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudentResultRecord, StudentStatus } from '../types';
import { Modal } from '../components/Modal';

export const ResultsView: React.FC = () => {
  const {
    results,
    classes,
    students,
    tasks,
    addResult,
    updateResult,
    deleteResult,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Edit / Add Modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentResultRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    studentId: string;
    classId: string;
    taskId: string;
    scoreOrRating: string;
    isCompleted: boolean;
    teacherComment: string;
    status: StudentStatus;
  }>({
    studentId: students[0]?.id || '',
    classId: classes[0]?.id || '',
    taskId: tasks[0]?.id || '',
    scoreOrRating: '8.5',
    isCompleted: true,
    teacherComment: '',
    status: 'Tốt',
  });

  const [recordToDelete, setRecordToDelete] = useState<StudentResultRecord | null>(null);

  // Filtered Results
  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.teacherComment && r.teacherComment.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = selectedClassFilter === 'all' || r.classId === selectedClassFilter;
    const matchesTask = selectedTaskFilter === 'all' || r.taskId === selectedTaskFilter;
    const matchesStatus = selectedStatusFilter === 'all' || r.status === selectedStatusFilter;

    return matchesSearch && matchesClass && matchesTask && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    const firstStudent = students[0];
    const firstTask = tasks[0];

    setFormData({
      studentId: firstStudent ? firstStudent.id : '',
      classId: firstStudent ? firstStudent.classId : (classes[0]?.id || ''),
      taskId: firstTask ? firstTask.id : '',
      scoreOrRating: '8.5',
      isCompleted: true,
      teacherComment: 'Hoàn thành tốt nhiệm vụ được giao.',
      status: 'Tốt',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (rec: StudentResultRecord) => {
    setEditingRecord(rec);
    setFormData({
      studentId: rec.studentId,
      classId: rec.classId,
      taskId: rec.taskId,
      scoreOrRating: rec.scoreOrRating,
      isCompleted: rec.isCompleted,
      teacherComment: rec.teacherComment,
      status: rec.status,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === formData.studentId);
    const cls = classes.find((c) => c.id === formData.classId);
    const tsk = tasks.find((t) => t.id === formData.taskId);

    if (!st || !cls || !tsk) return;

    if (editingRecord) {
      updateResult(editingRecord.id, {
        studentId: st.id,
        studentName: st.fullName,
        studentCode: st.studentCode,
        classId: cls.id,
        className: cls.name,
        taskId: tsk.id,
        taskTitle: tsk.title,
        scoreOrRating: formData.scoreOrRating.trim() || 'Đạt',
        isCompleted: formData.isCompleted,
        teacherComment: formData.teacherComment.trim(),
        status: formData.status,
      });
    } else {
      addResult({
        studentId: st.id,
        studentName: st.fullName,
        studentCode: st.studentCode,
        classId: cls.id,
        className: cls.name,
        taskId: tsk.id,
        taskTitle: tsk.title,
        scoreOrRating: formData.scoreOrRating.trim() || 'Đạt',
        isCompleted: formData.isCompleted,
        teacherComment: formData.teacherComment.trim(),
        status: formData.status,
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      deleteResult(recordToDelete.id);
      setRecordToDelete(null);
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
    <div id="results-management-view" className="space-y-6 animate-fade-in">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-teal-600" />
            <span>Theo Dõi Kết Quả Học Tập KHTN</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng hợp kết quả làm bài, mức đánh giá và nhận xét mang tính động viên tích cực
          </p>
        </div>

        <button
          id="btn-add-result"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition min-h-[44px] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Nhập kết quả đánh giá mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-result"
            type="text"
            placeholder="Tìm theo tên học sinh, mã HS, nhiệm vụ hoặc nội dung nhận xét..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Lớp:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 min-h-[36px]"
            >
              <option value="all">Tất cả lớp ({results.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Lớp {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Nhiệm vụ:</span>
            <select
              value={selectedTaskFilter}
              onChange={(e) => setSelectedTaskFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 min-h-[36px] max-w-xs truncate"
            >
              <option value="all">Tất cả nhiệm vụ</option>
              {tasks.map((tsk) => (
                <option key={tsk.id} value={tsk.id}>
                  {tsk.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 min-h-[36px]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Tốt">Tốt</option>
              <option value="Khá">Khá</option>
              <option value="Đang tiến bộ">Đang tiến bộ</option>
              <option value="Cần cố gắng">Cần cố gắng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-700">Chưa có kết quả học tập phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Không tìm thấy bản ghi nào theo bộ lọc đã chọn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Học sinh</th>
                  <th className="py-3.5 px-4">Lớp</th>
                  <th className="py-3.5 px-4">Nhiệm vụ học tập</th>
                  <th className="py-3.5 px-4 text-center">Hoàn thành</th>
                  <th className="py-3.5 px-4">Điểm / Mức đánh giá</th>
                  <th className="py-3.5 px-4">Trạng thái học tập</th>
                  <th className="py-3.5 px-4">Nhận xét của cô Bùi Thị Nguyên</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredResults.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{rec.studentName}</div>
                      <div className="text-xs font-mono text-slate-400">{rec.studentCode}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {rec.className}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{rec.taskTitle}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {rec.isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Đã nộp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Chưa nộp
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg text-xs border border-teal-200/70 inline-flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-teal-600" />
                        {rec.scoreOrRating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          rec.status
                        )}`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs leading-relaxed">
                      {rec.teacherComment || <span className="italic text-slate-400">Chưa có nhận xét</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rec)}
                          aria-label="Sửa kết quả"
                          title="Sửa đánh giá"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRecordToDelete(rec)}
                          aria-label="Xóa kết quả"
                          title="Xóa đánh giá"
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

      {/* Add / Edit Result Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingRecord ? 'Cập nhật đánh giá học tập' : 'Nhập kết quả học tập mới'}
        subtitle="Hệ thống quản lý điểm số & nhận xét KHTN"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Học sinh *
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => {
                  const s = students.find((item) => item.id === e.target.value);
                  setFormData({
                    ...formData,
                    studentId: e.target.value,
                    classId: s ? s.classId : formData.classId,
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.className} - {st.studentCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nhiệm vụ học tập *
              </label>
              <select
                value={formData.taskId}
                onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                {tasks.map((tsk) => (
                  <option key={tsk.id} value={tsk.id}>
                    {tsk.title} (Lớp {tsk.className})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Điểm số / Mức đánh giá *
              </label>
              <input
                type="text"
                required
                placeholder="VD: 8.5 hoặc Đạt / Hoàn thành"
                value={formData.scoreOrRating}
                onChange={(e) => setFormData({ ...formData, scoreOrRating: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tình trạng nộp bài
              </label>
              <select
                value={formData.isCompleted ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isCompleted: e.target.value === 'true' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                <option value="true">Đã nộp bài đầy đủ</option>
                <option value="false">Chưa hoàn thành / Cần nộp lại</option>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nhận xét của giáo viên
            </label>
            <textarea
              rows={3}
              placeholder="Nhận xét cụ thể về bài làm, chỉ ra điểm mạnh và điểm cần cải thiện..."
              value={formData.teacherComment}
              onChange={(e) => setFormData({ ...formData, teacherComment: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition min-h-[44px] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition min-h-[44px] cursor-pointer"
            >
              {editingRecord ? 'Lưu thay đổi' : 'Lưu kết quả'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        title="Xác nhận xóa bản ghi kết quả"
        subtitle="Hành động này sẽ xóa dữ liệu đánh giá này"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Cô có chắc chắn muốn xóa bản ghi đánh giá của học sinh{' '}
            <strong className="text-slate-900">{recordToDelete?.studentName}</strong>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRecordToDelete(null)}
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
