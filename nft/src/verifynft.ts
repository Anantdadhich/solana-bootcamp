import { findMetadataPda, mplTokenMetadata, verifyCollection, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata"
import { generateSigner, keypairIdentity, publicKey } from "@metaplex-foundation/umi"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers"
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"

const connection=new Connection(clusterApiUrl("devnet"))
const user=await getKeypairFromFile()


console.log(`the user pub key ${user.publicKey.toBase58()}`)

await airdropIfRequired(
    connection,
    user.publicKey,
    1*LAMPORTS_PER_SOL,
    0.5*LAMPORTS_PER_SOL
)

const umi=createUmi(connection.rpcEndpoint)
umi.use(mplTokenMetadata())

const umiuser=umi.eddsa.createKeypairFromSecretKey(user.secretKey)
umi.use(keypairIdentity(umiuser))


const mint=generateSigner(umi)

const collectionaddres=publicKey("")
const nftadress=publicKey("")

const transaction=await verifyCollectionV1(umi,
{
    metadata:findMetadataPda(umi,{mint:nftadress}),
    collectionMint:collectionaddres,
    authority:umi.identity
}
)

transaction.sendAndConfirm(umi)

const link=getExplorerLink("address",nftadress,"devnet")

console.log(`the nft ${nftadress} as ${collectionaddres}  in thee link ${link}`)
