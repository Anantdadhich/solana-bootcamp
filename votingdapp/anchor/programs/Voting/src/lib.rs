#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");
//there is main program logic
#[program]
pub mod voting {
    use super::*;
    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        poll_id: u64,
        start: u64,
        end: u64,
        name: String,
        description: String,
    ) -> Result<()> {
        //we assign the values
        ctx.accounts.poll_account.poll_name = name;
        ctx.accounts.poll_account.poll_description = description;
        ctx.accounts.poll_account.voting_start = start;
        ctx.accounts.poll_account.voting_end = end;
        // is success
        Ok(())
    }

    pub fn initialize_candidates(
        ctx: Context<InitializeCandidates>,
        poll_id: u64,
        candidate: String,
    ) -> Result<()> {
        ctx.accounts.candidate_account.candidate_name = candidate;
        ctx.accounts.poll_account.poll_option_index += 1;
        Ok(())
    }

    // we use context which holds the information about the Transaction
    // here the context is info about the accounts used in Transaction
    pub fn vote(ctx: Context<Vote>, poll_id: u64, candidate: String) -> Result<()> {
        // account that keeps track of the specific candidate
        let candidate_account = &mut ctx.accounts.candidate_account;
        let current_time = Clock::get()?.unix_timestamp;

        // voting is ended
        if current_time > (ctx.accounts.poll_account.voting_end as i64) {
            return Err(ErrorCode::VotingEnded.into());
        }

        // check if voting has not started
        if current_time <= (ctx.accounts.poll_account.voting_start as i64) {
            return Err(ErrorCode::VotingNotStarted.into());
        }

        candidate_account.candidate_votes += 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate: String)]
pub struct InitializeCandidates<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll_account: Account<'info, Poll>,

    #[account(
        init,
        payer = signer,
        space = 8 + CandidateAccount::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate.as_ref()],
        bump
    )]
    pub candidate_account: Account<'info, CandidateAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    // here we initialize the poll account
    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll_account: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id:u64,candidate:String)]

pub struct Vote<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
    mut,
    seeds=[b"poll".as_ref(),poll_id.to_le_bytes().as_ref()],
    bump
  )]
    pub poll_account: Account<'info, Poll>,

    #[account(
    mut,
    seed=[poll_id.to_le_bytes().as_ref(),candidate.as_ref]
  )]
    pub candidate_account: Account<'info, CandidateAccount>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    #[max_len(32)]
    pub poll_name: String,
    #[max_len(280)]
    pub poll_description: String,
    pub voting_start: u64,
    pub voting_end: u64,
    pub poll_option_index: u64,
}

#[account]
#[derive(InitSpace)]
pub struct CandidateAccount {
    #[max_len(32)]
    pub candidate_name: String,
    pub candidate_votes: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("voting not started")]
    VotingNotStarted,
    #[msg("voting ended")]
    VotingEnded,
}
