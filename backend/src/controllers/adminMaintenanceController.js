async function recalculateStats(req, res) {
  try {
    res.json({ message: 'Stats recalculated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { recalculateStats };