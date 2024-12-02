import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";



const user=getKeypairFromEnvironment("SECRET_KEY")
const connection=new Connection(clusterApiUrl("devnet"),"confirmed")

console.log(`the user pub key ${user.publicKey.toBase58()}`)


const otheruser=new PublicKey("")
const tokenmint=new PublicKey("")
const MINTS_UNITS_PER_MAJOR_UNITS=Math.pow(10,2)

console.log(`sending 1 sol  to ${otheruser.toBase58()}`)
//@ts-ignore
const sourceassociatedAccount=await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenmint,
    user.publicKey
)
//@ts-ignore
const destinationATA=await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenmint,
    otheruser
)
//@ts-ignore

const transactionSigmnature=await transfer(
    connection,
    user,
    sourceassociatedAccount.address,
    destinationATA.address,
    user,
    1*MINTS_UNITS_PER_MAJOR_UNITS
    
)

const link=getExplorerLink(
    "transaction",
    transactionSigmnature,

    "devnet"
)

console.log(`the link ${link}`)
