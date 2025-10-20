import { useState, useEffect } from "react";
import AppLayout from '@/layouts/app-layout';
import { PaymentForm } from "@/components/PaymentForm";
import { PaymentTable } from "@/components/PaymentTable";
import type { Payment } from "@/types/payment";
import type { Account } from "@/types/account";
import type { Creditor } from "@/types/creditor";
import { toast } from "@/hooks/use-toast";


const PAYMENTS_KEY = "payments";
const ACCOUNTS_KEY = "accounts";
const CREDITORS_KEY = "creditors";

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);

  useEffect(() => {
    const storedPayments = localStorage.getItem(PAYMENTS_KEY);
    const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
    const storedCreditors = localStorage.getItem(CREDITORS_KEY);

    if (storedPayments) {
      try {
        setPayments(JSON.parse(storedPayments));
      } catch (error) {
        console.error("Error loading payments:", error);
      }
    }

    if (storedAccounts) {
      try {
        setAccounts(JSON.parse(storedAccounts));
      } catch (error) {
        console.error("Error loading accounts:", error);
      }
    }

    if (storedCreditors) {
      try {
        setCreditors(JSON.parse(storedCreditors));
      } catch (error) {
        console.error("Error loading creditors:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  }, [payments]);

  const handleAddPayment = (payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
  };

  const handleDeletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: "Pagamento excluído",
      description: "O pagamento foi removido com sucesso.",
      variant: "destructive",
    });
  };

  const handleUpdateAccount = (accountId: string, newBalance: number) => {
    setAccounts((prev) => {
      const updated = prev.map((account) =>
        account.id === accountId
          ? { ...account, currentBalance: newBalance }
          : account
      );
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pagamentos</h2>
          <p className="text-muted-foreground mt-2">
            Registre e gerencie seus pagamentos
          </p>
        </div>

        <PaymentForm
          onSubmit={handleAddPayment}
          accounts={accounts}
          creditors={creditors}
          onUpdateAccount={handleUpdateAccount}
        />

        <PaymentTable
          payments={payments}
          accounts={accounts}
          creditors={creditors}
          onDelete={handleDeletePayment}
        />
      </div>
    </AppLayout>
  );
};

export default Payments;
