import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

const PROGRAM_ID = new PublicKey('8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY');

export function getConnection(): Connection {
  return new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );
}

export function getOracleKeypair(): Keypair {
  const key = process.env.ORACLE_PRIVATE_KEY;
  if (!key) throw new Error('ORACLE_PRIVATE_KEY not set');
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(key)));
}

export function findPDA(seeds: Buffer[]): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);
}

export function findPropertyPDA(propertyId: string): [PublicKey, number] {
  return findPDA([Buffer.from('property'), Buffer.from(propertyId)]);
}

export function findVerificationPDA(propertyKey: PublicKey): [PublicKey, number] {
  return findPDA([Buffer.from('verification'), propertyKey.toBuffer()]);
}

export function findDealPDA(dealId: string): [PublicKey, number] {
  return findPDA([Buffer.from('deal'), Buffer.from(dealId)]);
}

export function findEscrowPDA(dealKey: PublicKey): [PublicKey, number] {
  return findPDA([Buffer.from('escrow'), dealKey.toBuffer()]);
}

export function findDealAiPDA(dealKey: PublicKey): [PublicKey, number] {
  return findPDA([Buffer.from('deal_ai'), dealKey.toBuffer()]);
}

export function findFractionalPDA(propertyKey: PublicKey): [PublicKey, number] {
  return findPDA([Buffer.from('fractional'), propertyKey.toBuffer()]);
}

export function findRentalPDA(propertyKey: PublicKey): [PublicKey, number] {
  return findPDA([Buffer.from('rental'), propertyKey.toBuffer()]);
}

export function findPlatformPDA(): [PublicKey, number] {
  return findPDA([Buffer.from('platform')]);
}
