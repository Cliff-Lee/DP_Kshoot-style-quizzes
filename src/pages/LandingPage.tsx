import { ArrowRight, BarChart3, CheckCircle2, RadioTower, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

export function LandingPage() {
  return <div className="landing">
    <nav className="landing-nav"><Logo/><div><a href="#platform">Platform</a><a href="#workflow">Workflow</a><a href="#reports">Reports</a></div><div><Link className="text-link" to="/login">Sign in</Link><Link className="button primary small" to="/login?mode=signup">Start free</Link></div></nav>
    <main>
      <section className="hero" id="platform">
        <div className="hero-copy"><div className="eyebrow light"><span/>Built for IB Mathematics classrooms</div><h1>Make every answer count toward <em>mastery.</em></h1><p>Run energetic live quizzes, assign focused practice, and see exactly which IB Analysis & Approaches syllabus points need attention.</p><div className="hero-actions"><Link className="button coral" to="/login?mode=signup">Build your first quiz <ArrowRight size={18}/></Link><Link className="button ghost-light" to="/play">Join with a game PIN</Link></div><div className="trust-row"><span><CheckCircle2/>Full SL + AHL map</span><span><CheckCircle2/>Teacher-reviewed bank</span><span><CheckCircle2/>Supabase ready</span></div></div>
        <div className="hero-visual" aria-label="Product preview">
          <div className="orbit orbit-a"/><div className="orbit orbit-b"/>
          <div className="projector-card"><div className="projector-top"><span>LIVE · QUESTION 3/8</span><b>18</b></div><small>SL 2.5 · Composite functions</small><h3>If f(x) = 2x + 3 and g(x) = x², find (f∘g)(2).</h3><div className="answer-grid"><span>A&nbsp; 7</span><span>B&nbsp; 8</span><span className="selected">C&nbsp; 11</span><span>D&nbsp; 14</span></div><div className="projector-foot"><span>24 of 27 answered</span><i><b style={{width:'88%'}}/></i></div></div>
          <div className="float-card mastery"><b>Topic mastery</b><div><span>Functions</span><strong>84%</strong></div><i><b style={{width:'84%'}}/></i><div><span>Calculus</span><strong>62%</strong></div><i><b style={{width:'62%'}}/></i></div>
          <div className="float-card live"><RadioTower/><div><strong>27</strong><small>students live</small></div></div>
        </div>
      </section>
      <section className="feature-strip" id="workflow"><div><Sparkles/><b>Generate & import</b><span>Bring teacher-checkable ChatGPT JSON straight into a draft bank.</span></div><div><RadioTower/><b>Play live or assign</b><span>Fast classroom play and thoughtful self-paced practice in one platform.</span></div><div><BarChart3/><b>Act on mastery</b><span>Reports roll every response back to a relational syllabus point.</span></div><div><ShieldCheck/><b>Private by design</b><span>Careful row-level access for students, teachers, schools and reviewers.</span></div></section>
      <section className="landing-proof" id="reports"><div><div className="eyebrow">One shared language</div><h2>From “they struggled” to <em>where, exactly?</em></h2><p>MathPulse puts syllabus coverage behind every workflow. Build by point, watch response confidence live, then group your next lesson around the evidence.</p></div><div className="topic-stack">{[['01','Number & algebra','76%'],['02','Functions','84%'],['03','Geometry & trig','71%'],['04','Statistics & probability','68%'],['05','Calculus','62%']].map(([n,t,p],i)=><div key={n} style={{'--i':i} as React.CSSProperties}><b>{n}</b><span>{t}</span><strong>{p}</strong></div>)}</div></section>
    </main>
    <footer><Logo/><span>Teacher tools for IB Mathematics: Analysis & Approaches.</span><span>© 2026 MathPulse</span></footer>
  </div>
}
