import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lesson, LessonStatus, GradeLevel } from '../types';
import { Modal } from '../components/Modal';

const KHTN_TOPICS = [
  'Tất cả chủ đề',
  'Chất và sự biến đổi của chất',
  'Vật sống',
  'Năng lượng và sự biến đổi',
  'Trái Đất và bầu trời',
  'Vật sống & Di truyền',
];

export const LessonsView: React.FC = () => {
  const { lessons, addLesson, updateLesson, deleteLesson } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('Tất cả chủ đề');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // View detail modal
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);

  // Delete modal
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    grade: GradeLevel;
    topic: string;
    durationPeriods: number;
    learningObjectives: string;
    summaryContent: string;
    teacherNotes: string;
    status: LessonStatus;
  }>({
    title: '',
    grade: '6',
    topic: 'Vật sống',
    durationPeriods: 2,
    learningObjectives: '',
    summaryContent: '',
    teacherNotes: '',
    status: 'Chưa dạy',
  });

  // Filtered lessons
  const filteredLessons = lessons.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.summaryContent && l.summaryContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.learningObjectives && l.learningObjectives.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGrade = selectedGrade === 'all' || l.grade === selectedGrade;
    const matchesTopic = selectedTopic === 'Tất cả chủ đề' || l.topic === selectedTopic;
    const matchesStatus = selectedStatus === 'all' || l.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesTopic && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      grade: '6',
      topic: 'Vật sống',
      durationPeriods: 2,
      learningObjectives: '',
      summaryContent: '',
      teacherNotes: '',
      status: 'Chưa dạy',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (les: Lesson) => {
    setEditingLesson(les);
    setFormData({
      title: les.title,
      grade: les.grade,
      topic: les.topic,
      durationPeriods: les.durationPeriods || 2,
      learningObjectives: les.learningObjectives || '',
      summaryContent: les.summaryContent || '',
      teacherNotes: les.teacherNotes || '',
      status: les.status,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingLesson) {
      updateLesson(editingLesson.id, {
        title: formData.title.trim(),
        grade: formData.grade,
        topic: formData.topic.trim(),
        durationPeriods: Number(formData.durationPeriods) || 2,
        learningObjectives: formData.learningObjectives.trim(),
        summaryContent: formData.summaryContent.trim(),
        teacherNotes: formData.teacherNotes.trim(),
        status: formData.status,
      });
    } else {
      addLesson({
        title: formData.title.trim(),
        grade: formData.grade,
        topic: formData.topic.trim(),
        durationPeriods: Number(formData.durationPeriods) || 2,
        learningObjectives: formData.learningObjectives.trim(),
        summaryContent: formData.summaryContent.trim(),
        teacherNotes: formData.teacherNotes.trim(),
        status: formData.status,
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (lessonToDelete) {
      deleteLesson(lessonToDelete.id);
      if (viewingLesson?.id === lessonToDelete.id) setViewingLesson(null);
      setLessonToDelete(null);
    }
  };

  const getStatusBadge = (status: LessonStatus) => {
    switch (status) {
      case 'Đã hoàn thành':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Đang dạy':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Chưa dạy':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="lessons-management-view" className="space-y-6 animate-fade-in">
      {/* Notice Banner regarding pedagogical disclaimer */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">Lưu ý giáo án & nội dung KHTN THCS:</p>
          <p className="text-amber-800 mt-0.5">
            Dữ liệu bài học hiển thị dưới đây là dữ liệu mẫu minh họa theo khung chương trình môn Khoa học tự nhiên THCS. Cô Bùi Thị Nguyên có thể tùy ý sửa, xóa hoặc thêm mới theo phân phối chương trình thực tế của nhà trường.
          </p>
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" />
            <span>Quản Lý Nội Dung & Bài Học KHTN</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng cộng <strong className="text-slate-800 font-bold">{lessons.length} bài học / chủ đề</strong> đang quản lý
          </p>
        </div>

        <button
          id="btn-add-lesson"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition min-h-[44px] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm bài học mới</span>
        </button>
      </div>

      {/* Search and Multi-Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-lesson"
            type="text"
            placeholder="Tìm theo tên bài học, chủ đề, mục tiêu hoặc từ khóa nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Khối:</span>
            <div className="flex gap-1">
              {['all', '6', '7', '8', '9'].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    selectedGrade === grade
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {grade === 'all' ? 'Tất cả' : `Khối ${grade}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-xs font-semibold text-slate-500">Chủ đề:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[36px]"
            >
              {KHTN_TOPICS.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[36px]"
            >
              <option value="all">Tất cả</option>
              <option value="Chưa dạy">Chưa dạy</option>
              <option value="Đang dạy">Đang dạy</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lesson List */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-700">Chưa có bài học phù hợp</p>
          <p className="text-xs text-slate-400 mt-1">Không tìm thấy bài học nào theo điều kiện tìm kiếm.</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedGrade('all');
              setSelectedTopic('Tất cả chủ đề');
              setSelectedStatus('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((les) => (
            <div
              key={les.id}
              id={`lesson-card-${les.id}`}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-400 hover:shadow-sm transition p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        Khối {les.grade}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {les.topic}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          les.status
                        )}`}
                      >
                        {les.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {les.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(les)}
                      aria-label="Sửa bài học"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                      title="Chỉnh sửa bài học"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonToDelete(les)}
                      aria-label="Xóa bài học"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                      title="Xóa bài học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Duration & update */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Thời lượng: {les.durationPeriods || 2} tiết
                  </span>
                  <span>•</span>
                  <span>Cập nhật: {les.updatedAt}</span>
                </div>

                {/* Learning Objectives Preview */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <p className="line-clamp-2">
                    <strong className="text-slate-800">Mục tiêu:</strong> {les.learningObjectives}
                  </p>
                  {les.summaryContent && (
                    <p className="line-clamp-2 text-slate-500">
                      <strong className="text-slate-700">Tóm tắt:</strong> {les.summaryContent}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewingLesson(les)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                >
                  Xem chi tiết giáo án & ghi chú →
                </button>

                {/* Quick status change */}
                <select
                  value={les.status}
                  onChange={(e) => updateLesson(les.id, { status: e.target.value as LessonStatus })}
                  className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium cursor-pointer"
                >
                  <option value="Chưa dạy">Chưa dạy</option>
                  <option value="Đang dạy">Đang dạy</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Lesson Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingLesson ? 'Chỉnh sửa bài học KHTN' : 'Thêm bài học KHTN mới'}
        subtitle="Hệ thống nội dung giảng dạy môn Khoa học tự nhiên THCS"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên bài học / Chủ đề *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Bài 17: Tế bào – Đơn vị cơ sở của sự sống..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                Chủ đề KHTN *
              </label>
              <input
                type="text"
                list="topic-options"
                required
                placeholder="VD: Vật sống, Chất và biến đổi..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
              <datalist id="topic-options">
                <option value="Chất và sự biến đổi của chất" />
                <option value="Vật sống" />
                <option value="Năng lượng và sự biến đổi" />
                <option value="Trái Đất và bầu trời" />
                <option value="Vật sống & Di truyền" />
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số tiết phân bổ
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.durationPeriods}
                onChange={(e) => setFormData({ ...formData, durationPeriods: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trạng thái giảng dạy
            </label>
            <div className="flex gap-4">
              {(['Chưa dạy', 'Đang dạy', 'Đã hoàn thành'] as LessonStatus[]).map((st) => (
                <label key={st} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="lessonStatus"
                    value={st}
                    checked={formData.status === st}
                    onChange={() => setFormData({ ...formData, status: st })}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mục tiêu học tập (Yêu cầu cần đạt)
            </label>
            <textarea
              rows={2}
              placeholder="Học sinh nêu được khái niệm, thực hiện được thí nghiệm, giải thích được hiện tượng..."
              value={formData.learningObjectives}
              onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nội dung tóm tắt
            </label>
            <textarea
              rows={3}
              placeholder="Tóm tắt kiến thức trọng tâm của bài..."
              value={formData.summaryContent}
              onChange={(e) => setFormData({ ...formData, summaryContent: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi chú của giáo viên Bùi Thị Nguyên
            </label>
            <textarea
              rows={2}
              placeholder="Chuẩn bị dụng cụ thí nghiệm, lưu ý thiết bị phòng bộ môn, dặn dò học sinh..."
              value={formData.teacherNotes}
              onChange={(e) => setFormData({ ...formData, teacherNotes: e.target.value })}
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
              {editingLesson ? 'Lưu bài học' : 'Thêm bài học'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Lesson Details Modal */}
      {viewingLesson && (
        <Modal
          isOpen={!!viewingLesson}
          onClose={() => setViewingLesson(null)}
          title={viewingLesson.title}
          subtitle={`Khoa học tự nhiên Khối ${viewingLesson.grade} • Chủ đề: ${viewingLesson.topic}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
                Khối {viewingLesson.grade}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                Thời lượng: {viewingLesson.durationPeriods} tiết
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-semibold border ${getStatusBadge(
                  viewingLesson.status
                )}`}
              >
                Trạng thái: {viewingLesson.status}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mục tiêu học tập:
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {viewingLesson.learningObjectives || 'Chưa nhập mục tiêu học tập.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nội dung tóm tắt:
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {viewingLesson.summaryContent || 'Chưa nhập tóm tắt kiến thức.'}
                </p>
              </div>

              {viewingLesson.teacherNotes && (
                <div className="pt-2 border-t border-slate-200/60 bg-amber-50/50 p-3 rounded-lg border border-amber-200/70">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Ghi chú của cô Bùi Thị Nguyên:
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">{viewingLesson.teacherNotes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = viewingLesson;
                  setViewingLesson(null);
                  handleOpenEdit(target);
                }}
                className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold min-h-[38px] cursor-pointer"
              >
                Chỉnh sửa bài học này
              </button>
              <button
                type="button"
                onClick={() => setViewingLesson(null)}
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
        isOpen={!!lessonToDelete}
        onClose={() => setLessonToDelete(null)}
        title="Xác nhận xóa bài học"
        subtitle="Hành động này sẽ xóa bài học khỏi danh sách giáo án"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Cô có chắc chắn muốn xóa bài học này?</p>
              <p className="mt-1">{lessonToDelete?.title}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setLessonToDelete(null)}
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
