#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::           

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod vesting {
 //here we create the vesting account 
  pub fn create_vesting_account(ctx:Context<CreatevestingAccount>,company_name:String)->Result<()>{
           
  
    Ok(())
  }

//Here we initialise the instructions for the company name and dericve the struct for vesting account 

#[derive(Accounts)]
#[instructions(company_name:String)];
pub struct CreatevestingAccount<'info> {
  #[account(mut)]
  
  pub signer:Signer<'info>
  
  pub mint:InterfaceAccount<'info,Mint>
  #[account(
    init,
    space=8+VestingAccount::INIT_SPACE,
    payer:signer
    bump
  )]
  pub vesting_account:Account<'info,VestingAccount>,                   
 #[account(
    init,
    payer=signer,
    space=8+VestingAccount::INIT_SPACE,
    seeds=[company_name.as_ref()],
    bump
  )]
  pub treasury_program:

  pub system_program :Program<'info,SyestemProgram>,
  pub token_program:InterfaceToken<'info,TokenAccount>,


}

//create the vesting account 
#[derive(Accounts)]
pub struct  VestingAccount {
  

}


}