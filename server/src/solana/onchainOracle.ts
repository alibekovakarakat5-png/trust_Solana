import { SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getConnection, getOracleKeypair, findPropertyPDA, findVerificationPDA, findPlatformPDA, findDealPDA, findDealAiPDA } from './executor';

const PROGRAM_ID = new anchor.web3.PublicKey('8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY');

// Minimal IDL — only the instructions we call from oracle
const IDL: any = {
  version: '0.1.0',
  name: 'trustestate',
  instructions: [
    {
      name: 'submitAiVerification',
      accounts: [
        { name: 'property', isMut: true, isSigner: false },
        { name: 'verification', isMut: true, isSigner: false },
        { name: 'oracle', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'verificationScore', type: 'u8' },
        { name: 'isVerified', type: 'bool' },
        { name: 'fraudFlags', type: 'u8' },
        { name: 'fraudDetails', type: 'string' },
        { name: 'marketPriceEstimate', type: 'u64' },
      ],
    },
    {
      name: 'submitDealAiCheck',
      accounts: [
        { name: 'deal', isMut: true, isSigner: false },
        { name: 'dealAiCheck', isMut: true, isSigner: false },
        { name: 'platform', isMut: true, isSigner: false },
        { name: 'oracle', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'riskScore', type: 'u8' },
        { name: 'flags', type: { vec: 'string' } },
        { name: 'recommendation', type: { defined: 'AiRecommendation' } },
      ],
    },
  ],
  accounts: [],
  types: [
    {
      name: 'AiRecommendation',
      type: {
        kind: 'enum',
        variants: [{ name: 'Approve' }, { name: 'Review' }, { name: 'Block' }],
      },
    },
  ],
  errors: [],
};

function getProgram(): anchor.Program | null {
  try {
    const connection = getConnection();
    const oracle = getOracleKeypair();

    const wallet = {
      publicKey: oracle.publicKey,
      signTransaction: async (tx: any) => {
        tx.partialSign(oracle);
        return tx;
      },
      signAllTransactions: async (txs: any[]) => {
        txs.forEach(tx => tx.partialSign(oracle));
        return txs;
      },
    };

    const provider = new anchor.AnchorProvider(connection, wallet as any, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });

    // @ts-ignore
    return new anchor.Program(IDL, PROGRAM_ID, provider);
  } catch {
    return null;
  }
}

export async function submitAiVerificationOnChain(params: {
  propertyId: string;
  verificationScore: number;
  isVerified: boolean;
  fraudFlags: number;
  fraudDetails: string;
  marketPriceEstimate: number;
}): Promise<string | null> {
  try {
    const program = getProgram();
    if (!program) return null;

    const [propertyPDA] = findPropertyPDA(params.propertyId);
    const [verificationPDA] = findVerificationPDA(propertyPDA);

    const tx = await program.methods
      .submitAiVerification(
        params.verificationScore,
        params.isVerified,
        params.fraudFlags,
        params.fraudDetails.slice(0, 500), // max 512 chars
        new anchor.BN(params.marketPriceEstimate)
      )
      .accounts({
        property: propertyPDA,
        verification: verificationPDA,
        oracle: getOracleKeypair().publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`[Oracle] submit_ai_verification tx: ${tx}`);
    return tx;
  } catch (err: any) {
    console.warn(`[Oracle] submit_ai_verification failed (non-critical): ${err.message}`);
    return null;
  }
}

export async function submitDealAiCheckOnChain(params: {
  dealId: string;
  riskScore: number;
  flags: string[];
  recommendation: 'approve' | 'review' | 'block';
}): Promise<string | null> {
  try {
    const program = getProgram();
    if (!program) return null;

    const [dealPDA] = findDealPDA(params.dealId);
    const [dealAiPDA] = findDealAiPDA(dealPDA);
    const [platformPDA] = findPlatformPDA();

    const recMap: Record<string, any> = {
      approve: { approve: {} },
      review: { review: {} },
      block: { block: {} },
    };

    const tx = await program.methods
      .submitDealAiCheck(
        params.riskScore,
        params.flags,
        recMap[params.recommendation] || { review: {} }
      )
      .accounts({
        deal: dealPDA,
        dealAiCheck: dealAiPDA,
        platform: platformPDA,
        oracle: getOracleKeypair().publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`[Oracle] submit_deal_ai_check tx: ${tx}`);
    return tx;
  } catch (err: any) {
    console.warn(`[Oracle] submit_deal_ai_check failed (non-critical): ${err.message}`);
    return null;
  }
}
