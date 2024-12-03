import {  createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {  generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

const user=await getKeypairFromFile()
const connection=new Connection(clusterApiUrl("devnet"))


console.log(`the pub key  is ${user.publicKey.toBase58()}`)

//now we want base fess
 await airdropIfRequired(
    connection,
    user.publicKey,
    1*LAMPORTS_PER_SOL,
    0.5*LAMPORTS_PER_SOL
 )

 //@ts-ignore
 const umi=createUmi(connection.rpcEndpoint);
 umi.use(mplTokenMetadata());



 //we caall the usseer too creatre thee fucking keypaair into transaction
 const umiuser=umi.eddsa.createKeypairFromSecretKey(user.secretKey)

 umi.use(keypairIdentity(umiuser))

const mintoken=generateSigner(umi)


 const createnft=await createNft(umi,{
    mint:mintoken,
    name:"ADtech",
    symbol:"adSOL",
    uri:"https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-collection-offchain-data.json",
    sellerFeeBasisPoints:percentAmount(0),
    isCollection:true
 })

 await createnft.sendAndConfirm(umi)

 const createdcollection=await fetchDigitalAsset(
    umi,
    mintoken.publicKey
 )

 const link=getExplorerLink(
    "address",
    createdcollection.mint.publicKey,
    "devnet"
 )

 console.log(`thee link is ${link}`)

