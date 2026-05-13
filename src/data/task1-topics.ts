export interface TopicSeed {
  taskType: string
  category: string
  title: string
  prompt: string
  imageDescription?: string
}

export const task1Topics: TopicSeed[] = [
  // BAR CHARTS
  {
    taskType: 'TASK1',
    category: 'BAR_CHART',
    title: 'Internet Usage by Age Group (UK, 2010–2020)',
    prompt:
      'The bar chart below shows the percentage of people in different age groups who used the internet daily in the UK in 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'A grouped bar chart showing daily internet usage percentages for age groups 16–24, 25–34, 35–44, 45–54, 55–64, and 65+, comparing 2010 vs 2020. Usage increased across all groups; the largest absolute gains were in the 65+ group (from 20% to 60%), while the 16–24 group was already high at 90% in 2010 and reached 99% in 2020.',
  },
  {
    taskType: 'TASK1',
    category: 'BAR_CHART',
    title: 'CO2 Emissions by Country (1990–2010)',
    prompt:
      'The bar chart below shows CO2 emissions (in millions of tonnes) for five countries in 1990, 2000, and 2010. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'A grouped bar chart comparing CO2 emissions for the USA, China, Germany, India, and Brazil across three years. China shows dramatic increase from 2.5 billion tonnes in 1990 to 9 billion tonnes in 2010. The USA remains the highest in 1990 (5 billion) but is surpassed by China by 2010. Germany and Brazil stay relatively stable. India shows moderate growth.',
  },
  {
    taskType: 'TASK1',
    category: 'BAR_CHART',
    title: 'Hours Spent on Leisure Activities (Men vs Women)',
    prompt:
      'The bar chart below shows the average number of hours per week that men and women in four countries spend on leisure activities. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'A grouped bar chart for Australia, Canada, UK, and USA. In all four countries men spend more hours on leisure than women. The gap is largest in Australia (men: 42h, women: 35h) and smallest in Canada. Americans of both genders spend the most leisure time overall.',
  },
  {
    taskType: 'TASK1',
    category: 'BAR_CHART',
    title: 'Types of Energy Production (Six Countries)',
    prompt:
      'The bar chart below shows the percentage of energy produced from different sources (coal, oil, gas, nuclear, renewable) in six countries in 2015. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Stacked bar chart showing energy mix for France, Germany, UK, Sweden, China, and USA. France relies heavily on nuclear (75%). Sweden leads in renewable energy (40%). China and Germany are coal-heavy. The UK has a balanced mix. USA depends mostly on oil and gas.',
  },
  {
    taskType: 'TASK1',
    category: 'BAR_CHART',
    title: 'Student Enrolment in Higher Education by Field',
    prompt:
      'The bar chart below shows the percentage of male and female students enrolled in different fields of study at a UK university in 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'A grouped bar chart for fields: Engineering, Medicine, Arts, Business, Science, Education. Engineering is 75% male. Education and Arts are over 70% female. Medicine is close to equal. Business slightly favours males. Science shows slight male majority.',
  },
  {
    taskType: 'TASK1',
    category: 'BAR_CHART',
    title: 'Average Monthly Rainfall in Three Cities',
    prompt:
      'The bar chart below compares average monthly rainfall (in mm) in London, Singapore, and Sydney across all 12 months of the year. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'A monthly bar chart. Singapore has consistently high rainfall (200–300mm) year-round, peaking in December. Sydney peaks in June–August. London has relatively low, consistent rainfall (40–80mm) throughout the year with a slight autumn peak.',
  },

  // LINE GRAPHS
  {
    taskType: 'TASK1',
    category: 'LINE_GRAPH',
    title: 'Global Average Temperature Rise (1880–2020)',
    prompt:
      'The line graph below shows how global average temperatures have changed relative to the 1951–1980 average between 1880 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'A line graph showing temperature anomaly in °C from 1880 to 2020. The trend is broadly upward. Temperatures fluctuate around -0.2°C to 0°C from 1880 to 1940, then rise steadily from the 1970s, reaching +1.0°C by 2020. A notable dip occurs around 1910 and a spike around 1940.',
  },
  {
    taskType: 'TASK1',
    category: 'LINE_GRAPH',
    title: 'Smartphone Ownership in Five Countries (2010–2020)',
    prompt:
      'The line graph below shows the percentage of people who owned a smartphone in five countries between 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Five lines: USA, South Korea, Germany, Brazil, Nigeria. South Korea starts highest in 2010 (~45%) and reaches ~95% by 2020. USA follows similar trajectory. Germany and Brazil cross 50% around 2016. Nigeria starts very low (~5% in 2010) but grows rapidly to 35% by 2020.',
  },
  {
    taskType: 'TASK1',
    category: 'LINE_GRAPH',
    title: 'Number of Tourists Visiting a National Park (2005–2020)',
    prompt:
      'The line graph below shows the number of visitors (in thousands) to three national parks in Australia between 2005 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Three lines: Uluru, Great Barrier Reef, Blue Mountains. Uluru declines from 500k to 350k over the period. Great Barrier Reef grows steadily from 300k to 700k. Blue Mountains remains stable around 250k with a slight dip in 2011 (natural disaster year) before recovering.',
  },
  {
    taskType: 'TASK1',
    category: 'LINE_GRAPH',
    title: 'UK Unemployment Rate by Gender (1980–2010)',
    prompt:
      'The line graph below shows the unemployment rate for men and women in the UK between 1980 and 2010. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Two lines. Male unemployment peaks at 14% in 1984 and 12% in 1993. Female unemployment is consistently lower (4–8%), except in 1984 when it reaches 9%. By 2010 both lines converge around 8%. There are clear peaks during recessions.',
  },
  {
    taskType: 'TASK1',
    category: 'LINE_GRAPH',
    title: 'Sales of Organic Food in Five European Countries (2000–2012)',
    prompt:
      'The line graph below shows the percentage change in sales of organic food in five European countries between 2000 and 2012. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Five lines: UK, Denmark, Germany, France, Sweden. Denmark and Sweden show steady 40–60% growth. UK grows sharply to 2007 (80% increase) then falls back by 2012. Germany and France grow modestly. A general dip occurs in 2008–2009 due to economic recession for most countries.',
  },

  // PIE CHARTS
  {
    taskType: 'TASK1',
    category: 'PIE_CHART',
    title: 'Energy Sources in the UK (1970 vs 2020)',
    prompt:
      'The two pie charts below show the sources of energy in the United Kingdom in 1970 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      '1970 pie: Coal 52%, Oil 32%, Natural Gas 10%, Nuclear 5%, Other 1%. 2020 pie: Natural Gas 38%, Renewable 25%, Nuclear 20%, Oil 10%, Coal 7%. Dramatic shift away from coal towards renewables and gas over 50 years.',
  },
  {
    taskType: 'TASK1',
    category: 'PIE_CHART',
    title: 'Household Water Usage in Australia',
    prompt:
      'The pie chart below shows how water is used in average Australian households. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Pie chart with segments: Garden/outdoor 35%, Toilet flushing 18%, Laundry 16%, Shower/bath 15%, Kitchen/drinking 10%, Other 6%. Garden is by far the largest category, reflecting Australia\'s dry climate and large suburban gardens.',
  },
  {
    taskType: 'TASK1',
    category: 'PIE_CHART',
    title: 'Global Plastic Waste by Sector',
    prompt:
      'The pie charts below show the proportion of plastic waste generated by different sectors globally in 2000 and 2019. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      '2000: Packaging 38%, Consumer goods 21%, Transportation 12%, Textiles 10%, Other 19%. 2019: Packaging 46%, Consumer goods 19%, Textiles 14%, Transportation 8%, Other 13%. Packaging has increased its share significantly; transportation\'s share declined.',
  },
  {
    taskType: 'TASK1',
    category: 'PIE_CHART',
    title: 'Reasons for Migration to Australia',
    prompt:
      'The pie chart below shows the main reasons why people migrated to Australia in 2019. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Family reunification 43%, Work 28%, Study 16%, Humanitarian/refugee 8%, Other 5%. Family reasons dominate by a wide margin. Work and study together account for 44%. Humanitarian migration is a notable but small category.',
  },
  {
    taskType: 'TASK1',
    category: 'PIE_CHART',
    title: 'How University Students Spend Their Time (Study vs Leisure)',
    prompt:
      'The pie charts below show how university students in two different countries spend their time during term time. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Country A (Japan): Study 45%, Part-time work 25%, Social/leisure 15%, Sports 8%, Other 7%. Country B (USA): Study 30%, Part-time work 20%, Social/leisure 28%, Sports 15%, Other 7%. US students spend notably more time on leisure and sports; Japanese students prioritise study.',
  },

  // TABLES
  {
    taskType: 'TASK1',
    category: 'TABLE',
    title: 'Population Statistics for Selected Countries (2020)',
    prompt:
      'The table below shows population data for five countries in 2020, including total population, urban population percentage, birth rate, and life expectancy. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Table columns: Country | Population (millions) | Urban % | Birth rate per 1000 | Life expectancy. Rows: Japan (126m, 92%, 7.3, 84), USA (328m, 83%, 11.4, 79), Nigeria (200m, 52%, 37.3, 54), Brazil (213m, 88%, 14.6, 76), India (1380m, 35%, 17.4, 70). Stark contrasts between developed and developing nations.',
  },
  {
    taskType: 'TASK1',
    category: 'TABLE',
    title: 'Average Salary by Profession in Three Cities',
    prompt:
      'The table below shows the average annual salary (in USD) for five professions in three cities: New York, London, and Tokyo, in 2022. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Table: Professions (Teacher, Nurse, Engineer, Lawyer, Retail worker) vs Cities. New York consistently has highest salaries (Teacher: $72k, Engineer: $110k). Tokyo is moderate. London is between NY and Tokyo. Retail workers earn least everywhere ($25–35k). Lawyers earn most everywhere ($120–160k).',
  },
  {
    taskType: 'TASK1',
    category: 'TABLE',
    title: 'Participation in Cultural Activities by Age Group',
    prompt:
      'The table below shows the percentage of people in different age groups in the UK who participated in various cultural activities (cinema, theatre, museums, concerts) in 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Age groups: 16–24, 25–34, 35–54, 55+. Cinema attendance highest among 16–34 (85%). Theatre increases with age (55+: 42%). Museums are popular across all groups. Concert attendance peaks at 35–54 (55%). People 55+ attend theatre and museums more; younger people prefer cinema.',
  },
  {
    taskType: 'TASK1',
    category: 'TABLE',
    title: 'University Rankings and Enrolment Data',
    prompt:
      'The table below gives information about five top universities, including their world ranking, number of students, student-to-faculty ratio, and tuition fees. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Table: MIT (rank 1, 11k students, 3:1 ratio, $57k fees), Harvard (rank 2, 23k, 7:1, $54k), Oxford (rank 3, 25k, 11:1, £9k), Tokyo (rank 8, 28k, 15:1, $5k), NUS Singapore (rank 12, 40k, 18:1, $14k). Strong correlation between ranking and low student-to-faculty ratio for top schools.',
  },

  // MAPS
  {
    taskType: 'TASK1',
    category: 'MAP',
    title: 'Development Plans for a Coastal Town',
    prompt:
      'The maps below show a small coastal town in 2000 and a proposed plan for the town in 2030. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      '2000 map: Small fishing harbour, a few residential streets, one hotel, farmland to the north, beach to the east. 2030 proposed plan: Harbour expanded into a marina, new tourist hotels along beachfront, residential area doubled, farmland converted to shopping centre and car parks, new bypass road added to the west.',
  },
  {
    taskType: 'TASK1',
    category: 'MAP',
    title: 'Town Centre Changes (1990 vs Present)',
    prompt:
      'The two maps below show the changes to a town centre in 1990 and in the present day. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      '1990: Traditional high street with small shops, a cinema, library, post office, and open market. Present day: Cinema replaced by supermarket, open market replaced by multi-storey car park, small shops consolidated into fewer larger stores, library relocated to outskirts, new pedestrian zone in town centre.',
  },
  {
    taskType: 'TASK1',
    category: 'MAP',
    title: 'Island Before and After Tourism Development',
    prompt:
      'The two maps below show the changes to a small island before and after being developed for tourism. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Before: Untouched tropical island, dense forest covering most of the interior, a small fishing village on the west coast, beach on south side, rocky cliffs on north. After: Airport built on cleared interior, beach resort with hotel complex on south, fishing village remains but enlarged, ferry port added on east, road network throughout.',
  },
  {
    taskType: 'TASK1',
    category: 'MAP',
    title: 'Plans for a New Sports Complex',
    prompt:
      'The map below shows the plan for a new sports complex to be built in the centre of a large city. Summarise the information by selecting and reporting the main features. Write at least 150 words.',
    imageDescription:
      'Plan shows a site bounded by four roads. Central feature is a 50,000-seat stadium. To the north: aquatic centre and training facilities. East: multi-storey car park and bus terminus. West: outdoor athletics track and park. South: retail and dining area, public plaza. Underground station connection at south entrance.',
  },

  // PROCESSES
  {
    taskType: 'TASK1',
    category: 'PROCESS',
    title: 'How Paper is Recycled',
    prompt:
      'The diagram below shows the process by which used paper is recycled to make new paper products. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Process flowchart: (1) Used paper collected from homes/offices → (2) Transported to recycling facility → (3) Sorted by grade/type → (4) Shredded and mixed with water to create pulp → (5) Pulp cleaned to remove ink (de-inking) → (6) Bleached if needed → (7) Pulp spread on mesh conveyor belt and dried → (8) Pressed and rolled into new paper sheets → (9) Cut and packaged → (10) Distributed to market.',
  },
  {
    taskType: 'TASK1',
    category: 'PROCESS',
    title: 'Life Cycle of a Salmon',
    prompt:
      'The diagram below shows the life cycle of the Pacific salmon. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Circular lifecycle diagram: (1) Eggs laid in gravel riverbed in autumn → (2) Alevin (larvae with yolk sac) hatch in winter → (3) Fry emerge from gravel and begin feeding (spring) → (4) Parr stage: young fish in freshwater for 1–3 years → (5) Smolt: fish migrate to ocean → (6) Adult salmon spend 1–5 years in ocean, growing → (7) Adults return to birthplace river to spawn → (8) After spawning most adults die, providing nutrients for the ecosystem → cycle restarts.',
  },
  {
    taskType: 'TASK1',
    category: 'PROCESS',
    title: 'How Electricity is Generated by a Hydroelectric Dam',
    prompt:
      'The diagram below shows how electricity is generated from water by a hydroelectric dam. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Diagram showing: Reservoir behind the dam → Water flows through intake gates → Down through large pipes (penstocks) → Water pressure spins turbines → Turbines connected to generators that produce electricity → Electricity transmitted via power lines to cities → Water exits through outflow at base of dam into river below. Control room monitors and regulates flow.',
  },
  {
    taskType: 'TASK1',
    category: 'PROCESS',
    title: 'The Production of Chocolate',
    prompt:
      'The diagram below shows the stages in the production of chocolate, from harvesting cacao pods to the finished product. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Process: (1) Cacao pods harvested from trees (tropical regions) → (2) Pods cut open, beans + pulp removed → (3) Fermentation (5–7 days in boxes) → (4) Sun-dried → (5) Shipped to chocolate factory → (6) Roasted (130–160°C) → (7) Cracked and winnowed to remove husks → (8) Ground into cocoa mass/liquor → (9) Mixed with sugar, milk, cocoa butter → (10) Conched (stirred for hours) → (11) Tempered → (12) Moulded and cooled → (13) Packaged.',
  },

  // MIXED CHARTS
  {
    taskType: 'TASK1',
    category: 'MIXED_CHART',
    title: 'Car Production and Sales in Germany (Bar + Line)',
    prompt:
      'The charts below show the number of cars produced in Germany each year and the percentage that were exported, between 2005 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Bar chart: annual car production in Germany (millions). Line chart: percentage exported. Production stays roughly 5–6 million per year with a dip in 2009 (financial crisis, 3.8m). Export percentage rises from 72% in 2005 to 80% by 2015, then stabilises. 2009 shows lowest both production and exports.',
  },
  {
    taskType: 'TASK1',
    category: 'MIXED_CHART',
    title: 'Coffee Consumption and Price (Table + Line Graph)',
    prompt:
      'The table and line graph below give information about global coffee consumption and average export prices between 2000 and 2018. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    imageDescription:
      'Table: Consumption by region (Europe, N. America, Asia, Others) at 5-year intervals. Line graph: average export price per kg. Consumption grows steadily; Asia triples from 2000 to 2018. Price volatile: low ~$1/kg in 2002, peaks at $4.5 in 2011, falls to $2.3 by 2018. Asia\'s consumption growth does not closely track price changes.',
  },
]
