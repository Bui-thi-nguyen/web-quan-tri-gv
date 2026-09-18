import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TeacherProfile,
  ClassRoom,
  Student,
  Lesson,
  TaskItem,
  StudentResultRecord,
  TeacherNote,
  ActivityLog,
  ActiveTab,
} from '../types';
import {
  initialTeacherProfile,
  initialClasses,
  initialStudents,
  initialLessons,
  initialTasks,
  initialResults,
  initialNotes,
  initialActivityLogs,
} from '../data/initialData';

interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AppContextType {
  // Navigation & Settings
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;
  presentationMode: boolean;
  setPresentationMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  
  // Teacher
  teacherProfile: TeacherProfile;
  updateTeacherProfile: (profile: Partial<TeacherProfile>) => void;

  // Classes
  classes: ClassRoom[];
  addClass: (item: Omit<ClassRoom, 'id' | 'createdAt'>) => void;
  updateClass: (id: string, item: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;

  // Students
  students: Student[];
  addStudent: (item: Omit<Student, 'id'>) => void;
  batchAddStudents: (items: Omit<Student, 'id'>[]) => number;
  updateStudent: (id: string, item: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Lessons
  lessons: Lesson[];
  addLesson: (item: Omit<Lesson, 'id' | 'updatedAt'>) => void;
  updateLesson: (id: string, item: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;

  // Tasks
  tasks: TaskItem[];
  addTask: (item: Omit<TaskItem, 'id'>) => void;
  updateTask: (id: string, item: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;

  // Results
  results: StudentResultRecord[];
  addResult: (item: Omit<StudentResultRecord, 'id' | 'updatedAt'>) => void;
  updateResult: (id: string, item: Partial<StudentResultRecord>) => void;
  deleteResult: (id: string) => void;

  // Notes
  notes: TeacherNote[];
  addNote: (item: Omit<TeacherNote, 'id'>) => void;
  updateNote: (id: string, item: Partial<TeacherNote>) => void;
  deleteNote: (id: string) => void;
  toggleNotePinned: (id: string) => void;
  toggleNoteCompleted: (id: string) => void;

  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, type: ActivityLog['type']) => void;

  // Toasts
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Data management
  resetToSampleData: () => void;
  exportJSON: () => void;
  importJSON: (jsonData: string) => boolean;
  exportStudentsCSV: (filterClassId?: string) => void;
}

const STORAGE_PREFIX = 'khtn_teacher_bui_thi_nguyen_';

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
  }
  return defaultValue;
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState<boolean>(() => {
    return loadStorage<boolean>('presentationMode', false);
  });

  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() =>
    loadStorage<TeacherProfile>('teacherProfile', initialTeacherProfile)
  );

  const [classes, setClasses] = useState<ClassRoom[]>(() =>
    loadStorage<ClassRoom[]>('classes', initialClasses)
  );

  const [students, setStudents] = useState<Student[]>(() =>
    loadStorage<Student[]>('students', initialStudents)
  );

  const [lessons, setLessons] = useState<Lesson[]>(() =>
    loadStorage<Lesson[]>('lessons', initialLessons)
  );

  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    loadStorage<TaskItem[]>('tasks', initialTasks)
  );

  const [results, setResults] = useState<StudentResultRecord[]>(() =>
    loadStorage<StudentResultRecord[]>('results', initialResults)
  );

  const [notes, setNotes] = useState<TeacherNote[]>(() =>
    loadStorage<TeacherNote[]>('notes', initialNotes)
  );

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadStorage<ActivityLog[]>('activityLogs', initialActivityLogs)
  );

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Persistence effects
  useEffect(() => {
    saveStorage('teacherProfile', teacherProfile);
  }, [teacherProfile]);

  useEffect(() => {
    saveStorage('classes', classes);
  }, [classes]);

  useEffect(() => {
    saveStorage('students', students);
  }, [students]);

  useEffect(() => {
    saveStorage('lessons', lessons);
  }, [lessons]);

  useEffect(() => {
    saveStorage('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveStorage('results', results);
  }, [results]);

  useEffect(() => {
    saveStorage('notes', notes);
  }, [notes]);

  useEffect(() => {
    saveStorage('activityLogs', activityLogs);
  }, [activityLogs]);

  useEffect(() => {
    saveStorage('presentationMode', presentationMode);
  }, [presentationMode]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3200);
  };

  const addActivityLog = (action: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      action,
      timestamp: 'Vừa xong',
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // Profile
  const updateTeacherProfile = (profile: Partial<TeacherProfile>) => {
    setTeacherProfile((prev) => ({ ...prev, ...profile }));
    addActivityLog('Đã cập nhật thông tin cá nhân giáo viên', 'class');
    showToast('Đã lưu thông tin giáo viên thành công!');
  };

  // Classes CRUD
  const addClass = (item: Omit<ClassRoom, 'id' | 'createdAt'>) => {
    const newClass: ClassRoom = {
      ...item,
      id: 'class-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClasses((prev) => [...prev, newClass]);
    addActivityLog(`Đã thêm lớp học mới: ${item.name}`, 'class');
    showToast(`Đã thêm lớp ${item.name} thành công!`);
  };

  const updateClass = (id: string, item: Partial<ClassRoom>) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...item } : c))
    );
    // If name changed, update students & tasks associated
    if (item.name) {
      setStudents((prev) =>
        prev.map((s) => (s.classId === id ? { ...s, className: item.name! } : s))
      );
      setTasks((prev) =>
        prev.map((t) => (t.classId === id ? { ...t, className: item.name! } : t))
      );
      setResults((prev) =>
        prev.map((r) => (r.classId === id ? { ...r, className: item.name! } : r))
      );
    }
    addActivityLog(`Đã cập nhật thông tin lớp: ${item.name || id}`, 'class');
    showToast('Cập nhật thông tin lớp thành công!');
  };

  const deleteClass = (id: string) => {
    const target = classes.find((c) => c.id === id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    addActivityLog(`Đã xóa lớp học: ${target?.name || id}`, 'class');
    showToast(`Đã xóa lớp ${target?.name || ''} thành công!`);
    if (selectedClassId === id) {
      setSelectedClassId(null);
    }
  };

  // Students CRUD
  const addStudent = (item: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...item,
      id: 'std-' + Date.now(),
    };
    setStudents((prev) => [...prev, newStudent]);
    // Increase count on class
    setClasses((prev) =>
      prev.map((c) =>
        c.id === item.classId ? { ...c, studentCount: c.studentCount + 1 } : c
      )
    );
    addActivityLog(`Đã thêm học sinh: ${item.fullName} (${item.className})`, 'student');
    showToast(`Đã thêm học sinh ${item.fullName}!`);
  };

  const batchAddStudents = (items: Omit<Student, 'id'>[]) => {
    if (!items || items.length === 0) return 0;
    const baseTimestamp = Date.now();
    const newStudents: Student[] = items.map((item, index) => ({
      ...item,
      id: `std-${baseTimestamp}-${index}-${Math.floor(Math.random() * 1000)}`,
    }));

    setStudents((prev) => [...prev, ...newStudents]);

    // Recalculate or add counts to classes
    const classCountMap: Record<string, number> = {};
    items.forEach((st) => {
      if (st.classId) {
        classCountMap[st.classId] = (classCountMap[st.classId] || 0) + 1;
      }
    });

    setClasses((prev) =>
      prev.map((c) =>
        classCountMap[c.id]
          ? { ...c, studentCount: c.studentCount + classCountMap[c.id] }
          : c
      )
    );

    addActivityLog(`Đã nhập danh sách ${items.length} học sinh từ file Excel/CSV`, 'student');
    showToast(`Đã nhập thành công ${items.length} học sinh từ file Excel!`, 'success');
    return items.length;
  };

  const updateStudent = (id: string, item: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...item } : s))
    );
    setResults((prev) =>
      prev.map((r) =>
        r.studentId === id
          ? {
              ...r,
              studentName: item.fullName ?? r.studentName,
              className: item.className ?? r.className,
              status: item.status ?? r.status,
            }
          : r
      )
    );
    addActivityLog(`Đã cập nhật thông tin học sinh: ${item.fullName || id}`, 'student');
    showToast('Đã lưu thông tin học sinh!');
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (target) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === target.classId
            ? { ...c, studentCount: Math.max(0, c.studentCount - 1) }
            : c
        )
      );
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setResults((prev) => prev.filter((r) => r.studentId !== id));
    addActivityLog(`Đã xóa học sinh: ${target?.fullName || id}`, 'student');
    showToast('Đã xóa học sinh thành công!');
  };

  // Lessons CRUD
  const addLesson = (item: Omit<Lesson, 'id' | 'updatedAt'>) => {
    const newLesson: Lesson = {
      ...item,
      id: 'les-' + Date.now(),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setLessons((prev) => [newLesson, ...prev]);
    addActivityLog(`Đã thêm bài học: ${item.title}`, 'lesson');
    showToast('Đã thêm bài học mới thành công!');
  };

  const updateLesson = (id: string, item: Partial<Lesson>) => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, ...item, updatedAt: new Date().toISOString().split('T')[0] }
          : l
      )
    );
    addActivityLog(`Đã cập nhật bài học: ${item.title || id}`, 'lesson');
    showToast('Đã lưu bài học thành công!');
  };

  const deleteLesson = (id: string) => {
    const target = lessons.find((l) => l.id === id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
    addActivityLog(`Đã xóa bài học: ${target?.title || id}`, 'lesson');
    showToast('Đã xóa bài học!');
  };

  // Tasks CRUD
  const addTask = (item: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...item,
      id: 'task-' + Date.now(),
      completedCount: 0,
      totalStudents: classes.find((c) => c.id === item.classId)?.studentCount || 0,
    };
    setTasks((prev) => [newTask, ...prev]);
    addActivityLog(`Đã giao nhiệm vụ mới: ${item.title} cho lớp ${item.className}`, 'task');
    showToast(`Đã giao nhiệm vụ cho lớp ${item.className}!`);
  };

  const updateTask = (id: string, item: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...item } : t))
    );
    addActivityLog(`Đã cập nhật nhiệm vụ: ${item.title || id}`, 'task');
    showToast('Đã cập nhật nhiệm vụ!');
  };

  const deleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setResults((prev) => prev.filter((r) => r.taskId !== id));
    addActivityLog(`Đã xóa nhiệm vụ: ${target?.title || id}`, 'task');
    showToast('Đã xóa nhiệm vụ!');
  };

  // Results CRUD
  const addResult = (item: Omit<StudentResultRecord, 'id' | 'updatedAt'>) => {
    const newRecord: StudentResultRecord = {
      ...item,
      id: 'res-' + Date.now(),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setResults((prev) => [newRecord, ...prev]);
    addActivityLog(`Đã nhập kết quả đánh giá cho ${item.studentName}`, 'result');
    showToast('Đã lưu kết quả học tập!');
  };

  const updateResult = (id: string, item: Partial<StudentResultRecord>) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...item, updatedAt: new Date().toISOString().split('T')[0] }
          : r
      )
    );
    showToast('Đã cập nhật kết quả đánh giá!');
  };

  const deleteResult = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
    showToast('Đã xóa bản ghi kết quả!');
  };

  // Notes CRUD
  const addNote = (item: Omit<TeacherNote, 'id'>) => {
    const newNote: TeacherNote = {
      ...item,
      id: 'note-' + Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    addActivityLog(`Đã thêm ghi chú: ${item.title}`, 'note');
    showToast('Đã lưu ghi chú mới!');
  };

  const updateNote = (id: string, item: Partial<TeacherNote>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...item } : n))
    );
    showToast('Đã cập nhật ghi chú!');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Đã xóa ghi chú!');
  };

  const toggleNotePinned = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const toggleNoteCompleted = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isCompleted: !n.isCompleted } : n))
    );
  };

  // Reset to Sample Data
  const resetToSampleData = () => {
    setTeacherProfile(initialTeacherProfile);
    setClasses(initialClasses);
    setStudents(initialStudents);
    setLessons(initialLessons);
    setTasks(initialTasks);
    setResults(initialResults);
    setNotes(initialNotes);
    setActivityLogs(initialActivityLogs);
    showToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu!');
  };

  // Export JSON
  const exportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      teacherProfile,
      classes,
      students,
      lessons,
      tasks,
      results,
      notes,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Du_Lieu_KHTN_Bui_Thi_Nguyen_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file lưu trữ JSON thành công!');
  };

  // Import JSON
  const importJSON = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.classes && data.students && data.lessons && data.tasks) {
        if (data.teacherProfile) setTeacherProfile(data.teacherProfile);
        setClasses(data.classes);
        setStudents(data.students);
        setLessons(data.lessons);
        setTasks(data.tasks);
        if (data.results) setResults(data.results);
        if (data.notes) setNotes(data.notes);
        addActivityLog('Đã khôi phục dữ liệu từ file sao lưu JSON', 'class');
        showToast('Khôi phục dữ liệu từ tệp tin thành công!');
        return true;
      } else {
        showToast('Tệp JSON không đúng cấu trúc yêu cầu!', 'error');
        return false;
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi đọc file JSON. Vui lòng kiểm tra lại!', 'error');
      return false;
    }
  };

  // Export CSV
  const exportStudentsCSV = (filterClassId?: string) => {
    const list = filterClassId
      ? students.filter((s) => s.classId === filterClassId)
      : students;

    const headers = ['Mã Học Sinh', 'Họ Và Tên', 'Lớp', 'Giới Tính', 'Điểm Gần Nhất', 'Trạng Thái', 'Nhận Xét'];
    const rows = list.map((s) => [
      `"${s.studentCode}"`,
      `"${s.fullName}"`,
      `"${s.className}"`,
      `"${s.gender}"`,
      `"${s.latestScore}"`,
      `"${s.status}"`,
      `"${(s.latestFeedback || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Hoc_Sinh_${filterClassId || 'Tat_Ca'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất danh sách học sinh ra file CSV!');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedClassId,
        setSelectedClassId,
        presentationMode,
        setPresentationMode,
        teacherProfile,
        updateTeacherProfile,
        classes,
        addClass,
        updateClass,
        deleteClass,
        students,
        addStudent,
        batchAddStudents,
        updateStudent,
        deleteStudent,
        lessons,
        addLesson,
        updateLesson,
        deleteLesson,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        results,
        addResult,
        updateResult,
        deleteResult,
        notes,
        addNote,
        updateNote,
        deleteNote,
        toggleNotePinned,
        toggleNoteCompleted,
        activityLogs,
        addActivityLog,
        toast,
        showToast,
        resetToSampleData,
        exportJSON,
        importJSON,
        exportStudentsCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
