import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import { format } from 'date-fns';

const DATA_FILE = path.join(process.cwd(), 'data.json');

// Initial Mock Data
const initialData = {
  users: [
    { id: 'admin', password: 'password', role: 'admin', name: 'Super Admin' },
    { id: 'T101', password: 'password', role: 'teacher', name: 'John Doe', subject: 'Maths', phone: '9876543210', photo: '' },
    { id: 'S101', password: 'password', role: 'student', name: 'Alice Smith', class: '10', section: 'A', rollNo: 'S101', parentName: 'Bob Smith', phone: '1234567890', photo: '' }
  ],
  attendance: [],
  marks: [],
  fees: [
    { studentId: 'S101', total: 50000, paid: 20000, history: [{ date: '2024-01-15', amount: 20000 }] }
  ],
  homework: [
    { 
      id: 'H1', 
      class: '10', 
      subject: 'Maths', 
      title: 'Calculus Basics', 
      description: 'Complete exercises 1-10 on page 45.', 
      dueDate: '2026-03-30', 
      createdAt: '2026-03-25',
      assignedDate: '2026-03-25',
      completedBy: []
    }
  ],
  notices: [
    { id: 'N1', title: 'School Reopening', content: 'School will reopen on 1st April 2026.', date: '2026-03-26', author: 'Super Admin', role: 'admin' }
  ],
  leaveRequests: []
};

// Load data from file or use initial data
let data = initialData;
if (fs.existsSync(DATA_FILE)) {
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('Error loading data file, using initial data');
  }
}

const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving data file');
  }
};

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  const clients = new Map<WebSocket, { userId: string, role: string, class?: string }>();

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'identify') {
          clients.set(ws, { userId: data.userId, role: data.role, class: data.class });
        }
      } catch (e) {
        console.error('WS Error:', e);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  const broadcastToClass = (className: string, payload: any) => {
    clients.forEach((info, ws) => {
      if (info.role === 'student' && info.class === className && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    });
  };

  const broadcastToUser = (userId: string, payload: any) => {
    clients.forEach((info, ws) => {
      if (info.userId === userId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    });
  };

  const broadcastToAll = (payload: any) => {
    clients.forEach((info, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
      }
    });
  };

  app.use(cors());
  app.use(bodyParser.json({ limit: '10mb' }));

  // API Routes
  app.post('/api/login', (req, res) => {
    const { id, password, role } = req.body;
    const user = data.users.find(u => u.id === id && u.password === password && u.role === role);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.post('/api/change-password', (req, res) => {
    const { id, oldPassword, newPassword } = req.body;
    const userIndex = data.users.findIndex(u => u.id === id && u.password === oldPassword);
    if (userIndex !== -1) {
      data.users[userIndex].password = newPassword;
      saveData();
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Incorrect old password' });
    }
  });

  // Student Management
  app.get('/api/students', (req, res) => res.json(data.users.filter(u => u.role === 'student')));
  app.post('/api/students', (req, res) => {
    const newStudent = { ...req.body, role: 'student', password: 'password' };
    data.users.push(newStudent);
    data.fees.push({ studentId: newStudent.id, total: 50000, paid: 0, history: [] });
    saveData();
    res.json(newStudent);
  });
  app.put('/api/students/:id', (req, res) => {
    const index = data.users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
      data.users[index] = { ...data.users[index], ...req.body };
      saveData();
      res.json(data.users[index]);
    }
  });
  app.delete('/api/students/:id', (req, res) => {
    data.users = data.users.filter(u => u.id !== req.params.id);
    data.fees = data.fees.filter(f => f.studentId !== req.params.id);
    saveData();
    res.json({ success: true });
  });

  // Teacher Management
  app.get('/api/teachers', (req, res) => res.json(data.users.filter(u => u.role === 'teacher')));
  app.post('/api/teachers', (req, res) => {
    const newTeacher = { ...req.body, role: 'teacher', password: 'password' };
    data.users.push(newTeacher);
    saveData();
    res.json(newTeacher);
  });
  app.put('/api/teachers/:id', (req, res) => {
    const index = data.users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
      data.users[index] = { ...data.users[index], ...req.body };
      saveData();
      res.json(data.users[index]);
    }
  });
  app.delete('/api/teachers/:id', (req, res) => {
    data.users = data.users.filter(u => u.id !== req.params.id);
    saveData();
    res.json({ success: true });
  });

  // Attendance
  app.get('/api/attendance', (req, res) => res.json(data.attendance));
  app.post('/api/attendance', (req, res) => {
    const { date, records } = req.body; // records: [{studentId, status}]
    data.attendance = data.attendance.filter(a => a.date !== date);
    data.attendance.push({ date, records });
    saveData();
    res.json({ success: true });
  });

  // Marks
  app.get('/api/marks', (req, res) => res.json(data.marks));
  app.post('/api/marks', (req, res) => {
    const { studentId, subject, marks } = req.body;
    const index = data.marks.findIndex(m => m.studentId === studentId && m.subject === subject);
    if (index !== -1) data.marks[index].marks = marks;
    else data.marks.push({ studentId, subject, marks });
    saveData();
    res.json({ success: true });
  });

  // Fees
  app.get('/api/fees', (req, res) => res.json(data.fees));
  app.post('/api/fees/pay', (req, res) => {
    const { studentId, amount, date } = req.body;
    const fee = data.fees.find(f => f.studentId === studentId);
    if (fee) {
      fee.paid += Number(amount);
      fee.history.push({ date, amount: Number(amount) });
      saveData();
      res.json(fee);
    }
  });
  app.put('/api/fees/:studentId', (req, res) => {
    const index = data.fees.findIndex(f => f.studentId === req.params.studentId);
    if (index !== -1) {
      data.fees[index] = { ...data.fees[index], ...req.body };
      saveData();
      res.json(data.fees[index]);
    }
  });

  app.post('/api/fees/remind', (req, res) => {
    const { studentId, message } = req.body;
    const fee = data.fees.find(f => f.studentId === studentId);
    if (fee) {
      broadcastToUser(studentId, {
        type: 'fee_reminder',
        message: message || `Reminder: Your pending fee is ₹${fee.total - fee.paid}. Please pay soon.`
      });
      res.json({ success: true });
    } else {
      res.status(404).json({ message: 'Fee record not found' });
    }
  });

  // Homework
  app.get('/api/homework', (req, res) => res.json(data.homework));
  app.post('/api/homework', (req, res) => {
    const newHomework = { ...req.body, id: Date.now().toString(), completedBy: [] };
    data.homework.push(newHomework);
    
    // Notify students in the class
    broadcastToClass(newHomework.class, {
      type: 'new_homework',
      homework: newHomework
    });

    saveData();
    res.json(newHomework);
  });
  app.put('/api/homework/:id', (req, res) => {
    const index = data.homework.findIndex(h => h.id === req.params.id);
    if (index !== -1) {
      data.homework[index] = { ...data.homework[index], ...req.body };
      saveData();
      res.json(data.homework[index]);
    } else {
      res.status(404).json({ message: 'Homework not found' });
    }
  });
  app.post('/api/homework/:id/complete', (req, res) => {
    const { studentId } = req.body;
    const homework = data.homework.find(h => h.id === req.params.id);
    if (homework) {
      if (!homework.completedBy) homework.completedBy = [];
      if (!homework.completedBy.includes(studentId)) {
        homework.completedBy.push(studentId);
      }
      saveData();
      res.json(homework);
    } else {
      res.status(404).json({ message: 'Homework not found' });
    }
  });
  app.delete('/api/homework/:id', (req, res) => {
    data.homework = data.homework.filter(h => h.id !== req.params.id);
    saveData();
    res.json({ success: true });
  });

  // Notices
  app.get('/api/notices', (req, res) => res.json(data.notices));
  app.post('/api/notices', (req, res) => {
    const newNotice = { ...req.body, id: Date.now().toString() };
    data.notices.push(newNotice);
    
    broadcastToAll({
      type: 'new_notice',
      notice: newNotice
    });

    saveData();
    res.json(newNotice);
  });
  app.delete('/api/notices/:id', (req, res) => {
    data.notices = data.notices.filter(n => n.id !== req.params.id);
    saveData();
    res.json({ success: true });
  });

  // Leave Requests
  app.get('/api/leaves', (req, res) => res.json(data.leaveRequests));
  app.post('/api/leaves', (req, res) => {
    const newLeave = { ...req.body, id: Date.now().toString(), status: 'Pending', appliedDate: format(new Date(), 'yyyy-MM-dd') };
    data.leaveRequests.push(newLeave);
    saveData();
    res.json(newLeave);
  });
  app.put('/api/leaves/:id', (req, res) => {
    const index = data.leaveRequests.findIndex(l => l.id === req.params.id);
    if (index !== -1) {
      data.leaveRequests[index] = { ...data.leaveRequests[index], ...req.body };
      saveData();
      res.json(data.leaveRequests[index]);
    } else {
      res.status(404).json({ message: 'Leave request not found' });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
