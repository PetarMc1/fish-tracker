const mongoose = require('mongoose');

const ENABLED = String(process.env.REQUEST_LOGGER || 'false').toLowerCase() === 'true';
const LOG_HEADERS = (String(process.env.LOG_HEADERS || 'false').toLowerCase() === 'true');
const LOG_REQ_BODY = (String(process.env.LOG_REQ_BODY || 'false').toLowerCase() === 'true');
const LOG_REQ_RES = (String(process.env.LOG_REQ_RES || 'false').toLowerCase() === 'true');

const { ObjectId } = require('mongodb');

async function listLogs(req, res) {
  try {
    const db = mongoose.connection && mongoose.connection.db;
    if (!db) return res.status(500).json({ error: 'Database not connected' });

    const logs = await db.collection('logs').find({}).sort({ timestamp: -1 }).toArray();
    const mapped = (logs || []).map(l => ({
      id: l._id && l._id.toString ? l._id.toString() : l._id,
      timestamp: l.timestamp,
      method: l.method,
      path: l.path,
      receivedHeaders: l.receivedHeaders,
      sentHeaders: l.sentHeaders,
      requestBody: l.requestBody,
      response: l.response,
      responseCode: l.responseCode,
      durationMs: l.durationMs,
      ip: l.ip
    }));

    return res.json({
      enabled: ENABLED,
      logHeaders: LOG_HEADERS,
      logRequestBody: LOG_REQ_BODY,
      logResponseBody: LOG_REQ_RES,
      count: mapped.length,
      logs: mapped
    });
  } catch (err) {
    console.error('adminLogsController.listLogs error', err && (err.message || err));
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

async function deleteLog(req, res) {
  const { logid } = req.params;
  if (!logid) return res.status(400).json({ error: 'Missing log id' });

  try {
    const db = mongoose.connection && mongoose.connection.db;
    if (!db) return res.status(500).json({ error: 'Database not connected' });

    let oid;
    try { oid = new ObjectId(logid); } catch (e) { return res.status(400).json({ error: 'Invalid log id' }); }

    const result = await db.collection('logs').deleteOne({ _id: oid });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Log not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('adminLogsController.deleteLog error', err && (err.message || err));
    return res.status(500).json({ error: 'Failed to delete log' });
  }
}

module.exports = { listLogs, deleteLog };
