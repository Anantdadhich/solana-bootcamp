import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CRUDIDL from '../target/idl/crud.json'  // Import the correct IDL file
import type { JournalCrud } from '../target/types/crud'

// Re-export the generated IDL and type
export { JournalCrud, CRUDIDL }

// The programId is imported from the program IDL.
export const JOURNAL_PROGRAM_ID = new PublicKey(CRUDIDL.address)

// This is a helper function to get the CRUD Anchor program.
export function getJournalProgram(provider: AnchorProvider) {
  // Explicitly cast CRUDIDL to the Idl type
  return new Program(CRUDIDL as Idl, provider)
}

// This is a helper function to get the program ID for the CRUD program depending on the cluster.
export function getJournalProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the CRUD program on devnet and testnet.
      return new PublicKey('AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ')
    case 'mainnet-beta':
    default:
      return JOURNAL_PROGRAM_ID
  }
}
