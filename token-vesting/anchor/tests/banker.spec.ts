import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {BanksClient, Clock, ProgramTestContext, start, startAnchor} from  "solana-bankrun"
import { BankrunProvider } from  "anchor-bankrun"
import {} from "@solana/web3.js"

import { Vesting } from 'anchor/target/types/vesting'
import { IDL, program, SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system'
import { createMint, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'


describe("Vesting Tests",()=>{
    const companyname="Companyname";
     let benificary:Keypair;
     let vesting_account:PublicKey;
     let treasury_account:PublicKey;
     let employe_account:PublicKey;

     let provider:BankrunProvider;
     //@ts-ignore
     let program:Program<Vesting>;  
     let banksClient:BanksClient;
     let employer:Keypair;
     let mint:PublicKey;
     let benificaryProvider:BankrunProvider;
     //@ts-ignore
     let program2:Program<Vesting>;

     let context:ProgramTestContext;
     
     beforeAll(async            ()=>  {
      benificary=new anchor.web3.Keypair();

      context=await startAnchor(
        "",
        [{name:"vesting" ,programId:new PublicKey(IDL.address) }],

        [
      {
      address:benificary.publicKey,
      info:{
       lamports:1_000_000_000,
       data:Buffer.alloc(0),
       owner:SYSTEM_PROGRAM_ID,
       executable:false
            }
  }

   ]
      );

    provider=new BankrunProvider(context);

    anchor.setProvider(provider);
     //@ts-ignore
    program=new Program<Vesting>(IDL as Vesting,provider);

    banksClient=context.banksClient;
    employer=provider.wallet.payer;
    
    //@ts-ignore
    mint=await createMint(banksClient,employer,employer.publicKey,null,2);
    
    benificaryProvider=new BankrunProvider(context);
    benificaryProvider.wallet=new NodeWallet(benificary);

     //@ts-ignore
    program2=new Program<Vesting>(IDL as Vesting,benificaryProvider);

    //derive pda
    [vesting_account]=PublicKey.findProgramAddressSync(
      [Buffer.from(companyname)],
      program.programId
    );

    [treasury_account]=PublicKey.findProgramAddressSync(
      [Buffer.from("vesting"),Buffer.from(companyname)],
      program.programId
    );

    [employe_account]=PublicKey.findProgramAddressSync(
      [
        Buffer.from("employee_vesting"),
        benificary.publicKey.toBuffer(),
        vesting_account.toBuffer()
      ],
      program.programId
    )
    
     });

 
  it(" create a vesting account " ,async()=>
    {
     const tx=await program.methods
     .createVestingAccount(companyname)
    //@ts-ignore
     .accounts({
    
      signer:employer.publicKey,
      mint,
      tokenProgram:TOKEN_PROGRAM_ID,


     })
    .rpc({commitment:"confirmed" });

   
const vestingAccountdata=await program.account.vestingAccount.fetch(
  vesting_account,
  "confirmed"
);

console.log(
  "Vesting Account ",
  JSON.stringify(vestingAccountdata,null,2)
);


console.log("Creating Vesting account ",tx);


  }
 );

 it("should fund the treasury ",async ()=> {
  const amount=10_000 * 10 ** 9;

  const mintTx=await mintTo(
    //@ts-ignore
   banksClient,
   employer,
   mint,
   treasury_account,
   employer,
   amount


  );

  console.log("Mint to ",mintTx);
 }
)       


it("should claims tokens",async ()=> {

  await new Promise((resolve) => setTimeout(resolve,1000));

  const currentClock=await banksClient.getClock();

  context.setClock(
new Clock (
 currentClock.slot,
 currentClock.epochStartTimestamp,
 currentClock.epoch,
 currentClock.leaderScheduleEpoch,
 //@ts-ignore
     1000n

)

  );
console.log("employe account",employe_account.toBase58());

const tx3=await program2.methods.createTokens(companyname)
//@ts-ignore
.accounts({
tokenProgram:TOKEN_PROGRAM_ID,

})
.rpc({
  commitment:"confirmed"
})

console.log("claim tokens ",tx3);
});
      
    

});


