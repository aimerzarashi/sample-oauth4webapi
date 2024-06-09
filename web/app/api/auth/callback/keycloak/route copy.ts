import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const issuer: URL = new URL(process.env.AUTH_KEYCLOAK_ISSUER!);
  const client_id: string = process.env.AUTH_KEYCLOAK_CLIENT_ID!;
  const client_secret: string = process.env.AUTH_KEYCLOAK_CLIENT_SECRET!;
  const redirect_uri: string = process.env.AUTH_KEYCLOAK_REDIRECT_URI!;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ message: "Missing code" });
  }

  const code_verifier = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";

  const response = await fetch(
    "http://idp:8080/realms/demo/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}&code_verifier=${code_verifier}`,
    }
  );

  const data = await response.json();
  if (!data) {
    return NextResponse.json({ message: "Missing data" });
  }

  return NextResponse.json({ message: data });
}
