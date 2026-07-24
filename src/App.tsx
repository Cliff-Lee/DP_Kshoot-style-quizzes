import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoadingState } from './components/UI'
import { useApp } from './state/AppContext'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { ImportPage } from './pages/ImportPage'
import { PromptGeneratorPage } from './pages/PromptGeneratorPage'
import { ClassesPage, ClassDetailPage } from './pages/ClassesPage'
import { QuizBuilderPage, QuizDetailPage } from './pages/QuizPages'
import { LiveControlPage } from './pages/LiveControlPage'
import { PlayPage, PlaySessionPage } from './pages/PlayPages'
import { StudentDashboardPage } from './pages/StudentDashboardPage'
import { ClassReportPage, StudentReportPage } from './pages/ReportsPages'
import { AdminReviewPage } from './pages/AdminReviewPage'
import { BillingPage } from './pages/BillingPage'

function Protected({ roles }: {roles?:string[]}) {
  const {state,hydrated}=useApp(); const location=useLocation()
  if(!hydrated) return <LoadingState/>
  if(!state.user) return <Navigate to="/login" state={{from:location}} replace/>
  if(roles&&!roles.includes(state.user.role)) return <Navigate to={state.user.role==='student'?'/student/dashboard':'/teacher/dashboard'} replace/>
  return <Outlet/>
}
const TeacherShell=()=> <AppShell area="teacher"><Outlet/></AppShell>
const StudentShell=()=> <AppShell area="student"><Outlet/></AppShell>

export function App() { return <Routes>
  <Route path="/" element={<LandingPage/>}/>
  <Route path="/login" element={<LoginPage/>}/>
  <Route element={<Protected roles={['teacher_free','teacher_premium','school_admin','platform_admin']}/> }>
    <Route element={<TeacherShell/>}>
      <Route path="/teacher/dashboard" element={<DashboardPage/>}/>
      <Route path="/teacher/classes" element={<ClassesPage/>}/>
      <Route path="/teacher/classes/:id" element={<ClassDetailPage/>}/>
      <Route path="/teacher/questions" element={<QuestionsPage/>}/>
      <Route path="/teacher/questions/import" element={<ImportPage/>}/>
      <Route path="/teacher/questions/prompt-generator" element={<PromptGeneratorPage/>}/>
      <Route path="/teacher/quizzes/new" element={<QuizBuilderPage/>}/>
      <Route path="/teacher/quizzes/:id" element={<QuizDetailPage/>}/>
      <Route path="/teacher/live/:sessionId/control" element={<LiveControlPage/>}/>
      <Route path="/reports/class/:classId" element={<ClassReportPage/>}/>
      <Route path="/reports/student/:studentId" element={<StudentReportPage/>}/>
      <Route path="/admin/review-questions" element={<AdminReviewPage/>}/>
      <Route path="/billing" element={<BillingPage/>}/>
    </Route>
  </Route>
  <Route element={<Protected roles={['student']}/> }><Route element={<StudentShell/>}><Route path="/student/dashboard" element={<StudentDashboardPage/>}/></Route></Route>
  <Route path="/play" element={<PlayPage/>}/>
  <Route path="/play/:pin" element={<PlaySessionPage/>}/>
  <Route path="*" element={<main className="not-found"><h1>That page wandered off syllabus.</h1><Navigate to="/" replace/></main>}/>
 </Routes> }
