import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import type { Creditor, CreditorFormData } from "@/types/creditor";
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

const API_URL = `${getApiBase()}/creditors`;

const Creditors = () => {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreditorFormData>({
    defaultValues: {
      name: "",
      document: "",
    },
  });

  useEffect(() => {
    const fetchCreditors = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCreditors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading creditors:", err);
        toast({
          title: "Erro ao carregar credores",
          description:
            "Verifique se o backend está rodando e as rotas /creditors existem.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCreditors();
  }, []);

  const onSubmit = async (data: CreditorFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          document: data.document,
          _token: (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        }),
      });

      if (res.status === 422) {
        const body = await res.json() as { errors?: Record<string, string[]> };
        const first = body?.errors
          ? Object.values(body.errors)[0][0]
          : "Erro de validação";
        toast({
          title: "Erro de validação",
          description: first,
          variant: "destructive",
        });
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const created: Creditor = await res.json();
      setCreditors((prev) => [created, ...prev]);
      reset();
      toast({
        title: "Credor cadastrado!",
        description: "O credor foi adicionado com sucesso.",
      });
    } catch (err) {
      console.error("Error creating creditor:", err);
      toast({
        title: "Erro",
        description:
          "Não foi possível cadastrar o credor. Confirme o backend e as rotas.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirma exclusão do credor?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });
      if (!(res.status === 200 || res.status === 204))
        throw new Error(`HTTP ${res.status}`);
      setCreditors((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Credor excluído",
        description: "O credor foi removido com sucesso.",
        variant: "destructive",
      });
    } catch (err) {
      console.error("Error deleting creditor:", err);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o credor.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Credores</h2>
          <p className="text-muted-foreground mt-2">
            Cadastre e gerencie seus credores
          </p>
        </div>

        <Card className="shadow-card border-border/50 transition-smooth hover:shadow-elevated">
          <CardHeader>
            <CardTitle>Novo Credor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Credor</Label>
                  <Input
                    id="name"
                    placeholder="Ex: João Silva"
                    {...register("name", { required: "Nome é obrigatório" })}
                    className="transition-smooth"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">CPF/CNPJ</Label>
                  <Input
                    id="document"
                    placeholder="Ex: 123.456.789-00"
                    {...register("document")}
                    className="transition-smooth"
                  />
                  {errors.document && (
                    <p className="text-sm text-destructive">{errors.document.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full transition-smooth"
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Cadastrar Credor"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Credores Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && creditors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : creditors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum credor cadastrado ainda.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead className="w-[120px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditors.map((creditor) => (
                      <TableRow key={creditor.id}>
                        <TableCell className="font-medium">{creditor.name}</TableCell>
                        <TableCell>{creditor.document}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                (window as any).navigate?.(`/creditor-dashboard/${creditor.id}`)
                              }
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              title="Ver Dashboard"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(creditor.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

export default Creditors;
