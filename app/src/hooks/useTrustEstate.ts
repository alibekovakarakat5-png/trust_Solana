import { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  SystemProgram,
  Keypair,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  Transaction,
} from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { IDL } from '../lib/idl';
import { useTxStore } from '../store/useTxStore';

const PROGRAM_ID = new PublicKey('8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY');

function findPDA(seeds: (Buffer | Uint8Array)[]) {
  return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);
}

function getProvider(connection: any, wallet: any): AnchorProvider | null {
  if (!wallet.publicKey || !wallet.signTransaction) return null;
  return new AnchorProvider(connection, wallet as any, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });
}

function getProgram(provider: AnchorProvider): any {
  // @ts-ignore — Anchor 0.30.x constructor typing
  return new Program(IDL as any, PROGRAM_ID, provider);
}

export function useTrustEstate() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const addTx = useTxStore((s) => s.addTx);

  const initializePlatform = useCallback(async () => {
    const provider = getProvider(connection, wallet);
    if (!provider || !wallet.publicKey) throw new Error('Wallet not connected');
    const program = getProgram(provider);

    setLoading(true);
    try {
      const [platformPDA] = findPDA([Buffer.from('platform')]);

      const tx = await program.methods
        .initializePlatform()
        .accounts({
          platform: platformPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      addTx({
        signature: tx,
        type: 'initialize_platform',
        description: 'Platform initialized on Solana',
        timestamp: Date.now(),
      });

      return tx;
    } finally {
      setLoading(false);
    }
  }, [connection, wallet, addTx]);

  const fetchPlatformState = useCallback(async () => {
    const provider = getProvider(connection, wallet);
    if (!provider) return null;
    const program = getProgram(provider);

    try {
      const [platformPDA] = findPDA([Buffer.from('platform')]);
      const account: any = await program.account.platform.fetch(platformPDA);
      return {
        authority: (account.authority as PublicKey).toBase58(),
        totalProperties: (account.totalProperties as BN).toNumber(),
        totalDeals: (account.totalDeals as BN).toNumber(),
        totalFraudBlocked: (account.totalFraudBlocked as BN).toNumber(),
      };
    } catch {
      return null;
    }
  }, [connection, wallet]);

  const tokenizeProperty = useCallback(
    async (params: {
      propertyId: string;
      address: string;
      areaSqm: number;
      rooms: number;
      floor: number;
      totalFloors: number;
      cadastralId: string;
      priceLamports: number;
      propertyType: 'Apartment' | 'House' | 'Commercial' | 'Land';
    }) => {
      const provider = getProvider(connection, wallet);
      if (!provider || !wallet.publicKey) throw new Error('Wallet not connected');
      const program = getProgram(provider);

      setLoading(true);
      try {
        const [platformPDA] = findPDA([Buffer.from('platform')]);
        const [propertyPDA] = findPDA([
          Buffer.from('property'),
          Buffer.from(params.propertyId),
        ]);
        const propertyMint = Keypair.generate();

        const ownerTokenAccount = PublicKey.findProgramAddressSync(
          [
            wallet.publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            propertyMint.publicKey.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        )[0];

        const documentHash = Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 256)
        );

        const typeMap: Record<string, any> = {
          Apartment: { apartment: {} },
          House: { house: {} },
          Commercial: { commercial: {} },
          Land: { land: {} },
        };

        const tx = await program.methods
          .tokenizeProperty(
            params.propertyId,
            params.address,
            params.areaSqm,
            params.rooms,
            params.floor,
            params.totalFloors,
            params.cadastralId,
            new BN(params.priceLamports),
            documentHash,
            typeMap[params.propertyType] || { apartment: {} }
          )
          .accounts({
            property: propertyPDA,
            platform: platformPDA,
            propertyMint: propertyMint.publicKey,
            ownerTokenAccount,
            owner: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([propertyMint])
          .rpc();

        addTx({
          signature: tx,
          type: 'tokenize_property',
          description: `Property ${params.propertyId} tokenized as NFT`,
          timestamp: Date.now(),
        });

        return {
          tx,
          mint: propertyMint.publicKey.toBase58(),
          propertyPDA: propertyPDA.toBase58(),
        };
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet, addTx]
  );

  const fractionalizeProperty = useCallback(
    async (params: {
      propertyId: string;
      totalShares: number;
      pricePerShareSol: number;
    }) => {
      const provider = getProvider(connection, wallet);
      if (!provider || !wallet.publicKey) throw new Error('Wallet not connected');
      const program = getProgram(provider);

      setLoading(true);
      try {
        const [propertyPDA] = findPDA([Buffer.from('property'), Buffer.from(params.propertyId)]);
        const [fractionalPDA] = findPDA([Buffer.from('fractional'), Buffer.from(params.propertyId)]);
        const [rentalVaultPDA] = findPDA([Buffer.from('rental_vault'), Buffer.from(params.propertyId)]);
        const shareMint = Keypair.generate();

        const ownerShareAccount = PublicKey.findProgramAddressSync(
          [wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), shareMint.publicKey.toBuffer()],
          ASSOCIATED_TOKEN_PROGRAM_ID
        )[0];

        const pricePerShareLamports = Math.floor(params.pricePerShareSol * 1e9);

        const tx = await program.methods
          .fractionalizeProperty(
            new BN(params.totalShares),
            new BN(pricePerShareLamports)
          )
          .accounts({
            property: propertyPDA,
            fractional: fractionalPDA,
            shareMint: shareMint.publicKey,
            ownerShareAccount,
            rentalVault: rentalVaultPDA,
            owner: wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([shareMint])
          .rpc();

        addTx({
          signature: tx,
          type: 'fractionalize_property',
          description: `Property ${params.propertyId} fractionalized into ${params.totalShares} shares`,
          timestamp: Date.now(),
        });

        return { tx, shareMintPubkey: shareMint.publicKey.toBase58() };
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet, addTx]
  );

  const buyShares = useCallback(
    async (params: {
      propertyId: string;
      propertyOwner: string;
      shareMintPubkey: string;
      numShares: number;
    }) => {
      const provider = getProvider(connection, wallet);
      if (!provider || !wallet.publicKey) throw new Error('Wallet not connected');
      const program = getProgram(provider);

      setLoading(true);
      try {
        const [fractionalPDA] = findPDA([Buffer.from('fractional'), Buffer.from(params.propertyId)]);
        const shareMint = new PublicKey(params.shareMintPubkey);
        const propertyOwnerPK = new PublicKey(params.propertyOwner);

        const buyerShareAccount = PublicKey.findProgramAddressSync(
          [wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), shareMint.toBuffer()],
          ASSOCIATED_TOKEN_PROGRAM_ID
        )[0];

        const ownerShareAccount = PublicKey.findProgramAddressSync(
          [propertyOwnerPK.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), shareMint.toBuffer()],
          ASSOCIATED_TOKEN_PROGRAM_ID
        )[0];

        const tx = await program.methods
          .buyShares(new BN(params.numShares))
          .accounts({
            fractional: fractionalPDA,
            buyerShareAccount,
            ownerShareAccount,
            buyer: wallet.publicKey,
            propertyOwner: propertyOwnerPK,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        addTx({
          signature: tx,
          type: 'buy_shares',
          description: `Bought ${params.numShares} shares of property ${params.propertyId}`,
          timestamp: Date.now(),
        });

        return tx;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet, addTx]
  );

  return {
    loading,
    initializePlatform,
    fetchPlatformState,
    tokenizeProperty,
    fractionalizeProperty,
    buyShares,
    programId: PROGRAM_ID,
  };
}
