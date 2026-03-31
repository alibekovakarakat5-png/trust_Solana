import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';

const PROGRAM_ID = new PublicKey('8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY');

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const findPDA = useMemo(() => {
    return (seeds: Buffer[]) => PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);
  }, []);

  return {
    connection,
    wallet,
    programId: PROGRAM_ID,
    findPropertyPDA: (propertyId: string) => findPDA([Buffer.from('property'), Buffer.from(propertyId)]),
    findDealPDA: (dealId: string) => findPDA([Buffer.from('deal'), Buffer.from(dealId)]),
    findPlatformPDA: () => findPDA([Buffer.from('platform')]),
    findVerificationPDA: (propertyKey: PublicKey) => findPDA([Buffer.from('verification'), propertyKey.toBuffer()]),
    findEscrowPDA: (dealKey: PublicKey) => findPDA([Buffer.from('escrow'), dealKey.toBuffer()]),
    findDealAiPDA: (dealKey: PublicKey) => findPDA([Buffer.from('deal_ai'), dealKey.toBuffer()]),
  };
}
