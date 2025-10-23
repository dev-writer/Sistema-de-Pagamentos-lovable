import { useState, useEffect } from "react";
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePage } from "@inertiajs/react";
import type { Account } from "@/types/account";

import type { Payment } from "@/types/payment";
import type { Creditor } from "@/types/creditor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ArrowLeft, Wallet, Receipt } from "lucide-react";

const getApiBase = () => {
  let API_BASE = window.location.origin || "http://localhost:8000";
  try {
    const meta = (import.meta as any)?.env;
    if (meta?.VITE_API_URL) API_BASE = meta.VITE_API_URL;
  } catch (e) {
    //
  }
  if ((window as any).__API_BASE) API_BASE = (window as any).__API_BASE;
  return API_BASE.replace(/\/$/, "");
};

const API_BASE = getApiBase();
const ACCOUNTS_URL = `${API_BASE}/accounts`;
const PAYMENTS_URL = `${API_BASE}/payments`;
const CREDITORS_URL = `${API_BASE}/creditors`;

const ACCOUNTS_KEY = "accounts";
const PAYMENTS_KEY = "payments";
const CREDITORS_KEY = "creditors";

const Dashboard = () => {
  const { props } = usePage();
  const serverAccount = (props as any).account as Account | undefined;

  const goBack = () => window.location.href = "/contas";

  const [accounts, setAccounts] = useState<Account[]>([]);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const accountId = serverAccount?.id ?? (() => {
    const m = window.location.pathname.match(/\/dashboard\/account\/([^\/]+)/);
    return m ? m[1] : undefined;
  })();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, paymentsRes, creditorsRes] = await Promise.all([
          fetch(ACCOUNTS_URL),
          fetch(PAYMENTS_URL),
          fetch(CREDITORS_URL)
        ]);

        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          const mappedAccounts: Account[] = accountsData.map((a: any) => ({
            id: String(a.id),
            number: a.number,
            name: a.name,
            initial_balance: Number(a.initial_balance ?? 0),
            current_balance: Number(a.current_balance ?? a.initial_balance ?? 0),
            createdAt: a.created_at ?? new Date().toISOString(),
          }));
          setAccounts(mappedAccounts);
        }

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          const mappedPayments: Payment[] = paymentsData.map((p: any) => ({
            id: String(p.id),
            date: p.payment_date ?? p.date ?? new Date().toISOString().split('T')[0],
            accountId: String(p.account_id),
            creditorId: String(p.creditor_id),
            amount: Number(p.amount ?? p.net_amount ?? 0),
            description: p.description ?? "",
            grossAmount: Number(p.gross_amount ?? 0),
            taxRate: Number(p.tax_rate ?? 0),
            taxAmount: Number(p.tax_amount ?? 0),
            netAmount: Number(p.net_amount ?? p.amount ?? 0),
            created_at: p.created_at ?? new Date().toISOString(),
            updated_at: p.updated_at ?? new Date().toISOString(),
            createdAt: p.created_at ?? new Date().toISOString(),
          }));
          setPayments(mappedPayments);
        }

        if (creditorsRes.ok) {
          const creditorsData = await creditorsRes.json();
          const mappedCreditors: Creditor[] = creditorsData.map((c: any) => ({
            id: String(c.id),
            name: c.name,
            document: c.document ?? "",
            createdAt: c.created_at ?? new Date().toISOString(),
          }));
          setCreditors(mappedCreditors);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  const account = serverAccount ?? accounts.find((a) => a.id === accountId);

  useEffect(() => {
    if (!account) {
      toast({
        title: "Conta não encontrada",
        description: "Redirecionando para a listagem de contas.",
        variant: "destructive",
      });
      goBack();
    }

  }, [accountId]);

  const handleAddBalance = async () => {
    if (!accountId || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${ACCOUNTS_URL}/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          add_balance: parseFloat(amount),
        }),
      });

      if (response.ok) {
        const updatedAccount = await response.json();
        const mappedAccount: Account = {
          id: String(updatedAccount.id),
          number: updatedAccount.number,
          name: updatedAccount.name,
          initial_balance: Number(updatedAccount.initial_balance ?? 0),
          current_balance: Number(updatedAccount.current_balance ?? 0),
          createdAt: updatedAccount.created_at ?? new Date().toISOString(),
        };

        setAccounts(prev => prev.map(acc => acc.id === accountId ? mappedAccount : acc));

        setAmount("");
        setDescription("");

        toast({
          title: "Saldo adicionado!",
          description: "O saldo foi atualizado com sucesso.",
        });
      } else {
        throw new Error('Failed to update account balance');
      }
    } catch (error) {
      console.error("Error updating balance:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar saldo.",
        variant: "destructive",
      });
    }
  };

  const accountPayments = payments.filter((p) => p.accountId === accountId);

  const getCreditorName = (creditorId: string) => {
    const creditor = creditors.find((c) => c.id === creditorId);
    return creditor ? creditor.name : "Credor desconhecido";
  };

  if (!account) {
    return null;
  }

  const initial_balance = parseFloat((account.initial_balance ?? account.initial_balance ?? 0) as any) || 0;
  const current_balance = parseFloat((account.current_balance ?? account.current_balance ?? initial_balance) as any) || 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard - {account.name}</h2>
            <p className="text-muted-foreground mt-2">Conta {account.number}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Saldo Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">R$ {current_balance.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">Saldo inicial: R$ {initial_balance.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Depósito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <input
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded border bg-transparent"
                />
                <Label htmlFor="description">Descrição</Label>
                <input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição (opcional)"
                  className="w-full px-3 py-2 rounded border bg-transparent"
                />
                <Button onClick={handleAddBalance} className="w-full mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Saldo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Pagamentos: {accountPayments.length}</p>
            </CardContent>
          </Card>
        </div>



        <Card>
          <CardHeader>
            <CardTitle>Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {accountPayments.length === 0 ? (
              <p className="text-muted-foreground">Nenhum pagamento registrado.</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{getCreditorName(p.creditorId)}</TableCell>
                        <TableCell>R$ {p.amount.toFixed(2)}</TableCell>
                        <TableCell>{p.description}</TableCell>
                        <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
// ...existing code...
