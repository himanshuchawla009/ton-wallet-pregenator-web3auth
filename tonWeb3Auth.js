
const { TORUS_SAPPHIRE_NETWORK } =  require("@toruslabs/constants");
const { NodeDetailManager } = require("@toruslabs/fetch-node-details");
const { faker } = require("@faker-js/faker")
const { Torus, getKeyCurve, encodeEd25519Point } =  require("@toruslabs/torus.js");
const TonWeb = require("tonweb")
const { generateIdToken, TORUS_TEST_VERIFIER } = require("./helpers");
const TORUS_NODE_MANAGER = new NodeDetailManager({ network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET });
const torus = new Torus({
      network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
      clientId: "YOUR_CLIENT_ID",
      enableOneKey: true,
      keyType: "ed25519",
    });

    const tonweb = new TonWeb(
        new TonWeb.HttpProvider("https://toncenter.com/api/v2/")
      );
  
const getWalletAddress = async (pubkey, WalletClass, version) => {
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: pubkey,
    });
    const address = await wallet.getAddress();
    let newAddress = address.toString({ bounceable: true });
    newAddress = newAddress.replace(/\+/g, "-").replace(/\//g, "_");
    console.log(`Wallet Address (${version}):`, newAddress);
    return newAddress;
    };
  

const preGenTonWalletAddress = async (testEmail) => {
    const nodeDetails = await TORUS_NODE_MANAGER.getNodeDetails({ verifier: TORUS_TEST_VERIFIER, verifierId: testEmail });

    const torusNodeEndpoints = nodeDetails.torusNodeSSSEndpoints;

    const result = await torus.getPublicAddress(torusNodeEndpoints, nodeDetails.torusNodePub, { verifier: TORUS_TEST_VERIFIER, verifierId: testEmail });

    const publicKeyX = result.finalKeyData.X;
    const publicKeyY = result.finalKeyData.Y;

    const ecCurve = getKeyCurve("ed25519");
    const key = ecCurve.keyFromPublic({ x: publicKeyX.toString("hex", 64), y: publicKeyY.toString("hex", 64) });
    const publicKey = encodeEd25519Point(key.getPublic());

    return getWalletAddress(publicKey, tonweb.wallet.all.v2R1, "v2R1");
}

const loginTonWallet = async (testEmail) => {
    const nodeDetails = await TORUS_NODE_MANAGER.getNodeDetails({ verifier: TORUS_TEST_VERIFIER, verifierId: testEmail });

    const torusNodeEndpoints = nodeDetails.torusNodeSSSEndpoints;

    // replace generateIdToken with your own oauth login provider idToken generation function
    const token = generateIdToken(`${testEmail}`, "ES256");
    const result = await torus.retrieveShares(
        {
            endpoints: torusNodeEndpoints,
            indexes: nodeDetails.torusIndexes,
            nodePubkeys: nodeDetails.torusNodePub,
            verifier: TORUS_TEST_VERIFIER,
            verifierParams: {
                verifier: TORUS_TEST_VERIFIER,
                verifier_id: testEmail,
            },
            idToken: token,
        }
    );

    const tonPrivKeyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(Buffer.from(result.finalKeyData.privKey, "hex"));
    const address = await getWalletAddress(tonPrivKeyPair.publicKey, tonweb.wallet.all.v2R1, "v2R1");
    return {
        sk:Buffer.from(tonPrivKeyPair.secretKey).toString("hex"),
        address: address
    };
}


(async ()=>{
    const testEmail = faker.internet.email();
    const preGenWalletAddress = await preGenTonWalletAddress(testEmail);
    console.log("preGenWalletAddress", preGenWalletAddress);
    const loginWallet = await loginTonWallet(testEmail);
    console.log("loginWallet", loginWallet);

    if (preGenWalletAddress != loginWallet.address) {
        console.log("Wallets are not the same");
        throw new Error("Wallets are not the same");
    }
})()