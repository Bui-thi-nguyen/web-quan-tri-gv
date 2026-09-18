export type GradeLevel = '6' | '7' | '8' | '9';

export interface TeacherProfile {
  name: string;
  subject: string;
  school: string;
  academicYear: string;
  email?: string;
  phone?: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. 6A1, 7A2, 8A1
  grade: GradeLevel;
  studentCount: number;
  roomNumber?: string;
  notes?: string;
  createdAt: string;
}

export type StudentStatus = 'Tốt' | 'Khá' | 'Đang tiến bộ' | 'Cần cố gắng';

export interface Student {
  id: string;
  studentCode: string; // e.g. HS-601
  fullName: string;
  classId: string;
  className: string;
  gender: 'Nam' | 'Nữ';
  latestScore: string; // e.g. "8.5", "Đạt", "Hoàn thành tốt"
  latestFeedback: string;
  status: StudentStatus;
  notes?: string;
}

export type LessonStatus = 'Chưa dạy' | 'Đang dạy' | 'Đã hoàn thành';

export interface Lesson {
  id: string;
  title: string; // Tên bài/chủ đề
  grade: GradeLevel;
  topic: string; // Chủ đề KHTN: Chất và sự biến đổi, Vật sống, Năng lượng, Trái đất...
  durationPeriods: number; // Số tiết
  learningObjectives: string; // Mục tiêu học tập
  summaryContent: string; // Nội dung tóm tắt
  teacherNotes: string; // Ghi chú của giáo viên
  status: LessonStatus;
  updatedAt: string;
}

export type TaskStatus = 'Chưa giao' | 'Đang thực hiện' | 'Đã hoàn thành' | 'Quá hạn';

export interface TaskItem {
  id: string;
  title: string;
  classId: string;
  className: string;
  lessonId?: string;
  lessonTitle?: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: TaskStatus;
  notes?: string;
  completedCount?: number;
  totalStudents?: number;
}

export interface StudentResultRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  taskId: string;
  taskTitle: string;
  scoreOrRating: string; // e.g. "9.0", "Đạt", "Hoàn thành Tốt"
  isCompleted: boolean;
  teacherComment: string;
  status: StudentStatus;
  updatedAt: string;
}

export type NoteCategory = 'Ghi chú tiết dạy' | 'Việc cần làm' | 'Ý tưởng bài học' | 'Ghi chú về lớp';

export interface TeacherNote {
  id: string;
  title: string;
  category: NoteCategory;
  content: string;
  date: string;
  isPinned: boolean;
  isCompleted?: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  type: 'class' | 'student' | 'lesson' | 'task' | 'result' | 'note';
}

export type ActiveTab =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'lessons'
  | 'tasks'
  | 'results'
  | 'reports'
  | 'notes'
  | 'settings';
