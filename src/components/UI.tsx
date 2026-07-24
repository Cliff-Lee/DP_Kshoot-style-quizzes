import type { ReactNode } from 'react'
import { ArrowUpRight, Inbox, LoaderCircle, TriangleAlert } from 'lucide-react'
import { syllabusPoints, topicColors } from '../data/syllabus'
import { getCourse } from '../data/courses'
import { Link } from 'react-router-dom'

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?:string; title:string; description?:string; actions?:ReactNode }) {
  return <header className="page-header">
    <div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description&&<p>{description}</p>}</div>
    {actions&&<div className="page-actions">{actions}</div>}
  </header>
}

export function SyllabusChip({ id, compact=false }: { id:string; compact?:boolean }) {
  const point=syllabusPoints.find(item=>item.id===id)
  if(!point) return <span className="chip">Unmapped</span>
  return <span className={`syllabus-chip ${compact?'compact':''}`} style={{'--topic-color':topicColors[point.topicNumber]} as React.CSSProperties}><b>{getCourse(point.courseId).shortName} · {point.code}</b>{!compact&&<span>{point.title}</span>}</span>
}

export function StatusPill({ children, tone='neutral' }: { children:ReactNode; tone?:'neutral'|'success'|'warning'|'danger'|'info' }) { return <span className={`status-pill ${tone}`}>{children}</span> }
export function StatCard({ label, value, detail, tone='green' }: { label:string; value:string|number; detail:string; tone?:string }) { return <article className={`stat-card tone-${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article> }
export function EmptyState({ title, body, action }: { title:string; body:string; action?:ReactNode }) { return <div className="empty-state"><span className="empty-icon"><Inbox size={22}/></span><h3>{title}</h3><p>{body}</p>{action}</div> }
export function LoadingState({ label='Loading your workspace…' }: {label?:string}) { return <div className="loading-state"><LoaderCircle className="spin"/><span>{label}</span></div> }
export function ErrorState({ message }: {message:string}) { return <div className="alert danger"><TriangleAlert size={18}/><span>{message}</span></div> }
export function UpgradeCard({ message='Unlock advanced mastery analytics and unlimited teaching workflows.' }: {message?:string}) { return <aside className="upgrade-card"><div><div className="eyebrow">Premium</div><h3>Take the limits off</h3><p>{message}</p></div><Link className="button light small" to="/billing">Compare plans <ArrowUpRight size={15}/></Link></aside> }

export const titleCase = (value:string) => value.split('_').map(word=>word[0]?.toUpperCase()+word.slice(1)).join(' ')
export const percent = (value:number) => `${Math.round(value*100)}%`
