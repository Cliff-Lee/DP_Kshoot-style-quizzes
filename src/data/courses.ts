import type { Course, CourseFamily } from '../types'

export const COURSE_IDS = {
  aaSl: '20000000-0000-0000-0000-000000000001',
  aaHl: '20000000-0000-0000-0000-000000000002',
  aiSl: '20000000-0000-0000-0000-000000000003',
  aiHl: '20000000-0000-0000-0000-000000000004',
} as const

export const courses: Course[] = [
  { id:COURSE_IDS.aaSl, slug:'ib-mathematics-aa-sl', courseFamily:'analysis_approaches', level:'SL', displayName:'IB Mathematics: Analysis and Approaches SL', shortName:'AA SL', active:true },
  { id:COURSE_IDS.aaHl, slug:'ib-mathematics-aa-hl', courseFamily:'analysis_approaches', level:'HL', displayName:'IB Mathematics: Analysis and Approaches HL', shortName:'AA HL', active:true },
  { id:COURSE_IDS.aiSl, slug:'ib-mathematics-ai-sl', courseFamily:'applications_interpretation', level:'SL', displayName:'IB Mathematics: Applications and Interpretation SL', shortName:'AI SL', active:true },
  { id:COURSE_IDS.aiHl, slug:'ib-mathematics-ai-hl', courseFamily:'applications_interpretation', level:'HL', displayName:'IB Mathematics: Applications and Interpretation HL', shortName:'AI HL', active:true },
]

export const defaultCourseId = COURSE_IDS.aaSl
export const courseById = new Map(courses.map(course => [course.id,course]))
export const courseBySlug = new Map(courses.map(course => [course.slug,course]))

export function getCourse(courseId:string){
  return courseById.get(courseId)??courses[0]
}

export function getCourseFor(family:CourseFamily,level:'SL'|'HL'){
  return courses.find(course=>course.courseFamily===family&&course.level===level)!
}

export function courseIdsInScope(courseId:string){
  const course=getCourse(courseId)
  if(course.level==='SL')return [course.id]
  return courses.filter(candidate=>candidate.courseFamily===course.courseFamily).map(candidate=>candidate.id)
}

export function courseFamilyLabel(family:CourseFamily){
  return family==='analysis_approaches'?'Analysis and Approaches':'Applications and Interpretation'
}
