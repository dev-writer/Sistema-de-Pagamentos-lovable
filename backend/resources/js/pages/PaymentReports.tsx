import { useState, useEffect, useMemo } from "react";
import { PaymentTable } from "@/components/PaymentTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Payment } from "@/types/payment";
import type { Account } from "@/types/account";
import type { Creditor } from "@/types/creditor";
import AppLayout from '@/layouts/app-layout';
import { toast } from "@/hooks/use-toast";

const PaymentReports = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);

  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedCreditor, setSelectedCreditor] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, accountsRes, creditorsRes] = await Promise.all([
          fetch('/payments'),
          fetch('/accounts'),
          fetch('/creditors')
        ]);

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          const mappedPayments: Payment[] = paymentsData.map((p: any) => ({
            id: String(p.id),
            date: p.payment_date,
            accountId: String(p.account_id),
            creditorId: String(p.creditor_id),
            grossAmount: Number(p.gross_amount ?? 0),
            taxRate: Number(p.tax_rate ?? 0),
            taxAmount: Number(p.tax_amount ?? 0),
            netAmount: Number(p.net_amount ?? p.amount ?? 0),
            created_at: p.created_at,
            updated_at: p.updated_at,
            createdAt: p.created_at,
          }));
          setPayments(mappedPayments);
        }

        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
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
        }

        if (creditorsRes.ok) {
          const creditorsData = await creditorsRes.json();
          setCreditors(creditorsData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleDeletePayment = async (id: string) => {
    try {
      const response = await fetch(`/payments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
        toast({
          title: "Pagamento excluído",
          description: "O pagamento foi removido com sucesso.",
          variant: "destructive",
        });
      } else {
        throw new Error('Failed to delete payment');
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir pagamento.",
        variant: "destructive",
      });
    }
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
                      {startDate ? startDate.toLocaleDateString() : "Selecionar data"}
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
                      {endDate ? endDate.toLocaleDateString() : "Selecionar data"}
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
