// TrustEstate Anchor IDL — generated manually from programs/trustestate/src/lib.rs
// Program ID: 8j9MKKmvkYeZw9SUtt7KucShygxcjZHMYpnGoJFUY1MY

export type TrustEstate = {
  version: "0.1.0";
  name: "trustestate";
  instructions: any[];
  accounts: any[];
  types: any[];
  errors: any[];
};

export const IDL: TrustEstate = {
  version: "0.1.0",
  name: "trustestate",
  instructions: [
    {
      name: "initializePlatform",
      accounts: [
        { name: "platform", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "tokenizeProperty",
      accounts: [
        { name: "property", isMut: true, isSigner: false },
        { name: "platform", isMut: true, isSigner: false },
        { name: "propertyMint", isMut: true, isSigner: true },
        { name: "ownerTokenAccount", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "associatedTokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [
        { name: "propertyId", type: "string" },
        { name: "address", type: "string" },
        { name: "areaSqm", type: "u32" },
        { name: "rooms", type: "u8" },
        { name: "floor", type: "u8" },
        { name: "totalFloors", type: "u8" },
        { name: "cadastralId", type: "string" },
        { name: "priceLamports", type: "u64" },
        { name: "documentHash", type: { array: ["u8", 32] } },
        { name: "propertyType", type: { defined: "PropertyType" } },
      ],
    },
    {
      name: "submitAiVerification",
      accounts: [
        { name: "property", isMut: true, isSigner: false },
        { name: "verification", isMut: true, isSigner: false },
        { name: "oracle", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "verificationScore", type: "u8" },
        { name: "isVerified", type: "bool" },
        { name: "fraudFlags", type: "u8" },
        { name: "fraudDetails", type: "string" },
        { name: "marketPriceEstimate", type: "u64" },
      ],
    },
    {
      name: "createDeal",
      accounts: [
        { name: "deal", isMut: true, isSigner: false },
        { name: "platform", isMut: true, isSigner: false },
        { name: "property", isMut: false, isSigner: false },
        { name: "escrowVault", isMut: true, isSigner: false },
        { name: "buyer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "dealId", type: "string" },
        { name: "offerPrice", type: "u64" },
      ],
    },
    {
      name: "fundEscrow",
      accounts: [
        { name: "deal", isMut: true, isSigner: false },
        { name: "escrowVault", isMut: true, isSigner: false },
        { name: "buyer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "confirmDeal",
      accounts: [
        { name: "deal", isMut: true, isSigner: false },
        { name: "property", isMut: true, isSigner: false },
        { name: "seller", isMut: false, isSigner: true },
      ],
      args: [],
    },
    {
      name: "submitDealAiCheck",
      accounts: [
        { name: "deal", isMut: true, isSigner: false },
        { name: "dealAiCheck", isMut: true, isSigner: false },
        { name: "platform", isMut: true, isSigner: false },
        { name: "oracle", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "riskScore", type: "u8" },
        { name: "flags", type: { vec: "string" } },
        { name: "recommendation", type: { defined: "AiRecommendation" } },
      ],
    },
    {
      name: "executeDeal",
      accounts: [
        { name: "deal", isMut: true, isSigner: false },
        { name: "property", isMut: true, isSigner: false },
        { name: "escrowVault", isMut: true, isSigner: false },
        { name: "sellerTokenAccount", isMut: true, isSigner: false },
        { name: "buyerTokenAccount", isMut: true, isSigner: false },
        { name: "seller", isMut: true, isSigner: true },
        { name: "buyer", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "escrowBump", type: "u8" }],
    },
    {
      name: "cancelDeal",
      accounts: [
        { name: "deal", isMut: true, isSigner: false },
        { name: "property", isMut: true, isSigner: false },
        { name: "platform", isMut: false, isSigner: false },
        { name: "escrowVault", isMut: true, isSigner: false },
        { name: "buyerAccount", isMut: true, isSigner: false },
        { name: "caller", isMut: false, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "fractionalizeProperty",
      accounts: [
        { name: "property", isMut: true, isSigner: false },
        { name: "fractional", isMut: true, isSigner: false },
        { name: "shareMint", isMut: true, isSigner: true },
        { name: "ownerShareAccount", isMut: true, isSigner: false },
        { name: "rentalVault", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "associatedTokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [
        { name: "totalShares", type: "u64" },
        { name: "pricePerShare", type: "u64" },
      ],
    },
    {
      name: "buyShares",
      accounts: [
        { name: "fractional", isMut: true, isSigner: false },
        { name: "buyerShareAccount", isMut: true, isSigner: false },
        { name: "ownerShareAccount", isMut: true, isSigner: false },
        { name: "buyer", isMut: true, isSigner: true },
        { name: "propertyOwner", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "numShares", type: "u64" }],
    },
    {
      name: "distributeRental",
      accounts: [
        { name: "fractional", isMut: true, isSigner: false },
        { name: "rentalVault", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
  ],
  accounts: [
    {
      name: "Platform",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "totalProperties", type: "u64" },
          { name: "totalDeals", type: "u64" },
          { name: "totalFraudBlocked", type: "u64" },
        ],
      },
    },
    {
      name: "Property",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "mint", type: "publicKey" },
          { name: "propertyId", type: "string" },
          { name: "address", type: "string" },
          { name: "areaSqm", type: "u32" },
          { name: "rooms", type: "u8" },
          { name: "floor", type: "u8" },
          { name: "totalFloors", type: "u8" },
          { name: "cadastralId", type: "string" },
          { name: "priceLamports", type: "u64" },
          { name: "documentHash", type: { array: ["u8", 32] } },
          { name: "propertyType", type: { defined: "PropertyType" } },
          { name: "isVerified", type: "bool" },
          { name: "aiVerificationScore", type: "u8" },
          { name: "isListed", type: "bool" },
          { name: "isLocked", type: "bool" },
          { name: "isFractionalized", type: "bool" },
          { name: "createdAt", type: "i64" },
          { name: "updatedAt", type: "i64" },
          { name: "fraudFlags", type: "u8" },
          { name: "dealCount", type: "u32" },
        ],
      },
    },
    {
      name: "Verification",
      type: {
        kind: "struct",
        fields: [
          { name: "property", type: "publicKey" },
          { name: "oracle", type: "publicKey" },
          { name: "verificationScore", type: "u8" },
          { name: "isVerified", type: "bool" },
          { name: "fraudFlags", type: "u8" },
          { name: "fraudDetails", type: "string" },
          { name: "marketPriceEstimate", type: "u64" },
          { name: "priceDeviationPercent", type: "i64" },
          { name: "timestamp", type: "i64" },
        ],
      },
    },
    {
      name: "Deal",
      type: {
        kind: "struct",
        fields: [
          { name: "dealId", type: "string" },
          { name: "property", type: "publicKey" },
          { name: "seller", type: "publicKey" },
          { name: "buyer", type: "publicKey" },
          { name: "price", type: "u64" },
          { name: "escrowVault", type: "publicKey" },
          { name: "buyerConfirmed", type: "bool" },
          { name: "sellerConfirmed", type: "bool" },
          { name: "aiApproved", type: "bool" },
          { name: "aiRiskScore", type: "u8" },
          { name: "status", type: { defined: "DealStatus" } },
          { name: "createdAt", type: "i64" },
          { name: "completedAt", type: "i64" },
        ],
      },
    },
    {
      name: "DealAiCheck",
      type: {
        kind: "struct",
        fields: [
          { name: "deal", type: "publicKey" },
          { name: "oracle", type: "publicKey" },
          { name: "riskScore", type: "u8" },
          { name: "flags", type: { vec: "string" } },
          { name: "recommendation", type: { defined: "AiRecommendation" } },
          { name: "timestamp", type: "i64" },
        ],
      },
    },
    {
      name: "FractionalProperty",
      type: {
        kind: "struct",
        fields: [
          { name: "property", type: "publicKey" },
          { name: "owner", type: "publicKey" },
          { name: "shareMint", type: "publicKey" },
          { name: "totalShares", type: "u64" },
          { name: "sharesSold", type: "u64" },
          { name: "pricePerShare", type: "u64" },
          { name: "rentalVault", type: "publicKey" },
          { name: "totalRentalDistributed", type: "u64" },
          { name: "createdAt", type: "i64" },
        ],
      },
    },
  ],
  types: [
    {
      name: "PropertyType",
      type: {
        kind: "enum",
        variants: [
          { name: "Apartment" },
          { name: "House" },
          { name: "Commercial" },
          { name: "Land" },
        ],
      },
    },
    {
      name: "DealStatus",
      type: {
        kind: "enum",
        variants: [
          { name: "Created" },
          { name: "Funded" },
          { name: "AwaitingAI" },
          { name: "AiApproved" },
          { name: "UnderReview" },
          { name: "Blocked" },
          { name: "Completed" },
          { name: "Cancelled" },
        ],
      },
    },
    {
      name: "AiRecommendation",
      type: {
        kind: "enum",
        variants: [
          { name: "Approve" },
          { name: "Review" },
          { name: "Block" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "InvalidScore", msg: "Invalid score" },
    { code: 6001, name: "PropertyNotVerified", msg: "Property not verified" },
    { code: 6002, name: "PropertyNotListed", msg: "Property not listed" },
    { code: 6003, name: "PropertyLocked", msg: "Property locked" },
    { code: 6004, name: "InvalidDealStatus", msg: "Invalid deal status" },
    { code: 6005, name: "Unauthorized", msg: "Unauthorized" },
    { code: 6006, name: "DealNotApproved", msg: "Deal not approved" },
    { code: 6007, name: "BuyerNotConfirmed", msg: "Buyer not confirmed" },
    { code: 6008, name: "SellerNotConfirmed", msg: "Seller not confirmed" },
    { code: 6009, name: "DealAlreadyCompleted", msg: "Deal already completed" },
    { code: 6010, name: "AlreadyFractionalized", msg: "Already fractionalized" },
    { code: 6011, name: "NotEnoughShares", msg: "Not enough shares" },
  ],
};
