# Generate Prefixed API Keys

**This is a fork of [seamapi/prefixed-api-key](https://github.com/seamapi/prefixed-api-key)**. Seam-style API Keys have many advantages:

- Double clicking the api key selects the entire api key
- The alphabet is standard across languages thanks [to the base58 RFC](https://datatracker.ietf.org/doc/html/draft-msporny-base58) and its usage in cryptocurrencies
- They are shorter than hex and base32 api keys
- They have prefixes [allowing secret scanning by github](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- They have a hashed component so the server doesn't need to store the api key (reducing attack surface)
- They have unhashed Key IDs which can be mutually used by the server and key bearer/customer to identify the api key
- They default to roughly the same number of entropy bits as UUIDv4

## The Format

API keys look like this:

```
mycompany_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG
```

Let's break down each component of the API key...

```
myapp ..._...  BRTRKFsL ..._...  51FwqftsmMDHHbJAMEXXHCgG
^              ^                 ^
Prefix         Key ID            Secret
```

- The Prefix is used to identify the company or service creating the API Key.
  This is very helpful in secret scanning.
- The Key ID is stored by both the server and the key bearer/customer, it
  can be used to identify an API key in logs or displayed on a customer's
  dashboard. A apiKey can be blocklisted by its Key ID.
- The Secret is how we authenticate this key. The secret is never stored
  on the server, but a hash of it is stored on the server. When we receive an
  incoming request, we search our database for `key_id` and `hash(secret)`.

## Getting Started

```ts
import { generateAPIKey } from '@bencmbrook/prefixed-api-key';

const key = await generateAPIKey({ keyPrefix: 'mycompany' });

// Store the key.secretHash and key.keyId in your database and give
// key.apiKey to your customer.

console.log(key);
/*
{
  keyId: 'BRTRKFsL',
  secretHash: 'd70d981d87b449c107327c2a2afbf00d4b58070d6ba571aac35d7ea3e7c79f37',
  apiKey: 'mycompany_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG'
}
*/
```

## Utility Methods

```ts
import {
  checkApiKey,
  extractKeyId,
  extractSecret,
  getApiKeyComponents,
  hashSecret,
} from '@bencmbrook/prefixed-api-key';

hashSecret('51FwqftsmMDHHbJAMEXXHCgG');
// "d70d981d87b449c107327c2a2afbf00d4b58070d6ba571aac35d7ea3e7c79f37"

extractSecret('mycompany_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG');
// "51FwqftsmMDHHbJAMEXXHCgG"

extractKeyId('mycompany_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG');
// "BRTRKFsL"

getApiKeyComponents('mycompany_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG');
/*
{
  keyId: 'BRTRKFsL',
  secretHash: 'd70d981d87b449c107327c2a2afbf00d4b58070d6ba571aac35d7ea3e7c79f37',
  apiKey: 'mycompany_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG'
}
*/

checkApiKey(
  'mycompany_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG',
  'd70d981d87b449c107327c2a2afbf00d4b58070d6ba571aac35d7ea3e7c79f37',
);
// true
```
