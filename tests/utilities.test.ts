import test from 'ava';
import {
  checkToken,
  extractKeyId,
  extractSecret,
  getTokenComponents,
  hashSecret,
} from 'src';

const exampleKey = {
  keyId: 'BRTRKFsL',
  secret: '51FwqftsmMDHHbJAMEXXHCgG',
  secretHash:
    'd70d981d87b449c107327c2a2afbf00d4b58070d6ba571aac35d7ea3e7c79f37',
  token: 'mycompany_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG',
};

test('hashSecret', async (t) => {
  t.is(hashSecret(exampleKey.secret), exampleKey.secretHash);
});
test('extractSecret', async (t) => {
  t.is(extractSecret(exampleKey.token), exampleKey.secret);
});
test('extractKeyId', async (t) => {
  t.is(extractKeyId(exampleKey.token), exampleKey.keyId);
});
test('getTokenComponents', async (t) => {
  t.deepEqual(getTokenComponents(exampleKey.token), exampleKey);
});
test('checkToken', async (t) => {
  t.is(await checkToken(exampleKey.token, exampleKey.secretHash), true);
});
