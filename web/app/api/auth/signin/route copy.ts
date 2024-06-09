import { createHash } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const issuer: URL = new URL(process.env.AUTH_KEYCLOAK_ISSUER!);
  const client_id: string = process.env.AUTH_KEYCLOAK_CLIENT_ID!;
  const client_secret: string = process.env.AUTH_KEYCLOAK_CLIENT_SECRET!;
  const redirect_uri: string = process.env.AUTH_KEYCLOAK_REDIRECT_URI!;

  const response_type = "code";
  const scope = "openid";

  const state = crypto.randomUUID();
  const nonce = "592775d0-dc8d-43a9-af82-5283b69b674a";
  const code_verification_method = "S256";
  const code_verifier = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
  const hash = createHash("sha256");
  hash.update(code_verifier);
  const code_challenge = hash.digest("base64url");

  const request = new URL('https://idp.aimerzarashi.com/realms/demo/protocol/openid-connect/auth');
  request.searchParams.append('client_id', client_id);
  request.searchParams.append('response_type', response_type);
  request.searchParams.append('scope', scope);
  request.searchParams.append('redirect_uri', redirect_uri);
  request.searchParams.append('state', state);
  request.searchParams.append('nonce', nonce);
  request.searchParams.append('code_challenge', code_challenge);
  request.searchParams.append('code_challenge_method', code_verification_method);
  return NextResponse.redirect(request);
}
