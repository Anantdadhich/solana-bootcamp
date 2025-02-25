'use client'

import { useConnection } from "@solana/wallet-adapter-react";
import { useCluster } from "../cluster/cluster-data-access";
import { useTransactionToast } from "../ui/ui-layout";
import { useAnchorProvider } from "../solana/solana-provider";
import { useMemo } from "react";
import { getVestingProgram, getVestingProgramId } from "@project/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import toast from "react-hot-toast";

interface CreateVestingArgs{
  companyName:string ,
  mint:string
}

interface CreateEmployeArgs {
  starttime:number;
  endTime:number;
  totalamount:number;
  cliffTime:number;
}


export function useVestingProgram(){
  const {connection}=useConnection();
  const {cluster}=useCluster() ;

  const transactionToast=useTransactionToast() ;

  const provider=useAnchorProvider() ;

   const progrqamId=useMemo(
    () => getVestingProgramId(cluster.network as Cluster),
    [cluster]
   ) ;
   

   const program=getVestingProgram(provider) ;

   const accounts=useQuery({
    queryKey:["get-program-account", {cluster}],
    queryFn: () => program.account.vestingAccount.all() 
   })

   const getProgramAccount=useQuery( {
    queryKey:["get-program-account",{cluster}],
    queryFn:() => connection.getParsedAccountInfo(progrqamId)
   })

   const createVestingAccount =useMutation <string,Error,CreateVestingArgs>({
     mutationKey:["vestingAccount","create",{cluster}],
     mutationFn:({companyName,mint}) => 
     program.methods
     .createVestingAccount(companyName) 
     .accounts({mint:
      new PublicKey(mint), tokenProgram:TOKEN_PROGRAM_ID
     }).rpc(),


     onSuccess(sign) {
          transactionToast(sign);
          return  accounts.refetch();
     },
     onError:() => toast.error("Failed to init account ")
   }) ;    

     return {
      program,
      progrqamId,
      accounts,
      getProgramAccount,
      createVestingAccount
     }
    
}



export function useVestingProgramAccount ({account}:{account:PublicKey}) {
  const {cluster } =useCluster() ;
  const transactionToast=useTransactionToast() ;
  const {program,accounts} =useVestingProgram() ;


  const accountquery=useQuery({
    queryKey:["vesting","fetch",{cluster,account}],
    queryFn:() =>program.account.vestingAccount.fetch(account),
  })


  const createEmpoplyeVesting =useMutation<string,Error,CreateEmployeArgs>({
    mutationKey:["vesting","fetch",{cluster,account}],
    mutationFn: ({starttime,endTime,totalamount,cliffTime}) =>
           program.methods 
           .createEmployeVesting(starttime,endTime,totalamount,cliffTime).rpc() ,
            
        onSuccess:(tx) =>{
          transactionToast(tx);
          return accounts.refetch()
        }
     
  });

  return  {
    accountquery,
    createEmpoplyeVesting
  }
}

