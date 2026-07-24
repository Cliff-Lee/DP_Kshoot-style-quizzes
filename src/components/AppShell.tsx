import { useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, BookOpenCheck, ChevronDown, CircleDollarSign, ClipboardList, GraduationCap, LayoutDashboard, Library, LogOut, Menu, RadioTower, Settings, Sparkles, Users, X } from 'lucide-react'
import { Logo } from './Logo'
import { courses, getCourse } from '../data/courses'
import { DATA_MODE_LABEL, isSupabaseConfigured } from '../lib/supabase'
import { useApp } from '../state/AppContext'

const teacherNav = [
  ['/teacher/dashboard','Overview',LayoutDashboard], ['/teacher/classes','Classes',Users], ['/teacher/questions','Question bank',Library],
  ['/teacher/quizzes/new','Build quiz',ClipboardList], ['/teacher/questions/prompt-generator','Prompt studio',Sparkles], ['/reports/class/class-aa-sl','Reports',BarChart3],
] as const
const studentNav = [['/student/dashboard','My progress',GraduationCap],['/play','Join live game',RadioTower]] as const

export function AppShell({ children, area='teacher' }: { children:ReactNode; area?:'teacher'|'student'|'admin' }) {
  const {state,actions}=useApp(); const navigate=useNavigate(); const [open,setOpen]=useState(false)
  const nav = area==='student' ? studentNav : teacherNav
  const activeCourse=getCourse(state.activeCourseId)
  const reportClass=state.classes.find(item=>item.courseId===state.activeCourseId)
  return <div className="app-shell">
    <aside className={`sidebar ${open?'open':''}`}>
      <div className="sidebar-head"><Logo/><button className="icon-button mobile-only" onClick={()=>setOpen(false)} aria-label="Close navigation"><X/></button></div>
      <label className="workspace-switch"><span className="avatar school">{activeCourse.shortName.split(' ')[0]}</span><div><b>{activeCourse.shortName}</b><small>{activeCourse.courseFamily==='analysis_approaches'?'Analysis & Approaches':'Applications & Interpretation'}</small><select value={state.activeCourseId} onChange={event=>actions.setActiveCourse(event.target.value)} aria-label="Active IB Mathematics course">{courses.map(course=><option value={course.id} key={course.id}>{course.displayName}</option>)}</select></div><ChevronDown size={15}/></label>
      <nav className="primary-nav">{nav.map(([to,label,Icon])=>{const destination=label==='Reports'&&reportClass?`/reports/class/${reportClass.id}`:to;return <NavLink key={to} to={destination} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'active':''}><Icon size={19}/><span>{label}</span></NavLink>})}</nav>
      <div className="sidebar-spacer"/>
      <nav className="secondary-nav">
        {area!=='student'&&<NavLink to="/billing"><CircleDollarSign size={18}/>Plan & billing</NavLink>}
        {state.user?.role==='platform_admin'&&<NavLink to="/admin/review-questions"><BookOpenCheck size={18}/>Review queue</NavLink>}
        <a href="#settings"><Settings size={18}/>Settings</a>
      </nav>
      <div className="profile-card"><span className="avatar">{state.user?.displayName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</span><div><b>{state.user?.displayName}</b><small>{state.user?.role.replace('_',' ')}</small></div><button onClick={async()=>{await actions.logout();navigate('/')}} aria-label="Log out"><LogOut size={16}/></button></div>
    </aside>
    {open&&<button className="sidebar-scrim" onClick={()=>setOpen(false)} aria-label="Close navigation"/>}
    <main className="app-main">
      <div className="app-topbar"><button className="icon-button mobile-only" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu/></button><div className={`mode-badge ${isSupabaseConfigured?'connected':''}`}><i/>{DATA_MODE_LABEL}</div><Link className="play-shortcut" to="/play">Enter game PIN</Link></div>
      <div className="page-wrap">{children}</div>
    </main>
  </div>
}
