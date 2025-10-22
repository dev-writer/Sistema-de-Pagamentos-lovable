import { useState, useEffect } from "react";
import AppLayout from '@/layouts/app-layout';
import { PaymentForm } from "@/components/PaymentForm";
import { PaymentTable } from "@/components/PaymentTable";
import type { Payment } from "@/types/payment";
import type { Account } from "@/types/account";
import type { Creditor } from "@/types/creditor";
import { toast } from "@/hooks/use-toast";


const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, accountsRes, creditorsRes] = await Promise.all([
          fetch('/payments'),
          fetch('/accounts'),
          fetch('/creditors')
        ]);

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData);
        }

        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          const mappedAccounts: Account[] = accountsData.map((a: any) => ({
            id: String(a.id),
            name: a.name,
            number: a.number,
            initialBalance: Number(a.initial_balance ?? a.initialBalance ?? 0),
            currentBalance: Number(
              a.current_balance ??
                a.currentBalance ??
                a.initial_balance ??
                a.initialBalance ??
                0
            ),
            createdAt: a.created_at ?? a.createdAt ?? new Date().toISOString(),
          }));
          setAccounts(mappedAccounts);
        }

        if (creditorsRes.ok) {
          const creditorsData = await creditorsRes.json();
          setCreditors(creditorsData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddPayment = async (payment: any) => {
    // Payment is now created directly in PaymentForm, just add to state
    setPayments((prev) => [payment, ...prev]);
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const response = await fetch(`/payments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
        toast({
          title: "Pagamento excluído",
          description: "O pagamento foi removido com sucesso.",
          variant: "destructive",
        });
      } else {
        throw new Error('Failed to delete payment');
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir pagamento.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAccount = async (accountId: string, newBalance: number) => {
    try {
      const response = await fetch(`/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_balance: newBalance.toString(),
        }),
      });

      if (response.ok) {
        const updatedAccount = await response.json();
        const mappedAccount: Account = {
          id: String(updatedAccount.id),
          name: updatedAccount.name,
          number: updatedAccount.number,
          initial_balance: Number(updatedAccount.initial_balance ?? updatedAccount.initialBalance ?? 0),
          current_balance: Number(
            updatedAccount.current_balance ??
              updatedAccount.currentBalance ??
              updatedAccount.initial_balance ??
              updatedAccount.initialBalance ??
              0
          ),
          createdAt: updatedAccount.created_at ?? updatedAccount.createdAt ?? new Date().toISOString(),
        };
        setAccounts((prev) => prev.map((account) =>
          account.id === accountId ? mappedAccount : account
        ));
      } else {
        throw new Error('Failed to update account');
      }
    } catch (error) {
      console.error("Error updating account:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar saldo da conta.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

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
