
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;  
use anchor_spl::token_interface::{Mint,TokenAccount,TokenInterface,TransferChecked };         


//onchain add  
declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");


//program instructions 
#[program]
pub mod vesting{ 
     
     use super::*;

     fn createvesting(ctx:Context<CreateVestingAccount>,company_name:String)->Result<()>{
           //init all vesting account for a company to track all the employe vesting  
           *ctx.accounts.vesting_account=CreateVest{
               owner:ctx.accounts.signer.key(),
               mint:ctx.accounts.mint.key(),
               treasury_token_account:ctx.accounts.treasury_token_account.key(),
               company_name,
               //bump seeds for secure pda  
               treasury_bump:ctx.accounts.treasury_token_account,
               bump:ctx.accounts.vesting_account,
           } ;
       
       Ok(())    
     }

     fn createemployevesting(
        ctx:Context<EmployeVestingAccount>,
       start:i64 ,
         end:i64,
         total_ammount:i64,
         cliff_time:i64 
         
         ) ->Result<>{
        *ctx.accounts.employe=Employe{
            benificary:ctx.accounts.benificary.key(),
            start,
            end,
            total_amount,
            cliff_time, 
            total_withdrawn:0,
            vesting_account:ctx.vesting_accounts.vesting_account ,
            bump:ctx.bumps.employe_account

        };
        Ok(())
     }

     fn createtoken(ctx:Context<ClaimTokens>,_company_name:String)->Result<>{ 
        let employe_account=&mut ctx.accounts.employe_account ;

        let now=Clock::get()?.unix_timestamp ;
         
         if now < employe_account.cliff_time {
            return Err(ErrorCode::ClaimNotAvailableYet.into()) ;
         }
      
       //vested amount 
       let time_since_start=now.saturating_sub(employe_account.start);

        let total_vesting_time=employe_account.end.saturating_sub(
            employe_account.start 
        ) ;

        let vested_amount=if now >= employe_account.end {
            employe_account.total_amount
        }else {
        (employe_account.total_amount * time_since_start) /total_vesting_time
        };
             
        //calculate the amount that can be withdrawn  

        let claimable=vested_amount.saturating_sub(employe_account.total_withdrawn);

        if claimable == 0 {
            return Err(ErrorCode::NothingToClaim.into())
        }    

       let transfer_cpi_accounts =TransferChecked {
        from:ctx.accounts.treasury_account.to_account_info(),
        mint:ctx.accounts.mint.to_account_info(),
        to:ctx.accounts.employe_account.to_account_info(),
        authority:ctx.accounts.treasury_account.to_account_info(),
       };


       let cpi_program=ctx.accounts.token_program.to_account_info();

       let signer_seeds:&[&[&[u8]]] = & [
        &[
            b"vesting_treasury",
            ctx.accounts.vesting_account.company_name.as_ref(),
            &[ctx.accounts.vesting_account.treasury_bump],
        ],
       ];
      

      let cpi_context=CpiContext::new(cpi_program,transfer_cpi_accounts).with_signer(signer_seeds);
     

     let decimals=ctx.accounts.mint.decimals;

    token_interface::transfer_checked(cpi_context,claimable as u64 ,decimals)?; 
    employe_account.total_withdrawn +=claimable;
        Ok(())
     }
}

//list of account req by an instruction
#[derive(Accounts)]
#[instructions(company_name:String)]
pub struct CreateVestingAccount<'info>{
    //Account constraints are define additional conditons that an  account must spacify the considered valid for instruction
   #[account(mut)]
   pub signer:Signer<'info>,  //account types are the used to ensure that account provided by thr client matches what program expects 
   #[account(
    init,
    payer=signer,
    space=8+CreateVest::INIT_SPACE,
    seeds=[company_name.as_ref()],        //optional value to derive the pda 
    bump,

   )]
   //store the vesting details 
   pub vesting_account:Account<'info,CreateVest>,
   #[account(
    init,
    token::mint=mint,
    token::authority=treasury_token_account,
    payer=signer,
    seeds=[b"vesting_treasury",company_name.as_ref()],
    bump
   )]
   // new account to hold the locked tokens 
   pub treasury_token_account:InterfaceAccount<'info,TokenAccount>,
   pub mint:InterfaceAccount<'info,Mint>,

   pub token_program:TokenAccount<'info,Token>,

   pub system_program:Program<'info,System>,

}
#[derive(Accounts)]
#[instructions[company_name:String]]
pub struct  EmployeVestingAccount<'info>{ 
    #[account(mut)]
    pub owner:Signer<'info>,
    pub benificary:SystemAccount<'info>,  

    #[account(has_one=owner)]
    pub vesting_account:Account<'info,CreateVest>,

    #[account(
        init,
        payer=owner,
         space=8+Employe::INIT_SPACE,
         seeds=[b"employe",benificary.key().as_ref(),vesting_account.key(),as_ref()],
         bump
    )]
    pub employe:Account<'info,Employe>,

   pub system_program:Program<'info,System>,
 
}  

#[derive(Accounts)]
#[instructions(company_name:String)]
pub struct ClaimTokens<'info>{
   
   #[account(mut)]
   pub benificary:Signer<'info> , 
   #[account(
   mut ,
    seeds=[b"employe_vesting",benificary.key(),as_ref(),vesting_account.key().as_ref()] ,
    bump=employe_account.bump ,
    has_one=benificary,
    has_one=vesting 

   )]
   pub employe_account:Account<'info,Employe>,
    #[account(
        mut ,
        seeds=[company_name.as_ref()],
        bump=vesting_account.bump,
        has_one=treasury_token_account,
        has_one=vesting
    )]    

   pub vesting_account:Account<'info,CreateVest>,
    
   #[account(mut )]
    pub treasury_account:InterfaceAccount<'info,TokenAccount> ,


  pub mint:InterfaceAccount<'info,Mint>,
      
    #[derive(
        init_if_needed, 
        payer=benificary,
        associated_token::mint=mint ,
        associated_token::authority=benificary,
        associated_token::token_program=token_program
    )]
   pub employe_token_vesting:InterfaceAccount<'info,TokenAccount>,
        
   pub associatedAccount:Program<'info,AssociatedToken>,

   pub token_program:Interface<'info,TokenAccount>, 
   
    pub system_program:Program<'info,System>,

}


//create custom account types for the program 
#[account]
#[derive(InitSpace,Debug)]
pub struct  CreateVest{
   pub owner:Pubkey,
   pub mint:Pubkey,
   pub treasury_token_account:Pubkey   ,
   #[max_len(50)]
   pub company_name:String,
   pub treasury_bump:u8,
   pub bump:u8
}


#[account]
#[derive(InitSpace,Debug)]
pub struct Employe{
   pub benificary:Pubkey,
   pub start:i64,
   pub end:i64,
   pub total_amount:i64,
   pub total_withdrawn:i64, 
   pub cliff_time:i64,
   pub vesting_account:Pubkey ,
   pub bump:u64 
}

#[error_code]
pub enum ErrorCode{
    #[msg("Claiming is not avaliable")] 
    ClaimNotAvailableYet , 
    #[msg("There is nothing to claim")]
    NothingToClaim
   
   }

