import { NextResponse } from "next/server";
import * as oauth from "oauth4webapi";

export async function GET() {
  // console.log(process.env);
  console.log("authorization request start");

  const issuer: URL = new URL(process.env.AUTH_KEYCLOAK_ISSUER!);
  const client_id: string = process.env.AUTH_KEYCLOAK_CLIENT_ID!;
  const client_secret: string = process.env.AUTH_KEYCLOAK_CLIENT_SECRET!;
  const redirect_uri: string = process.env.AUTH_KEYCLOAK_REDIRECT_URI!;

  console.log(issuer);
  const as = await oauth
    .discoveryRequest(issuer, { algorithm: 'oidc' })
    .then((response) => oauth.processDiscoveryResponse(issuer, response))

  const client: oauth.Client = {
    client_id,
    client_secret,
    token_endpoint_auth_method: 'client_secret_basic',
  }

  const code_challenge_method = 'S256'

  // const code_verifier = oauth.generateRandomCodeVerifier();
  const code_verifier = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
  const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);

  if (as.authorization_endpoint === undefined) {
    return NextResponse.json({ message: 'Missing authorization_endpoint' });
  }

  const authorizationUrl = new URL(as.authorization_endpoint);
  authorizationUrl.searchParams.set('client_id', client.client_id);
  authorizationUrl.searchParams.set('redirect_uri', redirect_uri);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid');
  authorizationUrl.searchParams.set('code', crypto.randomUUID());
  authorizationUrl.searchParams.set('code_challenge', code_challenge);
  authorizationUrl.searchParams.set('code_challenge_method', code_challenge_method);

  if (as.code_challenge_methods_supported?.includes('S256') !== true) {
    // const nonce = oauth.generateRandomNonce()
    const nonce = "7b880da2-53b4-4c24-b5d4-23f3a55d6e00";
    authorizationUrl.searchParams.set('nonce', nonce);
  }

  console.log("authorization request end");
  return NextResponse.redirect(authorizationUrl.href);
}
