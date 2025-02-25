'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { useVestingProgram,useVestingProgramAccount } from './vesting-data-acces'
import { useWallet } from '@solana/wallet-adapter-react'

export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram()
   const {publicKey}=useWallet() ;
   const [company,setCompany]=useState("");
   const [mint,setmint]=useState("") ;

   const isFormValid=company.length > 0
   const handleSumbit=()=>{
      if (publicKey && isFormValid) {
        createVestingAccount.mutateAsync({companyName:company,mint:mint})
      }
   }   


   if (!publicKey) {
    return <p>Connect wallet </p>
   }

  return (
 <div>
    <input type="text" placeholder='company Name'   
    value={company} 
   className='input input-bordered'
    onChange={(e)=> setCompany(e.target.value)}
    />

    <input type="text" placeholder='tokem mint add' 
     value={mint} 
     onChange={(e)=>setmint(e.target.value)}
    /> 


    <button 
      onClick={handleSumbit} 
      disabled={createVestingAccount.isPending  || ! isFormValid}
    > 
      Create new Vesting Account {createVestingAccount.isPending && "..."}
    </button>
 </div>
  )
}

export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <VestingCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function VestingCard({ account }: { account: PublicKey }) {
  const { accountquery,createEmpoplyeVesting } = useVestingProgramAccount({
    account,
  })


  const [starttime,setstarttime]=useState(0)  
    const [endTime,setendtime]=useState(0)  
      const [ totalamount,settotaltime]=useState(0)  
        const [cliffTime,setclifftime]=useState(0)  
        
        
   const companyName=useMemo(
    ()=> accountquery.data?.companyName ?? 0 ,
    [ accountquery.data?.companyName]
   )



 

  return accountquery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountquery.refetch()}>
            {companyName}
          </h2>
          <div className="card-actions justify-around">
              
            <input type="text" placeholder='start'  
            value={starttime || " "}
                onChange={(e)=> setstarttime(parseInt(e.target.value))}
              />
               <input type="text" placeholder='end'  
            value={endTime || " "}
                onChange={(e)=> setendtime(parseInt(e.target.value))}
              />

               <input type="text" placeholder='total amount '  
            value={ totalamount || " "}
                onChange={(e)=> settotaltime(parseInt(e.target.value))}
              />
               <input type="text" placeholder='cliff time '  
            value={cliffTime || " "}
                onChange={(e)=> setclifftime(parseInt(e.target.value))}
              />

              <button   
               onClick={()=> 
                   createEmpoplyeVesting.mutateAsync ({
                      starttime,
                      endTime,
                      cliffTime,
                      totalamount
                   })
               }
              >  

              </button>
          </div>
             
        </div>
      </div>
    </div>
  )
}
