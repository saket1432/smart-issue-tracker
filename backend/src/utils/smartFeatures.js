const priorityRank = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

const calculatePriorityScore = ({ adminPriority = 'medium', impact = 1, urgency = 1, ageHours = 0 }) => {
  const score =
    priorityRank[adminPriority] * 20 +
    Number(impact) * 20 +
    Number(urgency) * 25 +
    Math.min(ageHours * 2, 30);

  return Math.min(Math.max(score, 0), 100);
};

const getSlaDeadline = (createdAt, urgency = 1) => {
  const hoursMap = {
    1: 24,
    2: 16,
    3: 8,
    4: 4,
  };

  const hours = hoursMap[urgency] || 24;
  return new Date(new Date(createdAt).getTime() + hours * 60 * 60 * 1000);
};

const normalizeWords = (text = '') => String(text)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .split(/\s+/)
  .filter((word) => word && !['a', 'an', 'and', 'are', 'for', 'from', 'in', 'is', 'it', 'of', 'on', 'the', 'to', 'with', 'issue', 'problem'].includes(word));

const findDuplicateTickets = async (TicketModel, title, category, excludeId = null) => {
  if (!title || !category) return [];

  const titleWords = [...new Set(normalizeWords(title))];
  if (!titleWords.length) return [];

  const filter = {
    status: { $in: ['open', 'in_progress', 'pending', 'resolved'] },
    category: { $regex: `^${String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    $or: titleWords.slice(0, 5).map((word) => ({ title: { $regex: word, $options: 'i' } })),
  };
  if (excludeId) filter._id = { $ne: excludeId };

  const candidates = await TicketModel.find(filter)
    .select('title category status resolutionNotes duplicateOf')
    .sort({ createdAt: 1 })
    .limit(100);
  return candidates.map((candidate) => {
    const candidateWords = [...new Set(normalizeWords(candidate.title))];
    const overlap = titleWords.filter((word) => candidateWords.includes(word)).length;
    const similarity = overlap / Math.max(Math.min(titleWords.length, candidateWords.length), 1);
    return { candidate, similarity };
  })
    .filter(({ candidate }) => candidate.status !== 'resolved' || candidate.resolutionNotes)
    .filter(({ similarity }) => similarity >= 0.67)
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, 5)
    .map(({ candidate }) => candidate);
};

module.exports = {
  calculatePriorityScore,
  getSlaDeadline,
  findDuplicateTickets,
};
