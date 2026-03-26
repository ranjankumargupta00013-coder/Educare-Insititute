import React, { useState, useEffect, Component } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  FileText, 
  CreditCard, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ChevronRight,
  Camera,
  CheckCircle,
  XCircle,
  Lock,
  BookOpen,
  Phone,
  RefreshCw,
  Bell,
  Megaphone,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { User, AttendanceRecord, MarkRecord, FeeRecord, HomeworkRecord, Notice, LeaveRequest } from './types';
import { cn } from './lib/utils';

const subjectsByClass: { [key: string]: string[] } = {
  '6': ['Maths', 'Science', 'English', 'Hindi', 'SST'],
  '7': ['Maths', 'Science', 'English', 'Hindi', 'SST'],
  '8': ['Maths', 'Science', 'English', 'Hindi', 'SST'],
  '9': ['Maths', 'Science', 'English', 'Hindi', 'SST'],
  '10': ['Maths', 'Science', 'English', 'Hindi', 'SST'],
  '11': ['Physics', 'Chemistry', 'Mathematics'],
  '12': ['Physics', 'Chemistry', 'Mathematics'],
};

// --- Components ---

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gray-50">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <XCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-secondary">Something went wrong</h1>
          <p className="text-gray-500 max-w-xs mx-auto">We encountered an unexpected error. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-pink-100"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={cn(
      "fixed bottom-24 left-4 right-4 p-4 rounded-2xl shadow-xl z-50 flex items-center gap-3",
      type === 'success' ? "bg-accent text-white" : "bg-red-500 text-white"
    )}
  >
    {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
    <span className="font-medium flex-1">{message}</span>
    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
      <XCircle size={18} />
    </button>
  </motion.div>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel }: { title: string, message: string, onConfirm: () => void, onCancel: () => void }) => (
  <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white w-full max-w-sm rounded-[32px] p-8 space-y-6 shadow-2xl"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-secondary">{title}</h3>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-500">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 font-bold text-white">Delete</button>
      </div>
    </motion.div>
  </div>
);

const Loading = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
    />
  </div>
);

const Navbar = ({ user, onLogout, notificationsCount, onShowNotifications }: { 
  user: User | null, 
  onLogout: () => void,
  notificationsCount: number,
  onShowNotifications: () => void
}) => (
  <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl overflow-hidden">
        <img src="https://picsum.photos/seed/educare/100/100" alt="Logo" className="w-full h-full object-cover" />
      </div>
      <span className="font-bold text-lg tracking-tight text-secondary">Educare</span>
    </div>
    <div className="flex items-center gap-1">
      {user && (
        <>
          <button 
            onClick={onShowNotifications}
            className="p-2 text-gray-500 hover:text-primary transition-colors relative"
          >
            <Bell size={20} />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {notificationsCount}
              </span>
            )}
          </button>
          <button onClick={onLogout} className="p-2 text-gray-500 hover:text-primary transition-colors">
            <LogOut size={20} />
          </button>
        </>
      )}
    </div>
  </nav>
);

const BottomNav = ({ role, unreadHomework, unreadNotices }: { role: string, unreadHomework: number, unreadNotices: number }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Megaphone, label: 'Notice', path: '/notices', badge: unreadNotices },
    { icon: BookOpen, label: 'Homework', path: '/homework', badge: unreadHomework },
    { icon: ClipboardList, label: 'Leave', path: '/leave' },
    { icon: FileText, label: 'Marks', path: '/marks' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center z-40 pb-safe">
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={cn(
            "bottom-nav-item flex-1 py-1",
            location.pathname === item.path ? "text-primary" : "text-gray-400"
          )}
        >
          <div className="relative inline-block">
            <item.icon size={24} />
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {item.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium block">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Pages ---

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password, role })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center text-white shadow-xl overflow-hidden">
             <img src="https://picsum.photos/seed/educare/200/200" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-secondary">Educare Institute</h1>
          <p className="text-gray-500 mt-2">Management Portal</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            {(['student', 'teacher', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize",
                  role === r ? "bg-white text-primary shadow-sm" : "text-gray-500"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'student' ? 'Roll Number' : role === 'teacher' ? 'Teacher ID' : 'Admin ID'}
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Enter ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 hover:opacity-90 transition-all flex items-center justify-center"
            >
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'Login'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [stats, setStats] = useState({ attendance: 0, marks: 0, fees: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [attRes, marksRes, feesRes, studentsRes] = await Promise.all([
          fetch('/api/attendance'),
          fetch('/api/marks'),
          fetch('/api/fees'),
          fetch('/api/students')
        ]);
        
        if (!attRes.ok || !marksRes.ok || !feesRes.ok || !studentsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const att = await attRes.json();
        const marks = await marksRes.json();
        const fees = await feesRes.json();
        const students = await studentsRes.json();

        if (user.role === 'student') {
          const studentAtt = att.flatMap((a: any) => a.records).filter((r: any) => r.studentId === user.id);
          const present = studentAtt.filter((r: any) => r.status === 'Present').length;
          const attPerc = studentAtt.length > 0 ? (present / studentAtt.length) * 100 : 0;

          const studentMarks = marks.filter((m: any) => m.studentId === user.id);
          const avgMarks = studentMarks.length > 0 ? studentMarks.reduce((acc: number, m: any) => acc + m.marks, 0) / studentMarks.length : 0;

          const studentFee = fees.find((f: any) => f.studentId === user.id);
          const feeDue = studentFee ? studentFee.total - studentFee.paid : 0;

          setStats({ attendance: Math.round(attPerc), marks: Math.round(avgMarks), fees: feeDue });
        } else {
          // Global stats for Admin/Teacher
          const allAtt = att.flatMap((a: any) => a.records);
          const present = allAtt.filter((r: any) => r.status === 'Present').length;
          const attPerc = allAtt.length > 0 ? (present / allAtt.length) * 100 : 0;

          const avgMarks = marks.length > 0 ? marks.reduce((acc: number, m: any) => acc + m.marks, 0) / marks.length : 0;

          const totalDue = fees.reduce((acc: number, f: any) => acc + (f.total - f.paid), 0);

          setStats({ attendance: Math.round(attPerc), marks: Math.round(avgMarks), fees: totalDue });
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary p-0.5">
            <img 
              src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=ec4899&color=fff`} 
              alt={user.name} 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-accent text-white p-1 rounded-full border-2 border-white">
            <CheckCircle size={12} />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-secondary">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.role === 'student' ? `Class ${user.class}-${user.section} | Roll: ${user.rollNo}` : user.subject || 'Staff'}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/attendance')}
          className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center text-center w-full"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-3">
            <Calendar size={20} />
          </div>
          <span className="text-2xl font-bold text-secondary">{stats.attendance}%</span>
          <span className="text-xs text-gray-400 font-medium">{user.role === 'student' ? 'Attendance' : 'Avg Attendance'}</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/marks')}
          className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col items-center text-center w-full"
        >
          <div className="w-10 h-10 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-3">
            <FileText size={20} />
          </div>
          <span className="text-2xl font-bold text-secondary">{stats.marks}</span>
          <span className="text-xs text-gray-400 font-medium">Avg Marks</span>
        </motion.button>
      </div>

      {/* Fees Card */}
      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/fees')}
        className="bg-secondary p-6 rounded-3xl shadow-xl text-white relative overflow-hidden w-full text-left"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">{user.role === 'student' ? 'Pending Fees' : 'Total Outstanding'}</p>
              <h3 className="text-3xl font-bold">₹{stats.fees}</h3>
            </div>
            <div className="bg-white/10 p-2 rounded-xl">
              <CreditCard size={24} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-pink-400 font-bold bg-pink-400/10 w-fit px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
            {stats.fees > 0 ? 'PAYMENT DUE' : 'ALL CLEAR'}
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      </motion.button>

      {/* Quick Actions for Students */}
      {user.role === 'student' && (
        <div className="space-y-4">
          <h3 className="font-bold text-secondary px-1">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => navigate('/teachers')} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-blue/10 text-accent-blue rounded-xl"><UserIcon size={20} /></div>
                <span className="font-semibold">My Teachers</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
            <button onClick={() => navigate('/homework')} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 text-accent rounded-xl"><BookOpen size={20} /></div>
                <span className="font-semibold">My Homework</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          </div>
        </div>
      )}

      {/* Admin/Teacher Actions */}
      {(user.role === 'admin' || user.role === 'teacher') && (
        <div className="space-y-4">
          <h3 className="font-bold text-secondary px-1">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => navigate('/attendance')} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Calendar size={20} /></div>
                <span className="font-semibold">Mark Attendance</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
            <button onClick={() => navigate('/marks')} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 text-accent rounded-xl"><FileText size={20} /></div>
                <span className="font-semibold">Update Marks</span>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
            {user.role === 'admin' && (
              <>
                <button onClick={() => navigate('/admin/students')} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-50 text-primary rounded-xl"><UserIcon size={20} /></div>
                    <span className="font-semibold">Manage Students</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </button>
                <button onClick={() => navigate('/admin/teachers')} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-blue/10 text-accent-blue rounded-xl"><UserIcon size={20} /></div>
                    <span className="font-semibold">Manage Teachers</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </button>
                <button onClick={() => navigate('/admin/reports')} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 text-accent rounded-xl"><FileText size={20} /></div>
                    <span className="font-semibold">Institute Reports</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Attendance = ({ user, showToast }: { user: User, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [records, setRecords] = useState<{ [key: string]: 'Present' | 'Absent' | 'Holiday' }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/attendance')
        ]);
        
        if (!sRes.ok || !aRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const sData = await sRes.json();
        const aData = await aRes.json();
        setStudents(sData);
        setAttendance(aData);
        
        const today = aData.find((a: any) => a.date === date);
        if (today) {
          const r: any = {};
          today.records.forEach((rec: any) => r[rec.studentId] = rec.status);
          setRecords(r);
        } else {
          setRecords({});
        }
      } catch (error) {
        console.error("Attendance fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  const handleMark = async () => {
    try {
      const payload = {
        date,
        records: Object.entries(records).map(([studentId, status]) => ({ studentId, status }))
      };
      
      if (payload.records.length === 0) {
        showToast('Please mark attendance for at least one student', 'error');
        return;
      }

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save attendance');

      showToast('Attendance marked successfully!');
    } catch (error) {
      showToast('Failed to save attendance', 'error');
    }
  };

  if (loading) return <Loading />;

  if (user.role === 'student') {
    const studentAtt = attendance.flatMap(a => a.records.filter(r => r.studentId === user.id).map(r => ({ date: a.date, status: r.status })));
    const presentCount = studentAtt.filter(a => a.status === 'Present').length;
    const attPerc = studentAtt.length > 0 ? (presentCount / studentAtt.length) * 100 : 0;

    return (
      <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 text-center">
          <div className="w-24 h-24 mx-auto mb-4 relative">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * attPerc) / 100} className="text-primary" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">{Math.round(attPerc)}%</div>
          </div>
          <h3 className="text-lg font-bold">Overall Attendance</h3>
          <p className="text-gray-400 text-sm">{presentCount} Days Present out of {studentAtt.length}</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-secondary">History</h4>
          {studentAtt.sort((a, b) => b.date.localeCompare(a.date)).map((a, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-50">
              <span className="font-medium">{format(new Date(a.date), 'dd MMM yyyy')}</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold", 
                a.status === 'Present' ? "bg-accent/10 text-accent" : 
                a.status === 'Holiday' ? "bg-blue-50 text-blue-500" : "bg-red-50 text-red-500"
              )}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mark Attendance</h2>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="bg-white px-3 py-2 rounded-xl border border-gray-100 text-sm outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {students.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-50 shadow-sm">
            <div className="flex items-center gap-3">
              <img src={s.photo || `https://ui-avatars.com/api/?name=${s.name}`} className="w-10 h-10 rounded-full" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm">{s.name}</p>
                  {s.phone && (
                    <a href={`tel:${s.phone}`} className="text-blue-500 hover:text-blue-600 p-1">
                      <Phone size={14} />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400">Roll: {s.rollNo}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setRecords({ ...records, [s.id]: 'Present' })}
                className={cn("p-2 rounded-xl transition-all", records[s.id] === 'Present' ? "bg-accent text-white" : "bg-gray-100 text-gray-400")}
              >
                <CheckCircle size={20} />
              </button>
              <button 
                onClick={() => setRecords({ ...records, [s.id]: 'Absent' })}
                className={cn("p-2 rounded-xl transition-all", records[s.id] === 'Absent' ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400")}
              >
                <XCircle size={20} />
              </button>
              <button 
                onClick={() => setRecords({ ...records, [s.id]: 'Holiday' })}
                className={cn("p-2 rounded-xl transition-all", records[s.id] === 'Holiday' ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400")}
              >
                <Calendar size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleMark}
        className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-100"
      >
        Save Attendance
      </button>
    </div>
  );
};

const Marks = ({ user, showToast }: { user: User, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState(user.role === 'student' ? user.class || '10' : '10');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subject, setSubject] = useState('Maths');
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'update' | 'report'>('update');

  const classes = ['6', '7', '8', '9', '10', '11', '12'];
  const currentSubjects = subjectsByClass[selectedClass] || subjectsByClass['10'];

  useEffect(() => {
    if (!currentSubjects.includes(subject)) {
      setSubject(currentSubjects[0]);
    }
  }, [selectedClass]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, mRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/marks')
        ]);
        
        if (!sRes.ok || !mRes.ok) {
          throw new Error('Failed to fetch data');
        }

        setStudents(await sRes.json());
        setMarks(await mRes.json());
      } catch (error) {
        console.error("Marks fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async () => {
    try {
      if (!selectedStudent || !score) {
        showToast('Please select a student and enter a score', 'error');
        return;
      }
      
      const scoreNum = Number(score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        showToast('Please enter a valid score between 0 and 100', 'error');
        return;
      }

      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent, subject, marks: scoreNum })
      });

      if (!res.ok) throw new Error('Failed to update marks');

      const mRes = await fetch('/api/marks');
      setMarks(await mRes.json());
      showToast('Marks updated successfully!');
      setScore('');
    } catch (error) {
      showToast('Failed to update marks', 'error');
    }
  };

  if (loading) return <Loading />;

  if (user.role === 'student') {
    const studentMarks = marks.filter(m => m.studentId === user.id);
    const studentSubjects = subjectsByClass[user.class || '10'] || subjectsByClass['10'];
    return (
      <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold">Academic Performance</h2>
        <div className="grid grid-cols-1 gap-4">
          {studentSubjects.map(sub => {
            const m = studentMarks.find(sm => sm.subject === sub);
            const score = m ? m.marks : 0;
            return (
              <div key={sub} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white", score < 40 ? "bg-red-400" : "bg-accent")}>
                    {sub[0]}
                  </div>
                  <div>
                    <p className="font-bold">{sub}</p>
                    <p className="text-xs text-gray-400">{score < 40 ? 'Needs Improvement' : 'Good Progress'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-secondary">{score}</span>
                  <span className="text-xs text-gray-400 block">/ 100</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const filteredStudents = students.filter(s => s.class === selectedClass);

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Marks Management</h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('update')}
            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", viewMode === 'update' ? "bg-white text-primary shadow-sm" : "text-gray-400")}
          >
            Update
          </button>
          <button 
            onClick={() => setViewMode('report')}
            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", viewMode === 'report' ? "bg-white text-primary shadow-sm" : "text-gray-400")}
          >
            Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedStudent('');
            }}
            className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none shadow-sm font-medium"
          >
            {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Subject</label>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-4 bg-white rounded-2xl border border-gray-100 outline-none shadow-sm font-medium"
          >
            {currentSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {viewMode === 'update' ? (
        <div className="bg-white p-6 rounded-3xl space-y-4 shadow-sm border border-gray-50">
          <h3 className="font-bold text-secondary">Update Student Marks</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Select Student</label>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 outline-none bg-gray-50"
            >
              <option value="">Choose Student</option>
              {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Marks (Out of 100)</label>
            <input 
              type="number" 
              value={score} 
              onChange={(e) => setScore(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 outline-none bg-gray-50"
              placeholder="Enter marks"
              max="100"
              min="0"
            />
          </div>
          <button 
            onClick={handleUpdate}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-100"
          >
            Update Marks
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-bold text-secondary">Class {selectedClass} - {subject} Report</h3>
          <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Roll</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4 text-right">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No students found in this class</td>
                  </tr>
                ) : (
                  filteredStudents.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '')).map(s => {
                    const m = marks.find(mark => mark.studentId === s.id && mark.subject === subject);
                    const score = m ? m.marks : '-';
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-400 text-xs">{s.rollNo}</td>
                        <td className="px-6 py-4 font-bold text-secondary text-sm">{s.name}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "font-black text-lg",
                            score === '-' ? "text-gray-200" : Number(score) < 40 ? "text-red-500" : "text-accent"
                          )}>
                            {score}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const Fees = ({ user, showToast }: { user: User, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');
  const [editTotal, setEditTotal] = useState<{ studentId: string, total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, sRes] = await Promise.all([
          fetch('/api/fees'),
          fetch('/api/students')
        ]);
        
        if (!fRes.ok || !sRes.ok) {
          throw new Error('Failed to fetch data');
        }

        setFees(await fRes.json());
        setStudents(await sRes.json());
      } catch (error) {
        console.error("Fees fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePay = async () => {
    try {
      if (!selectedStudent || !amount) {
        showToast('Please select a student and enter an amount', 'error');
        return;
      }
      
      const amountNum = Number(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        showToast('Please enter a valid positive amount', 'error');
        return;
      }

      const res = await fetch('/api/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent, amount: amountNum, date: format(new Date(), 'yyyy-MM-dd') })
      });

      if (!res.ok) throw new Error('Failed to record payment');

      const fRes = await fetch('/api/fees');
      setFees(await fRes.json());
      setAmount('');
      showToast('Payment recorded successfully!');
    } catch (error) {
      showToast('Failed to record payment', 'error');
    }
  };

  const handleUpdateTotal = async () => {
    try {
      if (!editTotal) return;
      
      if (editTotal.total < 0) {
        showToast('Total fee cannot be negative', 'error');
        return;
      }

      const res = await fetch(`/api/fees/${editTotal.studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: editTotal.total })
      });

      if (!res.ok) throw new Error('Failed to update fee structure');

      const fRes = await fetch('/api/fees');
      setFees(await fRes.json());
      setEditTotal(null);
      showToast('Fee structure updated!');
    } catch (error) {
      showToast('Failed to update fee structure', 'error');
    }
  };

  const handleRemind = async (studentId: string) => {
    try {
      const res = await fetch('/api/fees/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      if (!res.ok) throw new Error('Failed to send reminder');
      showToast('Fee reminder sent successfully!');
    } catch (error) {
      showToast('Failed to send reminder', 'error');
    }
  };

  if (loading) return <Loading />;

  if (user.role === 'student') {
    const studentFee = fees.find(f => f.studentId === user.id);
    if (!studentFee) return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <CreditCard size={32} />
        </div>
        <p className="text-gray-500">No fee record found for your account.</p>
      </div>
    );

    const due = studentFee.total - studentFee.paid;

    return (
      <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
        <div className="bg-secondary p-8 rounded-[40px] text-white relative overflow-hidden">
          <p className="text-gray-400 font-medium">Remaining Balance</p>
          <h2 className="text-4xl font-black mt-1">₹{due}</h2>
          <div className="mt-6 flex gap-4">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Total Fees</p>
              <p className="font-bold">₹{studentFee.total}</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Paid</p>
              <p className="font-bold text-accent">₹{studentFee.paid}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-secondary">Payment History</h3>
          {studentFee.history.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No payments made yet.</p>
          ) : (
            studentFee.history.sort((a, b) => b.date.localeCompare(a.date)).map((h, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl flex justify-between items-center border border-gray-50 shadow-sm">
                <div>
                  <p className="font-bold text-secondary">₹{h.amount}</p>
                  <p className="text-xs text-gray-400">{format(new Date(h.date), 'dd MMM yyyy')}</p>
                </div>
                <div className="bg-accent/10 text-accent p-2 rounded-full">
                  <CheckCircle size={16} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Fees Management</h2>
      {user.role === 'admin' && (
        <div className="bg-white p-6 rounded-3xl space-y-4 shadow-sm border border-gray-50">
          <h3 className="font-bold text-secondary">Record Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Choose Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount Paid</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Enter amount"
                min="0"
              />
            </div>
          </div>
          <button 
            onClick={handlePay}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-100"
          >
            Record Payment
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-bold text-secondary">Student Fee Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fees.map(f => {
            const s = students.find(st => st.id === f.studentId);
            const due = f.total - f.paid;
            return (
              <div key={f.studentId} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{s?.name || 'Unknown'}</p>
                    {s?.phone && (
                      <a href={`tel:${s.phone}`} className="text-blue-500 hover:text-blue-600 p-1">
                        <Phone size={14} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                     <p className="text-xs text-gray-400">Total: ₹{f.total} | Due: ₹{due}</p>
                     {user.role === 'admin' && (
                       <button onClick={() => setEditTotal({ studentId: f.studentId, total: f.total })} className="text-accent p-1 hover:bg-accent/10 rounded-lg transition-all"><Edit size={14} /></button>
                     )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", due === 0 ? "bg-accent/10 text-accent" : "bg-red-50 text-red-500")}>
                    {due === 0 ? 'Paid' : 'Pending'}
                  </div>
                  {due > 0 && (user.role === 'admin' || user.role === 'teacher') && (
                    <button 
                      onClick={() => handleRemind(f.studentId)}
                      className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-all"
                      title="Send Fee Reminder"
                    >
                      <Phone size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {editTotal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 space-y-6"
            >
              <h3 className="text-xl font-bold">Edit Total Fee</h3>
              <input 
                type="number" 
                value={editTotal.total} 
                onChange={e => setEditTotal({...editTotal, total: Number(e.target.value)})}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setEditTotal(null)} className="flex-1 py-3 rounded-2xl font-bold bg-gray-100">Cancel</button>
                <button onClick={handleUpdateTotal} className="flex-1 py-3 rounded-2xl font-bold bg-primary text-white">Update</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Profile = ({ user, onLogout, showToast }: { user: User, onLogout: () => void, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [error, setError] = useState('');

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!oldPass || !newPass) {
      setError('Please fill in all fields');
      return;
    }

    if (newPass.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, oldPassword: oldPass, newPassword: newPass })
      });
      
      if (!res.ok) throw new Error('Failed to change password');

      const data = await res.json();
      if (data.success) {
        showToast('Password changed successfully!');
        setShowChangePass(false);
        setOldPass('');
        setNewPass('');
      } else {
        setError(data.message);
        showToast(data.message, 'error');
      }
    } catch (err) {
      setError('Connection error');
      showToast('Connection error', 'error');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be less than 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const endpoint = user.role === 'student' ? `/api/students/${user.id}` : `/api/teachers/${user.id}`;
          const res = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo: base64 })
          });
          
          if (!res.ok) throw new Error('Failed to update photo');
          
          showToast('Photo updated successfully!');
        } catch (error) {
          showToast('Failed to update photo', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast('Error reading file', 'error');
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full border-4 border-primary p-1">
            <img 
              src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=ec4899&color=fff`} 
              alt={user.name} 
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <label className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full border-2 border-white cursor-pointer shadow-lg">
            <Camera size={20} />
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>
        <h2 className="text-2xl font-bold text-secondary">{user.name}</h2>
        <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px] mt-1">{user.role}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-50 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center"><UserIcon size={20} /></div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase">ID Number</p>
            <p className="font-semibold">{user.id}</p>
          </div>
        </div>
        {user.role === 'student' && (
          <>
            <div className="p-4 border-b border-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center"><Home size={20} /></div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Class & Section</p>
                <p className="font-semibold">{user.class} - {user.section}</p>
              </div>
            </div>
            <div className="p-4 border-b border-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center"><UserIcon size={20} /></div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Parent Name</p>
                <p className="font-semibold">{user.parentName}</p>
              </div>
            </div>
          </>
        )}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center"><CreditCard size={20} /></div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Phone</p>
            <p className="font-semibold">{user.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => setShowChangePass(!showChangePass)}
          className="w-full bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between font-semibold text-secondary"
        >
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-gray-400" />
            Change Password
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </button>

        {showChangePass && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleChangePass} 
            className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4"
          >
            <input 
              type="password" 
              placeholder="Old Password" 
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none"
              required
            />
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 outline-none"
              required
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="w-full bg-secondary text-white py-3 rounded-xl font-bold">Update Password</button>
          </motion.form>
        )}

        <button 
          onClick={onLogout}
          className="w-full bg-red-50 text-red-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

const AdminStudents = ({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [newStudent, setNewStudent] = useState<Partial<User>>({
    id: '', name: '', class: '10', section: 'A', rollNo: '', parentName: '', phone: '', photo: ''
  });

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const resetFilters = () => {
    setSearch('');
    setClassFilter('');
    setSectionFilter('');
    setStatusFilter('');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, fRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/fees')
      ]);
      if (!sRes.ok || !fRes.ok) throw new Error('Failed to fetch data');
      const [sData, fData] = await Promise.all([sRes.json(), fRes.json()]);
      setStudents(sData);
      setFees(fData);
    } catch (err) {
      showToast('Failed to load students data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.id || !newStudent.rollNo || !newStudent.class || !newStudent.section) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const method = editingStudent ? 'PUT' : 'POST';
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });

      if (!res.ok) throw new Error('Failed to save student');

      await fetchData();
      setShowAdd(false);
      setEditingStudent(null);
      setNewStudent({ id: '', name: '', class: '10', section: 'A', rollNo: '', parentName: '', phone: '', photo: '' });
      showToast(editingStudent ? 'Student updated successfully!' : 'Student added successfully!');
    } catch (err) {
      showToast('Error saving student', 'error');
    }
  };

  const handleEdit = (student: User) => {
    setEditingStudent(student);
    setNewStudent(student);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setStudents(students.filter(s => s.id !== id));
      setConfirmDelete(null);
      showToast('Student removed successfully!');
    } catch (err) {
      showToast('Failed to delete student', 'error');
    }
  };

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo?.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter ? s.class === classFilter : true;
    const matchesSection = sectionFilter ? s.section === sectionFilter : true;
    
    let matchesStatus = true;
    if (statusFilter === 'pending_fees') {
      const fee = fees.find(f => f.studentId === s.id);
      matchesStatus = fee ? (fee.total - fee.paid) > 0 : false;
    } else if (statusFilter === 'paid_fees') {
      const fee = fees.find(f => f.studentId === s.id);
      matchesStatus = fee ? (fee.total - fee.paid) === 0 : false;
    }

    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  if (loading) return <Loading />;

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Students</h2>
        <div className="flex gap-2">
          <button onClick={resetFilters} className="text-gray-400 p-2 hover:text-primary transition-colors" title="Reset Filters">
            <RefreshCw size={20} />
          </button>
          <button onClick={() => setShowAdd(true)} className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-pink-100">
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-500 px-1">Search Students</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or roll..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <select 
          value={classFilter} 
          onChange={(e) => setClassFilter(e.target.value)}
          className="p-3 rounded-xl bg-white border border-gray-100 text-xs outline-none shadow-sm font-medium"
        >
          <option value="">All Classes</option>
          {['6', '7', '8', '9', '10'].map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select 
          value={sectionFilter} 
          onChange={(e) => setSectionFilter(e.target.value)}
          className="p-3 rounded-xl bg-white border border-gray-100 text-xs outline-none shadow-sm font-medium"
        >
          <option value="">All Sections</option>
          {['A', 'B', 'C'].map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 rounded-xl bg-white border border-gray-100 text-xs outline-none shadow-sm font-medium"
        >
          <option value="">All Status</option>
          <option value="pending_fees">Pending Fees</option>
          <option value="paid_fees">Fees Paid</option>
        </select>
      </div>

      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-secondary">Student List</h3>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {filtered.length} {filtered.length === 1 ? 'Student' : 'Students'}
        </span>
      </div>

      <div className="space-y-3">
        {filtered.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={s.photo || `https://ui-avatars.com/api/?name=${s.name}`} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-secondary">{s.name}</p>
                <p className="text-xs text-gray-400">Class {s.class}-{s.section} | Roll: {s.rollNo}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {s.phone && (
                <a href={`tel:${s.phone}`} className="p-2 text-blue-500 bg-blue-50 rounded-xl">
                  <Phone size={18} />
                </a>
              )}
              <button onClick={() => handleEdit(s)} className="p-2 text-accent bg-accent/10 rounded-xl"><Edit size={18} /></button>
              <button onClick={() => setConfirmDelete(s.id)} className="p-2 text-red-500 bg-red-50 rounded-xl"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal 
          title="Delete Student" 
          message="Are you sure you want to remove this student? This action cannot be undone."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
                <button onClick={() => { setShowAdd(false); setEditingStudent(null); }} className="text-gray-400"><XCircle size={24} /></button>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-primary p-1">
                    <img 
                      src={newStudent.photo || `https://ui-avatars.com/api/?name=${newStudent.name || 'Student'}&background=ec4899&color=fff`} 
                      alt="Preview" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-2 border-white cursor-pointer shadow-lg">
                    <Camera size={16} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setNewStudent({ ...newStudent, photo: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>
              <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4">
                <input placeholder="Student Name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required />
                <div className="grid grid-cols-2 gap-4">
                   <input placeholder="ID Number" value={newStudent.id} onChange={e => setNewStudent({...newStudent, id: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required disabled={!!editingStudent} />
                   <input placeholder="Roll Number" value={newStudent.rollNo} onChange={e => setNewStudent({...newStudent, rollNo: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input placeholder="Class (6-12)" value={newStudent.class} onChange={e => setNewStudent({...newStudent, class: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required />
                   <input placeholder="Section" value={newStudent.section} onChange={e => setNewStudent({...newStudent, section: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required />
                </div>
                <input placeholder="Parent Name" value={newStudent.parentName} onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required />
                <input placeholder="Phone Number" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required />
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-pink-100">{editingStudent ? 'Update Student' : 'Create Student'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminTeachers = ({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [newTeacher, setNewTeacher] = useState<Partial<User>>({
    id: '', name: '', subject: 'Maths', phone: '', photo: ''
  });

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teachers');
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      showToast('Failed to load teachers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.id || !newTeacher.subject) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const method = editingTeacher ? 'PUT' : 'POST';
      const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : '/api/teachers';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher)
      });

      if (!res.ok) throw new Error('Failed to save teacher');

      await fetchTeachers();
      setShowAdd(false);
      setEditingTeacher(null);
      setNewTeacher({ id: '', name: '', subject: 'Maths', phone: '', photo: '' });
      showToast(editingTeacher ? 'Teacher updated successfully!' : 'Teacher added successfully!');
    } catch (err) {
      showToast('Error saving teacher', 'error');
    }
  };

  const handleEdit = (teacher: User) => {
    setEditingTeacher(teacher);
    setNewTeacher(teacher);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setTeachers(teachers.filter(t => t.id !== id));
      setConfirmDelete(null);
      showToast('Teacher removed successfully!');
    } catch (err) {
      showToast('Failed to delete teacher', 'error');
    }
  };

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loading />;

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Teachers</h2>
        <button onClick={() => setShowAdd(true)} className="bg-accent-blue text-white p-2 rounded-xl shadow-lg shadow-blue-100">
          <Plus size={24} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={t.photo || `https://ui-avatars.com/api/?name=${t.name}`} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-secondary">{t.name}</p>
                <p className="text-xs text-gray-400">{t.subject} | ID: {t.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {t.phone && (
                <a href={`tel:${t.phone}`} className="p-2 text-blue-500 bg-blue-50 rounded-xl">
                  <Phone size={18} />
                </a>
              )}
              <button onClick={() => handleEdit(t)} className="p-2 text-accent-blue bg-accent-blue/10 rounded-xl"><Edit size={18} /></button>
              <button onClick={() => setConfirmDelete(t.id)} className="p-2 text-red-500 bg-red-50 rounded-xl"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal 
          title="Delete Teacher" 
          message="Are you sure you want to remove this teacher? This action cannot be undone."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
                <button onClick={() => { setShowAdd(false); setEditingTeacher(null); }} className="text-gray-400"><XCircle size={24} /></button>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-accent-blue p-1">
                    <img 
                      src={newTeacher.photo || `https://ui-avatars.com/api/?name=${newTeacher.name || 'Teacher'}&background=3b82f6&color=fff`} 
                      alt="Preview" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <label className="absolute bottom-0 right-0 bg-accent-blue text-white p-2 rounded-full border-2 border-white cursor-pointer shadow-lg">
                    <Camera size={16} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setNewTeacher({ ...newTeacher, photo: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>
              <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4">
                <input placeholder="Teacher Name" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required />
                <input placeholder="Teacher ID" value={newTeacher.id} onChange={e => setNewTeacher({...newTeacher, id: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required disabled={!!editingTeacher} />
                <input placeholder="Subject" value={newTeacher.subject} onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required />
                <input placeholder="Phone Number" value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} className="p-4 bg-gray-50 rounded-2xl border-none outline-none" required />
                <button type="submit" className="w-full bg-accent-blue text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100">{editingTeacher ? 'Update Teacher' : 'Create Teacher'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Homework = ({ user, showToast, onVisit }: { user: User, showToast: (m: string, t?: 'success' | 'error') => void, onVisit?: () => void }) => {
  const [homework, setHomework] = useState<HomeworkRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingHW, setEditingHW] = useState<HomeworkRecord | null>(null);
  const [newHW, setNewHW] = useState<Partial<HomeworkRecord>>({
    class: '10', subject: 'Maths', title: '', description: '', dueDate: '', assignedDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(true);

  const fetchHomework = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/homework');
      if (!res.ok) throw new Error('Failed to fetch homework');
      const data = await res.json();
      setHomework(data);
    } catch (err) {
      showToast('Failed to load homework', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
    if (onVisit) onVisit();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHW.class || !newHW.subject || !newHW.title || !newHW.description || !newHW.dueDate) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const method = editingHW ? 'PUT' : 'POST';
      const url = editingHW ? `/api/homework/${editingHW.id}` : '/api/homework';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newHW, 
          id: editingHW ? editingHW.id : Date.now().toString(),
          createdAt: editingHW ? editingHW.createdAt : format(new Date(), 'yyyy-MM-dd'),
          completedBy: editingHW ? editingHW.completedBy : []
        })
      });
      
      if (!res.ok) throw new Error('Failed to save homework');

      await fetchHomework();
      setShowAdd(false);
      setEditingHW(null);
      setNewHW({ class: '10', subject: 'Maths', title: '', description: '', dueDate: '', assignedDate: format(new Date(), 'yyyy-MM-dd') });
      showToast(editingHW ? 'Homework updated successfully!' : 'Homework posted successfully!');
    } catch (err) {
      showToast('Error saving homework', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/homework/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setHomework(homework.filter(h => h.id !== id));
      showToast('Homework deleted!');
    } catch (err) {
      showToast('Failed to delete homework', 'error');
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/homework/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id })
      });
      if (!res.ok) throw new Error('Failed to mark complete');
      await fetchHomework();
      showToast('Homework marked as completed!', 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewHW({ ...newHW, file: reader.result as string, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <Loading />;

  const filtered = user.role === 'student' ? homework.filter(h => h.class === user.class) : homework;

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Homework</h2>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <button 
            onClick={() => {
              setEditingHW(null);
              setNewHW({ class: '10', subject: 'Maths', title: '', description: '', dueDate: '', assignedDate: format(new Date(), 'yyyy-MM-dd') });
              setShowAdd(true);
            }} 
            className="bg-accent text-white px-4 py-2 rounded-xl shadow-lg shadow-pink-100 flex items-center gap-2 font-bold"
          >
            <Plus size={20} />
            Add Homework
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-50 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto">
              <BookOpen size={32} />
            </div>
            <p className="text-gray-400 font-medium">No homework assigned yet</p>
          </div>
        ) : (
          filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(h => {
            const isCompleted = h.completedBy?.includes(user.id);
            const isOverdue = new Date(h.dueDate) < new Date() && !isCompleted;
            
            return (
              <motion.div 
                key={h.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-white p-6 rounded-3xl border shadow-sm space-y-4 transition-all",
                  isCompleted ? "border-green-200 bg-green-50/30" : isOverdue ? "border-red-200" : "border-gray-50"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-1 rounded-full uppercase tracking-wider">{h.subject}</span>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">Class {h.class}</span>
                      {isCompleted && <span className="text-[10px] font-bold text-green-500 bg-green-100 px-2 py-1 rounded-full uppercase tracking-wider">Completed</span>}
                      {isOverdue && <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full uppercase tracking-wider">Overdue</span>}
                    </div>
                    <h3 className="text-lg font-bold text-secondary">{h.title}</h3>
                  </div>
                  {(user.role === 'admin' || user.role === 'teacher') && (
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-[10px] font-bold text-secondary">{h.completedBy?.length || 0} Done</span>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingHW(h);
                          setNewHW(h);
                          setShowAdd(true);
                        }} 
                        className="text-accent-blue p-2 bg-blue-50 rounded-xl"
                      >
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(h.id)} className="text-red-400 p-2 bg-red-50 rounded-xl">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{h.description}</p>

                {h.file && (
                  <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <FileText size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-secondary truncate max-w-[150px]">{h.fileName || 'Attachment'}</p>
                        <p className="text-[10px] text-gray-400">PDF/Image Attachment</p>
                      </div>
                    </div>
                    <a 
                      href={h.file} 
                      download={h.fileName || 'homework-attachment'}
                      className="text-xs font-bold text-primary bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100"
                    >
                      Download
                    </a>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Assigned</p>
                      <p className="text-xs font-bold text-secondary">{h.assignedDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Deadline</p>
                      <p className="text-xs font-bold text-red-500">{h.dueDate}</p>
                    </div>
                  </div>
                  
                  {user.role === 'student' && !isCompleted && (
                    <button 
                      onClick={() => handleMarkComplete(h.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-green-100"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">{editingHW ? 'Edit Homework' : 'Assign Homework'}</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-400"><XCircle size={24} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Class</label>
                    <select 
                      value={newHW.class} 
                      onChange={e => setNewHW({...newHW, class: e.target.value, subject: subjectsByClass[e.target.value][0]})} 
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium" 
                      required
                    >
                      {Object.keys(subjectsByClass).map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Subject</label>
                    <select 
                      value={newHW.subject} 
                      onChange={e => setNewHW({...newHW, subject: e.target.value})} 
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium" 
                      required
                    >
                      {subjectsByClass[newHW.class || '10'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Title</label>
                  <input placeholder="Homework Title" value={newHW.title} onChange={e => setNewHW({...newHW, title: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Description</label>
                  <textarea placeholder="Detailed instructions..." value={newHW.description} onChange={e => setNewHW({...newHW, description: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none h-32 resize-none font-medium" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Assigned Date</label>
                    <input type="date" value={newHW.assignedDate} onChange={e => setNewHW({...newHW, assignedDate: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Deadline Date</label>
                    <input type="date" value={newHW.dueDate} onChange={e => setNewHW({...newHW, dueDate: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium" required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Attachment (Optional)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="w-full p-4 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200 outline-none text-sm text-gray-400 file:hidden cursor-pointer" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Plus size={20} className="text-gray-300" />
                    </div>
                  </div>
                  {newHW.fileName && <p className="text-[10px] text-primary font-bold px-1">Selected: {newHW.fileName}</p>}
                </div>

                <button type="submit" className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-pink-100">
                  {editingHW ? 'Update Homework' : 'Assign Now'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeachersList = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/teachers').then(res => res.json()).then(data => {
      setTeachers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subject?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-2xl font-bold">My Teachers</h2>
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or subject..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={t.photo || `https://ui-avatars.com/api/?name=${t.name}`} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-secondary">{t.name}</p>
                <p className="text-xs text-gray-400">{t.subject}</p>
              </div>
            </div>
            {t.phone && (
              <a href={`tel:${t.phone}`} className="p-3 text-blue-500 bg-blue-50 rounded-2xl shadow-sm">
                <Phone size={20} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminReports = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, aRes, mRes, fRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/attendance'),
          fetch('/api/marks'),
          fetch('/api/fees')
        ]);
        
        if (!sRes.ok || !aRes.ok || !mRes.ok || !fRes.ok) {
          throw new Error('Failed to fetch data');
        }

        setStudents(await sRes.json());
        setAttendance(await aRes.json());
        setMarks(await mRes.json());
        setFees(await fRes.json());
      } catch (error) {
        console.error("AdminReports fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  if (students.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <UserIcon size={32} />
        </div>
        <p className="text-gray-500">No student data available to generate reports.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Institute Reports</h2>
      
      <div className="space-y-4">
        <h3 className="font-bold text-secondary">Student Performance & Fees</h3>
        <div className="space-y-3">
          {students.map(s => {
            const sMarks = marks.filter(m => m.studentId === s.id);
            const avgMarks = sMarks.length > 0 ? Math.round(sMarks.reduce((acc, m) => acc + m.marks, 0) / sMarks.length) : 0;
            const sFee = fees.find(f => f.studentId === s.id);
            const due = sFee ? sFee.total - sFee.paid : 0;
            const sAtt = attendance.flatMap(a => a.records).filter(r => r.studentId === s.id);
            const attPerc = sAtt.length > 0 ? Math.round((sAtt.filter(r => r.status === 'Present').length / sAtt.length) * 100) : 0;

            return (
              <div key={s.id} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={s.photo || `https://ui-avatars.com/api/?name=${s.name}`} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-bold text-secondary">{s.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase">Roll: {s.rollNo} | Class {s.class}</p>
                    </div>
                  </div>
                  {avgMarks < 40 && avgMarks > 0 && (
                    <div className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                      Needs Attention
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 p-2 rounded-xl text-center">
                    <p className="text-[8px] text-blue-400 font-bold uppercase">Att.</p>
                    <p className={cn("font-bold text-sm", attPerc < 75 ? "text-red-500" : "text-blue-600")}>{attPerc}%</p>
                  </div>
                  <div className="bg-accent/10 p-2 rounded-xl text-center">
                    <p className="text-[8px] text-accent font-bold uppercase">Avg.</p>
                    <p className="font-bold text-sm text-accent">{avgMarks}</p>
                  </div>
                  <div className="bg-pink-50 p-2 rounded-xl text-center">
                    <p className="text-[8px] text-primary font-bold uppercase">Due</p>
                    <p className={cn("font-bold text-sm", due > 0 ? "text-primary" : "text-accent")}>₹{due}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Notices = ({ user, showToast, onVisit }: { user: User, showToast: (m: string, t?: 'success' | 'error') => void, onVisit?: () => void }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      if (res.ok) setNotices(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    onVisit?.();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newNotice,
          date: format(new Date(), 'yyyy-MM-dd'),
          author: user.name,
          role: user.role
        })
      });
      if (res.ok) {
        showToast('Notice posted successfully!');
        setNewNotice({ title: '', content: '' });
        setShowAdd(false);
        fetchNotices();
      }
    } catch (err) {
      showToast('Failed to post notice', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Notice deleted');
        fetchNotices();
      }
    } catch (err) {
      showToast('Failed to delete notice', 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notice Board</h2>
        {(user.role === 'admin' || user.role === 'teacher') && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-pink-100 flex items-center gap-2 font-bold text-sm"
          >
            <Plus size={20} /> Post Notice
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
            <Megaphone className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-400">No notices yet</p>
          </div>
        ) : (
          notices.sort((a, b) => b.id.localeCompare(a.id)).map(notice => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={notice.id} 
              className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-secondary">{notice.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {format(new Date(notice.date), 'MMMM dd, yyyy')} • By {notice.author} ({notice.role})
                  </p>
                </div>
                {(user.role === 'admin' || (user.role === 'teacher' && notice.author === user.name)) && (
                  <button onClick={() => handleDelete(notice.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{notice.content}</p>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Post New Notice</h3>
                <button onClick={() => setShowAdd(false)} className="text-gray-400"><XCircle size={24} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Title</label>
                  <input 
                    placeholder="Notice Title" 
                    value={newNotice.title} 
                    onChange={e => setNewNotice({...newNotice, title: e.target.value})} 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Content</label>
                  <textarea 
                    placeholder="Write your notice here..." 
                    value={newNotice.content} 
                    onChange={e => setNewNotice({...newNotice, content: e.target.value})} 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium min-h-[150px]" 
                    required 
                  />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-pink-100">
                  Post Notice
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Leave = ({ user, showToast }: { user: User, showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showApply, setShowApply] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newLeave, setNewLeave] = useState({ startDate: '', endDate: '', reason: '' });

  const fetchLeaves = async () => {
    try {
      const res = await fetch('/api/leaves');
      if (res.ok) setLeaves(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLeave,
          studentId: user.id,
          studentName: user.name,
          class: user.class || 'N/A'
        })
      });
      if (res.ok) {
        showToast('Leave application submitted!');
        setNewLeave({ startDate: '', endDate: '', reason: '' });
        setShowApply(false);
        fetchLeaves();
      }
    } catch (err) {
      showToast('Failed to submit application', 'error');
    }
  };

  const handleStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Leave ${status}`);
        fetchLeaves();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) return <Loading />;

  const myLeaves = leaves.filter(l => l.studentId === user.id);
  const pendingLeaves = leaves.filter(l => l.status === 'Pending');

  return (
    <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leave Management</h2>
        {user.role === 'student' && (
          <button 
            onClick={() => setShowApply(true)}
            className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-pink-100 flex items-center gap-2 font-bold text-sm"
          >
            <Plus size={20} /> Apply Leave
          </button>
        )}
      </div>

      {user.role === 'student' ? (
        <div className="space-y-4">
          <h3 className="font-bold text-secondary px-1">My Applications</h3>
          {myLeaves.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
              <ClipboardList className="mx-auto text-gray-300 mb-2" size={48} />
              <p className="text-gray-400">No leave applications yet</p>
            </div>
          ) : (
            myLeaves.sort((a, b) => b.id.localeCompare(a.id)).map(leave => (
              <div key={leave.id} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    leave.status === 'Pending' ? "bg-yellow-100 text-yellow-600" :
                    leave.status === 'Approved' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {leave.status}
                  </span>
                  <p className="text-[10px] text-gray-400 font-bold">{format(new Date(leave.appliedDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Duration</p>
                  <p className="font-bold text-secondary">{format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Reason</p>
                  <p className="text-sm text-gray-600">{leave.reason}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-secondary px-1">Pending Requests</h3>
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
              <CheckCircle className="mx-auto text-gray-300 mb-2" size={48} />
              <p className="text-gray-400">No pending requests</p>
            </div>
          ) : (
            pendingLeaves.map(leave => (
              <div key={leave.id} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 text-accent rounded-full flex items-center justify-center font-bold">
                      {leave.studentName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-secondary">{leave.studentName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Class {leave.class}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold">{format(new Date(leave.appliedDate), 'MMM dd')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">Reason</p>
                  <p className="text-sm text-gray-700">{leave.reason}</p>
                  <p className="text-xs font-bold text-primary">
                    {format(new Date(leave.startDate), 'MMM dd')} to {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleStatus(leave.id, 'Approved')}
                    className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-green-100"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatus(leave.id, 'Rejected')}
                    className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-red-100"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {showApply && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Apply for Leave</h3>
                <button onClick={() => setShowApply(false)} className="text-gray-400"><XCircle size={24} /></button>
              </div>
              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Start Date</label>
                    <input 
                      type="date" 
                      value={newLeave.startDate} 
                      onChange={e => setNewLeave({...newLeave, startDate: e.target.value})} 
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase px-1">End Date</label>
                    <input 
                      type="date" 
                      value={newLeave.endDate} 
                      onChange={e => setNewLeave({...newLeave, endDate: e.target.value})} 
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Reason</label>
                  <textarea 
                    placeholder="Why do you need leave?" 
                    value={newLeave.reason} 
                    onChange={e => setNewLeave({...newLeave, reason: e.target.value})} 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-medium min-h-[100px]" 
                    required 
                  />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-pink-100">
                  Submit Application
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [unreadHomework, setUnreadHomework] = useState(0);
  const [unreadNotices, setUnreadNotices] = useState(0);
  const [notifications, setNotifications] = useState<{ id: string, title: string, message: string, time: string, read: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'identify',
        userId: user.id,
        role: user.role,
        class: user.class
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_homework') {
          showToast(`📚 New Homework: ${data.homework.subject}`, 'success');
          setUnreadHomework(prev => prev + 1);
          setNotifications(prev => [{
            id: Date.now().toString(),
            title: 'New Homework',
            message: `New homework assigned for ${data.homework.subject}`,
            time: format(new Date(), 'hh:mm a'),
            read: false
          }, ...prev]);
        } else if (data.type === 'new_notice') {
          showToast(`📢 New Notice: ${data.notice.title}`, 'success');
          setUnreadNotices(prev => prev + 1);
          setNotifications(prev => [{
            id: Date.now().toString(),
            title: 'New Notice',
            message: data.notice.title,
            time: format(new Date(), 'hh:mm a'),
            read: false
          }, ...prev]);
        } else if (data.type === 'fee_reminder') {
          showToast(`💰 ${data.message}`, 'error');
          setNotifications(prev => [{
            id: Date.now().toString(),
            title: 'Fee Reminder',
            message: data.message,
            time: format(new Date(), 'hh:mm a'),
            read: false
          }, ...prev]);
        }
      } catch (e) {
        console.error('WS Message Error:', e);
      }
    };

    return () => ws.close();
  }, [user]);

  useEffect(() => {
    const savedUser = localStorage.getItem('educare_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('educare_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('educare_user');
  };

  if (loading) return <Loading />;

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 max-w-5xl mx-auto relative shadow-2xl overflow-hidden">
          {!user ? (
            <Login onLogin={handleLogin} />
          ) : (
            <>
              <Navbar 
                user={user} 
                onLogout={handleLogout} 
                notificationsCount={notifications.filter(n => !n.read).length}
                onShowNotifications={() => setShowNotifications(true)}
              />
              <main className="min-h-[calc(100vh-120px)] overflow-x-hidden">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard user={user} />} />
                  <Route path="/attendance" element={<Attendance user={user} showToast={showToast} />} />
                  <Route path="/homework" element={<Homework user={user} showToast={showToast} onVisit={() => setUnreadHomework(0)} />} />
                  <Route path="/notices" element={<Notices user={user} showToast={showToast} onVisit={() => setUnreadNotices(0)} />} />
                  <Route path="/leave" element={<Leave user={user} showToast={showToast} />} />
                  <Route path="/marks" element={<Marks user={user} showToast={showToast} />} />
                  <Route path="/fees" element={<Fees user={user} showToast={showToast} />} />
                  <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} showToast={showToast} />} />
                  <Route path="/admin/students" element={user.role === 'admin' ? <AdminStudents showToast={showToast} /> : <Navigate to="/dashboard" />} />
                  <Route path="/admin/teachers" element={user.role === 'admin' ? <AdminTeachers showToast={showToast} /> : <Navigate to="/dashboard" />} />
                  <Route path="/admin/reports" element={user.role === 'admin' ? <AdminReports /> : <Navigate to="/dashboard" />} />
                  <Route path="/teachers" element={user.role === 'student' ? <TeachersList /> : <Navigate to="/dashboard" />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </main>
              <BottomNav role={user.role} unreadHomework={unreadHomework} unreadNotices={unreadNotices} />
              <AnimatePresence>
                {showNotifications && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden mt-16"
                    >
                      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-lg">Notifications</h3>
                        <button 
                          onClick={() => {
                            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                            setShowNotifications(false);
                          }}
                          className="text-gray-400 hover:text-primary transition-colors"
                        >
                          <XCircle size={24} />
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center space-y-3">
                            <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto">
                              <Bell size={24} />
                            </div>
                            <p className="text-gray-400 text-sm">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={cn("p-4 rounded-2xl transition-all mb-1", n.read ? "opacity-60" : "bg-primary/5")}>
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-sm text-secondary">{n.title}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{n.time}</p>
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-4 bg-gray-50 text-center">
                          <button 
                            onClick={() => setNotifications([])}
                            className="text-xs font-bold text-red-500 hover:underline"
                          >
                            Clear All
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
                {toast && (
                  <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                  />
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}
