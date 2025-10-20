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

const AccountTransfers = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Carregar contas e transferências do servidor
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsRes, transfersRes] = await Promise.all([
          fetch('/accounts'),
          fetch('/transfers')
        ]);

        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          setAccounts(accountsData);
        }

        if (transfersRes.ok) {
          const transfersData = await transfersRes.json();
          setTransfers(transfersData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []);

  const handleTransfer = async () => {
    if (!fromAccountId || !toAccountId || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos com valores válidos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch('/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
          amount: parseFloat(amount),
          description: description || 'Transferência entre contas',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao realizar transferência');
      }

      const savedTransfer = await res.json();
      
      // Atualiza lista de transferências
      setTransfers(prev => [savedTransfer, ...prev]);
      
      // Atualiza saldos das contas
      setAccounts(prev => prev.map(account => {
        if (account.id === fromAccountId) {
          return { ...account, currentBalance: account.currentBalance - parseFloat(amount) };
        }
        if (account.id === toAccountId) {
          return { ...account, currentBalance: account.currentBalance + parseFloat(amount) };
        }
        return account;
      }));

      // Limpa form
      setFromAccountId("");
      setToAccountId("");
      setAmount("");
      setDescription("");

      toast({
        title: "Transferência realizada!",
        description: "Os saldos foram atualizados com sucesso.",
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível realizar a transferência",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja reverter esta transferência?')) {
      return;
    }

    try {
      const res = await fetch(`/transfers/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!res.ok) {
        throw new Error('Erro ao reverter transferência');
      }

      // Remove da lista
      setTransfers(prev => prev.filter(t => t.id !== id));
      
      // Recarrega contas para ter saldos atualizados
      const accountsRes = await fetch('/accounts');
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);
      }

      toast({
        title: "Transferência revertida",
        description: "A transferência foi excluída e os saldos atualizados.",
        variant: "destructive",
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível reverter a transferência",
        variant: "destructive",
      });
    }
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
