import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Payment } from "@/types/payment";
import type { Account } from "@/types/account";
import type { Creditor } from "@/types/creditor";

interface PaymentTableProps {
  payments: Payment[];
  accounts: Account[];
  creditors: Creditor[];
  onDelete: (id: string) => void;
}

export function PaymentTable({ payments, accounts, creditors, onDelete }: PaymentTableProps) {
  const getAccountInfo = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.number} - ${account.name}` : "Conta não encontrada";
  };

  const getCreditorInfo = (creditorId: string) => {
    const creditor = creditors.find((c) => c.id === creditorId);
    return creditor ? creditor.name : "Credor não encontrado";
  };

  if (payments.length === 0) {
    return (
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Pagamentos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Nenhum pagamento registrado ainda.</p>
            <p className="text-sm mt-2">Use o formulário acima para adicionar um pagamento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Pagamentos Registrados ({payments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Credor</TableHead>
                  <TableHead className="text-right">Valor Bruto</TableHead>
                  <TableHead className="text-right">Imposto (%)</TableHead>
                  <TableHead className="text-right">Valor Imposto</TableHead>
                  <TableHead className="text-right">Valor Líquido</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {new Date(payment.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{getAccountInfo(payment.accountId)}</TableCell>
                    <TableCell>{getCreditorInfo(payment.creditorId)}</TableCell>
                    <TableCell className="text-right">R$ {(payment.grossAmount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(payment.taxRate || 0).toFixed(2)}%</TableCell>
                    <TableCell className="text-right text-destructive">
                      R$ {(payment.taxAmount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      R$ {(payment.netAmount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(payment.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
