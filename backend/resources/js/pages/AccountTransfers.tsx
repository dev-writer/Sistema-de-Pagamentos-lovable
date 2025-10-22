import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Account } from "@/types/account";
import type { Transfer } from "@/types/transaction";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import AppLayout from "@/layouts/app-layout";

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
const TRANSFERS_URL = `${API_BASE}/transfers`;

const AccountTransfers = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(ACCOUNTS_URL, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const accountsData = await res.json();
      const mappedAccounts: Account[] = accountsData.map((a: any) => ({
        id: String(a.id),
        name: a.name,
        number: a.number,
        initial_balance: Number(a.initial_balance ?? a.initial_balance ?? 0),
        current_balance: Number(
          a.current_balance ??
            a.current_balance ??
            a.initial_balance ??
            a.initial_balance ??
            0
        ),
        createdAt: a.created_at ?? a.createdAt ?? new Date().toISOString(),
      }));
      setAccounts(mappedAccounts);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas. Verifique o backend e as rotas.",
        variant: "destructive",
      });
    }
  };

  const fetchTransfers = async () => {
    try {
      const res = await fetch(TRANSFERS_URL, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const transfersData = await res.json();
      const mappedTransfers: Transfer[] = transfersData.map((t: any) => ({
        id: String(t.id),
        fromAccountId: String(t.from_account_id ?? t.fromAccountId),
        toAccountId: String(t.to_account_id ?? t.toAccountId),
        amount: Number(t.amount ?? 0),
        description: t.description ?? t.note ?? '',
        createdAt: t.created_at ?? t.createdAt ?? new Date().toISOString(),
      }));
      setTransfers(mappedTransfers);
    } catch (error) {
      console.error("Erro ao carregar transferências:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar transferências. Verifique o backend e as rotas.",
        variant: "destructive",
      });
    }
  };

  // Carregar contas e transferências do servidor
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAccounts(), fetchTransfers()]).finally(() => setLoading(false));
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
    if (fromAccountId === toAccountId) {
      toast({
        title: "Erro",
        description: "Conta de origem e destino não podem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(TRANSFERS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
          amount: parseFloat(amount),
          description: description || "Transferência entre contas",
          _token: (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        }),
      });

      if (res.status === 422) {
        const body = await res.json();
        const errorMessage = body.message || 'Erro de validação.';
        toast({
          title: "Erro de Validação",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }

      const savedTransfer = await res.json();

      // Atualiza lista de transferências
      const mapped: Transfer = {
        id: String(savedTransfer.id),
        fromAccountId: String(savedTransfer.from_account_id ?? savedTransfer.fromAccountId),
        toAccountId: String(savedTransfer.to_account_id ?? savedTransfer.toAccountId),
        amount: Number(savedTransfer.amount ?? 0),
        description: savedTransfer.description ?? savedTransfer.note ?? "",
        createdAt: savedTransfer.created_at ?? savedTransfer.createdAt ?? new Date().toISOString(),
      };
      setTransfers(prev => [mapped, ...prev]);

      // Atualiza saldos das contas recarregando do servidor para evitar divergência
      await fetchAccounts();

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
      console.error("Erro ao criar transferência:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível realizar a transferência",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja reverter esta transferência?')) {
      return;
    }

    try {
      const res = await fetch(`${TRANSFERS_URL}/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!(res.status === 200 || res.status === 204)) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }

      // Remove da lista e recarrega contas
      setTransfers(prev => prev.filter(t => t.id !== id));
      await fetchAccounts();

      toast({
        title: "Transferência revertida",
        description: "A transferência foi excluída e os saldos atualizados.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Erro ao reverter transferência:", error);
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
          <h2 className="text-3xl font-bold tracking-tight">Transferências</h2>
          <p className="text-muted-foreground mt-2">
            Realize transferências entre suas contas
          </p>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Nova Transferência</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleTransfer(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromAccount">Conta de Origem</Label>
                  <Select value={fromAccountId} onValueChange={setFromAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - R$ {account.current_balance?.toFixed(2) ?? '0.00'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toAccount">Conta de Destino</Label>
                  <Select value={toAccountId} onValueChange={setToAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - R$ {account.current_balance?.toFixed(2) ?? '0.00'}
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
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Transferência entre contas"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Enviando..." : "Realizar Transferência"}
              </Button>
            </form>
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
                      <TableHead>Valor</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          {new Date(transfer.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getAccountName(transfer.fromAccountId)}</TableCell>
                        <TableCell>{getAccountName(transfer.toAccountId)}</TableCell>
                        <TableCell>
                          R$ {Number(transfer.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>{transfer.description}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(transfer.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Excluir transferência"
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
