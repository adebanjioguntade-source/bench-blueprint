import { SectionDefinition } from './types'

export const SECTIONS: SectionDefinition[] = [
  {
    id: '00',
    title: 'The Bench Diagnostic',
    stage: 'Clarify',
    estimatedMinutes: 5,
    isEssential: true,
    workbookPages: 'pp. 9–10',
    instructionText: 'Score each item honestly. Within five minutes, you\'ll know where to focus first. Scale: 1 = not yet in place, 5 = consistently strong.',
    fields: [
      {
        id: 'd_resume',
        label: 'Resume current',
        helperText: 'Updated within the last 6 months and reflects recent outcomes.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_linkedin',
        label: 'LinkedIn updated',
        helperText: 'Profile is complete, professional, and aligned with your current trajectory.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_certs',
        label: 'Certifications current',
        helperText: 'Key credentials and professional licenses are active and up to date.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_network',
        label: 'Network active',
        helperText: 'Actively connecting with peers, mentors, and industry contacts.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_fund',
        label: 'Emergency fund in place',
        helperText: 'Liquid savings set aside to cover essential living costs during transition.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_positioning',
        label: 'Positioning clear',
        helperText: 'Value proposition and professional target are easily understood by others.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_proof',
        label: 'Proof visible',
        helperText: 'Case studies, metrics, or visible results demonstrate your past impact.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_direction',
        label: 'Career direction defined',
        helperText: 'Clear target role, sector, or engagement structure chosen for what\'s next.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_gaps',
        label: 'Gap list current',
        helperText: 'Clear inventory of skills or knowledge needed for your target market.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_visibility',
        label: 'Content or visibility habit',
        helperText: 'Regular sharing, publishing, or speaking in your professional space.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_plan',
        label: 'Transition plan in place',
        helperText: 'Structured timeline, budget, and action steps for the transition season.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_exit',
        label: 'Exit criteria defined',
        helperText: 'Predefined milestones that signal it is time to move to the next stage.',
        type: 'scale_1_5',
        defaultValue: 3
      },
      {
        id: 'd_priorities',
        label: 'Three Lowest Diagnostic Areas',
        prompt: 'Record your three lowest areas above.',
        helperText: 'We will suggest these based on your lowest scores, but you can overwrite them.',
        type: 'list_n',
        count: 3,
        defaultValue: ['', '', '']
      }
    ]
  },
  {
    id: '01',
    title: 'Bench Reset',
    stage: 'Clarify',
    estimatedMinutes: 10,
    isEssential: true,
    workbookPages: 'pp. 11–14',
    benchNote: 'We want to rush through transitions. We want to skip the discomfort of the "between" and run straight into the next contract, the next job, the next title. But when you do that, you carry all the baggage of the old season into the new. Use this section to make sense of what your Section 00 diagnostic surfaced.',
    carries: [
      { key: 'diagnostic_total', sectionId: '00', label: 'Diagnostic Score', sectionName: 'The Bench Diagnostic' },
      { key: 'diagnostic_zone', sectionId: '00', label: 'Diagnostic Zone', sectionName: 'The Bench Diagnostic' },
      { key: 'priority_areas', sectionId: '00', label: 'Three Priority Areas', sectionName: 'The Bench Diagnostic' }
    ],
    fields: [
      {
        id: 'r_where_now',
        label: 'Where am I now?',
        prompt: 'Where am I now? What circumstances led to this transition period?',
        type: 'text_xl',
        placeholder: 'Describe your current situation...'
      },
      {
        id: 'r_true_financial',
        label: 'What is true today — the financial reality',
        prompt: 'What is true today — the financial reality',
        type: 'text_long',
        placeholder: 'Describe your numbers, runway, and financial commitments...'
      },
      {
        id: 'r_true_professional',
        label: 'What is true today — the professional reality',
        prompt: 'What is true today — the professional reality',
        type: 'text_long',
        placeholder: 'Describe your current reputation, skills, and professional standing...'
      },
      {
        id: 'r_true_feeling',
        label: 'What is true today — how I actually feel about it',
        prompt: 'What is true today — how I actually feel about it',
        type: 'text_long',
        placeholder: 'Be honest. Are you anxious, excited, exhausted, or hopeful?'
      },
      {
        id: 'r_uncertain',
        label: 'What feels uncertain',
        prompt: 'What feels uncertain',
        type: 'list_dyn',
        min: 3,
        max: 6,
        defaultValue: ['', '', '']
      },
      {
        id: 'r_control',
        label: 'What is in my control',
        prompt: 'What is in my control',
        type: 'list_dyn',
        min: 3,
        max: 6,
        defaultValue: ['', '', '']
      },
      {
        id: 'r_thesis',
        label: 'Bench Thesis',
        prompt: 'This bench period is an opportunity to:',
        type: 'text_long',
        placeholder: 'stop saying yes to whatever\'s available and figure out what I actually want next.'
      },
      {
        id: 'r_future_self',
        label: 'Future Self',
        prompt: 'Describe the professional I want to be when this bench period ends',
        type: 'text_long',
        placeholder: 'Describe your posture, confidence, and boundaries...'
      },
      {
        id: 'r_guardrail',
        label: 'Non-Negotiable Guardrail',
        prompt: 'What must not happen during this period?',
        type: 'text_long',
        placeholder: 'What boundaries will you protect at all costs?'
      },
      {
        id: 'r_leaving',
        label: 'What am I leaving behind?',
        prompt: 'What am I leaving behind?',
        type: 'text_short',
        placeholder: 'e.g. Seeking validation through busyness, toxic workspaces...'
      },
      {
        id: 'r_reset_sentence',
        label: 'Reset Sentence',
        prompt: 'One sentence that would make this bench period feel like a success. Not a recovery.',
        type: 'text_long',
        placeholder: 'Success this season means I stop measuring my worth by how busy I look.'
      }
    ]
  },
  {
    id: '02',
    title: 'Designing What\'s Next',
    stage: 'Clarify',
    estimatedMinutes: 15,
    isEssential: false, // Recommended
    workbookPages: 'pp. 15–18',
    carries: [
      { key: 'bench_thesis', sectionId: '01', label: 'Bench Thesis', sectionName: 'Bench Reset' }
    ],
    fields: [
      // Movement 1: IMAGINE
      {
        id: 'n_life',
        label: 'Imagine: Life & Work',
        prompt: 'What kind of life am I building, and what role should work play within it?',
        type: 'text_xl',
        placeholder: 'Think about relationships, health, and schedule first, then work.'
      },
      {
        id: 'n_environment',
        label: 'Imagine: Work Environment',
        prompt: 'Describe the work environment, engagement type, and daily rhythm I am building toward. What does a good day look like twelve months from now?',
        type: 'text_xl',
        placeholder: 'Specify remote/hybrid, team size, solo vs collaborative, hours...'
      },
      {
        id: 'n_one_area',
        label: 'Imagine: One Priority Area',
        prompt: 'If I could make meaningful progress in only one area over the next 90 days, what would it be?',
        type: 'text_long',
        placeholder: 'Keep it singular and focused...'
      },
      // Movement 2: FILTER
      {
        id: 'n_success_12mo',
        label: 'Filter: Success in 12 Months',
        prompt: 'What would success look like 12 months from now?',
        type: 'text_xl',
        placeholder: 'Be specific about outcomes, finances, and achievements...'
      },
      {
        id: 'n_regret',
        label: 'Filter: Potential Regrets',
        prompt: 'What would I regret not pursuing?',
        type: 'text_long',
        placeholder: 'What are the risks worth taking?'
      },
      {
        id: 'n_more_of',
        label: 'Filter: More of',
        prompt: 'More of',
        type: 'list_dyn',
        min: 3,
        max: 6,
        defaultValue: ['', '', '']
      },
      {
        id: 'n_less_of',
        label: 'Filter: Less of',
        prompt: 'Less of',
        type: 'list_dyn',
        min: 3,
        max: 6,
        defaultValue: ['', '', '']
      },
      // Movement 3: DECLARE
      {
        id: 'n_introduction',
        label: 'Declare: Professional Introduction',
        prompt: 'In twelve months, when someone introduces me professionally, what do I want them to say about what I do and how I do it?',
        type: 'text_long',
        placeholder: 'e.g. "Jane is the person you bring in when you need to solve..."'
      },
      {
        id: 'n_north_star',
        label: 'Declare: One-Sentence North Star',
        prompt: 'What am I moving toward?',
        helperText: 'Your North Star is complete when you can read it aloud and it still sounds like you.',
        type: 'text_long',
        placeholder: 'Describe your destination in a single, clear sentence...'
      },
      {
        id: 'n_reflection',
        label: 'Checkpoint Check',
        prompt: 'Which of these outputs feels most important right now?',
        type: 'text_short',
        placeholder: 'e.g. My North Star, My 90-day progress target...'
      }
    ]
  },
  {
    id: '03',
    title: 'Bench Audit',
    stage: 'Position',
    estimatedMinutes: 25,
    isEssential: true,
    workbookPages: 'pp. 19–23',
    benchNote: 'Before we map your strengths, remember: we are not cataloging everything you have ever done. We are selecting and packaging the assets that serve your North Star. If it doesn\'t fit where you are going, it belongs in the archives, not on your maps.',
    carries: [
      { key: 'north_star', sectionId: '02', label: 'North Star', sectionName: 'Designing What\'s Next' },
      { key: 'priority_areas', sectionId: '00', label: 'Three Priority Areas', sectionName: 'The Bench Diagnostic' }
    ],
    fields: [
      // 3a. Strength Map (group of fixed items)
      {
        id: 'sm_map',
        label: 'Strength Map',
        type: 'group',
        fields: [
          // Core Skills
          {
            id: 'sm_core',
            label: 'Core Skills',
            prompt: 'The technical and functional work you are trained to do',
            type: 'group',
            fields: [
              { id: 'built', label: 'Built', type: 'text_long', placeholder: 'Project coordination, stakeholder communication.' },
              { id: 'surface', label: 'Surface', type: 'text_long', placeholder: 'Mentored new team members, never documented anywhere.' },
              { id: 'strengthen', label: 'Strengthen', type: 'text_long', placeholder: 'Presenting recommendations to larger groups.' }
            ]
          },
          // Industry Knowledge
          {
            id: 'sm_industry',
            label: 'Industry Knowledge',
            prompt: 'Sector context, domain fluency, and market awareness',
            type: 'group',
            fields: [
              { id: 'built', label: 'Built', type: 'text_long' },
              { id: 'surface', label: 'Surface', type: 'text_long' },
              { id: 'strengthen', label: 'Strengthen', type: 'text_long' }
            ]
          },
          // Proof of Outcomes
          {
            id: 'sm_proof',
            label: 'Proof of Outcomes',
            prompt: 'Documented results, case studies, and measurable impact',
            type: 'group',
            fields: [
              { id: 'built', label: 'Built', type: 'text_long' },
              { id: 'surface', label: 'Surface', type: 'text_long' },
              { id: 'strengthen', label: 'Strengthen', type: 'text_long' }
            ]
          },
          // Communication
          {
            id: 'sm_comms',
            label: 'Communication',
            prompt: 'How clearly you convey complex ideas to different audiences',
            type: 'group',
            fields: [
              { id: 'built', label: 'Built', type: 'text_long' },
              { id: 'surface', label: 'Surface', type: 'text_long' },
              { id: 'strengthen', label: 'Strengthen', type: 'text_long' }
            ]
          },
          // Network Strength
          {
            id: 'sm_network',
            label: 'Network Strength',
            prompt: 'The quality and activation of your professional relationships',
            type: 'group',
            fields: [
              { id: 'built', label: 'Built', type: 'text_long' },
              { id: 'surface', label: 'Surface', type: 'text_long' },
              { id: 'strengthen', label: 'Strengthen', type: 'text_long' }
            ]
          },
          // Technical Credibility
          {
            id: 'sm_credibility',
            label: 'Technical Credibility',
            prompt: 'Certifications, tools, platforms, and demonstrated depth',
            type: 'group',
            fields: [
              { id: 'built', label: 'Built', type: 'text_long' },
              { id: 'surface', label: 'Surface', type: 'text_long' },
              { id: 'strengthen', label: 'Strengthen', type: 'text_long' }
            ]
          },
          // Personal Brand Clarity
          {
            id: 'sm_brand',
            label: 'Personal Brand Clarity',
            prompt: 'How consistently your professional identity comes across',
            type: 'group',
            fields: [
              { id: 'built', label: 'Built', type: 'text_long' },
              { id: 'surface', label: 'Surface', type: 'text_long' },
              { id: 'strengthen', label: 'Strengthen', type: 'text_long' }
            ]
          }
        ]
      },
      // 3b. Marketable Strengths (group x 4)
      {
        id: 'sm_marketable',
        label: 'Marketable Strengths',
        prompt: 'Transfer the strengths you already identified on the previous page. Do not generate new strengths here.',
        type: 'group',
        fields: [
          {
            id: 'ms_1',
            label: 'Strength 1',
            type: 'group',
            fields: [
              { id: 'strength', label: 'Strength', type: 'text_short', optionsSource: 'sm_built_picker' },
              { id: 'evidence', label: 'Evidence', type: 'text_long' },
              { id: 'where_visible', label: 'Where is this visible?', type: 'text_short' }
            ]
          },
          {
            id: 'ms_2',
            label: 'Strength 2',
            type: 'group',
            fields: [
              { id: 'strength', label: 'Strength', type: 'text_short', optionsSource: 'sm_built_picker' },
              { id: 'evidence', label: 'Evidence', type: 'text_long' },
              { id: 'where_visible', label: 'Where is this visible?', type: 'text_short' }
            ]
          },
          {
            id: 'ms_3',
            label: 'Strength 3',
            type: 'group',
            fields: [
              { id: 'strength', label: 'Strength', type: 'text_short', optionsSource: 'sm_built_picker' },
              { id: 'evidence', label: 'Evidence', type: 'text_long' },
              { id: 'where_visible', label: 'Where is this visible?', type: 'text_short' }
            ]
          },
          {
            id: 'ms_4',
            label: 'Strength 4',
            type: 'group',
            fields: [
              { id: 'strength', label: 'Strength', type: 'text_short', optionsSource: 'sm_built_picker' },
              { id: 'evidence', label: 'Evidence', type: 'text_long' },
              { id: 'where_visible', label: 'Where is this visible?', type: 'text_short' }
            ]
          }
        ]
      },
      // 3c. Hidden Assets
      {
        id: 'h_trust',
        label: 'Trusted & Proven',
        prompt: 'What do people already trust me to solve?',
        type: 'text_long'
      },
      {
        id: 'h_invisible',
        label: 'Trusted & Proven',
        prompt: 'Which achievements are strongest but least visible?',
        type: 'text_long'
      },
      {
        id: 'h_energy',
        label: 'Energy & Fit',
        prompt: 'What kinds of work give me the most energy?',
        type: 'text_long'
      },
      {
        id: 'h_drain',
        label: 'Energy & Fit',
        prompt: 'What kinds of work drain me, even if I am good at them?',
        type: 'text_long'
      },
      {
        id: 'h_underused',
        label: 'Undervalued Strengths',
        prompt: 'Which of my strengths are underused?',
        type: 'text_long'
      },
      {
        id: 'h_normal',
        label: 'Undervalued Strengths',
        prompt: 'What have I done that feels normal to me but would be impressive to someone else?',
        type: 'text_long'
      },
      // 3d. Decide
      {
        id: 'a_strengthen_priority',
        label: 'Strengthen Priority',
        prompt: 'Which area in STRENGTHEN matters most to where I am going?',
        type: 'text_long'
      },
      {
        id: 'a_surface_visible',
        label: 'Surface Area Visible',
        prompt: 'Which area in SURFACE could become visible with one specific action?',
        type: 'text_long'
      },
      {
        id: 'a_action_30d',
        label: '30-Day Action',
        prompt: 'What is the one action that would make your SURFACE area visible in the next 30 days?',
        type: 'text_long'
      },
      {
        id: 'a_top3',
        label: 'Top 3 Priority Areas',
        prompt: 'Define your top 3 priority areas for the next phase.',
        type: 'list_n',
        count: 3,
        defaultValue: ['', '', '']
      }
    ]
  },
  {
    id: '05',
    title: 'Professional Positioning',
    stage: 'Position',
    estimatedMinutes: 20,
    isEssential: false, // Recommended
    workbookPages: 'pp. 28–33',
    carries: [
      { key: 'bench_thesis', sectionId: '01', label: 'Bench Thesis', sectionName: 'Bench Reset' },
      { key: 'north_star', sectionId: '02', label: 'North Star', sectionName: 'Designing What\'s Next' },
      { key: 'top_3_areas', sectionId: '03', label: 'Top 3 Priority Areas', sectionName: 'Bench Audit' }
    ],
    fields: [
      {
        id: 'p_who',
        label: 'I help [who]',
        prompt: 'I help [who]',
        type: 'text_short',
        placeholder: 'e.g. early-stage B2B startups...'
      },
      {
        id: 'p_outcome',
        label: 'achieve [outcome]',
        prompt: 'achieve [outcome]',
        type: 'text_short',
        placeholder: 'e.g. scale their organic acquisition to $1M ARR...'
      },
      {
        id: 'p_approach',
        label: 'through [your approach or expertise]',
        prompt: 'through [your approach or expertise]',
        type: 'text_short',
        placeholder: 'e.g. data-driven product led growth funnels...'
      },
      {
        id: 'p_draft',
        label: 'Positioning Statement (Draft)',
        prompt: 'Positioning statement (draft)',
        type: 'computed'
      },
      {
        id: 'p_audience',
        label: 'Target Audience',
        prompt: 'My primary target audience. Be specific. Not \'companies\'. What type, size, industry?',
        type: 'text_long',
        placeholder: 'Specify size, sector, decision-maker title, and key problems...'
      },
      // Evidence (group x 3)
      {
        id: 'p_evidence_list',
        label: 'Key Proof Points',
        type: 'group',
        fields: [
          {
            id: 'ev_1',
            label: 'Proof Point 1',
            type: 'group',
            fields: [
              { id: 'delivered', label: 'What I delivered', type: 'text_long', placeholder: 'Led the migration of legacy system...' },
              { id: 'impact', label: 'Quantifiable impact', type: 'text_long', placeholder: 'Saved $50k/mo and cut loading time by 40%...' },
              { id: 'where_to_find', label: 'Where to find proof', type: 'text_short', placeholder: 'GitHub repo, LinkedIn post link...' }
            ]
          },
          {
            id: 'ev_2',
            label: 'Proof Point 2',
            type: 'group',
            fields: [
              { id: 'delivered', label: 'What I delivered', type: 'text_long' },
              { id: 'impact', label: 'Quantifiable impact', type: 'text_long' },
              { id: 'where_to_find', label: 'Where to find proof', type: 'text_short' }
            ]
          },
          {
            id: 'ev_3',
            label: 'Proof Point 3',
            type: 'group',
            fields: [
              { id: 'delivered', label: 'What I delivered', type: 'text_long' },
              { id: 'impact', label: 'Quantifiable impact', type: 'text_long' },
              { id: 'where_to_find', label: 'Where to find proof', type: 'text_short' }
            ]
          }
        ]
      },
      // Alternate angles (group x 2)
      {
        id: 'p_angles',
        label: 'Alternative Positioning Angles',
        type: 'group',
        fields: [
          {
            id: 'angle_1',
            label: 'Angle 1',
            type: 'group',
            fields: [
              { id: 'audience', label: 'Audience / Focus', type: 'text_short', placeholder: 'e.g. Solo SaaS founders' },
              { id: 'value', label: 'Value / Hook', type: 'text_short', placeholder: 'e.g. Build MVP in 4 weeks' },
              { id: 'why_works', label: 'Why this works', type: 'text_long', placeholder: 'Leverages my speed with boilerplate tools.' }
            ]
          },
          {
            id: 'angle_2',
            label: 'Angle 2',
            type: 'group',
            fields: [
              { id: 'audience', label: 'Audience / Focus', type: 'text_short' },
              { id: 'value', label: 'Value / Hook', type: 'text_short' },
              { id: 'why_works', label: 'Why this works', type: 'text_long' }
            ]
          }
        ]
      },
      {
        id: 'p_final',
        label: 'Final Positioning Statement',
        prompt: 'Final Positioning Statement. Compare your draft with your two alternate angles. Which is most specific, most credible, most aligned?',
        type: 'text_long',
        placeholder: 'Write your finalized positioning statement...'
      },
      {
        id: 'p_brand_sentence',
        label: 'Brand Sentence',
        prompt: 'The one sentence that defines my professional brand right now',
        type: 'text_long'
      },
      {
        id: 'p_goto',
        label: 'Go-To Focus',
        prompt: 'What do I want to be the go-to person for?',
        type: 'text_long'
      },
      // Story Cleanup
      {
        id: 'p_hiding',
        label: 'Label Hiding Behind',
        prompt: 'What title or label am I hiding behind?',
        type: 'text_long'
      },
      {
        id: 'p_hired_for',
        label: 'What Hired For',
        prompt: 'What do I really want to be hired for?',
        type: 'text_long'
      },
      {
        id: 'p_stop_describing',
        label: 'Stop Describing',
        prompt: 'What kind of work should I stop describing as my focus?',
        type: 'text_long'
      },
      {
        id: 'p_evidence_new',
        label: 'New Direction Evidence',
        prompt: 'What evidence supports the new direction?',
        type: 'text_long'
      }
    ]
  },
  {
    id: '10',
    title: '30 / 60 / 90 Bench Plan',
    stage: 'Execute',
    estimatedMinutes: 20,
    isEssential: true,
    workbookPages: 'pp. 51–53',
    instructionText: 'Do not fill every line. Focus on the few priorities most likely to create momentum.',
    carries: [
      { key: 'north_star', sectionId: '02', label: 'North Star', sectionName: 'Designing What\'s Next' },
      { key: 'top_3_areas', sectionId: '03', label: 'Top 3 Priority Areas', sectionName: 'Bench Audit' },
      { key: 'first_action', sectionId: '03', label: '30-Day Action', sectionName: 'Bench Audit' }
    ],
    fields: [
      {
        id: 'b_runway_months',
        label: 'Financial Runway (Months)',
        prompt: 'How many months of liquid cash runway do you have?',
        helperText: 'Optional. If under 2 months, a plan restriction warning will guide you to focus exclusively on Days 1-30.',
        type: 'text_short',
        placeholder: 'e.g. 3'
      },
      {
        id: 'phase_1',
        label: 'Days 1–30',
        prompt: 'Foundation — Audit, clarity, and positioning',
        type: 'group',
        fields: [
          { id: 'priority_1', label: 'Priority 1', type: 'text_short' },
          { id: 'priority_2', label: 'Priority 2', type: 'text_short' },
          { id: 'priority_3', label: 'Priority 3', type: 'text_short' },
          { id: 'milestone', label: '30-Day Milestone', type: 'text_long', placeholder: 'What must be true by Day 30?' },
          { id: 'success_metric', label: 'Success Metric', type: 'text_long', placeholder: 'e.g. Positioning statement finalized.' }
        ]
      },
      {
        id: 'phase_2',
        label: 'Days 31–60',
        prompt: 'Build — Visibility, proof, and outreach',
        type: 'group',
        fields: [
          { id: 'priority_1', label: 'Priority 1', type: 'text_short' },
          { id: 'priority_2', label: 'Priority 2', type: 'text_short' },
          { id: 'priority_3', label: 'Priority 3', type: 'text_short' },
          { id: 'milestone', label: '60-Day Milestone', type: 'text_long' },
          { id: 'success_metric', label: 'Success Metric', type: 'text_long', placeholder: 'e.g. First visibility asset published.' }
        ]
      },
      {
        id: 'phase_3',
        label: 'Days 61–90',
        prompt: 'Convert — Opportunities, decisions, and momentum',
        type: 'group',
        fields: [
          { id: 'priority_1', label: 'Priority 1', type: 'text_short' },
          { id: 'priority_2', label: 'Priority 2', type: 'text_short' },
          { id: 'priority_3', label: 'Priority 3', type: 'text_short' },
          { id: 'milestone', label: '90-Day Milestone', type: 'text_long' },
          { id: 'success_metric', label: 'Success Metric', type: 'text_long', placeholder: 'e.g. At least one opportunity in motion.' }
        ]
      },
      {
        id: 'b_next_7_days',
        label: 'Next 7 Days Actions',
        prompt: 'In the next 7 days I will',
        type: 'text_long'
      },
      {
        id: 'b_tomorrow',
        label: 'Tomorrow Morning',
        prompt: 'The first thing I will do tomorrow morning',
        type: 'text_short',
        placeholder: 'Keep it small and immediate...'
      },
      {
        id: 'b_day_30',
        label: 'Day 30 Success Picture',
        prompt: 'What success looks like at Day 30',
        type: 'text_long'
      }
    ]
  },
  {
    id: '15',
    title: 'Reinvention Review',
    stage: 'Review & Reinvent',
    estimatedMinutes: 20,
    isEssential: false, // Recommended
    workbookPages: 'pp. 69–72',
    instructionText: 'This section is different. There is no score to calculate and no framework to complete.',
    carries: [
      { key: 'bench_thesis', sectionId: '01', label: 'Bench Thesis', sectionName: 'Bench Reset' },
      { key: 'reset_sentence', sectionId: '01', label: 'Reset Sentence', sectionName: 'Bench Reset' },
      { key: 'north_star', sectionId: '02', label: 'North Star', sectionName: 'Designing What\'s Next' }
    ],
    fields: [
      {
        id: 'v_differently',
        label: 'Seeing Work Differently',
        prompt: 'How do I see my work differently now than when I started this workbook?',
        type: 'text_xl'
      },
      {
        id: 'v_becoming',
        label: 'Professional I Am Becoming',
        prompt: 'What kind of professional am I becoming?',
        type: 'text_xl'
      },
      {
        id: 'v_surprised',
        label: 'Surprises Along the Way',
        prompt: 'What surprised me?',
        type: 'text_xl'
      },
      {
        id: 'v_clearer',
        label: 'Things I Am Clearer On',
        prompt: 'What am I clearer on now?',
        type: 'text_xl'
      },
      {
        id: 'v_unsure',
        label: 'Things I Was Not Sure I Could Do',
        prompt: 'What did I do during this period that I was not sure I could do?',
        type: 'text_xl'
      },
      {
        id: 'v_outlast',
        label: 'Assets That Will Outlast',
        prompt: 'What did I build that will outlast this chapter?',
        type: 'text_xl'
      },
      {
        id: 'v_proved',
        label: 'What I Proved to Myself',
        prompt: 'What did I prove to myself during this season?',
        type: 'text_xl'
      },
      {
        id: 'v_carrying',
        label: 'Carrying Forward',
        prompt: 'What am I carrying forward into my next season?',
        type: 'text_xl'
      },
      {
        id: 'v_remember',
        label: 'What to Remember',
        prompt: 'What do I want the next version of me to remember about this period?',
        type: 'text_xl'
      },
      {
        id: 'v_letter',
        label: 'A Letter to the Next Version of Me',
        prompt: 'A Letter to the Next Version of Me',
        type: 'text_xl',
        placeholder: 'Write a comprehensive letter here. Focus on clarity...'
      },
      {
        id: 'v_letter_date',
        label: 'Signature Date',
        prompt: 'Signed Date',
        type: 'date'
      }
    ]
  }
]
