import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { base58 } from '@scure/base';

const hashSecretAsBuffer = (secret: string): Buffer =>
  createHash('sha256').update(secret).digest();

export const hashSecret = (secret: string): string =>
  hashSecretAsBuffer(secret).toString('hex');

export interface GenerateAPIKeyOptions {
  keyPrefix: string;
  keyIdEntropy?: number;
  secretEntropy?: number;
}

export const generateAPIKey = async ({
  keyPrefix,
  keyIdEntropy = 64,
  secretEntropy = 128,
}: GenerateAPIKeyOptions) => {
  if (!keyPrefix || keyPrefix.includes('_')) {
    throw new Error(
      'You must provide a `keyPrefix`, and it must not include `_` characters.',
    );
  }

  const keyIdLength = keyIdEntropy / 8;
  const secretLength = secretEntropy / 8;

  const generatedRandomBytes = promisify(randomBytes);
  const [keyIdBytes, secretBytes] = await Promise.all([
    // you need ~0.732 * length bytes, but it's fine to have more bytes
    generatedRandomBytes(keyIdLength),
    generatedRandomBytes(secretLength),
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

export const extractSecret = (token: string) => token.split('_').slice(-1)?.[0];

export const extractKeyId = (token: string) => token.split('_')?.[1];

export const extractSecretHash = (token: string) =>
  hashSecret(extractSecret(token));

export const getTokenComponents = (token: string) => ({
  secret: extractSecret(token),
  keyId: extractKeyId(token),
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
