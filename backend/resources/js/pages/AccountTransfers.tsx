import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Account } from "@/types/account";
import type { Transfer, AccountTransaction } from "@/types/transaction";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeftRight, Trash2 } from "lucide-react";
import AppLayout from "@/layouts/app-layout";

const ACCOUNTS_KEY = "accounts";
const TRANSFERS_KEY = "transfers";
const TRANSACTIONS_KEY = "accountTransactions";

const AccountTransfers = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
    const storedTransfers = localStorage.getItem(TRANSFERS_KEY);
    const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);

    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
    if (storedTransfers) setTransfers(JSON.parse(storedTransfers));
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
  }, []);

  const handleTransfer = () => {
    if (!fromAccountId || !toAccountId || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos com valores válidos.",
        variant: "destructive",
      });
      return;
    }

    if (fromAccountId === toAccountId) {
      toast({
        title: "Erro",
        description: "Selecione contas diferentes.",
        variant: "destructive",
      });
      return;
    }

    const fromAccount = accounts.find((a) => a.id === fromAccountId);
    if (!fromAccount || fromAccount.currentBalance < parseFloat(amount)) {
      toast({
        title: "Saldo insuficiente",
        description: "A conta de origem não possui saldo suficiente.",
        variant: "destructive",
      });
      return;
    }

    const transfer: Transfer = {
      id: Date.now().toString(),
      fromAccountId,
      toAccountId,
      amount: parseFloat(amount),
      description: description || 'Transferência entre contas',
      createdAt: new Date().toISOString(),
    };

    const transactionOut: AccountTransaction = {
      id: `${Date.now()}-out`,
      accountId: fromAccountId,
      type: 'transfer_out',
      amount: parseFloat(amount),
      description: description || 'Transferência enviada',
      relatedAccountId: toAccountId,
      createdAt: new Date().toISOString(),
    };

    const transactionIn: AccountTransaction = {
      id: `${Date.now()}-in`,
      accountId: toAccountId,
      type: 'transfer_in',
      amount: parseFloat(amount),
      description: description || 'Transferência recebida',
      relatedAccountId: fromAccountId,
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = accounts.map((account) => {
      if (account.id === fromAccountId) {
        return { ...account, currentBalance: account.currentBalance - parseFloat(amount) };
      }
      if (account.id === toAccountId) {
        return { ...account, currentBalance: account.currentBalance + parseFloat(amount) };
      }
      return account;
    });

    const updatedTransfers = [transfer, ...transfers];
    const updatedTransactions = [transactionIn, transactionOut, ...transactions];

    setAccounts(updatedAccounts);
    setTransfers(updatedTransfers);
    setTransactions(updatedTransactions);
    
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
    localStorage.setItem(TRANSFERS_KEY, JSON.stringify(updatedTransfers));
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));

    setFromAccountId("");
    setToAccountId("");
    setAmount("");
    setDescription("");

    toast({
      title: "Transferência realizada!",
      description: "Os saldos foram atualizados com sucesso.",
    });
  };

  const handleDelete = (id: string) => {
    const transfer = transfers.find((t) => t.id === id);
    if (!transfer) return;

    const updatedAccounts = accounts.map((account) => {
      if (account.id === transfer.fromAccountId) {
        return { ...account, currentBalance: account.currentBalance + transfer.amount };
      }
      if (account.id === transfer.toAccountId) {
        return { ...account, currentBalance: account.currentBalance - transfer.amount };
      }
      return account;
    });

    const updatedTransfers = transfers.filter((t) => t.id !== id);

    setAccounts(updatedAccounts);
    setTransfers(updatedTransfers);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
    localStorage.setItem(TRANSFERS_KEY, JSON.stringify(updatedTransfers));

    toast({
      title: "Transferência excluída",
      description: "A transferência foi revertida com sucesso.",
      variant: "destructive",
    });
  };

  const getAccountName = (accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.name || "Conta não encontrada";
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transferências entre Contas</h2>
          <p className="text-muted-foreground mt-2">
            Transfira valores entre suas contas
          </p>
        </div>

        <Card className="shadow-card border-border/50 transition-smooth hover:shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Nova Transferência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromAccount">Conta de Origem</Label>
                  <Select value={fromAccountId} onValueChange={setFromAccountId}>
                    <SelectTrigger id="fromAccount">
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {account.number} (R$ {account.currentBalance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toAccount">Conta de Destino</Label>
                  <Select value={toAccountId} onValueChange={setToAccountId}>
                    <SelectTrigger id="toAccount">
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {account.number} (R$ {account.currentBalance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Ex: Transferência para investimentos"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleTransfer} className="w-full">
                Realizar Transferência
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Histórico de Transferências</CardTitle>
          </CardHeader>
          <CardContent>
            {transfers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transferência realizada ainda.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>De</TableHead>
                      <TableHead>Para</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          {new Date(transfer.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{getAccountName(transfer.fromAccountId)}</TableCell>
                        <TableCell>{getAccountName(transfer.toAccountId)}</TableCell>
                        <TableCell>{transfer.description}</TableCell>
                        <TableCell className="text-right font-semibold">
                          R$ {transfer.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(transfer.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

export default AccountTransfers;
