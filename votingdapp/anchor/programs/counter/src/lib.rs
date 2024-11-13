#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod voting {
    use super::*; 
  pub fn  insitalise_poll(ctx:Context<Insitalise_poll>,poll_id:u64,
  start:u64,
 end:u64,
 name:String,
 descriprion:String 
) ->Result<()>{
    ctx.accounts.pollaccount.poll_name=name;
    ctx.accounts.pollaccount.poll_description=descriprion;
    ctx.accounts.pollaccount.voting_start=start;
    ctx.accounts.pollaccount.voting_end=end;
    Ok(())
  }
  

  pub fn intialise_candidates(ctx:Context<Intialsie_Candidates>,poll_id:u64,candidate:String) ->Result<()>{
      ctx.accounts.candidate_account.candidate_name=name;
      ctx.accounts.poll_account.poll_option_index +=1;

  }
  
  pub fn vote(ctx:Context<Vote>  ,poll_id:u64,candidate:String)->Result<()>{
    let candidate_account=&mut ctx.accounts.candidate_account;
    let current_time=Clock::get()?.unix_timestamp;
      
     if current_time > (
      ctx.accounts.poll_account.
     ) 

 
  }


}


#[derive(Accounts)]
#[instruction(poll_id:u64,candidate:String)]
pub struct Intialsie_Candidates{
  #[account(mut)]
  pub signer:Signer<'info>
  
  pub poll_account=Account<'info,Poll>

  #[account(
    init,
    payer=signer,
    space=8 + Candidate_Account::InitSpace,
    seed=[poll_id.to_le_bytes().as_ref(),candidate.as_ref()],
    bump
  )]
    
  pub candidate_account=Account<'info,Candidate_Account>

  pub subprogram:Program<'info,System>
}


#[derive(Accounts)]
#[instruction(poll_id:u64)]
pub struct Insitalise_poll<'info> {
  #[account(mut)]
  pub signer:Signer<'info>
   //here we instrialse the account
   //seeds are th4e poll id 
  #[account(
     init_if_needed,
     payer=signer,
     space=8+Poll::INIT_SPACE,
     seeds=[b"poll".as_ref(),poll_id.to_le_bytes().as_ref()],
     bump
  )]
  pub pollaccount:Account<'info,Poll>,

  pub systemProgram:Program<'info,System>


}  


#[account]
//we get the space easily 
#[derive(InitSpace)]
pub struct Poll {
   #[max_len(32)]
  pub poll_name:String

  pub poll_description:String,

  pub voting_start:u64,
  pub voting_end:u64,
  pub poll_option_index:u64
}


#[account]
#[derive(InitSpace)]

pub stuct Candidate_Account {
  #[max_len(32)]
  pub candidate_name:String,
  pub candidate_votes:u64

}