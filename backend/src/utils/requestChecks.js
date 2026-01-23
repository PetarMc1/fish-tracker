function ensureMethod(req, res, method) {
  if (req.method !== method) {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return false;
  }
  return true;
}

function parseUrl(req) {
  return new URL(req.url, `http://${req.headers.host}`);
}

function requireQueryParam(req, res, name) {
  const url = parseUrl(req);
  const v = url.searchParams.get(name);
  if (!v) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `Missing ${name} in query params` }));
    return null;
  }
  return v;
}

function requireHeaderOrQuery(req, res, headerName, queryName, missingMessage) {
  const header = req.headers[headerName];
  if (typeof header === 'string' && header.length > 0) return header;
  const url = parseUrl(req);
  const v = url.searchParams.get(queryName);
  if (v) return v;
  res.writeHead(400, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: missingMessage || `Missing ${queryName} parameter` }));
  return null;
}

module.exports = { ensureMethod, requireQueryParam, requireHeaderOrQuery };
