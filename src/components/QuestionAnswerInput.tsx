import { ArrowDown, ArrowUp, Check } from 'lucide-react'
import type { Question } from '../types'

export function emptyAnswerFor(question:Question):unknown {
  if(question.type==='multi_select')return []
  if(question.type==='ordering')return [...((question.answerData.items??question.answerData.correctOrder??[]) as string[])]
  if(question.type==='matching'||question.type==='drag_drop')return {}
  return ''
}

export function isAnswerReady(question:Question,value:unknown):boolean {
  if(Array.isArray(value))return value.length>0
  if(value&&typeof value==='object'){
    const required=question.type==='matching'?(question.answerData.pairs as unknown[]|undefined)?.length:(question.answerData.items as unknown[]|undefined)?.length
    return Object.keys(value).length>0&&Object.keys(value).length===required
  }
  return String(value??'').trim().length>0
}

export function QuestionAnswerInput({question,value,onChange,hiddenOptions=new Set()}:{question:Question;value:unknown;onChange:(value:unknown)=>void;hiddenOptions?:Set<string>}){
  if(question.type==='multiple_choice'||question.type==='true_false'){
    const options=question.options??(question.type==='true_false'?['True','False'].map((text,index)=>({id:`tf-${index}`,label:String.fromCharCode(65+index),text,isCorrect:false,sortOrder:index})):[])
    return <div className={`phone-options ${options.length===2?'two-options':''}`}>{options.map((option,i)=>hiddenOptions.has(option.id)?<div className="option-hidden" key={option.id}>Option removed</div>:<button type="button" className={value===option.text?'selected':''} onClick={()=>onChange(option.text)} key={option.id}><b>{['◆','▲','●','■'][i]}</b><span>{option.text}</span>{value===option.text&&<Check/>}</button>)}</div>
  }
  if(question.type==='multi_select'){
    const selected=Array.isArray(value)?value as string[]:[]
    return <><p className="answer-hint">Select every correct answer.</p><div className="phone-options multi-options">{question.options?.map((option,i)=>hiddenOptions.has(option.id)?<div className="option-hidden" key={option.id}>Option removed</div>:<button type="button" className={selected.includes(option.text)?'selected':''} onClick={()=>onChange(selected.includes(option.text)?selected.filter(item=>item!==option.text):[...selected,option.text])} key={option.id}><b>{['◆','▲','●','■'][i]}</b><span>{option.text}</span>{selected.includes(option.text)&&<Check/>}</button>)}</div></>
  }
  if(question.type==='matching'){
    const pairs=(question.answerData.pairs??[]) as Array<{left:string;right:string}>;const answer=(value&&typeof value==='object'?value:{}) as Record<string,string>;const choices=[...pairs.map(pair=>pair.right)].reverse()
    return <div className="mapping-answer">{pairs.map(pair=><label key={pair.left}><span>{pair.left}</span><select value={answer[pair.left]??''} onChange={event=>onChange({...answer,[pair.left]:event.target.value})}><option value="">Choose a match…</option>{choices.map(choice=><option value={choice} key={choice}>{choice}</option>)}</select></label>)}</div>
  }
  if(question.type==='drag_drop'){
    const items=(question.answerData.items??[]) as Array<{text:string;correctZone:string}>;const zones=(question.answerData.zones??[]) as string[];const answer=(value&&typeof value==='object'?value:{}) as Record<string,string>
    return <div className="mapping-answer drag-answer">{items.map(item=><label key={item.text}><span>{item.text}</span><select value={answer[item.text]??''} onChange={event=>onChange({...answer,[item.text]:event.target.value})}><option value="">Drop into…</option>{zones.map(zone=><option value={zone} key={zone}>{zone}</option>)}</select></label>)}</div>
  }
  if(question.type==='ordering'){
    const source=((question.answerData.items??question.answerData.correctOrder??[]) as string[]);const ordered=Array.isArray(value)&&value.length?value as string[]:source
    const move=(index:number,direction:-1|1)=>{const target=index+direction;if(target<0||target>=ordered.length)return;const next=[...ordered];[next[index],next[target]]=[next[target],next[index]];onChange(next)}
    return <div className="ordering-answer">{ordered.map((item,index)=><div key={item}><b>{index+1}</b><span>{item}</span><button type="button" onClick={()=>move(index,-1)} disabled={index===0} aria-label={`Move ${item} up`}><ArrowUp/></button><button type="button" onClick={()=>move(index,1)} disabled={index===ordered.length-1} aria-label={`Move ${item} down`}><ArrowDown/></button></div>)}</div>
  }
  return <input className="written-answer" type={question.type==='numeric_answer'?'number':'text'} value={String(value??'')} onChange={event=>onChange(event.target.value)} placeholder={question.type==='fill_blank'?'Fill the blank…':question.type==='numeric_answer'?'Enter a number…':'Type your answer…'} inputMode={question.type==='numeric_answer'?'decimal':'text'}/>
}
