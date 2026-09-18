import React from 'react';
import {
  School,
  Users,
  BookOpen,
  ClipboardList,
  GraduationCap,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const DashboardView: React.FC = () => {
  const {
    teacherProfile,
    classes,
    students,
    lessons,
    tasks,
    notes,
    activityLogs,
    setActiveTab,
    toggleNoteCompleted,
  } = useApp();

  const totalClasses = classes.length;
  const totalStudents = students.length;
  const totalLessons = lessons.length;
  const activeTasks = tasks.filter((t) => t.status === 'Đang thực hiện' || t.status === 'Chưa giao').length;

  const pendingTodos = notes.filter((n) => n.category === 'Việc cần làm' || !n.isCompleted);

  const quickNav = [
    {
      title: 'Quản lý lớp',
      desc: `${totalClasses} lớp học phụ trách`,
      icon: School,
      tab: 'classes' as ActiveTab,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Quản lý học sinh',
      desc: `${totalStudents} học sinh trong danh sách`,
      icon: Users,
      tab: 'students' as ActiveTab,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Bài học',
      desc: `${totalLessons} chủ đề/bài giảng KHTN`,
      icon: BookOpen,
      tab: 'lessons' as ActiveTab,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Nhiệm vụ',
      desc: `${tasks.length} nhiệm vụ học tập`,
      icon: ClipboardList,
      tab: 'tasks' as ActiveTab,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Kết quả học tập',
      desc: 'Theo dõi điểm & nhận xét',
      icon: GraduationCap,
      tab: 'results' as ActiveTab,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Báo cáo',
      desc: 'Thống kê trực quan & tỷ lệ',
      icon: BarChart3,
      tab: 'reports' as ActiveTab,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      iconColor: 'text-sky-600',
    },
  ];

  return (
    <div id="dashboard-view" className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-sky-900 rounded-2xl text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
            <span>{teacherProfile.school}</span>
            <span>•</span>
            <span>{teacherProfile.subject}</span>
          </div>

          <h2 id="dashboard-welcome-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Xin chào cô {teacherProfile.name}!
          </h2>

          <p className="text-sm sm:text-base text-teal-100 mt-2 leading-relaxed">
            Chào mừng cô đến với hệ thống quản trị học tập Khoa học tự nhiên THCS. Hôm nay cô đang quản lý{' '}
            <strong className="text-white font-bold">{totalClasses} lớp học</strong> và{' '}
            <strong className="text-white font-bold">{totalStudents} học sinh</strong>. Chúc cô có một ngày giảng dạy hiệu quả!
          </p>

          {/* Quick Date Display */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-teal-200 font-medium pt-3 border-t border-teal-600/50">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-300" />
              Năm học hiện tại: {teacherProfile.academicYear}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-300" />
              Hệ thống đã sẵn sàng giảng dạy & đánh giá
            </span>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          id="stat-card-classes"
          onClick={() => setActiveTab('classes')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-400 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số lớp</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalClasses}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Lớp đang giảng dạy</div>
          </div>
        </div>

        <div
          id="stat-card-students"
          onClick={() => setActiveTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng học sinh</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalStudents}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Học sinh được lưu trữ</div>
          </div>
        </div>

        <div
          id="stat-card-lessons"
          onClick={() => setActiveTab('lessons')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-400 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bài học / Nội dung</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalLessons}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Chủ đề giáo án KHTN</div>
          </div>
        </div>

        <div
          id="stat-card-tasks"
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-400 transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhiệm vụ đang giao</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activeTasks}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Đang thực hiện / Cần nộp</div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Truy cập nhanh chức năng</h3>
          <span className="text-xs text-slate-500">Bấm để chuyển tới mục cần thao tác</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.tab}
                id={`quick-access-${item.tab}`}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm cursor-pointer flex flex-col justify-between bg-white border-slate-200 hover:border-slate-300 min-h-[110px]`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${item.color}`}>
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 leading-tight">{item.title}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Việc cần làm & Hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Việc cần làm (Todos) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">Khu vực việc cần làm</h3>
                <p className="text-xs text-slate-500">Ghi chú và nhắc nhở công việc giảng dạy của giáo viên</p>
              </div>
            </div>

            <button
              id="btn-goto-notes"
              type="button"
              onClick={() => setActiveTab('notes')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingTodos.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                Cô Bùi Thị Nguyên đã hoàn thành hết các việc cần làm!
              </div>
            ) : (
              pendingTodos.slice(0, 4).map((todo) => (
                <div
                  key={todo.id}
                  id={`todo-item-${todo.id}`}
                  className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    todo.isCompleted
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleNoteCompleted(todo.id)}
                    aria-label="Đánh dấu hoàn thành việc cần làm"
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition ${
                      todo.isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-teal-500 bg-white'
                    }`}
                  >
                    {todo.isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm font-semibold leading-tight ${
                          todo.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {todo.title}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0 font-medium">
                        {todo.category}
                      </span>
                    </div>
                    {todo.content && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {todo.content}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              id="btn-add-quick-note"
              type="button"
              onClick={() => setActiveTab('notes')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition cursor-pointer min-h-[40px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm ghi chú / việc cần làm mới</span>
            </button>
          </div>
        </div>

        {/* Hoạt động gần đây */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">Hoạt động gần đây</h3>
                <p className="text-xs text-slate-500">Nhật ký các thao tác vừa thực hiện</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium leading-relaxed">{log.action}</p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Dữ liệu an toàn trên trình duyệt</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Đã đồng bộ cục bộ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
