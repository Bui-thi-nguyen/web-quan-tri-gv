import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  RefreshCw,
  FileCheck,
  ChevronRight,
  HelpCircle,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, StudentStatus } from '../types';

interface ExcelStudentImporterProps {
  defaultClassId?: string;
  onSuccess: (count: number, classId?: string) => void;
  onCancel: () => void;
}

interface ParsedStudentRow {
  index: number;
  fullName: string;
  studentCode: string;
  className: string;
  classId: string;
  gender: 'Nam' | 'Nữ';
  latestScore: string;
  status: StudentStatus;
  latestFeedback: string;
  notes: string;
  isValid: boolean;
  validationError?: string;
}

// Normalize Vietnamese string to help flexible column matching
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

export const ExcelStudentImporter: React.FC<ExcelStudentImporterProps> = ({
  defaultClassId,
  onSuccess,
  onCancel,
}) => {
  const { classes, batchAddStudents, showToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudentRow[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [targetClassMode, setTargetClassMode] = useState<'specific' | 'auto'>(
    defaultClassId && defaultClassId !== 'all' ? 'specific' : 'specific'
  );
  const [chosenClassId, setChosenClassId] = useState<string>(
    (defaultClassId && defaultClassId !== 'all' ? defaultClassId : classes[0]?.id) || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    try {
      const targetClass = classes.find((c) => c.id === chosenClassId) || classes[0];
      const sampleClassName = targetClass ? targetClass.name : '6A1';

      const sampleData = [
        {
          'STT': 1,
          'Mã Học Sinh': `KHTN-${sampleClassName}-01`,
          'Họ Và Tên': 'Nguyễn Văn An',
          'Lớp': sampleClassName,
          'Giới Tính': 'Nam',
          'Điểm Số / Đánh Giá': '8.5',
          'Trạng Thái Học Tập': 'Tốt',
          'Nhận Xét Của Giáo Viên': 'Nắm vững kiến thức tế bào, thực hành quan sát tốt.',
          'Ghi Chú': 'Tổ trưởng tổ 1',
        },
        {
          'STT': 2,
          'Mã Học Sinh': `KHTN-${sampleClassName}-02`,
          'Họ Và Tên': 'Trần Thị Mai Lan',
          'Lớp': sampleClassName,
          'Giới Tính': 'Nữ',
          'Điểm Số / Đánh Giá': '9.0',
          'Trạng Thái Học Tập': 'Tốt',
          'Nhận Xét Của Giáo Viên': 'Tích cực xây dựng bài, vẽ sơ đồ tư duy sinh học rất đẹp.',
          'Ghi Chú': 'Lớp phó học tập',
        },
        {
          'STT': 3,
          'Mã Học Sinh': `KHTN-${sampleClassName}-03`,
          'Họ Và Tên': 'Lê Hoàng Nam',
          'Lớp': sampleClassName,
          'Giới Tính': 'Nam',
          'Điểm Số / Đánh Giá': '7.0',
          'Trạng Thái Học Tập': 'Khá',
          'Nhận Xét Của Giáo Viên': 'Có tiến bộ trong phần bài tập chuyển động và lực.',
          'Ghi Chú': '',
        },
        {
          'STT': 4,
          'Mã Học Sinh': `KHTN-${sampleClassName}-04`,
          'Họ Và Tên': 'Phạm Quỳnh Anh',
          'Lớp': sampleClassName,
          'Giới Tính': 'Nữ',
          'Điểm Số / Đánh Giá': 'Đạt',
          'Trạng Thái Học Tập': 'Đang tiến bộ',
          'Nhận Xét Của Giáo Viên': 'Cần chuẩn bị kỹ hơn dụng cụ thí nghiệm hóa học.',
          'Ghi Chú': '',
        },
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData);

      // Set column widths for readability
      ws['!cols'] = [
        { wch: 6 },  // STT
        { wch: 16 }, // Ma HS
        { wch: 22 }, // Ho ten
        { wch: 10 }, // Lop
        { wch: 12 }, // Gioi tinh
        { wch: 20 }, // Diem
        { wch: 18 }, // Trang thai
        { wch: 45 }, // Nhan xet
        { wch: 20 }, // Ghi chu
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DanhSachHocSinh');

      XLSX.writeFile(wb, `Mau_Danh_Sach_Hoc_Sinh_KHTN_${sampleClassName}.xlsx`);
      showToast('Đã tải file Excel mẫu thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể tạo file Excel mẫu', 'error');
    }
  };

  // Parse Excel / CSV File
  const processFile = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('File không có trang tính nào hợp lệ.');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: '',
        raw: false,
      });

      if (!rawRows || rawRows.length === 0) {
        throw new Error('File Excel rỗng hoặc không có dòng dữ liệu.');
      }

      // Map raw rows into ParsedStudentRow
      const results: ParsedStudentRow[] = [];
      const defaultSelectedClass = classes.find((c) => c.id === chosenClassId) || classes[0];

      rawRows.forEach((row, idx) => {
        // Build map of normalized keys
        const normRow: Record<string, string> = {};
        Object.entries(row).forEach(([k, v]) => {
          normRow[normalizeKey(k)] = String(v).trim();
        });

        // Detect full name
        const fullName =
          normRow['hovaten'] ||
          normRow['hoten'] ||
          normRow['ten'] ||
          normRow['fullname'] ||
          normRow['hocsinh'] ||
          normRow['tenhocsinh'] ||
          '';

        if (!fullName) {
          // Skip completely empty rows or record invalid
          return;
        }

        // Detect class
        const rowClassStr =
          normRow['lop'] ||
          normRow['lophoc'] ||
          normRow['tenlop'] ||
          normRow['class'] ||
          '';

        let resolvedClass = defaultSelectedClass;
        if (targetClassMode === 'auto' && rowClassStr) {
          // Try to find matching class in app
          const found = classes.find(
            (c) =>
              c.name.toLowerCase() === rowClassStr.toLowerCase() ||
              c.name.toLowerCase().includes(rowClassStr.toLowerCase()) ||
              rowClassStr.toLowerCase().includes(c.name.toLowerCase())
          );
          if (found) {
            resolvedClass = found;
          }
        } else if (targetClassMode === 'specific') {
          const specific = classes.find((c) => c.id === chosenClassId);
          if (specific) resolvedClass = specific;
        }

        // Detect student code
        let studentCode =
          normRow['mahocsinh'] ||
          normRow['mahs'] ||
          normRow['maso'] ||
          normRow['sodinhdanh'] ||
          normRow['code'] ||
          normRow['studentcode'] ||
          '';

        if (!studentCode) {
          const clsName = resolvedClass ? resolvedClass.name : 'KHTN';
          studentCode = `KHTN-${clsName}-${String(idx + 1).padStart(2, '0')}`;
        }

        // Detect gender
        const genderRaw = (
          normRow['gioitinh'] ||
          normRow['phai'] ||
          normRow['gender'] ||
          'Nữ'
        ).toLowerCase();
        const gender: 'Nam' | 'Nữ' =
          genderRaw.includes('nam') || genderRaw === 'm' || genderRaw === 'male' ? 'Nam' : 'Nữ';

        // Detect score
        const latestScore =
          normRow['diemso'] ||
          normRow['diem'] ||
          normRow['danhgia'] ||
          normRow['diemkhtn'] ||
          normRow['diemgannhat'] ||
          normRow['score'] ||
          '8.0';

        // Detect status
        const statusRaw = (
          normRow['trangthai'] ||
          normRow['trangthaihoctap'] ||
          normRow['xeploai'] ||
          normRow['hocluc'] ||
          normRow['status'] ||
          ''
        ).toLowerCase();

        let status: StudentStatus = 'Tốt';
        if (statusRaw.includes('cần cố gắng') || statusRaw.includes('yeu') || statusRaw.includes('kém')) {
          status = 'Cần cố gắng';
        } else if (statusRaw.includes('đang tiến bộ') || statusRaw.includes('tien bo') || statusRaw.includes('trung binh')) {
          status = 'Đang tiến bộ';
        } else if (statusRaw.includes('khá') || statusRaw.includes('kha')) {
          status = 'Khá';
        } else if (statusRaw.includes('tốt') || statusRaw.includes('tot') || statusRaw.includes('gioi') || statusRaw.includes('giỏi')) {
          status = 'Tốt';
        } else {
          // If score is a number, infer
          const numScore = parseFloat(latestScore);
          if (!isNaN(numScore)) {
            if (numScore >= 8.0) status = 'Tốt';
            else if (numScore >= 6.5) status = 'Khá';
            else if (numScore >= 5.0) status = 'Đang tiến bộ';
            else status = 'Cần cố gắng';
          }
        }

        // Detect feedback
        const latestFeedback =
          normRow['nhanxet'] ||
          normRow['loiphe'] ||
          normRow['nhanxetcuaque'] ||
          normRow['nhanxetcuagiaovien'] ||
          normRow['feedback'] ||
          'Đã nhập từ file Excel.';

        // Detect notes
        const notes =
          normRow['ghichu'] ||
          normRow['note'] ||
          normRow['notes'] ||
          '';

        results.push({
          index: idx,
          fullName,
          studentCode,
          className: resolvedClass?.name || 'KHTN',
          classId: resolvedClass?.id || classes[0]?.id || '',
          gender,
          latestScore,
          status,
          latestFeedback,
          notes,
          isValid: Boolean(fullName && fullName.length >= 2),
        });
      });

      if (results.length === 0) {
        throw new Error('Không nhận diện được học sinh nào. Cô vui lòng kiểm tra lại tiêu đề cột "Họ và tên" trong file.');
      }

      setParsedStudents(results);
      // Select all valid by default
      const validSet = new Set<number>();
      results.forEach((r) => {
        if (r.isValid) validSet.add(r.index);
      });
      setSelectedIndices(validSet);
      showToast(`Đã đọc thành công ${results.length} học sinh từ file!`, 'success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi khi đọc file Excel/CSV. Vui lòng kiểm tra định dạng.');
      setParsedStudents([]);
      setSelectedIndices(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const toggleSelectRow = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === parsedStudents.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(parsedStudents.map((s) => s.index)));
    }
  };

  // Confirm Import
  const handleConfirmImport = () => {
    const toImport = parsedStudents.filter((s) => selectedIndices.has(s.index) && s.isValid);
    if (toImport.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 học sinh hợp lệ để nhập.', 'error');
      return;
    }

    const payload: Omit<Student, 'id'>[] = toImport.map((s) => ({
      fullName: s.fullName,
      studentCode: s.studentCode,
      classId: targetClassMode === 'specific' ? chosenClassId : s.classId,
      className:
        targetClassMode === 'specific'
          ? classes.find((c) => c.id === chosenClassId)?.name || s.className
          : s.className,
      gender: s.gender,
      latestScore: s.latestScore,
      latestFeedback: s.latestFeedback,
      status: s.status,
      notes: s.notes,
    }));

    batchAddStudents(payload);
    onSuccess(payload.length, targetClassMode === 'specific' ? chosenClassId : undefined);
  };

  const validCount = parsedStudents.filter((s) => s.isValid).length;
  const selectedCount = selectedIndices.size;

  return (
    <div id="excel-student-importer" className="space-y-5">
      {/* Top Banner & Instructions Toggle */}
      <div className="bg-teal-50/80 border border-teal-200/90 rounded-2xl p-4 text-xs sm:text-sm text-teal-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-teal-950">
              Nhập danh sách học sinh KHTN từ file Excel / CSV
            </p>
            <p className="text-teal-700 text-xs mt-0.5">
              Hỗ trợ file <strong className="font-semibold">.xlsx, .xls, .csv</strong>. Tự động nhận diện cột và phân lớp thông minh.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-300 text-teal-800 hover:bg-teal-100/70 font-semibold text-xs transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showInstructions ? 'Đóng hướng dẫn' : 'Xem mẫu cột'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file Excel mẫu</span>
          </button>
        </div>
      </div>

      {/* Expandable Instructions Box */}
      {showInstructions && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200/80 pb-2">
            <span>Quy chuẩn cột dữ liệu Excel giáo viên có thể dùng:</span>
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <span className="font-bold text-teal-800">1. Họ và tên *</span>
              <p className="text-slate-500 mt-0.5">Tiêu đề: <em>Họ và tên, Họ tên, Tên học sinh</em></p>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <span className="font-bold text-teal-800">2. Mã học sinh</span>
              <p className="text-slate-500 mt-0.5">Tiêu đề: <em>Mã HS, Mã số (Tự tạo nếu trống)</em></p>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <span className="font-bold text-teal-800">3. Lớp học</span>
              <p className="text-slate-500 mt-0.5">Tiêu đề: <em>Lớp, Tên lớp (VD: 6A1, 7A2, 8A1)</em></p>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <span className="font-bold text-teal-800">4. Giới tính</span>
              <p className="text-slate-500 mt-0.5">Tiêu đề: <em>Giới tính, Phái (Nam / Nữ)</em></p>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <span className="font-bold text-teal-800">5. Điểm số / Đánh giá</span>
              <p className="text-slate-500 mt-0.5">Tiêu đề: <em>Điểm, Điểm số, Đánh giá (8.5, Đạt...)</em></p>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <span className="font-bold text-teal-800">6. Nhận xét giáo viên</span>
              <p className="text-slate-500 mt-0.5">Tiêu đề: <em>Nhận xét, Lời phê của cô</em></p>
            </div>
          </div>
        </div>
      )}

      {/* Target Class Setup */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Tùy chọn phân lớp khi nhập dữ liệu
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
            targetClassMode === 'specific'
              ? 'bg-teal-50/50 border-teal-500 ring-1 ring-teal-500/20'
              : 'border-slate-200 hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              name="classMode"
              checked={targetClassMode === 'specific'}
              onChange={() => setTargetClassMode('specific')}
              className="mt-1 text-teal-600 focus:ring-teal-500"
            />
            <div className="flex-1 text-xs">
              <span className="font-bold text-slate-900 block">Nhập toàn bộ vào 1 lớp cố định</span>
              <span className="text-slate-500 block mt-0.5">
                Thích hợp khi cô nhập danh sách riêng cho từng lớp
              </span>
              {targetClassMode === 'specific' && (
                <div className="mt-2.5">
                  <select
                    value={chosenClassId}
                    onChange={(e) => setChosenClassId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name} (Khối {c.grade} - Hiện có {c.studentCount} HS)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </label>

          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
            targetClassMode === 'auto'
              ? 'bg-teal-50/50 border-teal-500 ring-1 ring-teal-500/20'
              : 'border-slate-200 hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              name="classMode"
              checked={targetClassMode === 'auto'}
              onChange={() => setTargetClassMode('auto')}
              className="mt-1 text-teal-600 focus:ring-teal-500"
            />
            <div className="flex-1 text-xs">
              <span className="font-bold text-slate-900 block">Tự động nhận diện theo cột 'Lớp' trong file</span>
              <span className="text-slate-500 block mt-0.5">
                Thích hợp cho file tổng hợp nhiều lớp (6A1, 6A2, 7A1,...)
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* File Upload / Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition ${
          dragActive
            ? 'border-teal-500 bg-teal-50/70'
            : fileName
            ? 'border-emerald-400 bg-emerald-50/30'
            : 'border-slate-300 hover:border-teal-400 bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
          id="excel-file-input"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition ${
            fileName ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white'
          }`}>
            {fileName ? <FileCheck className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              {fileName ? (
                <span className="text-emerald-700">Đã chọn file: {fileName}</span>
              ) : (
                'Kéo thả file Excel / CSV vào đây hoặc bấm để chọn file'
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Định dạng cho phép: .XLSX, .XLS, .CSV (Hỗ trợ danh sách 50 - 500 học sinh)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition min-h-[40px] cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{fileName ? 'Chọn file khác' : 'Chọn file từ máy tính'}</span>
            </button>

            {fileName && (
              <button
                type="button"
                onClick={() => {
                  setFileName(null);
                  setParsedStudents([]);
                  setSelectedIndices(new Set());
                  setErrorMsg(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition min-h-[40px] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-2xl flex items-center justify-center">
            <div className="inline-flex items-center gap-2 text-teal-700 font-semibold text-sm">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang đọc và phân tích dữ liệu học sinh...</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Không thể xử lý file Excel</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Preview Table of Parsed Students */}
      {parsedStudents.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100/80 p-3 rounded-xl">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-800">
                Xem trước dữ liệu ({parsedStudents.length} học sinh)
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-700 font-semibold">
                {validCount} hợp lệ
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-teal-700 font-semibold">
                Đã chọn {selectedCount} học sinh
              </span>
            </div>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline self-start sm:self-auto cursor-pointer"
            >
              {selectedIndices.size === parsedStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIndices.size === parsedStudents.length && parsedStudents.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                  </th>
                  <th className="py-2.5 px-3">Mã HS</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-3">Giới tính</th>
                  <th className="py-2.5 px-3">Điểm số</th>
                  <th className="py-2.5 px-3">Xếp loại</th>
                  <th className="py-2.5 px-3">Nhận xét</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {parsedStudents.map((st) => {
                  const isSelected = selectedIndices.has(st.index);
                  return (
                    <tr
                      key={st.index}
                      onClick={() => toggleSelectRow(st.index)}
                      className={`hover:bg-slate-50 transition cursor-pointer ${
                        isSelected ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(st.index)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">
                        {st.studentCode}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {st.fullName}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-700">
                        {targetClassMode === 'specific'
                          ? classes.find((c) => c.id === chosenClassId)?.name
                          : st.className}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {st.gender}
                      </td>
                      <td className="py-2 px-3 font-bold text-teal-700">
                        {st.latestScore}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.status === 'Tốt'
                            ? 'bg-emerald-50 text-emerald-800'
                            : st.status === 'Khá'
                            ? 'bg-blue-50 text-blue-800'
                            : st.status === 'Đang tiến bộ'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {st.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 max-w-[180px] truncate" title={st.latestFeedback}>
                        {st.latestFeedback}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          {parsedStudents.length > 0 ? (
            <span>Sẵn sàng lưu <strong>{selectedCount} học sinh</strong> vào cơ sở dữ liệu</span>
          ) : (
            <span>Vui lòng tải file Excel hoặc tải file mẫu để chuẩn bị dữ liệu</span>
          )}
        </p>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition min-h-[44px] cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            id="btn-confirm-import-excel"
            onClick={handleConfirmImport}
            disabled={selectedCount === 0}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition min-h-[44px] cursor-pointer ${
              selectedCount > 0
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác nhận nhập ({selectedCount} học sinh)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
