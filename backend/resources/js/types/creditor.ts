export interface Creditor {
  id: string;
  name: string;
  document: string;
  createdAt: string;
}

export interface CreditorFormData {
  name: string;
  document: string;
}
