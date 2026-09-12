import "server-only";
import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const b64 = process.env.CANVAS_TOKEN_ENCRYPTION_KEY;
  if (!b64) {
    throw new Error("CANVAS_TOKEN_ENCRYPTION_KEY não configurada");
  }
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error("CANVAS_TOKEN_ENCRYPTION_KEY precisa decodificar para 32 bytes (AES-256)");
  }
  return key;
}

/**
 * Criptografa o token do Canvas. A auth tag do GCM (16 bytes) é concatenada ao
 * final do ciphertext antes do base64, para caber na coluna única
 * `encrypted_token` sem precisar de coluna extra no schema.
 */
export function encryptToken(plainToken: string): { encryptedToken: string; iv: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);

  const ciphertext = Buffer.concat([cipher.update(plainToken, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedToken: Buffer.concat([ciphertext, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptToken(encryptedToken: string, iv: string): string {
  const combined = Buffer.from(encryptedToken, "base64");
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(0, combined.length - AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}
