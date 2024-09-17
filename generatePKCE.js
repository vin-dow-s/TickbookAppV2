const crypto = require('crypto')

// Function to generate PKCE Codes
function generatePKCECodes() {
    const codeVerifier = crypto.randomBytes(32).toString('hex')
    const base64Digest = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64')

    const codeChallenge = base64Digest
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

    return { codeVerifier, codeChallenge }
}

// Generate the PKCE codes
const pkceCodes = generatePKCECodes()

console.log('Code Verifier:', pkceCodes.codeVerifier)
console.log('Code Challenge:', pkceCodes.codeChallenge)
