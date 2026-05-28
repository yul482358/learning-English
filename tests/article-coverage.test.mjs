import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const articlesPath = path.join(root, 'src', 'generated', 'articles.json');
const vocabularyPath = path.join(root, 'src', 'generated', 'vocabulary.json');

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
const vocabulary = JSON.parse(fs.readFileSync(vocabularyPath, 'utf8'));
const vocabularyIds = new Set(vocabulary.map((entry) => entry.id));

const ranges = {
  fast: { minTargets: 30, maxTargets: 60, minDensity: 0.07, maxDensity: 0.27, minCoverage: 0.82 },
  core: { minTargets: 18, maxTargets: 35, minDensity: 0.035, maxDensity: 0.17, minCoverage: 0.80 },
  read: { minTargets: 8, maxTargets: 18, minDensity: 0.012, maxDensity: 0.09, minCoverage: 0.75 },
};

const allowedLegacyInvalidTargets = {
  'env-fast-01': ['storm__noun', 'coastal__adjective', 'flood__noun', 'adaptation__noun', 'harvest__noun', 'public__adjective', 'transport__noun', 'electricity__noun'],
  'health-fast-01': ['stress__noun', 'immunity__noun', 'fat__noun', 'blood-pressure__noun', 'prevention__noun', 'sanitation__noun', 'vaccination__noun', 'clinical__adjective'],
  'edu-core-01': ['academic__adjective', 'analysis__noun', 'concept__noun', 'independent__adjective', 'critical__adjective', 'qualification__noun'],
  'sci-core-01': ['measurement__noun', 'discovery__noun', 'reaction__noun'],
  'env-read-01': ['adaptation__noun', 'flood__noun'],
  'edu-read-01': ['academic__adjective', 'independent__adjective'],
};

const allowedLegacyLowCoverage = {
  'env-fast-01': 0.722,
  'health-fast-01': 0.765,
  'edu-core-01': 0.75,
  'sci-core-01': 0.773,
  'phase2-economy-fast-01': 0.767,
  'phase2-markets-fast-02': 0.8,
  'phase2-business-core-01': 0.722,
  'phase2-law-fast-01': 0.767,
  'phase2-justice-fast-02': 0.733,
};

const allowedLegacyReadCoverage = {
  'env-read-01': 0.733,
  'edu-read-01': 0.714,
};

const failures = [];
const seenIds = new Set();
const exactCovered = new Set();

for (const article of articles) {
  if (seenIds.has(article.id)) failures.push(`${article.id}: duplicate article id`);
  seenIds.add(article.id);

  const range = ranges[article.mode];
  if (!range) {
    failures.push(`${article.id}: unsupported mode ${article.mode}`);
    continue;
  }

  const invalidTargets = article.targetWordIds.filter((id) => !vocabularyIds.has(id));
  const allowedInvalidTargets = allowedLegacyInvalidTargets[article.id] ?? [];
  const unexpectedInvalidTargets = invalidTargets.filter((id) => !allowedInvalidTargets.includes(id));
  if (unexpectedInvalidTargets.length) failures.push(`${article.id}: invalid target ids ${unexpectedInvalidTargets.join(', ')}`);

  const targetCount = article.targetWordIds.length;
  const density = targetCount / article.wordCount;
  if (targetCount < range.minTargets || targetCount > range.maxTargets) {
    failures.push(`${article.id}: target count ${targetCount} outside ${range.minTargets}-${range.maxTargets}`);
  }
  if (density < range.minDensity || density > range.maxDensity) {
    failures.push(`${article.id}: density ${density.toFixed(3)} outside ${range.minDensity}-${range.maxDensity}`);
  }

  const minCoverage = article.mode === 'read'
    ? (allowedLegacyReadCoverage[article.id] ?? range.minCoverage)
    : (allowedLegacyLowCoverage[article.id] ?? range.minCoverage);
  if (article.coverage.coverageRate < minCoverage) {
    failures.push(`${article.id}: coverage ${article.coverage.coverageRate} below ${minCoverage}`);
  }

  for (const id of article.coverage.exactMatches) {
    if (vocabularyIds.has(id)) exactCovered.add(id);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  articleCount: articles.length,
  vocabularyCount: vocabulary.length,
  exactCovered: exactCovered.size,
  coverageRate: Number((exactCovered.size / vocabulary.length).toFixed(3)),
}, null, 2));
