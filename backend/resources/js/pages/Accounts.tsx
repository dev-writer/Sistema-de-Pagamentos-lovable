import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import type { Account, AccountFormData } from "@/types/account";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, BarChart3 } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { usePage } from "@inertiajs/react";

const STORAGE_KEY = "accounts";

const Accounts = () => {
  const props = usePage().props;
  const [accounts, setAccounts] = useState<Account[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    defaultValues: {
      number: "",
      name: "",
      initialBalance: "",
    },
  });

  // Buscar contas do servidor ao montar (certifique-se que rota GET /accounts retorna JSON)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/accounts", {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        if (res.ok) {
          const data = await res.json();
          // mapear para o tipo Account esperado no frontend
          const list: Account[] = data.map((a: any) => ({
            id: String(a.id),
            number: a.number,
            name: a.name,
            initialBalance: parseFloat(a.initial_balance ?? a.initialBalance ?? 0),
            currentBalance: parseFloat(a.current_balance ?? a.currentBalance ?? a.initial_balance ?? 0),
            createdAt: a.created_at ?? new Date().toISOString(),
          }));
          setAccounts(list);
          return;
        }
      } catch (e) {
        // falha ao buscar — continua sem dados locais
        console.warn("Não foi possível carregar contas do servidor:", e);
      }
      // fallback para localStorage (compatibilidade com estado anterior)
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setAccounts(JSON.parse(stored));
        } catch (error) {
          console.error("Error loading accounts:", error);
        }
      }
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const getCsrfToken = () =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)
      ?.content || "";

  // Envia para backend e atualiza lista com o registro retornado
  const onSubmit = async (data: AccountFormData) => {
    const payload = {
      number: data.number,
      name: data.name,
      initial_balance: parseFloat(data.initialBalance || "0"),
    };

    try {
      const res = await fetch("/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 422) {
        const json = await res.json();
        const msgs = json.errors
          ? Object.values(json.errors).flat().join(" • ")
          : "Dados inválidos";
        throw new Error(msgs);
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erro ao salvar");
      }

      const saved = await res.json();

      const account: Account = {
        id: String(saved.id ?? Date.now()),
        number: saved.number,
        name: saved.name,
        initialBalance:
          parseFloat(saved.initial_balance) ?? parseFloat(data.initialBalance || "0"),
        currentBalance:
          parseFloat(saved.current_balance) ?? parseFloat(data.initialBalance || "0"),
        createdAt: saved.created_at ?? new Date().toISOString(),
      };

      setAccounts((prev) => [account, ...prev]);
      reset();
      toast({
        title: "Conta cadastrada!",
        description: "A conta foi adicionada com sucesso.",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a conta",
        variant: "destructive",
      });
    }
  };

  const navigate = (url: string) => {
    window.location.href = url;
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      await fetch(`/accounts/${accountId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
        },
      });
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
      toast({
        title: "Conta excluída",
        description: "A conta foi removida com sucesso.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a conta",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
          <p className="text-muted-foreground mt-2">
            Cadastre e gerencie suas contas bancárias
          </p>
        </div>

        <Card className="shadow-card border-border/50 transition-smooth hover:shadow-elevated">
          <CardHeader>
            <CardTitle>Nova Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número da Conta</Label>
                  <Input
                    id="number"
                    placeholder="Ex: 12345-6"
                    {...register("number", { required: "Número é obrigatório" })}
                    className="transition-smooth"
                  />
                  {errors.number && (
                    <p className="text-sm text-destructive">{errors.number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Conta</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Conta Corrente"
                    {...register("name", { required: "Nome é obrigatório" })}
                    className="transition-smooth"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialBalance">Saldo Inicial (R$)</Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("initialBalance", {
                      required: "Saldo inicial é obrigatório",
                    })}
                    className="transition-smooth"
                  />
                  {errors.initialBalance && (
                    <p className="text-sm text-destructive">
                      {errors.initialBalance.message}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full transition-smooth">
                Cadastrar Conta
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Contas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma conta cadastrada ainda.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Saldo Inicial</TableHead>
                      <TableHead>Saldo Atual</TableHead>
                      <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.number}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>R$ {account.initialBalance.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">
                          R$ {account.currentBalance.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/dashboard/account/${account.id}`)}
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              title="Ver dashboard"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(account.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Excluir conta"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

export default Accounts;
