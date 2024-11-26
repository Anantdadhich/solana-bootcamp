/**
 * Program IDL in camelCase format for use in JavaScript/TypeScript.
 * 
 * This type definition corresponds to the journal CRUD program implemented in Rust.
 */
export type JournalCrud = {
  address: "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ";
  metadata: {
    name: "crud";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: Array<{
    name: string; // Name of the instruction (e.g., "create_journal_entry").
    discriminator: number[]; // Discriminator is used to uniquely identify the instruction.
    accounts: Array<{
      name: string; // Account name (e.g., "journal_entry", "owner").
      writable?: boolean; // If the account is writable (can be modified).
      signer?: boolean; // If the account is a signer (i.e., must approve the transaction).
      address?: string; // Fixed address (e.g., "system_program").
    }>;
    args: Array<{
      name: string; // Name of the argument (e.g., "title", "message").
      type: string; // Type of the argument (e.g., "string", "u8").
    }>;
  }>;
  accounts: Array<{
    name: string; // Account name (e.g., "journal_entry").
    discriminator: number[]; // Account discriminator used to identify the account type.
  }>;
  types: Array<{
    name: string; // Type name (e.g., "journal_entry").
    type: {
      kind: string; // "struct" to define a custom data structure.
      fields: Array<{
        name: string; // Field name (e.g., "owner", "title", "message").
        type: string; // Field type (e.g., "string", "Pubkey").
      }>;
    };
  }>;
};
