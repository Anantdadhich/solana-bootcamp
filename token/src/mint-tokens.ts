import { getExplorerLink, getKeypairFromEnvironment } from "@solana-developers/helpers";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

/*You create (or mint) tokens using a program on the blockchain.
 These tokens are then added to the blockchain, and you can give them out, sell them, or trade them.*/
const connection=new Connection(clusterApiUrl("devnet"),"confirmed")

const user=getKeypairFromEnvironment("SECRET_KEY")

const MINTS_UNITS_PER_MAJOR_UNITS=Math.pow(10,2)

const tokenmint=new PublicKey("mntnw9kkmCRJgeHfucfCBr4FLfUdbmeEnEmjGnVrRKU")

//@ts-ignore
//mint the token ourseleves for now 
const associatedTokenaccount=await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenmint,
    user.publicKey
)
//@ts-ignore
const transactionSigmnature=await mintTo(
    connection,
    user,
    tokenmint,
    associatedTokenaccount.address,
    user,
    10*MINTS_UNITS_PER_MAJOR_UNITS,
);


const transactionlink=getExplorerLink(
    "transaction",
    transactionSigmnature,
    "devnet"
)

console.log(`the mint token link ${transactionlink}`)