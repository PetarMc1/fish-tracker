const mongoose = require('mongoose');

const ENABLED = String(process.env.REQUEST_LOGGER || 'false').toLowerCase() === 'true';
const LOG_HEADERS = (String(process.env.LOG_HEADERS || 'false').toLowerCase() === 'true');
const LOG_REQ_BODY = (String(process.env.LOG_REQ_BODY || 'false').toLowerCase() === 'true');
const LOG_REQ_RES = (String(process.env.LOG_REQ_RES || 'false').toLowerCase() === 'true');
const MAX_BODY_CHARS = parseInt(process.env.REQUEST_LOGGER_MAX_BODY_CHARS || '10000', 10);

function maskHeaders(headers) {
  if (!headers) return headers;
  const copy = { ...headers };
  if (copy.authorization) copy.authorization = 'REDACTED';
  if (copy.cookie) copy.cookie = 'REDACTED';
  return copy;
}

function safeStringify(obj) {
  const util = require('util');
  try {
    if (typeof obj === 'string') {
      if (obj.length > MAX_BODY_CHARS) return obj.slice(0, MAX_BODY_CHARS) + '... (truncated)';
      return obj;
    }

    if (Buffer.isBuffer(obj)) {
      const b64 = obj.toString('base64');
      if (b64.length > MAX_BODY_CHARS) return b64.slice(0, MAX_BODY_CHARS) + '... (truncated base64)';
      return b64;
    }

    const seen = new WeakSet();
    const s = JSON.stringify(obj, function (key, value) {
      if (typeof value === 'bigint') return value.toString() + 'n';
      if (typeof value === 'function') return `Function:${value.name || 'anonymous'}`;
      if (typeof value === 'symbol') return value.toString();
      if (value instanceof Error) return { message: value.message, stack: value.stack };
      if (value && typeof value === 'object') {
        if (seen.has(value)) return 'CIRCULAR';
        seen.add(value);
      }
      return value;
    });

    if (s && s.length > MAX_BODY_CHARS) return s.slice(0, MAX_BODY_CHARS) + '... (truncated)';
    return s;
  } catch (err) {
    try {
      const inspected = util.inspect(obj, { depth: 4, breakLength: Infinity, maxArrayLength: 50 });
      if (inspected.length > MAX_BODY_CHARS) return inspected.slice(0, MAX_BODY_CHARS) + '... (truncated)';
      return inspected;
    } catch (e) {
      return null;
    }
  }
}

module.exports = function requestLogger(req, res, next) {
  if (!ENABLED) return next();

  const start = Date.now();
  const { method, originalUrl, headers } = req;

  const shouldLogHeaders = LOG_HEADERS;
  const shouldLogReqBody = LOG_REQ_BODY;
  const shouldLogResBody = LOG_REQ_RES;
  const recordedReceivedHeaders = shouldLogHeaders ? maskHeaders(headers) : undefined;

  let responseChunks = [];
  const originalWrite = res.write;
  const originalEnd = res.end;

  if (shouldLogResBody) {
    res.write = function (chunk, encoding, callback) {
      try {
        if (chunk) responseChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      } catch (e) {}
      return originalWrite.apply(res, arguments);
    };

    res.end = function (chunk, encoding, callback) {
      try {
        if (chunk) responseChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      } catch (e) {}
      return originalEnd.apply(res, arguments);
    };
  }

  let recordedRequestBody = null;
  if (shouldLogReqBody) {
    const ct = (req.headers && req.headers['content-type']) || '';
    if (ct.includes('application/octet-stream') || ct.includes('multipart/form-data')) {
      recordedRequestBody = 'BINARY';
    } else if (typeof req.body !== 'undefined') {
      recordedRequestBody = safeStringify(req.body);
    } else {
      recordedRequestBody = null;
    }
  }

  res.on('finish', async () => {
    const duration = Date.now() - start;

    const sentHeadersObj = shouldLogHeaders ? maskHeaders(res.getHeaders && res.getHeaders()) : undefined;

    let recordedResponseBody = null;
    if (shouldLogResBody) {
      try {
        const buffer = Buffer.concat(responseChunks || []);
        const ct = (res.getHeader && res.getHeader('content-type')) || '';
        if (ct && (ct.includes('application/octet-stream') || ct.includes('multipart/form-data'))) {
          recordedResponseBody = buffer && buffer.length ? 'BINARY' : null;
        } else if (buffer && buffer.length) {
          const s = buffer.toString('utf8');
          recordedResponseBody = safeStringify(s);
        } else {
          recordedResponseBody = null;
        }
      } catch (e) {
        recordedResponseBody = null;
      }
    }

    const logDoc = {
      timestamp: new Date(),
      method,
      path: originalUrl,
      receivedHeaders: recordedReceivedHeaders,
      sentHeaders: sentHeadersObj,
      requestBody: recordedRequestBody,
      response: recordedResponseBody,
      responseCode: res.statusCode,
      durationMs: duration,
      ip: req.ip || req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress)
    };

    try {
      const db = mongoose.connection && mongoose.connection.db;
      if (db) {
        await db.collection('logs').insertOne(logDoc);
      }
    } catch (err) {
      console.error('requestLogger: failed to write log', err && (err.message || err));
    }
  });

  next();
};
