import 'whatwg-fetch';
import { getEncryptedToken } from 'utils/token';

const API_ROOT = process.env.REACT_APP_API_ROOT;

function checkStatus(res) {
  if ((res.status >= 200 && res.status < 300) || res.status === 422) {
    return res;
  }

  throw new Error(res.statusText + '. Please try again later.');
}

function parseJSON(res) {
  return res.json();
}

function checkError(json) {
  if (json.error) {
    throw new Error(json.error);
  }

  return json
}

function getQueryString(params) {
  return Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
}

function request(method, path, params, shouldAuthenticate) {
  var qs = '';
  var body;
  var headers = (params && params.headers) || {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (shouldAuthenticate) {
    headers['Authorization'] = 'Token token=' + getEncryptedToken();
  }

  if (['GET', 'DELETE'].indexOf(method) > -1) {
    qs = '?' + getQueryString(params || {});
  } else { // POST or PUT
    body = JSON.stringify(params || {});
  }
  var url = API_ROOT + path + qs;

  return fetch(url, { method, headers, body })
    .then(checkStatus)
    .then(parseJSON)
    .then(checkError);
}

export default {
  get: (path, params, shouldAuthenticate = false) => request('GET', path, params, shouldAuthenticate),
  post: (path, params, shouldAuthenticate = false) => request('POST', path, params, shouldAuthenticate),
  put: (path, params, shouldAuthenticate = false) => request('PUT', path, params, shouldAuthenticate),
  delete: (path, params, shouldAuthenticate = false) => request('DELETE', path, params, shouldAuthenticate),
  refreshPost: (content) => request('PATCH', `/posts/refresh/@${content.author}/${content.permlink}.json`, {
    post: {
      active_votes: content.active_votes,
      payout_value: content.payout_value,
      children: content.children,
    }
  }, true),
};
