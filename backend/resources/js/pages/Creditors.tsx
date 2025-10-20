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

const STORAGE_KEY = "creditors";



const Creditors = () => {

  const [creditors, setCreditors] = useState<Creditor[]>([]);

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
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCreditors(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading creditors:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creditors));
  }, [creditors]);

  const onSubmit = (data: CreditorFormData) => {
    const creditor: Creditor = {
      id: Date.now().toString(),
      name: data.name,
      document: data.document,
      createdAt: new Date().toISOString(),
    };

    setCreditors((prev) => [creditor, ...prev]);
    reset();
    toast({
      title: "Credor cadastrado!",
      description: "O credor foi adicionado com sucesso.",
    });
  };

  const handleDelete = (id: string) => {
    setCreditors((prev) => prev.filter((c) => c.id !== id));
    toast({
      title: "Credor excluído",
      description: "O credor foi removido com sucesso.",
      variant: "destructive",
    });
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
                    {...register("name")}
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

              <Button type="submit" className="w-full transition-smooth">
                Cadastrar Credor
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Credores Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {creditors.length === 0 ? (
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
                              onClick={() => navigate(`/creditor-dashboard/${creditor.id}`)}
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
