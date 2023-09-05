import test from 'ava';
import {
  APIKeyObject,
  checkAPIKey,
  extractKeyId,
  extractSecret,
  getAPIKeyComponents,
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
test('getAPIKeyComponents', async (t) => {
  t.deepEqual(getAPIKeyComponents(exampleKeyObject.apiKey), exampleKeyObject);
});
test('checkAPIKey', async (t) => {
  t.is(
    await checkAPIKey(exampleKeyObject.apiKey, exampleKeyObject.secretHash),
    true,
  );
});
