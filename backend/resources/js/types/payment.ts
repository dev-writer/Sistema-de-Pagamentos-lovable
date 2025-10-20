export interface Payment {
  id: string;
  date: string;
  accountId: string;
  creditorId: string;
  grossAmount: number;
  taxRate: number;
  taxAmount: number;
  netAmount: number;
  createdAt: string;
}

export interface PaymentFormData {
  date: string;
  accountId: string;
  creditorId: string;
  grossAmount: string;
  taxRate: string;
}
