const defaults=[
  {difficulty:'foundation',questionStyle:'recall',calculator:'not_allowed',estimatedTimeSeconds:35,marksEstimate:1},
  {difficulty:'standard',questionStyle:'procedural',calculator:'not_allowed',estimatedTimeSeconds:60,marksEstimate:2},
  {difficulty:'extension',questionStyle:'conceptual',calculator:'neutral',estimatedTimeSeconds:75,marksEstimate:2},
]

const withMeta=(type,data,meta={})=>({type,...data,...meta})
export const mc=(prompt,choices,answer,explanation,meta)=>withMeta('multiple_choice',{prompt,choices,answer,explanation},meta)
export const num=(prompt,answer,explanation,meta={},tolerance=0)=>withMeta('numeric_answer',{prompt,answer,tolerance,explanation},meta)
export const tf=(prompt,answer,explanation,meta)=>withMeta('true_false',{prompt,answer,explanation},meta)
export const multi=(prompt,choices,answers,explanation,meta)=>withMeta('multi_select',{prompt,choices,answers,explanation},meta)
export const short=(prompt,answer,acceptedAnswers,explanation,meta)=>withMeta('short_answer',{prompt,answer,acceptedAnswers,explanation},meta)
export const fill=(prompt,answer,acceptedAnswers,explanation,meta)=>withMeta('fill_blank',{prompt,answer,acceptedAnswers,explanation},meta)
export const match=(prompt,pairs,explanation,meta)=>withMeta('matching',{prompt,pairs,explanation},meta)
export const order=(prompt,items,correctOrder,explanation,meta)=>withMeta('ordering',{prompt,items,correctOrder,explanation},meta)
export const drag=(prompt,zones,items,explanation,meta)=>withMeta('drag_drop',{prompt,zones,items,explanation},meta)

export function compilePoint(code,questions,requireThree=true){
  if(requireThree&&questions.length<3)throw new Error(`${code} has fewer than three questions`)
  return questions.map((question,index)=>({
    ...defaults[index%3],
    ...question,
    syllabusCode:code,
    tags:[...(question.tags??[]),question.questionStyle??defaults[index%3].questionStyle],
  }))
}
