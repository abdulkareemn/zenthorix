import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Code2,
  Download,
  Eye,
  FileText,
  Filter,
  Gauge,
  Grid2X2,
  LogOut,
  Mail,
  MessageSquare,
  Monitor,
  Play,
  Plus,
  Search,
  Settings,
  Shield,
  Trophy,
  Upload,
  User,
  UserRound,
  Users,
  Video,
  X
} from 'lucide-react';
import './styles.css';

type Route =
  | '/login'
  | '/admin/login'
  | '/admin/dashboard'
  | '/admin/candidates'
  | '/admin/exams/new'
  | '/admin/proctoring'
  | '/admin/alerts'
  | '/admin/results'
  | '/admin/settings'
  | '/student/dashboard'
  | '/student/profile'
  | '/student/instructions'
  | '/student/exam'
  | '/student/results';

type Candidate = { id?: string; _id?: string; name: string; email: string; password?: string; registerNumber?: string; department?: string; registeredPhoto?: string; exam: string; score: number; status: 'Scheduled' | 'In Progress' | 'Completed' | 'Warning'; accountStatus?: 'approved' | 'blocked'; assignedExamIds?: string[] };
type Exam = { id?: string; _id?: string; title: string; date: string; duration: string; state: 'Available Now' | 'Starts Soon'; status?: 'draft' | 'published' | 'archived'; language?: string; description?: string; questions?: Question[]; submittedAt?: string };
type Alert = { student: string; issue: string; severity: 'critical' | 'warning' | 'info'; time: string; status: 'Review' | 'Resolved' };
type ResultRow = { name: string; language: string; coding: number; behavior: number; score: number; status: 'Shortlisted' | 'Rejected' | 'Pending' };
type ProctorSession = { name: string; stack: string; photo: string; flags: string[]; risk: 'good' | 'warn' | 'danger'; note?: string };
type ProctorEvent = { type: string; message: string; severity: 'info' | 'warning' | 'critical'; createdAt: string };
type Recording = { mimeType?: string; data?: string; size?: number };
type Submission = { _id: string; exam?: { title?: string; language?: string; questions?: Question[] }; student?: { name?: string; email?: string }; answers?: { questionIndex: number; code: string; input: string; output: string }[]; proctorEvents?: ProctorEvent[]; recording?: Recording; cameraStatus: string; microphoneStatus: string; status?: 'in-progress' | 'submitted' | 'reviewed' | 'published'; adminWarning?: string; resultNote?: string; submittedAt?: string; publishedAt?: string; startedAt?: string; endedAt?: string; tabSwitchCount?: number; fullscreenExitCount?: number };
type FaceBox = { x: number; y: number; width: number; height: number };
type FaceSignature = { r: number; g: number; b: number; brightness: number };
type NativeFace = { boundingBox: FaceBox };
type FaceDetectorConstructor = new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => { detect: (source: CanvasImageSource) => Promise<NativeFace[]> };
type DashboardStat = { label: string; value: string; tone: 'purple' | 'blue' | 'red' | 'green' | 'amber' };
type ActivityItem = { label: string; detail: string; tone: 'green' | 'purple' | 'amber' };
type TestCase = { input: string; expected: string };
type Question = { prompt: string; sample: string; expected: string; testCases?: TestCase[] };
type CurrentUser = { _id?: string; name: string; email: string; role: 'admin' | 'student'; status?: 'approved' | 'blocked'; assignedExams?: string[]; registeredPhoto?: string };
type ApiStudent = { _id: string; name: string; email: string; status: 'approved' | 'blocked'; registerNumber?: string; department?: string; assignedExams?: string[]; registeredPhoto?: string };

const routes: Route[] = ['/login', '/admin/login', '/admin/dashboard', '/admin/candidates', '/admin/exams/new', '/admin/proctoring', '/admin/alerts', '/admin/results', '/admin/settings', '/student/dashboard', '/student/profile', '/student/instructions', '/student/exam', '/student/results'];

const adminStats: DashboardStat[] = [
  { label: 'Total Candidates', value: '0', tone: 'purple' },
  { label: 'Active Exams', value: '0', tone: 'blue' },
  { label: 'Alerts', value: '0', tone: 'red' },
  { label: 'Shortlisted', value: '0', tone: 'green' }
];

const candidates: Candidate[] = [];
const exams: Exam[] = [];
const alerts: Alert[] = [];
const results: ResultRow[] = [];
const sessions: ProctorSession[] = [];
const activities: ActivityItem[] = [];
const questionBank: Question[] = [];
const candidateStatuses: Candidate['status'][] = ['Scheduled', 'In Progress', 'Completed', 'Warning'];
const durationOptions = Array.from({ length: 10 }, (_, index) => (index + 1) * 30);
const allowedLanguages = ['Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'React', 'Node.js'];

const routeFromHash = (): Route => {
  const hash = window.location.hash.replace('#', '') as Route;
  if (routes.includes(hash)) return hash;
  if (window.location.hostname.toLowerCase().startsWith('admin.')) return '/admin/login';
  return '/login';
};

const isAdminHost = () => window.location.hostname.toLowerCase().startsWith('admin.');
const isStudentHost = () => window.location.hostname.toLowerCase().startsWith('student.');
const viteEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const adminPortalUrl = () => (viteEnv.VITE_ADMIN_PORTAL_URL || `${window.location.origin}/#/admin/login`);
const studentPortalUrl = () => (viteEnv.VITE_STUDENT_PORTAL_URL || `${window.location.origin}/#/login`);
const getExamId = (exam: Exam) => exam.id || exam._id || '';
const examFromApi = (exam: { _id: string; title: string; description?: string; duration: number; status: Exam['status']; language?: string; createdAt?: string; questions?: Question[]; submittedAt?: string }): Exam => ({
  id: exam._id,
  _id: exam._id,
  title: exam.title,
  description: exam.description || '',
  duration: `${exam.duration} mins`,
  date: exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'Available now',
  state: exam.status === 'published' ? 'Available Now' : 'Starts Soon',
  status: exam.status,
  language: exam.language,
  questions: exam.questions || [],
  submittedAt: exam.submittedAt
});
const candidateFromStudent = (student: ApiStudent): Candidate => ({
  id: student._id,
  _id: student._id,
  name: student.name,
  email: student.email,
  exam: '',
  score: 0,
  status: student.status === 'blocked' ? 'Warning' : 'Scheduled',
  accountStatus: student.status,
  registerNumber: student.registerNumber || '',
  department: student.department || '',
  registeredPhoto: student.registeredPhoto || '',
  assignedExamIds: student.assignedExams || []
});

async function validateExamAccess(examId?: string) {
  if (!examId) {
    return { allowed: false, reason: 'Not authorized for this exam' };
  }

  try {
    const response = await fetch(`/api/exams/validate/${examId}`, {
      credentials: 'include'
    });
    const result = await response.json().catch(() => ({}));

    return {
      allowed: Boolean(response.ok && result.allowed),
      reason: result.reason || result.message || 'Not authorized for this exam'
    };
  } catch (error) {
    return { allowed: false, reason: 'Not authorized for this exam' };
  }
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function parseCandidatesCsv(csvText: string): Candidate[] {
  const rows = csvText
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map(splitCsvLine);

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.toLowerCase());
  const hasHeader = headers.includes('name') || headers.includes('email');
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const read = (row: string[], field: string, fallbackIndex: number) => {
    const headerIndex = headers.indexOf(field);
    return row[headerIndex >= 0 ? headerIndex : fallbackIndex] || '';
  };

  return dataRows
    .map((row) => {
      const status = read(row, 'status', 4);
      const normalizedStatus = candidateStatuses.find((candidateStatus) => candidateStatus.toLowerCase() === status.toLowerCase()) || 'Scheduled';
      const accountStatus: Candidate['accountStatus'] = normalizedStatus === 'Warning' ? 'blocked' : 'approved';

      return {
        id: crypto.randomUUID(),
        name: read(row, 'name', 0),
        email: read(row, 'email', 1),
        password: read(row, 'password', 5),
        exam: read(row, 'exam', 2),
        score: Number(read(row, 'score', 3)) || 0,
        status: normalizedStatus,
        accountStatus,
        assignedExamIds: []
      };
    })
    .filter((candidate) => candidate.name && candidate.email);
}

function App() {
  const [route, setRoute] = useState<Route>(routeFromHash());
  const [activeExamId, setActiveExamId] = useState(() => sessionStorage.getItem('activeExamId') || '');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [managedCandidates, setManagedCandidates] = useState<Candidate[]>(candidates);
  const [managedExams, setManagedExams] = useState<Exam[]>(exams);
  const go = (next: Route) => {
    window.location.hash = next;
    setRoute(next);
  };
  const signOut = async (next: Route = '/login') => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).catch(() => undefined);
    setCurrentUser(null);
    setActiveExamId('');
    sessionStorage.removeItem('activeExamId');
    go(next);
  };

  const startExam = async (examId?: string, next: Route = '/student/instructions') => {
    const fallbackExam = managedExams.find((exam) => exam.status === 'published');
    const fallbackExamId = fallbackExam ? getExamId(fallbackExam) : '';
    const selectedExamId = examId || activeExamId || sessionStorage.getItem('activeExamId') || fallbackExamId;
    const validation = await validateExamAccess(selectedExamId);

    if (!validation.allowed) {
      alert(validation.reason || 'Not authorized for this exam');
      return;
    }

    setActiveExamId(selectedExamId);
    sessionStorage.setItem('activeExamId', selectedExamId);

    go(next);
  };

  React.useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.user) {
          setCurrentUser(result.user);
          if (result.user.role === 'admin' && route.startsWith('/student')) go('/admin/dashboard');
          if (result.user.role === 'student' && route.startsWith('/admin')) go('/student/dashboard');
        }
      })
      .catch(() => undefined)
      .finally(() => setAuthChecked(true));
  }, []);

  React.useEffect(() => {
    if (isAdminHost() && route === '/login') go('/admin/login');
    if (isStudentHost() && route.startsWith('/admin')) go('/login');
    if (!authChecked) return;
    if (currentUser?.role === 'admin' && route.startsWith('/student')) go('/admin/dashboard');
    if (currentUser?.role === 'student' && route.startsWith('/admin')) go('/student/dashboard');
    if (!currentUser && route.startsWith('/student')) go('/login');
    if (!currentUser && route.startsWith('/admin') && route !== '/admin/login') go('/admin/login');
  }, [authChecked, currentUser, route]);

  React.useEffect(() => {
    if (currentUser?.role !== 'student') return;

    fetch('/api/exams/assigned', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!Array.isArray(result?.exams)) return;

        const assignedExams: Exam[] = result.exams.map(examFromApi).filter((exam: Exam) => exam.status === 'published' && (exam.questions?.length || 0) > 0);
        setManagedExams(assignedExams);

        const activeExamHasQuestions = assignedExams.some((exam) => getExamId(exam) === activeExamId && (exam.questions?.length || 0) > 0);

        if (!activeExamHasQuestions && assignedExams.length > 0) {
          const firstReadyExamId = getExamId(assignedExams[0]);
          setActiveExamId(firstReadyExamId);
          sessionStorage.setItem('activeExamId', firstReadyExamId);
        }
      })
      .catch(() => undefined);
    const refresh = window.setInterval(() => {
      fetch('/api/exams/assigned', { credentials: 'include' })
        .then((response) => response.ok ? response.json() : null)
        .then((result) => {
          if (Array.isArray(result?.exams)) setManagedExams(result.exams.map(examFromApi).filter((exam: Exam) => exam.status === 'published' && (exam.questions?.length || 0) > 0));
        })
        .catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(refresh);
  }, [currentUser, route, activeExamId]);

  React.useEffect(() => {
    if (currentUser?.role !== 'admin') return;

    fetch('/api/admin/exams', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!Array.isArray(result?.exams)) return;

        setManagedExams(result.exams.map(examFromApi));
      })
      .catch(() => undefined);

    fetch('/api/admin/students', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!Array.isArray(result?.students)) return;

        setManagedCandidates(result.students.map(candidateFromStudent));
      })
      .catch(() => undefined);
  }, [currentUser]);

  if (route === '/login') return <StudentLogin go={go} setCurrentUser={setCurrentUser} />;
  if (route === '/admin/login') return <AdminLogin go={go} setCurrentUser={setCurrentUser} />;
  if (!authChecked && (route.startsWith('/student') || route.startsWith('/admin'))) return <main className="auth-page"><div className="auth-logo"><Shield /></div><h1>ProctorAI</h1><p>Checking secure portal access...</p></main>;
  if (route.startsWith('/student')) return <StudentShell route={route} go={go} signOut={signOut} startExam={startExam} exams={managedExams} currentUser={currentUser} activeExamId={activeExamId} />;
  return <AdminShell route={route} go={go} signOut={signOut} candidates={managedCandidates} setCandidates={setManagedCandidates} exams={managedExams} setExams={setManagedExams} />;
}

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-icon"><Shield size={18} /></span>
      <span className={dark ? 'text-white' : ''}>ProctorAI</span>
    </div>
  );
}

function StudentLogin({ go, setCurrentUser }: { go: (r: Route) => void; setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const studentLogin = async (loginEmail = email, loginPassword = password) => {
    const normalizedEmail = loginEmail.trim().toLowerCase();

    if (!normalizedEmail || !loginPassword) {
      alert('Enter student email and password.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: loginPassword, role: 'student' })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.user?.role !== 'student') {
        alert(result.message || 'Invalid student login. Use a registered student email and password.');
        return;
      }

      setCurrentUser(result.user);
      go('/student/dashboard');
    } catch (error) {
      alert('Unable to sign in.');
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-logo"><Monitor /></div>
      <h1>ProctorAI</h1>
      <p>Secure Online Assessment Platform</p>
      <section className="auth-card">
        <h2>Student Portal</h2>
        <p>Sign in with the email and password created by the administrator.</p>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Student email" />
        <label className="password-field">
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type={showPassword ? 'text' : 'password'} />
          <button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Hide' : 'Show'}</button>
        </label>
        <button className="google-btn" onClick={() => studentLogin()}>Login</button>
        <div className="auth-divider" />
        <small>Student Portal URL: {studentPortalUrl()}</small>
        <small>Are you an Administrator?</small>
        <button className="link-btn" onClick={() => go('/admin/login')}>Access Admin Dashboard</button>
      </section>
    </main>
  );
}

function AdminLogin({ go, setCurrentUser }: { go: (r: Route) => void; setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const verifyAdmin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      alert('Enter admin email and password.');
      return;
    }
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password, role: 'admin' })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(result.message || 'Invalid admin credentials');
        return;
      }

      if (result.user) setCurrentUser(result.user);
      go('/admin/dashboard');
    } catch (error) {
      alert('Unable to verify admin access');
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-logo"><Monitor /></div>
      <h1>ProctorAI</h1>
      <p>Secure Online Assessment Platform</p>
      <section className="auth-card">
        <span className="admin-dot"><Shield size={15} /></span>
        <h2>Admin Control</h2>
        <p>Sign in with your administrator credentials.</p>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" />
        <label className="password-field">
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type={showPassword ? 'text' : 'password'} />
          <button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Hide' : 'Show'}</button>
        </label>
        <button className="primary full" onClick={verifyAdmin}>Login</button>
        <div className="auth-divider" />
        <small>Admin Portal URL: {adminPortalUrl()}</small>
        <button className="link-btn" onClick={() => go('/login')}>Return to Student Login</button>
      </section>
    </main>
  );
}

function AdminShell({ route, go, signOut, candidates, setCandidates, exams, setExams }: { route: Route; go: (r: Route) => void; signOut: (next?: Route) => Promise<void>; candidates: Candidate[]; setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>; exams: Exam[]; setExams: React.Dispatch<React.SetStateAction<Exam[]>> }) {
  const nav = [
    ['/admin/dashboard', Grid2X2, 'Dashboard'],
    ['/admin/candidates', Users, 'Candidates'],
    ['/admin/exams/new', ClipboardList, 'Exams'],
    ['/admin/proctoring', Video, 'Live Proctoring'],
    ['/admin/alerts', Bell, 'Alerts'],
    ['/admin/results', BarChart3, 'Results'],
    ['/admin/settings', Settings, 'Settings']
  ] as const;
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <Brand dark />
        <span className="nav-label">MENU</span>
        {nav.map(([href, Icon, label]) => (
          <button key={href} className={route === href ? 'active' : ''} onClick={() => go(href)}><Icon size={16} />{label}</button>
        ))}
        <button className="sign-out" onClick={() => signOut('/admin/login')}><LogOut size={15} /> Sign Out</button>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <span>Command Center</span>
          <div className="profile-chip"><UserRound size={16} /> Admin <small>Control</small><button className="link-btn" onClick={() => signOut('/admin/login')}><LogOut size={15} /> Sign Out</button></div>
        </header>
        {route === '/admin/dashboard' && <AdminDashboard candidates={candidates} go={go} />}
        {route === '/admin/candidates' && <Candidates candidates={candidates} setCandidates={setCandidates} exams={exams} />}
        {route === '/admin/exams/new' && <ExamBuilder exams={exams} setExams={setExams} />}
        {route === '/admin/proctoring' && <Proctoring />}
        {route === '/admin/alerts' && <Alerts />}
        {route === '/admin/results' && <AdminResults />}
        {route === '/admin/settings' && <SettingsPage />}
      </main>
    </div>
  );
}

function AdminDashboard({ candidates, go }: { candidates: Candidate[]; go: (r: Route) => void }) {
  const approvedStudents = candidates.filter((candidate) => candidate.accountStatus !== 'blocked').length;
  const blockedStudents = candidates.filter((candidate) => candidate.accountStatus === 'blocked').length;

  return (
    <section className="page">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        {adminStats.map((s) => <StatCard key={s.label} stat={s} />)}
      </div>
      <div className="dashboard-grid">
        <Card title="Exam Activity"><EmptyState icon={<BarChart3 size={28} />} title="No exam activity" text="Activity charts will populate after assessments run." /></Card>
        <Card title="Average Performance by Language"><EmptyState icon={<Code2 size={28} />} title="No performance data" text="Language comparisons will appear after results are available." /></Card>
      </div>
      <div className="dashboard-grid small">
        <Card title="Selection Ratio"><div className="ratio"><span>0%</span><p>No completed assessments yet.</p></div></Card>
        <Card title="Recent Alerts"><AlertMiniList /></Card>
      </div>
      <div className="dashboard-grid small">
        <Card title="Student Database"><div className="ratio"><span>{candidates.length}</span><p>{approvedStudents} approved · {blockedStudents} blocked</p><button className="primary" onClick={() => go('/admin/candidates')}><Users size={15} /> Manage Students</button></div></Card>
        <Card title="Exam Verification"><EmptyState icon={<Shield size={28} />} title="Protected by verification" text="Only approved students with assigned exams can enter the exam workspace." /></Card>
      </div>
    </section>
  );
}

function StatCard({ stat }: { stat: DashboardStat }) {
  return <article className="stat-card"><div><p>{stat.label}</p><strong>{stat.value}</strong></div><span className={`halo ${stat.tone}`}><Gauge size={18} /></span></article>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card"><h3>{title}</h3>{children}</section>;
}

function LineChart() {
  return (
    <svg className="line-chart" viewBox="0 0 420 190" role="img" aria-label="Exam activity line chart">
      {[35, 75, 115, 155].map((y) => <line key={y} x1="20" x2="400" y1={y} y2={y} />)}
      <polyline points="25,110 75,126 120,82 165,96 210,42 255,145 310,160 385,171" />
      <circle cx="210" cy="42" r="5" />
    </svg>
  );
}

function BarSet() {
  return <div className="bars">{['Java', 'Python', 'C++', 'React'].map((l, i) => <div key={l}><span style={{ height: `${104 - i * 11}px` }} /><small>{l}</small></div>)}</div>;
}

function AlertMiniList() {
  if (alerts.length === 0) return <EmptyState icon={<Bell size={28} />} title="No alerts" text="Proctoring alerts will appear here." />;
  return <div className="mini-list">{alerts.slice(0, 4).map((a) => <p key={a.student}><span className={`dot ${a.severity}`} />{a.student}<small>{a.issue}</small></p>)}</div>;
}

function Candidates({ candidates, setCandidates, exams }: { candidates: Candidate[]; setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>; exams: Exam[] }) {
  const [query, setQuery] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', status: 'approved' as 'approved' | 'blocked', registeredPhoto: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visible = candidates.filter((c) => `${c.name} ${c.email} ${c.exam}`.toLowerCase().includes(query.toLowerCase()));
  const publishedExams = exams.filter((exam) => exam.status === 'published');
  const readJson = async (response: Response) => response.json().catch(() => ({}));
  const handleAdminFailure = (response: Response, result: { message?: string }, fallback: string) => {
    if (response.status === 401 || response.status === 403) {
      alert('Please sign in as admin again before managing students.');
      window.location.hash = '/admin/login';
      return true;
    }

    if (!response.ok) {
      alert(result.message || fallback);
      return true;
    }

    return false;
  };
  const ensureAdminSession = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      const result = await readJson(response);

      if (response.status === 401 || response.status === 403 || result?.user?.role !== 'admin') {
        alert('Please sign in as admin before creating or changing student records.');
        window.location.hash = '/admin/login';
        return false;
      }

      if (!response.ok) {
        alert(result.message || 'Unable to verify admin login.');
        return false;
      }

      return true;
    } catch (error) {
      alert('Backend is not reachable. Start the backend with npm run server, then try again.');
      return false;
    }
  };
  const getAssignedExamTitle = (candidate: Candidate) => {
    const examId = candidate.assignedExamIds?.[0];
    return candidate.exam || exams.find((exam) => getExamId(exam) === examId)?.title || (examId ? 'Assigned' : 'Unassigned');
  };
  const importCsv = async (file: File | undefined) => {
    if (!file) return;
    if (!(await ensureAdminSession())) return;

    const imported = parseCandidatesCsv(await file.text());

    if (imported.length === 0) {
      alert('No valid candidates found in the selected CSV file.');
      return;
    }

    let failedImports = 0;
    const importResults = await Promise.all(imported.map(async (candidate) => {
      if (!candidate.password) {
        failedImports += 1;
        return null;
      }

      try {
        const response = await fetch('/api/admin/students/create', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: candidate.name,
            email: candidate.email,
            password: candidate.password,
            status: candidate.accountStatus || 'approved',
            assignedExams: []
          })
        });
        const result = await readJson(response);

        if (handleAdminFailure(response, result, `Unable to import ${candidate.email}.`)) {
          failedImports += 1;
          return null;
        }

        return { ...candidateFromStudent(result.student), score: candidate.score };
      } catch (error) {
        failedImports += 1;
        return null;
      }
    }));
    const savedCandidates = importResults.filter(Boolean) as Candidate[];

    if (savedCandidates.length === 0) {
      alert('No students were saved. Make sure the CSV includes name, email, and password columns.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setCandidates((currentCandidates) => [
      ...savedCandidates,
      ...currentCandidates.filter((existingCandidate) => !savedCandidates.some((candidate) => candidate.email === existingCandidate.email))
    ]);
    if (failedImports > 0) alert(`${failedImports} CSV row(s) could not be saved to the student database.`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const createStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.password) {
      alert('Enter student name, email, and password.');
      return;
    }
    if (!(await ensureAdminSession())) return;

    try {
      const response = await fetch('/api/admin/students/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudent.name.trim(),
          email: newStudent.email.trim(),
          password: newStudent.password,
          status: newStudent.status,
          registeredPhoto: newStudent.registeredPhoto.trim(),
          assignedExams: []
        })
      });
      const result = await readJson(response);

      if (handleAdminFailure(response, result, 'Unable to create student.')) {
        return;
      }

      setCandidates((currentCandidates) => [
        candidateFromStudent(result.student),
        ...currentCandidates.filter((candidate) => candidate.email !== result.student.email)
      ]);
      setNewStudent({ name: '', email: '', password: '', status: 'approved', registeredPhoto: '' });
    } catch (error) {
      alert('Unable to create student.');
    }
  };
  const assignExam = async (candidate: Candidate, examId: string) => {
    if (!candidate._id) {
      alert('Create this student login in the database before assigning an exam.');
      return;
    }
    if (!(await ensureAdminSession())) return;

    const assignedExam = exams.find((exam) => getExamId(exam) === examId);
    try {
      const response = await fetch(`/api/admin/students/${candidate._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedExams: examId ? [examId] : [] })
      });
      const result = await readJson(response);

      if (handleAdminFailure(response, result, 'Unable to assign exam.')) return;

      const updatedCandidate = {
        ...candidateFromStudent(result.student),
        exam: assignedExam?.title || '',
        score: candidate.score
      };
      setCandidates((currentCandidates) => currentCandidates.map((currentCandidate) => currentCandidate.email === candidate.email ? updatedCandidate : currentCandidate));
    } catch (error) {
      alert('Unable to assign exam.');
    }
  };
  const updateStudentStatus = async (candidate: Candidate, status: 'approved' | 'blocked') => {
    if (!candidate._id) {
      alert('Create this student login in the database before changing verification status.');
      return;
    }
    if (!(await ensureAdminSession())) return;

    try {
      const response = await fetch(`/api/admin/students/${candidate._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await readJson(response);

      if (handleAdminFailure(response, result, 'Unable to update student status.')) return;

      setCandidates((currentCandidates) => currentCandidates.map((currentCandidate) => currentCandidate.email === candidate.email ? { ...candidateFromStudent(result.student), exam: candidate.exam, score: candidate.score } : currentCandidate));
    } catch (error) {
      alert('Unable to update student status.');
    }
  };
  const deleteStudent = async (candidate: Candidate) => {
    if (!candidate._id) {
      setCandidates((currentCandidates) => currentCandidates.filter((currentCandidate) => currentCandidate.email !== candidate.email));
      return;
    }

    if (!window.confirm(`Delete ${candidate.name}'s student login?`)) return;
    if (!(await ensureAdminSession())) return;

    try {
      const response = await fetch(`/api/admin/students/${candidate._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const result = await readJson(response);

      if (handleAdminFailure(response, result, 'Unable to delete student.')) return;

      setCandidates((currentCandidates) => currentCandidates.filter((currentCandidate) => currentCandidate.email !== candidate.email));
    } catch (error) {
      alert('Unable to delete student.');
    }
  };

  return (
    <section className="page">
      <div className="page-head"><h2>Candidate Management</h2><button className="primary" onClick={() => fileInputRef.current?.click()}><Upload size={15} /> Import CSV</button><input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={(event) => importCsv(event.target.files?.[0])} /></div>
      <div className="form-card">
        <div className="page-head tight"><h3>Student Database</h3><button className="primary" onClick={createStudent}><Plus size={15} /> Create Login</button></div>
        <div className="two-col"><label>Name<input value={newStudent.name} onChange={(event) => setNewStudent({ ...newStudent, name: event.target.value })} placeholder="Student name" /></label><label>Email<input value={newStudent.email} onChange={(event) => setNewStudent({ ...newStudent, email: event.target.value })} placeholder="Student email" /></label></div>
        <div className="two-col"><label>Password<input value={newStudent.password} onChange={(event) => setNewStudent({ ...newStudent, password: event.target.value })} placeholder="Create password" type="password" /></label><label>Verification Status<select value={newStudent.status} onChange={(event) => setNewStudent({ ...newStudent, status: event.target.value as 'approved' | 'blocked' })}><option value="approved">Approved</option><option value="blocked">Blocked</option></select></label></div>
        <label>Registered Photo URL<input value={newStudent.registeredPhoto} onChange={(event) => setNewStudent({ ...newStudent, registeredPhoto: event.target.value })} placeholder="Paste student photo URL for face verification" /></label>
      </div>
      <Toolbar query={query} setQuery={setQuery} />
      <DataTable headers={['Candidate', 'Exam', 'Score', 'Status', 'Actions']}>
        {visible.map((c) => <tr key={c.email}><td><strong>{c.name}</strong><small>{c.email}</small></td><td>{getAssignedExamTitle(c)}</td><td>{c.score}</td><td><select value={c.accountStatus || 'approved'} onChange={(event) => updateStudentStatus(c, event.target.value as 'approved' | 'blocked')}><option value="approved">Approved</option><option value="blocked">Blocked</option></select></td><td><div className="action-icons"><select value={c.assignedExamIds?.[0] || ''} onChange={(event) => assignExam(c, event.target.value)}><option value="">Assign exam</option>{publishedExams.map((exam) => <option key={getExamId(exam)} value={getExamId(exam)}>{exam.title}</option>)}</select><ActionIcons onDelete={() => deleteStudent(c)} /></div></td></tr>)}
        {visible.length === 0 && <tr><td colSpan={5}><EmptyState icon={<Users size={28} />} title="No candidates yet" text="Imported or invited candidates will appear here." /></td></tr>}
      </DataTable>
    </section>
  );
}

function Toolbar({ query, setQuery }: { query: string; setQuery: (v: string) => void }) {
  return <div className="toolbar"><label><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search candidates..." /></label><button><Filter size={15} /> All statuses</button></div>;
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="empty-state">{icon}<strong>{title}</strong><p>{text}</p></div>;
}

function ActionIcons({ onDelete }: { onDelete?: () => void }) {
  return <div className="action-icons"><button title="View"><Eye size={15} /></button><button title="Email"><Mail size={15} /></button><button title="Delete" onClick={onDelete}><X size={15} /></button></div>;
}

function Status({ value }: { value: string }) {
  const kind = value.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status ${kind}`}>{value}</span>;
}

function ExamBuilder({ exams, setExams }: { exams: Exam[]; setExams: React.Dispatch<React.SetStateAction<Exam[]>> }) {
  const blankQuestion: Question = { prompt: '', sample: '', expected: '', testCases: [{ input: '', expected: '' }] };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [saved, setSaved] = useState(false);
  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    setQuestions((currentQuestions) => currentQuestions.map((question, questionIndex) => questionIndex === index ? { ...question, [field]: value } : question));
  };
  const updateTestCase = (questionIndex: number, testIndex: number, field: keyof TestCase, value: string) => {
    setQuestions((currentQuestions) => currentQuestions.map((question, currentQuestionIndex) => {
      if (currentQuestionIndex !== questionIndex) return question;
      const testCases = question.testCases?.length ? question.testCases : [{ input: question.sample, expected: question.expected }];
      return {
        ...question,
        testCases: testCases.map((testCase, currentTestIndex) => currentTestIndex === testIndex ? { ...testCase, [field]: value } : testCase)
      };
    }));
  };
  const addTestCase = (questionIndex: number) => {
    setQuestions((currentQuestions) => currentQuestions.map((question, currentQuestionIndex) => currentQuestionIndex === questionIndex
      ? { ...question, testCases: [...(question.testCases || []), { input: '', expected: '' }] }
      : question));
  };
  const publishExam = async () => {
    if (!title.trim() || !duration || !selectedLanguage) {
      alert('Please enter an exam title, duration, and one allowed language before publishing.');
      return;
    }

    const cleanQuestions = questions.map((question) => {
      const savedTestCases = (question.testCases?.length ? question.testCases : [])
        .map((testCase) => ({
          input: testCase.input.trim(),
          expected: testCase.expected.trim()
        }))
        .filter((testCase) => testCase.input || testCase.expected);

      if (savedTestCases.length === 0 && (question.sample.trim() || question.expected.trim())) {
        savedTestCases.push({ input: question.sample.trim(), expected: question.expected.trim() });
      }

      return {
        prompt: question.prompt.trim(),
        sample: question.sample.trim(),
        expected: question.expected.trim(),
        testCases: savedTestCases
      };
    }).filter((question) => question.prompt);

    if (cleanQuestions.length === 0) {
      alert('Please add at least one question before publishing.');
      return;
    }

    const localExam: Exam = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      duration: `${duration} mins`,
      date: 'Available now',
      state: 'Available Now',
      status: 'published',
      language: selectedLanguage,
      questions: cleanQuestions
    };
    const existingExam = exams.find((exam) => exam.title.trim().toLowerCase() === localExam.title.toLowerCase());
    const existingExamId = existingExam ? getExamId(existingExam) : '';

    try {
      const response = await fetch(existingExamId ? `/api/admin/exams/${existingExamId}` : '/api/admin/exams/create', {
        method: existingExamId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: localExam.title,
          description: localExam.description,
          duration: Number(duration),
          language: selectedLanguage,
          status: 'published',
          questions: cleanQuestions
        })
      });

      if (response.ok) {
        const result = await response.json();
        const savedExam = examFromApi(result.exam);
        setExams((currentExams) => existingExamId
          ? currentExams.map((exam) => getExamId(exam) === existingExamId ? savedExam : exam)
          : [savedExam, ...currentExams]);
      } else {
        const result = await response.json().catch(() => ({}));
        alert(result.message || 'Unable to publish exam.');
        return;
      }
    } catch (error) {
      alert('Backend is not reachable. Start the backend, then publish the exam again.');
      return;
    }

    setSaved(true);
  };
  return (
    <section className="page narrow">
      <div className="page-head"><h2>Create New Exam</h2><button className="primary" onClick={publishExam}>Save Exam</button></div>
      {saved && <div className="toast">Exam published and available for assignment.</div>}
      <div className="form-card">
        <div className="tabs"><button className="active">Exam Details</button><button>Questions</button></div>
        <label>Exam Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter assessment title" /></label>
        <label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the assessment scope" /></label>
        <div className="two-col"><label>Duration (minutes)<select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="">Select duration</option>{durationOptions.map((minutes) => <option key={minutes} value={minutes}>{minutes < 60 ? `${minutes} mins` : `${minutes / 60} ${minutes === 60 ? 'hour' : 'hours'}`}</option>)}</select></label><label>Allowed Languages<select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)}><option value="">Select language</option>{allowedLanguages.map((language) => <option key={language} value={language}>{language}</option>)}</select></label></div>
        <div className="checks">{allowedLanguages.slice(0, 4).map((language) => <label key={language}><input type="checkbox" checked={selectedLanguage === language} onChange={(event) => setSelectedLanguage(event.target.checked ? language : '')} /> {language}</label>)}</div>
      </div>
      <div className="questions">
        <div className="page-head tight"><h3>Questions</h3><button onClick={() => setQuestions([...questions, blankQuestion])}><Plus size={15} /> Add Question</button></div>
        {questions.length === 0 && <EmptyState icon={<FileText size={28} />} title="No questions added" text="Use Add Question to start building this assessment." />}
        {questions.map((q, i) => <div className="form-card question" key={i}><strong>Question {i + 1}</strong><textarea value={q.prompt} onChange={(event) => updateQuestion(i, 'prompt', event.target.value)} placeholder="Write the question prompt" /><div className="two-col"><label>Sample Input<textarea value={q.sample} onChange={(event) => updateQuestion(i, 'sample', event.target.value)} placeholder="Optional sample input" /></label><label>Expected Output<textarea value={q.expected} onChange={(event) => updateQuestion(i, 'expected', event.target.value)} placeholder="Optional expected output" /></label></div><div className="testcase-list"><div className="page-head tight"><h4>Test Cases</h4><button onClick={() => addTestCase(i)}><Plus size={14} /> Add Test Case</button></div>{(q.testCases?.length ? q.testCases : [{ input: q.sample, expected: q.expected }]).map((testCase, testIndex) => <div className="two-col" key={testIndex}><label>Input {testIndex + 1}<textarea value={testCase.input} onChange={(event) => updateTestCase(i, testIndex, 'input', event.target.value)} /></label><label>Expected {testIndex + 1}<textarea value={testCase.expected} onChange={(event) => updateTestCase(i, testIndex, 'expected', event.target.value)} /></label></div>)}</div></div>)}
      </div>
    </section>
  );
}

function Proctoring() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    const load = () => {
      fetch('/api/admin/exams/submissions', { credentials: 'include' })
        .then((response) => response.ok ? response.json() : null)
        .then((result) => {
          if (Array.isArray(result?.submissions)) setSubmissions(result.submissions);
        })
        .catch(() => undefined);
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, []);
  const warnCandidate = async (submission: Submission) => {
    const message = 'Admin warning: suspicious behaviour detected. Please focus on the exam.';
    const response = await fetch(`/api/admin/exams/submissions/${submission._id}/warn`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (response.ok) {
      const result = await response.json();
      setSubmissions((current) => current.map((item) => item._id === submission._id ? { ...item, ...result.submission } : item));
    }
  };

  return (
    <section className="page proctor-page">
      <div className="page-head"><h2>Live Proctoring</h2><span className="live-pill"><span /> {submissions.filter((submission) => submission.status === 'in-progress').length} Active Sessions</span></div>
      <div className="proctor-grid">
        {submissions.length === 0 && <EmptyState icon={<Video size={28} />} title="No sessions" text="Candidate sessions will appear here when exams start." />}
        {submissions.map((submission) => <article className={`video-card ${(submission.proctorEvents?.length || 0) > 0 ? 'warn' : 'good'}`} key={submission._id}>
          <div className="video-frame">{recordingSrc(submission.recording) ? <video src={recordingSrc(submission.recording)} controls /> : <Video size={46} />}{(submission.proctorEvents?.length || 0) > 0 && <strong>{submission.proctorEvents?.[submission.proctorEvents.length - 1]?.message}</strong>}</div>
          <div className="video-meta"><div><h3>{submission.student?.name || 'Candidate'}</h3><small>{submission.exam?.title || 'Assessment'} - {submission.status || 'session'}</small></div><div className="flag-row">{(submission.proctorEvents || []).slice(-4).map((event) => <span key={`${event.createdAt}-${event.type}`} />)}</div></div>
          <div className="video-actions"><button onClick={() => setSelected(submission)}><MessageSquare size={14} /> Review</button><button className={(submission.proctorEvents?.length || 0) > 0 ? 'warned' : ''} onClick={() => warnCandidate(submission)}>Warn</button></div>
        </article>)}
      </div>
      {selected && <div className="modal-backdrop"><section className="incident"><button className="close" onClick={() => setSelected(null)}><X size={18} /></button>{recordingSrc(selected.recording) ? <video src={recordingSrc(selected.recording)} controls /> : <Video size={54} />}<div><h3>{selected.student?.name || 'Candidate'}</h3><small>{selected.exam?.title || 'Assessment'}</small><p>Warnings: {selected.proctorEvents?.length || 0}</p><div className="event-log">{(selected.proctorEvents || []).map((event) => <p key={`${event.createdAt}-${event.type}`}><AlertTriangle size={12} /> {new Date(event.createdAt).toLocaleTimeString()} - {event.message}</p>)}</div><button className="primary" onClick={() => warnCandidate(selected)}>Send Warning</button></div></section></div>}
    </section>
  );
}

function IncidentModal({ session, close }: { session: ProctorSession; close: () => void }) {
  return <div className="modal-backdrop"><section className="incident"><button className="close" onClick={close}><X size={18} /></button><img src={session.photo} alt="" /><div><h3>{session.name}</h3><small>{session.stack}</small><p className="danger-text">{session.note || 'Potential integrity issue detected'}</p><p>Recent flags: {session.flags.join(', ')}</p><button className="primary">Request Camera Check</button><button className="danger-btn">Terminate Exam</button></div></section></div>;
}

function Alerts() {
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    fetch('/api/admin/exams/submissions', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (Array.isArray(result?.submissions)) setSubmissions(result.submissions);
      })
      .catch(() => undefined);
  }, []);

  const reviewAlerts = submissions.flatMap((submission) => (submission.proctorEvents || []).map((event) => ({
    ...event,
    student: submission.student?.name || 'Candidate'
  })));
  const visible = onlyOpen ? reviewAlerts.filter((alert) => alert.severity !== 'info') : reviewAlerts;
  return <section className="page narrow"><div className="page-head"><h2>System Alerts</h2><button onClick={() => setOnlyOpen(!onlyOpen)}><Filter size={15} /> {onlyOpen ? 'All alerts' : 'Open only'}</button></div><div className="alert-list">{visible.length === 0 && <EmptyState icon={<AlertTriangle size={28} />} title="No alerts yet" text="System and proctoring alerts will show up here." />}{visible.map((a) => <article key={`${a.student}-${a.createdAt}-${a.type}`}><span className={`alert-icon ${a.severity}`}><AlertTriangle size={15} /></span><div><strong>{a.student}</strong><small>{a.message}</small></div><time>{new Date(a.createdAt).toLocaleString()}</time><button className="link-btn">Review</button></article>)}</div></section>;
}

function AdminResults() {
  const [query, setQuery] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const load = () => {
      fetch('/api/admin/exams/submissions', { credentials: 'include' })
        .then((response) => response.ok ? response.json() : null)
        .then((result) => {
          if (Array.isArray(result?.submissions)) {
            setSubmissions(result.submissions);
            setSelectedSubmission((current) => current ? result.submissions.find((item: Submission) => item._id === current._id) || current : current);
          }
        })
        .catch(() => undefined);
    };
    load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const visible = submissions.filter((submission) => (submission.student?.name || '').toLowerCase().includes(query.toLowerCase()));
  const selected = selectedSubmission || visible[0] || null;
  const report = selected ? reportForSubmission(selected) : null;
  const publishResult = async (submission: Submission) => {
    const generated = reportForSubmission(submission);
    const response = await fetch(`/api/admin/exams/submissions/${submission._id}/publish`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultNote: `Verified by admin. Overall report: ${generated.label} (${generated.score}% risk), ${generated.warnings} warnings, ${generated.tabSwitches} tab switches, ${generated.fullscreenExits} fullscreen exits.` })
    });

    if (response.ok) {
      const result = await response.json();
      setSubmissions((current) => current.map((item) => item._id === submission._id ? { ...item, ...result.submission } : item));
      setSelectedSubmission((current) => current && current._id === submission._id ? { ...current, ...result.submission } : current);
    } else {
      const result = await response.json().catch(() => ({}));
      alert(result.message || 'Unable to publish result.');
    }
  };
  return <section className="page"><div className="page-head"><h2>Exam Results</h2><button className="primary"><Download size={15} /> Export to CSV</button></div><Toolbar query={query} setQuery={setQuery} /><DataTable headers={['Candidate', 'Exam', 'Language', 'Answers', 'Warnings', 'Status', 'Review']}>{visible.map((submission) => <tr key={submission._id}><td><strong>{submission.student?.name || 'Candidate'}</strong><small>{submission.student?.email || ''}</small></td><td>{submission.exam?.title || 'Assessment'}</td><td>{submission.exam?.language || '-'}</td><td>{submission.answers?.length || 0}</td><td>{submission.proctorEvents?.length || 0}</td><td>{submission.status || 'submitted'}</td><td><button className="link-btn" onClick={() => setSelectedSubmission(submission)}>View Answers</button></td></tr>)}{visible.length === 0 && <tr><td colSpan={7}><EmptyState icon={<Trophy size={28} />} title="No results yet" text="Completed assessment results will appear here." /></td></tr>}</DataTable>{selected && <section className="review-panel"><div className="page-head tight"><h3>Submission Review</h3><span>{selected.student?.name || 'Candidate'} - {selected.exam?.title || 'Assessment'}</span></div>{report && <div className="report-grid"><article><b>{report.label}</b><small>Overall Risk</small></article><article><b>{report.score}%</b><small>Risk Score</small></article><article><b>{report.warnings}</b><small>Total Warnings</small></article><article><b>{report.tabSwitches}</b><small>Tab Switches</small></article><article><b>{report.fullscreenExits}</b><small>Fullscreen Exits</small></article><article><b>Verified by Admin</b><small>Review Status</small></article></div>}{recordingSrc(selected.recording) && <video className="review-recording" src={recordingSrc(selected.recording)} controls />}{(selected.answers || []).length === 0 && <EmptyState icon={<FileText size={28} />} title="No answers saved" text="This submission did not include answer content." />}{(selected.answers || []).map((answer) => { const question = selected.exam?.questions?.[answer.questionIndex]; return <article className="answer-review" key={answer.questionIndex}><h4>Question {answer.questionIndex + 1}</h4>{question?.prompt && <p>{question.prompt}</p>}<div className="two-col"><label>Submitted Code<textarea value={answer.code || ''} readOnly /></label><label>Run Output<textarea value={answer.output || ''} readOnly /></label></div><div className="two-col"><label>Input<textarea value={answer.input || ''} readOnly /></label><label>Expected<textarea value={question?.expected || ''} readOnly /></label></div></article>; })}{(selected.proctorEvents || []).length > 0 && <div className="answer-review"><h4>Proctoring Notes</h4>{(selected.proctorEvents || []).map((event) => <p key={`${event.createdAt}-${event.type}`}><strong>{event.severity}</strong> {new Date(event.createdAt).toLocaleString()} - {event.message}</p>)}</div>}<button className="primary" disabled={selected.status === 'published'} onClick={() => publishResult(selected)}>{selected.status === 'published' ? 'Result Published' : 'Verify & Publish Result'}</button></section>}</section>;
}

function SettingsPage() {
  const [saved, setSaved] = useState(false);
  return <section className="page settings-page"><h2>System Settings</h2>{saved && <div className="toast">Settings updated.</div>}<div className="settings-grid"><Card title="Proctoring Rules"><Toggle label="Webcam Enforcement" /><Toggle label="Audio Monitoring" /><label>Max Tab Switches Allowed<input placeholder="Set threshold" /></label><label>Number of Faces<input placeholder="Set allowed faces" /></label></Card><Card title="Admin Profile"><label>Full Name<input placeholder="Enter full name" /></label><label>Email Address<input placeholder="Enter email address" /></label><button className="primary full" onClick={() => setSaved(true)}>Update Profile</button></Card><Card title="Exam Experience"><Toggle label="Auto-Submit on Time Up" /><Toggle label="Randomize Question Order" /><button className="primary">Save System Settings</button></Card><Card title="Notifications"><Toggle label="Email Alerts" /><Toggle label="Critical SMS Alerts" /></Card></div></section>;
}

function Toggle({ label, initial = false }: { label: string; initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return <button className="toggle-row" onClick={() => setOn(!on)}><span>{label}</span><i className={on ? 'on' : ''}><b /></i></button>;
}

function StudentShell({ route, go, signOut, startExam, exams, currentUser, activeExamId }: { route: Route; go: (r: Route) => void; signOut: (next?: Route) => Promise<void>; startExam: (examId?: string, next?: Route) => Promise<void>; exams: Exam[]; currentUser: CurrentUser | null; activeExamId: string }) {
  const readyExams = exams.filter((exam) => exam.status === 'published' && !exam.submittedAt && (exam.questions?.length || 0) > 0);
  const activeExam = readyExams.find((exam) => getExamId(exam) === activeExamId) || readyExams[0];
  if (route === '/student/instructions') return <Instructions startExam={startExam} exam={activeExam} />;
  if (route === '/student/exam') return <ExamInterface go={go} exam={activeExam} currentUser={currentUser} />;
  return (
    <div className="student-shell">
      <aside className="student-nav"><Brand /><button className={route === '/student/dashboard' ? 'active' : ''} onClick={() => go('/student/dashboard')}><Grid2X2 size={16} />Dashboard</button><button className={route === '/student/profile' ? 'active' : ''} onClick={() => go('/student/profile')}><User size={16} />Profile</button><button className={route === '/student/results' ? 'active' : ''} onClick={() => go('/student/results')}><BarChart3 size={16} />Results</button></aside>
      <main className="workspace student-workspace"><header className="student-top"><span>Welcome, {currentUser?.name || 'Student'}</span><UserRound size={18} /><button onClick={() => signOut('/login')}><LogOut size={16} /></button></header>{route === '/student/results' ? <StudentResults go={go} /> : route === '/student/profile' ? <StudentProfile currentUser={currentUser} exams={exams} /> : <StudentDashboard startExam={startExam} exams={exams} />}</main>
    </div>
  );
}

function StudentProfile({ currentUser, exams }: { currentUser: CurrentUser | null; exams: Exam[] }) {
  const assignedCount = exams.filter((exam) => exam.status === 'published').length;

  return (
    <section className="page">
      <h2>Profile</h2>
      <p className="muted">Your account and exam access details.</p>
      <div className="settings-grid">
        <Card title="Student Details">
          <label>Name<input value={currentUser?.name || ''} readOnly placeholder="Not signed in" /></label>
          <label>Email Address<input value={currentUser?.email || ''} readOnly placeholder="Not signed in" /></label>
          <label>Status<input value={currentUser?.status || 'Unauthorized'} readOnly /></label>
        </Card>
        <Card title="Exam Access">
          <div className="ratio"><span>{assignedCount}</span><p>Published exams assigned to this student.</p></div>
        </Card>
      </div>
    </section>
  );
}

function StudentDashboard({ startExam, exams }: { startExam: (examId?: string, next?: Route) => Promise<void>; exams: Exam[] }) {
  const publishedExams = exams.filter((exam) => exam.status === 'published' && (exam.questions?.length || 0) > 0);
  const completedExams = publishedExams.filter((exam) => exam.submittedAt);
  const pendingExams = publishedExams.filter((exam) => !exam.submittedAt);

  return <section className="page"><h2>Dashboard</h2><p className="muted">Welcome back. Here's your assessment overview.</p><div className="stats-grid student-stats"><StatCard stat={{ label: 'Total Exams', value: String(publishedExams.length), tone: 'blue' }} /><StatCard stat={{ label: 'Completed', value: String(completedExams.length), tone: 'green' }} /><StatCard stat={{ label: 'Pending', value: String(pendingExams.length), tone: 'amber' }} /></div><div className="student-grid"><Card title="Upcoming Exams"><div className="exam-list">{publishedExams.length === 0 && <EmptyState icon={<ClipboardList size={28} />} title="No exams assigned" text="Assigned assessments will appear here." />}{publishedExams.map((e) => <article key={getExamId(e) || e.title}><div><strong>{e.title}</strong><small><Clock3 size={13} /> {e.submittedAt ? `Submitted ${new Date(e.submittedAt).toLocaleString()}` : `${e.date} - ${e.duration}`}</small></div><Status value={e.submittedAt ? 'Completed' : 'Available Now'} /><button disabled={Boolean(e.submittedAt)} onClick={() => startExam(getExamId(e), '/student/instructions')} className="primary">{e.submittedAt ? 'Submitted' : 'Start Exam'}</button></article>)}</div></Card><Card title="Recent Activity"><div className="mini-list activity">{completedExams.length === 0 && <EmptyState icon={<Clock3 size={28} />} title="No recent activity" text="Your completed actions will appear here." />}{completedExams.map((exam) => <p key={getExamId(exam)}><span className="dot green" />{exam.title}<small>Submitted {exam.submittedAt ? new Date(exam.submittedAt).toLocaleString() : ''}</small></p>)}</div></Card></div></section>;
}

function Instructions({ startExam, exam }: { startExam: (examId?: string, next?: Route) => Promise<void>; exam?: Exam }) {
  const [agree, setAgree] = useState(false);
  return <main className="instructions"><div className="auth-logo"><Shield /></div><h1>Exam Instructions</h1><p>Please read the proctoring guidelines carefully before proceeding.</p><section className="instruction-card"><div className="warning"><AlertTriangle size={17} /> <strong>Proctoring Active</strong><span>This assessment is strictly AI-proctored. Any violation may lead to immediate disqualification.</span></div><div className="rule-grid"><Rule icon={<Monitor />} title="No tab switching" text="Navigating away from the exam tab will trigger an alert." /><Rule icon={<Camera />} title="Webcam must be ON" text="Your face must remain visible within the camera frame." /><Rule icon={<Bell />} title="No external help" text="Microphone captures background noise. Strictly no talking." /><Rule icon={<CheckCircle2 />} title="Stable Connection" text="Ensure uninterrupted internet connection before starting." /></div><label className="agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree to the terms and conditions</label><button className="primary full" disabled={!agree || !exam} onClick={() => startExam(exam ? getExamId(exam) : undefined, '/student/exam')}>Start Assessment</button></section></main>;
}

function Rule({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rule">{icon}<div><strong>{title}</strong><p>{text}</p></div></article>;
}

function makeProctorEvent(type: string, message: string, severity: ProctorEvent['severity'] = 'warning'): ProctorEvent {
  return { type, message, severity, createdAt: new Date().toISOString() };
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function recordingSrc(recording?: Recording) {
  if (!recording?.data) return '';
  return recording.data.startsWith('data:')
    ? recording.data
    : `data:${recording.mimeType || 'video/webm'};base64,${recording.data}`;
}

function durationToMs(duration?: string) {
  const text = (duration || '').toLowerCase();
  const hours = Number(text.match(/(\d+(?:\.\d+)?)\s*h/)?.[1] || 0);
  const minutes = Number(text.match(/(\d+(?:\.\d+)?)\s*m/)?.[1] || text.match(/^(\d+)$/)?.[1] || 90);
  return Math.max(1, hours * 60 + minutes) * 60 * 1000;
}

function formatRemainingTime(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function reportForSubmission(submission: Submission) {
  const warnings = submission.proctorEvents || [];
  const critical = warnings.filter((event) => event.severity === 'critical').length;
  const tabSwitches = submission.tabSwitchCount || 0;
  const fullscreenExits = submission.fullscreenExitCount || 0;
  const score = Math.min(100, warnings.length * 8 + critical * 12 + tabSwitches * 15 + fullscreenExits * 10);
  const label = score >= 70 ? 'High Risk' : score >= 35 ? 'Suspicious' : 'Safe';

  return {
    critical,
    fullscreenExits,
    label,
    score,
    tabSwitches,
    warnings: warnings.length
  };
}

function starterCode(language?: string) {
  if (['JavaScript', 'Node.js'].includes(language || '')) {
    return `const values = input.trim().split(/\\s+/).map(Number);\nconsole.log(values.reduce((total, value) => total + value, 0));`;
  }

  if (language === 'TypeScript') {
    return `const values: number[] = input.trim().split(/\\s+/).map(Number);\nconsole.log(values.reduce((total, value) => total + value, 0));`;
  }

  if (language === 'React') {
    return `const values = input.trim().split(/\\s+/).map(Number);\nconsole.log(values.reduce((total, value) => total + value, 0));`;
  }

  if (language === 'Python') {
    return `import sys\nvalues = list(map(int, sys.stdin.read().split()))\nprint(sum(values))`;
  }

  if (language === 'C++') {
    return `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  long long value, total = 0;\n  while (cin >> value) total += value;\n  cout << total;\n  return 0;\n}`;
  }

  return `import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner scanner = new Scanner(System.in);\n    long total = 0;\n    while (scanner.hasNextLong()) total += scanner.nextLong();\n    System.out.print(total);\n  }\n}`;
}

function formatRunResult(result: { summary?: string; runtimeMs?: number; results?: Array<{ index: number; input: string; expected: string; actual: string; passed: boolean; error?: string }> }) {
  const lines = [
    result.summary || 'No test result returned',
    `Runtime: ${result.runtimeMs || 0}ms`,
    ''
  ];

  for (const testCase of result.results || []) {
    lines.push(`Test ${testCase.index + 1}: ${testCase.passed ? 'Passed' : 'Failed'}`);
    if (testCase.error) lines.push(`Error: ${testCase.error}`);
    lines.push(`Input:\n${testCase.input || '(empty)'}`);
    lines.push(`Actual Output:\n${testCase.actual || '(no output)'}`);
    lines.push(`Expected Output:\n${testCase.expected || '(not provided)'}`);
    lines.push('');
  }

  return lines.join('\n').trim();
}

function estimateFacesFromFrame(frame: Uint8ClampedArray, width: number, height: number): FaceBox[] {
  const columnHits = Array.from({ length: width }, () => 0);

  for (let y = Math.floor(height * 0.16); y < Math.floor(height * 0.82); y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const r = frame[offset];
      const g = frame[offset + 1];
      const b = frame[offset + 2];
      const brightness = (r + g + b) / 3;
      const skinLike = r > 70 && g > 45 && b > 35 && r > b * 1.08 && brightness > 55 && brightness < 235;
      if (skinLike) columnHits[x] += 1;
    }
  }

  const faces: FaceBox[] = [];
  let start = -1;

  for (let x = 0; x <= width; x += 1) {
    const active = x < width && columnHits[x] > height * 0.1;
    if (active && start === -1) start = x;
    if ((!active || x === width) && start !== -1) {
      const end = x - 1;
      if (end - start > width * 0.12) {
        faces.push({
          x: start,
          y: height * 0.16,
          width: end - start,
          height: height * 0.66
        });
      }
      start = -1;
    }
  }

  return faces;
}

function analyzeFaceRegion(frame: Uint8ClampedArray, frameWidth: number, frameHeight: number, face: FaceBox) {
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const left = clamp(Math.floor(face.x), 0, frameWidth - 1);
  const right = clamp(Math.floor(face.x + face.width), 1, frameWidth);
  const top = clamp(Math.floor(face.y), 0, frameHeight - 1);
  const bottom = clamp(Math.floor(face.y + face.height), 1, frameHeight);
  const faceCenter = (left + right) / 2;

  let brightPixels = 0;
  let weightedX = 0;
  let mouthDarkPixels = 0;
  let mouthPixels = 0;
  let eyeDarkPixels = 0;
  let eyeWeightedX = 0;

  const mouthLeft = clamp(Math.floor(left + face.width * 0.32), 0, frameWidth - 1);
  const mouthRight = clamp(Math.floor(left + face.width * 0.68), 1, frameWidth);
  const mouthTop = clamp(Math.floor(top + face.height * 0.62), 0, frameHeight - 1);
  const mouthBottom = clamp(Math.floor(top + face.height * 0.82), 1, frameHeight);
  const eyeLeft = clamp(Math.floor(left + face.width * 0.2), 0, frameWidth - 1);
  const eyeRight = clamp(Math.floor(left + face.width * 0.8), 1, frameWidth);
  const eyeTop = clamp(Math.floor(top + face.height * 0.28), 0, frameHeight - 1);
  const eyeBottom = clamp(Math.floor(top + face.height * 0.46), 1, frameHeight);

  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const offset = (y * frameWidth + x) * 4;
      const r = frame[offset];
      const g = frame[offset + 1];
      const b = frame[offset + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > 58) {
        brightPixels += 1;
        weightedX += x;
      }

      if (x >= mouthLeft && x <= mouthRight && y >= mouthTop && y <= mouthBottom) {
        mouthPixels += 1;
        if (brightness < 36 && r < 75 && g < 75 && b < 75) mouthDarkPixels += 1;
      }

      if (x >= eyeLeft && x <= eyeRight && y >= eyeTop && y <= eyeBottom && brightness < 55) {
        eyeDarkPixels += 1;
        eyeWeightedX += x;
      }
    }
  }

  const visualCenter = brightPixels > 0 ? weightedX / brightPixels : faceCenter;
  const mouthOpen = mouthPixels > 0 && mouthDarkPixels / mouthPixels > 0.16;
  const eyeCenter = eyeDarkPixels > 8 ? eyeWeightedX / eyeDarkPixels : faceCenter;
  const gazeAway = eyeDarkPixels > 8 && Math.abs(eyeCenter - faceCenter) > face.width * 0.13;

  return { visualCenter, mouthOpen, gazeAway };
}

function colorSignatureFromFrame(frame: Uint8ClampedArray, frameWidth: number, frameHeight: number, face?: FaceBox): FaceSignature {
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const left = face ? clamp(Math.floor(face.x), 0, frameWidth - 1) : 0;
  const right = face ? clamp(Math.floor(face.x + face.width), 1, frameWidth) : frameWidth;
  const top = face ? clamp(Math.floor(face.y), 0, frameHeight - 1) : 0;
  const bottom = face ? clamp(Math.floor(face.y + face.height), 1, frameHeight) : frameHeight;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let y = top; y < bottom; y += 3) {
    for (let x = left; x < right; x += 3) {
      const offset = (y * frameWidth + x) * 4;
      r += frame[offset];
      g += frame[offset + 1];
      b += frame[offset + 2];
      count += 1;
    }
  }

  const safeCount = Math.max(count, 1);
  const avgR = r / safeCount;
  const avgG = g / safeCount;
  const avgB = b / safeCount;

  return {
    r: avgR,
    g: avgG,
    b: avgB,
    brightness: (avgR + avgG + avgB) / 3
  };
}

function signatureDistance(a: FaceSignature, b: FaceSignature) {
  return Math.sqrt(
    ((a.r - b.r) ** 2)
    + ((a.g - b.g) ** 2)
    + ((a.b - b.b) ** 2)
    + ((a.brightness - b.brightness) ** 2)
  );
}

async function registeredPhotoSignature(src: string): Promise<FaceSignature | null> {
  if (!src) return null;

  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = async () => {
      const canvas = document.createElement('canvas');
      const canvasWidth = Math.min(image.naturalWidth || 320, 320);
      const canvasHeight = Math.min(image.naturalHeight || 240, 240);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        resolve(null);
        return;
      }
      context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
      const data = context.getImageData(0, 0, canvasWidth, canvasHeight);

      const FaceDetectorApi = (window as typeof window & { FaceDetector?: FaceDetectorConstructor }).FaceDetector;
      const faceDetector = FaceDetectorApi ? new FaceDetectorApi({ fastMode: true, maxDetectedFaces: 1 }) : null;
      let faceToUse: FaceBox | undefined = undefined;

      try {
        const detected = faceDetector ? await faceDetector.detect(canvas).catch(() => []) : [];
        if (detected && detected.length > 0) {
          faceToUse = detected[0].boundingBox;
        } else {
          const estimated = estimateFacesFromFrame(data.data, canvasWidth, canvasHeight);
          if (estimated.length > 0) {
            faceToUse = estimated[0];
          }
        }
      } catch (err) {}

      resolve(colorSignatureFromFrame(data.data, canvasWidth, canvasHeight, faceToUse));
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function ExamInterface({ go, exam, currentUser }: { go: (r: Route) => void; exam?: Exam; currentUser: CurrentUser | null }) {
  const [index, setIndex] = useState(0);
  const [output, setOutput] = useState('');
  const [answers, setAnswers] = useState<Record<number, { code: string; input: string; output: string }>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [events, setEvents] = useState<ProctorEvent[]>([]);
  const [mediaError, setMediaError] = useState('');
  const [tabWarning, setTabWarning] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState('Starting');
  const [mouthStatus, setMouthStatus] = useState('Clear');
  const [gazeStatus, setGazeStatus] = useState('Center');
  const [peopleStatus, setPeopleStatus] = useState('One person');
  const [identityStatus, setIdentityStatus] = useState(currentUser?.registeredPhoto ? 'Verifying' : 'No photo');
  const [microphoneStatus, setMicrophoneStatus] = useState('Starting');
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [remainingMs, setRemainingMs] = useState(() => durationToMs(exam?.duration));
  const tabSwitchCountRef = useRef(0);
  const fullscreenExitCountRef = useRef(0);
  const autoSubmitRef = useRef(false);
  const submittingRef = useRef(false);
  const answersRef = useRef(answers);
  const eventsRef = useRef(events);
  const submitExamRef = useRef<() => Promise<void>>(async () => undefined);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const baselineCenter = useRef<number | null>(null);
  const lastWarningAt = useRef<Record<string, number>>({});
  const lastTabViolationAt = useRef(0);
  const mouthOpenFrames = useRef(0);
  const gazeAwayFrames = useRef(0);
  const noFaceFrames = useRef(0);
  const identityMismatchFrames = useRef(0);
  const extraPersonFrames = useRef(0);
  const frameAnalyzing = useRef(false);
  const registeredSignatureRef = useRef<FaceSignature | null>(null);
  const activeQuestions = exam?.questions?.length ? exam.questions : [];
  const storageKey = exam ? `exam-progress:${getExamId(exam)}` : '';
  const q = activeQuestions[index];
  const currentAnswer = answers[index] || {
    code: starterCode(exam?.language),
    input: q?.sample || '',
    output: ''
  };
  const answerForQuestion = (questionIndex: number) => {
    const question = activeQuestions[questionIndex];
    return answersRef.current[questionIndex] || {
      code: starterCode(exam?.language),
      input: question?.sample || '',
      output: ''
    };
  };
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);
  useEffect(() => {
    let cancelled = false;
    registeredSignatureRef.current = null;
    setIdentityStatus(currentUser?.registeredPhoto ? 'Verifying' : 'No photo');
    if (!currentUser?.registeredPhoto) return undefined;

    registeredPhotoSignature(currentUser.registeredPhoto).then((signature) => {
      if (cancelled) return;
      registeredSignatureRef.current = signature;
      setIdentityStatus(signature ? 'Matched' : 'Photo unavailable');
    });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.registeredPhoto]);
  useEffect(() => {
    if (!exam || !storageKey) return;
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const progress = JSON.parse(saved) as {
          answers?: Record<number, { code: string; input: string; output: string }>;
          index?: number;
          tabSwitchCount?: number;
          fullscreenExitCount?: number;
          markedForReview?: Record<number, boolean>;
          endAt?: number;
        };
        if (progress.answers) setAnswers(progress.answers);
        if (progress.markedForReview) setMarkedForReview(progress.markedForReview);
        if (Number.isFinite(progress.index)) setIndex(Math.min(Math.max(Number(progress.index), 0), Math.max(activeQuestions.length - 1, 0)));
        if (Number.isFinite(progress.tabSwitchCount)) {
          tabSwitchCountRef.current = Number(progress.tabSwitchCount);
          setTabSwitchCount(tabSwitchCountRef.current);
        }
        if (Number.isFinite(progress.fullscreenExitCount)) {
          fullscreenExitCountRef.current = Number(progress.fullscreenExitCount);
          setFullscreenExitCount(fullscreenExitCountRef.current);
        }
        if (Number.isFinite(progress.endAt)) setRemainingMs(Math.max(0, Number(progress.endAt) - Date.now()));
      } catch (error) {
        sessionStorage.removeItem(storageKey);
      }
    } else {
      const endAt = Date.now() + durationToMs(exam.duration);
      sessionStorage.setItem(storageKey, JSON.stringify({ answers: {}, index: 0, tabSwitchCount: 0, fullscreenExitCount: 0, endAt }));
      setRemainingMs(durationToMs(exam.duration));
    }
  }, [exam, storageKey, activeQuestions.length]);
  useEffect(() => {
    if (!storageKey) return;
    const existing = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
    const endAt = Number(existing.endAt) || Date.now() + durationToMs(exam?.duration);
      sessionStorage.setItem(storageKey, JSON.stringify({
      ...existing,
      answers,
      index,
      markedForReview,
      tabSwitchCount,
      fullscreenExitCount,
      endAt
    }));
  }, [answers, index, markedForReview, tabSwitchCount, fullscreenExitCount, storageKey, exam?.duration]);
  const addWarning = (type: string, message: string, severity: ProctorEvent['severity'] = 'warning') => {
    const now = Date.now();
    if (now - (lastWarningAt.current[type] || 0) < 4500) return;
    lastWarningAt.current[type] = now;
    const event = makeProctorEvent(type, message, severity);
    setEvents((current) => [event, ...current].slice(0, 50));
    if (exam) {
      fetch(`/api/exams/${getExamId(exam)}/events`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(() => undefined);
    }
  };
  const autoSubmitForViolation = (type: string, message: string) => {
    const finalEvent = makeProctorEvent(type, message, 'critical');
    eventsRef.current = [finalEvent, ...eventsRef.current];
    setEvents((current) => [finalEvent, ...current].slice(0, 50));

    if (exam) {
      fetch(`/api/exams/${getExamId(exam)}/events`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalEvent)
      }).catch(() => undefined);
    }

    if (!autoSubmitRef.current) {
      autoSubmitRef.current = true;
      void submitExamRef.current();
    }
  };
  const updateAnswer = (field: 'code' | 'input' | 'output', value: string) => {
    setAnswers((current) => ({
      ...current,
      [index]: { ...(current[index] || currentAnswer), [field]: value }
    }));
    if (field === 'output') setOutput(value);
  };
  const finishRecording = async (): Promise<Recording> => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        recorder.addEventListener('stop', () => resolve(), { once: true });
        recorder.stop();
      });
    }

    const blob = new Blob(recordingChunksRef.current, { type: recorder?.mimeType || 'video/webm' });
    if (blob.size === 0) return {};
    return {
      mimeType: blob.type,
      data: await blobToDataUrl(blob),
      size: blob.size
    };
  };

  useEffect(() => {
    if (!exam) return undefined;
    let stopped = false;
    let visualTimer = 0;
    let audioFrame = 0;
    let audioContext: AudioContext | null = null;

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraStatus('Live');
        setMicrophoneStatus('Live');
        await fetch(`/api/exams/${getExamId(exam!)}/start`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }).catch(() => undefined);

        recordingChunksRef.current = [];
        const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm' });
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordingChunksRef.current.push(event.data);
        };
        recorder.start(1000);
        recorderRef.current = recorder;

        const audioStream = new MediaStream(stream.getAudioTracks());
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(audioStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const samples = new Uint8Array(analyser.frequencyBinCount);
        const watchAudio = () => {
          analyser.getByteFrequencyData(samples);
          const average = samples.reduce((total, value) => total + value, 0) / samples.length;
          setMicrophoneStatus(average > 28 ? 'Noise detected' : 'Live');
          if (average > 35) addWarning('audio', 'Microphone detected possible speech or loud background sound.');
          audioFrame = window.requestAnimationFrame(watchAudio);
        };
        watchAudio();

        const FaceDetectorApi = (window as typeof window & { FaceDetector?: FaceDetectorConstructor }).FaceDetector;
        const faceDetector = FaceDetectorApi ? new FaceDetectorApi({ fastMode: true, maxDetectedFaces: 4 }) : null;

        visualTimer = window.setInterval(async () => {
          if (frameAnalyzing.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return;
          frameAnalyzing.current = true;

          try {
            const width = 240;
            const height = 180;
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) return;

            context.drawImage(video, 0, 0, width, height);
            const image = context.getImageData(0, 0, width, height);
            const detectedFaces = faceDetector
              ? await faceDetector.detect(canvas).catch(() => [])
              : [];
            const faces = detectedFaces.length > 0
              ? detectedFaces.map((face) => face.boundingBox)
              : estimateFacesFromFrame(image.data, width, height);

            if (faces.length > 1) {
              extraPersonFrames.current += 1;
              setPeopleStatus('Extra person');
              if (extraPersonFrames.current >= 2) addWarning('extra-person', 'Another person appears to be visible in the camera frame.', 'critical');
              if (extraPersonFrames.current >= 4) autoSubmitForViolation('extra-person-submit', 'Another person was detected repeatedly. Assessment auto-submitted.');
            } else {
              extraPersonFrames.current = 0;
              setPeopleStatus(faces.length === 1 ? 'One person' : 'No person');
            }

            if (faces.length === 0) {
              noFaceFrames.current += 1;
              addWarning('camera', 'Candidate face is not clearly visible.', 'critical');
              setCameraStatus('Face missing');
              setIdentityStatus('No face');
              setMouthStatus('Clear');
              setGazeStatus('Unknown');
              mouthOpenFrames.current = 0;
              gazeAwayFrames.current = 0;
              if (noFaceFrames.current >= 6) autoSubmitForViolation('face-missing-submit', 'No candidate face was detected for the allowed period. Assessment auto-submitted.');
              return;
            }

            noFaceFrames.current = 0;
            const primaryFace = faces.reduce((largest, face) => (face.width * face.height > largest.width * largest.height ? face : largest), faces[0]);
            const analysis = analyzeFaceRegion(image.data, width, height, primaryFace);
            const registeredSignature = registeredSignatureRef.current;

            if (registeredSignature) {
              const liveSignature = colorSignatureFromFrame(image.data, width, height, primaryFace);
              const distance = signatureDistance(registeredSignature, liveSignature);
              if (distance > 95) {
                identityMismatchFrames.current += 1;
                setIdentityStatus('Mismatch');
                if (identityMismatchFrames.current >= 3) addWarning('identity-mismatch', 'Camera face does not match the registered student photo.', 'critical');
                if (identityMismatchFrames.current >= 6) autoSubmitForViolation('identity-mismatch-submit', 'Registered face verification failed. Assessment auto-submitted.');
              } else {
                identityMismatchFrames.current = 0;
                setIdentityStatus('Matched');
              }
            }

            if (baselineCenter.current === null) baselineCenter.current = analysis.visualCenter;
            const movement = Math.abs(analysis.visualCenter - baselineCenter.current);
            if (movement > primaryFace.width * 0.18) addWarning('head-movement', 'Candidate head movement detected.');
            baselineCenter.current = baselineCenter.current * 0.92 + analysis.visualCenter * 0.08;
            setCameraStatus(movement > primaryFace.width * 0.18 ? 'Movement' : 'Live');

            if (analysis.mouthOpen) {
              mouthOpenFrames.current += 1;
              setMouthStatus('Open');
              if (mouthOpenFrames.current >= 3) addWarning('mouth-open', 'Candidate mouth appears open.');
            } else {
              mouthOpenFrames.current = 0;
              setMouthStatus('Clear');
            }

            if (analysis.gazeAway) {
              gazeAwayFrames.current += 1;
              setGazeStatus('Away');
              if (gazeAwayFrames.current >= 3) addWarning('gaze-away', 'Candidate eyes appear to be looking away from the screen.');
            } else {
              gazeAwayFrames.current = 0;
              setGazeStatus('Center');
            }
          } finally {
            frameAnalyzing.current = false;
          }
        }, 900);
      } catch (error) {
        setMediaError('Camera or microphone permission is required for this assessment.');
        setCameraStatus('Blocked');
        setMicrophoneStatus('Blocked');
        addWarning('media-blocked', 'Camera or microphone permission was blocked.', 'critical');
      }
    };

    startMedia();

    return () => {
      stopped = true;
      window.clearInterval(visualTimer);
      window.cancelAnimationFrame(audioFrame);
      if (audioContext) void audioContext.close();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const submitExam = async () => {
    if (!exam || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const recording = await finishRecording();
      const response = await fetch(`/api/exams/${getExamId(exam)}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: activeQuestions.map((_, questionIndex) => ({
            questionIndex,
            code: answerForQuestion(questionIndex).code,
            input: answerForQuestion(questionIndex).input,
            output: answerForQuestion(questionIndex).output
          })),
          proctorEvents: eventsRef.current,
          cameraStatus,
          microphoneStatus,
          tabSwitchCount: tabSwitchCountRef.current,
          fullscreenExitCount: fullscreenExitCountRef.current,
          recording
        })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        alert(result.message || 'Unable to submit assessment.');
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      sessionStorage.removeItem('activeExamId');
      if (storageKey) sessionStorage.removeItem(storageKey);
      sessionStorage.setItem('lastSubmissionAt', new Date().toISOString());
      go('/student/results');
    } catch (error) {
      alert('Backend is not reachable. Please try submitting again.');
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  useEffect(() => {
    submitExamRef.current = submitExam;
  });

  useEffect(() => {
    if (!exam || !storageKey) return undefined;
    const timer = window.setInterval(() => {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      const endAt = Number(saved.endAt) || Date.now() + durationToMs(exam.duration);
      const nextRemaining = Math.max(0, endAt - Date.now());
      setRemainingMs(nextRemaining);
      if (nextRemaining <= 0 && !autoSubmitRef.current) {
        autoSubmitRef.current = true;
        addWarning('time-up', 'Exam timer ended. Assessment auto-submitted.', 'critical');
        void submitExamRef.current();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [exam, storageKey]);

  useEffect(() => {
    if (!exam) return undefined;
    const save = () => {
      fetch(`/api/exams/${getExamId(exam)}/autosave`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: activeQuestions.map((_, questionIndex) => ({
            questionIndex,
            code: answerForQuestion(questionIndex).code,
            input: answerForQuestion(questionIndex).input,
            output: answerForQuestion(questionIndex).output
          })),
          proctorEvents: eventsRef.current.slice(0, 10),
          cameraStatus,
          microphoneStatus,
          tabSwitchCount: tabSwitchCountRef.current,
          fullscreenExitCount: fullscreenExitCountRef.current
        })
      }).catch(() => undefined);
    };
    const timer = window.setInterval(save, 5000);
    return () => window.clearInterval(timer);
  }, [exam, activeQuestions.length, cameraStatus, microphoneStatus]);

  const runCode = async () => {
    if (running) return;
    setRunning(true);

    const testCases = q.testCases?.length
      ? q.testCases
      : [{ input: currentAnswer.input || q.sample, expected: q.expected }];

    try {
      const response = await fetch('/api/code/run', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: exam?.language,
          code: currentAnswer.code,
          testCases
        })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        updateAnswer('output', result.message || 'Unable to run code.');
        return;
      }

      updateAnswer('output', formatRunResult(result));
    } catch (error) {
      updateAnswer('output', 'Backend runner is not reachable. Please start the API server and try again.');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (!exam) return undefined;

    const enterFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => undefined);
      }
    };
    const registerViolation = (type: 'tab-switch' | 'fullscreen-exit' | 'restricted-key', message: string) => {
      addWarning(type, message, 'critical');

      if (type === 'tab-switch') {
        const now = Date.now();
        if (now - lastTabViolationAt.current < 900) return;
        lastTabViolationAt.current = now;
        tabSwitchCountRef.current += 1;
        setTabSwitchCount(tabSwitchCountRef.current);
        if (tabSwitchCountRef.current >= 3 && !autoSubmitRef.current) {
          autoSubmitRef.current = true;
          void submitExamRef.current();
        } else {
          setTabWarning(`Warning ${tabSwitchCountRef.current}/3: ${message}`);
        }
      }

      if (type === 'fullscreen-exit') {
        fullscreenExitCountRef.current += 1;
        setFullscreenExitCount(fullscreenExitCountRef.current);
        enterFullscreen();
      }
    };
    const onVisibility = () => {
      if (document.hidden) registerViolation('tab-switch', 'Tab switch or window minimize detected.');
    };
    const onBlur = () => registerViolation('tab-switch', 'Exam window lost focus.');
    const onFullscreen = () => {
      if (!document.fullscreenElement) registerViolation('fullscreen-exit', 'Fullscreen mode exited during exam.');
    };
    const blockEvent = (event: Event) => {
      event.preventDefault();
      addWarning('blocked-action', 'Copy, paste, or right-click was blocked during the exam.');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const restricted = event.key === 'F12'
        || (event.ctrlKey && event.shiftKey && key === 'i')
        || (event.ctrlKey && key === 'u')
        || (event.ctrlKey && ['c', 'v', 'x'].includes(key))
        || event.key === 'PrintScreen';

      if (restricted) {
        event.preventDefault();
        registerViolation('restricted-key', 'Restricted keyboard shortcut blocked.');
      }
    };

    enterFullscreen();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('copy', blockEvent);
    document.addEventListener('paste', blockEvent);
    document.addEventListener('cut', blockEvent);
    document.addEventListener('contextmenu', blockEvent);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('copy', blockEvent);
      document.removeEventListener('paste', blockEvent);
      document.removeEventListener('cut', blockEvent);
      document.removeEventListener('contextmenu', blockEvent);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [exam]);

  if (!exam) {
    return <main className="exam"><header className="exam-bar"><span><Clock3 size={15} /> Preparing</span><strong>Assessment Workspace</strong><span className="health">READY</span></header><section className="exam-empty"><EmptyState icon={<Code2 size={36} />} title="Loading assessment" text="Open the assigned exam from your dashboard to begin the protected assessment." /><button className="primary" onClick={() => go('/student/dashboard')}>Back to Dashboard</button></section></main>;
  }

  if (!q) {
    return <main className="exam"><header className="exam-bar"><span><Clock3 size={15} /> No active timer</span><strong>{exam.title}</strong><span className="health">READY</span></header><section className="exam-empty"><EmptyState icon={<FileText size={36} />} title="No questions found" text="This exam was published before questions were saved. Ask the admin to add a question and publish it again." /><button className="primary" onClick={() => go('/student/dashboard')}>Back to Dashboard</button></section></main>;
  }
  const hasWarnings = Boolean(events.length || tabSwitchCount || fullscreenExitCount || mediaError);
  const paletteClass = (questionIndex: number) => {
    const answer = answers[questionIndex];
    const classes = ['question-dot'];
    if (questionIndex === index) classes.push('current');
    if (answer?.code?.trim() || answer?.output?.trim()) classes.push('answered');
    if (markedForReview[questionIndex]) classes.push('review');
    return classes.join(' ');
  };

  return (
    <main className="exam exam-screen">
      <header className="exam-bar">
        <span className="timer-pill"><Clock3 size={15} /> {formatRemainingTime(remainingMs)}</span>
        <strong>{exam?.title || 'Assessment Workspace'}</strong>
        <span className="student-chip"><UserRound size={14} /> Candidate</span>
        <select value={exam?.language || 'Java'} aria-label="Language" onChange={() => undefined}>
          <option>{exam?.language || 'Java'}</option>
        </select>
        <span className={cameraStatus === 'Live' ? 'health' : 'face-chip'}>CAM</span>
        <span className={microphoneStatus === 'Live' ? 'health' : 'face-chip'}>MIC</span>
      </header>

      <section className="exam-grid">
        <aside className="problem">
          <div className="question-head">
            <h2>Question {index + 1}</h2>
            <Status value="Medium" />
          </div>
          <p>{q.prompt}</p>
          <pre><b>Sample Input</b>{`\n${q.sample || currentAnswer.input || '(empty)'}`}</pre>
          <pre><b>Expected Output</b>{`\n${q.expected || '(not provided)'}`}</pre>
          <button className={markedForReview[index] ? 'review-toggle active' : 'review-toggle'} onClick={() => setMarkedForReview((current) => ({ ...current, [index]: !current[index] }))}>
            {markedForReview[index] ? 'Marked for review' : 'Mark for review'}
          </button>
        </aside>

        <section className="editor">
          <div className="code-shell">
            <textarea className="code-input" value={currentAnswer.code} onChange={(event) => updateAnswer('code', event.target.value)} spellCheck={false} />
          </div>
          <div className="console-card">
            <div className="console-head">
              <span>Test Console</span>
              <button disabled={running} onClick={runCode}><Play size={14} /> {running ? 'Running...' : 'Run'}</button>
              <button className="primary" disabled={submitting} onClick={() => void submitExam()}>{submitting ? 'Submitting...' : 'Submit'}</button>
            </div>
            <div className="console">
              <label>Input<textarea value={currentAnswer.input} onChange={(event) => updateAnswer('input', event.target.value)} placeholder="Enter input..." /></label>
              <label>Output<textarea value={currentAnswer.output || output} readOnly placeholder="Run code to see output..." /></label>
            </div>
          </div>
        </section>

        <aside className="proctor-panel">
          <div className="proctor-title">
            <h3>AI PROCTORING</h3>
            <span className={hasWarnings ? 'warn-badge' : 'clear-badge'}>{hasWarnings ? 'WARNING' : 'CLEAR'}</span>
          </div>
          <div className="webcam"><video ref={videoRef} autoPlay muted playsInline /><canvas ref={canvasRef} hidden /><span>REC</span></div>
          <p><b>Identity</b><em className={identityStatus === 'Matched' || identityStatus === 'No photo' ? 'ok' : ''}>{identityStatus}</em></p>
          <p><b>Face Detection</b><em className={cameraStatus === 'Live' ? 'ok' : ''}>{cameraStatus === 'Live' ? 'Detected' : cameraStatus}</em></p>
          <p><b>Eye Gaze</b><em className={gazeStatus === 'Center' ? 'ok' : ''}>{gazeStatus}</em></p>
          <p><b>Mouth</b><em className={mouthStatus === 'Clear' ? 'ok' : ''}>{mouthStatus}</em></p>
          <p><b>Head Pose</b><em className={cameraStatus === 'Live' ? 'ok' : ''}>{cameraStatus === 'Live' ? 'Forward' : cameraStatus}</em></p>
          <p><b>Objects</b><em className={peopleStatus === 'One person' ? 'ok' : ''}>{peopleStatus === 'One person' ? 'Clear' : peopleStatus}</em></p>
          <p><b>Microphone</b><em className={microphoneStatus === 'Live' ? 'ok' : ''}>{microphoneStatus}</em></p>
          <p><b>Tab Focus</b><em className={tabSwitchCount === 0 ? 'ok' : ''}>{tabSwitchCount === 0 ? 'Focused' : `${tabSwitchCount} / 3`}</em></p>
          <p><b>Fullscreen</b><em className={fullscreenExitCount === 0 ? 'ok' : ''}>{fullscreenExitCount === 0 ? 'Active' : `${fullscreenExitCount} exits`}</em></p>
          <div className="activity-log">
            <strong>Activity Log ({events.length})</strong>
            {mediaError && <div className="recent-alert danger">{mediaError}</div>}
            {events.length === 0
              ? <div className="recent-alert">No alerts - all clear</div>
              : events.slice(0, 6).map((event) => <p key={`${event.createdAt}-${event.type}`}><AlertTriangle size={12} /> {new Date(event.createdAt).toLocaleTimeString()} - {event.message}</p>)}
          </div>
        </aside>
      </section>

      <footer className="exam-actions">
        <button disabled={index === 0 || submitting} onClick={() => setIndex(index - 1)}>Previous</button>
        <div className="question-palette">
          {activeQuestions.map((_, i) => <button key={i} className={paletteClass(i)} onClick={() => setIndex(i)}>{i + 1}</button>)}
        </div>
        <div className="footer-actions">
          <button disabled={index === activeQuestions.length - 1 || submitting} onClick={() => setIndex(Math.min(index + 1, activeQuestions.length - 1))}>Next <ChevronRight size={14} /></button>
          <button className="primary" disabled={submitting} onClick={() => void submitExam()}>{submitting ? 'Submitting...' : 'Submit'}</button>
        </div>
      </footer>
      {tabWarning && (
        <div className="modal-backdrop">
          <div className="auth-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <div className="auth-logo" style={{ color: 'var(--accent-red)' }}>
              <AlertTriangle size={32} />
            </div>
            <h3 style={{ margin: '1rem 0' }}>Exam Violation Warning</h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>{tabWarning}</p>
            <button className="primary full" onClick={() => setTabWarning(null)}>I Understand</button>
          </div>
        </div>
      )}
    </main>
  );
}
function StudentResults({ go }: { go: (r: Route) => void }) {
  const [results, setResults] = useState<Submission[]>([]);
  const [selectedResult, setSelectedResult] = useState<Submission | null>(null);

  useEffect(() => {
    fetch('/api/exams/results', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (Array.isArray(result?.results)) {
          setResults(result.results);
          if (result.results.length > 0) {
            setSelectedResult(result.results[0]);
          }
        }
      })
      .catch(() => undefined);
  }, []);

  const report = selectedResult ? reportForSubmission(selectedResult) : null;
  const isPublished = selectedResult?.status === 'published';

  return (
    <section className="page">
      <button className="back" onClick={() => go('/student/dashboard')}>
        <ArrowLeft size={15} /> Back to Dashboard
      </button>
      <div className="result-layout">
        <section className={`score-card ${!isPublished ? 'empty-score' : ''}`}>
          <Trophy size={48} />
          {selectedResult ? (
            isPublished ? (
              <div style={{ width: '100%' }}>
                <h3>Result Published</h3>
                <p className="muted" style={{ marginBottom: '1rem' }}>Your reviewed assessment details.</p>
                <div className="report-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <article style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px' }}>
                    <b>{report?.label}</b>
                    <small>Overall Risk</small>
                  </article>
                  <article style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px' }}>
                    <b>{report?.score}%</b>
                    <small>Risk Score</small>
                  </article>
                  <article style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px' }}>
                    <b>{report?.warnings}</b>
                    <small>Warnings</small>
                  </article>
                  <article style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px' }}>
                    <b>{selectedResult.tabSwitchCount || 0}</b>
                    <small>Tab Switches</small>
                  </article>
                </div>
                <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-purple)' }}>
                  <strong>Admin Note:</strong>
                  <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#e5e7eb' }}>{selectedResult.resultNote || 'Verified by admin.'}</p>
                </div>
              </div>
            ) : (
              <div>
                <h3>Assessment Submitted</h3>
                <p>Submitted for admin review on {selectedResult.submittedAt ? new Date(selectedResult.submittedAt).toLocaleString() : new Date().toLocaleString()}.</p>
                <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Your results will appear here once the administrator approves your proctoring logs.</p>
              </div>
            )
          ) : (
            <div>
              <h3>No Result Available</h3>
              <p>Completed assessment results will appear here once they are published.</p>
            </div>
          )}
        </section>

        <div>
          <Card title="Assessment Results">
            {results.length === 0 ? (
              <EmptyState icon={<BarChart3 size={28} />} title="No results yet" text="No submitted or reviewed exams found." />
            ) : (
              <DataTable headers={['Exam', 'Language', 'Submitted At', 'Status', 'Action']}>
                {results.map((result) => (
                  <tr key={result._id} className={selectedResult?._id === result._id ? 'active-row' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelectedResult(result)}>
                    <td><strong>{result.exam?.title || 'Assessment'}</strong></td>
                    <td>{result.exam?.language || '-'}</td>
                    <td>{result.submittedAt ? new Date(result.submittedAt).toLocaleString() : '-'}</td>
                    <td><Status value={result.status === 'published' ? 'Published' : 'Under Review'} /></td>
                    <td>
                      <button className="link-btn" onClick={(e) => { e.stopPropagation(); setSelectedResult(result); }}>
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </Card>
          <Card title="Question-wise Result">
            <DataTable headers={['Q No.', 'Topic', 'Time Taken', 'Status']}>
              <tr>
                <td colSpan={4}>
                  <EmptyState icon={<FileText size={28} />} title={isPublished ? 'Reviewed' : 'Submission saved'} text={isPublished ? 'Detailed question outcomes verified by admin.' : 'Question-level outcomes will appear after review.'} />
                </td>
              </tr>
            </DataTable>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Progress({ label, value, max }: { label: string; value: number; max: number }) {
  return <div className="progress"><div><span>{label}</span><b>{value} / {max}</b></div><i><span style={{ width: `${(value / max) * 100}%` }} /></i></div>;
}

const rootElement = document.getElementById('root')!;
const rootWindow = window as typeof window & { __proctorRoot?: ReturnType<typeof createRoot> };
const root = rootWindow.__proctorRoot || createRoot(rootElement);
rootWindow.__proctorRoot = root;
root.render(<App />);




