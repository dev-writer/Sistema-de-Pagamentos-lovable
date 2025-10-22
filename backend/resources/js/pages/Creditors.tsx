import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import React from "react";

const STORAGE_KEY = "creditors";

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

  // Tenta carregar do servidor; se falhar, usa localStorage como fallback
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/creditors", {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        if (res.ok) {
          const data = await res.json();
          const list: Creditor[] = data.map((c: any) => ({
            id: String(c.id),
            name: c.name,
            document: c.document ?? "",
            createdAt: c.created_at ?? new Date().toISOString(),
          }));
          setCreditors(list);
          return;
        }
      } catch (e) {
        console.warn("Não foi possível carregar credores do servidor:", e);
      }

      // fallback para localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setCreditors(JSON.parse(stored));
        } catch (error) {
          console.error("Error loading creditors:", error);
        }
      }
    };
    load();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creditors));
  }, [creditors]);

  const getCsrfToken = () =>
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)
      ?.content || "";

  const navigate = (url: string) => {
    window.location.href = url;
  };

  // Envia para backend e atualiza lista com o registro retornado
  const onSubmit = async (data: CreditorFormData) => {
    const payload = {
      name: data.name,
      document: data.document || null,
    };

    try {
      const res = await fetch("/creditors", {
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

      const creditor: Creditor = {
        id: String(saved.id ?? Date.now()),
        name: saved.name,
        document: saved.document ?? data.document ?? "",
        createdAt: saved.created_at ?? new Date().toISOString(),
      };

      setCreditors((prev) => [creditor, ...prev]);
      reset();
      toast({
        title: "Credor cadastrado!",
        description: "O credor foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o credor",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este credor? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const res = await fetch(`/creditors/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(text || "Erro ao excluir");
      }

      setCreditors((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Credor excluído",
        description: "O credor foi removido com sucesso.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o credor",
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
                  <input
                    id="name"
                    placeholder="Ex: João Silva"
                    {...register("name", { required: "Nome é obrigatório" })}
                    className="transition-smooth w-full px-3 py-2 rounded border bg-transparent"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">CPF/CNPJ</Label>
                  <input
                    id="document"
                    placeholder="Ex: 123.456.789-00"
                    {...register("document")}
                    className="transition-smooth w-full px-3 py-2 rounded border bg-transparent"
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
                              onClick={() => navigate(`/dashboard/creditor/${creditor.id}`)}
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
