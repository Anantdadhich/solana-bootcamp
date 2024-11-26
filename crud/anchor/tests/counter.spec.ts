import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import CrudIDL from '../target/idl/crud.json'; // Path to your generated IDL file
import type { JournalCrud } from '../target/types/crud'; // Adjust path to generated types

// Ensure this is properly defined according to your project structure
export { JournalCrud, CrudIDL };

// Define the Program with the correct IDL type
const program = anchor.workspace.Crud as Program<JournalCrud>;

// Then use it in your tests as usual
describe('crud', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const journalKeypair = Keypair.generate();

  it('Initialize Journal Entry', async () => {
    await program.methods
      .createJournalEntry('My First Entry', 'This is a test entry')
      .accounts({
        journalEntry: journalKeypair.publicKey,
        owner: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([journalKeypair])
      .rpc();

    const currentEntry = await program.account.journalEntry.fetch(journalKeypair.publicKey);

    expect(currentEntry.title).toEqual('My First Entry');
    expect(currentEntry.message).toEqual('This is a test entry');
  });

  // Add more tests for other methods...
});
