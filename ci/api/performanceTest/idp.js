import http from 'k6/http';
/**
 * Authenticate using OAuth against IDP
 * @function
 * @param  {string} idpTokenEndpoint - idp token endpoint 
 * @param  {string} clientId - For the client in the realm you want to use
 * @param  {string} clientSecret - For the client in the realm you want to use
 * @param  {string} scope - Space-separated list of scopes
 * @param  {string|object} resource - Either a resource ID (as string) or an object containing username and password
 */
export function authenticateUsingIDP(idpTokenEndpoint, clientId, clientSecret, scope, resource) {
  let url = idpTokenEndpoint;
  const requestBody = { scope: scope };
  let response;
  if (typeof resource == 'string') {
    requestBody['grant_type'] = 'client_credentials';
    const encodedCredentials = encoding.b64encode(clientId.concat(':', clientSecret));
    const params = {
      auth: 'basic',
      headers: {
        Authorization: 'Basic '.concat(encodedCredentials),
      },
    };
    response = http.post(url, requestBody, params);
  } else if (
    typeof resource == 'object' &&
    resource.hasOwnProperty('username') &&
    resource.hasOwnProperty('password')
  ) {
    requestBody['grant_type'] = 'password';
    requestBody['username'] = resource.username;
    requestBody['password'] = resource.password;
    requestBody['client_id'] = clientId;
    requestBody['client_secret'] = clientSecret;
    response = http.post(url, requestBody);
  } else {
    throw 'resource should be either a string or an object containing username and password';
  }
  return response.json();
}
