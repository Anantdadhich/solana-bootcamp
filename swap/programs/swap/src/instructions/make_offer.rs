use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint,TokenInterface,TokenAccount}
};

use crate::{Offer,ANCHOR_DISCRIMINATOR};

use super::transfer_tokens;

#[derive(Accounts)]
#[instruction(id:u64)]

pub struct MakeOffer<'info>{
    #[account(mut)]

     pub maker:Signer<'info>,


    #[account(mint::token_program=token_program)] 
    pub token_mint_a:InterfaceAccount<'info,Mint>,
     #[account(mint::token_program=token_program)] 
    pub token_mint_b:InterfaceAccount<'info,Mint>,
   
   //now we maake the wallet wwhere the makeer token a is stored 
   #[account(mut,   //we writee mut becaausee the token will dedcuted
    associated_token::mint=token_mint_a,   //it must hold the token a
    associated_token::authority=maker,      //maakeer musst own thw wallet 
    associated_token::token_program=token_program  
)]
   pub  maker_token_account_a:InterfaceAccount<'info,TokenAccount>,
   
   #[account(init ,
    payer=maker,
     space=ANCHOR_DISCRIMINATOR + Offer::INIT_SPACE,
     seeds=[b"offer",maker.key().as_ref(),id.to_le_bytes().as_ref()],
     bump
       )]
   pub  offer:Account<'info,Offer>,

   //tempoaaray storage for account
   #[account(mut,
     
    associated_token::mint=token_mint_a,
    associated_token::authority=maker,
    associated_token::token_program=token_program

)]

 pub vault:InterfaceAccount<'info,TokenAccount>,

 pub system_program:Program<'info,System>,
 pub token_program:Interface<'info,TokenInterface>,
 pub associated_token_program:Program<'info,AssociatedToken>

}




pub fn send_offered_tokens_to_vault(context:&Context<MakeOffer>,
token_a_offerd_ammount:u64
) -> Result<()> {
     transfer_tokens(
      &context.accounts.maker_token_account_a,
      &context.accounts.vault,
      &token_a_offerd_ammount,
      &context.accounts.token_mint_a,
      &context.accounts.maker,
      &context.accounts.token_program,

     )


}
//ssave the offers details in the offer account
pub fn save_offer(context:Context<MakeOffer>,id:u64,token_b_wanted_amount:u64) -> Result<()> {
      context.accounts.offer.set_inner(Offer{
        id,
        maker:context.accounts.maker.key(),
        token_mint_a:context.accounts.token_mint_a.key(),
        token_mint_b:context.accounts.token_mint_b.key(),
        token_b_wanted_amount,
        bump:context.bumps.offer,
      });
        Ok(())
}
 