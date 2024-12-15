/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/token_vesting.json`.
 */
export type Vesting = {
  address: "722GgbCV6Y72Z94dEhMe359J3JVgDTa2wZ5MMCnuBsMx";
  metadata: {
    name: "token-vesting";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Token vesting program created with Anchor";
  };
  instructions: [
    {
      name: "createVestingAccount";
      discriminator: [123, 45, 67, 89, 101, 23, 56, 78];
      accounts: [
        { name: "signer"; writable: true; signer: true },
        { name: "vestingAccount"; writable: true },
        { name: "mint"; writable: false },
        { name: "treasuryAccount"; writable: true },
        { name: "systemProgram"; address: "11111111111111111111111111111111" },
        { name: "tokenProgram"; writable: false }
      ];
      args: [
        { name: "companyName"; type: "string" }
      ];
    },
    {
      name: "createEmployee";
      discriminator: [98, 76, 54, 32, 10, 23, 45, 67];
      accounts: [
        { name: "owner"; writable: true; signer: true },
        { name: "vestingAccount"; writable: false },
        { name: "beneficiary"; writable: false },
        { name: "employeeAccount"; writable: true },
        { name: "systemProgram"; address: "11111111111111111111111111111111" }
      ];
      args: [
        { name: "startTime"; type: "i64" },
        { name: "endTime"; type: "i64" },
        { name: "totalAmount"; type: "i64" },
        { name: "cliffTime"; type: "i64" }
      ];
    },
    {
      name: "createTokens";
      discriminator: [11, 22, 33, 44, 55, 66, 77, 88];
      accounts: [
        { name: "beneficiary"; writable: true; signer: true },
        { name: "employeeAccount"; writable: true },
        { name: "vestingAccount"; writable: false },
        { name: "mint"; writable: false },
        { name: "treasuryAccount"; writable: true },
        { name: "employeeTokenAccount"; writable: true },
        { name: "systemProgram"; address: "11111111111111111111111111111111" },
        { name: "tokenProgram"; writable: false },
        { name: "associatedTokenProgram"; writable: false }
      ];
      args: [
        { name: "companyName"; type: "string" }
      ];
    }
  ];
  accounts: [
    {
      name: "vestingAccount";
      discriminator: [201, 202, 203, 204, 205, 206, 207, 208];
    },
    {
      name: "employee";
      discriminator: [101, 102, 103, 104, 105, 106, 107, 108];
    }
  ];
  types: [
    {
      name: "vestingAccount";
      type: {
        kind: "struct";
        fields: [
          { name: "owner"; type: "publicKey" },
          { name: "mint"; type: "publicKey" },
          { name: "treasuryAccount"; type: "publicKey" },
          { name: "companyName"; type: "string" },
          { name: "treasuryBump"; type: "u8" },
          { name: "bump"; type: "u8" }
        ];
      };
    },
    {
      name: "employee";
      type: {
        kind: "struct";
        fields: [
          { name: "beneficiary"; type: "publicKey" },
          { name: "startTime"; type: "i64" },
          { name: "endTime"; type: "i64" },
          { name: "totalAmount"; type: "i64" },
          { name: "totalWithdraw"; type: "i64" },
          { name: "cliffTime"; type: "i64" },
          { name: "vestingAccount"; type: "publicKey" },
          { name: "bump"; type: "u8" }
        ];
      };
    }
  ];
};
