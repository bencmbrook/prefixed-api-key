import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { base58 } from '@scure/base';

const randomBytesAsync = promisify(randomBytes);

const hashSecretAsBuffer = (secret: string): Buffer =>
  createHash('sha256').update(secret).digest();

export const hashSecret = (secret: string): string =>
  hashSecretAsBuffer(secret).toString('hex');

export interface GenerateAPIKeyOptions {
  /** The prefix for your API key (e.g., `sk-myapp`) */
  keyPrefix: string;
  /** The desired length of the key ID (which is in base58) */
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

  const keyId = base58
    .encode(keyIdBytes)
    .padStart(keyIdLength, '0')
    .slice(0, keyIdLength);

  const secret = base58
    .encode(secretBytes)
    .padStart(secretLength, '0')
    .slice(0, secretLength);

  const apiKey = `${keyPrefix}_${keyId}_${secret}`;
  const secretHash = hashSecret(secret);
  return { keyId, secretHash, apiKey };
};

export const extractKeyId = (apiKey: string) => apiKey.split('_')[1];
export const extractSecret = (apiKey: string) => apiKey.split('_')[2];

export const getApiKeyComponents = (apiKey: string): APIKeyObject => ({
  keyId: extractKeyId(apiKey),
  secretHash: hashSecret(extractSecret(apiKey)),
  apiKey,
});

export const checkApiKey = (
  apiKey: string,
  expectedSecretHash: string,
): boolean => {
  const inputSecretHashBuffer = hashSecretAsBuffer(extractSecret(apiKey));
  const expectedSecretHashBuffer = Buffer.from(expectedSecretHash, 'hex');
  return timingSafeEqual(expectedSecretHashBuffer, inputSecretHashBuffer);
};
