import { useState, useEffect, useMemo } from "react";
import { PaymentTable } from "@/components/PaymentTable"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Payment } from "@/types/payment";
import type { Account } from "@/types/account";
import type { Creditor } from "@/types/creditor";
import AppLayout from '@/layouts/app-layout';



const PAYMENTS_KEY = "payments";
const ACCOUNTS_KEY = "accounts";
const CREDITORS_KEY = "creditors";

const PaymentReports = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedCreditor, setSelectedCreditor] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    const storedPayments = localStorage.getItem(PAYMENTS_KEY);
    const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
    const storedCreditors = localStorage.getItem(CREDITORS_KEY);

    if (storedPayments) {
      try {
        setPayments(JSON.parse(storedPayments));
      } catch (error) {
        console.error("Error loading payments:", error);
      }
    }

    if (storedAccounts) {
      try {
        setAccounts(JSON.parse(storedAccounts));
      } catch (error) {
        console.error("Error loading accounts:", error);
      }
    }

    if (storedCreditors) {
      try {
        setCreditors(JSON.parse(storedCreditors));
      } catch (error) {
        console.error("Error loading creditors:", error);
      }
    }
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesAccount = selectedAccount === "all" || payment.accountId === selectedAccount;
      const matchesCreditor = selectedCreditor === "all" || payment.creditorId === selectedCreditor;
      
      const paymentDate = new Date(payment.date);
      const matchesStartDate = !startDate || paymentDate >= startDate;
      const matchesEndDate = !endDate || paymentDate <= endDate;
      
      return matchesAccount && matchesCreditor && matchesStartDate && matchesEndDate;
    });
  }, [payments, selectedAccount, selectedCreditor, startDate, endDate]);

  const handleClearFilters = () => {
    setSelectedAccount("all");
    setSelectedCreditor("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleDeletePayment = (id: string) => {
    const updatedPayments = payments.filter((p) => p.id !== id);
    setPayments(updatedPayments);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(updatedPayments));
  };

  const totalGross = filteredPayments.reduce((sum, p) => sum + p.grossAmount, 0);
  const totalTax = filteredPayments.reduce((sum, p) => sum + p.taxAmount, 0);
  const totalNet = filteredPayments.reduce((sum, p) => sum + p.netAmount, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatório de Pagamentos</h2>
          <p className="text-muted-foreground mt-2">
            Consulte e filtre todos os pagamentos registrados
          </p>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account-filter">Conta</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger id="account-filter">
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.number} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditor-filter">Credor</Label>
                <Select value={selectedCreditor} onValueChange={setSelectedCreditor}>
                  <SelectTrigger id="creditor-filter">
                    <SelectValue placeholder="Todos os credores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os credores</SelectItem>
                    {creditors.map((creditor) => (
                      <SelectItem key={creditor.id} value={creditor.id}>
                        {creditor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={handleClearFilters} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bruto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalGross.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Impostos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">R$ {totalTax.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">R$ {totalNet.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <PaymentTable
          payments={filteredPayments}
          accounts={accounts}
          creditors={creditors}
          onDelete={handleDeletePayment}
        />
      </div>
    </AppLayout>
  );
};

export default PaymentReports;
