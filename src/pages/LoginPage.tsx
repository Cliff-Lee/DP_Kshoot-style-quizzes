import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, GraduationCap, School, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ErrorState } from '../components/UI'
import { isSupabaseConfigured } from '../lib/supabase'
import { useApp } from '../state/AppContext'

export function LoginPage() {
  const [params]=useSearchParams(); const [mode,setMode]=useState<'signin'|'signup'>(params.get('mode')==='signup'?'signup':'signin')
  const [email,setEmail]=useState('alex.morgan@school.test'); const [password,setPassword]=useState('teacher123'); const [busy,setBusy]=useState(false); const [error,setError]=useState('')
  const {actions}=useApp(); const navigate=useNavigate(); const location=useLocation()
  const submit=async(event:FormEvent)=>{event.preventDefault();setBusy(true);setError('');try{await actions.login(email,password,mode); const from=(location.state as {from?:{pathname:string}})?.from?.pathname; navigate(from??'/teacher/dashboard')}catch(err){setError(err instanceof Error?err.message:'Unable to continue')}finally{setBusy(false)}}
  return <div className="auth-page">
    <aside className="auth-story"><Link className="back-link" to="/"><ArrowLeft size={17}/> Back to home</Link><div><div className="eyebrow light"><span/>Syllabus-first teaching</div><h1>Know what your class knows.</h1><p>Every response becomes a useful signal against the correct IB Mathematics AA or AI syllabus—not another spreadsheet to reconcile.</p><div className="auth-proof"><span><School/></span><div><b>“The topic heatmap changed how I plan Monday mornings.”</b><small>— Demonstration teacher account</small></div></div></div></aside>
    <main className="auth-panel"><div className="auth-box"><Logo/><div className="auth-heading"><h2>{mode==='signin'?'Welcome back':'Create your teacher workspace'}</h2><p>{isSupabaseConfigured?'Secure authentication is connected to Supabase.':'Explore locally now; connect Supabase when you deploy.'}</p></div>{error&&<ErrorState message={error}/>}<form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required autoComplete={mode==='signin'?'current-password':'new-password'}/></label><button className="button primary wide" disabled={busy}>{busy?'Please wait…':mode==='signin'?'Sign in':'Create free account'} <ArrowRight size={17}/></button></form><div className="auth-divider"><span>or explore the demo</span></div><div className="demo-buttons"><button aria-label="Open teacher demo" onClick={()=>{actions.demoLogin();navigate('/teacher/dashboard')}}><span><ShieldCheck/></span><div><b>Teacher workspace</b><small>Classes, quizzes & reports</small></div></button><button aria-label="Open student demo" onClick={()=>{actions.demoLogin('student');navigate('/student/dashboard')}}><span><GraduationCap/></span><div><b>Student view</b><small>Practice & progress</small></div></button></div><p className="auth-switch">{mode==='signin'?'New to MathPulse?':'Already have an account?'} <button onClick={()=>setMode(mode==='signin'?'signup':'signin')}>{mode==='signin'?'Create an account':'Sign in'}</button></p></div></main>
  </div>
}
