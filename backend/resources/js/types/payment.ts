export interface Payment {
  id: number;
  date: string;
  accountId: number;
  creditorId: number;
  grossAmount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  date: string;
  accountId: string;
  creditorId: string;
  grossAmount: string;
  taxRate: string;
}
