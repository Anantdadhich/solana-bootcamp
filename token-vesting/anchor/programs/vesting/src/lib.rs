
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;  
use anchor_spl::token_interface::{Mint,TokenAccount,TokenInterface,TransferChecked };         



declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");


#[program]
pub mod token_vesting_program {
    use super::*;
    pub fn create_vesting_account(
        ctx: Context<CreateVestingAccount>,
        company_name: String,
    ) -> Result<()> {
        *ctx.accounts.vesting_account = VestingAccount {
            owner: ctx.accounts.signer.key(),
            mint: ctx.accounts.mint.key(),
            treasury_account: ctx.accounts.treasury_account.key(),
            company_name,
            treasury_bump: ctx.bumps.treasury_account,
            bump: ctx.bumps.vesting_account,
        };

        Ok(())
    }

    pub fn create_employee(
        ctx: Context<CreateEmployeAccount>,
        start_time: i64,
        end_time: i64,
        total_amount: i64,
        cliff_time: i64, //minimum time to token caan bve clained
    ) -> Result<()> {
        *ctx.accounts.employe_account = Employee {
            beneficary: ctx.accounts.beneficary.key(),
            start_time,
            end_time,
            total_amount,
            total_withdraw: 0,
            cliff_time,
            vesting_account: ctx.accounts.vesting_account.key(),
            bump: ctx.bumps.employee_account,
        };

        Ok(())
    }
    //for creating an claim token in distributed time 
    pub fn create_tokens(ctx: Context<CreateClaimtoken>, _company_name: String) -> Result<()> {
        let employe_account = &mut ctx.accounts.employee_account;

        let now = Clock::get()?.unix_timestamp;

        if now < employe_account.cliff_time {
            return Err(ErrorCode::ClaimNotAvailabeYet.into());
        }

        //vesting account
        let time_start_time = now.saturating_sub(employe_account.start_time);

        let total_vesting_time = employe_account
            .end_time
            .saturating_sub(employe_account.start_time);

        let vested_amount = if now >= employe_account.end_time {
            employe_account.total_amount
        } else {
            (employe_account.total_amount * time_start_time) / total_vesting_time
        };

        let claimbale_token = vested_amount.saturating_sub(employe_account.total_withdraw);

        if claimbale_token == 0 {
            return Err(ErrorCode::NothingToClaim.into());
        }

        let transfer_cpi = TransferChecked {
            from: ctx.accounts.treasury_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.employe_token_account.to_account_info(),
            authority: ctx.accounts.treasury_account.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vesting_treasury",
            ctx.accounts.vesting_account.company_name.as_ref(),
            &[ctx.accounts.vesting_account.treasury_bump],
        ]];

        let cpi_context = CpiContext::new(cpi_program, transfer_cpi).with_signer(signer_seeds);

        let decimals = ctx.accounts.mint.decimals;

        token_interface::treansfer_checked(cpi_context, claimbale_token as u64, decimals?);

        employe_account.total_withdraw += claimbale_token;

        Ok(())
    }

}
#[derive(Accounts)]
#[instruction(company_name:String)]
pub struct CreateVestingAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
    init,
    payer=signer,
    space=8+VestingAccount::INIT_SPACE,
    seed=[company_name.as_ref()],
     bump
  )]
    pub vesting_account: Account<'info, VestingAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
    init,
    token::mint=mint,
    token::authority=treasury_account,
    payer=signer,
    seeds=[b"vesting_treasury",company_name.as_bytes()],
    bump
  )]
    pub treasury_account: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct CreateEmployeAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(has_one=owner)]
    pub vesting_account: Account<'info, VestingAccount>,

    pub beneficary: SystemAccount<'info>,

    #[account(
    init,
    payer=owner,
    space=8 + Employee::INIT_SPACE,
    seeds = [b"employee_vesting", beneficiary.key().as_ref(), vesting_account.key().as_ref()],
    bump
)]
    pub employe_account: Account<'info, Employe>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(company_name:String)]
pub struct CreateClaimtoken<'info> {
    #[account(mut)]
    pub beneficary: Signer<'info>,
    #[account(
    mut,
    seeds=[b"employee_vesting",benificary.key().as_ref(),vesting_account.key().as_ref()],
     bump=employe_account.bump,
     has_one=benificary,
     has_one=vesting_account 
    )]
    pub employee_account: Account<'info, Employe>,
    #[account(
    mut,
    seeds=[company_name.as_ref()],
    bump=vesting_account.bump,
    has_one=treasury_account,
    has_one=mint
   )]
    pub vesting_account: Account<'info, VestingAccount>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub treasury_account: InterfaceAccount<'info, TokenAccount>,

    pub associated_account: Program<'info, AssociatedToken>,

    #[account(
    init_if_needed,
    payer=beneificary,
    associated_token::mint=mint,
    associated_token::authority=beneificary,
    associated_token::token_program=token_program
  )]
    pub employe_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct VestingAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub treasury_account: Pubkey,
    #[max_len(50)]
    pub company_name: String,
    pub treasury_bump: u8,
    pub bump: u8,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Employee {
    pub beneficary: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub total_amount: i64,
    pub total_withdraw: i64,
    pub cliff_time: i64,
    pub vesting_account: Pubkey,
    pub bump: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("claming is not available")]
    ClaimNotAvailabeYet,
    #[msg("There is nothing")]
    NothingToClaim,
}
