import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { COURSE_IDS } from '../data/courses'
import { AppProvider } from '../state/AppContext'
import { QuizBuilderPage } from './QuizPages'

describe('quiz builder course selection',()=>{
  beforeEach(()=>localStorage.clear())

  it('shows all AA/AI course choices and swaps the syllabus bank',async()=>{
    render(<MemoryRouter><AppProvider><QuizBuilderPage/></AppProvider></MemoryRouter>)
    const selector=await screen.findByLabelText('Course')
    expect(Array.from((selector as HTMLSelectElement).options).map(option=>option.text)).toEqual([
      'IB Mathematics: Analysis and Approaches SL',
      'IB Mathematics: Analysis and Approaches HL',
      'IB Mathematics: Applications and Interpretation SL',
      'IB Mathematics: Applications and Interpretation HL',
    ])
    expect(screen.getByText('Composite and inverse functions')).toBeInTheDocument()
    fireEvent.change(selector,{target:{value:COURSE_IDS.aiSl}})
    await waitFor(()=>expect(screen.getByText('Mathematical models')).toBeInTheDocument())
    expect(screen.queryByText('Composite and inverse functions')).not.toBeInTheDocument()
  })
})
