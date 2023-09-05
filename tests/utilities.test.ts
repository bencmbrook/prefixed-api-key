import test from 'ava';
import {
  APIKeyObject,
  checkApiKey,
  extractKeyId,
  extractSecret,
  getApiKeyComponents,
  hashSecret,
} from 'src';

const exampleKeyObject: APIKeyObject = {
  keyId: 'BRTRKFsL',
  secretHash:
    'd70d981d87b449c107327c2a2afbf00d4b58070d6ba571aac35d7ea3e7c79f37',
  apiKey: 'mycompany_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG',
};

const secret = extractSecret(exampleKeyObject.apiKey);

test('hashSecret', async (t) => {
  t.is(hashSecret(secret), exampleKeyObject.secretHash);
});
test('extractSecret', async (t) => {
  t.is(extractSecret(exampleKeyObject.apiKey), '51FwqftsmMDHHbJAMEXXHCgG');
});
test('extractKeyId', async (t) => {
  t.is(extractKeyId(exampleKeyObject.apiKey), exampleKeyObject.keyId);
});
test('getApiKeyComponents', async (t) => {
  t.deepEqual(getApiKeyComponents(exampleKeyObject.apiKey), exampleKeyObject);
});
test('checkApiKey', async (t) => {
  t.is(
    await checkApiKey(exampleKeyObject.apiKey, exampleKeyObject.secretHash),
    true,
  );
});
