export type FieldType =
  | 'scale_1_5'
  | 'text_short'
  | 'text_long'
  | 'text_xl'
  | 'list_n'
  | 'list_dyn'
  | 'group'
  | 'date'
  | 'computed'
  | 'carry'

export interface CarrySource {
  key: string // e.g. 'north_star'
  sectionId: string // e.g. '02'
  label: string // e.g. 'North Star'
  sectionName: string // e.g. "Designing What's Next"
}

export interface FieldDefinition {
  id: string
  label: string
  prompt?: string
  helperText?: string
  placeholder?: string
  type: FieldType
  count?: number // for list_n (e.g. 3)
  min?: number // for list_dyn (e.g. 3)
  max?: number // for list_dyn (e.g. 6)
  fields?: FieldDefinition[] // for group subfields (e.g. elements of a card)
  carrySource?: CarrySource
  defaultValue?: any
  optionsSource?: string // e.g. 'sm_built_picker' for dynamic select dropdowns
}

export interface SectionDefinition {
  id: string // '00', '01', '02', '03', '05', '10', '15'
  title: string
  stage: 'Clarify' | 'Position' | 'Execute' | 'Review & Reinvent'
  estimatedMinutes: number
  isEssential: boolean
  workbookPages: string
  instructionText?: string
  benchNote?: string // author's first-person voice story
  fields: FieldDefinition[]
  carries?: CarrySource[] // list of carry-forwards pinned to the top (Bridge panel)
}

export interface UserOutputs {
  user_id: string
  diagnostic_total?: number | null
  diagnostic_zone?: 'reactive' | 'repositioning' | 'momentum' | null
  priority_areas?: string[] | null
  bench_thesis?: string | null
  reset_sentence?: string | null
  north_star?: string | null
  top_3_areas?: string[] | null
  positioning_final?: string | null
  first_action?: string | null
  letter_written_at?: string | null
  updated_at: string
}
