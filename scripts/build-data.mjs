import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const externalSourcePath = '/opt/data/cache/documents/doc_3732b17502f7_word.json';
const generatedVocabularyPath = path.join(root, 'src', 'generated', 'vocabulary.json');
const outDir = path.join(root, 'src', 'generated');

const POS_MAP = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  prep: 'preposition',
  pron: 'pronoun',
  conj: 'conjunction',
  int: 'interjection',
  num: 'numeral',
  art: 'article',
};

const THEME_RULES = {
  'environment-climate': ['climate', 'weather', 'pollution', 'greenhouse', 'hurricane', 'monsoon', 'storm', 'atmosphere', 'eco', 'environment', 'disaster', 'catastrophic', 'calamity', 'gust', 'breeze'],
  'geography-earth': ['earth', 'ocean', 'sea', 'river', 'mountain', 'mineral', 'granite', 'quartz', 'crust', 'mantle', 'core', 'latitude', 'longitude', 'altitude', 'horizon', 'hydrosphere', 'lithosphere'],
  'education-learning': ['school', 'student', 'university', 'college', 'education', 'learn', 'study', 'exam', 'campus', 'curriculum', 'academic', 'language', 'book', 'lecture', 'scholar'],
  'science-technology': ['science', 'technology', 'computer', 'digital', 'electric', 'magnet', 'oxide', 'oxygen', 'hydrogen', 'carbon', 'laboratory', 'physics', 'chemistry', 'innovation', 'artificial', 'intelligence', 'particle'],
  'health-biology': ['health', 'disease', 'medical', 'doctor', 'hospital', 'heart', 'brain', 'body', 'biology', 'nutrition', 'virus', 'care', 'nutrient', 'uptake'],
  'society-government': ['social', 'society', 'government', 'law', 'crime', 'policy', 'public', 'military', 'war', 'state', 'vote', 'citizen'],
  'economy-business': ['economy', 'economic', 'market', 'trade', 'industry', 'company', 'business', 'finance', 'bank', 'profit', 'budget', 'dividend', 'stock', 'marketing'],
  'culture-media': ['music', 'art', 'film', 'media', 'literature', 'religion', 'bible', 'pope', 'science fiction', 'hip-hop', 'olympic'],
  'food-agriculture': ['food', 'agriculture', 'farm', 'crop', 'plough', 'cheese', 'ice cream', 'fruit', 'grain', 'harvest'],
  'daily-life': ['family', 'house', 'room', 'kitchen', 'living room', 'dining hall', 'travel', 'friend', 'well-being', 'make-up'],
};

const modeMeta = {
  fast: {
    label: 'Fast Vocabulary',
    description: 'High-density passages for rapid word exposure and frequent pop-up translation.',
    targetRange: '30-60 target words',
    densityHint: '7%-16% density',
  },
  core: {
    label: 'Balanced Practice',
    description: 'Mid-density articles balancing reading flow and vocabulary retention.',
    targetRange: '18-35 target words',
    densityHint: '3.5%-8% density',
  },
  read: {
    label: 'Reading Habit',
    description: 'Lower-density passages focused on sustained reading and natural context.',
    targetRange: '8-18 target words',
    densityHint: '1.2%-3.5% density',
  },
};

const themeMeta = {
  'environment-climate': { label: 'Environment', description: 'Climate systems, natural disasters, and sustainability.' },
  'geography-earth': { label: 'Earth Science', description: 'Planetary structure, geography, and field observation.' },
  'education-learning': { label: 'Education', description: 'Academic thinking, campus life, and structured learning.' },
  'science-technology': { label: 'Science & Tech', description: 'Scientific discovery, chemistry, and modern innovation.' },
  'health-biology': { label: 'Health', description: 'Public health, nutrition, and modern medical systems.' },
  'geography-earth': { label: 'Earth Science', description: 'Planetary structure, geography, and field observation.' },
  'society-government': { label: 'Society', description: 'Citizenship, law, public policy, and social responsibility.' },
  'economy-business': { label: 'Economy', description: 'Markets, trade, industry, and business decisions.' },
  'culture-media': { label: 'Culture', description: 'Literature, media, art, and shared imagination.' },
  'food-agriculture': { label: 'Food & Farming', description: 'Agriculture, harvest cycles, and food systems.' },
};

const articleBlueprints = [
  {
    id: 'env-fast-01',
    mode: 'fast',
    theme: 'environment-climate',
    subtheme: 'climate risks and adaptation',
    style: 'ielts-reading',
    readingGoal: 'Rapidly acquire core environment vocabulary through a dense, high-support passage.',
    title: 'Fast Track: Climate Risk and Adaptation',
    targetWordIds: [
      'atmosphere__noun', 'greenhouse__noun', 'hurricane__noun', 'monsoon__noun', 'calamity__noun', 'catastrophic__adjective', 'disaster__noun', 'breeze__noun', 'gust__noun', 'el-nino__noun',
      'climate__noun', 'weather__noun', 'storm__noun', 'rainfall__noun', 'temperature__noun', 'coastal__adjective', 'population__noun', 'flood__noun', 'drought__noun', 'emergency__noun',
      'forecast__noun', 'adaptation__noun', 'agriculture__noun', 'harvest__noun', 'pollution__noun', 'energy__noun', 'sustainable__adjective', 'ecosystem__noun', 'carbon-dioxide__noun', 'public__adjective',
      'transport__noun', 'electricity__noun', 'community__noun', 'infrastructure__noun', 'damage__noun', 'recovery__noun'
    ],
    content: `Climate change is often introduced through a small set of familiar words, yet effective reading on the topic requires much broader vocabulary. A student must move quickly from simple ideas such as weather and temperature to more precise expressions including atmosphere, greenhouse gases, pollution, infrastructure, and adaptation. This fast-track passage is therefore intentionally dense. It gives repeated contact with the terms that appear again and again in academic discussions of climate risk, public policy, and community recovery.\n\nThe atmosphere regulates heat, moisture, and wind, but the balance of this system is being affected by rising carbon dioxide and other greenhouse gases. Scientists monitor temperature, rainfall, and storm patterns to understand whether a region is becoming more exposed to flood, drought, or other forms of disaster. In coastal areas, one hurricane can damage transport networks, electricity systems, and housing within a few hours. The immediate calamity is obvious, but the long-term recovery may depend on agriculture, public investment, and the ability of a community to rebuild infrastructure before the next emergency arrives.\n\nIn parts of Asia, the monsoon supports farming because steady rainfall helps agriculture and harvest cycles. However, if the seasonal pattern becomes unstable, the same climate system can create catastrophic pressure on food supply and local transport. Farmers who once relied on a breeze or moderate gust as ordinary signs of seasonal change may now interpret stronger storm activity as a warning. City planners also face difficult choices. They must decide whether new roads, drainage systems, and coastal barriers are sufficient when population growth places more people in vulnerable districts.\n\nAdaptation is therefore not a single action but a chain of responses. Schools teach climate awareness, engineers redesign infrastructure, and governments prepare emergency communication systems. Energy policy matters as well, because sustainable electricity production can reduce pollution while supporting economic stability. Even small community projects, such as protecting wetland ecosystem areas or improving local flood maps, contribute to wider recovery capacity. For learners, the lesson is clear: environment vocabulary is not decorative. It is the language through which risk, policy, and human survival are explained.`,
  },
  {
    id: 'health-fast-01',
    mode: 'fast',
    theme: 'health-biology',
    subtheme: 'nutrition, disease and prevention',
    style: 'ielts-reading',
    readingGoal: 'Build a dense first-pass vocabulary set for health, nutrition, and public care.',
    title: 'Fast Track: Nutrition, Disease, and Prevention',
    targetWordIds: [
      'health-care__noun', 'nutrient__noun', 'endanger__verb', 'uptake__noun', 'intensive__adjective', 'heart-attack__noun', 'disease__noun', 'medical__adjective', 'physical__adjective', 'biology__noun',
      'diet__noun', 'obesity__noun', 'diabetes__noun', 'virus__noun', 'hospital__noun', 'doctor__noun', 'patient__noun', 'stress__noun', 'exercise__noun', 'immunity__noun',
      'cell__noun', 'tissue__noun', 'fat__noun', 'sugar__noun', 'blood-pressure__noun', 'treatment__noun', 'prevention__noun', 'sanitation__noun', 'vaccination__noun', 'clinical__adjective',
      'lifestyle__noun', 'infection__noun', 'chronic__adjective', 'population__noun'
    ],
    content: `For many IELTS learners, health vocabulary appears manageable at first because words such as doctor, hospital, disease, and treatment are familiar. In serious reading, however, those items quickly expand into a larger system that includes biology, immunity, sanitation, vaccination, uptake, chronic illness, and prevention. This passage is designed for fast vocabulary learning, so it deliberately concentrates the language that students need when reading about modern health care, lifestyle risk, and population wellbeing.\n\nAt the level of biology, the body depends on every nutrient reaching the right cell and tissue in sufficient quantity. Efficient uptake allows energy production, repair, and immunity, while poor diet can endanger these processes over time. If meals contain too much sugar and fat but too little variety, the result may not be immediate infection; instead, a person may gradually move toward obesity, diabetes, or other chronic disease. In that sense, prevention begins long before a patient enters a hospital. It begins with everyday lifestyle choices about exercise, diet, and stress management.\n\nMedical research shows that physical inactivity and poor food quality can raise blood pressure and increase the risk of a heart attack. These conditions create pressure not only for individuals but also for health-care systems. Hospitals must devote intensive resources to treatment, while governments are expected to invest in prevention, education, and public sanitation. A doctor may save one patient through clinical skill, but long-term improvement for a population often depends on vaccination programmes, cleaner food environments, and better access to reliable advice.\n\nThe same principle applies during outbreaks of virus infection. Emergency treatment is necessary, yet durable progress depends on preparation. Communities with stronger sanitation, clearer health communication, and higher trust in medical guidance usually respond more effectively. For students, the value of this vocabulary cluster is practical. Once these terms become familiar, academic articles about wellbeing, policy, and disease control become far easier to understand.`,
  },
  {
    id: 'edu-core-01',
    mode: 'core',
    theme: 'education-learning',
    subtheme: 'campus habits and academic thinking',
    style: 'ielts-reading',
    readingGoal: 'Balance vocabulary learning with a natural academic passage about university study.',
    title: 'Balanced Practice: Learning How to Think on Campus',
    targetWordIds: [
      'campus__noun', 'classify__verb', 'derive__verb', 'quantum__noun', 'language__noun', 'education__noun', 'curriculum__noun', 'lecturer__noun', 'scholar__noun', 'academic__adjective',
      'seminar__noun', 'library__noun', 'argument__noun', 'evidence__noun', 'discipline__noun', 'analysis__noun', 'research__noun', 'laboratory__noun', 'organism__noun', 'concept__noun',
      'independent__adjective', 'critical__adjective', 'qualification__noun', 'discussion__noun'
    ],
    content: `University life changes students in ways that extend beyond the formal curriculum. A campus provides not only classrooms and laboratories but also a culture in which argument, evidence, and disciplined discussion shape daily habits. Through this environment, higher education becomes more than the delivery of information. It trains learners to think in an academic way, to classify ideas carefully, and to derive conclusions from reliable sources rather than impression alone.\n\nA good lecturer does not simply repeat facts. Instead, the lecturer invites students to question concepts, compare interpretations, and test whether a piece of evidence can support a wider claim. In a seminar, for example, a discussion about language policy may move from personal opinion to critical analysis of research findings. In a science course, the same habit appears when students observe an organism in the laboratory and then classify its features before drawing a conclusion. Although the subjects differ, the logic of careful inquiry remains similar.\n\nThis process encourages independent thought. A scholar must often live with uncertainty long enough to examine competing explanations. In fields such as physics, even a concept like quantum theory becomes valuable not only for what it explains but also for the discipline it demands from the mind. Students learn that serious education requires patience, structured reading, and repeated revision of weak arguments. The library becomes important not because it stores books, but because it supports long periods of focused analysis.\n\nAs a result, university study creates a durable intellectual atmosphere. The qualification at the end matters, but the deeper outcome is a set of mental routines: compare, classify, derive, test, and revise. Those routines shape performance across many professions, which is why academic training remains valuable long after specific course details are forgotten.`,
  },
  {
    id: 'sci-core-01',
    mode: 'core',
    theme: 'science-technology',
    subtheme: 'theory, experiment and innovation',
    style: 'ielts-reading',
    readingGoal: 'Use a medium-density article to connect scientific vocabulary with practical technology.',
    title: 'Balanced Practice: From Theory to Innovation',
    targetWordIds: [
      'oxygen__noun', 'oxide__noun', 'carbon-dioxide__noun', 'hydrogen__noun', 'magnet__noun', 'particle__noun', 'artificial__adjective', 'intelligence__noun', 'laboratory__noun', 'technology__noun',
      'experiment__noun', 'measurement__noun', 'engineer__noun', 'discovery__noun', 'material__noun', 'chemistry__noun', 'physics__noun', 'fuel__noun', 'reaction__noun', 'industry__noun',
      'device__noun', 'digital__adjective'
    ],
    content: `Scientific progress rarely moves in a straight line from one discovery to one useful machine. More often, knowledge develops through a long exchange between theory, experiment, and engineering. Ideas explored in physics or chemistry may appear abstract at first, yet later become essential to technology, industry, and everyday devices. This balanced passage introduces core science vocabulary without overwhelming the reader.\n\nConsider the history of oxygen and hydrogen research. Early investigators were not trying to build commercial systems. They were attempting to understand combustion, air composition, and chemical reaction. Over time, accurate measurement allowed researchers to identify oxide formation, fuel behaviour, and the role of carbon dioxide in natural and industrial processes. These findings eventually supported cleaner manufacturing, better storage systems, and more efficient energy planning.\n\nA similar pattern appears in physics. Work on the magnet, the particle, and the structure of matter once seemed remote from ordinary life. Yet those studies now support digital communication, medical imaging, and the design of advanced materials. The laboratory remains central because it provides a controlled space in which an experiment can be repeated, tested, and refined. Without that disciplined environment, a discovery cannot easily become reliable technology.\n\nToday, the connection between science and innovation is even more visible. Artificial intelligence, for example, depends on mathematical models, hardware design, and long cycles of engineering revision. What begins as theory may become a practical device only after many failures and adjustments. For learners, this vocabulary reveals how scientific ideas travel from the page to the world.`,
  },
  {
    id: 'env-read-01',
    mode: 'read',
    theme: 'environment-climate',
    subtheme: 'living with climate uncertainty',
    style: 'ielts-reading',
    readingGoal: 'Train sustained reading while encountering a modest number of environment words in context.',
    title: 'Reading Habit: Living with Climate Uncertainty',
    targetWordIds: [
      'atmosphere__noun', 'greenhouse__noun', 'hurricane__noun', 'monsoon__noun', 'disaster__noun', 'pollution__noun', 'sustainable__adjective', 'adaptation__noun', 'community__noun', 'drought__noun', 'flood__noun', 'recovery__noun'
    ],
    content: `Communities do not experience climate change as a single dramatic event. More often, they face a slow sequence of difficult adjustments. A river floods more often than before, a monsoon arrives at an unusual time, or a period of drought quietly reduces agricultural income over several years. The public may notice these changes in different ways, but over time they come to recognise that living with environmental uncertainty requires both practical preparation and social cooperation.\n\nScientific explanations usually begin with the atmosphere and the greenhouse effect, because those ideas help explain why temperature and rainfall patterns may shift. Yet for ordinary citizens, the meaning of climate change becomes real only when it affects housing, travel, food prices, or employment. A hurricane that damages roads and homes may be remembered as a disaster, but the longer story is the work of recovery that follows. Families need money, public services need organisation, and local leaders must decide how rebuilding can reduce future risk rather than simply restore old weaknesses.\n\nSome towns now invest in flood barriers, tree planting, and more sustainable drainage systems. Others focus on emergency communication or on training volunteers who can support older residents during extreme weather. None of these responses is perfect. Adaptation is not a final solution but a continuing process in which each community learns from previous failure. The value of long-term planning lies partly in its realism. It accepts that climate uncertainty will remain and asks how daily life can continue with less fear and greater resilience.\n\nFor readers, passages like this are useful because they resemble the structure of real academic arguments. The article introduces scientific causes, links them to human consequences, and then evaluates possible responses. The target vocabulary is limited, but each term appears within an extended explanation. That slower rhythm helps students practise reading for meaning rather than stopping at every sentence.`,
  },
  {
    id: 'edu-read-01',
    mode: 'read',
    theme: 'education-learning',
    subtheme: 'reading stamina and university culture',
    style: 'ielts-reading',
    readingGoal: 'Develop reading stamina with a more natural education passage and lighter vocabulary load.',
    title: 'Reading Habit: Why University Culture Matters',
    targetWordIds: [
      'campus__noun', 'curriculum__noun', 'lecturer__noun', 'scholar__noun', 'academic__adjective', 'seminar__noun', 'evidence__noun', 'research__noun', 'independent__adjective', 'discussion__noun'
    ],
    content: `People often judge a university by visible signs such as buildings, rankings, or famous graduates. Those features matter, but they do not fully explain what makes one institution effective for learning. A strong university culture is created through repeated habits: serious discussion, respect for evidence, and a willingness to revise weak ideas in the light of better research. Students absorb these habits gradually, often without noticing the change.\n\nOn a campus, education happens in many places at once. A lecturer may introduce a difficult question in a formal class, but the real development of understanding can continue in a seminar, in the library, or in conversation after the lesson ends. When students are expected to support claims with evidence, they begin to realise that opinion alone is not enough. They must read carefully, compare sources, and ask whether a conclusion follows from the material available.\n\nThis environment also encourages independent judgement. A scholar is rarely praised for repeating familiar ideas without examination. Instead, academic work rewards patience, precise language, and honest uncertainty. Even when the curriculum is demanding, students often benefit from a culture that treats difficulty as a normal part of thought rather than a sign of failure. In that setting, discussion becomes a tool for refinement rather than performance.\n\nFor learners who are training reading stamina, a passage like this offers a useful balance. The vocabulary is purposeful but not overloaded, and the main challenge comes from following the argument across several paragraphs. That experience is valuable because good reading is not only about knowing more words. It is also about staying with an idea long enough to understand how each paragraph contributes to the whole.`,
  },


  {
    id: 'geo-fast-01',
    mode: 'fast',
    theme: 'geography-earth',
    subtheme: 'earth structure and field geography',
    style: 'ielts-reading',
    readingGoal: 'Rapidly build high-frequency earth-science vocabulary through a dense IELTS-style overview.',
    title: 'Fast Track: Reading the Shape of the Earth',
    targetWordIds: [
      'hydrosphere__noun', 'lithosphere__noun', 'core__noun', 'crust__noun', 'mantle__noun', 'longitude__noun', 'latitude__noun', 'horizon__noun', 'altitude__noun', 'mineral__noun',
      'quartz__noun', 'granite__noun', 'earthquake__noun', 'axis__noun', 'ocean__noun', 'tide__noun', 'mountain__noun', 'reclaim__verb', 'circulation__noun', 'exceed__verb',
      'seasonal__adjective', 'fauna__noun', 'seal__noun', 'enhance__verb', 'research__noun', 'score__noun', 'overseas__adjective', 'withstand__verb', 'disease__noun', 'plague__noun'
    ],
    content: `Earth science begins with the ability to connect visible landscapes with hidden systems. A mountain, an ocean, or a distant horizon may look simple, yet each feature is shaped by forces that operate through the crust, the mantle, and the deeper core of the planet. This fast-track passage concentrates the vocabulary that IELTS learners often meet when reading about geography, geology, and field observation.\n\nThe lithosphere includes the hard outer layer of the Earth, where granite, quartz, and other mineral materials form rocks that can be studied in the field. Beneath it, the mantle moves slowly over long periods of time, while the core remains central to explanations of heat and magnetism. When stress in the crust is released suddenly, an earthquake may occur, reminding observers that even solid ground is part of a dynamic system.\n\nGeographers use latitude and longitude to describe position, while altitude helps explain why temperature and vegetation change on a mountain. The axis of the Earth influences seasonal patterns, which affect rainfall, ocean circulation, and the movement of fauna across regions. In coastal environments, the tide may expose rocks, carry sediment, or reveal how the hydrosphere interacts with the land. A seal resting on a shore can even become evidence in research on marine habitat.\n\nField research often requires patience because natural processes may exceed the scale of ordinary human experience. A cliff can withstand waves for many years before one storm changes its shape. Overseas teams may return to score erosion, reclaim old data, and enhance maps with fresh measurements. Sometimes a disease or plague among animals also reveals environmental pressure. By learning this vocabulary together, students can read physical geography as a connected story rather than a list of separate facts.`,
  },
  {
    id: 'geo-core-01',
    mode: 'core',
    theme: 'geography-earth',
    subtheme: 'coasts, mountains and observation',
    style: 'ielts-reading',
    readingGoal: 'Practise a balanced earth-science passage with a moderate target-word load.',
    title: 'Balanced Practice: How Landscapes Keep Their Memory',
    targetWordIds: [
      'ocean__noun', 'tide__noun', 'mountain__noun', 'altitude__noun', 'latitude__noun', 'longitude__noun', 'mineral__noun', 'granite__noun', 'quartz__noun', 'crust__noun',
      'earthquake__noun', 'circulation__noun', 'seasonal__adjective', 'fauna__noun', 'research__noun', 'withstand__verb', 'horizon__noun', 'axis__noun'
    ],
    content: `A landscape is often described as scenery on the horizon, but for geographers it is also a record of past conditions. The shape of a mountain can reveal patterns of erosion, while the minerals inside granite or quartz may indicate how rocks formed deep within the crust. Along the coast, the ocean and the tide continually rewrite the boundary between land and water.\n\nObservation becomes more precise when researchers combine local details with wider systems. Latitude and longitude identify a place on the map, but altitude, rainfall, and seasonal temperature help explain why one hillside supports dense vegetation while another remains almost bare. Fauna respond to these differences, moving toward food, shelter, or warmer conditions when the environment changes.\n\nNatural forces also test the strength of landscapes. Some cliffs withstand waves for centuries; others collapse after heavy rain or an earthquake. These events may appear sudden, yet they are usually prepared by slow processes that have been operating for a long time. Ocean circulation, wind, gravity, and even the planet's tilted axis all contribute to the visible result.\n\nFor IELTS readers, the topic is useful because it links description with explanation. A passage may begin with a familiar scene and then ask the reader to follow evidence from field research, maps, and geological samples. The vocabulary is moderate, but each word helps build a clearer picture of how the Earth stores its history.`,
  },
  {
    id: 'geo-read-01',
    mode: 'read',
    theme: 'geography-earth',
    subtheme: 'slow reading of natural places',
    style: 'ielts-reading',
    readingGoal: 'Build reading stamina through a lower-density geography passage.',
    title: 'Reading Habit: A Coastline at Low Tide',
    targetWordIds: [
      'ocean__noun', 'tide__noun', 'horizon__noun', 'granite__noun', 'quartz__noun', 'fauna__noun', 'seasonal__adjective', 'research__noun', 'withstand__verb'
    ],
    content: `At low tide, a coastline becomes a page that can be read slowly. Pools appear between stones, small animals move through patches of seaweed, and the horizon seems wider than it did a few hours earlier. To a casual visitor, the scene may be peaceful. To a researcher, it is full of evidence about how the ocean shapes land over time.\n\nSome rocks are made of granite with visible grains of quartz, and their hardness helps them withstand years of waves and wind. Other surfaces break more easily, leaving channels where water collects. Seasonal changes alter the rhythm of the coast as storms arrive, birds migrate, and different forms of fauna become easier to observe.\n\nThe value of this passage lies in its slower movement. It does not rush through many technical terms. Instead, it asks the reader to stay with one place long enough to notice relationships: water against stone, weather against habitat, and observation against explanation. A patient student can also follow the human side of the scene: the quiet path used by visitors, the small notices that protect fragile areas, and the changing light that makes the same shore feel different in the morning and evening. The passage simply rewards careful attention, and that habit is central to strong academic reading.`,
  },
  {
    id: 'soc-fast-01',
    mode: 'fast',
    theme: 'society-government',
    subtheme: 'citizens, law and public decisions',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover civic and government vocabulary in a policy-focused passage.',
    title: 'Fast Track: The Citizen, Law, and Public Trust',
    targetWordIds: [
      'republic__noun', 'socialism__noun', 'government__noun', 'statesman__noun', 'citizen__noun', 'vote__noun', 'state__verb', 'estate__noun', 'law__noun', 'crime__noun',
      'enormity__noun', 'pitfall__noun', 'warn__verb', 'oblige__verb', 'military__adjective', 'devastate__verb', 'devote__verb', 'raise__verb', 'imminent__adjective', 'status__noun',
      'adversity__noun', 'award__noun', 'reward__noun', 'mantle__noun', 'sphere__noun', 'ideology__noun', 'charter__noun', 'mediate__verb', 'participate__verb', 'partner__noun'
    ],
    content: `Modern society depends on language that describes power, duty, and public trust. A citizen may vote in a republic, criticise a government, or ask whether a law protects people fairly. In IELTS reading, these words often appear in passages about political reform, public safety, and the relationship between individuals and the state.\n\nA responsible statesman must state a policy clearly and warn the public when a risk is imminent. During adversity, the government may raise funds, devote resources to emergency services, or oblige companies to follow stricter rules. These actions can protect citizens, but they also create debate about authority, freedom, and the proper status of public institutions.\n\nThe language of law is equally important. A rise in crime may lead officials to demand stronger policing, while critics warn that hurried measures can become a pitfall if they ignore evidence. Military action is sometimes presented as necessary to defend the state, yet history shows that conflict can devastate communities long after the original decision. A charter may limit authority, and a mediator may mediate between groups that need to participate as partners.\n\nDifferent ideologies, including socialism and liberal democracy, offer different answers. One system may protect an estate through property law, while another may emphasise public reward, official award, or punishment for the enormity of abuse. A statesman wears the mantle of authority only inside a limited sphere of trust. For learners, the main task is to recognise how civic vocabulary works in argument.`,
  },
  {
    id: 'soc-core-01',
    mode: 'core',
    theme: 'society-government',
    subtheme: 'public policy and social responsibility',
    style: 'ielts-reading',
    readingGoal: 'Balance civic vocabulary with a natural argument about public responsibility.',
    title: 'Balanced Practice: The Language of Public Responsibility',
    targetWordIds: [
      'government__noun', 'citizen__noun', 'vote__noun', 'law__noun', 'crime__noun', 'republic__noun', 'warn__verb', 'oblige__verb', 'devote__verb', 'raise__verb',
      'status__noun', 'adversity__noun', 'pitfall__noun', 'state__verb', 'award__noun', 'reward__noun', 'ideology__noun', 'statesman__noun'
    ],
    content: `Public responsibility is not carried by government alone. A law may set minimum standards, but the success of those measures often depends on how each citizen responds. When people vote, follow rules, question weak decisions, reward honesty, and support an award for service, they help shape the moral status of public life.\n\nThis relationship becomes clearer in times of adversity. Officials may warn residents about danger, raise money for relief, or devote staff to areas where crime and poverty overlap. At the same time, each citizen may organise local support, share information, and oblige leaders to explain their choices more openly. A statesman in a republic must therefore treat public trust as a practical resource, not merely as an ideology.\n\nThere is a pitfall in treating public policy as a simple technical matter. A programme can look efficient on paper and still fail if it ignores trust, culture, or fairness. For this reason, strong societies need more than commands from the state. They need an active public that understands both rights and duties.\n\nIELTS passages on society often test this layered argument. The vocabulary is familiar enough to seem easy, but the writer may move carefully between evidence, criticism, and recommendation. Readers should notice how each paragraph states a problem and then connects it to a wider civic question.`,
  },
  {
    id: 'soc-read-01',
    mode: 'read',
    theme: 'society-government',
    subtheme: 'local citizenship and trust',
    style: 'ielts-reading',
    readingGoal: 'Sustain reading with a lighter civic passage about trust and participation.',
    title: 'Reading Habit: A Small Meeting in a Large Society',
    targetWordIds: [
      'citizen__noun', 'government__noun', 'vote__noun', 'law__noun', 'status__noun', 'adversity__noun', 'participate__verb', 'partner__noun', 'warn__verb'
    ],
    content: `A society is often imagined through large institutions, but public trust is also built in small rooms. A local meeting about traffic, safety, or housing may not look important, yet it gives each citizen a chance to participate in decisions that shape daily life. People listen, question, and sometimes disagree before a vote is taken.\n\nThe government may provide the legal framework, and the law may define what is possible, but the atmosphere of the meeting depends on respect. A resident with low social status may still describe a problem clearly. A partner organisation may warn officials about risks that have been ignored. During adversity, these ordinary exchanges can become especially valuable because they help people feel less alone.\n\nThis kind of passage is useful for reading stamina because the argument is quiet. It does not depend on dramatic events. Instead, it shows how civic life is made through repeated habits of attention, patience, and explanation. A learner can read it for tone as much as for information, noticing how a modest example opens into a broader point about shared responsibility and public confidence. The slow movement from room, to neighbourhood, to wider public life gives the passage a structure that is easy to follow but still worth analysing carefully.`,
  },
  {
    id: 'econ-core-01',
    mode: 'core',
    theme: 'economy-business',
    subtheme: 'business decisions and market confidence',
    style: 'ielts-reading',
    readingGoal: 'Practise medium-density business vocabulary in a readable academic argument.',
    title: 'Balanced Practice: Why Market Confidence Matters',
    targetWordIds: [
      'economics__noun', 'marketing__noun', 'dividend__noun__2', 'economy__noun', 'trade__noun', 'market__noun', 'industry__noun', 'company__noun', 'stock__noun', 'supermarket__noun',
      'livestock__noun', 'horticulture__noun', 'stream__noun', 'accompany__verb', 'raise__verb', 'labour__noun', 'agriculture__noun', 'harvest__verb'
    ],
    content: `Market confidence is difficult to measure directly, yet it strongly influences decisions made by households and businesses. In a stable economy, a company may hire labour, expand marketing, and invest in stock for future sales. When confidence falls, the same firm may delay spending even if current trade remains acceptable.\n\nEconomics therefore treats expectation as part of real behaviour. A supermarket manager does not only respond to today's customers. She also considers livestock supply, horticulture output, agriculture costs, and whether a poor harvest will raise prices. Similar calculations occur across industry, where investment decisions often accompany forecasts about demand.\n\nShareholders look at these signals as well. A business that pays a steady dividend may appear reliable, but long-term value depends on whether it can adapt to market change. A stream of strong sales in one year does not guarantee success if competitors develop better services or if trade conditions shift.\n\nThis topic suits balanced reading because the vocabulary is practical and the argument is gradual. The reader follows a chain from consumer mood to business planning and then to broader economic performance. The pace is deliberately steady, so students can connect examples before moving to the next paragraph and can see how a financial claim becomes a social argument.`,
  },
  {
    id: 'culture-read-01',
    mode: 'read',
    theme: 'culture-media',
    subtheme: 'media, literature and shared imagination',
    style: 'ielts-reading',
    readingGoal: 'Sustain reading with a natural culture-and-media passage and light vocabulary load.',
    title: 'Reading Habit: Stories in a Multimedia Age',
    targetWordIds: [
      'literature__noun', 'article__noun', 'multimedia__noun', 'science-fiction__noun', 'film__noun', 'artist__noun', 'musical__adjective', 'concert__noun', 'religion__noun', 'epic__noun', 'participate__verb'
    ],
    content: `Stories have never belonged to one medium. An epic might begin as oral performance, become literature, appear later as a film, and then return as a multimedia project that invites audiences to participate online. Each form changes the rhythm of attention, but the human need for shared imagination remains surprisingly stable.\n\nA newspaper article may analyse a new science fiction series, while a concert or musical performance can revive older religious or cultural traditions. The artist working today often moves between page, screen, and stage rather than staying inside a single category. This movement makes culture feel faster, but it also allows old materials to find new audiences.\n\nFor reading practice, the passage is useful because it follows an idea rather than a list of facts. The vocabulary is limited, and the main task is to understand how examples are connected. A reader who can follow that connection is preparing for the kind of cultural argument that often appears in academic tests. The final skill is patience: instead of stopping at a single example, the reader watches how the paragraph moves from old practices to new habits, and from private enjoyment to shared public meaning. This slower pace gives space for comparison and helps the student notice structure as well as vocabulary. It also reminds learners that culture passages are rarely about entertainment alone; they often ask how memory, identity, technology, and audience behaviour influence one another over time. When read slowly, such a text becomes a map of connections rather than a catalogue of events, and that is exactly the kind of map academic readers need to build.`,
  },
  {
    id: 'food-core-01',
    mode: 'core',
    theme: 'food-agriculture',
    subtheme: 'farming, food systems and harvest cycles',
    style: 'ielts-reading',
    readingGoal: 'Practise agriculture vocabulary through a balanced passage about food systems.',
    title: 'Balanced Practice: From Seed to City Table',
    targetWordIds: [
      'cultivate__verb', 'harvest__verb', 'plough__noun', 'seed__noun', 'ripen__verb', 'fruit__noun', 'crop__noun', 'grain__noun', 'agriculture__noun', 'food__noun',
      'livestock__noun', 'supermarket__noun', 'cheese__noun', 'ice-cream__noun', 'rear__verb', 'marine__adjective', 'brood__noun', 'microscope__noun'
    ],
    content: `Food systems begin long before a product reaches a supermarket shelf. Farmers cultivate soil, choose seed varieties, and decide when to plough a field so that each crop has the best chance to grow. Some farms focus on grain, while others rear livestock or produce fruit that must ripen before it can be harvested.\n\nModern agriculture connects these local decisions to urban life. Milk from animals may become cheese or ice cream; wheat may become bread; fresh vegetables may travel hundreds of kilometres before reaching a family kitchen. Each stage may also involve marine transport, brood management for poultry, microscope checks in safety laboratories, storage, and trust in food safety.\n\nThe harvest is therefore both a natural and an economic event. Weather can reduce output, but poor planning can waste a successful season. A city consumer may see only the final price, while farmers see a chain of risks that began months earlier.\n\nFor IELTS learners, this topic offers clear vocabulary and a familiar argument. It shows how words about fields, animals, and shops can belong to one larger system. Understanding that system helps readers move beyond individual nouns toward the relationships that academic passages often test.`,
  },

  {
    id: 'phase1-geo-fast-01',
    mode: 'fast',
    theme: 'geography-earth',
    subtheme: 'natural hazards and geological change',
    style: 'ielts-reading',
    readingGoal: 'Build rapid recognition of geological hazard vocabulary in one dense academic passage.',
    title: 'Fast Track: Hazards Written in the Land',
    targetWordIds: ['mishap__noun', 'jeopardise__verb', 'destructive__adjective', 'el-nino__noun', 'phenomenon__noun', 'pebble__noun', 'ore__noun', 'marble__noun', 'gale__noun', 'tornado__noun', 'typhoon__noun', 'volcano__noun', 'erupt__verb', 'magma__noun', 'thermodynamic__adjective', 'smog__noun', 'fume__noun', 'mist__noun', 'tsunami__noun', 'flooding__noun', 'torrent__noun', 'seismic__adjective', 'avalanche__noun', 'terrain__noun', 'landscape__noun', 'continent__noun', 'cave__noun', 'cliff__noun', 'glacier__noun', 'swamp__noun'],
    content: `Natural hazards are rarely a single mishap. They are usually a chain of conditions that can jeopardise settlements when a destructive force meets fragile terrain. El Nino is one climate phenomenon that may alter rainfall across a continent, turning a quiet landscape into a place of flooding, drought, or sudden movement.\n\nGeology adds another layer. A volcano may erupt when magma rises through weak rock, and a seismic shock can loosen a cliff, open a cave, or send an avalanche down a glacier valley. Even small evidence matters: a pebble, a vein of ore, or a block of marble can reveal how pressure and heat changed the land.\n\nWeather vocabulary also belongs in this system. A gale, tornado, or typhoon can push water inland and create a torrent where a road once crossed a swamp. Smog, fume, and mist reduce visibility, while thermodynamic changes help explain why air masses become unstable. A tsunami reminds readers that the ocean and the land are connected by forces far beyond ordinary experience.`,
  },
  {
    id: 'phase1-geo-fast-02',
    mode: 'fast',
    theme: 'geography-earth',
    subtheme: 'landforms and global position',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover landform and location vocabulary through an IELTS-style geography overview.',
    title: 'Fast Track: From Delta to Polar Plateau',
    targetWordIds: ['delta__noun', 'plain__noun', 'plateau__noun', 'oasis__noun', 'globe__noun', 'hemisphere__noun', 'equator__noun', 'arctic__adjective', 'antarctic__adjective', 'pole__noun', 'polar__adjective', 'deteriorate__verb', 'aggravate__verb', 'degrade__verb', 'upgrade__verb', 'erode__verb', 'mediterranean__adjective', 'atlantic__noun', 'pacific__adjective', 'navigation__noun', 'gulf__noun', 'beach__noun', 'coast__noun', 'shore__noun', 'current__noun', 'brook__noun', 'source__noun', 'shallow__adjective', 'superficial__adjective', 'flat__adjective'],
    content: `A physical map of the globe shows how varied the Earth can be. A river may begin at a mountain source, become a brook, cross a flat plain, and finally build a delta at the coast. In a dry region, an oasis may interrupt a plateau, while a gulf, beach, or shore marks the meeting point between land and sea.\n\nPosition changes interpretation. The equator divides one hemisphere from another, and places near the pole face arctic or Antarctic conditions. Polar ice, a Pacific current, and Atlantic storms all affect navigation, trade, and settlement. A Mediterranean climate may appear mild, but water pressure and tourism can still erode local environments.\n\nHuman action can either aggravate or reduce damage. Poor planning may degrade a shallow coastal system until only superficial beauty remains. Careful policy can upgrade drainage, protect wetlands, and slow deterioration before the landscape begins to deteriorate beyond repair.`,
  },
  {
    id: 'phase1-climate-fast-01',
    mode: 'fast',
    theme: 'environment-climate',
    subtheme: 'weather systems and mountain regions',
    style: 'ielts-reading',
    readingGoal: 'Build fast coverage of weather, direction, and mountain vocabulary in context.',
    title: 'Fast Track: Weather across Mountain Regions',
    targetWordIds: ['smooth__adjective', 'rough__adjective', 'sandy__adjective', 'stony__adjective', 'vertical__adjective', 'steep__adjective', 'parallel__noun', 'narrow__adjective', 'oceania__noun', 'mainland__noun', 'peninsula__noun', 'meteorology__noun', 'mild__adjective', 'heating__noun', 'moderate__adjective', 'warm__adjective', 'thermal__adjective', 'tropics__noun', 'arid__adjective', 'moist__adjective', 'damp__adjective', 'humid__adjective', 'snowy__adjective', 'frost__noun', 'hail__noun', 'thaw__verb', 'chill__verb', 'freeze__verb', 'frigid__adjective', 'tremble__verb'],
    content: `Meteorology often begins with local description. A smooth beach, a rough ridge, a sandy plain, or a stony path can change how wind and heat move through a region. On a narrow peninsula or a mainland coast, two parallel air flows may produce very different weather within a short distance.\n\nTemperature words are equally important. A mild winter may reduce heating demand, while a frigid night can make water freeze and cause people to tremble from chill. In a snowy valley, frost and hail may remain until spring conditions allow the ground to thaw.\n\nClimate zones show wider contrasts. The tropics are usually warm, moist, damp, or humid, while an arid interior may lose water quickly through thermal pressure. A moderate climate in Oceania can still include steep hills, vertical cliffs, and sudden storms, so IELTS readers need precise vocabulary rather than simple labels.`,
  },
  {
    id: 'phase1-climate-core-01',
    mode: 'core',
    theme: 'environment-climate',
    subtheme: 'storms and forecasts',
    style: 'ielts-reading',
    readingGoal: 'Practise weather vocabulary in a moderate-density article about public warnings.',
    title: 'Balanced Practice: Reading a Storm Forecast',
    targetWordIds: ['shiver__verb', 'thunder__noun', 'lightning__noun', 'stormy__adjective', 'downpour__noun', 'sprinkle__verb', 'rainbow__noun', 'shower__noun', 'celsius__adjective', 'forecast__noun', 'peak__noun', 'mount__verb', 'range__noun', 'ridge__noun', 'slope__verb', 'valley__noun', 'hillside__noun', 'overlook__verb'],
    content: `A useful forecast does more than state whether rain will fall. It explains how a stormy system may move across a mountain range, reach its peak intensity, and then weaken as it crosses a ridge. If the temperature drops several Celsius degrees, residents in a valley may shiver before the first shower arrives.\n\nWeather can also change quickly. A light sprinkle may become a downpour, thunder may follow lightning, and water may slope down a hillside toward homes that overlook a river. In such conditions, risk begins to mount even before dramatic flooding occurs.\n\nAfter the storm, the same landscape may look calm again. A rainbow can appear above wet fields, but the academic reader should still notice the argument: accurate forecasting connects atmosphere, landform, and human preparation.`,
  },
  {
    id: 'phase1-geo-core-03',
    mode: 'core',
    theme: 'geography-earth',
    subtheme: 'directions, borders and urban edges',
    style: 'ielts-reading',
    readingGoal: 'Use direction and boundary vocabulary in a natural geography passage.',
    title: 'Balanced Practice: Mapping Edges and Directions',
    targetWordIds: ['southern__adjective', 'southeast__noun', 'southwest__noun', 'northeast__noun', 'northwest__noun', 'eastern__adjective', 'oriental__adjective', 'inevitable__adjective', 'irreversible__adjective', 'irregularly__adverb', 'inappropriate__adjective', 'abnormal__adjective', 'sediment__noun', 'silt__noun', 'muddy__adjective', 'clay__noun', 'dirt__noun', 'rural__adjective'],
    content: `Maps often simplify direction, but lived geography is more irregular. A southern road may turn toward the southeast, while an older railway bends northwest before reaching an eastern port. In some historical texts, the word oriental appears, although modern writers use it carefully because it can sound inappropriate.\n\nEnvironmental change complicates these borders. A rural river may carry sediment and silt until the water becomes muddy. Clay and dirt collect on low land, and after abnormal rainfall the old channel may shift in a way that seems almost inevitable.\n\nPlanning can reduce damage, but not every process is reversible. Once a wetland is filled or a river edge is hardened, some ecological losses may become irreversible. A good IELTS passage asks readers to follow these slow changes rather than focus only on sudden disasters.`,
  },
  {
    id: 'phase1-urban-core-01',
    mode: 'core',
    theme: 'society-government',
    subtheme: 'suburbs, pollution and urban margins',
    style: 'ielts-reading',
    readingGoal: 'Practise urban-environment vocabulary through a passage about city edges.',
    title: 'Balanced Practice: Life on the Urban Fringe',
    targetWordIds: ['suburb__noun', 'outskirts__noun', 'remote__adjective', 'desolate__adjective', 'distant__adjective', 'adjacent__adjective', 'toxic__adjective', 'pollutant__noun', 'contaminate__verb', 'geology__noun', 'border__noun', 'margin__noun', 'fringe__noun', 'plate__noun', 'debris__noun', 'crack__verb', 'gap__noun', 'splendid__adjective'],
    content: `The outskirts of a city are often described as empty, but the urban fringe can be socially and environmentally complex. A suburb may stand adjacent to farmland, a remote factory, or a desolate area where old industrial debris still lies beside the road. The margin between city and countryside is rarely clear.\n\nPollution makes this border more difficult to manage. A toxic pollutant can contaminate soil, enter a crack in a concrete plate, or settle in a gap between buildings. Local geology affects whether the material remains near the surface or travels toward distant water sources.\n\nYet these places are not only damaged. Some contain splendid views, informal markets, and communities that have adapted to uncertain conditions. The IELTS challenge is to avoid a simple judgement and instead analyse how risk, land use, and everyday life overlap.`,
  },
  {
    id: 'phase1-env-fast-02',
    mode: 'fast',
    theme: 'environment-climate',
    subtheme: 'wilderness, water cycle and energy',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover environmental process vocabulary through a dense academic article.',
    title: 'Fast Track: Water, Wilderness, and Energy',
    targetWordIds: ['grand__adjective', 'magnificent__adjective', 'super__adjective', 'interesting__adjective', 'dramatic__adjective', 'wilderness__noun', 'desert__noun', 'deforest__verb', 'barren__adjective', 'fertile__adjective', 'fertilise__verb', 'solar__adjective', 'lunar__adjective', 'calendar__noun', 'sunrise__noun', 'sunset__noun', 'eclipse__noun', 'dusk__noun', 'heaven__noun', 'paradise__noun', 'sunshine__noun', 'shade__noun', 'shadow__noun', 'vapour__noun', 'evaporate__verb', 'circulate__verb', 'precipitate__verb', 'reservoir__noun', 'waterfall__noun', 'fountain__noun'],
    content: `Environmental writing often uses beautiful scenes to introduce serious processes. A grand mountain, a magnificent waterfall, or a desert sunset may seem like paradise, especially when sunshine falls through shade and shadow at dusk. Yet an interesting IELTS passage usually moves beyond scenery to explain how systems work.\n\nThe water cycle is one example. Vapour can evaporate from a reservoir, circulate through the atmosphere, and precipitate as rain that feeds a fountain, river, or waterfall. A lunar calendar may guide traditional farming, while a solar eclipse can remind readers that natural observation has long shaped human timekeeping.\n\nHuman pressure can make this story more dramatic. People may deforest fertile land until it becomes barren, then try to fertilise poor soil with artificial inputs. A wilderness that once seemed super in scale can shrink quickly. The passage therefore treats nature not as heaven but as a fragile system that needs careful reading.`,
  },
  {
    id: 'phase1-water-core-01',
    mode: 'core',
    theme: 'environment-climate',
    subtheme: 'movement of water and air',
    style: 'ielts-reading',
    readingGoal: 'Practise process verbs for water, air, and environmental description.',
    title: 'Balanced Practice: The Movement of Water',
    targetWordIds: ['spring__noun', 'dew__noun', 'pour__verb', 'drain__verb', 'drip__verb', 'drown__verb', 'blow__verb', 'puff__verb', 'gush__verb', 'dense__adjective', 'intensity__noun', 'emerge__verb', 'flash__verb', 'float__verb', 'environment__noun', 'surrounding__adjective', 'condition__noun', 'situation__noun'],
    content: `Water changes its meaning according to movement. A spring may feed a village quietly, dew may collect on leaves, and a small pipe may drip for weeks without attracting attention. During a storm, however, rain can pour from a dense cloud with such intensity that drains fail and streets begin to flood.\n\nAir matters too. Wind may blow steadily, or arrive as a short puff before lightning begins to flash. Leaves float on the surface, water may gush from a broken channel, and in extreme conditions people can drown in places that seemed safe only hours earlier.\n\nThis surrounding environment creates a difficult situation for planners. The condition of roads, drains, and warning systems determines whether danger will emerge slowly or suddenly. Good reading requires following each process step by step.`,
  },
  {
    id: 'phase1-science-fast-01',
    mode: 'fast',
    theme: 'science-technology',
    subtheme: 'materials, fuels and biological processes',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover science vocabulary linking chemistry, ecology, and energy.',
    title: 'Fast Track: Materials, Fuel, and Living Systems',
    targetWordIds: ['nature__noun', 'natural__adjective', 'synthetic__adjective', 'petrol__noun', 'gas__noun', 'gasoline__noun', 'petroleum__noun', 'photosynthesis__noun', 'respire__verb', 'dioxide__noun', 'vegetation__noun', 'herb__noun', 'perennial__noun', 'botany__noun', 'ecology__noun', 'eco-friendly__adjective', 'genetics__noun', 'mutation__noun', 'variation__noun', 'diversity__noun', 'hybridisation__noun', 'reproduce__verb', 'evolve__verb', 'fluctuate__verb', 'sow__verb', 'pluck__verb', 'pick__verb', 'yield__verb', 'arable__adjective', 'spade__noun'],
    content: `Science passages often connect nature with technology. Petrol, gasoline, gas, and petroleum are fuels derived from natural materials, yet modern industry also produces synthetic substances that change how societies use energy. When fuels burn, dioxide compounds enter the air and affect ecology.\n\nBiological systems offer another vocabulary set. Plants use photosynthesis, respire, reproduce, and evolve through variation, mutation, and sometimes hybridisation. Botany studies a herb, a perennial plant, and wider vegetation patterns, while genetics explains how diversity is maintained across generations.\n\nFarming makes these ideas practical. On arable land, a worker may sow seed with a spade, pluck weeds, pick fruit, and hope the crop will yield enough food. Output may fluctuate with rainfall and soil quality. Eco-friendly methods try to protect living systems while still meeting human needs.`,
  },
  {
    id: 'phase1-plant-fast-01',
    mode: 'fast',
    theme: 'food-agriculture',
    subtheme: 'plant growth and decay',
    style: 'ielts-reading',
    readingGoal: 'Build plant-growth vocabulary through a dense agriculture and ecology article.',
    title: 'Fast Track: From Seed to Forest Floor',
    targetWordIds: ['rake__noun', 'stack__noun', 'heap__noun', 'bundle__noun', 'bunch__noun', 'vase__noun', 'sunlight__noun', 'short-day__adjective', 'shade-tolerant__adjective', 'fungus__noun', 'mould__noun', 'pollen__noun', 'germinate__verb', 'burgeon__noun', 'bud__noun', 'flower__noun', 'blossom__verb', 'bloom__noun', 'scent__noun', 'aromatic__adjective', 'fruit__verb', 'wither__verb', 'decompose__verb', 'rot__verb', 'decay__verb', 'stale__adjective', 'rainforest__noun', 'jungle__noun', 'plantation__noun', 'field__noun'],
    content: `Agricultural vocabulary begins with simple tools and objects. A rake may gather leaves into a heap, a stack, or a bundle, while a bunch of flowers may later be placed in a vase. Yet IELTS passages usually move from these visible details to the biological processes behind plant growth.\n\nSunlight determines whether seeds germinate, whether a bud opens into a flower, and whether a plant will blossom or bloom. Some short-day plants respond to long nights, while shade-tolerant species survive beneath rainforest trees. An aromatic scent can attract insects that carry pollen, allowing plants to fruit.\n\nDecay completes the cycle. In a damp jungle or plantation field, fungus and mould break down stale fruit. Leaves wither, decompose, rot, and finally decay into soil nutrients. This process may seem ordinary, but it explains how life continues in both managed farms and wild ecosystems.`,
  },
  {
    id: 'phase1-forest-core-01',
    mode: 'core',
    theme: 'environment-climate',
    subtheme: 'forestry and plant structure',
    style: 'ielts-reading',
    readingGoal: 'Practise forestry vocabulary through a moderate-density passage.',
    title: 'Balanced Practice: Reading a Managed Forest',
    targetWordIds: ['terrace__noun', 'timber__noun', 'charcoal__noun', 'log__noun', 'logo__noun', 'forestry__noun', 'branch__noun', 'trunk__noun', 'bough__noun', 'root__noun', 'hay__noun', 'straw__noun', 'reed__noun', 'thorn__noun', 'weed__noun', 'grass__noun', 'meadow__noun', 'lawn__noun'],
    content: `A managed forest is not only a source of timber. Forestry decisions influence soil, water, wildlife, and rural employment. A single log may become furniture, charcoal, or part of a company logo that promises sustainability, but the real question is how the forest is maintained.\n\nTree structure provides useful vocabulary. A trunk supports each branch and bough, while the root system holds the slope in place. On a nearby terrace, farmers may store hay and straw, cut reed from wet ground, or remove thorn and weed species that compete with crops.\n\nOpen land has its own pattern. A meadow, lawn, or grass path may look natural even when it is carefully managed. IELTS readers should notice how the passage links visible plant parts with economic choices and conservation outcomes.`,
  },
  {
    id: 'phase1-botany-read-01',
    mode: 'read',
    theme: 'food-agriculture',
    subtheme: 'slow observation of garden plants',
    style: 'ielts-reading',
    readingGoal: 'Sustain reading with a lighter passage about plants and observation.',
    title: 'Reading Habit: The Quiet Logic of a Garden',
    targetWordIds: ['olive__noun', 'pine__noun', 'vine__noun', 'violet__noun', 'tulip__noun', 'mint__noun', 'reef__noun', 'alga__noun', 'enzyme__noun'],
    content: `A small garden can teach careful reading. An olive tree grows slowly near a pine, a vine climbs the wall, and a violet appears beside a tulip after rain. Nearby, mint spreads so quickly that the gardener must decide whether to welcome it or limit it.\n\nThe same habit of observation applies beyond the garden. On a reef, alga may cover stone in thin layers, while an enzyme helps living cells transform one substance into another. These details are small, but they show how life depends on quiet processes.\n\nThis passage is deliberately gentle. It asks the reader to notice relationships rather than memorise a long list. In academic reading, that patience often matters as much as speed.`,
  },
  {
    id: 'phase1-ecology-fast-01',
    mode: 'fast',
    theme: 'environment-climate',
    subtheme: 'ecosystem protection and impact',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover conservation, impact, and evaluation vocabulary.',
    title: 'Fast Track: Protecting Fragile Ecosystems',
    targetWordIds: ['catalyst__noun', 'release__verb', 'emission__noun', 'absorb__verb', 'surroundings__noun', 'mechanism__noun', 'counterbalance__noun', 'protect__verb', 'preserve__verb', 'conservation__noun', 'bush-fire__noun', 'extinguish__verb', 'destruct__verb', 'ruin__verb', 'perish__verb', 'demolish__verb', 'infringe__verb', 'undermine__verb', 'extinction__noun', 'pattern__noun', 'outcome__noun', 'impact__noun', 'experimental__adjective', 'favourable__adjective', 'productive__adjective', 'effective__adjective', 'efficient__adjective', 'considerable__adjective', 'massive__adjective', 'immense__adjective'],
    content: `Ecology passages often ask readers to connect a mechanism with an outcome. A catalyst may release a chemical reaction, trees may absorb carbon emission, and healthy surroundings can counterbalance some human impact. Conservation is therefore not sentimental; it is an effective way to protect and preserve productive systems.\n\nDamage can also be rapid. A bush fire may ruin habitat before firefighters can extinguish it. Illegal building may demolish wetlands, infringe protection rules, and undermine local water storage. In severe cases, animals perish and extinction becomes a real possibility rather than a distant fear.\n\nResearchers look for patterns. An experimental project may produce favourable results if it is efficient and well managed, but even a considerable effort can fail when pressure is massive or immense. The IELTS reader should follow how evidence leads from cause to impact and then to policy.`,
  },
  {
    id: 'phase1-biology-fast-01',
    mode: 'fast',
    theme: 'health-biology',
    subtheme: 'biologists and animal groups',
    style: 'ielts-reading',
    readingGoal: 'Build rapid coverage of biology and animal-classification vocabulary.',
    title: 'Fast Track: Classifying Living Things',
    targetWordIds: ['maximal__adjective', 'minimal__adjective', 'optimal__adjective', 'biologist__noun', 'zoologist__noun', 'ecologist__noun', 'botanist__noun', 'mammal__noun', 'primate__noun', 'vertebrate__noun', 'reptile__noun', 'amphibian__noun', 'carnivore__noun', 'herbivore__noun', 'creature__noun', 'wildlife__noun', 'flora__noun', 'species__noun', 'flock__noun', 'herd__noun', 'swarm__noun', 'throng__noun', 'crowd__noun', 'beast__noun', 'brute__noun', 'cruel__adjective', 'originate__verb', 'stem__verb', 'ancestor__noun', 'descendant__noun'],
    content: `Biology depends on classification. A biologist, zoologist, ecologist, or botanist may describe a species by asking where it originated, which ancestor it shares with related groups, and how each descendant adapted to a particular environment. The optimal classification is precise enough for research but simple enough to communicate.\n\nAnimal vocabulary helps readers follow these arguments. A mammal, primate, vertebrate, reptile, amphibian, carnivore, and herbivore all belong to different patterns of life. A creature may move in a flock, herd, swarm, throng, or crowd, depending on its behaviour and habitat.\n\nThe language can also carry judgement. Words such as beast, brute, and cruel are less scientific, but they appear in discussions about wildlife treatment. Conservation aims for maximal protection with minimal harm, because many problems stem from the mistaken belief that animals are separate from human futures.`,
  },
  {
    id: 'phase1-biology-core-01',
    mode: 'core',
    theme: 'health-biology',
    subtheme: 'reproduction and animal development',
    style: 'ielts-reading',
    readingGoal: 'Practise reproduction vocabulary in a readable biology passage.',
    title: 'Balanced Practice: How Species Continue',
    targetWordIds: ['offspring__noun', 'subgroup__noun', 'feed__verb', 'breed__verb', 'interbreed__verb', 'hybridize__verb', 'proliferate__verb', 'sterility__noun', 'mate__verb', 'courtship__noun', 'lay__verb', 'hatch__verb', 'spawn__noun', 'mature__adjective', 'skin__noun', 'claw__noun', 'paw__noun', 'beak__noun'],
    content: `Reproduction is more than the production of offspring. A species may include a subgroup that feeds in a particular area, chooses a mate through courtship, and begins to breed only after reaching a mature stage. Some birds lay eggs that hatch quickly, while fish may release spawn into water.\n\nBiologists also study boundaries between groups. Related animals may interbreed or even hybridize, but sterility can prevent the new line from continuing. If conditions are favourable, one population may proliferate and change the balance of an ecosystem.\n\nPhysical features help readers identify these processes. Skin, claw, paw, and beak structures reveal how animals move, defend themselves, and care for young. The vocabulary is technical, but the passage remains a story about continuity.`,
  },
  {
    id: 'phase1-animal-fast-01',
    mode: 'fast',
    theme: 'health-biology',
    subtheme: 'animal bodies and common species',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover animal-body and species vocabulary through a dense natural-history passage.',
    title: 'Fast Track: Animal Forms and Movement',
    targetWordIds: ['fin__noun', 'wing__noun', 'plume__noun', 'feather__noun', 'fur__noun', 'bristle__noun', 'curl__noun', 'insect__noun', 'worm__noun', 'pest__noun', 'parasite__noun', 'spider__noun', 'butterfly__noun', 'mosquito__noun', 'cricket__noun', 'penguin__noun', 'tortoise__noun', 'turtle__noun', 'whale__noun', 'kangaroo__noun', 'camel__noun', 'panda__noun', 'elephant__noun', 'trunk__noun__2', 'ivory__noun', 'horn__noun', 'bear__noun', 'wolf__noun', 'dragon__noun', 'fox__noun'],
    content: `Natural-history passages often move quickly across species. A whale uses a fin, a bird depends on a wing, and a penguin has feather structures adapted to cold water. Mammals may be recognised by fur, while a camel, panda, elephant, bear, wolf, or fox invites comparison between habitat and body form.\n\nSmaller creatures matter as well. An insect, worm, spider, butterfly, mosquito, and cricket may seem minor, yet each can affect crops or disease patterns. A pest or parasite can damage a farm, while a bristle, curl, plume, horn, trunk, or piece of ivory may become evidence in classification.\n\nCultural words sometimes enter the same reading field. A dragon is not a real species, but it appears in myths that borrow features from reptiles, birds, and beasts. A tortoise and turtle show how precise vocabulary prevents confusion when IELTS texts compare similar animals.`,
  },
  {
    id: 'phase1-domestic-core-01',
    mode: 'core',
    theme: 'daily-life',
    subtheme: 'domestic and farm animals',
    style: 'ielts-reading',
    readingGoal: 'Practise common animal vocabulary in a moderate-density passage.',
    title: 'Balanced Practice: Animals around Human Settlements',
    targetWordIds: ['cub__noun', 'calf__noun', 'pup__noun', 'lamb__noun', 'cattle__noun', 'ox__noun', 'bull__noun', 'buffalo__noun', 'horse__noun', 'zebra__noun', 'donkey__noun', 'saddle__noun', 'harness__noun', 'falcon__noun', 'hawk__noun', 'eagle__noun', 'owl__noun', 'swallow__noun'],
    content: `Human settlement has always changed the lives of animals. Cattle, oxen, a bull, or a buffalo may support farming, while a horse or donkey can carry people and goods when fitted with a saddle or harness. These words appear simple, but they often support larger arguments about labour and land use.\n\nYoung animals add another layer of precision. A cub, calf, pup, or lamb tells the reader not only the species but also the stage of life. Such vocabulary is useful when passages discuss breeding, nutrition, or changing patterns in rural communities.\n\nWild birds remain part of the same landscape. A falcon, hawk, eagle, owl, or swallow may hunt near fields and barns. Even a zebra, far from most farms, can appear in comparisons about domestication and human control.`,
  },
  {
    id: 'phase1-birds-read-01',
    mode: 'read',
    theme: 'health-biology',
    subtheme: 'quiet observation of birds',
    style: 'ielts-reading',
    readingGoal: 'Develop reading stamina with a light passage about birds and urban nature.',
    title: 'Reading Habit: Birds near the River',
    targetWordIds: ['sparrow__noun', 'pigeon__noun', 'crow__noun', 'swan__noun', 'goose__noun', 'cock__noun', 'mouse__noun', 'rat__noun'],
    content: `Near an urban river, birds make ordinary life feel more layered. A sparrow moves through the grass, a pigeon waits near the bridge, and a crow watches from a lamp post. On the water, a swan passes slowly while a goose calls from the bank.\n\nThe same place also contains less admired animals. A mouse may live under a wall, and a rat may appear after dark where food has been left behind. A cock from a nearby yard can be heard in the morning, connecting the city to older rural rhythms.\n\nThis lower-density passage is designed for calm reading. The vocabulary is concrete, but the deeper practice is to follow how one small setting can hold many forms of life.`,
  },
  {
    id: 'phase1-ecology-core-02',
    mode: 'core',
    theme: 'environment-climate',
    subtheme: 'animal behaviour and habitats',
    style: 'ielts-reading',
    readingGoal: 'Practise animal behaviour vocabulary in an ecological explanation.',
    title: 'Balanced Practice: Behaviour inside a Habitat',
    targetWordIds: ['squirrel__noun', 'hare__noun', 'frog__noun', 'behaviour__noun', 'bite__verb', 'sting__verb', 'bark__verb', 'roar__noun', 'rub__verb', 'creep__verb', 'crawl__verb', 'habitat__noun', 'nest__noun', 'hive__noun', 'cage__noun', 'stable__noun', 'barn__noun', 'hedge__noun'],
    content: `Animal behaviour is shaped by habitat. A squirrel may hide food near a hedge, a hare may creep through long grass, and a frog may crawl toward water after rain. These actions look small, but they reveal how animals respond to danger and opportunity.\n\nDefence is another pattern. A dog may bark, an insect may sting, and a frightened animal may bite. Larger species may produce a roar, while smaller creatures rub against surfaces to leave scent or find direction.\n\nHuman structures change these behaviours. A nest, hive, cage, stable, or barn can protect animals, but it can also limit movement. IELTS passages often ask readers to judge whether such management supports welfare or simply serves human convenience.`,
  },
  {
    id: 'phase1-health-fast-02',
    mode: 'fast',
    theme: 'health-biology',
    subtheme: 'disease, metabolism and vulnerability',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover health and biological-response vocabulary.',
    title: 'Fast Track: Disease, Instinct, and Survival',
    targetWordIds: ['barrier__noun', 'bar__noun', 'anatomy__noun', 'epidemic__noun', 'gene__noun', 'germ__noun', 'bacteria__noun', 'microbe__noun', 'metabolism__noun', 'protein__noun', 'vitamin__noun', 'secrete__verb', 'excrete__verb', 'devour__verb', 'instinct__noun', 'intuitive__adjective', 'potential__noun', 'functional__adjective', 'sensitive__adjective', 'flexible__adjective', 'acoustic__adjective', 'optical__adjective', 'nocturnal__adjective', 'dormant__adjective', 'hibernation__noun', 'track__verb', 'trace__verb', 'alternate__verb', 'prey__noun', 'predator__noun'],
    content: `Health and biology share a vocabulary of defence. The body uses anatomy as a barrier against a germ, bacteria, or microbe, while metabolism depends on protein, vitamin intake, and functional organs that secrete or excrete substances. When these systems fail, an epidemic may expose hidden weakness.\n\nAnimals respond through instinct as well as learning. A predator may track prey by smell, trace movement through grass, or alternate between day and night hunting. Nocturnal species rely on acoustic and optical signals, while others enter hibernation or remain dormant during hard seasons.\n\nThe same passage can discuss potential adaptation. A sensitive organism may be intuitive in its behaviour and flexible in its feeding pattern, yet a parasite may still devour resources. A simple bar or barrier in a laboratory can separate samples, but real ecosystems are much harder to control.`,
  },
  {
    id: 'phase1-conservation-core-01',
    mode: 'core',
    theme: 'environment-climate',
    subtheme: 'conservation pressure and animal welfare',
    style: 'ielts-reading',
    readingGoal: 'Practise conservation vocabulary in an argument about welfare.',
    title: 'Balanced Practice: Vulnerable Animals and Human Choices',
    targetWordIds: ['victim__noun', 'captive__noun', 'defensive__adjective', 'undergo__verb', 'suffer__verb', 'vulnerable__adjective', 'subsistence__noun', 'exist__verb', 'exterminate__verb', 'tame__verb', 'keeper__noun', 'shepherd__noun', 'galaxy__noun', 'cosmos__noun', 'universe__noun', 'interstellar__adjective', 'terrestrial__adjective', 'celestial__adjective'],
    content: `Conservation writing often presents animals as vulnerable, but the reasons for that vulnerability differ. A species may suffer because its habitat is reduced, because subsistence farming changes land use, or because hunters try to exterminate animals seen as threats. A victim of this pressure may still exist in small numbers, but recovery is uncertain.\n\nHuman control can help or harm. A captive animal may undergo treatment from a keeper, while a shepherd may tame working animals for daily labour. Defensive behaviour is sometimes misunderstood as aggression when it is actually a response to fear.\n\nThe final paragraph may seem surprising: writers sometimes compare terrestrial life with the wider universe, galaxy, cosmos, or even interstellar and celestial exploration. The comparison reminds readers that life on Earth is rare enough to deserve careful protection.`,
  },
  {
    id: 'phase1-space-fast-01',
    mode: 'fast',
    theme: 'science-technology',
    subtheme: 'space observation and missions',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover astronomy and space-technology vocabulary.',
    title: 'Fast Track: Space Missions and Observation',
    targetWordIds: ['astronomy__noun', 'astrology__noun', 'astronaut__noun', 'comet__noun', 'meteorite__noun', 'crater__noun', 'dust__noun', 'ash__noun', 'envelope__noun', 'chunk__noun', 'spacecraft__noun', 'spaceship__noun', 'probe__noun', 'module__noun', 'propulsion__noun', 'pressure__noun', 'dynamics__noun', 'motion__noun', 'vent__noun', 'tail__noun', 'curve__noun', 'exploration__noun', 'expedition__noun', 'flyby__noun', 'observatory__noun', 'telescope__noun', 'spectacle__noun', 'orbit__noun', 'ecliptic__noun', 'diameter__noun'],
    content: `Astronomy differs from astrology because it tests claims through observation. An observatory uses a telescope to study a comet, meteorite, crater, cloud of dust, or trail of ash. What looks like a spectacle in the night sky may become evidence about orbit, ecliptic position, diameter, and motion.\n\nSpace exploration adds engineering vocabulary. A spacecraft or spaceship may carry an astronaut, a probe, and a module designed for a specific expedition. Propulsion, pressure, and flight dynamics determine whether the craft can complete a flyby or follow a curved path around a planet.\n\nEven small details matter. A chunk of rock, the tail of a comet, a gas vent, or the envelope of a planet can change scientific interpretation. The IELTS reader must follow how technical evidence supports the larger argument about human exploration.`,
  },
  {
    id: 'phase1-chem-fast-01',
    mode: 'fast',
    theme: 'science-technology',
    subtheme: 'substances and measurement',
    style: 'ielts-reading',
    readingGoal: 'Build rapid coverage of chemistry, physics, and measurement vocabulary.',
    title: 'Fast Track: Substances, Signals, and Change',
    targetWordIds: ['radius__noun', 'substance__noun', 'composition__noun', 'compound__noun', 'fossil__noun', 'sample__noun', 'specimen__noun', 'molecule__noun', 'atom__noun', 'ion__noun', 'electron__noun', 'liquid__noun', 'fluid__noun', 'solid__noun', 'synthesise__verb', 'formation__noun', 'method__noun', 'spectrum__noun', 'dimension__noun', 'frequency__noun', 'signal__noun', 'antenna__noun', 'circuit__noun', 'refraction__noun', 'ultraviolet__noun', 'radioactive__adjective', 'distinct__adjective', 'discernible__adjective', 'invisible__adjective', 'collision__noun'],
    content: `Laboratory science begins with careful description. A substance has a composition, and a compound may be built from an atom, ion, electron, molecule, or larger formation. A fossil sample or biological specimen can be tested by a method that reveals whether it contains liquid, fluid, or solid material.\n\nPhysics adds the language of measurement. Radius, dimension, frequency, signal, antenna, and circuit all help researchers describe energy and communication. Refraction may bend light, ultraviolet radiation may be invisible, and radioactive material requires strict control.\n\nGood evidence must be distinct and discernible. A collision between particles can change a spectrum, while chemists may synthesise a new material to test a theory. The passage is dense because IELTS science texts often connect many precise terms inside one argument.`,
  },
  {
    id: 'phase1-disaster-core-01',
    mode: 'core',
    theme: 'environment-climate',
    subtheme: 'catastrophe and recovery',
    style: 'ielts-reading',
    readingGoal: 'Practise disaster vocabulary in a moderate-density analytical passage.',
    title: 'Balanced Practice: After the Collision',
    targetWordIds: ['squash__verb', 'fragment__noun', 'cataclysmic__adjective', 'overwhelming__adjective', 'despair__verb', 'desperate__adjective', 'hopeless__adjective', 'primary__adjective', 'secondary__adjective', 'university__noun', 'college__noun', 'institute__noun', 'academy__noun', 'learn__verb', 'study__verb', 'acquire__verb', 'knowledge__noun', 'expertise__noun'],
    content: `A disaster may begin with a primary event, such as a collision that can squash vehicles or scatter every fragment of a building. If the damage is cataclysmic, survivors may feel desperate, hopeless, or close to despair. Yet the secondary effects often determine the length of recovery.\n\nEducational institutions can help societies understand these events. A university, college, institute, or academy may study disaster response so that students learn to acquire knowledge and practical expertise. Research turns overwhelming experience into evidence that can guide future decisions.\n\nThis kind of passage is useful because it links emotion with analysis. The writer acknowledges suffering but also shows how careful study can reduce future risk.`,
  },
  {
    id: 'phase1-education-fast-01',
    mode: 'fast',
    theme: 'education-learning',
    subtheme: 'learning ability and motivation',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover education and ability vocabulary in one dense passage.',
    title: 'Fast Track: Learning, Motivation, and Ability',
    targetWordIds: ['novice__noun', 'recruit__verb', 'literate__adjective', 'illiteracy__noun', 'numerate__adjective', 'problem__noun', 'issue__noun', 'affair__noun', 'controversial__adjective', 'puzzle__noun', 'riddle__noun', 'obscure__adjective', 'instil__verb', 'cram__verb', 'emphasise__verb', 'enable__verb', 'inspire__verb', 'motive__noun', 'motivate__verb', 'stimulate__verb', 'spur__verb', 'impetus__noun', 'indulge__verb', 'spoil__verb', 'abuse__verb', 'intelligent__adjective', 'clever__adjective', 'smart__adjective', 'all-round__adjective', 'genius__noun'],
    content: `Education passages often begin with a problem or issue, but the real affair is usually deeper. A school may recruit a novice teacher to help students become literate and numerate, while also reducing illiteracy in the wider community. The task can be controversial when resources are limited.\n\nLearning is not only the solution to a puzzle or riddle. Teachers must instil confidence, emphasise reasoning, and enable students to understand obscure material. If lessons simply cram facts, they may spoil curiosity or even abuse the learner’s time. Good teaching can inspire, motivate, stimulate, and spur effort by giving students a clear motive and impetus.\n\nAbility words need careful use. A student may be intelligent, clever, smart, all-round, or even a genius in one field, but academic success also depends on discipline. To indulge talent without structure is rarely enough.`,
  },
  {
    id: 'phase1-education-core-01',
    mode: 'core',
    theme: 'education-learning',
    subtheme: 'academic reputation and diligence',
    style: 'ielts-reading',
    readingGoal: 'Practise education vocabulary through a natural campus argument.',
    title: 'Balanced Practice: Reputation in Academic Life',
    targetWordIds: ['elite__noun', 'idiot__noun', 'wisdom__noun', 'wit__noun', 'aptitude__noun', 'capable__adjective', 'excellent__adjective', 'outstanding__adjective', 'brilliant__adjective', 'prestige__noun', 'reputation__noun', 'eminent__adjective', 'notorious__adjective', 'esteem__verb', 'respect__noun', 'diligent__adjective', 'painstaking__adjective', 'skill__noun'],
    content: `Academic reputation can be misleading. An elite institution may enjoy prestige, and an eminent professor may receive public respect, but real education depends on the daily work of capable and diligent learners. A brilliant student with natural aptitude still needs skill and patience.\n\nLabels can distort judgement. One student may be called outstanding or excellent, while another is unfairly dismissed as an idiot. A notorious case of cheating may damage a university reputation, even though most students work in a painstaking and honest way.\n\nWisdom and wit are valuable, but they are not substitutes for careful study. A good academic culture esteems effort as well as talent. IELTS passages on education often test whether readers can separate appearance from deeper value.`,
  },
  {
    id: 'phase1-campus-core-01',
    mode: 'core',
    theme: 'education-learning',
    subtheme: 'school roles and qualifications',
    style: 'ielts-reading',
    readingGoal: 'Practise institutional-role vocabulary in a moderate-density article.',
    title: 'Balanced Practice: People inside an Institution',
    targetWordIds: ['approach__noun', 'scheme__noun', 'headmaster__noun', 'principal__noun', 'dean__noun', 'faculty__noun', 'professor__noun', 'scientist__noun', 'mentor__noun', 'tutor__noun', 'assistant__noun', 'candidate__noun', 'degree__noun', 'qualify__verb', 'certify__verb', 'license__noun', 'permit__noun', 'diploma__noun'],
    content: `Every institution has a structure, but the names can vary. A headmaster or principal may lead a school, while a dean works with faculty members in a university. A professor, scientist, mentor, tutor, or assistant may all support learning, but their responsibilities differ.\n\nAssessment gives the structure consequences. A candidate may study for a degree, earn a diploma, or qualify for a professional license. In some fields, an authority must certify training before a person receives a permit to work.\n\nThe best approach is not always the most complex scheme. Effective institutions make roles clear so that students know where to find guidance. The vocabulary is practical because it appears frequently in passages about education systems and professional standards.`,
  },
  {
    id: 'phase1-campus-read-01',
    mode: 'read',
    theme: 'education-learning',
    subtheme: 'ceremony and student life',
    style: 'ielts-reading',
    readingGoal: 'Sustain reading with a light passage about student transitions.',
    title: 'Reading Habit: The Day of a Ceremony',
    targetWordIds: ['diplomat__noun', 'ambassador__noun', 'pupil__noun', 'graduate__noun', 'ceremony__noun', 'bachelor__noun', 'master__noun', 'fresher__noun', 'sophomore__noun'],
    content: `A graduation ceremony marks a quiet change in identity. A pupil who once entered as a fresher may leave as a graduate with a bachelor or master degree. The day is formal, but it is also personal, filled with families, photographs, and memories of difficult weeks.\n\nUniversities often invite an ambassador, diplomat, or public speaker to address the class. The speech may sound distant from daily study, yet it reminds students that education connects private effort with public responsibility.\n\nA sophomore watching from the audience may imagine a future version of the same day. This gentle passage supports reading stamina by following one moment slowly rather than presenting many abstract arguments.`,
  },
  {
    id: 'phase1-campus-core-02',
    mode: 'core',
    theme: 'education-learning',
    subtheme: 'registration and campus services',
    style: 'ielts-reading',
    readingGoal: 'Practise vocabulary about registration, housing, and campus data.',
    title: 'Balanced Practice: The First Week on Campus',
    targetWordIds: ['junior__noun', 'senior__noun', 'alumni__noun', 'orientation__noun', 'platform__noun', 'coed__adjective', 'register__verb', 'roster__noun', 'enrol__verb', 'matriculation__noun', 'accommodation__noun', 'dorm__noun', 'dining-hall__noun', 'canteen__noun', 'data__noun', 'quantity__noun', 'quality__noun', 'author__noun'],
    content: `The first week on campus is full of administrative language. New students register, enrol, and complete matriculation before they appear on the official roster. During orientation, a digital platform may provide data about courses, accommodation, the dorm system, the dining hall, and the canteen.\n\nOlder students also shape the experience. A junior may guide a fresher, a senior may explain academic expectations, and alumni may return to speak about career paths. In a coed institution, services are expected to support students with different needs.\n\nQuality matters more than quantity. A university can publish many notices, but the author of each message must make it clear and useful. IELTS passages on campus life often test whether readers understand how systems affect individual students.`,
  },
  {
    id: 'phase1-media-fast-01',
    mode: 'fast',
    theme: 'culture-media',
    subtheme: 'texts, records and reference systems',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover media, documentation, and classification vocabulary.',
    title: 'Fast Track: Texts, Records, and Categories',
    targetWordIds: ['tale__noun', 'fiction__noun', 'story__noun', 'diary__noun', 'poetry__noun', 'magazine__noun', 'journal__noun', 'coverage__noun', 'bibliography__noun', 'encyclopedia__noun', 'biography__noun', 'documentary__noun', 'series__noun', 'record__noun', 'file__noun', 'profile__noun', 'draft__noun', 'sketch__noun', 'brochure__noun', 'manual__noun', 'frame__noun', 'index__noun', 'catalogue__noun', 'category__noun', 'inventory__noun', 'content__noun', 'context__noun', 'list__noun', 'chapter__noun', 'volume__noun'],
    content: `Media vocabulary covers many forms of writing. A tale, fiction story, diary, poetry collection, magazine article, journal paper, biography, documentary, or series may all present information differently. Each form creates a frame that shapes what the reader expects.\n\nAcademic work depends on reference systems. A bibliography, encyclopedia, index, catalogue, inventory, list, chapter, and volume help readers locate content and understand context. A file, profile, record, draft, sketch, brochure, or manual may look ordinary, but each belongs to a category with its own purpose.\n\nGood IELTS reading requires attention to how information is organised. Coverage is not just the amount of material included; it is the way a writer selects, arranges, and explains evidence for a particular audience.`,
  },
  {
    id: 'phase1-academic-fast-01',
    mode: 'fast',
    theme: 'education-learning',
    subtheme: 'subjects and mathematical thinking',
    style: 'ielts-reading',
    readingGoal: 'Rapidly cover academic subject and mathematics vocabulary.',
    title: 'Fast Track: Subjects, Numbers, and Logic',
    targetWordIds: ['reel__noun', 'subject__noun', 'object__noun', 'major__noun', 'minor__noun', 'sociology__noun', 'politics__noun', 'accounting__noun', 'audit__noun', 'statistics__noun', 'psychology__noun', 'philosophy__noun', 'logic__noun', 'logistics__noun', 'geography__noun', 'history__noun', 'engineering__noun', 'mechanics__noun', 'electronics__noun', 'maths__noun', 'arithmetic__noun', 'geometry__noun', 'algebra__noun', 'calculus__noun', 'plus__preposition', 'sum__noun', 'total__adjective', 'merger__noun', 'equation__noun', 'identical__adjective'],
    content: `University study is organised by subject. A student may choose a major in sociology, politics, accounting, psychology, philosophy, geography, history, engineering, mechanics, electronics, or maths, while keeping a minor in a related field. Each discipline has its own object of study and its own logic.\n\nNumbers appear across these fields. Statistics can support an audit, logistics planning, or a political argument. Arithmetic begins with a sum, while geometry, algebra, and calculus help students solve an equation, compare identical results, and calculate a total. The word plus may introduce addition or simply mean an extra factor.\n\nAcademic reading also requires flexible interpretation. A merger in business, a reel of film in media studies, and a mechanical model in engineering all require different methods. The passage is dense because real academic language rarely stays inside one subject boundary.`,
  },
  {
    id: 'phase1-math-core-01',
    mode: 'core',
    theme: 'science-technology',
    subtheme: 'mathematical operations and variables',
    style: 'ielts-reading',
    readingGoal: 'Practise mathematical vocabulary in an accessible academic passage.',
    title: 'Balanced Practice: Why Equations Need Context',
    targetWordIds: ['minus__adjective', 'subtract__verb', 'multiply__verb', 'divide__verb', 'dividend__noun', 'remainder__noun', 'rational__noun', 'parameter__noun', 'variable__noun', 'even__adjective', 'odd__adjective', 'fraction__noun', 'decimal__adjective', 'ratio__noun', 'proportion__noun', 'graph__noun', 'chart__noun', 'logic__noun'],
    content: `Mathematics vocabulary is precise, but it becomes meaningful only in context. A teacher may ask students to subtract a minus value, multiply two numbers, divide a dividend, or explain why a remainder appears. An even number and an odd number behave differently in many patterns.\n\nMore advanced work introduces a variable, a parameter, a fraction, a decimal quantity, a ratio, and a proportion. These ideas help students interpret a graph or read a chart. The word rational can describe a type of number, while logic shapes the method used to solve a problem.\n\nIELTS passages may use mathematics to support social or scientific arguments. Readers do not need to be mathematicians, but they must understand how quantities are compared and why a small change in method can alter the conclusion.`,
  },

  {
    id: 'phase2-materials-fast-01',
    mode: 'fast',
    theme: 'science-technology',
    subtheme: 'materials, craft, and early industrial design',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style familiarity with materials, tools, and manufactured objects.',
    title: 'Fast Track: Materials That Shape Modern Objects',
    targetWordIds: ['shutter__noun', 'curtain__noun', 'pane__noun', 'opacity__noun', 'jar__noun', 'barrel__noun', 'bucket__noun', 'pail__noun', 'camera__noun', 'portable__adjective', 'spotlight__noun', 'lantern__noun', 'bulb__noun', 'flashlight__noun', 'vacuum__noun', 'fan__noun', 'switch__noun', 'mill__noun', 'forge__noun', 'alloy__noun', 'metal__noun', 'iron__noun', 'lead__noun', 'brass__noun', 'bronze__noun', 'cement__noun', 'lime__noun', 'plaster__noun', 'plastic__noun', 'fabric__noun'],
    content: `Archaeologists and design historians often argue that modern life is defined less by a single invention than by a gradual refinement of materials and everyday objects. A pane of glass behind a shutter or curtain, for example, controls light and opacity in ways that affect both privacy and climate control. Storage technologies also evolved slowly: a jar, barrel, bucket, or pail may appear simple, yet each reflects a different balance between portability, cost, and durability.

The same logic applies to lighting and observation. A lantern, bulb, flashlight, spotlight, or camera is not merely a tool; it is a response to a practical problem. Portable devices changed labour, travel, and domestic life, while a switch, fan, or vacuum system altered how people managed comfort and cleanliness indoors. In IELTS-style discussions of technology, these familiar objects often illustrate the wider idea that innovation is cumulative rather than sudden.

Industrial materials made this cumulative change possible. A mill could process raw inputs, while a forge transformed iron, lead, brass, or bronze into usable forms. The development of alloy production widened the range of mechanical properties available to engineers. Cement, lime, plaster, plastic, and fabric each supported a different branch of manufacturing, from housing to transport to consumer goods. The academic value of this vocabulary lies in its precision: once readers can name the material, they can follow the argument about why one solution replaced another.`,
  },
  {
    id: 'phase2-textiles-core-01',
    mode: 'core',
    theme: 'science-technology',
    subtheme: 'textiles, extraction, and material performance',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS passage about material performance and production chains.',
    title: 'Balanced Practice: From Fibre to Durable Goods',
    targetWordIds: ['fiber__noun', 'knit__verb', 'weave__verb', 'canvas__noun', 'linen__noun', 'cotton__noun', 'nylon__noun', 'lumber__noun', 'wooden__adjective', 'mine__noun', 'pit__noun', 'lubricate__verb', 'diamond__noun', 'crystal__noun', 'fragile__adjective', 'durable__adjective', 'available__adjective', 'miniature__adjective'],
    content: `Many academic passages about industry focus not on spectacular inventions but on the long chain between extraction and finished goods. A fibre may be knit or weave into a useful surface, while canvas, linen, cotton, and nylon each occupy a different place in the history of clothing, transport, and packaging. Material choice matters because performance requirements differ. A product expected to survive heavy use must be durable, whereas a decorative object may remain fragile despite its beauty.

Raw resources also shape the process. Lumber supports wooden construction, but minerals taken from a mine or open pit contribute to cutting tools, machinery, and precision devices. In manufacturing, workers may lubricate moving parts to reduce friction and extend the life of equipment. At the same time, miniature components sometimes depend on materials such as diamond or crystal because hardness and optical clarity can be more important than low cost.

The broader lesson is that technology advances when suitable materials become available at the right scale. Readers who understand this vocabulary can follow arguments about why one production system expands while another declines.`,
  },
  {
    id: 'phase2-design-read-01',
    mode: 'read',
    theme: 'culture-media',
    subtheme: 'consumer design and social taste',
    style: 'ielts-reading',
    readingGoal: 'Support sustained reading with a lower-density IELTS-style text about social taste and design change.',
    title: 'Reading Habit: How Trends Become Normal',
    targetWordIds: ['fashion__noun', 'style__noun', 'trend__noun', 'tendency__noun', 'current__noun__2', 'vogue__noun', 'prevail__verb', 'model__noun', 'icon__noun'],
    content: `Design researchers often note that consumers rarely choose objects for practical reasons alone. A style may become fashionable because it fits a broader trend in public taste, or because a particular model is promoted as a cultural icon. At first, such changes appear superficial. Over time, however, a tendency in clothing, furniture, or media can reshape the visual language of an entire period.

What begins as a short-lived vogue may later prevail as the current standard. This process is important in IELTS-style reading because it shows how personal preference connects with commerce, identity, and mass communication. The language is gentle here, but the underlying argument remains analytical: taste is social before it feels individual.

By following these words in context, learners can read more naturally without losing sight of the academic structure behind the passage.`,
  },
  {
    id: 'phase2-food-fast-01',
    mode: 'fast',
    theme: 'food-agriculture',
    subtheme: 'food systems, catering, and public dining',
    style: 'ielts-reading',
    readingGoal: 'Build fast, dense exposure to IELTS-style vocabulary about catering, food services, and eating habits.',
    title: 'Fast Track: Food Systems Beyond the Family Kitchen',
    targetWordIds: ['appetite__noun', 'treat__verb', 'cater__verb', 'provision__noun', 'edible__adjective', 'recipe__noun', 'restaurant__noun', 'cafeteria__noun', 'buffet__noun', 'barbecue__noun', 'supper__noun', 'banquet__noun', 'refreshment__noun', 'snack__noun', 'appetiser__noun', 'cuisine__noun', 'menu__noun', 'order__noun', 'takeaway__noun', 'gourmet__noun', 'vegetarian__noun', 'cutlery__noun', 'ceramic__adjective', 'porcelain__noun', 'bowl__noun', 'dish__noun', 'tray__noun', 'fork__noun', 'knife__noun', 'spoon__noun'],
    content: `Food studies in IELTS-style reading often examine eating as a social system rather than a private habit. Appetite is shaped by culture, income, and work schedules, so institutions must cater for large groups rather than simply treat meals as domestic events. The provision of edible food depends on supply chains, storage, and planning, while a recipe reflects both local history and resource availability.

This institutional perspective explains the vocabulary of public dining. A restaurant may serve gourmet cuisine to a narrow clientele, whereas a cafeteria or buffet aims for speed and scale. A banquet, barbecue, or formal supper carries different social meanings, but each still requires a menu, an order system, and some balance between cost and quality. Snack culture and takeaway meals show another side of the same issue: convenience can reshape diet just as strongly as tradition can.

Material culture matters too. Cutlery, a fork, knife, spoon, bowl, dish, or tray may appear secondary, yet they influence the rhythm of eating and the organisation of service. Ceramic and porcelain utensils reflect different histories of craft and status. The academic value of this dense passage is that it links food vocabulary to institutions, not only to taste.`,
  },
  {
    id: 'phase2-kitchen-core-01',
    mode: 'core',
    theme: 'health-biology',
    subtheme: 'kitchen technology and daily consumption',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS passage about domestic cooking and consumption habits.',
    title: 'Balanced Practice: The Technology of Everyday Consumption',
    targetWordIds: ['glass__noun', 'mug__noun', 'kettle__noun', 'pan__noun', 'pot__noun', 'stove__noun', 'furnace__noun', 'oven__noun', 'tin__noun', 'lid__noun', 'drink__verb', 'beverage__noun', 'juice__noun', 'coffee__noun', 'alcohol__noun', 'tobacco__noun', 'cigarette__noun', 'sober__adjective'],
    content: `Domestic technology is often overlooked because it appears ordinary. Yet the history of the kitchen reveals major changes in fuel use, health, and labour. A kettle, pan, pot, stove, oven, or even a larger furnace reflects a specific stage in the control of heat. Small objects such as a lid, tin container, glass, or mug also matter because they influence storage, hygiene, and convenience.

Consumption habits are shaped by these tools. People drink water, juice, coffee, or other beverage types within routines that are partly cultural and partly technological. Public health researchers often compare patterns of alcohol use with the social treatment of tobacco and the cigarette industry. In such discussions, the contrast between a sober lifestyle and a harmful one is rarely presented as a purely personal choice; it is tied to affordability, advertising, and social norms.

For IELTS learners, the passage demonstrates how concrete nouns can support an abstract argument about health and modern living.`,
  },
  {
    id:      'phase2-crops-fast-01',
      mode: 'core',
    theme: 'food-agriculture',
    subtheme: 'crop diversity, diet, and food preparation',
    style: 'ielts-reading',
    readingGoal: 'Deliver dense IELTS-style vocabulary about vegetables, preparation, and dietary variety.',
    title: 'Fast Track: Crop Diversity on the Modern Table',
    targetWordIds: ['vegetable__noun', 'tomato__noun', 'potato__noun', 'pea__noun', 'bean__noun', 'cucumber__noun', 'cabbage__noun', 'onion__noun', 'eggplant__noun', 'carrot__noun', 'turnip__noun', 'radish__noun', 'peel__verb', 'strip__verb', 'cherry__noun', 'berry__noun', 'grape__noun', 'slender__adjective'],
    content: `Nutrition researchers frequently argue that dietary quality depends on variety rather than abundance alone. A vegetable-rich diet may include tomato, potato, pea, bean, cucumber, cabbage, onion, eggplant, carrot, turnip, and radish, each contributing different textures and nutrients. In IELTS-style passages, such lists are not decorative; they show how agricultural diversity translates into everyday health.

Preparation matters as much as selection. People peel, strip, cut, or cook ingredients in ways that alter taste and storage life. The treatment of fruit such as cherry, berry, or grape can also affect sugar intake, market value, and transport requirements. Even a slender appearance associated with healthy eating may hide more complex realities about class, work, and food access.

By concentrating these nouns and verbs in one coherent passage, the article keeps an academic tone while still feeling grounded in familiar experience.`,
  },
  {
    id: 'phase2-housing-fast-01',
    mode: 'fast',
    theme: 'society-government',
    subtheme: 'housing patterns, migration, and urban form',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style familiarity with housing and settlement vocabulary.',
    title: 'Fast Track: Housing, Mobility, and the Shape of Settlement',
    targetWordIds: ['situated__adjective', 'locate__verb', 'reside__verb', 'inhabit__verb', 'migrate__verb', 'settle__verb', 'dwelling__noun', 'skyscraper__noun', 'villa__noun', 'mansion__noun', 'flat__noun', 'hostel__noun', 'lodge__verb', 'hut__noun', 'cabin__noun', 'cellar__noun', 'shed__noun', 'cottage__noun', 'shelter__noun', 'block__noun', 'grid__noun', 'aisle__noun', 'corridor__noun', 'stair__noun', 'staircase__noun', 'storey__noun', 'elevator__noun', 'escalator__noun', 'handrail__noun', 'column__noun'],
    content: `Housing is a central topic in academic reading because it connects migration, inequality, and urban planning. People may migrate for work, settle in a new district, and eventually reside in forms of housing that reflect both income and policy. A dwelling can range from a hut, cabin, cottage, or shelter to a flat in a high-rise block, a hostel for temporary residents, or a villa or mansion associated with wealth.

The physical organisation of buildings also shapes social life. A skyscraper depends on the safe movement of people across each storey, through a corridor, aisle, stair, staircase, elevator, or escalator. A handrail, column, cellar, or storage shed may seem minor in isolation, but such details reveal how design responds to density and risk. Grid-based planning often promises order, yet the lived experience of urban residents is more complex.

This IELTS-style passage treats housing as evidence of wider structural change. To locate or describe where people inhabit space is also to describe how societies distribute opportunity.`,
  },
  {
    id: 'phase2-architecture-core-01',
    mode: 'core',
    theme: 'culture-media',
    subtheme: 'public architecture and social use of space',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS passage about architecture and public life.',
    title: 'Balanced Practice: Reading Public Space as Social Evidence',
    targetWordIds: ['pillar__noun', 'vault__noun', 'arch__noun', 'ceiling__noun', 'eaves__noun', 'chimney__noun', 'reception__noun', 'lobby__noun', 'bench__noun', 'balcony__noun', 'lavatory__noun', 'toilet__noun', 'bath__noun', 'basin__noun', 'urban__adjective', 'peripheral__adjective', 'vicinity__noun', 'spacious__adjective'],
    content: `Architectural history often treats buildings as social documents. A pillar, arch, or vault can reveal how a community understood engineering, ceremony, and public display. More ordinary elements such as a ceiling, eaves, or chimney show how builders responded to climate and daily routine.

Modern public buildings add another layer. A reception area, lobby, bench, balcony, lavatory, toilet, bath, or basin is not simply functional; it reflects expectations about privacy, sanitation, and movement through shared space. The presence of spacious interiors in one district and limited facilities in a peripheral vicinity elsewhere may indicate unequal investment across an urban region.

IELTS-style reading often rewards learners who notice this shift from object to argument. The building is described precisely, but the real topic is social organisation.`,
  },
  {
    id: 'phase2-city-read-01',
    mode: 'read',
    theme: 'culture-media',
    subtheme: 'craft traditions in the city landscape',
    style: 'ielts-reading',
    readingGoal: 'Support sustained reading with a lighter passage about urban heritage and skilled labour.',
    title: 'Reading Habit: Old Craft in the Contemporary City',
    targetWordIds: ['plaza__noun', 'castle__noun', 'carpenter__noun', 'mason__noun', 'tile__noun', 'brickwork__noun', 'studio__noun', 'downtown__noun', 'complex__noun'],
    content: `In many cities, heritage survives not only in museums but in working streets. A plaza near the downtown district may stand beside an old castle, a renovated studio, or a newer office complex. At first, the mixture can seem accidental. On closer reading, however, the built environment reveals a long conversation between preservation and redevelopment.

Skilled labour remains central to that conversation. A carpenter and a mason contribute different forms of knowledge, whether they are repairing timber frames, replacing tile, or stabilising older brickwork. Their work gives historical continuity a practical form.

This lower-density passage keeps a calm rhythm while still sounding academic. The learner is invited to read slowly and notice how material detail supports a wider cultural argument.`,
  },
  {
    id: 'phase2-transport-fast-01',
    mode: 'fast',
    theme: 'science-technology',
    subtheme: 'water transport, risk, and engineering',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style vocabulary about transport engineering and maritime risk.',
    title: 'Fast Track: Transport on Water and the Logic of Risk',
    targetWordIds: ['brake__noun', 'tire__noun', 'crew__noun', 'captain__noun', 'wreck__verb', 'crash__verb', 'crush__verb', 'vanish__verb', 'disappear__verb', 'hazard__noun', 'harbour__noun', 'dock__noun', 'anchor__noun', 'submerge__verb', 'sailor__noun', 'carrier__noun', 'vessel__noun', 'ferry__noun', 'sail__verb', 'raft__noun', 'canoe__noun', 'oar__noun', 'deck__noun', 'turbine__noun', 'propeller__noun', 'stern__noun', 'embark__verb', 'channel__noun', 'canal__noun', 'ditch__noun'],
    content: `Transport studies often compare systems by speed, capacity, and risk. Maritime transport provides especially rich vocabulary because it combines engineering with environmental uncertainty. A vessel, carrier, or ferry must move through a harbour, dock, channel, or canal under conditions that can change quickly. Even a smaller raft or canoe depends on control, direction, and skilled labour from the sailor or crew, while the captain carries formal responsibility for decisions.

The language of risk emerges when systems fail. A ship may crash into a structure, wreck itself on hidden rock, or crush equipment during a storm. Cargo can vanish from records, passengers may disappear from communication systems, and whole vehicles may submerge after a serious incident. In such moments, a hazard is not abstract; it becomes a chain of material events.

Engineering vocabulary helps explain prevention. The deck, stern, anchor, turbine, propeller, brake systems on land vehicles, and even the condition of a tire all remind readers that transport safety depends on maintenance. To embark safely is to trust a network of technical decisions, not only the visible journey.`,
  },
  {
    id: 'phase2-logistics-core-01',
    mode: 'core',
    theme: 'economy-business',
    subtheme: 'rail systems and delivery networks',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS passage about rail and delivery systems.',
    title: 'Balanced Practice: Why Logistics Depends on Timing',
    targetWordIds: ['railroad__noun', 'railway__noun', 'locomotive__noun', 'subway__noun', 'underground__adjective', 'tunnel__noun', 'rail__noun', 'arrive__verb', 'destination__noun', 'delay__noun', 'postpone__verb', 'defer__verb', 'mail__noun', 'packet__noun', 'package__noun', 'load__verb', 'transfer__verb', 'deliver__verb'],
    content: `Modern logistics depends on coordination across systems that appear separate to the casual observer. A railroad or railway network moves bulk cargo over distance, while a subway or other underground system supports dense urban mobility. Yet both depend on the same basic principles: track reliability, tunnel safety, and the disciplined movement of each locomotive along the rail.

Timing is the second principle. A shipment must arrive at its destination when expected, or the resulting delay may force firms to postpone production or defer sales. This is why delivery vocabulary matters. Mail, packet, and package flows are all part of the same temporal problem, especially when warehouses need workers to load, transfer, and finally deliver goods with minimal waste.

The IELTS-style value of the passage lies in its argument structure. Technical nouns are introduced not as isolated labels but as evidence for a broader claim about synchronisation in modern economies.`,
  },
  {
    id: 'phase2-government-fast-01',
    mode: 'fast',
    theme: 'society-government',
    subtheme: 'political systems and institutional power',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style familiarity with government and political-institution vocabulary.',
    title: 'Fast Track: Institutions, Power, and Public Decision-Making',
    targetWordIds: ['regime__noun', 'authority__noun', 'political__adjective', 'hierarchy__noun', 'democracy__noun', 'bureaucracy__noun', 'revolution__noun', 'reform__verb', 'municipal__adjective', 'neutral__adjective', 'bilateral__adjective', 'president__noun', 'premier__noun', 'minister__noun', 'secretary__noun', 'parliament__noun', 'senate__noun', 'conference__noun', 'delegation__noun', 'mayor__noun', 'administration__noun', 'dominate__verb', 'power__noun', 'influence__noun', 'organization__noun', 'association__noun', 'union__noun', 'consortium__noun', 'institution__noun', 'global__adjective'],
    content: `Political analysis in IELTS reading rarely focuses on ideology alone. It often asks how a regime maintains authority, how a hierarchy is justified, and why some institutions gain influence while others decline. Democracy and bureaucracy are not merely labels; they describe different ways of organising power, procedure, and accountability. A revolution may overturn one system, but long-term stability usually depends on whether reform follows.

Institutional vocabulary gives this process concrete form. A president, premier, minister, secretary, mayor, parliament, or senate occupies a specific place within an administration. At the international level, a conference, delegation, bilateral agreement, or global organization may reshape local outcomes. Even the claim that a body is neutral can itself become politically contested.

The passage becomes denser when readers consider scale. A municipal office, a professional association, a labour union, a research consortium, and a public institution may all compete to dominate discussion. The academic point is that political life is distributed across organizations rather than contained within a single office.`,
  },
  {
    id: 'phase2-society-core-01',
    mode: 'core',
    theme: 'society-government',
    subtheme: 'migration, citizenship, and demographic change',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS passage about migration, citizenship, and social identity.',
    title: 'Balanced Practice: Migration and the Meaning of Belonging',
    targetWordIds: ['nation__noun', 'worldwide__adjective', 'federal__adjective', 'foreign__adjective', 'abroad__adverb', 'civil__adjective', 'emigrate__verb', 'immigrate__verb', 'colony__noun', 'liberty__noun', 'independence__noun', 'slum__noun', 'refuge__noun', 'asylum__noun', 'demographic__adjective', 'resident__noun', 'ethnic__adjective', 'racial__adjective'],
    content: `Migration changes how a nation understands itself. People may emigrate because opportunity is limited, or immigrate in search of safety, education, and work. In either direction, the movement is shaped by law, memory, and unequal access to resources. IELTS-style passages often connect these personal journeys to wider historical patterns such as empire, colony, liberty movements, and struggles for independence.

The social consequences are uneven. A new resident may be welcomed as part of a dynamic, worldwide economy, yet still encounter foreignness in daily life. In federal systems, civil rights may be protected in principle while housing and labour markets remain sharply divided. A slum, a refugee settlement, or an asylum centre can therefore become evidence of structural failure rather than temporary inconvenience.

Demographic change also raises difficult questions about ethnic and racial identity. The best academic writing avoids easy moral slogans and instead shows how belonging is negotiated through policy, memory, and material conditions.`,
  },
  {
    id: 'phase2-civics-read-01',
    mode: 'read',
    theme: 'society-government',
    subtheme: 'public opinion and electoral participation',
    style: 'ielts-reading',
    readingGoal: 'Support sustained reading with a lighter IELTS-style passage about polls and public choice.',
    title: 'Reading Habit: How Public Opinion Becomes Measurable',
    targetWordIds: ['elect__verb', 'respondent__noun', 'poll__noun', 'ambition__noun', 'nominate__verb', 'preference__noun', 'guideline__noun', 'proposal__noun', 'clarify__verb'],
    content: `Democratic systems depend not only on voting day but on the quieter routines that prepare people to choose. A respondent in a public poll may express a preference long before a formal election begins. Researchers then try to clarify whether those answers reflect stable judgement, temporary emotion, or incomplete information.

Political actors work within the same uncertainty. Parties nominate candidates, publish a proposal, and appeal to public ambition by promising change or security. Electoral guidelines attempt to keep the process fair, but interpretation always matters.

This passage is intentionally calm and readable. Even so, it follows an academic pattern: a familiar event is used to reveal a deeper question about how public opinion becomes measurable.`,
  },
  {
    id: 'phase2-economy-fast-01',
    mode: 'fast',
    theme: 'economy-business',
    subtheme: 'consumer markets and commercial exchange',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style familiarity with retail, taxation, and commercial vocabulary.',
    title: 'Fast Track: The Language of Consumer Exchange',
    targetWordIds: ['merchant__noun', 'financial__adjective', 'fund__verb', 'donate__verb', 'endow__verb', 'commercial__adjective', 'advertise__verb', 'slogan__noun', 'purchase__noun', 'lease__noun', 'afford__verb', 'retail__noun', 'grocery__noun', 'discount__noun', 'promotion__noun', 'voucher__noun', 'coupon__noun', 'currency__noun', 'exchange__noun', 'receipt__noun', 'invoice__noun', 'tax__noun', 'levy__noun', 'tariff__noun', 'duty__noun', 'impose__verb', 'consume__verb', 'spend__verb', 'cost__verb', 'expense__noun'],
    content: `Consumer economies run on language as much as on goods. A merchant must advertise products, shape a slogan, and persuade buyers that a purchase is worth the expense. Households, meanwhile, decide whether they can afford to buy, lease, or delay consumption. IELTS-style passages often use this vocabulary to show that markets are systems of judgement rather than automatic mechanisms.

Retail environments make the system visible. A grocery chain may attract customers through discount campaigns, promotion events, vouchers, or coupons, but the apparent simplicity of a lower price hides a complex financial structure. Currency exchange, imported goods, and transport costs all influence the final figure on a receipt or invoice. Governments further shape the outcome when they impose a tax, levy, tariff, or customs duty.

The academic interest of this dense passage lies in its causal chain. Consumers spend money in particular ways, yet each individual act is linked to commercial policy, institutional funding, and wider patterns of exchange.`,
  },
  {
    id: 'phase2-markets-fast-02',
    mode: 'fast',
    theme: 'economy-business',
    subtheme: 'economic cycles, expansion, and contraction',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style vocabulary about growth, recession, and market change.',
    title: 'Fast Track: Reading the Movement of Markets',
    targetWordIds: ['revenue__noun', 'gross__adjective', 'recession__noun', 'depression__noun', 'crisis__noun', 'security__noun', 'bond__noun', 'debt__noun', 'deficit__noun', 'inflation__noun', 'deflation__noun', 'dwindle__verb', 'decrease__noun', 'downsize__verb', 'decline__verb', 'diminish__verb', 'reduce__verb', 'increase__noun', 'increment__noun', 'growth__noun', 'escalate__verb', 'expand__verb', 'influx__noun', 'affluent__adjective', 'enrich__verb', 'sufficient__adjective', 'adequate__adjective', 'saving__noun', 'lack__noun', 'redundant__adjective'],
    content: `Economic writing often appears difficult because it compresses many forms of movement into a small set of nouns and verbs. Revenue may rise, gross output may expand, and growth may continue through a steady increment. Yet the same system can enter recession, depression, or wider crisis when debt, deficit, and falling demand weaken confidence. In IELTS-style reading, the challenge is to follow the direction of change with precision.

Financial vocabulary helps map that direction. Inflation and deflation describe opposing pressures, while a bond market may become a source of security for some investors and anxiety for others. Firms facing weak demand may downsize operations, reduce spending, or declare staff redundant. Wealth can dwindle, decline, or diminish even when official figures remain superficially adequate.

Expansion is equally uneven. An affluent region may be enriched by capital influx, but the underlying system still depends on sufficient savings and productive investment. The academic point is not that markets always move in one direction, but that each stage has its own language of explanation.`,
  },
  {
    id: 'phase2-business-core-01',
    mode: 'core',
    theme: 'economy-business',
    subtheme: 'firms, trade, and commercial reliability',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS passage about firms, goods, and commercial trust.',
    title: 'Balanced Practice: What Makes a Business Reliable',
    targetWordIds: ['firm__noun', 'enterprise__noun', 'agent__noun', 'entity__noun', 'invest__verb', 'input__noun', 'product__noun', 'acquisition__noun', 'goods__noun', 'cargo__noun', 'insure__verb', 'guarantee__verb', 'reliable__adjective', 'negotiation__noun', 'sale__noun', 'wholesale__noun', 'transaction__noun', 'turnover__noun'],
    content: `A business becomes credible not simply by making a product, but by sustaining trust across a chain of exchange. A firm or larger enterprise may operate as one legal entity, yet it still depends on agents, suppliers, investors, and customers. Input quality shapes production, while acquisition strategy determines whether a company grows through innovation or purchase.

Trade vocabulary reveals how fragile this system can be. Goods and cargo must move safely, sales must be recorded accurately, and every transaction must be clear enough to survive scrutiny. In wholesale markets, small errors can multiply quickly through turnover and inventory systems. For that reason, successful businesses often insure shipments, guarantee minimum standards, and treat reliability as an economic asset rather than a moral extra.

The IELTS-style passage uses familiar commercial words to support a broader claim: modern business rests on organised confidence.`,
  },
  {
    id: 'phase2-work-core-02',
    mode: 'core',
    theme: 'economy-business',
    subtheme: 'labour markets, wages, and incentives',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS passage about labour, wages, and incentives.',
    title: 'Balanced Practice: Why People Work under Different Conditions',
    targetWordIds: ['accelerate__verb', 'prompt__verb', 'salary__noun', 'income__noun', 'wage__noun', 'payment__noun', 'refund__noun', 'reimburse__verb', 'payroll__noun', 'remuneration__noun', 'subsidy__noun', 'earn__verb', 'undertaking__noun', 'profession__noun', 'occupation__noun', 'job__noun', 'vocation__noun', 'workforce__noun'],
    content: `Labour markets are shaped by more than personal ambition. People enter a profession, occupation, or job under conditions defined by pay, security, and status. A vocation may carry moral meaning, but workers still need salary, wage, income, or other forms of remuneration to earn a stable living. IELTS-style passages often explore how these motives overlap rather than compete.

Institutions influence the outcome at every stage. A payroll system determines when payment arrives, whether costs are reimbursed, and how quickly an error produces a refund. Governments may offer a subsidy to accelerate training in shortage sectors or prompt firms to hire in weaker regions. Even a small undertaking can reshape the local workforce when incentives are targeted carefully.

The academic value of the passage lies in its explanation of structure. Employment is not only about individual choice; it is organised through financial systems that reward some forms of work more than others.`,
  },
  {
    id: 'phase2-employment-read-01',
    mode: 'read',
    theme: 'education-learning',
    subtheme: 'hiring and separation in modern workplaces',
    style: 'ielts-reading',
    readingGoal: 'Support sustained reading with a lighter IELTS-style passage about recruitment and employment change.',
    title: 'Reading Habit: The Quiet Drama of Recruitment',
    targetWordIds: ['personnel__noun', 'clerk__noun', 'interview__noun', 'employ__verb', 'hire__verb', 'fire__verb', 'lay-off__noun', 'dismiss__verb', 'resign__verb'],
    content: `Recruitment is often described as routine, but for individuals it can feel intensely uncertain. A personnel office may begin with paperwork handled by a clerk, then move applicants toward an interview in which small impressions carry large consequences. The language of employment appears simple, yet each verb marks a major change in a person’s life.

To employ or hire someone is to make a judgement about future value. To fire, dismiss, or accept a resignation is to end that judgement under new conditions. A lay-off adds another layer by showing how economic pressure can break the connection between good performance and continued work.

This lower-density passage keeps the rhythm readable while preserving an IELTS-style focus on systems rather than anecdote.`,
  },
  {
    id: 'phase2-law-fast-01',
    mode: 'fast',
    theme: 'society-government',
    subtheme: 'rules, institutions, and legal standards',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style familiarity with law, standards, and institutional regulation.',
    title: 'Fast Track: The Language of Rules and Rights',
    targetWordIds: ['legal__adjective', 'rule__noun', 'regulation__noun', 'treaty__noun', 'agreement__noun', 'protocol__noun', 'norm__noun', 'benchmark__noun', 'criteria__noun', 'standard__noun', 'permit__verb', 'allow__verb', 'admission__noun', 'enforce__verb', 'default__verb', 'reject__verb', 'constraint__noun', 'official__adjective', 'mandatory__adjective', 'obligation__noun', 'court__noun', 'enact__verb', 'legislate__verb', 'equity__noun', 'fair__adjective', 'just__adjective', 'prejudice__noun', 'discrimination__noun', 'accuse__verb', 'sue__verb'],
    content: `Legal language can seem abstract until readers recognise that it describes the rules of ordinary life. A regulation, treaty, agreement, or protocol defines how institutions should act, while a norm, benchmark, criterion, or standard provides a measure for judging conduct. In IELTS-style reading, these terms often appear together because modern governance depends on layered systems rather than one simple rule.

Rights exist within the same framework. Authorities may permit or allow access, grant admission, or reject an application under official procedure. Some obligations are mandatory because they protect public welfare, while others become disputed constraints when different groups interpret fairness differently. Courts then enforce the enacted law and decide whether discrimination, prejudice, or unequal treatment has occurred.

The densest part of the passage appears when morality and law overlap. A system may claim to be fair and just, yet still accuse or sue people through rules that reproduce inequality. To legislate is therefore not only to create order, but to choose what kind of order a society will recognise as legitimate.`,
  },
  {
    id: 'phase2-justice-fast-02',
    mode: 'fast',
    theme: 'society-government',
    subtheme: 'justice systems, evidence, and public trust',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style vocabulary about investigation, trial, and public trust in justice systems.',
    title: 'Fast Track: Justice, Evidence, and Public Confidence',
    targetWordIds: ['prosecute__verb', 'condemn__verb', 'complain__verb', 'boycott__noun', 'appeal__verb', 'persuade__verb', 'controversy__noun', 'investigate__verb', 'witness__noun', 'justify__verb', 'reasonable__adjective', 'suitable__adjective', 'judge__noun', 'jury__noun', 'trial__noun', 'suspect__noun', 'sentence__noun', 'arrest__verb', 'jail__noun', 'prison__noun', 'oversee__verb', 'supervise__verb', 'restrict__verb', 'restrain__verb', 'commit__verb', 'bribe__noun', 'deceive__verb', 'cheat__verb', 'fraud__noun', 'procedure__noun'],
    content: `Public trust in justice depends on procedure as much as on punishment. When authorities investigate a case, they rely on the witness, the suspect, and the interpretation of evidence long before a trial begins. A judge or jury must then decide whether the accused committed a serious wrong, whether the prosecution can justify its claims, and whether the process appears reasonable to the wider public.

The system becomes fragile when controversy grows. Citizens may complain, organise a boycott, or appeal a decision if they believe the court has failed to supervise officials properly. A sentence involving jail or prison may be legally valid yet socially contested, especially where bribery, fraud, deception, or cheating have undermined confidence.

This dense IELTS-style passage highlights a central argument: justice is not sustained by force alone. Institutions must oversee themselves, restrain arbitrary power, and persuade the public that legal outcomes are suitable as well as lawful.`,
  },

  {
    id: 'phase3-psychology-fast-01',
    mode: 'fast',
    theme: 'health-biology',
    subtheme: 'attention, desire, and cognitive bias',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style familiarity with psychology vocabulary about attention, desire, and judgement.',
    title: 'Fast Track: Why the Mind Fixates on Certain Ideas',
    targetWordIds: ['attract__verb', 'obsess__verb', 'mesmerize__verb', 'amaze__verb', 'marvel__verb', 'astonish__verb', 'involve__verb', 'bewilder__verb', 'irony__noun', 'contempt__noun', 'neglect__verb', 'disregard__verb', 'ignorance__noun', 'bias__verb', 'allure__verb', 'induce__verb', 'tempt__verb', 'convince__verb', 'reassure__verb', 'aspire__verb', 'desire__noun', 'attempt__verb', 'strive__verb', 'effort__noun', 'fulfil__verb', 'objective__noun', 'attitude__noun', 'character__noun', 'personality__noun', 'trait__noun'],
    content: `Psychology research often begins with a simple question: why do some ideas attract attention while others are ignored? Advertisers, educators, and political strategists all rely on the fact that people can become fascinated by a message, only to obsess over it later. An image may mesmerize viewers, a surprising claim may amaze or astonish them, and an emotionally loaded narrative may involve them so deeply that they struggle to evaluate it with distance.

This pattern becomes more complex when judgement enters the picture. Irony, contempt, and prior attitude all shape interpretation. People may neglect evidence, disregard inconvenient detail, or remain trapped in ignorance when a prior belief is strong enough. Researchers describe this distortion not simply as error, but as a form of bias that can be induced by design, social pressure, or selective exposure. The allure of certainty may tempt individuals to accept an explanation long before the facts justify it.

At the same time, psychological life is not purely negative. People aspire to goals, invest effort, and strive to fulfil an objective that matters to them. A leader may try to convince others, while a teacher may reassure anxious students and redirect desire toward longer-term growth. In that sense, personality, character, and stable personal traits do not determine behaviour completely; they interact with context. This is why IELTS-style passages on psychology often move from individual feeling to broader systems of influence.`,
  },
  {
    id: 'phase3-cognition-core-01',
    mode: 'core',
    theme: 'health-biology',
    subtheme: 'memory, perception, and mental classification',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS-style passage about memory, perception, and mental processing.',
    title: 'Balanced Practice: How Memory Shapes Perception',
    targetWordIds: ['recall__verb', 'remind__verb', 'repeat__verb', 'impress__verb', 'distinguish__verb', 'differentiate__verb', 'mood__noun', 'emotion__noun', 'manner__noun', 'mind__noun', 'mental__adjective', 'stimulus__noun', 'habit__noun', 'sense__noun', 'view__noun', 'visual__adjective', 'visible__adjective', 'vague__adjective'],
    content: `Cognitive research suggests that perception is never entirely fresh. The mind uses earlier experience to organise new information, which is why one stimulus can produce different responses in different people. A sound, an image, or a social signal may remind one person of a prior event, while another struggles to recall any connection at all. When information is repeated, it can impress itself more deeply on memory, even if the content remains weak.

This process matters because the brain must distinguish between signals constantly. To differentiate what is relevant from what is distracting is a central mental task. Yet the result is influenced by mood, emotion, habit, and social manner. A visual cue may be visible to everyone in the room, but its meaning is not equally clear. In some experiments, participants report only a vague sense that something has changed, even when the object is present in full view.

The IELTS-style importance of this topic lies in its method. Rather than treating memory as passive storage, the passage shows it as an active system for classification. Readers therefore encounter concrete vocabulary while following a broader argument about how human perception is structured.`,
  },
  {
    id: 'phase3-public-health-fast-01',
    mode: 'fast',
    theme: 'health-biology',
    subtheme: 'disease burden and public health systems',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style vocabulary about illness, injury, and public health systems.',
    title: 'Fast Track: How Public Health Measures Disease Burden',
    targetWordIds: ['immune__adjective', 'symptom__noun', 'illness__noun', 'detriment__noun', 'overweight__adjective', 'hypertension__noun', 'insomnia__noun', 'allergy__noun', 'cancer__noun', 'stroke__noun', 'flu__noun', 'fever__noun', 'headache__noun', 'injure__verb', 'injury__noun', 'bleed__verb', 'bruise__noun', 'scar__noun', 'wound__noun', 'trauma__noun', 'pain__noun', 'fatigue__noun', 'hygiene__noun', 'fitness__noun', 'clinic__noun', 'physician__noun', 'surgeon__noun', 'operation__noun', 'prescription__noun', 'precaution__noun'],
    content: `Public health writing differs from personal medical advice because it examines patterns across populations rather than a single patient. Researchers ask which symptom appears first, how often a particular illness recurs, and what long-term detriment follows when treatment arrives too late. Conditions such as overweight-related disease, hypertension, insomnia, allergy, cancer, stroke, flu, fever, and chronic headache are therefore analysed not only as biological events but also as policy challenges.

The same analytical approach applies to physical injury. A person may be injured in transport, work, or domestic accidents, then bleed, develop a wound, and later carry a bruise or scar. In more severe cases, trauma and lingering pain can reduce mobility for months, while fatigue weakens recovery. The academic value of this vocabulary is that it connects bodily experience to institutional response.

That response depends on systems. Hygiene campaigns, preventive fitness programmes, local clinics, and access to a physician or surgeon all influence outcomes. Where necessary, an operation and formal prescription may follow, but good policy emphasises precaution before emergency care becomes the only option. For IELTS learners, this kind of passage is useful because it combines medical detail with an argument about prevention, access, and social cost.`,
  },
  {
    id: 'phase3-medicine-core-01',
    mode: 'core',
    theme: 'health-biology',
    subtheme: 'treatment systems and medical intervention',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS-style passage about treatment systems and medical intervention.',
    title: 'Balanced Practice: Treatment, Isolation, and the Logic of Care',
    targetWordIds: ['therapy__noun', 'sanitary__adjective', 'curative__adjective', 'cure__verb', 'heal__verb', 'check__verb', 'transplant__verb', 'x-ray__noun', 'injection__noun', 'vaccinate__verb', 'quarantine__verb', 'segregate__verb', 'isolate__verb', 'pharmacy__noun', 'medicine__noun', 'remedy__noun', 'drug__noun', 'dose__noun'],
    content: `Modern medicine relies on a chain of decisions rather than a single dramatic cure. A patient may enter therapy after an initial check, receive an X-ray or laboratory test, and then move toward medicine-based treatment only if the evidence supports it. Some interventions are clearly curative, while others mainly manage symptoms and support healing over time.

Public health systems become especially important when infection risk rises. Authorities may vaccinate vulnerable groups, quarantine exposed individuals, or isolate confirmed cases in order to slow transmission. In older systems, officials sometimes segregated the sick more harshly, but contemporary policy is more likely to justify separation through sanitary control and measurable epidemiological benefit.

The remaining vocabulary belongs to access and dosage. A pharmacy distributes medicine, remedy options, and regulated drug supplies, while clinicians determine the correct dose for each case. At the high end of intervention, specialists may transplant tissue or whole organs, reminding readers that health care ranges from the routine to the technically extraordinary. This IELTS-style passage uses precise medical nouns to support a broader claim: good care depends on systems of evidence, containment, and follow-up.`,
  },
  {
    id: 'phase3-governance-fast-01',
    mode: 'fast',
    theme: 'society-government',
    subtheme: 'policy implementation and institutional coordination',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style vocabulary about implementation, coordination, and institutional control.',
    title: 'Fast Track: Why Policies Fail in Implementation',
    targetWordIds: ['intervene__verb', 'impede__verb', 'designate__verb', 'assign__verb', 'distribute__verb', 'detach__verb', 'exclude__verb', 'assure__verb', 'undertake__verb', 'stipulate__verb', 'uphold__verb', 'contain__verb', 'verify__verb', 'specify__verb', 'attribute__verb', 'replace__verb', 'substitute__verb', 'integrate__verb', 'implement__verb', 'monitor__verb', 'coordinate__verb', 'cooperate__verb', 'collaborate__verb', 'restrict__verb', 'protocol__noun', 'benchmark__noun', 'criteria__noun', 'standard__noun', 'official__adjective', 'mandatory__adjective'],
    content: `Policy debates often sound persuasive at the planning stage, yet many reforms fail once implementation begins. Governments may intervene to solve a problem, but the result can be impeded by weak administration, unclear responsibility, or poor coordination between agencies. A policy must therefore do more than announce an intention. It has to designate authority, assign duties, distribute resources, and specify how success will be measured.

Institutional language becomes especially important at this stage. Officials stipulate the protocol, define a benchmark, publish criteria, and announce the standard that each office must uphold. If agencies cannot verify results or contain emerging failures, the original plan may need to be replaced or partly substituted by a more realistic model. Some systems try to integrate services so that departments cooperate rather than work in isolation, but this requires sustained collaboration rather than symbolic agreement.

The passage also highlights the tension between flexibility and control. Official rules may appear too restrictive, while mandatory procedures can exclude local variation that might actually help. Nevertheless, without monitoring and shared standards, institutions struggle to assure the public that reform is real. This is why IELTS-style passages on governance often focus less on ideals than on whether systems can actually deliver what they promise.`,
  },
  {
    id: 'phase3-crisis-core-01',
    mode: 'core',
    theme: 'environment-climate',
    subtheme: 'crisis response and environmental recovery',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS-style passage about environmental crisis response and recovery.',
    title: 'Balanced Practice: Responding to Slow-Moving Environmental Crises',
    targetWordIds: ['rescue__verb', 'restore__verb', 'rectify__verb', 'offset__verb', 'replenish__verb', 'leak__verb', 'spill__verb', 'seep__verb', 'evacuate__verb', 'saturate__verb', 'trigger__verb', 'seek__verb', 'retrieve__verb', 'testify__verb', 'adverse__adjective', 'unstable__adjective', 'ongoing__adjective', 'reasonable__adjective'],
    content: `Environmental crises are often imagined as sudden disasters, yet many unfold slowly enough to confuse the public response. A chemical leak may begin quietly, a contaminated spill may seep into soil, and saturated ground may trigger an unstable chain of consequences before authorities decide to evacuate nearby residents. In such cases, the central challenge is not recognition alone but timing.

Recovery requires several different actions that are often mistaken for one another. Emergency teams may rescue people first, but the longer process is to retrieve lost infrastructure, restore damaged systems, and rectify the institutional failures that allowed the crisis to expand. Governments may try to offset immediate harm through compensation, while environmental agencies attempt to replenish water, soil quality, or ecological stability over time.

Evidence plays a crucial role throughout. Monitoring records may testify to the scale of the event, while researchers seek patterns that explain why the damage persisted. A reasonable policy response therefore combines urgent action with an ongoing plan for repair. IELTS-style passages on crisis management often reward readers who can distinguish between the short-term language of rescue and the long-term language of restoration.`,
  },
  {
    id: 'phase3-social-behaviour-fast-01',
    mode: 'fast',
    theme: 'society-government',
    subtheme: 'social trust, anxiety, and group behaviour',
    style: 'ielts-reading',
    readingGoal: 'Build dense IELTS-style vocabulary about social trust, anxiety, stereotyping, and collective behaviour.',
    title: 'Fast Track: Social Trust under Pressure',
    targetWordIds: ['tolerance__noun', 'stereotype__noun', 'anxiety__noun', 'restless__adjective', 'uneasy__adjective', 'fear__noun', 'skeptical__adjective', 'hesitate__verb', 'confuse__verb', 'regret__noun', 'arbitrary__adjective', 'careless__adjective', 'rigid__adjective', 'stubborn__adjective', 'impulse__noun', 'hostile__adjective', 'volatile__adjective', 'excessive__adjective', 'doubt__noun', 'suspicion__noun', 'confidence__noun', 'sympathetic__adjective', 'thoughtful__adjective', 'considerate__adjective', 'honesty__noun', 'sincere__adjective', 'trustworthy__adjective', 'mutual__adjective', 'similar__adjective', 'concern__noun'],
    content: `Social trust is easiest to value when it begins to disappear. In periods of uncertainty, communities often become restless, uneasy, and more vulnerable to fear. A population that once showed tolerance may fall back on stereotype, suspicion, and rigid social assumptions, especially when public information is incomplete. At such moments, people hesitate, confuse rumour with evidence, and act from impulse rather than reflection.

This shift has political as well as psychological consequences. Public debate can become hostile, volatile, and excessive, while arbitrary decisions deepen doubt instead of restoring confidence. Careless communication by leaders may later produce collective regret, not because citizens are irrational, but because institutions failed to create stable conditions for judgement.

The academic response to this problem is not sentimental. Researchers ask what social qualities actually support durable cooperation. Mutual respect, thoughtful dialogue, considerate leadership, honesty, sincerity, and trustworthy procedure all matter, especially when groups that appear similar on the surface still hold different fears and expectations. IELTS-style passages on social behaviour often use this vocabulary to explain why trust is not a private emotion but a public resource.`,
  },
  {
    id: 'phase3-time-history-core-01',
    mode: 'core',
    theme: 'culture-media',
    subtheme: 'historical periodisation and temporal framing',
    style: 'ielts-reading',
    readingGoal: 'Practise a moderate-density IELTS-style passage about historical periodisation and temporal framing.',
    title: 'Balanced Practice: How Historians Divide Time',
    targetWordIds: ['annual__adjective', 'yearly__adjective', 'anniversary__noun', 'era__noun', 'present__adjective', 'contemporary__adjective', 'medieval__adjective', 'century__noun', 'millennium__noun', 'dawn__noun', 'midday__noun', 'midnight__noun', 'overnight__adverb', 'recent__adjective', 'prior__adjective', 'former__adjective', 'preceding__adjective', 'precedent__noun'],
    content: `Historians do not simply describe the past; they divide it into meaningful units. Terms such as era, century, and millennium allow writers to organise vast stretches of time into manageable interpretations. Yet these divisions are never neutral. To describe a society as medieval, contemporary, recent, former, or present is already to frame it in relation to a particular narrative.

Smaller units matter as well. Annual and yearly records, public anniversaries, and institutional reports often shape how later generations remember change. In some texts, metaphors such as the dawn of a movement, the midday of an empire, or the midnight of a crisis carry rhetorical force even though they are not literal chronology. Likewise, the idea that a transformation happened overnight can hide a much slower process whose roots lie in prior or preceding developments.

This is why precedent matters in historical argument. A political or cultural event rarely begins from nothing; it emerges within patterns already established. The IELTS-style value of this passage is that it teaches learners to read temporal vocabulary critically, not just literally.`,
  },
  {
    id: 'phase3-research-read-01',
    mode: 'read',
    theme: 'education-learning',
    subtheme: 'research process and academic sequencing',
    style: 'ielts-reading',
    readingGoal: 'Support sustained reading with a lighter IELTS-style passage about research sequencing and academic process.',
    title: 'Reading Habit: The Rhythm of Research Work',
    targetWordIds: ['initially__adverb', 'meanwhile__adverb', 'simultaneous__adjective', 'ongoing__adjective', 'permanent__adjective', 'finally__adverb', 'moment__noun', 'minute__noun', 'immediately__adverb'],
    content: `Academic research often appears linear when described in a final paper, but the lived process is less tidy. A project may initially begin with one question, while related concerns emerge meanwhile from field notes, interviews, or laboratory anomalies. Several tasks can become simultaneous even when the official timeline suggests a neat order.

The pace of work also varies. Some discoveries appear immediately, while others require a long ongoing effort in which no single moment or minute seems decisive. Findings that look permanent may later need revision once stronger evidence appears.

This lower-density passage reflects an important academic lesson: research is orderly in presentation, but iterative in reality. By reading these sequencing words in context, learners gain a more natural feel for how serious writing organises time.`,
  },

  {
    id: 'fast-only-weather-01',
    mode: 'fast',
    theme: 'environment-climate',
    subtheme: 'storm systems and regional geography',
    style: 'ielts-reading',
    readingGoal: 'Maximise Fast Vocabulary coverage for weather, landform, and environmental hazard terms in a readable IELTS-style passage.',
    title: 'Fast Vocabulary: Storm Systems and Regional Geography',
    targetWordIds: ['oxygen__noun', 'oxide__noun', 'hydrogen__noun', 'magnet__noun', 'marine__adjective', 'stream__noun', 'shiver__verb', 'thunder__noun', 'lightning__noun', 'stormy__adjective', 'downpour__noun', 'sprinkle__verb', 'rainbow__noun', 'shower__noun', 'celsius__adjective', 'forecast__noun', 'peak__noun', 'mount__verb', 'range__noun', 'ridge__noun', 'slope__verb', 'valley__noun', 'hillside__noun', 'overlook__verb', 'southern__adjective', 'southeast__noun', 'southwest__noun', 'northeast__noun', 'northwest__noun', 'eastern__adjective', 'oriental__adjective', 'inevitable__adjective', 'irreversible__adjective', 'irregularly__adverb', 'inappropriate__adjective', 'abnormal__adjective', 'sediment__noun', 'silt__noun', 'muddy__adjective', 'clay__noun', 'dirt__noun', 'rural__adjective', 'suburb__noun', 'outskirts__noun', 'remote__adjective', 'desolate__adjective', 'distant__adjective', 'adjacent__adjective', 'toxic__adjective', 'pollutant__noun', 'contaminate__verb', 'geology__noun', 'border__noun', 'margin__noun', 'fringe__noun', 'plate__noun', 'debris__noun', 'crack__verb', 'gap__noun', 'splendid__adjective'],
    content: `Weather researchers often explain that a stormy climate system is shaped by far more than clouds alone. Oxygen, hydrogen, oxide particles, and even magnetic variation may influence measurement equipment, while marine air moving inland along a stream valley can change temperature rapidly. A forecast may warn that thunder, lightning, a downpour, or even a brief sprinkle will affect a mountain range whose ridge and hillside already channel water toward a lower valley. Under such conditions, residents may shiver as Celsius readings fall, then watch a rainbow appear only after the most violent shower has passed.

Regional geography adds another layer. A southern farming zone may face different pressure from an eastern coast, while routes toward the southeast, southwest, northeast, or northwest reveal how uneven exposure can be. In older writing, the word oriental may appear in reference to eastern regions, although modern academic use is cautious because it may sound inappropriate. What matters more is that landscape change can be inevitable once sediment, silt, clay, and dirt accumulate irregularly after abnormal rainfall. A channel may crack, a protective plate may fail, and water may open a gap between stable ground and the built environment.

This affects human settlement directly. Rural villages, remote homes, distant suburbs, and the outskirts of cities all experience the storm differently depending on whether infrastructure stands adjacent to rivers, slopes, or fragile ground. In industrial zones, toxic pollutant flows may contaminate muddy floodwater and carry debris across the border between natural and built space. Geology then becomes essential to explanation: some margins and fringes erode quickly, while others remain stable. Even a desolate site may reveal a splendid lesson for IELTS readers, because the passage connects climate, landform, and environmental risk in a single system.`,
  },
  {
    id: 'fast-only-water-02',
    mode: 'fast',
    theme: 'environment-climate',
    subtheme: 'water movement and environmental process',
    style: 'ielts-reading',
    readingGoal: 'Cover high-volume Fast Vocabulary items about water movement, process description, and environmental states.',
    title: 'Fast Vocabulary: Water Movement and Environmental Process',
    targetWordIds: ['sunrise__noun', 'spring__noun', 'dew__noun', 'pour__verb', 'drain__verb', 'drip__verb', 'drown__verb', 'blow__verb', 'puff__verb', 'gush__verb', 'dense__adjective', 'intensity__noun', 'emerge__verb', 'flash__verb', 'float__verb', 'environment__noun', 'surrounding__adjective', 'condition__noun', 'situation__noun', 'artificial__adjective', 'particle__noun', 'physics__noun', 'chemistry__noun', 'laboratory__noun', 'experiment__noun', 'technology__noun', 'device__noun', 'instrument__noun', 'gauge__noun', 'measure__verb', 'accurate__adjective', 'precise__adjective', 'correct__adjective', 'error__noun', 'mistake__noun', 'fault__noun'],
    content: `Environmental science often begins with close observation of ordinary movement. At sunrise, dew may collect near a spring, then disappear as sunlight warms the ground. Later, rain may pour from a dense cloud, drip from leaves, drain through soil, and finally gush into a channel with enough intensity to change the wider situation. In more dangerous cases, people may drown when the speed of movement is underestimated. Air also matters: wind can blow steadily, arrive as a sudden puff, or cause surface water to float and flash in ways that make depth difficult to judge.

The academic study of this environment depends on controlled language. Researchers describe surrounding conditions, isolate a variable, and compare natural systems with artificial ones. A particle suspended in water may seem too small to matter, yet its movement can transform the chemistry and physics of an entire site. That is why a laboratory experiment remains useful even when the real landscape is too complex to control fully. Technology extends this work further. A device, instrument, or gauge can measure flow more accurately and precisely than unaided observation, reducing the risk of simple error, mistake, or technical fault.

For IELTS learners, this kind of passage is valuable because it links vivid physical verbs to scientific explanation. The reader follows what emerges, flashes, and floats, but also sees how those visible events become data inside a structured environmental investigation.`,
  },
  {
    id: 'fast-only-biology-03',
    mode: 'fast',
    theme: 'health-biology',
    subtheme: 'reproduction, animal behaviour, and survival',
    style: 'ielts-reading',
    readingGoal: 'Maximise Fast Vocabulary coverage for biology, animal development, and survival vocabulary.',
    title: 'Fast Vocabulary: Animal Reproduction and Survival',
    targetWordIds: ['originate__verb', 'derive__verb', 'offspring__noun', 'subgroup__noun', 'feed__verb', 'breed__verb', 'interbreed__verb', 'hybridize__verb', 'proliferate__verb', 'sterility__noun', 'mate__verb', 'courtship__noun', 'lay__verb', 'hatch__verb', 'brood__noun', 'spawn__noun', 'mature__adjective', 'skin__noun', 'claw__noun', 'paw__noun', 'beak__noun', 'kangaroo__noun', 'cub__noun', 'calf__noun', 'pup__noun', 'lamb__noun', 'cattle__noun', 'ox__noun', 'bull__noun', 'buffalo__noun', 'horse__noun', 'zebra__noun', 'donkey__noun', 'saddle__noun', 'harness__noun', 'falcon__noun', 'hawk__noun', 'eagle__noun', 'owl__noun', 'swallow__noun', 'sparrow__noun', 'pigeon__noun', 'crow__noun', 'swan__noun', 'goose__noun', 'cock__noun', 'mouse__noun', 'rat__noun', 'squirrel__noun', 'hare__noun', 'frog__noun', 'behaviour__noun', 'bite__verb', 'sting__verb', 'bark__verb', 'roar__noun', 'rub__verb', 'creep__verb', 'crawl__verb', 'habitat__noun'],
    content: `Biologists often ask how a species originates, how one subgroup may derive from another, and why some lines produce healthy offspring while others fail. Reproduction is therefore more than a private biological event. Animals feed, breed, interbreed, or hybridize within specific habitats, and population numbers may proliferate or collapse depending on food, climate, and competition. Some organisms suffer sterility, while others mate successfully after elaborate courtship displays. Birds lay eggs that hatch into a brood, fish release spawn into water, and mammals give birth to live young that eventually become mature adults.

The vocabulary of body form supports this explanation. Skin, claw, paw, and beak structures reveal how different species survive. A kangaroo carries its young differently from a cub, calf, pup, or lamb, just as cattle, oxen, bulls, buffalo, horses, zebras, and donkeys occupy different ecological and economic roles. Human language around these animals also reflects domestication: a saddle or harness changes how a body is used, while wild species remain less controllable.

Bird behaviour adds another dimension. A falcon, hawk, eagle, owl, swallow, sparrow, pigeon, crow, swan, goose, or cock occupies a distinctive feeding niche. Smaller creatures such as the mouse, rat, squirrel, hare, and frog reveal that behaviour is shaped by constant pressure: they may bite, sting, bark, roar, rub, creep, or crawl depending on danger and opportunity. For IELTS readers, the passage is useful because it compresses reproduction, anatomy, and habitat into one coherent biological explanation.`,
  },
  {
    id: 'fast-only-education-04',
    mode: 'fast',
    theme: 'education-learning',
    subtheme: 'academic life, institutions, and quantitative study',
    style: 'ielts-reading',
    readingGoal: 'Maximise Fast Vocabulary coverage for school, university, and quantitative academic vocabulary.',
    title: 'Fast Vocabulary: Academic Life and Institutional Learning',
    targetWordIds: ['notorious__adjective', 'esteem__verb', 'respect__noun', 'diligent__adjective', 'painstaking__adjective', 'skill__noun', 'approach__noun', 'scheme__noun', 'headmaster__noun', 'principal__noun', 'dean__noun', 'faculty__noun', 'professor__noun', 'scholar__noun', 'scientist__noun', 'mentor__noun', 'tutor__noun', 'lecturer__noun', 'assistant__noun', 'candidate__noun', 'degree__noun', 'qualify__verb', 'certify__verb', 'license__noun', 'permit__noun', 'diploma__noun', 'diplomat__noun', 'ambassador__noun', 'pupil__noun', 'graduate__noun', 'ceremony__noun', 'bachelor__noun', 'master__noun', 'fresher__noun', 'sophomore__noun', 'junior__noun', 'senior__noun', 'alumni__noun', 'campus__noun', 'orientation__noun', 'platform__noun', 'register__verb', 'roster__noun', 'enrol__verb', 'matriculation__noun', 'accommodation__noun', 'dorm__noun', 'dining-hall__noun', 'canteen__noun', 'laboratory__noun', 'experiment__noun', 'data__noun', 'quantity__noun', 'quality__noun', 'library__noun', 'literature__noun', 'article__noun', 'author__noun', 'economics__noun', 'marketing__noun'],
    content: `Educational success depends on far more than natural talent. Institutions usually esteem diligent and painstaking work because skill develops through repeated effort rather than reputation alone. A notorious school may still produce strong results if its approach and administrative scheme support careful teaching. In that system, the headmaster or principal manages overall direction, while the dean, faculty, professor, scholar, scientist, mentor, tutor, lecturer, and assistant all contribute to different forms of academic guidance.

Students move through this structure in stages. A candidate may seek a degree, qualify for certification, obtain a professional license or permit, and finally receive a diploma at a public ceremony. A pupil can later become a graduate with a bachelor or master qualification, while a fresher, sophomore, junior, or senior occupies a specific point in campus life. Alumni often return to speak about career paths, and even an ambassador or diplomat may be invited to show how education connects with public service.

The practical side of study is equally important. During orientation, students register, enrol, complete matriculation, and appear on a formal roster. They then navigate accommodation, the dorm system, the dining hall, the canteen, and increasingly digital learning platforms. Meanwhile, serious academic work takes place in the laboratory, through experiment, data collection, and the evaluation of quantity as well as quality. The library, the wider literature, the journal article, and the published author all matter here. Subjects such as economics and marketing demonstrate why IELTS-style passages often combine institutional vocabulary with analytical thinking: education is both a place and a method.`,
  },
  {
    id: 'fast-only-math-science-05',
    mode: 'fast',
    theme: 'science-technology',
    subtheme: 'quantitative reasoning and scientific method',
    style: 'ielts-reading',
    readingGoal: 'Cover major Fast Vocabulary gaps in mathematics, scientific method, and academic analysis.',
    title: 'Fast Vocabulary: Quantitative Reasoning and Scientific Method',
    targetWordIds: ['minus__adjective', 'subtract__verb', 'multiply__verb', 'divide__verb', 'dividend__noun', 'remainder__noun', 'rational__noun', 'parameter__noun', 'variable__noun', 'even__adjective', 'odd__adjective', 'mean__noun', 'double__adjective', 'triple__adjective', 'quadruple__adjective', 'multiple__noun', 'maximum__noun', 'eccentric__adjective', 'displace__verb', 'boil__verb', 'melt__verb', 'dissolve__verb', 'rust__verb', 'ferment__verb', 'dilute__verb', 'acid__noun', 'noxious__adjective', 'static__adjective', 'inert__adjective', 'inherent__adjective', 'formula__noun', 'component__noun', 'compose__verb', 'mixture__noun', 'blend__noun', 'theory__noun', 'empirical__adjective', 'practical__adjective', 'doctrine__noun', 'principle__noun', 'discipline__noun', 'term__noun', 'system__noun', 'rudimentary__adjective', 'basic__adjective', 'fundamental__adjective', 'elementary__adjective', 'profound__adjective', 'surface__noun', 'detail__noun', 'thorough__adjective', 'confirm__verb', 'demonstrate__verb', 'illustrate__verb', 'manifest__verb', 'prove__verb', 'determine__verb', 'decide__verb', 'resolve__verb'],
    content: `Scientific literacy requires comfort with both numbers and processes. In quantitative work, students learn to subtract, multiply, and divide, to follow a dividend through to a remainder, and to distinguish an even outcome from an odd one. More advanced reasoning introduces the rational number, the changing variable, the fixed parameter, and summary measures such as the mean, maximum, or multiple. Expressions like double, triple, and quadruple show how scale changes in formal comparison.

Scientific description then moves into physical process. Substances may boil, melt, dissolve, rust, ferment, or dilute under particular conditions. An acid may be noxious to human tissue, while some matter appears static, inert, or yet still contains inherent instability. To explain these events clearly, scientists use formulae, define each component, and describe how materials compose a mixture or blend.

At a higher level, academic reasoning asks what counts as theory and what must remain empirical. A practical investigation may support a principle, challenge a doctrine, or refine the terms used within a discipline or wider system. Researchers often begin with rudimentary, basic, fundamental, or elementary models before moving toward more profound explanation. In that process they compare the surface detail with deeper structure, work thoroughly, and then confirm, demonstrate, illustrate, manifest, or prove a claim strongly enough to determine the next step. The passage is fast and dense, but its IELTS-style value lies in how it turns mathematical and scientific vocabulary into a clear method of reasoning.`,
  },
  {
    id: 'fast-only-study-process-06',
    mode: 'fast',
    theme: 'education-learning',
    subtheme: 'curriculum, assessment, and study practice',
    style: 'ielts-reading',
    readingGoal: 'Cover Fast Vocabulary gaps for study process, assessment, and academic workflow.',
    title: 'Fast Vocabulary: Curriculum, Assessment, and Study Practice',
    targetWordIds: ['semester__noun', 'timetable__noun', 'schedule__noun', 'deadline__noun', 'course__noun', 'lesson__noun', 'curriculum__noun', 'seminar__noun', 'forum__noun', 'syllabus__noun', 'superficial__adjective__2', 'compulsory__adjective', 'prerequisite__noun', 'selective__adjective', 'elective__adjective', 'assignment__noun', 'submit__verb', 'preview__noun', 'review__noun', 'revise__verb', 'inspect__verb', 'consult__verb', 'skim__verb', 'scan__verb', 'scrutinise__verb', 'recite__verb', 'dictate__verb', 'examination__noun', 'test__verb', 'quiz__noun', 'presentation__noun', 'plagiarise__verb', 'copy__noun', 'print__verb', 'thesis__noun', 'essay__noun', 'paper__noun', 'dissertation__noun', 'project__noun', 'heading__noun', 'outset__noun', 'outline__noun', 'point__noun', 'gist__noun', 'opinion__noun', 'introduce__verb', 'reference__noun', 'cite__verb', 'inductive__adjective', 'example__noun', 'instance__noun', 'survey__noun', 'observe__verb', 'inquire__verb', 'query__noun', 'questionnaire__noun', 'achieve__verb', 'accomplish__verb', 'attain__verb', 'credit__noun'],
    content: `Academic study is organised by time as well as content. A semester unfolds through a timetable or wider schedule in which each course, lesson, and seminar fits within a formal curriculum. A syllabus defines what is compulsory, what remains elective, and which prerequisite knowledge students must already possess. This structure may appear rigid, but it prevents learning from becoming superficial or purely improvised.

Assessment creates the second layer of order. Students receive an assignment, preview the topic, review earlier material, and revise their notes before they submit a response. They may inspect a source, consult a tutor, skim for general meaning, scan for specific detail, or scrutinise a difficult passage more closely. In some settings they also recite material, respond to dictated questions, or prepare for an examination, test, quiz, or oral presentation. The distinction between honest work and academic misuse becomes clear here: to plagiarise is not the same as to quote, reference, cite, or print a source responsibly.

Longer forms of writing deepen the process. A thesis, essay, paper, dissertation, or project usually begins at the outset with a heading, an outline, a central point, and a sense of the overall gist. The student then introduces an opinion, tests it through example or instance, and may support it with survey data, observation, inquiry, a formal query, or a questionnaire. Good academic work is often inductive, moving from evidence to interpretation. When this is done well, the learner can achieve, accomplish, or attain real progress and ultimately receive formal credit. For IELTS learners, this passage is useful because it compresses the full rhythm of study into one readable academic narrative.`,
  },
  {
    id: 'fast-only-innovation-07',
    mode: 'fast',
    theme: 'science-technology',
    subtheme: 'innovation, invention, and technical application',
    style: 'ielts-reading',
    readingGoal: 'Cover Fast Vocabulary gaps around innovation, technical application, and evaluation.',
    title: 'Fast Vocabulary: Innovation, Invention, and Technical Application',
    targetWordIds: ['mark__noun', 'row__noun', 'queue__noun', 'grant__verb', 'praise__noun', 'feedback__noun', 'apply__verb', 'fellowship__noun', 'scholarship__noun', 'prize__noun', 'fee__noun', 'technology__noun', 'technique__noun', 'polytechnic__adjective', 'engineer__noun', 'mechanic__noun', 'advance__noun', 'breakthrough__noun', 'gizmo__noun', 'patent__noun', 'devise__verb', 'domain__noun', 'field__noun__2', 'realm__noun', 'specialise__verb', 'absorb__verb__2', 'concentrate__verb', 'focus__verb', 'utilise__verb', 'usage__noun', 'tester__noun', 'appliance__noun', 'facility__noun', 'equipment__noun', 'tool__noun', 'calculate__verb', 'compute__noun', 'count__verb', 'estimate__noun', 'assess__verb'],
    content: `Innovation is often described as a moment of genius, yet research and engineering show a slower reality. In universities and laboratories, students and researchers receive a mark, are graded for quality, ranked against peers, arranged in a row during presentations, or even kept in a queue for scarce funding. A grant, scholarship, fellowship, prize, or fee waiver may determine who can continue technical work, while praise, feedback, and genuine appreciation of evidence help reviewers avoid the common mistake of underestimating or overestimating a proposal too early.

Within science and technology, progress depends on method. An engineer or mechanic may work in a polytechnic setting, refine a technique, and contribute to an advance that later becomes a genuine breakthrough. Some inventions remain little more than a temporary gizmo, but others are protected by patent, developed into a device or appliance, or used to devise broader systems inside a specialised facility. Innovation can involve invention, discovery, disclosure, revelation, uncovering hidden causes, or exposing design weakness in an existing tool or piece of equipment.

The academic vocabulary surrounding innovation is therefore broad. Researchers operate within a domain, field, or wider realm built on prior foundations. They may specialise deeply, absorb new information, concentrate on one question, focus on one mechanism, and utilise equipment with great care. Technical application also requires evaluation: a tester may apply a method, calculate outcomes, produce a compute estimate, count errors, and assess whether the usage is justified. In IELTS-style reading, this kind of passage matters because it presents innovation not as magic, but as organised, evidence-based work.`,
  },
  {
    id: 'fast-only-engineering-08',
    mode: 'fast',
    theme: 'science-technology',
    subtheme: 'engineering systems, transformation, and control',
    style: 'ielts-reading',
    readingGoal: 'Maximise Fast Vocabulary coverage for engineering process, transformation, and control vocabulary.',
    title: 'Fast Vocabulary: Engineering Systems and Technical Control',
    targetWordIds: ['gear__noun', 'pivot__noun', 'hydraulic__adjective', 'drainage__noun', 'sewage__noun', 'ventilation__noun', 'compress__verb', 'condense__verb', 'refine__verb', 'simplify__verb', 'purify__verb', 'filter__verb', 'distil__verb', 'mode__noun', 'mould__verb', 'prototype__noun', 'framework__noun', 'aspect__noun', 'phase__noun', 'operate__verb', 'facilitate__verb', 'transform__verb', 'convert__verb', 'alter__verb', 'shift__verb', 'turn__verb', 'adapt__verb', 'adjust__verb', 'pinpoint__verb', 'culture__noun', 'civilisation__noun', 'renaissance__noun', 'ideology__noun', 'tradition__noun', 'convention__noun', 'custom__noun', 'ethical__adjective', 'moral__adjective'],
    content: `Engineering systems are often understood best through process vocabulary. A machine may depend on a gear or pivot, while a city-scale system may rely on hydraulic control, drainage design, sewage handling, and effective ventilation. Each of these operates differently, yet all require the same analytical discipline: engineers compress information, condense a problem to its essentials, refine a design, simplify where possible, and purify or filter a flow when contamination becomes dangerous. In some cases, they distil a process down to its most efficient sequence.

Design work also unfolds in stages. A prototype rarely emerges fully formed. Instead, it is shaped within a framework that separates one aspect or phase from another. Teams operate a model, facilitate testing, and transform or convert older systems before they alter, shift, turn, adapt, or adjust the final design. Good engineers learn to pinpoint failure precisely, because vague diagnosis wastes time and money.

Yet engineering is never only technical. It belongs to culture and civilisation as much as to mechanics. A renaissance in infrastructure may reflect a new ideology of urban life, while tradition, convention, and social custom influence what kinds of systems are accepted. Ethical and moral questions follow naturally: a technically efficient design is not always a socially just one. This is why IELTS-style passages on engineering often link process vocabulary with wider public consequences.`,
  },
  {
    id: 'fast-only-culture-language-09',
    mode: 'fast',
    theme: 'culture-media',
    subtheme: 'culture, heritage, archaeology, and language systems',
    style: 'ielts-reading',
    readingGoal: 'Maximise Fast Vocabulary coverage for culture, archaeology, heritage, and language-related vocabulary.',
    title: 'Fast Vocabulary: Culture, Heritage, and Language Systems',
    targetWordIds: ['tribe__noun', 'aboriginal__noun', 'inhabitant__noun', 'native__adjective', 'local__adjective', 'exotic__adjective', 'foreigner__noun', 'alien__noun', 'anthropologist__noun', 'humanitarian__noun', 'heritage__noun', 'inherit__verb', 'antique__noun', 'archaeology__noun', 'excavate__verb', 'museum__noun', 'pottery__noun', 'engrave__verb', 'decorate__verb', 'religion__noun', 'ritual__noun', 'etiquette__noun', 'belief__noun', 'soul__noun', 'spirit__noun', 'sacred__adjective', 'hallowed__adjective', 'holy__adjective', 'gesture__noun', 'handwriting__noun', 'pictograph__noun', 'wedge__noun', 'knot__noun', 'linguistics__noun', 'semantic__adjective', 'syntax__noun', 'grammar__noun', 'phonetics__noun', 'pronounce__verb', 'intonation__noun', 'inflection__noun', 'dialect__noun', 'accent__noun', 'utterance__noun', 'oral__adjective', 'verbal__adjective', 'syllable__noun', 'phoneme__noun', 'vowel__noun', 'consonant__noun', 'alphabet__noun', 'logogram__noun', 'vocabulary__noun', 'dictionary__noun', 'idiom__noun', 'phrase__noun', 'clause__noun', 'expression__noun', 'tense__noun', 'root__noun__2'],
    content: `Cultural study often begins with a tension between familiarity and distance. A tribe, aboriginal community, or other local inhabitant may be described as native to a region, yet outside observers frequently frame the same culture as exotic. The language of the foreigner or even the alien can distort understanding unless the anthropologist or humanitarian writer works carefully. Heritage matters here because communities inherit not only material objects but also social memory, sacred meaning, and systems of belief.

Archaeology turns that memory into evidence. Researchers excavate an antique site, place key objects in a museum, and study pottery, engraved surfaces, decoration, religion, ritual, etiquette, and the symbolic language of soul, spirit, and holy space. Terms such as sacred or hallowed do more than describe emotion; they signal how a community organised value. Gesture and handwriting can be just as revealing as larger monuments, especially when a pictograph, wedge sign, or knotted record survives after speech itself has disappeared.

Language study extends this inquiry further. Linguistics examines semantic structure, syntax, grammar, phonetics, pronunciation, intonation, inflection, dialect, accent, and the spoken utterance. It also breaks speech into the oral and verbal systems of syllables, phonemes, vowels, and consonants, then traces how an alphabet, logogram, vocabulary list, dictionary entry, idiom, phrase, clause, expression, tense, or word root carries meaning. For IELTS learners, this kind of passage is especially useful because it reads like a real academic text while covering a large number of high-value terms from culture, archaeology, and language history.`,
  },
];

function clean(value) {
  return value == null ? '' : String(value).trim();
}

function blank(value) {
  return ['', '-'].includes(clean(value));
}

function normalizePos(raw) {
  return clean(raw)
    .toLowerCase()
    .replace(/\s+/g, '')
    .split('/')
    .filter(Boolean)
    .map((part) => POS_MAP[part.replace(/\./g, '')] || part.replace(/\./g, ''))
    .filter((part, index, arr) => arr.indexOf(part) === index);
}

function slugifyWord(word) {
  return clean(word)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'entry';
}

function classifyThemes(item) {
  const text = ['word', 'meaning', 'example', 'extral']
    .map((key) => clean(item[key]).toLowerCase())
    .join(' ');

  const hits = Object.entries(THEME_RULES)
    .map(([theme, keywords]) => ({
      theme,
      score: keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return hits.length ? hits.slice(0, 2).map((entry) => entry.theme) : ['general-academic'];
}

function normalizeSource(rawText) {
  const wrapped = '[' + rawText.trim().replace(/}\s*,\s*{/g, '},{') + ']';
  const parsed = JSON.parse(wrapped);
  const seen = new Map();

  return parsed.map((item, index) => {
    const word = clean(item.word);
    const posList = normalizePos(item.pos);
    const primary = posList[0] || 'unknown';
    const baseId = `${slugifyWord(word)}__${primary}`;
    const count = (seen.get(baseId) || 0) + 1;
    seen.set(baseId, count);
    const id = count === 1 ? baseId : `${baseId}__${count}`;
    const aliases = Array.from(new Set([
      word.toLowerCase(),
      word.toLowerCase().replace(/-/g, ' '),
      word.toLowerCase().replace(/\s+/g, ''),
    ].filter(Boolean)));

    return {
      id,
      word,
      normalizedWord: word.toLowerCase(),
      displayWord: word,
      aliases,
      posRaw: clean(item.pos),
      posList,
      meaningCn: blank(item.meaning) ? '' : clean(item.meaning),
      example: blank(item.example) ? '' : clean(item.example),
      notes: blank(item.extral) ? '' : clean(item.extral),
      isPhrase: /[\s-]/.test(word),
      hasExample: !blank(item.example),
      hasNotes: !blank(item.extral),
      themes: classifyThemes(item),
      sourceIndex: index,
    };
  });
}

function countWords(text) {
  return (text.match(/[A-Za-z]+(?:-[A-Za-z]+)?/g) || []).length;
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]+/g, ' ');
}

function exactMatches(content, targets, idToWord) {
  const normalized = normalizeText(content);
  return targets.filter((id) => {
    const entry = idToWord.get(id);
    const phrases = [entry?.word, ...(entry?.aliases || [])]
      .map((value) => normalizeText(value || '').trim())
      .filter(Boolean);
    return phrases.some((phrase) => {
      const pattern = new RegExp(`(?<![a-z0-9])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`);
      return pattern.test(normalized);
    });
  });
}

function readVocabularySource() {
  if (fs.existsSync(externalSourcePath)) {
    return {
      mode: 'source-word-json',
      vocabulary: normalizeSource(fs.readFileSync(externalSourcePath, 'utf8')),
    };
  }

  if (fs.existsSync(generatedVocabularyPath)) {
    return {
      mode: 'committed-generated-vocabulary',
      vocabulary: JSON.parse(fs.readFileSync(generatedVocabularyPath, 'utf8')),
    };
  }

  throw new Error(`Vocabulary source not found. Expected either ${externalSourcePath} or ${generatedVocabularyPath}.`);
}

const { mode: vocabularyMode, vocabulary } = readVocabularySource();
const vocabById = new Map(vocabulary.map((entry) => [entry.id, entry]));

const articles = articleBlueprints.map((blueprint) => {
  const exact = exactMatches(blueprint.content, blueprint.targetWordIds, vocabById);
  const wordCount = countWords(blueprint.content);
  const targetWordCount = blueprint.targetWordIds.length;
  return {
    id: blueprint.id,
    title: blueprint.title,
    mode: blueprint.mode,
    modeLabel: modeMeta[blueprint.mode].label,
    theme: blueprint.theme,
    subtheme: blueprint.subtheme,
    style: blueprint.style,
    readingGoal: blueprint.readingGoal,
    content: blueprint.content,
    wordCount,
    targetWordIds: blueprint.targetWordIds,
    targetWords: blueprint.targetWordIds.map((id) => vocabById.get(id)?.word).filter(Boolean),
    density: Number((targetWordCount / wordCount).toFixed(3)),
    coverage: {
      exactMatches: exact,
      missingWordIds: blueprint.targetWordIds.filter((id) => !exact.includes(id)),
      coverageRate: Number((exact.length / blueprint.targetWordIds.length).toFixed(3)),
    },
  };
});

const articleCards = articles.map((article) => ({
  id: article.id,
  title: article.title,
  mode: article.mode,
  modeLabel: article.modeLabel,
  theme: article.theme,
  themeLabel: themeMeta[article.theme]?.label || article.theme,
  summary: article.readingGoal,
  wordCount: article.wordCount,
  targetWordCount: article.targetWordIds.length,
  coverageRate: article.coverage.coverageRate,
  density: article.density,
}));

const appData = {
  generatedAt: new Date().toISOString(),
  stats: {
    vocabularyCount: vocabulary.length,
    articleCount: articles.length,
    avgCoverageRate: Number((articles.reduce((sum, article) => sum + article.coverage.coverageRate, 0) / articles.length).toFixed(3)),
  },
  modes: Object.entries(modeMeta).map(([id, meta]) => ({
    id,
    ...meta,
    articleCount: articles.filter((article) => article.mode === id).length,
  })),
  themes: Object.entries(themeMeta).map(([id, meta]) => ({ id, ...meta })),
  articleCards,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'vocabulary.json'), JSON.stringify(vocabulary, null, 2));
fs.writeFileSync(path.join(outDir, 'articles.json'), JSON.stringify(articles, null, 2));
fs.writeFileSync(path.join(outDir, 'app-data.json'), JSON.stringify(appData, null, 2));

console.log(JSON.stringify({
  vocabularyMode,
  vocabularyCount: vocabulary.length,
  articleCount: articles.length,
  modeCounts: Object.fromEntries(Object.keys(modeMeta).map((mode) => [mode, articles.filter((article) => article.mode === mode).length])),
  avgCoverageRate: appData.stats.avgCoverageRate,
}, null, 2));
