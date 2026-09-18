import React, { useState } from 'react';
import {
  BookmarkCheck,
  Plus,
  Search,
  Pin,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TeacherNote, NoteCategory } from '../types';
import { Modal } from '../components/Modal';

const CATEGORIES: NoteCategory[] = [
  'Ghi chú tiết dạy',
  'Việc cần làm',
  'Ý tưởng bài học',
  'Ghi chú về lớp',
];

export const NotesView: React.FC = () => {
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    toggleNotePinned,
    toggleNoteCompleted,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<TeacherNote | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: NoteCategory;
    content: string;
    date: string;
    isPinned: boolean;
  }>({
    title: '',
    category: 'Ghi chú tiết dạy',
    content: '',
    date: new Date().toISOString().split('T')[0],
    isPinned: false,
  });

  const [noteToDelete, setNoteToDelete] = useState<TeacherNote | null>(null);

  // Filtered notes (pinned first)
  const filteredNotes = notes
    .filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const handleOpenAdd = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      category: 'Ghi chú tiết dạy',
      content: '',
      date: new Date().toISOString().split('T')[0],
      isPinned: false,
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (note: TeacherNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      category: note.category,
      content: note.content,
      date: note.date,
      isPinned: note.isPinned,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        date: formData.date,
        isPinned: formData.isPinned,
      });
    } else {
      addNote({
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        date: formData.date,
        isPinned: formData.isPinned,
        isCompleted: false,
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  return (
    <div id="notes-management-view" className="space-y-6 animate-fade-in">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-teal-600" />
            <span>Sổ Tay & Ghi Chú Giáo Viên KHTN</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Không gian ghi chép tiết dạy, việc cần làm và sáng kiến sư phạm của cô Bùi Thị Nguyên
          </p>
        </div>

        <button
          id="btn-add-note"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition min-h-[44px] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo ghi chú mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-note"
            type="text"
            placeholder="Tìm theo tiêu đề hoặc nội dung ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[38px] ${
                selectedCategory === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({notes.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[38px] ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BookmarkCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-700">Chưa có ghi chú nào</p>
          <p className="text-xs text-slate-400 mt-1">Không tìm thấy ghi chú nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              id={`note-card-${note.id}`}
              className={`bg-white rounded-2xl border transition p-5 flex flex-col justify-between shadow-xs ${
                note.isPinned
                  ? 'border-teal-400/90 ring-1 ring-teal-400/30'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                      {note.category}
                    </span>
                    {note.isPinned && (
                      <span className="inline-flex items-center text-[10px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-full">
                        <Pin className="w-3 h-3 mr-0.5 fill-teal-600 text-teal-600" />
                        Đã ghim
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleNotePinned(note.id)}
                      aria-label="Ghim ghi chú"
                      title={note.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                      className={`p-1.5 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer ${
                        note.isPinned
                          ? 'text-teal-700 bg-teal-50'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-teal-600' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(note)}
                      aria-label="Sửa ghi chú"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteToDelete(note)}
                      aria-label="Xóa ghi chú"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line line-clamp-4">
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {note.date}
                </span>

                <button
                  type="button"
                  onClick={() => toggleNoteCompleted(note.id)}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition cursor-pointer ${
                    note.isCompleted
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{note.isCompleted ? 'Đã hoàn thành' : 'Đánh dấu xong'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingNote ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới'}
        subtitle="Ghi chép công việc giảng dạy môn KHTN"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tiêu đề ghi chú *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Chuẩn bị thiết bị kính hiển vi tuần tới..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phân loại
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as NoteCategory })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ngày ghi chép
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nội dung chi tiết
            </label>
            <textarea
              rows={4}
              required
              placeholder="Nhập nội dung lưu ý, chuẩn bị bài giảng, danh sách việc cần giải quyết..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPinnedCheck"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
            />
            <label htmlFor="isPinnedCheck" className="text-xs sm:text-sm text-slate-700 font-medium cursor-pointer">
              Ghim ghi chú này lên đầu danh sách
            </label>
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
              {editingNote ? 'Lưu thay đổi' : 'Lưu ghi chú'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        title="Xác nhận xóa ghi chú"
        subtitle="Hành động này sẽ xóa ghi chú khỏi sổ tay"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Cô có chắc chắn muốn xóa ghi chú <strong className="text-slate-900">{noteToDelete?.title}</strong>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setNoteToDelete(null)}
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
