# 📱 Studio Bella Cílios - App de Agendamentos

Aplicativo móvel com React, Supabase e Capacitor para gerenciar agendamentos de serviços de cílios.

## ✨ Funcionalidades Implementadas

### ✅ Usuários
- 🔐 Autenticação segura com email/senha
- 📋 Criar, editar e excluir agendamentos
- 🔄 Sincronização em tempo real com banco de dados
- 📡 Detecção de status de conexão (online/offline)
- 🎯 Validações completas nos formulários

### ✅ Validações de Dados
- ✓ Nome (mínimo 2 caracteres)
- ✓ Telefone (10 ou 11 dígitos com DDD)
- ✓ Data (a partir de hoje)
- ✓ Horário (lista pré-definida)
- ✓ Disponibilidade de horários (máx 3 agendamentos por horário)

### ✅ Admin (detalhes abaixo)
- 👤 Painel administrativo para usuários @bellacilios.com
- ✅ Confirmar/Desconfirmar agendamentos
- 📊 Visualizar agendamentos pendentes e confirmados
- ⏳ Gerenciamento de fila de agendamentos

## 🚀 Configuração Inicial

### 1. Environment Variables

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Adicione suas credenciais do Supabase em `.env.local`:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_aqui
```

### 2. Banco de Dados

Execute o script `supabase/schema.sql` no Supabase SQL Editor:

SQL Editor > New Query > Cole o conteúdo e Execute

**Mudanças importantes no schema:**
- ✓ Adicionada coluna `confirmed` para controle de agendamentos
- ✓ Adicionado índice para melhor performance
- ✓ Mantém Row Level Security para privacidade dos dados

### 3. Instalar Dependências

```bash
npm install
```

### 4. Rodar Localmente

```bash
npm run dev
```

## 🏗️ Arquitetura

```
www/
├── app.jsx           # Componente React principal (CRUD completo)
├── supabase.js       # Configuração do Supabase
├── crud.css          # Estilos (novo sistema com notificações)
└── index.html        # HTML com Tailwind

supabase/
└── schema.sql        # Schema do banco (com coluna 'confirmed')

android/             # Build nativa Android (Capacitor)
```

## 📊 CRUD Completo

### CREATE (Criar)
```javascript
await supabase
  .from('appointments')
  .insert({ name, phone, service, date, time, user_id })
  .select()
```

### READ (Ler)
```javascript
await supabase
  .from('appointments')
  .select('*')
  .eq('user_id', userId)
  .order('date')
  .order('time')
```

### UPDATE (Atualizar)
```javascript
await supabase
  .from('appointments')
  .update({ name, phone, service, date, time })
  .eq('id', appointmentId)
  .eq('user_id', userId)
  .select()
```

### DELETE (Excluir)
```javascript
await supabase
  .from('appointments')
  .delete()
  .eq('id', appointmentId)
  .eq('user_id', userId)
  .select()
```

## 👤 Admin - Como Funciona

**Quem é Admin?**
- Qualquer usuário com email terminado em  `@bellacilios.com`
- Acesso automático ao painel administrativo

**O que pode fazer?**
1. Ver todos os agendamentos (não apenas os seus)
2. Filtrar entre pendentes e confirmados
3. Confirmar agendamentos
4. Visualizar informações de contato (nome, telefone, serviço)

**Como ativar Admin?**
1. Crie uma conta com seu email corporativo (@bellacilios.com)
2. Faça login
3. O painel admin aparecerá automaticamente

## 🔒 Segurança

- ✅ Row Level Security (RLS) ativado no Supabase
- ✅ Usuários só veem seus próprios agendamentos
- ✅ Admin vê todos, mas só pode atualizar `confirmed`
- ✅ Validações no frontend E no banco (CHECK constraints)
- ✅ Credenciais em `.env.local` (não versionado)

## 🌐 Sincronização em Tempo Real

O app usa Supabase Realtime para:
- ✅ Atualizar quando outro dispositivo faz mudanças
- ✅ Detectar alterações (INSERT, UPDATE, DELETE)
- ✅ Reconectar automaticamente se cair conexão
- ✅ Indicar status: "✓ Sincronizado", "⟳ Reconectando", "✗ Sem conexão"

## 📱 Respons ivo

- ✅ Mobile first (Tailwind CSS)
- ✅ Funciona em tablets
- ✅ Pronto para PWA
- ✅ Compatível com Capacitor (Android/iOS)

## 🛠️ Build para Android

```bash
npm run build
npm run android:sync
```

Depois abra Android Studio para compilar APK.

## 📝 Melhorias Futuras

- [ ] Push Notifications quando agendamento é confirmado
- [ ] Backup automático de dados
- [ ] Relatórios e análises
- [ ] Sincronização offline completa
- [ ] Integração com WhatsApp/SMS
- [ ] Cancelamento automático de slots antigos
-  [ ] Avaliação de clientes (stars)
- [ ] Horários com duração configurável

## 🐛 Troubleshooting

**"API não está respondendo"**
- Verifique as credenciais do Supabase em `.env.local`
- Confirme que o banco de dados está online
- Reinicie o app

**"Horários sempre mostram como lotados"**
- Verifique o valor de `MAX_APPOINTMENTS_PER_HOUR` em `app.jsx` (padrão: 3)
- Limpe dados de teste do banco

**"Admin não aparece"**
- Email precisa terminar com `@bellacilios.com`
- Faça logout e login novamente

## 📞 Suporte

Para dúvidas sobre o código, consulte:
- [Documentação Supabase](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Capacitor Guide](https://capacitorjs.com)

---

**Desenvolvido com ❤️ para Studio Bella Cílios**
