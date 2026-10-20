import app from '../backend/app.js';

export default function handler(req, res) {
  const requestUrl = new URL(req.url, 'http://localhost');
  const route = requestUrl.searchParams.get('__route');

  if (route !== null) {
    requestUrl.searchParams.delete('__route');
    req.url = `/api/${route}${requestUrl.search}`;
  }

  return app(req, res);
}
