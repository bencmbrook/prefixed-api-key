import test from 'ava';
import { generateAPIKey } from 'src';

test('generate api key', async (t) => {
  const apiKey = await generateAPIKey({ keyPrefix: 'mycompany' });

  t.truthy(apiKey.secret);
  t.truthy(apiKey.secretHash);
  t.truthy(apiKey.keyId);
  t.truthy(apiKey.token);
});

test('generate api key should throw when there is an invalid keyPrefix', async (t) => {
  await t.throwsAsync(() => generateAPIKey({ keyPrefix: 'my_company' }));
});

test('generate api key should return strings with the correct length', async (t) => {
  const keyIdLength = 10;
  const secretEntropy = 160;
  const apiKey = await generateAPIKey({
    keyPrefix: 'mycompany',
    keyIdLength,
    secretEntropy,
  });

  t.truthy(apiKey.secret && apiKey.secret.length === secretEntropy / 8);
  t.truthy(apiKey.keyId && apiKey.keyId.length === keyIdLength);
});
