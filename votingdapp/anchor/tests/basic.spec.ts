import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {Voting} from '../target/types/voting'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'


const IDL=require("../target/idl/voting.json")

const votingAddress=new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ")
describe('voting', () => {
  // Configure the client to use the local cluster.
      anchor.setProvider(anchor.AnchorProvider.env());

      const program=anchor.workspace.Voting as Program<Voting> 

      
  it('Initialize Poll', async () => {
const context=await startAnchor("",[{name:"voting",programId:votingAddress}],[]);
 const provider=new BankrunProvider(context); 
  const votingProgram = new Program<Voting>(
		IDL,
		provider,
	);


await votingProgram.methods.initializePoll(
  new anchor.BN(1),
  new anchor.BN(0),
  new anchor.BN(1731564064),
  "test-poll",
  "pool description"
).rpc();
  
const [polladdress]=PublicKey.findProgramAddressSync(
[Buffer.from('poll'),new anchor.BN(1).toArrayLike(Buffer,"le",8)],
votingProgram.programId
)
//@ts-ignore
const pollaccount=await votingProgram.account.pollAccount.fetch(polladdress)

})
})
