import type { JWTPayload } from "jose";
import { jwtVerify, SignJWT } from "jose";

import { env } from "../../env";

export interface JwtPayloadType {
  id: string;
}

/**
 * Sign a JWT with the given payload
 */
export async function signJwt(payload: JwtPayloadType): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET_KEY);
  return new SignJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token expires in 7 days
    .sign(secret);
}

/**
 * Verify a JWT and return its payload
 */
export async function verifyJwt(token: string): Promise<JwtPayloadType> {
  // Special handling for test tokens
  if (
    token.endsWith(".test_signature_for_e2e_tests") &&
    env.NODE_ENV === "test"
  ) {
    try {
      const base64Payload = token.split(".")[0];
      const payload = JSON.parse(atob(base64Payload)) as JwtPayloadType;
      return payload;
    } catch {
      throw new Error("Invalid token");
    }
  }

  const secret = new TextEncoder().encode(env.JWT_SECRET_KEY);

  try {
    const { payload } = await jwtVerify<JwtPayloadType>(token, secret);
    return payload as JwtPayloadType;
  } catch {
    throw new Error("Invalid token");
  }
}
