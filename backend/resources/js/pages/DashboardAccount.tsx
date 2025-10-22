import { useState, useEffect } from "react";
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePage } from "@inertiajs/react";
import type { Account } from "@/types/account";
import type { AccountTransaction } from "@/types/transaction";
import type { Transfer } from "@/types/transaction";
import type { Payment } from "@/types/payment";
import type { Creditor } from "@/types/creditor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Plus, ArrowLeft, Wallet, Receipt } from "lucide-react";

const ACCOUNTS_KEY = "accounts";
const TRANSACTIONS_KEY = "accountTransactions";
const PAYMENTS_KEY = "payments";
const CREDITORS_KEY = "creditors";

const Dashboard = () => {
  const { props } = usePage();
  const serverAccount = (props as any).account as Account | undefined;

  const goBack = () => window.location.href = "/contas";

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const accountId = serverAccount?.id ?? (() => {
    const m = window.location.pathname.match(/\/dashboard\/account\/([^\/]+)/);
    return m ? m[1] : undefined;
  })();

  useEffect(() => {
    const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
    const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    const storedPayments = localStorage.getItem(PAYMENTS_KEY);
    const storedCreditors = localStorage.getItem(CREDITORS_KEY);

    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    if (storedPayments) setPayments(JSON.parse(storedPayments));
    if (storedCreditors) setCreditors(JSON.parse(storedCreditors));
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

  const handleAddBalance = () => {
    if (!accountId || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erro",
        description: "Informe um valor válido.",
        variant: "destructive",
      });
      return;
    }

    const transaction: AccountTransaction = {
      id: Date.now().toString(),
      accountId: accountId!,
      type: 'deposit',
      amount: parseFloat(amount),
      description: description || 'Depósito',
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = accounts.map((acc) =>
      acc.id === accountId
        ? { ...acc, currentBalance: (acc.currentBalance ?? acc.initialBalance ?? 0) + parseFloat(amount) }
        : acc
    );

    const updatedTransactions = [transaction, ...transactions];

    setAccounts(updatedAccounts);
    setTransactions(updatedTransactions);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));

    setAmount("");
    setDescription("");

    toast({
      title: "Saldo adicionado!",
      description: "O saldo foi atualizado com sucesso.",
    });
  };

  const accountTransactions = transactions.filter((t) => t.accountId === accountId);
  const accountPayments = payments.filter((p) => p.accountId === accountId);

  const getCreditorName = (creditorId: string) => {
    const creditor = creditors.find((c) => c.id === creditorId);
    return creditor ? creditor.name : "Credor desconhecido";
  };

  if (!account) {
    return null;
  }

  const initialBalance = parseFloat((account.initial_balance ?? account.initialBalance ?? 0) as any) || 0;
  const currentBalance = parseFloat((account.current_balance ?? account.currentBalance ?? initialBalance) as any) || 0;

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
              <div className="text-2xl font-semibold">R$ {currentBalance.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">Saldo inicial: R$ {initialBalance.toFixed(2)}</p>
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
              <p>Transações: {accountTransactions.length}</p>
              <p>Pagamentos: {accountPayments.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {accountTransactions.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma transação para esta conta.</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.type === 'deposit' ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}{t.type}</TableCell>
                        <TableCell>R$ {t.amount.toFixed(2)}</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

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