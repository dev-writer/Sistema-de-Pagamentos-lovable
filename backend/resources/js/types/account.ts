export interface Account {
  id: string;
  number: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  createdAt: string;
}

export interface AccountFormData {
  number: string;
  name: string;
  initialBalance: string;
}
