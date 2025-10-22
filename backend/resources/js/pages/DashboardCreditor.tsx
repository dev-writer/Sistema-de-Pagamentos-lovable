import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { Creditor } from "@/types/creditor";
import type { Payment } from "@/types/payment";
import type { Account } from "@/types/account";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Receipt, Wallet } from "lucide-react";
import AppLayout from '@/layouts/app-layout';

const CREDITORS_KEY = "creditors";
const PAYMENTS_KEY = "payments";
const ACCOUNTS_KEY = "accounts";

const CreditorDashboard = () => {
  const { props } = usePage();
  const serverCreditor = (props as any).creditor as Creditor | undefined;

  const goBack = () => window.location.href = "/credores";

  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const creditorId = serverCreditor?.id ?? (() => {
    const m = window.location.pathname.match(/\/dashboard\/creditor\/([^\/]+)/);
    return m ? m[1] : undefined;
  })();

  useEffect(() => {
    const storedCreditors = localStorage.getItem(CREDITORS_KEY);
    const storedPayments = localStorage.getItem(PAYMENTS_KEY);
    const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);

    if (storedCreditors) setCreditors(JSON.parse(storedCreditors));
    if (storedPayments) setPayments(JSON.parse(storedPayments));
    if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
  }, []);

 
  const creditor = serverCreditor ?? creditors.find((c) => c.id === creditorId);

  useEffect(() => {
    if ((creditors.length > 0 || serverCreditor === undefined) && !creditor) {
      toast({
        title: "Credor não encontrado",
        description: "Redirecionando para a listagem de credores.",
        variant: "destructive",
      });
      goBack();
    }

  }, [creditors, serverCreditor]);

  if (!creditor) return null;

  const creditorPayments = payments.filter((p) => p.creditorId === creditor.id);
  const totalReceived = creditorPayments.reduce((sum, p) => sum + (p.netAmount ?? 0), 0);
  const totalGross = creditorPayments.reduce((sum, p) => sum + (p.grossAmount ?? 0), 0);
  const totalTax = creditorPayments.reduce((sum, p) => sum + (p.taxAmount ?? 0), 0);

  const getAccountInfo = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.number} - ${account.name}` : "Conta desconhecida";
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard - {creditor.name}</h2>
            <p className="text-muted-foreground mt-2">CPF/CNPJ: {creditor.cpf_cnpj}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Recebido (Líquido)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">R$ {totalReceived.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {creditorPayments.length} {creditorPayments.length === 1 ? 'pagamento' : 'pagamentos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Bruto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {totalGross.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total de Impostos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">R$ {totalTax.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos Recebidos</CardTitle>
          </CardHeader>
          <CardContent>
            {creditorPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum pagamento recebido ainda.</p>
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
                        <TableCell>{new Date(payment.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{getAccountInfo(payment.accountId)}</TableCell>
                        <TableCell className="text-right">R$ {(payment.grossAmount ?? 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right text-destructive">-{(payment.taxRate ?? 0)}% (R$ {(payment.taxAmount ?? 0).toFixed(2)})</TableCell>
                        <TableCell className="text-right font-medium text-green-600">+R$ {(payment.netAmount ?? 0).toFixed(2)}</TableCell>
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
