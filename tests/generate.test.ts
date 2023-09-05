import test from 'ava';
import { generateAPIKey } from 'src';

test('generate api key', async (t) => {
  const apiKey = await generateAPIKey({ keyPrefix: 'mycompany' });

  t.truthy(apiKey.secret);
  t.truthy(apiKey.secretHash);
  t.truthy(apiKey.keyId);
  t.truthy(apiKey.token);
});

test('generate api key should return an empty object when there is no keyPrefix', async (t) => {
  const apiKey = await generateAPIKey();

  t.falsy(apiKey.secret);
  t.falsy(apiKey.secretHash);
  t.falsy(apiKey.keyId);
  t.falsy(apiKey.token);
});

test('generate api key should return strings with the correct length', async (t) => {
  const keyIdEntropy = 80;
  const secretEntropy = 160;
  const apiKey = await generateAPIKey({
    keyPrefix: 'mycompany',
    keyIdEntropy: keyIdEntropy,
    secretEntropy: secretEntropy,
  });

  t.truthy(apiKey.secret && apiKey.secret.length === secretEntropy / 8);
  t.truthy(apiKey.keyId && apiKey.keyId.length === keyIdEntropy / 8);
});
