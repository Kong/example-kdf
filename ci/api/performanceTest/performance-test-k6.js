import http from 'k6/http';
import { authenticateUsingIDP } from './idp.js';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

const IDP_USERNAME = '${username}';
const IDP_PASSWORD = '${password}';
const IDP_CLIENT_ID = '${idp_client_id}';
const IDP_CLIENT_SECRET = '${idp_client_secret}';
const IDP_TOKEN_ENDPOINT = '${idp_token_endpoint}';
const IDP_SCOPES = 'openid';

const KONG_APIKEY= '${app_api_key}';

const APPLICATION_URL = '${app_url}';

// A simple counter for http requests
export const requests = new Counter('http_reqs');
export const options = {
  insecureSkipTLSVerify: true,
  stages: [
    { target: 20, duration: '5s' },
    { target: 15, duration: '5s' },
    { target: 0, duration: '5s' },
  ],
  thresholds: {
    requests: ['count < 100'],
  },
};

export function setup() {
  let idpPassAuth = authenticateUsingIDP(IDP_TOKEN_ENDPOINT, IDP_CLIENT_ID, IDP_CLIENT_SECRET, IDP_SCOPES,
  {
    username: IDP_USERNAME,
    password: IDP_PASSWORD
  });
  return idpPassAuth;
}

export default function (data) {
  let params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer '.concat(data.access_token),
      apikey: KONG_APIKEY,
    },
  };

  let appUrl = APPLICATION_URL;
  const res = http.get(appUrl, params);

  sleep(1);

  const checkRes = check(res, {
    'status is 200': r => r.status === 200,
  });

}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data),
  }
}
