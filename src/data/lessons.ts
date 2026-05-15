export interface VocabItem {
  word: string
  definition: string
  example: string
}

export interface LessonStepSeed {
  order: number
  partType: 'INTRO' | 'BODY_1' | 'BODY_2' | 'CONCLUSION'
  title: string
  instruction: string
  evaluationCriteria: string
  starter?: string
  vocabBank?: VocabItem[]
  grammarTip?: string
  modelAnswer?: string
}

export interface LessonSeed {
  taskType: 'TASK1' | 'TASK2'
  category: string
  title: string
  description: string
  order: number
  steps: LessonStepSeed[]
}

export const lessons: LessonSeed[] = [
  // ═══ TASK 2: OPINION ESSAY ═══════════════════════════════════════════════
  {
    taskType: 'TASK2',
    category: 'OPINION',
    title: 'Opinion Essay (Agree / Disagree)',
    description:
      'Master the 4-paragraph structure for "to what extent do you agree or disagree?" questions. Band 7+ techniques included.',
    order: 1,
    steps: [
      {
        order: 1,
        partType: 'INTRO',
        title: 'Write the Introduction',
        instruction:
          'Paraphrase the question in 1–2 sentences WITHOUT copying it. Then state your clear position. Use formal academic phrases. Target: 45–60 words.\n\n⚠️ Do NOT start with "In this essay..." or "I will discuss...". Do NOT copy the question word for word.',
        evaluationCriteria:
          'Check: (1) Question paraphrased with synonyms/restructuring? (2) Clear opinion stated? (3) 45-60 words? (4) No direct copying from prompt? (5) Academic register?',
        starter: 'It is widely argued that',
        vocabBank: [
          { word: 'prevalent', definition: 'widespread; common in society', example: 'It has become prevalent in recent decades to...' },
          { word: 'contentious', definition: 'causing disagreement or controversy', example: 'This contentious issue divides opinions worldwide.' },
          { word: 'proponents', definition: 'people who support a cause or argument', example: 'Proponents of this view contend that...' },
          { word: 'contend', definition: 'to argue or assert firmly', example: 'While many contend that..., I firmly believe...' },
          { word: 'advocate', definition: 'to publicly support; a person who supports', example: 'I strongly advocate the position that...' },
          { word: 'merits', definition: 'the value or quality of something', example: 'Despite the merits of both sides, I believe...' },
          { word: 'perspective', definition: 'a particular point of view or attitude', example: 'From an economic perspective, this policy...' },
        ],
        grammarTip:
          '🎯 Use impersonal passive to introduce the topic — sounds more academic:\n• "It is often argued that..."\n• "It has been suggested that..."\n• "There is growing debate about..."\n\nFor your opinion: "I firmly believe / I would argue / I am convinced that..."',
        modelAnswer:
          'There is growing debate about whether universities should prioritise practical, job-ready training over traditional academic scholarship. While both approaches have considerable merit, I firmly believe that higher education should primarily develop critical thinking and intellectual rigour, as these skills provide a foundation that transcends any single career path.',
      },
      {
        order: 2,
        partType: 'BODY_1',
        title: 'Body Paragraph 1 — Main Argument',
        instruction:
          'Present your STRONGEST reason. Structure:\n1. Topic sentence (your argument in one sentence)\n2. Explanation (WHY this is true — logic)\n3. Example (specific, real, named — not "studies show")\n4. Link back to thesis (optional)\n\nTarget: 75–100 words.',
        evaluationCriteria:
          'Check: (1) Clear topic sentence with argument? (2) Explanation with logical reasoning? (3) Specific named example (not generic "studies show")? (4) Cohesive flow with linkers? (5) 75-100 words?',
        starter: 'To begin with,',
        vocabBank: [
          { word: 'indispensable', definition: 'absolutely necessary; essential', example: 'Critical thinking is indispensable in today\'s rapidly changing workplaces.' },
          { word: 'consequently', definition: 'as a result; therefore', example: 'Consequently, graduates are better equipped to adapt to new challenges.' },
          { word: 'exemplified', definition: 'illustrated or shown by example', example: 'This is exemplified by companies like Google, which actively recruit...' },
          { word: 'demonstrate', definition: 'to show or prove something clearly', example: 'Research by Stanford University demonstrates that...' },
          { word: 'underpin', definition: 'to support or form the basis of', example: 'Academic skills underpin long-term professional success.' },
          { word: 'tangible', definition: 'real and concrete; can be measured', example: 'The tangible benefits of this approach include...' },
        ],
        grammarTip:
          '🎯 Avoid weak evidence phrases:\n✗ "Studies show that..." (which studies?)\n✗ "Many people think that..." (too vague)\n\n✓ Use NAMED examples:\n"For instance, a 2023 report by the World Economic Forum found that..."\n"Stanford University\'s research shows that..."\n"In Singapore, where academic education is prioritised, the unemployment rate is..."',
        modelAnswer:
          'To begin with, a university education grounded in academic disciplines cultivates transferable analytical skills that remain valuable across diverse industries. When students engage deeply with abstract reasoning in fields such as philosophy or mathematics, they develop the capacity to dissect complex problems — a skill that no vocational course can replicate. For instance, LinkedIn\'s 2023 Global Talent Trends report identified critical thinking as the single most in-demand skill among employers, confirming that academic training directly enhances employability rather than undermining it.',
      },
      {
        order: 3,
        partType: 'BODY_2',
        title: 'Body Paragraph 2 — Supporting Argument',
        instruction:
          'Present a DIFFERENT reason supporting the same position. Do NOT repeat Body 1 with different words — choose a new angle.\n\nExample angles: economic, social, personal development, long-term vs short-term.\n\nUse "Moreover", "Furthermore", or "Additionally" to open.\n\nTarget: 75–100 words.',
        evaluationCriteria:
          'Check: (1) Different angle from Body 1? (2) Own specific example? (3) Not a paraphrase of Body 1? (4) 75-100 words? (5) Academic vocabulary?',
        starter: 'Furthermore,',
        vocabBank: [
          { word: 'adaptability', definition: 'ability to adjust to new conditions', example: 'Academic training fosters adaptability in uncertain career landscapes.' },
          { word: 'versatile', definition: 'able to be applied in many situations', example: 'A versatile skill set is more valuable than narrow technical knowledge.' },
          { word: 'obsolete', definition: 'out of date; no longer useful', example: 'Many vocational skills become obsolete within a decade of graduation.' },
          { word: 'foster', definition: 'to encourage the development of something', example: 'Universities foster intellectual independence through open inquiry.' },
          { word: 'coherent', definition: 'logical and consistent', example: 'A coherent argument requires both evidence and clear reasoning.' },
          { word: 'autonomy', definition: 'independence; self-direction', example: 'Academic study develops intellectual autonomy...' },
        ],
        grammarTip:
          '🎯 Show contrast and nuance with these structures:\n• "Although vocational training has its place, the long-term benefits of..."\n• "While critics argue that X, the reality is that..."\n• "It is true that...; however, this overlooks the fact that..."\n\nThis shows sophisticated "concede and refute" thinking, which examiners reward.',
        modelAnswer:
          'Furthermore, in an era of rapid technological change, academic breadth future-proofs graduates far more effectively than narrow vocational preparation. Skills taught in technical courses frequently become obsolete within a decade as industries evolve; by contrast, the research methods, logical argumentation, and self-directed learning fostered by academic study remain relevant regardless of technological shifts. Germany\'s dual education system illustrates this: while its apprenticeship model is admired globally, German universities simultaneously produced the research that drives the country\'s innovation-led economy.',
      },
      {
        order: 4,
        partType: 'CONCLUSION',
        title: 'Write the Conclusion',
        instruction:
          'Restate your opinion in NEW words — never copy from your introduction. Briefly summarise BOTH reasons from Body 1 and Body 2.\n\n⚠️ Do NOT introduce any new ideas.\n⚠️ Do NOT start with "In conclusion, I think that..."\n\nTarget: 35–50 words.',
        evaluationCriteria:
          'Check: (1) Opinion restated with new vocabulary? (2) Both body points summarised briefly? (3) No new ideas? (4) Does NOT start with "I think"? (5) 35-50 words?',
        starter: 'In conclusion,',
        grammarTip:
          '🎯 Vary your conclusion opener:\n• "In conclusion, it is my view that..."\n• "To conclude, the evidence strongly suggests..."\n• "Overall, I remain convinced that..."\n\nSummarise compactly: "...because of both [reason 1] and [reason 2]."',
        modelAnswer:
          'In conclusion, it is my firm view that universities serve society best by prioritising intellectual development over vocational training, as both analytical thinking and adaptability to change are skills that the modern economy values above all else.',
      },
    ],
  },

  // ═══ TASK 2: DISCUSSION ══════════════════════════════════════════════════
  {
    taskType: 'TASK2',
    category: 'DISCUSSION',
    title: 'Discussion Essay (Both Views)',
    description:
      'Master "discuss both views and give your own opinion" questions with genuinely balanced argumentation.',
    order: 2,
    steps: [
      {
        order: 1,
        partType: 'INTRO',
        title: 'Write the Introduction',
        instruction:
          'Paraphrase the debate, mention BOTH sides in one sentence, then clearly state which view you favour.\n\nStructure: Background sentence → "While some argue X, others believe Y" → your position.\n\nTarget: 50–70 words.',
        evaluationCriteria:
          'Check: (1) Both views introduced? (2) Own position clearly stated at end? (3) Question paraphrased not copied? (4) 50-70 words? (5) Academic register?',
        starter: 'There is ongoing debate about whether',
        vocabBank: [
          { word: 'divisive', definition: 'causing strong disagreement between groups', example: 'This divisive question has no easy answer.' },
          { word: 'polarised', definition: 'divided into two opposing camps', example: 'Opinion on this issue is sharply polarised.' },
          { word: 'acknowledge', definition: 'to recognise the existence of something', example: 'While I acknowledge the strength of both arguments...' },
          { word: 'valid', definition: 'well-founded; logically sound', example: 'Both perspectives raise valid concerns.' },
          { word: 'concede', definition: 'to admit something is true despite disagreeing', example: 'I concede that opponents have a point, but...' },
          { word: 'nonetheless', definition: 'in spite of that; nevertheless', example: 'Nonetheless, I would argue that...' },
        ],
        grammarTip:
          '🎯 Use "while/although" + noun clause to show balance in one sentence:\n"While some argue that [View A], others contend that [View B]."\n\nCommon error: Writing "Some people think X. Other people think Y." — this is B1 level. Use a single complex sentence.',
        modelAnswer:
          'There is ongoing debate about the extent to which technological innovation has improved the quality of human life. While some argue that modern technology has resolved pressing global challenges and enhanced personal freedoms, others contend that it has deepened inequality and eroded social bonds. Although both perspectives contain validity, I would argue that the net benefits of technological progress significantly outweigh its drawbacks.',
      },
      {
        order: 2,
        partType: 'BODY_1',
        title: 'Body Paragraph 1 — The Opposing View',
        instruction:
          'Discuss the view you do NOT fully agree with, but present it FAIRLY and SERIOUSLY. Steelman the argument — give it the best possible version.\n\nDo not be dismissive. A good examiner notices when you represent opposing views weakly.\n\nTarget: 85–105 words.',
        evaluationCriteria:
          'Check: (1) Fair, serious representation of the opposing view? (2) Specific reasoning + example? (3) Neutral/concessive tone? (4) 85-105 words? (5) No personal opinion in this paragraph?',
        starter: 'On the one hand, those who believe that',
        vocabBank: [
          { word: 'compelling', definition: 'powerful and convincing', example: 'There is a compelling case for...' },
          { word: 'proponents', definition: 'supporters of an idea', example: 'Proponents of this view highlight...' },
          { word: 'substantiate', definition: 'to provide evidence to support', example: 'This claim is substantiated by...' },
          { word: 'inevitably', definition: 'in a way that cannot be avoided', example: 'This will inevitably lead to...' },
          { word: 'entrenched', definition: 'firmly established; resistant to change', example: 'Entrenched inequality is perpetuated by...' },
        ],
        grammarTip:
          '🎯 Use distancing language to show you\'re presenting THEIR view, not yours:\n• "Proponents argue that..."\n• "Supporters of this view contend that..."\n• "According to this perspective..."\n• "It is claimed that..."\n\nThis shows examiner sophistication. Avoid: "Some people think" (too basic).',
        modelAnswer:
          'On the one hand, those who emphasise the negative consequences of modern technology raise compelling points. Proponents of this view contend that the proliferation of social media platforms has fundamentally undermined face-to-face communication, contributing to documented rises in loneliness and mental health disorders among younger generations. A 2022 report by the Royal Society of Public Health found that teenage girls who used Instagram heavily were significantly more likely to report anxiety and low self-esteem than non-users, substantiating concerns that technological "connection" can paradoxically deepen social isolation.',
      },
      {
        order: 3,
        partType: 'BODY_2',
        title: 'Body Paragraph 2 — Your Preferred View',
        instruction:
          'Now argue for the side YOU agree with, and make this paragraph STRONGER and MORE CONVINCING than Body 1.\n\nYou can briefly acknowledge Body 1\'s point at the start before countering it: "However, while X is a genuine concern, the broader picture shows that..."\n\nTarget: 85–105 words.',
        evaluationCriteria:
          'Check: (1) Your preferred view argued persuasively? (2) More convincing than Body 1? (3) Optional concession to B1 view? (4) Specific example? (5) 85-105 words?',
        starter: 'On the other hand, I would argue that',
        vocabBank: [
          { word: 'outweigh', definition: 'to be more important than', example: 'The benefits outweigh the drawbacks in this case.' },
          { word: 'indisputable', definition: 'impossible to deny or argue against', example: 'It is indisputable that technology has extended life expectancy.' },
          { word: 'mitigate', definition: 'to reduce the severity of something negative', example: 'These risks can be mitigated through regulation.' },
          { word: 'unprecedented', definition: 'never done or known before', example: 'Technology has enabled unprecedented access to information.' },
          { word: 'fundamentally', definition: 'in a basic and important way', example: 'This has fundamentally transformed how we live and work.' },
        ],
        grammarTip:
          '🎯 Use "concede and refute" for a sophisticated argument:\n"While it is true that [opposing point], the fact remains that [stronger counter-point]."\n\nAlso use causal structures for a more academic feel:\n"This has led to / resulted in / given rise to [positive outcome]."',
        modelAnswer:
          'On the other hand, I would argue that the transformative benefits of technology are far more profound and widespread than its social costs. While concerns about mental health are genuine, they represent a manageable challenge rather than an indictment of technology itself. Historically, every major technological revolution — from the printing press to the telephone — provoked similar fears that ultimately proved exaggerated. More critically, modern medical technology has reduced child mortality by over 50% since 1990, according to UNICEF, and digital platforms have given marginalised communities an unprecedented voice in public discourse.',
      },
      {
        order: 4,
        partType: 'CONCLUSION',
        title: 'Write the Conclusion',
        instruction:
          'Acknowledge both views briefly, then restate your position clearly.\n\n"In conclusion, while both views have merit, I believe [your side] because [compressed reason 1] and [compressed reason 2]."\n\nTarget: 40–55 words.',
        evaluationCriteria:
          'Check: (1) Both views briefly acknowledged? (2) Final position clearly stated? (3) No new ideas? (4) 40-55 words?',
        starter: 'In conclusion, while both perspectives have merit,',
        grammarTip:
          '🎯 A Band 7+ conclusion signals epistemic humility:\n"...although [opposite view\'s concern] deserves attention, the weight of evidence suggests..."\n\nThis shows you can hold complexity in your mind — a marker of academic maturity.',
        modelAnswer:
          'In conclusion, while both perspectives have merit, I am ultimately persuaded that technology has been a net positive force for humanity. Although its social consequences require careful management, the life-saving advances and democratic possibilities it has unlocked represent genuinely irreversible progress.',
      },
    ],
  },

  // ═══ TASK 2: PROBLEM / SOLUTION ══════════════════════════════════════════
  {
    taskType: 'TASK2',
    category: 'PROBLEM_SOLUTION',
    title: 'Problem / Solution Essay',
    description:
      'Tackle "what are the causes? what solutions?" questions with a precise, analytical 4-paragraph structure.',
    order: 3,
    steps: [
      {
        order: 1,
        partType: 'INTRO',
        title: 'Write the Introduction',
        instruction:
          'Introduce the problem and its significance. Then state that you will examine causes and propose solutions (this is the "roadmap").\n\nDo NOT give any solutions yet — this is just the introduction.\n\nTarget: 45–65 words.',
        evaluationCriteria:
          'Check: (1) Problem paraphrased and contextualised? (2) Significance/scale of problem mentioned? (3) Roadmap given (causes + solutions)? (4) No solutions mentioned yet? (5) 45-65 words?',
        starter: 'In recent years, the issue of',
        vocabBank: [
          { word: 'exacerbated', definition: 'made worse or more serious', example: 'This problem has been exacerbated by rapid urbanisation.' },
          { word: 'ramifications', definition: 'complex or unwanted consequences', example: 'The ramifications of inaction are severe.' },
          { word: 'pervasive', definition: 'spreading widely throughout; ubiquitous', example: 'Obesity is a pervasive public health crisis.' },
          { word: 'mounting', definition: 'increasing steadily', example: 'There is mounting evidence that...' },
          { word: 'imperative', definition: 'of vital importance; crucial', example: 'It is imperative that governments act swiftly.' },
          { word: 'far-reaching', definition: 'having wide and significant effects', example: 'The far-reaching consequences of climate change...' },
        ],
        grammarTip:
          '🎯 Use noun phrases to describe the problem formally:\n"The rapid rise in / The dramatic increase in / The growing prevalence of [problem] has become a major concern for [who]."\n\nState its scale with data if possible: "affecting over X million people worldwide".',
        modelAnswer:
          'In recent decades, the alarming rise in youth unemployment has emerged as one of the most pressing socioeconomic challenges facing developed and developing nations alike. With millions of young people entering an increasingly competitive labour market without adequate preparation, the long-term consequences for social cohesion and economic productivity are considerable. This essay will examine the primary causes of this trend and propose several viable solutions.',
      },
      {
        order: 2,
        partType: 'BODY_1',
        title: 'Body Paragraph 1 — Causes',
        instruction:
          'Identify 1–2 specific, well-explained causes. Avoid listing 5 superficial causes — go DEEP on fewer.\n\nFor each cause:\n→ State the cause\n→ Explain the mechanism (why/how it causes the problem)\n→ Optionally give a concrete example\n\nTarget: 85–105 words.',
        evaluationCriteria:
          'Check: (1) 1-2 specific causes, not a superficial list? (2) Each cause mechanistically explained? (3) At least one example? (4) Causal language used ("this leads to", "as a result")? (5) 85-105 words?',
        starter: 'One of the primary causes of this problem is',
        vocabBank: [
          { word: 'attributable', definition: 'able to be explained by a particular cause', example: 'This trend is largely attributable to...' },
          { word: 'precipitate', definition: 'to cause something to happen suddenly', example: 'Economic inequality can precipitate social unrest.' },
          { word: 'stem from', definition: 'to originate from a particular source', example: 'These difficulties stem from a mismatch between...' },
          { word: 'compound', definition: 'to make a problem worse by adding to it', example: 'This issue is compounded by inadequate investment in...' },
          { word: 'catalyst', definition: 'something that accelerates a change', example: 'Automation has acted as a catalyst for job displacement.' },
        ],
        grammarTip:
          '🎯 Use clear causal language to show logical flow:\n• "This leads to / results in / gives rise to..."\n• "As a consequence, / As a result,..."\n• "This in turn causes / contributes to..."\n\nAvoid simply listing: "Another cause is X. Another cause is Y." — instead, create a chain of causation.',
        modelAnswer:
          'One of the primary causes of rising youth unemployment is the growing mismatch between educational curricula and labour market demands. Many secondary and tertiary institutions continue to teach skills that are increasingly automated, leaving graduates without the digital literacy and technological proficiency that employers now require as baseline competencies. This skills gap is compounded by declining investment in vocational training programmes across many OECD countries, meaning that young people who do not pursue university education have progressively fewer pathways into stable employment.',
      },
      {
        order: 3,
        partType: 'BODY_2',
        title: 'Body Paragraph 2 — Solutions',
        instruction:
          'Propose 1–2 concrete, realistic solutions that DIRECTLY ADDRESS the causes you identified in Body 1.\n\nLink your solutions back: "To address the skills gap identified above, governments could..."\n\nSpecify WHO should act (governments / employers / individuals / schools).\n\nTarget: 85–105 words.',
        evaluationCriteria:
          'Check: (1) Solutions clearly link to causes from Body 1? (2) Realistic and specific? (3) WHO acts is identified? (4) Effect/benefit explained? (5) 85-105 words?',
        starter: 'Several targeted measures could effectively address this issue.',
        vocabBank: [
          { word: 'implement', definition: 'to put a plan into action', example: 'Governments should implement policies that...' },
          { word: 'alleviate', definition: 'to make suffering or a problem less severe', example: 'This measure would significantly alleviate youth unemployment.' },
          { word: 'incentivise', definition: 'to motivate by offering a reward', example: 'Tax breaks could incentivise companies to hire graduates.' },
          { word: 'overhaul', definition: 'to completely reform or redesign', example: 'An overhaul of the curriculum is long overdue.' },
          { word: 'collaboratively', definition: 'by working together', example: 'Governments and businesses should work collaboratively to...' },
          { word: 'sustained', definition: 'continuing for a long time', example: 'Only sustained investment will produce meaningful results.' },
        ],
        grammarTip:
          '🎯 Use modal verbs to make recommendations:\n• Strong: "governments must / should / are obliged to..."\n• Tentative: "one possible approach would be to / could involve..."\n\nAlso use purpose clauses: "...so that graduates can / ...in order to ensure that..."',
        modelAnswer:
          'Several targeted measures could effectively address this issue. To tackle the skills mismatch identified above, governments should collaborate with technology companies to overhaul secondary school curricula, embedding digital literacy, coding, and data analysis as core subjects alongside traditional disciplines. Furthermore, tax incentive schemes could encourage private-sector employers to establish apprenticeship programmes for school leavers, providing practical experience that academic qualifications alone cannot offer. Germany\'s highly regarded dual education system demonstrates that when industry and education work collaboratively, youth unemployment can be reduced to exceptionally low levels.',
      },
      {
        order: 4,
        partType: 'CONCLUSION',
        title: 'Write the Conclusion',
        instruction:
          'Summarise the main cause(s) and proposed solution(s) concisely. Close with a forward-looking statement about what will happen if the solutions are implemented.\n\nTarget: 35–50 words.',
        evaluationCriteria:
          'Check: (1) Main cause summarised? (2) Key solution referenced? (3) Forward-looking close? (4) No new ideas? (5) 35-50 words?',
        starter: 'In conclusion, although',
        grammarTip:
          '🎯 For a forward-looking close, use conditional structures:\n"If [solution] is adopted, [positive outcome] will become achievable."\n"Only by [action] can societies hope to [goal]."',
        modelAnswer:
          'In conclusion, although youth unemployment is driven primarily by a systemic curriculum-skills mismatch, targeted educational reform and public-private apprenticeship partnerships offer a credible path forward. If sustained investment in these measures is prioritised, the next generation can enter the workforce meaningfully prepared.',
      },
    ],
  },

  // ═══ TASK 1: BAR CHART ═══════════════════════════════════════════════════
  {
    taskType: 'TASK1',
    category: 'BAR_CHART',
    title: 'Bar Chart Description',
    description:
      'Master the 4-paragraph approach to bar charts: introduction, overview of main trends, two detail paragraphs with data.',
    order: 4,
    steps: [
      {
        order: 1,
        partType: 'INTRO',
        title: 'Write the Introduction',
        instruction:
          'Paraphrase what the chart shows in 1–2 sentences. Cover: WHAT (variable), WHO (groups), WHEN (time/year), WHERE (country/context).\n\n⚠️ Do NOT use "The chart below shows" — paraphrase!\n⚠️ Do NOT include any data or numbers yet.\n\nTarget: 25–40 words.',
        evaluationCriteria:
          'Check: (1) Paraphrased (not "The chart below shows")? (2) Covers variable, groups, time period? (3) No data/numbers mentioned? (4) 25-40 words?',
        starter: 'The bar chart illustrates',
        vocabBank: [
          { word: 'depicts', definition: 'shows or represents in a chart', example: 'The bar chart depicts the proportion of...' },
          { word: 'illustrates', definition: 'shows or makes clear with a visual', example: 'The diagram illustrates changes in...' },
          { word: 'proportion', definition: 'a part or share of a whole', example: 'The proportion of people who...' },
          { word: 'comparative', definition: 'involving a comparison', example: 'A comparative analysis of five countries...' },
          { word: 'respectively', definition: 'in the order mentioned', example: 'In 2000 and 2020 respectively...' },
        ],
        grammarTip:
          '🎯 Useful intro verbs for paraphrasing:\n"The bar chart illustrates / compares / depicts / presents data on..."\n\nAvoid the word "shows" — it is overused and basic. Use specific verbs that describe the chart type.\n\n❌ "The chart below shows the percentage of..."\n✓ "The bar chart compares the internet usage rates of..."',
        modelAnswer:
          'The bar chart compares the daily internet usage rates of six different age groups in the United Kingdom, contrasting figures recorded in 2010 with those from two decades later in 2020.',
      },
      {
        order: 2,
        partType: 'BODY_1',
        title: 'Overview — Main Trends',
        instruction:
          'Write 2–3 sentences identifying the MOST IMPORTANT overall patterns. This is the most important paragraph for Task Achievement.\n\nRules:\n• NO specific numbers or percentages here\n• Start with "Overall" or "In general"\n• Focus on the BIGGEST changes, HIGHEST bars, MAIN story\n\nTarget: 35–55 words.',
        evaluationCriteria:
          'Check: (1) Starts with "Overall" or "In general"? (2) 2-3 main trends identified? (3) NO specific numbers included? (4) Covers most significant patterns? (5) 35-55 words?',
        starter: 'Overall, it is evident that',
        vocabBank: [
          { word: 'predominant', definition: 'present as the strongest or main element', example: 'The predominant trend across all groups was an increase.' },
          { word: 'consistently', definition: 'in the same way at all times', example: 'Younger age groups consistently recorded higher usage.' },
          { word: 'markedly', definition: 'in a noticeably strong way', example: 'The figures rose markedly between 2010 and 2020.' },
          { word: 'disparity', definition: 'a great difference', example: 'A clear disparity exists between younger and older users.' },
          { word: 'converge', definition: 'to come together toward a common point', example: 'By 2020, the rates had begun to converge.' },
        ],
        grammarTip:
          '🎯 Overview sentence patterns:\n"Overall, [broad trend 1], while [broad trend 2]."\n"In general, [most notable feature], with [the most extreme category] recording the [highest/lowest] figures."\n\nBand 7 trick: Identify an exception or unexpected trend: "Notably, [category X] was the only group to see a decline."',
        modelAnswer:
          'Overall, it is evident that internet usage increased across all age groups between 2010 and 2020, with the most substantial growth occurring among older demographics. Notably, while younger cohorts already reported high usage in 2010, the gap between age groups had narrowed considerably by 2020.',
      },
      {
        order: 3,
        partType: 'BODY_2',
        title: 'Detail Paragraph 1',
        instruction:
          'Describe the categories with the HIGHEST values or most notable trends. Include specific data.\n\nUse language of comparison:\n• "X was approximately twice as high as Y"\n• "At 78%, X significantly exceeded Y at only 34%"\n• "X recorded the highest figure, at..."\n\nTarget: 55–75 words.',
        evaluationCriteria:
          'Check: (1) Specific numbers/percentages cited? (2) Comparative language? (3) Focused on most significant categories? (4) Accurate reporting of data? (5) 55-75 words?',
        starter: 'Looking more closely at the data,',
        vocabBank: [
          { word: 'approximately', definition: 'close to a particular number (not exact)', example: 'Usage stood at approximately 65% in 2020.' },
          { word: 'substantially', definition: 'by a large amount', example: 'This figure rose substantially, from 40% to 78%.' },
          { word: 'surpassed', definition: 'exceeded; went beyond', example: 'By 2020, the 65+ group had surpassed 60%.' },
          { word: 'peaked', definition: 'reached the highest point', example: 'Usage peaked at 99% among 16–24 year olds.' },
          { word: 'marginally', definition: 'by a very small amount', example: 'The figure increased marginally, from 88% to 92%.' },
        ],
        grammarTip:
          '🎯 Avoid giving one statistic per sentence — GROUP related data:\n\n✗ "The 16-24 age group used the internet at 90%. The 25-34 age group used it at 85%."\n\n✓ "Among younger adults, usage was already high in 2010, with the 16–24 and 25–34 groups recording 90% and 85% respectively."',
        modelAnswer:
          'Looking more closely at the data, younger cohorts dominated internet usage in both years. The 16–24 age group recorded the highest figures, at approximately 90% in 2010, rising marginally to 99% by 2020. The 25–34 and 35–44 groups followed a similar trajectory, with both rising from around 80–85% to exceed 95%, suggesting that near-universal usage had been achieved among working-age adults by 2020.',
      },
      {
        order: 4,
        partType: 'CONCLUSION',
        title: 'Detail Paragraph 2',
        instruction:
          'Describe the remaining categories — particularly those with lower values or more dramatic changes. Include specific data and comparisons.\n\nNote: Task 1 does NOT have a conclusion. This is your second detail paragraph — do not write "In conclusion".\n\nTarget: 55–75 words.',
        evaluationCriteria:
          'Check: (1) Remaining/lower categories described? (2) Specific data cited? (3) Contrast highlighted? (4) No "In conclusion" used? (5) 55-75 words?',
        starter: 'In contrast,',
        grammarTip:
          '🎯 For Task 1, use these structures to highlight dramatic change:\n"The most striking change was seen in [category], which rose from X% to Y% — an increase of Z percentage points."\n"Despite starting from a much lower base, [category] demonstrated the sharpest growth of all groups."',
        modelAnswer:
          'In contrast, older demographics recorded considerably lower figures in 2010 but demonstrated the most dramatic increases over the period. The 55–64 group rose from roughly 45% to 80%, while the most striking change occurred among those aged 65 and over, whose usage more than tripled — from just 20% to approximately 65%. Despite this impressive growth, the 65+ cohort nonetheless retained the lowest usage rate of all six groups in 2020.',
      },
    ],
  },
]
