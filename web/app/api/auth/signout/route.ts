import { NextResponse } from "next/server";
import * as oauth from "oauth4webapi";

export async function GET() {
  const issuer: URL = new URL(process.env.AUTH_KEYCLOAK_ISSUER!);
  const client_id: string = process.env.AUTH_KEYCLOAK_CLIENT_ID!;
  const client_secret: string = process.env.AUTH_KEYCLOAK_CLIENT_SECRET!;
  const redirect_uri: string = process.env.AUTH_KEYCLOAK_REDIRECT_URI!;

  const as = await oauth
    .discoveryRequest(issuer, { algorithm: 'oidc' })
    .then((response) => oauth.processDiscoveryResponse(issuer, response))

  const logoutUrl = new URL(as.end_session_endpoint!);
  return NextResponse.redirect(logoutUrl);
}
