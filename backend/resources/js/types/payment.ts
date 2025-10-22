export interface Payment {
  id: string;
  date: string;
  accountId: string;
  creditorId: string;
  amount: number;
  description: string;
  grossAmount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  created_at: string;
  updated_at: string;
  createdAt: string;
  
}

export interface PaymentFormData {
  date: string;
  accountId: string;
  creditorId: string;
  grossAmount: string;
  taxRate: string;
}
