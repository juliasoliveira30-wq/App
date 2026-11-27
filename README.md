# Studio Bella Cílios

Site com formulário React responsivo e aplicativo Android via Capacitor. O SDK do Supabase oferece autenticação, CRUD e sincronização em tempo real com PostgreSQL na nuvem.

## Fotos da câmera no Supabase Storage

O **Database** guarda dados estruturados em tabelas, como nome, serviço e data de um agendamento. O **Storage** guarda os arquivos da foto, organizados por bucket e caminho. O cartão da câmera envia os bytes da imagem ao Storage. Se uma foto precisar ser vinculada a um agendamento, uma coluna do Database pode guardar o caminho do arquivo.

### Configurar o bucket

1. No painel do seu projeto Supabase, abra **Storage** e selecione **New bucket**. Use o nome `fotos-camera` e ative **Public bucket**. Configure o limite de 6 MB e, se ativar a restrição de tipos MIME, permita `image/jpeg`, `image/png`, `image/gif`, `image/webp` e `image/avif`.
2. No **SQL Editor**, execute o SQL abaixo. O cartão da câmera funciona sem login. A política de `INSERT` permite o envio com a chave publicável apenas nesse bucket. A política de `SELECT` permite consultar um arquivo conhecido pela API sem abrir a listagem de fotos. A URL pública já pode ser aberta por qualquer pessoa com o endereço, mesmo sem essa política de `SELECT`. Use imagens de teste no bucket público. [Políticas do Storage](https://supabase.com/docs/guides/storage/security/access-control)
3. Confira `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env.local`. Se estiver usando uma chave `anon` legada, use `VITE_SUPABASE_ANON_KEY`. Execute `npm ci` e `npm run dev`.

```sql
drop policy if exists "fotos-camera upload anon" on storage.objects;
create policy "fotos-camera upload anon"
on storage.objects for insert to anon
with check (bucket_id = 'fotos-camera');

drop policy if exists "fotos-camera ler arquivo" on storage.objects;
create policy "fotos-camera ler arquivo"
on storage.objects for select to anon
using (
  bucket_id = 'fotos-camera'
  and storage.allow_any_operation(array['object.get_authenticated_info', 'object.get_authenticated'])
);
```

### Validar o fluxo

1. No navegador, abra o endereço local exibido pelo Vite. Use **Tirar foto** com uma webcam, ou **Escolher da galeria** para selecionar uma imagem de teste. No Android, execute `npm run android:sync` antes de abrir o projeto no Android Studio.
2. O Capacitor entrega a URI em `webPath`. O React exibe a prévia local e converte a URI em um `Blob` com `fetch(webPath)` e `response.blob()`. Depois, cria um `File` com o tipo MIME da imagem, chama `upload()` com um nome único e usa `getPublicUrl()` para exibir a imagem salva. [Câmera do Capacitor](https://capacitorjs.com/docs/apis/camera) · [Upload](https://supabase.com/docs/reference/javascript/file-buckets-upload) · [URL pública](https://supabase.com/docs/reference/javascript/file-buckets-getpublicurl)
3. Quando aparecer **Imagem enviada ao Supabase**, confira o novo arquivo em **Storage → fotos-camera**. Abra o endereço da imagem renderizada em uma janela anônima para verificar o acesso público. Em caso de falha no envio, o cartão preserva a prévia local e informa o erro.

Um bucket privado exige regras de leitura e pode servir fotos com `createSignedUrl()`, que gera um link temporário. Esta atividade usa um bucket público para exibir a URL retornada por `getPublicUrl()`. [Modelos de acesso dos buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)

## Executar

1. Instale Node.js 22.12 ou superior e execute `npm ci`.
2. Copie `.env.example` para `.env.local` na raiz. Preencha a URL e a chave publicável do Supabase (a chave `anon` legada também funciona). Nunca use `service_role` ou chave secreta no frontend.
3. No SQL Editor do Supabase, execute `supabase/schema.sql` uma vez. Ele cria a tabela, políticas RLS por usuário e publicação Realtime.
4. Habilite autenticação por e-mail e senha. Em Authentication > URL Configuration, configure Site URL e redirecionamentos para o endereço do site. Confirme o e-mail antes de entrar, se a confirmação estiver habilitada. No Android, confirme pelo site e depois entre no aplicativo.
5. Execute `npm run dev`. Sem as variáveis, a interface informa que o agendamento online ainda não está configurado.

## Ciclo CRUD

- Create: o formulário controlado valida nome, telefone com DDD e data; `insert(...).select()` retorna o registro salvo.
- Read: `select()` carrega os agendamentos do usuário ordenados por data e hora.
- Update: Editar preenche o formulário; `update(...).eq('id', id).select()` persiste a alteração.
- Delete: a confirmação na interface chama `delete().eq('id', id).select()`.

A interface informa sucesso após a resposta do banco. Em falhas, preserva o formulário para nova tentativa. Botões ficam bloqueados durante o envio. A assinatura `postgres_changes` recarrega os dados em inserções, atualizações e exclusões, aplicando novamente RLS. Ao reconectar ou recuperar a internet, carrega novamente a lista; há também atualização manual. Listeners e assinatura são removidos ao sair.

Cada conta só lê e modifica os próprios registros. A sessão é gerenciada pelo Supabase Auth. O banco remoto guarda os dados e o estado React mantém a tela. Não há fila de gravação offline.

Os registros são solicitações: não há verificação de disponibilidade ou bloqueio de horários concorrentes. O projeto não inclui painel administrativo ou confirmação pelo studio.

## Validação com Supabase

1. Crie duas contas. Na conta A, crie, edite e exclua um agendamento e confira a tabela.
2. Abra a conta A em dois navegadores: as alterações devem aparecer no outro sem recarregar a página.
3. Entre com a conta B: os dados de A não devem aparecer nem permitir edição pelas APIs.
4. Desconecte a internet, tente salvar e confira que não há sucesso e o formulário permanece preenchido. Reconecte e tente novamente.

## Web e Android

`npm run build` gera `dist/`; `npm run preview` permite conferir a compilação. Use o servidor, em vez de abrir o HTML diretamente. O Vite utiliza caminhos relativos para GitHub Pages e Capacitor.

No GitHub, configure as variables de Actions `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Elas são públicas e incorporadas na compilação. Em Settings > Pages, selecione GitHub Actions. O workflow compila e publica `dist/` em pushes para main/master ou execução manual.

Endereço padrão: https://juliasoliveira30-wq.github.io/App/

Execute `npm run android:sync` antes de compilar no Android Studio. O Capacitor utiliza `dist/`. O workflow de APK também compila React antes da sincronização. A interface móvel usa o mesmo frontend, com autenticação e dados na nuvem.

Referências: [SDK](https://supabase.com/docs/reference/javascript/insert), [Realtime](https://supabase.com/docs/guides/realtime/postgres-changes), [Vite](https://vite.dev/guide/build).
