# TODO: Corrigir Depósitos - Salvar no Banco de Dados

## Problema
Os depósitos de contas não são salvos no saldo no banco de dados. Só aparecem no histórico de depósitos no localStorage.

## Solução
Criar endpoint no backend para depositar dinheiro e atualizar o saldo no banco, e modificar o frontend para usar esse endpoint.

## Tarefas
- [x] Criar método `deposit` no AccountController
- [x] Adicionar rota para o endpoint de depósito
- [x] Modificar o frontend (DashboardAccount.tsx) para chamar o endpoint em vez de apenas atualizar localStorage
- [ ] Testar a funcionalidade
