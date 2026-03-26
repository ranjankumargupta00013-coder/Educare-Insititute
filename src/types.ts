export interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  password?: string;
  photo?: string;
  // Student fields
  class?: string;
  section?: string;
  rollNo?: string;
  parentName?: string;
  phone?: string;
  // Teacher fields
  subject?: string;
}

export interface AttendanceRecord {
  date: string;
  records: { studentId: string; status: 'Present' | 'Absent' | 'Holiday' }[];
}

export interface MarkRecord {
  studentId: string;
  subject: string;
  marks: number;
}

export interface FeeRecord {
  studentId: string;
  total: number;
  paid: number;
  history: { date: string; amount: number }[];
}

export interface HomeworkRecord {
  id: string;
  class: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  assignedDate: string;
  file?: string; // base64 or URL
  fileName?: string;
  completedBy?: string[]; // student IDs
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  role: 'admin' | 'teacher';
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}
