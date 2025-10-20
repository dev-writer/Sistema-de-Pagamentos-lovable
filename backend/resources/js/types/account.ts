export interface Account {
  id: string;
  number: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: string;
}

export interface AccountFormData {
  number: string;
  name: string;
  initialBalance: string;
}
