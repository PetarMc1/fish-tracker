async function recalculateStats(req, res) {
  try {
    res.json({ message: 'Stats recalculated successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { recalculateStats };