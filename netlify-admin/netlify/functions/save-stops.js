exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { password, waypoints } = body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  if (!Array.isArray(waypoints)) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'waypoints must be an array' }) };
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo  = process.env.GITHUB_REPO;
  const path  = process.env.DATA_FILE_PATH || 'data.json';

  if (!token || !owner || !repo) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Fetch current file to get its SHA (required for update)
  const getRes = await fetch(apiBase, { headers: ghHeaders });
  if (!getRes.ok) {
    const err = await getRes.json().catch(() => ({}));
    return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: 'Failed to fetch current file: ' + (err.message || getRes.status) }) };
  }
  const getJson = await getRes.json();

  // Write updated data
  const content = Buffer.from(JSON.stringify(waypoints, null, 2)).toString('base64');
  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers: ghHeaders,
    body: JSON.stringify({
      message: `Update journey stops (${new Date().toISOString().slice(0, 10)})`,
      content,
      sha: getJson.sha,
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: 'Failed to save: ' + (err.message || putRes.status) }) };
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ ok: true }),
  };
};
