'use client';

import { Keypair, PublicKey } from '@solana/web3.js';
import { useMemo, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useJournalProgram, useJournalProgramAccount } from './journal-data-acces';
import { useWallet } from '@solana/wallet-adapter-react';

// Form for creating the journal entry
export function JournalCreate() {
  const { creatEntry } = useJournalProgram();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { publicKey } = useWallet();

  const isValidForm = title.trim() !== '' && message.trim() !== '';

  const handleSubmit = async () => {
    if (publicKey && isValidForm) {
      await creatEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet to create journal entries.</p>;
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Enter the Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <textarea
        placeholder="Enter the message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs"
      />
      <button
        onClick={handleSubmit}
        className="btn btn-primary btn-md"
        disabled={creatEntry.isPending || !isValidForm}
      >
        Create Journal Entry {creatEntry.isPending && '...'}
      </button>
    </div>
  );
}

// List of journal entries
export function JournalList() {
  const { accounts, getProgramAccount } = useJournalProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Ensure the program is deployed and you're on the correct cluster.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) :   //@ts-ignore
        accounts.data?.length ? (
          
        <div className="grid gap-4 md:grid-cols-2">
   
          {accounts.data.map((account:any) => (
            <JournalCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl">No accounts found</h2>
          <p>Create one above to get started.</p>
        </div>
      )}
    </div>
  );
}

// Individual journal entry card
function JournalCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useJournalProgramAccount({ account });
  const { publicKey } = useWallet();
  const [message, setMessage] = useState<string>('');
  const title = accountQuery.data?.title || '';
  const formValid = message.trim() !== '';

  const handleUpdate = async () => {
    if (publicKey && formValid && title) {
      await updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to close this account?')) {
      const title = accountQuery.data?.title;
      if (title) {
        await deleteEntry.mutateAsync(title);
      }
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet to manage journal entries.</p>;
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center space-y-6">
        <h2
          className="card-title justify-center text-3xl cursor-pointer"
          onClick={() => accountQuery.refetch()}
        >
          {title}
        </h2>
        <p>{accountQuery.data?.message}</p>
        <textarea
          placeholder="Update message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="textarea textarea-bordered w-full max-w-xs"
        />
        <button
          onClick={handleUpdate}
          className="btn btn-primary btn-md"
          disabled={updateEntry.isPending || !formValid}
        >
          Update Journal Entry {updateEntry.isPending && '...'}
        </button>
        <div className="text-center space-y-4">
          <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
          <button
            className="btn btn-secondary btn-outline btn-md"
            onClick={handleDelete}
            disabled={deleteEntry.isPending}
          >
            Close / Delete Entry
          </button>
        </div>
      </div>
    </div>
  );
}
