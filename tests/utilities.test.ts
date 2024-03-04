import { randomBytes } from 'node:crypto';
import { base58 } from '@scure/base';
import test from 'ava';
import {
  APIKeyObject,
  checkAPIKey,
  extractKeyId,
  extractSecret,
  extractSecretAsBuffer,
  getAPIKeyObject,
  hashSecret,
} from 'src';

const exampleKeyObject: APIKeyObject = {
  keyId: '25RbpSyxVex',
  secretHash: 'EqrEJ1mg3RifmHL3rv2dRVuKuF43jqPbSqmhpuSeXxKF',
  apiKey: 'mycompany_25RbpSyxVex_Gp6TRzhNvYA5GonfggbvNU',
};

test('hashSecret', async (t) => {
  t.is(
    hashSecret(extractSecretAsBuffer(exampleKeyObject.apiKey)),
    exampleKeyObject.secretHash,
  );
});
test('extractSecret', async (t) => {
  t.is(extractSecret(exampleKeyObject.apiKey), 'Gp6TRzhNvYA5GonfggbvNU');
});
test('extractKeyId', async (t) => {
  t.is(extractKeyId(exampleKeyObject.apiKey), exampleKeyObject.keyId);
});
test('getAPIKeyObject', async (t) => {
  t.deepEqual(getAPIKeyObject(exampleKeyObject.apiKey), exampleKeyObject);
});
test('checkAPIKey', async (t) => {
  t.is(
    await checkAPIKey(exampleKeyObject.apiKey, exampleKeyObject.secretHash),
    true,
  );
});

/**
 * @scure/base is only used to encode and decode strings
 *
 * We trust it to
 * - (A) Preserve integrity of key (and thus, its entropy)
 * - (B) Not leak the key through some side effect
 *
 * This tests for (A)
 */
const inputFixture = new Uint8Array(
  Buffer.from(
    'aa0187becd7829b2d60cd8456dfb886af80b304804c17bc5b919c6b32e534736',
    'hex',
  ),
);
const encodedFixture = 'CSdfPvBnXbrc2RyiUZAFoAkiHaSt2Z56pV3txmTKtfzV';
test('base58 encode - inputFixture encodes as expected', async (t) => {
  t.is(base58.encode(inputFixture), encodedFixture);
});
test('base58 decode - encodedFixture decodes as expected', async (t) => {
  t.deepEqual(base58.decode(encodedFixture), inputFixture);
});
test('base58 encode/decode', async (t) => {
  const input = new Uint8Array(randomBytes(256));
  const encoded = base58.encode(input);
  t.assert(encoded.length > 340);
  const output = base58.decode(encoded);
  t.deepEqual(input, output);
});
