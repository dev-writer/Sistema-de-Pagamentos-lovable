export interface AccountTransaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'transfer_in' | 'transfer_out' | 'payment';
  amount: number;
  description: string;
  relatedAccountId?: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  createdAt: string;
}
