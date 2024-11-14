/**
 * Program IDL for the Voting program in camelCase format for use in JS/TS.
 * 
 * This type helper is based on the Voting program and includes all necessary
 * instructions, accounts, and types. The original IDL would be similar to
 * the JSON format provided by Anchor.
 */
export type Voting = {
  address: "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ",
  metadata: {
    name: "voting",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor"
  },
  instructions: [
    {
      name: "initializePoll",
      discriminator: [/* calculated discriminator for this instruction */],
      accounts: [
        { name: "signer", writable: true, signer: true },
        { name: "pollAccount", writable: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" }
      ],
      args: [
        { name: "pollId", type: "u64" },
        { name: "start", type: "u64" },
        { name: "end", type: "u64" },
        { name: "name", type: "string" },
        { name: "description", type: "string" }
      ]
    },
    {
      name: "initializeCandidates",
      discriminator: [/* calculated discriminator */],
      accounts: [
        { name: "signer", writable: true, signer: true },
        { name: "pollAccount", writable: true },
        { name: "candidateAccount", writable: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" }
      ],
      args: [
        { name: "pollId", type: "u64" },
        { name: "candidate", type: "string" }
      ]
    },
    {
      name: "vote",
      discriminator: [/* calculated discriminator */],
      accounts: [
        { name: "signer", writable: true, signer: true },
        { name: "pollAccount", writable: true },
        { name: "candidateAccount", writable: true }
      ],
      args: [
        { name: "pollId", type: "u64" },
        { name: "candidate", type: "string" }
      ]
    }
  ],
  accounts: [
    {
      name: "poll",
      discriminator: [/* calculated discriminator for Poll */],
      type: {
        kind: "struct",
        fields: [
          { name: "pollName", type: "string" },
          { name: "pollDescription", type: "string" },
          { name: "votingStart", type: "u64" },
          { name: "votingEnd", type: "u64" },
          { name: "pollOptionIndex", type: "u64" }
        ]
      }
    },
    {
      name: "candidateAccount",
      discriminator: [/* calculated discriminator for CandidateAccount */],
      type: {
        kind: "struct",
        fields: [
          { name: "candidateName", type: "string" },
          { name: "candidateVotes", type: "u64" }
        ]
      }
    }
  ],
  types: [
    {
      name: "ErrorCode",
      type: {
        kind: "enum",
        variants: [
          { name: "VotingNotStarted" },
          { name: "VotingEnded" }
        ]
      }
    }
  ]
};
