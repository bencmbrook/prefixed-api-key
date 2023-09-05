import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { base58 } from '@scure/base';

const randomBytesAsync = promisify(randomBytes);

const hashSecretAsBuffer = (secret: Buffer): Buffer =>
  createHash('sha256').update(secret).digest();

export const hashSecret = (secret: Buffer): string =>
  base58.encode(hashSecretAsBuffer(secret));

export interface GenerateAPIKeyOptions {
  /** The prefix for your API key (e.g., `sk-myapp`) */
  keyPrefix: string;
  /** The desired length of the key ID (which is in base58). Defaults to 8. */
  keyIdLength?: number;
  /** The entropy of the secret in bits. Defaults to 128. */
  secretEntropy?: number;
}

export interface APIKeyObject {
  /** A random identifier for this key. Not a secret. Should be stored in the DB. */
  keyId: string;
  /** A hash of the secret. Should be stored in the DB. */
  secretHash: string;
  /** The fully formed token to give to the API client */
  apiKey: string;
}

export const generateAPIKey = async ({
  keyPrefix,
  keyIdLength = 8,
  secretEntropy = 128,
}: GenerateAPIKeyOptions): Promise<APIKeyObject> => {
  if (secretEntropy % 8 !== 0) {
    throw new Error(
      '`secretEntropy` must be a multiple of 8 so it can fill a byte string.',
    );
  }
  if (!keyPrefix || keyPrefix.includes('_')) {
    throw new Error(
      'You must provide a `keyPrefix`, and it must not include `_` characters.',
    );
  }

  // Get the length of the random strings, in bytes
  const secretLength = secretEntropy / 8;

  const [keyIdBytes, secretBytes] = await Promise.all([
    randomBytesAsync(keyIdLength),
    randomBytesAsync(secretLength),
  ]);

  const keyId = base58.encode(keyIdBytes);
  const secret = base58.encode(secretBytes);

  const apiKey = `${keyPrefix}_${keyId}_${secret}`;
  const secretHash = hashSecret(secretBytes);
  return { keyId, secretHash, apiKey };
};

const extractParts = (apiKey: string): string[] => {
  if (typeof apiKey !== 'string') {
    throw new Error('apiKey must be a string');
  }
  const parts = apiKey.split('_');
  if (parts.length !== 3 || parts.some((part) => part.length < 1)) {
    throw new Error(
      'Unexpected API key format. There should be 3 parts separate by `_`.',
    );
  }
  return parts;
};

export const extractKeyId = (apiKey: string) => extractParts(apiKey)[1];
export const extractSecret = (apiKey: string) => extractParts(apiKey)[2];
export const extractSecretAsBuffer = (apiKey: string): Buffer =>
  Buffer.from(base58.decode(extractSecret(apiKey)));

export const getAPIKeyObject = (apiKey: string): APIKeyObject => ({
  keyId: extractKeyId(apiKey),
  secretHash: hashSecret(extractSecretAsBuffer(apiKey)),
  apiKey,
});

/**
 * Verify the client's provided API Key
 *
 * @param inputAPIKey - the client-provided API key
 * @param expectedSecretHash - the secret hash stored in the DB (base58 encoded)
 * @returns true if the API key is valid, false otherwise
 */
export const checkAPIKey = (
  inputAPIKey: string,
  expectedSecretHash: string,
): boolean => {
  const inputSecretHashBuffer = hashSecretAsBuffer(
    extractSecretAsBuffer(inputAPIKey),
  );
  const expectedSecretHashBuffer = Buffer.from(
    base58.decode(expectedSecretHash),
  );
  return timingSafeEqual(expectedSecretHashBuffer, inputSecretHashBuffer);
};
