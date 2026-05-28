import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const sourcePath = '/opt/data/cache/documents/doc_3732b17502f7_word.json';
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

const articleBlueprints = [
  {
    id: 'env-01',
    theme: 'environment-climate',
    subtheme: 'natural disasters and climate patterns',
    style: 'ielts-reading',
    readingGoal: 'Explain how climate systems and extreme weather influence human society.',
    title: 'Climate Systems, Extreme Weather, and Human Society',
    targetWordIds: ['atmosphere__noun', 'greenhouse__noun', 'hurricane__noun', 'monsoon__noun', 'calamity__noun', 'catastrophic__adjective', 'disaster__noun', 'breeze__noun', 'gust__noun', 'el-nino__noun'],
    content: `Human societies have always lived within the limits and possibilities created by climate. Long before modern science developed detailed forecasts, farmers, sailors, and city planners understood that seasonal wind, rainfall, and temperature patterns could determine success or failure. Today, research into the atmosphere has made these relationships clearer, yet it has also shown how vulnerable communities remain when climate systems become unstable. From small changes in rainfall to violent storms, weather is not simply a background condition of life; it is a force that shapes settlement, trade, agriculture, and public safety.\n\nThe atmosphere operates as a complex system in which heat, moisture, air pressure, and ocean conditions interact continuously. One important factor in current climate discussions is the greenhouse effect. In natural conditions, greenhouse gases help retain some of the sun's heat and keep the planet warm enough for life. However, when these gases increase beyond historical levels, they can alter temperature patterns and affect the frequency or intensity of extreme weather. Scientists do not argue that every single storm is caused by one factor alone, but many agree that a warmer climate can increase the likelihood of certain dangerous events.\n\nAmong the most dramatic examples is the hurricane, a powerful rotating storm that develops over warm ocean water. When such a system reaches land, it may destroy homes, damage transport networks, and cut electricity supplies for days or weeks. A hurricane often brings more than strong winds. Heavy rainfall, flooding, and storm surges can combine to produce a disaster on a very large scale. In coastal regions with dense populations, the results may be catastrophic, especially where buildings are weak or emergency planning is poor. Even after the storm has passed, communities may continue to suffer from contaminated water, lost income, and psychological stress.\n\nIn other parts of the world, the monsoon is a major climate pattern that affects hundreds of millions of people. The monsoon is not a single storm but a seasonal shift in winds and rainfall. In many countries, it is essential for farming because it provides water for crops and rivers. Yet if the rains arrive late, end too early, or fall too heavily in a short time, they can trigger flood, crop loss, and displacement. In this way, the same system that supports life can also become a calamity. A gentle breeze at the start of the wet season may be welcomed by farmers, while a sudden gust within a larger storm may signal immediate danger.\n\nClimate patterns are influenced not only by local conditions but also by wider ocean-atmosphere interactions. One well-known example is El Nino, a periodic warming of ocean waters in the Pacific that can disrupt normal weather across many regions. During an El Nino year, some countries may experience drought, while others receive unusual rainfall. Fisheries, food prices, and water supplies can all be affected. Because modern economies are tightly connected, a weather shock in one region may influence markets and migration far beyond its place of origin.\n\nHuman society responds to such threats in several ways. Governments invest in forecasting systems, sea walls, evacuation planning, and stronger infrastructure. Scientists analyze past events to improve risk models, while international agencies provide support after major emergencies. However, social inequality remains a crucial factor. A wealthy household may recover quickly from a disaster, but poorer families often live in more exposed areas and have fewer savings, weaker housing, and less access to insurance or transport. As a result, the same storm can produce very different outcomes for different groups.\n\nFor this reason, understanding climate is not merely a scientific exercise. It is also a social and political necessity. Whether the issue is a hurricane on the coast, a failed monsoon in an agricultural region, or the global influence of El Nino, climate systems continue to test human adaptability. The challenge for modern societies is not only to predict extreme weather more accurately, but also to build communities that can endure it with greater fairness and resilience.`,
  },
  {
    id: 'geo-01', theme: 'geography-earth', subtheme: 'earth systems and planetary structure', style: 'ielts-reading', readingGoal: 'Describe the structure of the Earth and how humans study it.', title: 'Inside the Earth: Structure, Measurement, and Human Understanding',
    targetWordIds: ['hydrosphere__noun', 'lithosphere__noun', 'core__noun', 'crust__noun', 'mantle__noun', 'longitude__noun', 'latitude__noun', 'altitude__noun', 'horizon__noun', 'mineral__noun'],
    content: `The Earth appears solid and familiar beneath our feet, yet much of what lies below the surface cannot be observed directly. For centuries, people explained mountains, volcanoes, and earthquakes through myth or speculation. Modern geography and earth science, however, have developed methods for examining the planet in a more systematic way. By combining field observation, laboratory analysis, satellite data, and mathematical modelling, scientists have built a detailed picture of the Earth's internal structure and the systems that shape its surface.\n\nOne useful way to understand the planet is to think of it as a set of connected layers and spheres. The outer rocky shell belongs to the lithosphere, which includes the continents, the ocean floor, and the uppermost rigid part of the planet. Water in rivers, lakes, oceans, clouds, and ice forms the hydrosphere. These systems interact continuously. Rain erodes rock, rivers carry sediment, and ocean water affects temperature and weather. Although these terms are scientific, they describe processes that influence everyday human life, from farming and transport to settlement patterns and natural hazards.\n\nBeneath the Earth's surface, scientists usually describe three main internal layers: the crust, the mantle, and the core. The crust is the thin outer layer on which humans live. It varies in thickness, being generally thinner beneath the oceans and thicker under continents. Below it lies the mantle, a much deeper region of hot, slowly moving rock. Although solid in a general sense, parts of the mantle can deform over long periods, allowing large plates of the lithosphere to move. At the centre of the Earth is the core, composed mainly of metal and divided into outer and inner sections. The movement of material in the outer core contributes to the planet's magnetic field, which helps shield life from harmful solar radiation.\n\nSince no one can travel to these deep layers, scientists rely on indirect evidence. One of the most important tools is the study of seismic waves produced by earthquakes. As these waves travel through the Earth, they change speed and direction depending on the material they pass through. By measuring those changes, researchers can infer the depth, density, and composition of different layers. Samples from volcanoes also provide clues, as they sometimes bring deep material closer to the surface. In addition, the study of mineral composition in rocks helps geologists reconstruct the conditions under which those rocks formed.\n\nHuman understanding of the Earth's surface also depends on accurate measurement of location. The systems of latitude and longitude allow any point on the globe to be identified precisely. Latitude measures distance north or south of the equator, while longitude measures position east or west. These concepts are essential not only in geography classrooms but also in navigation, mapping, aviation, and climate research. When scientists compare rainfall, vegetation, or temperature across regions, they need exact coordinates to ensure the data is reliable.\n\nOther forms of measurement are equally important. Altitude, for example, affects temperature, air pressure, and human activity. A settlement at high altitude may experience colder conditions and lower oxygen levels than one near sea level. Surveyors, geographers, and mountaineers all use such information in different ways. Meanwhile, the horizon, which seems visually simple, has long been significant in navigation and observation. Before modern instruments, travellers used the horizon together with stars and the sun to estimate direction. Even now, it remains a basic reference in landscape study and remote sensing.\n\nThe study of the Earth is therefore both theoretical and practical. It helps explain earthquakes, volcanic activity, erosion, and the distribution of resources, while also supporting engineering, environmental management, and disaster planning. By examining the crust, mantle, and core, and by studying the lithosphere and hydrosphere as connected systems, scientists are able to interpret a planet that is dynamic rather than static. The Earth may seem stable from day to day, but careful observation reveals a world in constant movement, shaped by forces operating from deep below the ground to the distant line of the horizon.`,
  },
  {
    id: 'health-01', theme: 'health-biology', subtheme: 'public health, nutrition and biological function', style: 'ielts-reading', readingGoal: 'Explain the relationship between lifestyle, nutrition and modern health systems.', title: 'Lifestyle, Nutrition, and the Demands of Modern Health Systems',
    targetWordIds: ['health-care__noun', 'nutrient__noun', 'endanger__verb', 'uptake__noun', 'intensive__adjective', 'heart-attack__noun', 'disease__noun', 'medical__adjective', 'physical__adjective', 'biology__noun'],
    content: `In many countries, improvements in sanitation, vaccination, and clinical treatment have increased life expectancy significantly. Yet modern societies now face a different set of challenges, many of them linked not to sudden infection but to long-term lifestyle patterns. Public discussion often separates personal habits from national policy, but in reality the two are closely connected. Diet, physical activity, stress, and access to treatment all influence the condition of the body, while governments and institutions must decide how health care resources should be organized to respond to changing patterns of illness.\n\nAt the most basic level, human biology depends on a regular supply of energy and essential substances. Every nutrient has a role to play, whether in building tissue, supporting immunity, or enabling chemical reactions within cells. The process by which the body absorbs and uses these substances is often described as uptake. Efficient uptake depends on many factors, including digestive health, age, and the balance of foods consumed. A person may eat enough in quantity but still suffer poor nutrition if meals lack variety or contain too much sugar, salt, and heavily processed fat.\n\nOver time, such imbalances can increase the risk of chronic disease. Conditions such as diabetes, obesity, and cardiovascular illness are now common in both wealthy and developing societies. In particular, poor diet, smoking, and inactivity are known to raise the likelihood of a heart attack. This event may appear sudden, but it usually results from processes that have developed gradually over many years. Fatty deposits in blood vessels, high blood pressure, and persistent inflammation can all damage the body's systems before any clear warning sign appears.\n\nThe danger is not limited to individuals who are already unwell. Unhealthy food environments may endanger entire populations, especially where cheap products with low nutritional value are more available than fresh food. Children are especially vulnerable because habits formed early in life often continue into adulthood. If schools, families, and urban environments do not support exercise and balanced eating, the medical consequences may persist for decades. In this sense, public health is not only about treating illness after it appears, but also about designing conditions in which healthier choices become easier.\n\nModern health care systems must therefore perform several roles at once. They provide emergency treatment, long-term management, prevention campaigns, and professional advice. In some cases, patients require intensive support in hospital, particularly after surgery, severe infection, or a heart attack. Intensive care units rely on highly trained staff, advanced monitoring, and rapid decision-making. However, these services are expensive, which is why many experts argue that prevention is not only humane but economically sensible. If a disease can be delayed or avoided through better nutrition, exercise, and screening, pressure on hospitals may be reduced.\n\nThe relationship between personal behaviour and formal treatment is often misunderstood. Medical science can offer remarkable interventions, but it cannot fully compensate for unhealthy living conditions. A doctor may prescribe drugs to control blood pressure, for example, yet the outcome will usually be better if the patient also improves diet and activity levels. Likewise, biology sets certain limits and tendencies, but genes do not act alone. Social class, education, food pricing, work schedules, and housing conditions all shape health outcomes in powerful ways.\n\nFor this reason, researchers increasingly view health as the product of multiple systems rather than a simple matter of individual will. The body is influenced by biology, but also by culture, economics, and policy. A successful public strategy must combine medical treatment with education, prevention, and equal access to nutritious food. When these elements work together, societies are better able to reduce disease and support longer, healthier lives. In the future, the strongest health care systems may be those that do not merely respond to crisis, but help people maintain well-being before serious illness begins.`,
  },
  {
    id: 'edu-01', theme: 'education-learning', subtheme: 'academic environment and knowledge building', style: 'ielts-reading', readingGoal: 'Discuss how universities shape learning habits and academic thinking.', title: 'How Universities Shape the Habits of Thought',
    targetWordIds: ['atmosphere__noun', 'campus__noun', 'classify__verb', 'derive__verb', 'quantum__noun', 'language__noun', 'education__noun', 'curriculum__noun', 'lecturer__noun', 'scholar__noun'],
    content: `Universities are often described as places where knowledge is transmitted from one generation to the next, yet their influence extends far beyond the delivery of information. A well-designed university experience gradually changes the way students observe evidence, organize ideas, and respond to uncertainty. In this sense, higher education is not limited to earning a qualification; it also creates habits of mind. The physical setting, the expectations of teachers, and the structure of study all contribute to an intellectual atmosphere in which learners begin to think in more disciplined and independent ways.\n\nThe role of the campus is more significant than it first appears. Students do not learn only in formal classrooms. They also absorb values from libraries, laboratories, seminar rooms, and even from conversations in shared spaces. A quiet reading area may encourage concentration, while a lively discussion after class can test whether an argument survives criticism. Over time, such surroundings suggest that learning is not a temporary activity but a continuous practice. The academic environment therefore teaches by example. It shows that serious thought requires both private reflection and public exchange.\n\nAt the same time, university study introduces students to methods for handling complexity. In school, learners may sometimes aim to memorize accepted answers, but higher education usually asks them to classify information, compare explanations, and examine the strength of evidence. A history student, for instance, may sort sources according to origin and reliability, while a biologist may classify organisms according to shared features. Although the subjects differ, the underlying habit is similar: students are trained to arrange knowledge carefully before drawing conclusions. This process reduces confusion and encourages precision.\n\nAnother important feature of university learning is the demand to derive meaning rather than receive it passively. A student attending a lecture is not expected merely to copy notes. Instead, the listener must identify the central claim, connect it with previous reading, and decide whether the reasoning is convincing. Even when a lecturer speaks with authority, students are gradually taught that authority alone is not enough. They must derive interpretations from evidence and argument. This expectation marks a major step in intellectual maturity, because it replaces dependence with judgment.\n\nSpecialized disciplines also influence the way people think. Consider a subject such as quantum physics. Most students will never become experts in this field, yet exposure to such areas can still reshape thought. Quantum theory challenges everyday assumptions about certainty, scale, and observation. By encountering ideas that seem unfamiliar or even uncomfortable, learners begin to accept that reality may not always fit common intuition. Similar effects occur in philosophy, linguistics, and economics. Each field offers not just facts but a particular language for discussing problems, and learning that language allows students to notice distinctions that previously remained invisible.\n\nThe curriculum plays a central role in this transformation. When courses are arranged thoughtfully, they lead students from foundational principles to more demanding forms of analysis. Early classes may focus on core concepts, while later ones require debate, synthesis, and original interpretation. In this way, the curriculum is not merely a list of topics; it is a sequence designed to build intellectual stamina. A coherent programme prevents knowledge from remaining fragmented and helps students understand how separate ideas belong to wider systems of thought.\n\nEqually important are the people who inhabit universities. A respected scholar does more than publish research. By asking careful questions and acknowledging uncertainty, such a person demonstrates how serious inquiry should be conducted. Students observing this behaviour often learn intellectual humility alongside confidence. They see that knowledge grows through revision, disagreement, and patience. In the best cases, universities cultivate individuals who can question claims responsibly without rejecting expertise altogether.\n\nFor these reasons, the impact of higher education should not be measured only by examination results or employment statistics. Universities shape habits that influence how graduates read, argue, and make decisions long after they leave formal study. Through their atmosphere, campus life, academic expectations, and carefully designed curriculum, they help learners move from receiving information to evaluating it. The lasting achievement of a university, therefore, lies not simply in what students know, but in the disciplined and thoughtful manner in which they come to know it.`,
  },
  {
    id: 'sci-01', theme: 'science-technology', subtheme: 'materials, chemistry and scientific discovery', style: 'ielts-reading', readingGoal: 'Show how scientific ideas move from theory to practical technology.', title: 'From Scientific Theory to Everyday Technology',
    targetWordIds: ['oxygen__noun', 'oxide__noun', 'carbon-dioxide__noun', 'hydrogen__noun', 'magnet__noun', 'particle__noun', 'artificial__adjective', 'intelligence__noun', 'laboratory__noun', 'technology__noun'],
    content: `Scientific progress is often imagined as a sudden moment of discovery, yet in reality it usually develops through a long connection between abstract theory and practical application. Ideas first explored in notebooks and research papers may later transform transport, medicine, communication, or manufacturing. This movement from principle to product depends on repeated testing, revision, and cooperation between researchers and engineers. The history of modern technology shows that practical change rarely begins with immediate usefulness; it often starts with curiosity about how matter behaves.\n\nChemistry offers many clear examples of this process. Early scientists studying oxygen were not trying to design modern industry. They were attempting to understand combustion, respiration, and the composition of air. Once these investigations became more precise, researchers could explain why certain materials burn, rust, or react under specific conditions. The study of oxide compounds, for instance, helped clarify how metals combine with other elements and why surfaces change over time. Such knowledge later became valuable in fields ranging from construction to electronics, where control of chemical reactions is essential.\n\nThe same pattern can be seen in studies of gases. Carbon dioxide was once mainly of interest to those seeking to classify different forms of air, but later research connected it with plant growth, industrial processes, and climate systems. Hydrogen followed a similar path. At first, it was an object of theoretical investigation because of its unusual lightness and reactivity. In later centuries, however, scientists and engineers recognized its potential as a fuel and as a key material in chemical production. In both cases, the shift from theory to use required many intermediate steps, including measurement, storage techniques, and safety procedures.\n\nPhysics has also contributed ideas that seemed abstract before becoming practical. Research on the magnet, for example, began with attempts to explain attraction and orientation. Over time, these studies supported the development of compasses, electric motors, and data storage systems. Likewise, the investigation of the particle transformed scientific understanding of matter. Once researchers learned that substances are not continuous but composed of smaller units with specific properties, they gained new ways to manipulate materials. This insight eventually supported advances in semiconductors, imaging devices, and modern energy systems.\n\nHowever, theory alone does not create technology. Between discovery and application stands the laboratory, where ideas are tested against reality. In this controlled environment, scientists check whether a principle can survive contact with real materials, variable temperatures, and imperfect conditions. Many proposals fail at this stage. A reaction that appears elegant in theory may prove unstable, expensive, or dangerous in practice. Yet failure is not wasted effort. It reveals limits, suggests improvements, and directs future research. The laboratory therefore acts as a bridge between imagination and use.\n\nIn recent decades, the relationship between science and application has become even more visible through artificial intelligence. The basic mathematics behind machine learning existed long before it entered public life. For many years, such models remained largely theoretical because computing power and data were limited. As these conditions changed, researchers were able to convert abstract systems into tools for translation, diagnosis, pattern recognition, and industrial design. Artificial intelligence now assists scientists themselves by helping them identify molecular structures, predict material behaviour, and speed up experimentation.\n\nThis accelerating cycle has encouraged a wider culture of innovation. Yet innovation should not be understood as novelty alone. A new device or process is meaningful only when it solves a real problem reliably and at scale. Scientific ideas become socially valuable when they can be repeated, adapted, and integrated into daily systems. That is why practical technology depends not only on discovery but also on engineering, manufacturing, regulation, and public trust.\n\nUltimately, the journey from theory to technology reveals the patient structure of scientific progress. The investigation of oxygen, oxide reactions, carbon dioxide, hydrogen, magnetic forces, and the behaviour of the particle all began as efforts to explain the natural world. Through repeated experiment, careful work in the laboratory, and the later support of artificial intelligence, these ideas moved beyond explanation toward application. Modern innovation, therefore, is not separate from theory. It is theory extended into the material world, where understanding becomes tool, process, and possibility.`,
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

const raw = fs.readFileSync(sourcePath, 'utf8');
const vocabulary = normalizeSource(raw);
const vocabById = new Map(vocabulary.map((entry) => [entry.id, entry]));

const articles = articleBlueprints.map((blueprint) => {
  const exact = exactMatches(blueprint.content, blueprint.targetWordIds, vocabById);
  return {
    id: blueprint.id,
    title: blueprint.title,
    theme: blueprint.theme,
    subtheme: blueprint.subtheme,
    style: blueprint.style,
    readingGoal: blueprint.readingGoal,
    content: blueprint.content,
    wordCount: countWords(blueprint.content),
    targetWordIds: blueprint.targetWordIds,
    targetWords: blueprint.targetWordIds.map((id) => vocabById.get(id)?.word).filter(Boolean),
    coverage: {
      exactMatches: exact,
      missingWordIds: blueprint.targetWordIds.filter((id) => !exact.includes(id)),
      coverageRate: Number((exact.length / blueprint.targetWordIds.length).toFixed(3)),
    },
  };
});

const themeMeta = {
  'environment-climate': { label: 'Environment', description: 'Climate systems, natural disasters, and sustainability.' },
  'geography-earth': { label: 'Earth Science', description: 'Planetary structure, geography, and field observation.' },
  'education-learning': { label: 'Education', description: 'Academic thinking, campus life, and structured learning.' },
  'science-technology': { label: 'Science & Tech', description: 'Scientific discovery, chemistry, and modern innovation.' },
  'health-biology': { label: 'Health', description: 'Public health, nutrition, and modern medical systems.' },
};

const articleCards = articles.map((article) => ({
  id: article.id,
  title: article.title,
  theme: article.theme,
  themeLabel: themeMeta[article.theme]?.label || article.theme,
  summary: article.readingGoal,
  wordCount: article.wordCount,
  targetWordCount: article.targetWordIds.length,
  coverageRate: article.coverage.coverageRate,
}));

const appData = {
  generatedAt: new Date().toISOString(),
  stats: {
    vocabularyCount: vocabulary.length,
    articleCount: articles.length,
    avgCoverageRate: Number((articles.reduce((sum, article) => sum + article.coverage.coverageRate, 0) / articles.length).toFixed(3)),
  },
  themes: Object.entries(themeMeta).map(([id, meta]) => ({ id, ...meta })),
  articleCards,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'vocabulary.json'), JSON.stringify(vocabulary, null, 2));
fs.writeFileSync(path.join(outDir, 'articles.json'), JSON.stringify(articles, null, 2));
fs.writeFileSync(path.join(outDir, 'app-data.json'), JSON.stringify(appData, null, 2));

console.log(JSON.stringify({
  vocabularyCount: vocabulary.length,
  articleCount: articles.length,
  avgCoverageRate: appData.stats.avgCoverageRate,
}, null, 2));
