use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY");

#[program]
pub mod trustestate {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.total_properties = 0;
        platform.total_deals = 0;
        platform.total_fraud_blocked = 0;
        Ok(())
    }

    pub fn tokenize_property(
        ctx: Context<TokenizeProperty>,
        property_id: String,
        address: String,
        area_sqm: u32,
        rooms: u8,
        floor: u8,
        total_floors: u8,
        cadastral_id: String,
        price_lamports: u64,
        document_hash: [u8; 32],
        property_type: PropertyType,
    ) -> Result<()> {
        let property = &mut ctx.accounts.property;
        let platform = &mut ctx.accounts.platform;

        property.owner = ctx.accounts.owner.key();
        property.mint = ctx.accounts.property_mint.key();
        property.property_id = property_id;
        property.address = address;
        property.area_sqm = area_sqm;
        property.rooms = rooms;
        property.floor = floor;
        property.total_floors = total_floors;
        property.cadastral_id = cadastral_id;
        property.price_lamports = price_lamports;
        property.document_hash = document_hash;
        property.property_type = property_type;
        property.is_verified = false;
        property.ai_verification_score = 0;
        property.is_listed = false;
        property.is_locked = false;
        property.is_fractionalized = false;
        property.created_at = Clock::get()?.unix_timestamp;
        property.updated_at = Clock::get()?.unix_timestamp;
        property.fraud_flags = 0;
        property.deal_count = 0;

        platform.total_properties += 1;

        let cpi_accounts = MintTo {
            mint: ctx.accounts.property_mint.to_account_info(),
            to: ctx.accounts.owner_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        token::mint_to(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            1,
        )?;

        Ok(())
    }

    // AI oracle записывает результат верификации документов on-chain
    pub fn submit_ai_verification(
        ctx: Context<SubmitAiVerification>,
        verification_score: u8,
        is_verified: bool,
        fraud_flags: u8,
        fraud_details: String,
        market_price_estimate: u64,
    ) -> Result<()> {
        require!(verification_score <= 100, TrustEstateError::InvalidScore);

        let property = &mut ctx.accounts.property;
        let verification = &mut ctx.accounts.verification;

        property.ai_verification_score = verification_score;
        property.is_verified = is_verified;
        property.fraud_flags = fraud_flags;
        property.updated_at = Clock::get()?.unix_timestamp;

        if is_verified && fraud_flags == 0 {
            property.is_listed = true;
        }

        verification.property = property.key();
        verification.oracle = ctx.accounts.oracle.key();
        verification.verification_score = verification_score;
        verification.is_verified = is_verified;
        verification.fraud_flags = fraud_flags;
        verification.fraud_details = fraud_details;
        verification.market_price_estimate = market_price_estimate;
        verification.price_deviation_percent = if market_price_estimate > 0 {
            let price = property.price_lamports as i64;
            let market = market_price_estimate as i64;
            ((price - market) * 100) / market
        } else {
            0
        };
        verification.timestamp = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn create_deal(
        ctx: Context<CreateDeal>,
        deal_id: String,
        offer_price: u64,
    ) -> Result<()> {
        let property = &ctx.accounts.property;
        let deal = &mut ctx.accounts.deal;
        let platform = &mut ctx.accounts.platform;

        require!(property.is_verified, TrustEstateError::PropertyNotVerified);
        require!(property.is_listed, TrustEstateError::PropertyNotListed);
        require!(!property.is_locked, TrustEstateError::PropertyLocked);

        deal.deal_id = deal_id;
        deal.property = property.key();
        deal.seller = property.owner;
        deal.buyer = ctx.accounts.buyer.key();
        deal.price = offer_price;
        deal.escrow_vault = ctx.accounts.escrow_vault.key();
        deal.buyer_confirmed = true;
        deal.seller_confirmed = false;
        deal.ai_approved = false;
        deal.ai_risk_score = 0;
        deal.status = DealStatus::Created;
        deal.created_at = Clock::get()?.unix_timestamp;
        deal.completed_at = 0;

        platform.total_deals += 1;
        Ok(())
    }

    pub fn fund_escrow(ctx: Context<FundEscrow>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        require!(deal.status == DealStatus::Created, TrustEstateError::InvalidDealStatus);

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.escrow_vault.key(),
            deal.price,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.escrow_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        deal.status = DealStatus::Funded;
        Ok(())
    }

    pub fn confirm_deal(ctx: Context<ConfirmDeal>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        let property = &mut ctx.accounts.property;

        require!(deal.status == DealStatus::Funded, TrustEstateError::InvalidDealStatus);
        require!(deal.seller == ctx.accounts.seller.key(), TrustEstateError::Unauthorized);

        deal.seller_confirmed = true;
        deal.status = DealStatus::AwaitingAI;
        property.is_locked = true;
        property.is_listed = false;

        Ok(())
    }

    // AI анализирует сделку и решает: approve / review / block
    pub fn submit_deal_ai_check(
        ctx: Context<SubmitDealAiCheck>,
        risk_score: u8,
        flags: Vec<String>,
        recommendation: AiRecommendation,
    ) -> Result<()> {
        require!(risk_score <= 100, TrustEstateError::InvalidScore);

        let deal = &mut ctx.accounts.deal;
        let platform = &mut ctx.accounts.platform;
        let check = &mut ctx.accounts.deal_ai_check;

        require!(deal.status == DealStatus::AwaitingAI, TrustEstateError::InvalidDealStatus);

        deal.ai_risk_score = risk_score;

        check.deal = deal.key();
        check.oracle = ctx.accounts.oracle.key();
        check.risk_score = risk_score;
        check.flags = flags;
        check.recommendation = recommendation.clone();
        check.timestamp = Clock::get()?.unix_timestamp;

        match recommendation {
            AiRecommendation::Approve => {
                deal.ai_approved = true;
                deal.status = DealStatus::AiApproved;
            }
            AiRecommendation::Review => {
                deal.status = DealStatus::UnderReview;
            }
            AiRecommendation::Block => {
                deal.status = DealStatus::Blocked;
                platform.total_fraud_blocked += 1;
            }
        }

        Ok(())
    }

    // Атомарный обмен: NFT переходит покупателю, SOL — продавцу
    pub fn execute_deal(ctx: Context<ExecuteDeal>, escrow_bump: u8) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        let property = &mut ctx.accounts.property;

        require!(deal.status == DealStatus::AiApproved, TrustEstateError::DealNotApproved);
        require!(deal.buyer_confirmed && deal.seller_confirmed, TrustEstateError::BuyerNotConfirmed);

        let cpi_accounts = Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            1,
        )?;

        **ctx.accounts.escrow_vault.to_account_info().try_borrow_mut_lamports()? -= deal.price;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += deal.price;

        property.owner = ctx.accounts.buyer.key();
        property.is_locked = false;
        property.deal_count += 1;
        property.updated_at = Clock::get()?.unix_timestamp;

        deal.status = DealStatus::Completed;
        deal.completed_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn cancel_deal(ctx: Context<CancelDeal>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        let property = &mut ctx.accounts.property;

        require!(deal.status != DealStatus::Completed, TrustEstateError::DealAlreadyCompleted);

        let caller = ctx.accounts.caller.key();
        require!(
            caller == deal.buyer || caller == deal.seller || caller == ctx.accounts.platform.authority,
            TrustEstateError::Unauthorized
        );

        let escrow_balance = ctx.accounts.escrow_vault.lamports();
        if escrow_balance > 0 {
            **ctx.accounts.escrow_vault.to_account_info().try_borrow_mut_lamports()? -= escrow_balance;
            **ctx.accounts.buyer_account.to_account_info().try_borrow_mut_lamports()? += escrow_balance;
        }

        property.is_locked = false;
        property.is_listed = true;
        deal.status = DealStatus::Cancelled;

        Ok(())
    }

    pub fn fractionalize_property(
        ctx: Context<FractionalizeProperty>,
        total_shares: u64,
        price_per_share: u64,
    ) -> Result<()> {
        let property = &mut ctx.accounts.property;
        let fractional = &mut ctx.accounts.fractional;

        require!(property.is_verified, TrustEstateError::PropertyNotVerified);
        require!(!property.is_fractionalized, TrustEstateError::AlreadyFractionalized);
        require!(property.owner == ctx.accounts.owner.key(), TrustEstateError::Unauthorized);

        property.is_fractionalized = true;

        fractional.property = property.key();
        fractional.owner = ctx.accounts.owner.key();
        fractional.share_mint = ctx.accounts.share_mint.key();
        fractional.total_shares = total_shares;
        fractional.shares_sold = 0;
        fractional.price_per_share = price_per_share;
        fractional.rental_vault = ctx.accounts.rental_vault.key();
        fractional.total_rental_distributed = 0;
        fractional.created_at = Clock::get()?.unix_timestamp;

        let cpi_accounts = MintTo {
            mint: ctx.accounts.share_mint.to_account_info(),
            to: ctx.accounts.owner_share_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        token::mint_to(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            total_shares,
        )?;

        Ok(())
    }

    pub fn buy_shares(ctx: Context<BuyShares>, num_shares: u64) -> Result<()> {
        let fractional = &mut ctx.accounts.fractional;
        let total_cost = num_shares * fractional.price_per_share;

        require!(
            num_shares <= fractional.total_shares - fractional.shares_sold,
            TrustEstateError::NotEnoughShares
        );

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.property_owner.key(),
            total_cost,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.property_owner.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_share_account.to_account_info(),
            to: ctx.accounts.buyer_share_account.to_account_info(),
            authority: ctx.accounts.property_owner.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            num_shares,
        )?;

        fractional.shares_sold += num_shares;
        Ok(())
    }

    pub fn distribute_rental(ctx: Context<DistributeRental>, amount: u64) -> Result<()> {
        let fractional = &mut ctx.accounts.fractional;
        require!(ctx.accounts.owner.key() == fractional.owner, TrustEstateError::Unauthorized);

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &ctx.accounts.rental_vault.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.rental_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        fractional.total_rental_distributed += amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(init, payer = authority, space = 8 + Platform::INIT_SPACE, seeds = [b"platform"], bump)]
    pub platform: Account<'info, Platform>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(property_id: String)]
pub struct TokenizeProperty<'info> {
    #[account(init, payer = owner, space = 8 + Property::INIT_SPACE, seeds = [b"property", property_id.as_bytes()], bump)]
    pub property: Box<Account<'info, Property>>,
    #[account(mut, seeds = [b"platform"], bump)]
    pub platform: Box<Account<'info, Platform>>,
    #[account(init, payer = owner, mint::decimals = 0, mint::authority = owner)]
    pub property_mint: Box<Account<'info, Mint>>,
    #[account(init, payer = owner, associated_token::mint = property_mint, associated_token::authority = owner)]
    pub owner_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct SubmitAiVerification<'info> {
    #[account(mut)]
    pub property: Account<'info, Property>,
    #[account(init, payer = oracle, space = 8 + Verification::INIT_SPACE, seeds = [b"verification", property.key().as_ref()], bump)]
    pub verification: Account<'info, Verification>,
    #[account(mut)]
    pub oracle: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(deal_id: String)]
pub struct CreateDeal<'info> {
    #[account(init, payer = buyer, space = 8 + Deal::INIT_SPACE, seeds = [b"deal", deal_id.as_bytes()], bump)]
    pub deal: Account<'info, Deal>,
    #[account(mut, seeds = [b"platform"], bump)]
    pub platform: Account<'info, Platform>,
    pub property: Account<'info, Property>,
    /// CHECK: escrow PDA
    #[account(mut, seeds = [b"escrow", deal.key().as_ref()], bump)]
    pub escrow_vault: SystemAccount<'info>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundEscrow<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,
    /// CHECK: escrow PDA
    #[account(mut)]
    pub escrow_vault: SystemAccount<'info>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmDeal<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,
    #[account(mut)]
    pub property: Account<'info, Property>,
    pub seller: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitDealAiCheck<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,
    #[account(init, payer = oracle, space = 8 + DealAiCheck::INIT_SPACE, seeds = [b"deal_ai", deal.key().as_ref()], bump)]
    pub deal_ai_check: Account<'info, DealAiCheck>,
    #[account(mut, seeds = [b"platform"], bump)]
    pub platform: Account<'info, Platform>,
    #[account(mut)]
    pub oracle: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteDeal<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,
    #[account(mut)]
    pub property: Account<'info, Property>,
    /// CHECK: escrow PDA
    #[account(mut)]
    pub escrow_vault: SystemAccount<'info>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub seller: Signer<'info>,
    /// CHECK: buyer
    #[account(mut)]
    pub buyer: SystemAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelDeal<'info> {
    #[account(mut)]
    pub deal: Account<'info, Deal>,
    #[account(mut)]
    pub property: Account<'info, Property>,
    #[account(seeds = [b"platform"], bump)]
    pub platform: Account<'info, Platform>,
    /// CHECK: escrow PDA
    #[account(mut)]
    pub escrow_vault: SystemAccount<'info>,
    /// CHECK: buyer for refund
    #[account(mut)]
    pub buyer_account: SystemAccount<'info>,
    pub caller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FractionalizeProperty<'info> {
    #[account(mut)]
    pub property: Box<Account<'info, Property>>,
    #[account(init, payer = owner, space = 8 + FractionalProperty::INIT_SPACE, seeds = [b"fractional", property.key().as_ref()], bump)]
    pub fractional: Box<Account<'info, FractionalProperty>>,
    #[account(init, payer = owner, mint::decimals = 0, mint::authority = owner)]
    pub share_mint: Box<Account<'info, Mint>>,
    #[account(init, payer = owner, associated_token::mint = share_mint, associated_token::authority = owner)]
    pub owner_share_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: rental vault PDA
    #[account(mut, seeds = [b"rental", property.key().as_ref()], bump)]
    pub rental_vault: SystemAccount<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyShares<'info> {
    #[account(mut)]
    pub fractional: Account<'info, FractionalProperty>,
    #[account(mut)]
    pub buyer_share_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub owner_share_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: property owner
    #[account(mut)]
    pub property_owner: SystemAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeRental<'info> {
    #[account(mut)]
    pub fractional: Account<'info, FractionalProperty>,
    /// CHECK: rental vault
    #[account(mut)]
    pub rental_vault: SystemAccount<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Platform {
    pub authority: Pubkey,
    pub total_properties: u64,
    pub total_deals: u64,
    pub total_fraud_blocked: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Property {
    pub owner: Pubkey,
    pub mint: Pubkey,
    #[max_len(32)]
    pub property_id: String,
    #[max_len(128)]
    pub address: String,
    pub area_sqm: u32,
    pub rooms: u8,
    pub floor: u8,
    pub total_floors: u8,
    #[max_len(32)]
    pub cadastral_id: String,
    pub price_lamports: u64,
    pub document_hash: [u8; 32],
    pub property_type: PropertyType,
    pub is_verified: bool,
    pub ai_verification_score: u8,
    pub is_listed: bool,
    pub is_locked: bool,
    pub is_fractionalized: bool,
    pub created_at: i64,
    pub updated_at: i64,
    pub fraud_flags: u8,
    pub deal_count: u32,
}

#[account]
#[derive(InitSpace)]
pub struct Verification {
    pub property: Pubkey,
    pub oracle: Pubkey,
    pub verification_score: u8,
    pub is_verified: bool,
    pub fraud_flags: u8,
    #[max_len(512)]
    pub fraud_details: String,
    pub market_price_estimate: u64,
    pub price_deviation_percent: i64,
    pub timestamp: i64,
}

#[account]
#[derive(InitSpace)]
pub struct Deal {
    #[max_len(32)]
    pub deal_id: String,
    pub property: Pubkey,
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
    pub escrow_vault: Pubkey,
    pub buyer_confirmed: bool,
    pub seller_confirmed: bool,
    pub ai_approved: bool,
    pub ai_risk_score: u8,
    pub status: DealStatus,
    pub created_at: i64,
    pub completed_at: i64,
}

#[account]
#[derive(InitSpace)]
pub struct DealAiCheck {
    pub deal: Pubkey,
    pub oracle: Pubkey,
    pub risk_score: u8,
    #[max_len(5, 64)]
    pub flags: Vec<String>,
    pub recommendation: AiRecommendation,
    pub timestamp: i64,
}

#[account]
#[derive(InitSpace)]
pub struct FractionalProperty {
    pub property: Pubkey,
    pub owner: Pubkey,
    pub share_mint: Pubkey,
    pub total_shares: u64,
    pub shares_sold: u64,
    pub price_per_share: u64,
    pub rental_vault: Pubkey,
    pub total_rental_distributed: u64,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum PropertyType {
    Apartment,
    House,
    Commercial,
    Land,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum DealStatus {
    Created,
    Funded,
    AwaitingAI,
    AiApproved,
    UnderReview,
    Blocked,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum AiRecommendation {
    Approve,
    Review,
    Block,
}

#[error_code]
pub enum TrustEstateError {
    #[msg("Invalid score")]
    InvalidScore,
    #[msg("Property not verified")]
    PropertyNotVerified,
    #[msg("Property not listed")]
    PropertyNotListed,
    #[msg("Property locked")]
    PropertyLocked,
    #[msg("Invalid deal status")]
    InvalidDealStatus,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Deal not approved")]
    DealNotApproved,
    #[msg("Buyer not confirmed")]
    BuyerNotConfirmed,
    #[msg("Seller not confirmed")]
    SellerNotConfirmed,
    #[msg("Deal already completed")]
    DealAlreadyCompleted,
    #[msg("Already fractionalized")]
    AlreadyFractionalized,
    #[msg("Not enough shares")]
    NotEnoughShares,
}
