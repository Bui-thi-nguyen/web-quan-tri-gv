import React from 'react';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  School,
  FileSpreadsheet,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsView: React.FC = () => {
  const {
    classes,
    students,
    tasks,
    results,
    teacherProfile,
    exportStudentsCSV,
  } = useApp();

  // 1. Students count by class
  const classStats = classes.map((cls) => {
    const count = students.filter((s) => s.classId === cls.id).length;
    const taskCount = tasks.filter((t) => t.classId === cls.id).length;
    return {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      studentsCount: count > 0 ? count : cls.studentCount,
      tasksCount: taskCount,
    };
  });

  const totalStudents = students.length;

  // 2. Tasks by status
  const tasksByStatus = {
    'Đã hoàn thành': tasks.filter((t) => t.status === 'Đã hoàn thành').length,
    'Đang thực hiện': tasks.filter((t) => t.status === 'Đang thực hiện').length,
    'Chưa giao': tasks.filter((t) => t.status === 'Chưa giao').length,
    'Quá hạn': tasks.filter((t) => t.status === 'Quá hạn').length,
  };

  const totalTasks = tasks.length || 1;
  const completedTasksRate = Math.round(
    (tasksByStatus['Đã hoàn thành'] / totalTasks) * 100
  );

  // 3. Learning status breakdown
  const statusCounts = {
    'Tốt': students.filter((s) => s.status === 'Tốt').length,
    'Khá': students.filter((s) => s.status === 'Khá').length,
    'Đang tiến bộ': students.filter((s) => s.status === 'Đang tiến bộ').length,
    'Cần cố gắng': students.filter((s) => s.status === 'Cần cố gắng').length,
  };

  // 4. Students needing additional teacher attention / monitoring
  // Based strictly on entered data: status === 'Cần cố gắng' or uncompleted results
  const studentsToMonitor = students.filter(
    (s) => s.status === 'Cần cố gắng' || s.status === 'Đang tiến bộ'
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="reports-management-view" className="space-y-6 animate-fade-in">
      {/* Notice about objective data reporting */}
      <div className="bg-sky-50/70 border border-sky-200 p-4 rounded-2xl flex items-start gap-3 text-sky-900 text-xs sm:text-sm">
        <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">Nguyên tắc báo cáo & thống kê khách quan:</p>
          <p className="text-sky-800 mt-0.5">
            Báo cáo được tổng hợp tự động hoàn toàn dựa trên dữ liệu học sinh, bài tập và điểm số mà cô Bùi Thị Nguyên đã nhập. Hệ thống không tự ý đưa ra kết luận chuyên môn hoặc xếp loại học sinh ngoài dữ liệu thực tế.
          </p>
        </div>
      </div>

      {/* Header with Print & Export CSV */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            <span>Báo Cáo & Thống Kê Học Tập KHTN</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng quan số liệu phục vụ sinh hoạt chuyên môn và báo cáo tổ KHTN
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportStudentsCSV()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition min-h-[44px] cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất file Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition min-h-[44px] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In / Lưu PDF</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tổng số học sinh ghi nhận
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500">học sinh</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 font-medium">
            Phân bổ trên <strong className="text-teal-700">{classes.length} lớp học</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tỷ lệ nhiệm vụ đã hoàn thành
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-700">{completedTasksRate}%</span>
            <span className="text-xs text-slate-500">tổng nhiệm vụ</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completedTasksRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Học sinh đạt kết quả Tốt / Khá
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">
              {statusCounts['Tốt'] + statusCounts['Khá']}
            </span>
            <span className="text-xs text-slate-500">/ {totalStudents} em</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 font-medium">
            Tương đương{' '}
            <strong className="text-emerald-700">
              {totalStudents > 0
                ? Math.round(((statusCounts['Tốt'] + statusCounts['Khá']) / totalStudents) * 100)
                : 0}
              %
            </strong>{' '}
            tổng số
          </div>
        </div>
      </div>

      {/* Two Column Layout: Student Distribution & Task Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Số học sinh theo từng lớp */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <School className="w-5 h-5 text-teal-600" />
              <span>Số học sinh theo từng lớp</span>
            </h3>
            <span className="text-xs text-slate-500">Sĩ số thực tế</span>
          </div>

          <div className="space-y-4">
            {classStats.map((item) => {
              const maxScale = Math.max(...classStats.map((c) => c.studentsCount), 45);
              const percentage = Math.round((item.studentsCount / maxScale) * 100);

              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Lớp {item.name} <span className="font-normal text-slate-500">(Khối {item.grade})</span>
                    </span>
                    <span className="font-extrabold text-slate-900">{item.studentsCount} học sinh</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div
                      className="bg-teal-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Số nhiệm vụ theo trạng thái */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Số nhiệm vụ theo trạng thái</span>
            </h3>
            <span className="text-xs text-slate-500">Tiến độ giao bài</span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Đang thực hiện', count: tasksByStatus['Đang thực hiện'], color: 'bg-teal-500' },
              { label: 'Đã hoàn thành', count: tasksByStatus['Đã hoàn thành'], color: 'bg-emerald-500' },
              { label: 'Chưa giao', count: tasksByStatus['Chưa giao'], color: 'bg-slate-400' },
              { label: 'Quá hạn', count: tasksByStatus['Quá hạn'], color: 'bg-rose-500' },
            ].map((stat) => {
              const pct = totalTasks > 0 ? Math.round((stat.count / tasks.length) * 100) : 0;
              return (
                <div key={stat.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{stat.label}</span>
                    <span className="font-bold text-slate-900">
                      {stat.count} nhiệm vụ ({pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${stat.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Learning Status Distribution */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3">
          Phân bố mức độ học tập của học sinh
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Tốt</span>
            <div className="text-2xl font-extrabold text-emerald-900 mt-2">{statusCounts['Tốt']}</div>
            <div className="text-xs text-emerald-700 mt-1">Học sinh hoàn thành xuất sắc</div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Khá</span>
            <div className="text-2xl font-extrabold text-blue-900 mt-2">{statusCounts['Khá']}</div>
            <div className="text-xs text-blue-700 mt-1">Nắm vững kiến thức trọng tâm</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Đang tiến bộ</span>
            <div className="text-2xl font-extrabold text-amber-900 mt-2">{statusCounts['Đang tiến bộ']}</div>
            <div className="text-xs text-amber-700 mt-1">Có chuyển biến tích cực</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cần cố gắng</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-2">{statusCounts['Cần cố gắng']}</div>
            <div className="text-xs text-slate-500 mt-1">Cần giáo viên kèm thêm</div>
          </div>
        </div>
      </div>

      {/* Danh sách học sinh cần giáo viên theo dõi thêm */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Danh sách học sinh cần giáo viên theo dõi & hỗ trợ thêm
              </h3>
              <p className="text-xs text-slate-500">
                Dựa trên trạng thái 'Cần cố gắng' hoặc 'Đang tiến bộ' do cô Bùi Thị Nguyên đã nhập
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {studentsToMonitor.length} học sinh
          </span>
        </div>

        {studentsToMonitor.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Hiện không có học sinh nào trong danh mục cần theo dõi thêm.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Học sinh</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-3">Điểm gần nhất</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Nhận xét của giáo viên</th>
                  <th className="py-2.5 px-3">Ghi chú lưu ý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentsToMonitor.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {st.fullName} <span className="font-mono text-slate-400 font-normal">({st.studentCode})</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{st.className}</td>
                    <td className="py-2.5 px-3 font-bold text-teal-700">{st.latestScore}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {st.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">{st.latestFeedback || 'Chưa có'}</td>
                    <td className="py-2.5 px-3 text-slate-500 italic">{st.notes || 'Chưa có ghi chú'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
