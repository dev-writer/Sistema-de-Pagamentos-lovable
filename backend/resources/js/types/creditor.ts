export interface Creditor {
  id: string;
  name: string;
  cpf_cnpj: string;
  createdAt: string;
}

export interface CreditorFormData {
  name: string;
  cpf_cnpj: string;
}
