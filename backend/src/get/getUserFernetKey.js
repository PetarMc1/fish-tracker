const UserModel = require('../models/User');

async function getUserFernetKey(req, res) {
  const { ensureMethod, parseUrl } = require('../utils/requestChecks');
  if (!ensureMethod(req, res, 'GET')) return;

  // Disallow any query params for this endpoint
  const url = parseUrl(req);
  if ([...url.searchParams.keys()].length > 0) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "This endpoint requires HTTP Basic Auth; query params are not allowed." }));
    return;
  }

  const auth = req.headers && req.headers.authorization;
  if (!auth || typeof auth !== 'string' || !auth.toLowerCase().startsWith('basic ')) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Authorization header with Basic credentials required" }));
    return;
  }

  let userName = null;
  let password = null;
  try {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    if (idx === -1) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid authorization format" }));
      return;
    }
    userName = decoded.slice(0, idx);
    password = decoded.slice(idx + 1);
  } catch (e) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid authorization" }));
    return;
  }

  try {
    const user = await UserModel.findByName(userName);
    if (!user || user.userPassword !== password || !user.fernetKey) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found or invalid password" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ fernetKey: user.fernetKey }));
  } catch (err) {
    console.error('getUserFernetKey error', err && (err.message || err));
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Database query failed" }));
  }
}

module.exports = { getUserFernetKey };
