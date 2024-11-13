import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Counter} from '../target/types/counter'

describe('voting', () => {
  // Configure the client to use the local cluster.
      anchor.setProvider(anchor.AnchorProvider.env());

      const program=anchor.workspace.Voting as Program<Voting> 

      
  it('Initialize Poll', async () => {
   
  })
})
