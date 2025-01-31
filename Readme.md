# ton-wallet-pregenator-web3auth

This script demonstrates how to pre-generate Ton wallets using Web3Auth.

You can use this script to pre-generate Ton wallets for your users without them need to login in your app.

Later when they login in your app, they will get same wallet address as the one pre-generated here along with the private key.

This is useful for your app to get the wallet address without the user need to login in your app.

This script uses a mock idToken generator to generate the idToken. You can replace it with your own idToken provider like Firebase, AWS Cognito, Auth0 or any other idToken provider.

Checkout Web3Auth docs to learn more about idToken: https://web3auth.io/docs/auth-provider-setup/verifiers

Prerequisites:

- Create a verifier in Web3Auth
- Create a .env file with the verifier and JWT Private Key
- Install the dependencies

```bash
npm install
```

Run the script

```bash
node tonWeb3Auth.js
```
