/*Metadata is like a description or a tag for a token.
It contains information like:
The name of the token (e.g., “MagicCoin”).
The symbol (like an abbreviation, e.g., “MC” for MagicCoin).
The image or art if it’s a collectible or NFT.
Extra data, like what the token is used for.
Without metadata, a token is just numbers—it doesn’t tell you much. Metadata makes tokens unique and meaningful.

*/

import {
  DataV2,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";

import { clusterApiUrl, Connection, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";

//we fetch the user data 
const user=getKeypairFromEnvironment("SECRET_KEY")
//just setup the connection 
const connection=new Connection(clusterApiUrl("devnet"))
//public key logged 
console.log(`the environment key is   ${user.publicKey.toBase58()}`)

const TOKEN_METADATA_PROGRAAM_ID=new PublicKey("mntnw9kkmCRJgeHfucfCBr4FLfUdbmeEnEmjGnVrRKU")

const tokenmintAccount=new PublicKey("mntnw9kkmCRJgeHfucfCBr4FLfUdbmeEnEmjGnVrRKU")

const metadataData: DataV2 = {
  name: "ADTECH",
  symbol: "adSOL",
  // An off-chain link to more information about the token using Metaplex standard for off-chain data
  // We are using a GitHub link here, but in production this content would be hosted on an immutable storage like
  // Arweave / IPFS / Pinata etc
  uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-token-metadata.json",
  sellerFeeBasisPoints: 0,
 //@ts-ignore
  creators: null,
  //@ts-ignore
  collection: null,
  //@ts-ignore
  uses: null,
};

//now we generate the metadata pda 
//it will derived from the token mint account 
const metadataPDAandbump=PublicKey.findProgramAddressSync(
    [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAAM_ID.toBuffer(),
        tokenmintAccount.toBuffer()
    ],
    TOKEN_METADATA_PROGRAAM_ID
)

const metadataPDA=metadataPDAandbump[0];

const transaction=new Transaction();

const metadataAccountinstruction=createCreateMetadataAccountV3Instruction(
     {
        metadata:metadataPDA,   //pda where the metadaata is stored 
        mint:tokenmintAccount,
        mintAuthority:user.publicKey,  //user whose peermission to manage the token 
        payer:user.publicKey,           
        updateAuthority:user.publicKey
     },{
         createMetadataAccountArgsV3:{
            collectionDetails:null,
            data:metadataData,
            isMutable:true
         }

     }

)

transaction.add(metadataAccountinstruction)
//@ts-ignore
const transactionSignature=await sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
)

const TransactionLink=getExplorerLink(
    "transaction",
    transactionSignature,
    "devnet"
)

const tokenmintLink=getExplorerLink(
    "address",
    tokenmintAccount.toString(),
    "devnet"
)

console.log(`transaction link ${TransactionLink}`)

console.log(`look the token mint again ${tokenmintLink}`)