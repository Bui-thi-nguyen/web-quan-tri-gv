import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  School,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskItem, TaskStatus } from '../types';
import { Modal } from '../components/Modal';

export const TasksView: React.FC = () => {
  const { tasks, classes, lessons, addTask, updateTask, deleteTask } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Detail view modal
  const [viewingTask, setViewingTask] = useState<TaskItem | null>(null);

  // Delete modal
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    classId: string;
    lessonId: string;
    description: string;
    assignedDate: string;
    dueDate: string;
    status: TaskStatus;
    notes: string;
  }>({
    title: '',
    classId: classes[0]?.id || '',
    lessonId: lessons[0]?.id || '',
    description: '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'Đang thực hiện',
    notes: '',
  });

  // Filtered Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.lessonTitle && t.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = selectedClassFilter === 'all' || t.classId === selectedClassFilter;
    const matchesStatus = selectedStatusFilter === 'all' || t.status === selectedStatusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      classId: classes[0]?.id || '',
      lessonId: lessons[0]?.id || '',
      description: '',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Đang thực hiện',
      notes: '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      classId: task.classId,
      lessonId: task.lessonId || '',
      description: task.description || '',
      assignedDate: task.assignedDate,
      dueDate: task.dueDate,
      status: task.status,
      notes: task.notes || '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const targetClass = classes.find((c) => c.id === formData.classId);
    const targetLesson = lessons.find((l) => l.id === formData.lessonId);

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formData.title.trim(),
        classId: formData.classId,
        className: targetClass?.name || editingTask.className,
        lessonId: formData.lessonId,
        lessonTitle: targetLesson?.title || '',
        description: formData.description.trim(),
        assignedDate: formData.assignedDate,
        dueDate: formData.dueDate,
        status: formData.status,
        notes: formData.notes.trim(),
      });
    } else {
      addTask({
        title: formData.title.trim(),
        classId: formData.classId,
        className: targetClass?.name || 'Chưa chọn lớp',
        lessonId: formData.lessonId,
        lessonTitle: targetLesson?.title || '',
        description: formData.description.trim(),
        assignedDate: formData.assignedDate,
        dueDate: formData.dueDate,
        status: formData.status,
        notes: formData.notes.trim(),
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      if (viewingTask?.id === taskToDelete.id) setViewingTask(null);
      setTaskToDelete(null);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Đã hoàn thành':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Đang thực hiện':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Quá hạn':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Chưa giao':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="tasks-management-view" className="space-y-6 animate-fade-in">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-teal-600" />
            <span>Quản Lý Nhiệm Vụ Học Tập</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Giao bài tập, dự án thực hành và theo dõi hạn nộp của học sinh
          </p>
        </div>

        <button
          id="btn-add-task"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition min-h-[44px] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm nhiệm vụ mới</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-task"
            type="text"
            placeholder="Tìm theo tên nhiệm vụ, lớp, bài học liên quan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Lớp:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[40px]"
            >
              <option value="all">Tất cả lớp ({tasks.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Lớp {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[40px]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chưa giao">Chưa giao</option>
              <option value="Đang thực hiện">Đang thực hiện</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
              <option value="Quá hạn">Quá hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-700">Chưa có nhiệm vụ học tập nào</p>
          <p className="text-xs text-slate-400 mt-1">Không tìm thấy nhiệm vụ phù hợp với tìm kiếm.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              id={`task-card-${task.id}`}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-sm transition p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                        <School className="w-3 h-3 text-teal-600" />
                        Lớp {task.className}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(task)}
                      aria-label="Sửa nhiệm vụ"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                      title="Chỉnh sửa nhiệm vụ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskToDelete(task)}
                      aria-label="Xóa nhiệm vụ"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                      title="Xóa nhiệm vụ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {task.lessonTitle && (
                  <div className="mt-2 text-xs font-medium text-teal-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{task.lessonTitle}</span>
                  </div>
                )}

                {task.description && (
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {/* Date info & Completion rate */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Giao: {task.assignedDate}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-700">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Hạn: {task.dueDate}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewingTask(task)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem chi tiết nhiệm vụ</span>
                </button>

                {/* Quick Status toggle */}
                <select
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                  className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium cursor-pointer"
                >
                  <option value="Chưa giao">Chưa giao</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                  <option value="Quá hạn">Quá hạn</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingTask ? 'Chỉnh sửa nhiệm vụ học tập' : 'Giao nhiệm vụ học tập mới'}
        subtitle="Thiết lập bài tập hoặc dự án KHTN cho học sinh"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên nhiệm vụ học tập *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Phiếu học tập số 2: Phân biệt tế bào..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lớp được giao *
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
                Bài học / Chủ đề liên quan
              </label>
              <select
                value={formData.lessonId}
                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                <option value="">-- Không gắn bài học cụ thể --</option>
                {lessons.map((les) => (
                  <option key={les.id} value={les.id}>
                    {les.title} (Khối {les.grade})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ngày giao
              </label>
              <input
                type="date"
                value={formData.assignedDate}
                onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hạn hoàn thành *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                <option value="Chưa giao">Chưa giao</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
                <option value="Quá hạn">Quá hạn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mô tả nhiệm vụ / Yêu cầu chi tiết
            </label>
            <textarea
              rows={3}
              placeholder="Yêu cầu cụ thể, số lượng câu hỏi, hình thức nộp (phiếu in, nộp vở, thuyết trình...)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi chú của giáo viên
            </label>
            <input
              type="text"
              placeholder="Ghi chú thời gian thu bài, nhắc nhở học sinh..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
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
              {editingTask ? 'Lưu nhiệm vụ' : 'Giao nhiệm vụ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Task Detail Modal */}
      {viewingTask && (
        <Modal
          isOpen={!!viewingTask}
          onClose={() => setViewingTask(null)}
          title={viewingTask.title}
          subtitle={`Lớp ${viewingTask.className} • Hạn nộp: ${viewingTask.dueDate}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
                Lớp {viewingTask.className}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-semibold border ${getStatusBadge(
                  viewingTask.status
                )}`}
              >
                Trạng thái: {viewingTask.status}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                Ngày giao: {viewingTask.assignedDate}
              </span>
            </div>

            {viewingTask.lessonTitle && (
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900">
                <strong>Bài học liên quan:</strong> {viewingTask.lessonTitle}
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Yêu cầu & Mô tả nhiệm vụ:
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {viewingTask.description || 'Chưa nhập mô tả chi tiết.'}
              </p>
            </div>

            {viewingTask.notes && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Ghi chú:</strong> {viewingTask.notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = viewingTask;
                  setViewingTask(null);
                  handleOpenEdit(target);
                }}
                className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold min-h-[38px] cursor-pointer"
              >
                Chỉnh sửa nhiệm vụ này
              </button>
              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold min-h-[38px] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Xác nhận xóa nhiệm vụ"
        subtitle="Hành động này sẽ xóa nhiệm vụ khỏi hệ thống"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Cô có chắc chắn muốn xóa nhiệm vụ này?</p>
              <p className="mt-1 font-medium">{taskToDelete?.title}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTaskToDelete(null)}
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
