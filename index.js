import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { extractPageData } from 'indelible/utils';
import { commitAttestation, revealAttestation, buildAttestationRef } from 'indelible/publish';
import { DEFAULT_RPC_URLS } from 'indelible/chains';

const FILE = './inclusive.html';
const CHAIN = sepolia;
const COMMIT_DELAY_MS = 65_000; // min ~60s between commit and reveal

// ── 1. Extract the attested text from the page ───────────────────────────────

const html = readFileSync(FILE, 'utf-8');
const dom = new JSDOM(html);
const doc = dom.window.document;

const pageData = extractPageData(doc);
if (!pageData) throw new Error('No data-indelible markup found on this page.');

console.log('Text preview:', pageData.text.slice(0, 120), '...\n');

// ── 2. Set up viem clients ────────────────────────────────────────────────────

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error('Set PRIVATE_KEY env var (0x-prefixed hex).');

const account = privateKeyToAccount(/** @type {`0x${string}`} */ (privateKey));
const rpcUrl = process.env.RPC_URL ?? DEFAULT_RPC_URLS.sepolia;

const publicClient = createPublicClient({ chain: CHAIN, transport: http(rpcUrl) });
const walletClient = createWalletClient({ account, chain: CHAIN, transport: http(rpcUrl) });

console.log('Publishing from:', account.address);

// ── 3. Commit ─────────────────────────────────────────────────────────────────

console.log('Committing...');
const commitResult = await commitAttestation({
    walletClient,
    publicClient,
    content: pageData.text,
    account: account.address,
  });
console.log('Commit tx:', commitResult.txHash);

// ── 4. Wait for the commit delay ──────────────────────────────────────────────

console.log(`\nWaiting ${COMMIT_DELAY_MS / 1000}s for commit delay...`);
await new Promise(r => setTimeout(r, COMMIT_DELAY_MS));

// ── 5. Reveal ─────────────────────────────────────────────────────────────────

console.log('Revealing...');
const revealResult = await revealAttestation({
  walletClient,
  publicClient,
  pendingCommit: commitResult.pendingCommit,
  account: account.address,
});
console.log('Reveal tx:', revealResult.txHash);

// ── 6. Build the attestation reference JSON ───────────────────────────────────

const attestationRef = buildAttestationRef(commitResult, revealResult, CHAIN.id);

console.log('\nAttestation reference:');
console.log(JSON.stringify(attestationRef, null, 2));

// ── 7. Write it back into data-indelible ──────────────────────────────────────

const root = doc.querySelector('[data-indelible]');
root.setAttribute('data-indelible', JSON.stringify(attestationRef));

writeFileSync(FILE, dom.serialize(), 'utf-8');
console.log(`\nUpdated data-indelible in ${FILE}`);

