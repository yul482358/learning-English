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
