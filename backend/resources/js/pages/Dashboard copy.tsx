import { useState, useEffect } from "react";
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import type { Account } from "@/types/account";
import type { AccountTransaction } from "@/types/transaction";
import type { Payment } from "@/types/payment";
import type { Creditor } from "@/types/creditor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Plus, ArrowLeft, Wallet, Receipt } from "lucide-react";

const ACCOUNTS_KEY = "accounts";
const TRANSACTIONS_KEY = "accountTransactions";
const PAYMENTS_KEY = "payments";
const CREDITORS_KEY = "creditors";

const Dashboard = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const account = accounts.find((a) => a.id === accountId);

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

  useEffect(() => {
    if (accounts.length > 0 && !account) {
      toast({
        title: "Conta não encontrada",
        description: "Redirecionando para a listagem de contas.",
        variant: "destructive",
      });
      navigate("/accounts");
    }
  }, [accounts, account, navigate]);

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
      accountId: accountId,
      type: 'deposit',
      amount: parseFloat(amount),
      description: description || 'Depósito',
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = accounts.map((acc) =>
      acc.id === accountId
        ? { ...acc, currentBalance: acc.currentBalance + parseFloat(amount) }
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

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/accounts")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard - {account.name}</h2>
            <p className="text-muted-foreground mt-2">
              Conta {account.number}
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="shadow-card border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {account.currentBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo inicial: R$ {account.initialBalance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {accountTransactions.length} {accountTransactions.length === 1 ? 'transação' : 'transações'} • {accountPayments.length} {accountPayments.length === 1 ? 'pagamento' : 'pagamentos'}
            </p>
          </CardContent>
        </Card>

        {/* Add Balance */}
        <Card className="shadow-card border-border/50 transition-smooth hover:shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Depósito inicial"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={handleAddBalance} className="w-full">
                  Adicionar Saldo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {accountTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação registrada para esta conta ainda.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {transaction.type === 'deposit' && (
                              <>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span>Depósito</span>
                              </>
                            )}
                            {transaction.type === 'transfer_in' && (
                              <>
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <span>Recebido</span>
                              </>
                            )}
                            {transaction.type === 'transfer_out' && (
                              <>
                                <TrendingDown className="h-4 w-4 text-orange-600" />
                                <span>Enviado</span>
                              </>
                            )}
                            {transaction.type === 'payment' && (
                              <>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                <span>Pagamento</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={transaction.type === 'deposit' || transaction.type === 'transfer_in' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'deposit' || transaction.type === 'transfer_in' ? '+' : '-'}
                            R$ {transaction.amount.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments History */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Histórico de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum pagamento registrado para esta conta ainda.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Credor</TableHead>
                      <TableHead className="text-right">Valor Bruto</TableHead>
                      <TableHead className="text-right">Imposto</TableHead>
                      <TableHead className="text-right">Valor Líquido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{getCreditorName(payment.creditorId)}</TableCell>
                        <TableCell className="text-right">
                          R$ {payment.grossAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          -{payment.taxRate}% (R$ {payment.taxAmount.toFixed(2)})
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          -R$ {payment.netAmount.toFixed(2)}
                        </TableCell>
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
