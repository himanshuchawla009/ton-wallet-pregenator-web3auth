const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// checkout web3auth docs to create your own verifier
// https://web3auth.io/docs/auth-provider-setup/verifiers


const TORUS_TEST_VERIFIER = process.env.VERIFIER;
const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;

const generateIdToken = (email, alg) => {
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "torus-key-test",
    aud: "torus-key-test",
    name: email,
    email,
    scope: "email",
    iat,
    eat: iat + 120,
  };

  const algo = {
    expiresIn: 120,
    algorithm: alg,
  };

  return jwt.sign(payload, jwtPrivateKey, algo);
};

module.exports = {
    generateIdToken,
    TORUS_TEST_VERIFIER,
}