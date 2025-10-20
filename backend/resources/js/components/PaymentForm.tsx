import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Payment, PaymentFormData } from "@/types/payment";
import type { Account } from "@/types/account";
import type { Creditor } from "@/types/creditor";

const formSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  accountId: z.string().min(1, "Conta é obrigatória"),
  creditorId: z.string().min(1, "Credor é obrigatório"),
  grossAmount: z.string().min(1, "Valor bruto é obrigatório"),
  taxRate: z.string().min(1, "Imposto é obrigatório"),
});

interface PaymentFormProps {
  onSubmit: (payment: Payment) => void;
  accounts: Account[];
  creditors: Creditor[];
  onUpdateAccount: (accountId: string, newBalance: number) => void;
}

export function PaymentForm({ onSubmit, accounts, creditors, onUpdateAccount }: PaymentFormProps) {
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      accountId: "",
      creditorId: "",
      grossAmount: "",
      taxRate: "",
    },
  });

  const grossAmount = watch("grossAmount");
  const taxRate = watch("taxRate");

  useEffect(() => {
    const gross = parseFloat(grossAmount) || 0;
    const rate = parseFloat(taxRate) || 0;
    
    const calculatedTaxAmount = (gross * rate) / 100;
    const calculatedNetAmount = gross - calculatedTaxAmount;
    
    setTaxAmount(calculatedTaxAmount);
    setNetAmount(calculatedNetAmount);
  }, [grossAmount, taxRate]);

  const accountId = watch("accountId");

  const onSubmitForm = (data: PaymentFormData) => {
    const selectedAccount = accounts.find((a) => a.id === data.accountId);
    
    if (!selectedAccount) {
      toast({
        title: "Erro",
        description: "Conta não encontrada.",
        variant: "destructive",
      });
      return;
    }

    if (selectedAccount.currentBalance < netAmount) {
      toast({
        title: "Saldo insuficiente",
        description: `A conta não possui saldo suficiente. Saldo atual: R$ ${selectedAccount.currentBalance.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    const payment: Payment = {
      id: Date.now().toString(),
      date: data.date,
      accountId: data.accountId,
      creditorId: data.creditorId,
      grossAmount: parseFloat(data.grossAmount),
      taxRate: parseFloat(data.taxRate),
      taxAmount,
      netAmount,
      createdAt: new Date().toISOString(),
    };

    onUpdateAccount(data.accountId, selectedAccount.currentBalance - netAmount);
    onSubmit(payment);
    reset({
      date: new Date().toISOString().split("T")[0],
      accountId: "",
      creditorId: "",
      grossAmount: "",
      taxRate: "",
    });
    
    toast({
      title: "Pagamento registrado!",
      description: "O pagamento foi adicionado com sucesso e o saldo foi atualizado.",
    });
  };

  return (
    <Card className="shadow-card border-border/50 transition-smooth hover:shadow-elevated">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Registrar Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data do Pagamento</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className="transition-smooth"
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Conta</Label>
              <Select
                onValueChange={(value) => setValue("accountId", value)}
                defaultValue=""
              >
                <SelectTrigger className="transition-smooth">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhuma conta cadastrada
                    </SelectItem>
                  ) : (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.number} - {account.name} (Saldo: R${" "}
                        {account.currentBalance.toFixed(2)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-sm text-destructive">{errors.accountId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditorId">Credor</Label>
              <Select
                onValueChange={(value) => setValue("creditorId", value)}
                defaultValue=""
              >
                <SelectTrigger className="transition-smooth">
                  <SelectValue placeholder="Selecione um credor" />
                </SelectTrigger>
                <SelectContent>
                  {creditors.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum credor cadastrado
                    </SelectItem>
                  ) : (
                    creditors.map((creditor) => (
                      <SelectItem key={creditor.id} value={creditor.id}>
                        {creditor.name} ({creditor.document})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.creditorId && (
                <p className="text-sm text-destructive">{errors.creditorId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grossAmount">Valor Bruto (R$)</Label>
              <Input
                id="grossAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("grossAmount")}
                className="transition-smooth"
              />
              {errors.grossAmount && (
                <p className="text-sm text-destructive">{errors.grossAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Imposto de Renda (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("taxRate")}
                className="transition-smooth"
              />
              {errors.taxRate && (
                <p className="text-sm text-destructive">{errors.taxRate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Valor do Imposto</Label>
              <div className="text-2xl font-semibold text-destructive">
                R$ {taxAmount.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Valor Líquido</Label>
              <div className="text-2xl font-semibold text-primary">
                R$ {netAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full transition-smooth" size="lg">
            Registrar Pagamento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
