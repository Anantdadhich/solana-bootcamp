'use client'

import {JournalCrud, CRUDIDL ,getJournalProgram,getJournalProgramId,JOURNAL_PROGRAM_ID} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

//they are ussed for thee haandle connectiions qqueeries and mutations 


interface CreateEntryArgs {
  title:string,
  message:string,
  owner:PublicKey
}


export function useJournalProgram(){

  const {connection}=useConnection();
  //for the solaanaa netoewwk
  const {cluster}=useCluster();
  //cuustoom hook which us used whenveer thee transaction is happen then it ewill send the todst notification thaat succes or fails 
  const transactiontoast=useTransactionToast()
  const provider=useAnchorProvider();
   //for the staate managment 
   //Memoization ensures that the value is recomputed only when the cluster object changes.
  const programId=useMemo(
    ()=> getJournalProgramId(cluster.network as Cluster),
    [cluster]
  );
  //heere   instantiate the Anchor Program object, which interacts with the on-chain smart contract

  const program=getJournalProgram(provider)

  //fetch thgee accouunt data
  const getProgramAccount=useQuery({
    //key for identifiying the error 
    queryKey:["get-program-account",{cluster}],
    queryFn:() =>connection.getParsedAccountInfo(programId)
  })
  
  const accounts=useQuery({
    queryKey:["journal","all",{cluster}],
    //@ts-ignore 
    //anchor generated method to fetch the all journalentry state account on blockchain
    queryFn:program.account.journalEntrystate.all()
  });
    //here we modifies the data 
  const creatEntry=useMutation<string,Error,CreateEntryArgs>({
    mutationKey:["journalEntry","create",{cluster}],
    mutationFn:async({title,message,owner})=>{
    //it will generates the program add then create the createjournalentry
      const [journalEntryAddress]=await PublicKey.findProgramAddressSync(
         //first wer convert the title in buffer then convert the owner public key to buffer 
        [Buffer.from(title),owner.toBuffer()],
        programId
      );
      return program.methods.createJournalEntry(title,message).rpc()
    },
    onSuccess :(signature)=>{
      transactiontoast(signature);
      accounts.refetch();
    },
    onError:(error)=>{
      toast.error(`failed to create journal entry :${error.message}`)
    }
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    creatEntry

  }

}

export function useJournalProgramAccount({account}:{account:PublicKey}){
  const {cluster}=useCluster();
  const transactionToast=useTransactionToast();
  const anchoreprovider=useAnchorProvider();
  const {program,accounts}=useJournalProgram();
  const programId=new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

  const accountQuery=useQuery({
    queryKey:["journal","fetch",{cluster,account}],
    //@ts-ignore
    queryFn:()=> program.account.journalEntrystate.fetch(account)
  })

  const updateEntry=useMutation<string,Error,CreateEntryArgs>({
    mutationKey:["journalEntry","update",{cluster}],
    mutationFn:async({title,message,owner})=>{
      const [journalEntryAddress]=await PublicKey.findProgramAddressSync(
        [Buffer.from(title),owner.toBuffer()],
        programId
      );
      return program.methods.updateJornalEntry(title,message).rpc()
    },
    onSuccess:(signature)=>{
      transactionToast(signature),
      accounts.refetch()
    },
    onError:(error)=>{
      toast.error(`failef ${error.message}`)
    }
  })


  const deleteEntry=useMutation({
    mutationKey:["journal","deleteEntry",{cluster,account}],
    mutationFn:(title:string)=>
      program.methods.deleteJornalEntry(title).rpc(),
      onSuccess:(tx)=>{
        transactionToast(tx),
        accounts.refetch()
      }
    
  })

  return {
    accountQuery,
    updateEntry,
    deleteEntry
  }
}