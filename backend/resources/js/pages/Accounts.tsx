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

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAccounts(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading accounts:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const onSubmit = (data: AccountFormData) => {
    const account: Account = {
      id: Date.now().toString(),
      number: data.number,
      name: data.name,
      initialBalance: parseFloat(data.initialBalance),
      currentBalance: parseFloat(data.initialBalance),
      createdAt: new Date().toISOString(),
    };

    setAccounts((prev) => [account, ...prev]);
    reset();
    toast({
      title: "Conta cadastrada!",
      description: "A conta foi adicionada com sucesso.",
    });
  };

  const handleDelete = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast({
      title: "Conta excluída",
      description: "A conta foi removida com sucesso.",
      variant: "destructive",
    });
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
                    {...register("number")}
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
                    {...register("name")}
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
                    {...register("initialBalance")}
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
                              onClick={() => navigate(`/dashboard/${account.id}`)}
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
