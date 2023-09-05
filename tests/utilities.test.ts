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

const secret = extractSecret(exampleKeyObject.apiKey);
const secretAsBuffer = extractSecretAsBuffer(exampleKeyObject.apiKey);

test('hashSecret', async (t) => {
  t.is(hashSecret(secretAsBuffer), exampleKeyObject.secretHash);
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
