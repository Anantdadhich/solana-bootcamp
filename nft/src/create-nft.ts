import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

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

const createnft=await createNft(umi,{
    mint,
    name:"adtech",
    uri:"",
    sellerFeeBasisPoints:percentAmount(0),
    collection:{
        key:collectionaddres,
        verified:false
    },

})

await createnft.sendAndConfirm(umi)
const creatednft=await fetchDigitalAsset(umi,mint.publicKey)

const link=getExplorerLink("address",
    creatednft.mint.publicKey,
    "devnet"
)

console.log(`the link ${link}`)
