import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import { createMint } from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";


const connection=new Connection(clusterApiUrl("devnet"))
const user=getKeypairFromEnvironment("SECRET_KEY")

console.log(`the user public key is  ${user.publicKey.toBase58()}`)
//@ts-ignore
const mintToken=await createMint(connection,user,user.publicKey,null,2)

const getllink=getExplorerLink(
    "address",
    mintToken.toString(),
    "devnet"
)

console.log(`mint token link  ${mintToken}`)