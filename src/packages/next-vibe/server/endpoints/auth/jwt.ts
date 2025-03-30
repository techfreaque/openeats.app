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
  return await new SignJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token expires in 7 days
    .sign(secret);
}

/**
 * Verify a JWT and return its payload
 */
export async function verifyJwt(token: string): Promise<JwtPayloadType> {
  const secret = new TextEncoder().encode(env.JWT_SECRET_KEY);
  try {
    const { payload } = await jwtVerify<JwtPayloadType>(token, secret);
    return payload as JwtPayloadType;
  } catch {
    throw new Error("Invalid token");
  }
}
