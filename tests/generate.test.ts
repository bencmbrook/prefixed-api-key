import test from 'ava';
import { extractSecret, generateAPIKey } from 'src';

test('generate api key', async (t) => {
  const apiKeyObject = await generateAPIKey({ keyPrefix: 'mycompany' });

  t.truthy(extractSecret(apiKeyObject.apiKey));
  t.truthy(apiKeyObject.secretHash);
  t.truthy(apiKeyObject.keyId);
  t.truthy(apiKeyObject.apiKey);
});

test('generate api key should throw when there is an invalid keyPrefix', async (t) => {
  await t.throwsAsync(() => generateAPIKey({ keyPrefix: 'my_company' }));
});

test('generate api key should return strings with the correct length', async (t) => {
  const keyIdLength = 10;
  const secretEntropy = 160;
  const apiKeyObject = await generateAPIKey({
    keyPrefix: 'mycompany',
    keyIdLength,
    secretEntropy,
  });

  const secret = extractSecret(apiKeyObject.apiKey);

  t.truthy(secret && secret.length === secretEntropy / 8);
  t.truthy(apiKeyObject.keyId && apiKeyObject.keyId.length === keyIdLength);
});
