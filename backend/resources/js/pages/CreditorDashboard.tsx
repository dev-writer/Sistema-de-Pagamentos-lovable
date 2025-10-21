import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import type { Creditor } from "@/types/creditor";
import type { Payment } from "@/types/payment";
import type { Account } from "@/types/account";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Layout, Receipt, Wallet } from "lucide-react";
import AppLayout from '@/layouts/app-layout';




const CREDITORS_KEY = "creditors";
const PAYMENTS_KEY = "payments";
const ACCOUNTS_KEY = "accounts";

const CreditorDashboard = () => {
  const navigate = useNavigate();
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const creditor = creditors.length > 0 ? creditors[0] : null;

  useEffect(() => {
    const storedCreditors = localStorage.getItem(CREDITORS_KEY);
    const storedPayments = localStorage.getItem(PAYMENTS_KEY);
    const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);

    if (storedCreditors) setCreditors(JSON.parse(storedCreditors));
    if (storedPayments) setPayments(JSON.parse(storedPayments));
    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
  }, []);

  useEffect(() => {
    if (creditors.length > 0 && !creditor) {
      toast({
        title: "Credor não encontrado",
        description: "Redirecionando para a listagem de credores.",
        variant: "destructive",
      });
      navigate("/creditors");
    }
  }, [creditors, creditor, navigate]);

  const creditorPayments = payments.filter((p) => p.creditorId === creditor?.id);
  
  const totalReceived = creditorPayments.reduce((sum, p) => sum + p.netAmount, 0);
  const totalGross = creditorPayments.reduce((sum, p) => sum + p.grossAmount, 0);
  const totalTax = creditorPayments.reduce((sum, p) => sum + p.taxAmount, 0);

  const getAccountInfo = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.number} - ${account.name}` : "Conta desconhecida";
  };

  if (!creditor) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/creditors")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard - {creditor.name}</h2>
            <p className="text-muted-foreground mt-2">
              CPF/CNPJ: {creditor.document}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido (Líquido)</CardTitle>
              <Wallet className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">R$ {totalReceived.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {creditorPayments.length} {creditorPayments.length === 1 ? 'pagamento' : 'pagamentos'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bruto</CardTitle>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {totalGross.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Impostos</CardTitle>
              <Receipt className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">R$ {totalTax.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Payments History */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Histórico de Pagamentos Recebidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {creditorPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum pagamento recebido ainda.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Conta Origem</TableHead>
                      <TableHead className="text-right">Valor Bruto</TableHead>
                      <TableHead className="text-right">Imposto</TableHead>
                      <TableHead className="text-right">Valor Líquido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditorPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{getAccountInfo(payment.accountId.toString())}</TableCell>
                        <TableCell className="text-right">
                          R$ {payment.grossAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          -{payment.taxRate}% (R$ {payment.taxAmount.toFixed(2)})
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          +R$ {payment.netAmount.toFixed(2)}
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

export default CreditorDashboard;
