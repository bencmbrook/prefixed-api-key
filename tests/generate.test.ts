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
