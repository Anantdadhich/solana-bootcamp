import { Program ,BN } from "@coral-xyz/anchor";
import { Voting } from "@project/anchor";
import { ActionGetResponse, ActionPostResponse, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";


const IDL=require('@/../anchor/target/idl/voting.json')

export const OPTIONS=GET;

export async function GET(req: Request) {
  const Actionblink: ActionGetResponse = {
    icon: "data:image/jpeg;base64,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", 
    title: "NFT blink",
    description: "Buy the NFT by voting",
    label: "Vote",

  links:{
    actions: [
        //@ts-ignore
        {
            label:"Vote for monkey",
            href:"/api/vote?candidate=monkey",
        },
        //@ts-ignore
        {
            label:"Vote for mo",
            href:"ffv"
        },
    ],
  }
};

  return Response.json(Actionblink, {
    headers: ACTIONS_CORS_HEADERS,
  });
}


export async function POST(req:Request){
    const url=new URL(req.url)


    const candidate=url.searchParams.get("candidate")

     if (candidate != "monkey" && candidate != "mo"){
        return new Response("invalid",{status:400,headers:ACTIONS_CORS_HEADERS})
     }
    
     const connection=new Connection("http://127.0.0.1:8899","confirmed")
     const program:Program<Voting>=new Program(IDL,{connection})   
      
     const  body:ActionPostResponse=await req.json();
    
     let voter ;

     try {
        voter=new PublicKey(body.type)
     } catch (error) {
        return new Response("invalid",{status:400,headers:ACTIONS_CORS_HEADERS}) 
     }
       //@ts-ignore
    const instruction=await program.methods.vote(candidate,new BN(1))
    .accounts({
        signer:voter,
    })
    .instruction();
     
    const blockhash=await connection.getLatestBlockhash()
    
    const transaction=new Transaction({
        feePayer:voter,
        blockhash:blockhash.blockhash,
        lastValidBlockHeight:blockhash.lastValidBlockHeight
    }).add(instruction );
    
   const response=await createPostResponse({
    //@ts-ignore
         fields:{
            transaction:transaction
         }
   });

   return  Response.json(response,{headers:ACTIONS_CORS_HEADERS})

    } 