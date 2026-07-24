import { describe, expect, it } from 'vitest'
import sampleV1 from '../../examples/math-quiz-import-v1.sample.json?raw'
import sampleV11 from '../../examples/math-quiz-import-v1.1.sample.json?raw'
import generatedSeed from '../data/aaQuestionSeed.generated.json?raw'
import generatedAiSeed from '../data/aiQuestionSeed.generated.json?raw'
import { validateImport } from './importValidator'

const document = (question:Record<string,unknown>, format='math_quiz_import_v1',family='analysis_approaches',level='SL') => JSON.stringify({format,...(format==='math_quiz_import_v1.1'?{courseFamily:family,courseLevel:level}:{}),course:`IB Mathematics: ${family==='analysis_approaches'?'Analysis and Approaches':'Applications and Interpretation'} ${level}`,source:'chatgpt',questions:[question]})
const common={syllabusCode:'SL 2.5',difficulty:'standard',questionStyle:'procedural',calculator:'not_allowed',estimatedTimeSeconds:45,marksEstimate:2,prompt:'Find the composite.',explanation:'Substitute in order.',tags:['functions']}
const base={...common,type:'multiple_choice',choices:['1','2','3','4'],answer:'3'}

describe('MathQuiz Import Format validator',()=>{
  it('rejects malformed JSON',()=>{const result=validateImport('{broken');expect(result.globalErrors[0]).toMatch(/Invalid JSON/);expect(result.rows).toHaveLength(0)})
  it('keeps v1 compatibility',()=>{const result=validateImport(document(base));expect(result.globalErrors).toEqual([]);expect(result.format).toBe('math_quiz_import_v1');expect(result.validCount).toBe(1)})
  it('accepts v1.1',()=>{const result=validateImport(document(base,'math_quiz_import_v1.1'));expect(result.globalErrors).toEqual([]);expect(result.format).toBe('math_quiz_import_v1.1')})
  it.each([['v1',sampleV1],['v1.1',sampleV11]])('accepts the checked-in %s example',(_,raw)=>{const result=validateImport(raw);expect(result.globalErrors).toEqual([]);expect(result.invalidCount).toBe(0);expect(result.validCount).toBeGreaterThan(0)})
  it('accepts every generated seed question as valid v1.1',()=>{const result=validateImport(generatedSeed);expect(result.globalErrors).toEqual([]);expect(result.rows.filter(row=>!row.valid).map(row=>({index:row.index,prompt:row.question.prompt,errors:row.errors}))).toEqual([]);expect(result.validCount).toBe(JSON.parse(generatedSeed).questions.length)})
  it('accepts every generated AI seed question as valid v1.1',()=>{const result=validateImport(generatedAiSeed);expect(result.globalErrors).toEqual([]);expect(result.rows.filter(row=>!row.valid).map(row=>({index:row.index,prompt:row.question.prompt,errors:row.errors}))).toEqual([]);expect(result.validCount).toBe(JSON.parse(generatedAiSeed).questions.length)})
  it('accepts a valid Applications and Interpretation import',()=>{
    const result=validateImport(document({...common,syllabusCode:'SL 3.6',prompt:'A point is equidistant from sites A and B. On which Voronoi boundary does it lie?',type:'multiple_choice',choices:['The perpendicular bisector of AB','The line AB','A circle through A','A vertical axis'],answer:'The perpendicular bisector of AB'},'math_quiz_import_v1.1','applications_interpretation','SL'))
    expect(result.globalErrors).toEqual([])
    expect(result.rows[0].errors).toEqual([])
    expect(result.courseFamily).toBe('applications_interpretation')
  })
  it('rejects an AI-only syllabus code under the AA course family',()=>{
    const result=validateImport(document({...base,syllabusCode:'AHL 4.19'},'math_quiz_import_v1.1','analysis_approaches','HL'))
    expect(result.rows[0].errors.join(' ')).toMatch(/selected course/)
  })
  it('rejects AHL content in an SL import',()=>{
    const result=validateImport(document({...base,syllabusCode:'AHL 2.12'},'math_quiz_import_v1.1','analysis_approaches','SL'))
    expect(result.rows[0].errors.join(' ')).toMatch(/SL import/)
  })
  it('checks syllabus codes relationally',()=>{const result=validateImport(document({...base,syllabusCode:'SL 9.9'}));expect(result.rows[0].errors.join(' ')).toMatch(/syllabusCode/);expect(result.invalidCount).toBe(1)})
  it('requires sensible v1.1 metadata',()=>{const result=validateImport(document({...base,questionStyle:'essay',calculator:'sometimes',estimatedTimeSeconds:2,marksEstimate:0},'math_quiz_import_v1.1'));expect(result.rows[0].errors.join(' ')).toMatch(/questionStyle/);expect(result.rows[0].errors.join(' ')).toMatch(/calculator/);expect(result.rows[0].errors.join(' ')).toMatch(/estimatedTimeSeconds/);expect(result.rows[0].errors.join(' ')).toMatch(/marksEstimate/)})
  it('requires the configured number of unique choices and an exact answer',()=>{const result=validateImport(document({...base,choices:['1','1','2'],answer:'3'}));expect(result.rows[0].errors).toHaveLength(3);expect(validateImport(document({...base,choices:['1','2','3']}),[],{multipleChoiceChoiceCount:3}).validCount).toBe(1)})
  it('validates drag-drop zone references',()=>{const result=validateImport(document({...common,type:'drag_drop',syllabusCode:'SL 2.11',zones:['Translation','Stretch'],items:[{text:'f(x)+1',correctZone:'Unknown'}]}));expect(result.rows[0].errors.join(' ')).toMatch(/unknown zone/)})
  it('flags normalized duplicate prompts for confirmation',()=>{const result=validateImport(document(base),['  FIND   the composite. ']);expect(result.rows[0].valid).toBe(true);expect(result.rows[0].duplicate).toBe(true)})
  it('rejects syllabus-description prompts and syllabus-code answers',()=>{
    const metadataPrompt=validateImport(document({...base,prompt:'Which mathematical focus is mapped to syllabus point SL 2.5?'}))
    expect(metadataPrompt.rows[0].errors.join(' ')).toMatch(/genuine mathematics question/)
    const codeAnswer=validateImport(document({...base,prompt:'Choose the matching label.',choices:['SL 2.5','SL 2.6','SL 2.7','SL 2.8'],answer:'SL 2.5'}))
    expect(codeAnswer.rows[0].errors.join(' ')).toMatch(/not a syllabus code/)
    const genuineMapping=validateImport(document({...base,prompt:'Under a translation, the point (1,2) is mapped to (4,2). Find the horizontal shift.'}))
    expect(genuineMapping.rows[0].valid).toBe(true)
  })

  it.each([
    {...common,type:'numeric_answer',answer:4,tolerance:.01},
    {...common,type:'multi_select',choices:['A','B','C','D'],answers:['A','C']},
    {...common,type:'true_false',answer:true},
    {...common,type:'matching',pairs:[{left:'x²',right:'2x'},{left:'sin x',right:'cos x'}]},
    {...common,type:'ordering',items:['C','A','B'],correctOrder:['A','B','C']},
    {...common,type:'drag_drop',zones:['Translation','Stretch'],items:[{text:'f(x)+1',correctZone:'Translation'}]},
    {...common,type:'fill_blank',prompt:'Complete: y = ___.',answer:'mx+c',acceptedAnswers:['mx + c']},
  ])('accepts the v1.1 $type shape',question=>{
    const result=validateImport(document(question,'math_quiz_import_v1.1'))
    expect(result.rows[0].errors).toEqual([])
  })
})
