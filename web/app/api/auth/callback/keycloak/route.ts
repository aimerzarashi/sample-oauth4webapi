import { NextResponse } from "next/server";
import { cookies } from 'next/headers'
import * as oauth from "oauth4webapi";

export async function GET(request: Request) {
  console.log("callback start");

  const issuer: URL = new URL(process.env.AUTH_KEYCLOAK_ISSUER!);
  const client_id: string = process.env.AUTH_KEYCLOAK_CLIENT_ID!;
  const client_secret: string = process.env.AUTH_KEYCLOAK_CLIENT_SECRET!;
  const redirect_uri: string = process.env.AUTH_KEYCLOAK_REDIRECT_URI!;

  const as = await oauth
    .discoveryRequest(issuer, { algorithm: 'oidc' })
    .then((response) => oauth.processDiscoveryResponse(issuer, response))

  const client: oauth.Client = {
    client_id,
    client_secret,
    token_endpoint_auth_method: 'client_secret_basic',
  }

  // const code_verifier = oauth.generateRandomCodeVerifier();
  const code_verifier = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";

  const currentURL = new URL(request.url);

  const params = oauth.validateAuthResponse(as, client, currentURL);
  if (oauth.isOAuth2Error(params)) {
    console.error('Error Response', params);
    throw new Error(); // Handle OAuth 2.0 redirect error
  }

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    params,
    redirect_uri,
    code_verifier,
  )

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.error('WWW-Authenticate Challenge', challenge)
    }
    throw new Error() // Handle WWW-Authenticate Challenges as needed
  }

  const nonce = "7b880da2-53b4-4c24-b5d4-23f3a55d6e00";
  const result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response)
  if (oauth.isOAuth2Error(result)) {
    console.error('Error Response', result)
    throw new Error() // Handle OAuth 2.0 response body error
  }

  console.log('Access Token Response', result)
  const { access_token } = result;
  const claims = oauth.getValidatedIdTokenClaims(result)
  console.log('ID Token Claims', claims)
  const { sub } = claims;

  const userResponse = await oauth.userInfoRequest(as, client, access_token)
  {
    let challenges: oauth.WWWAuthenticateChallenge[] | undefined
    if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
      for (const challenge of challenges) {
        console.error('WWW-Authenticate Challenge', challenge)
      }
      throw new Error() // Handle WWW-Authenticate Challenges as needed
    }
  }
  const userResult = await oauth.processUserInfoResponse(as, client, sub, userResponse)
  console.log('UserInfo Response', userResult)

  console.log("callback end");
  return NextResponse.json({
    result: result,
    id_token: claims,
    user_info: userResult,
  });
}