import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { base58 } from '@scure/base';

const randomBytesAsync = promisify(randomBytes);

const hashSecretAsBuffer = (secret: string): Buffer =>
  createHash('sha256').update(secret).digest();

export const hashSecret = (secret: string): string =>
  hashSecretAsBuffer(secret).toString('hex');

export interface GenerateAPIKeyOptions {
  keyPrefix: string;
  /** The desired length of the key ID (which is in base58) */
  keyIdLength?: number;
  /** The entropy of the secret in bits. Defaults to 128. */
  secretEntropy?: number;
}

export const generateAPIKey = async ({
  keyPrefix,
  keyIdLength = 8,
  secretEntropy = 128,
}: GenerateAPIKeyOptions) => {
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

  const token = `${keyPrefix}_${keyId}_${secret}`;
  const secretHash = hashSecret(secret);
  return { keyId, secret, secretHash, token };
};

export const extractKeyId = (token: string) => token.split('_')[1];
export const extractSecret = (token: string) => token.split('_')[2];

export const getTokenComponents = (token: string) => ({
  keyId: extractKeyId(token),
  secret: extractSecret(token),
  secretHash: hashSecret(extractSecret(token)),
  token,
});

export const checkAPIKey = (
  token: string,
  expectedSecretHash: string,
): boolean => {
  const expectedSecretHashBuffer = Buffer.from(expectedSecretHash, 'hex');
  const inputSecretHashBuffer = hashSecretAsBuffer(extractSecret(token));
  return timingSafeEqual(expectedSecretHashBuffer, inputSecretHashBuffer);
};
