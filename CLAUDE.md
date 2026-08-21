# English Journey

App de estudo de inglês (SPA React/Vite) para uma única aluna, com progresso sincronizado na nuvem.

## Stack

- **React 18 + Vite**, sem TypeScript, sem roteador (navegação via `useState` em `App.jsx`, um `switch` por página).
- **Tailwind CSS** para estilo; tipografia serifada (Recoleta/Canela) nos títulos via `font-heading`, corpo em `font-body`.
- **Firebase Auth** (Google ou e-mail/senha, restrito a uma allowlist de 3 pessoas) **+ Firestore** para persistência multiusuário-por-nível — ver "Nuvem e sincronização" abaixo.
- **Tiptap** para os campos de texto rico (anotações, diário, erros).
- Deploy: GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`), branch `main`.

## Estrutura multi-nível (CEFR: A1, A2, B1, B2, C1, C2)

O app é **um só código, vários níveis de conteúdo**. Hoje só existe conteúdo do A1; adicionar A2 é só inserir dados novos, sem mexer em lógica.

- `src/utils/levels.js` — `LEVELS`, `DEFAULT_LEVEL`, `LevelProvider`/`useLevel()` (contexto React com `currentLevel`, `unlockedLevels`, `setCurrentLevel`, `checkUnlocks`).
- `src/data/roadmapData.js` — `ROADMAP_BY_LEVEL = { A1: {...} }`. Para adicionar um nível: acrescentar `A2: {...}` no mesmo formato.
- `src/data/exerciseBank.js` — `EXERCISE_BANK_BY_LEVEL = { A1: {...} }`; `level` é carimbado automaticamente em cada exercício a partir da chave do bloco.
- **Escopo por entidade**:
  - *Hard-scoped* (troca 100% ao mudar de nível): roadmap, exercícios/tópicos (conteúdo estático do bundle), flashcards, glossário, XP, badges, % do roadmap.
  - *Tem campo `level` mas fica sempre visível* (nunca some ao trocar de nível, só exibe um selo do nível de origem): anotações (`notes`), erros salvos (`errorLog`), entradas do diário (`diario`).
  - *Cross-level* (sem campo `level`): streak de dias estudando (estudar em qualquer nível conta), metas semanais, sessões de prep VIP, próxima aula.
- IDs de tópico/exercício (`g01`, `v04`...) **não são globalmente únicos** — sempre resolva por `(id, level)` (`getExercisesByTopic(id, level)`, `findRoadmapTopic(id, level)` etc.), nunca só pelo id.

### Desbloqueio automático de nível

Um nível só fica disponível quando o **nível anterior atinge 100% em TODAS as categorias** do roadmap (gramática, vocabulário, leitura, fala — não só a média geral). Lógica em `getRoadmapCompletion(level)` / `isLevelUnlockedNow(level)` (`src/utils/levels.js`). Níveis bloqueados continuam visíveis no seletor, com cadeado e tooltip "faltam X% para liberar". `checkUnlocks()` é chamado depois de qualquer ação que possa completar um roadmap (marcar tópico como Concluído, terminar uma sessão de exercícios) e dispara um toast de celebração (não bloqueante) quando algo novo é desbloqueado.

## Nuvem e sincronização

**Local-first**: toda leitura/escrita continua síncrona no `localStorage` (zero latência, funciona offline); por cima disso, uma camada de sync empurra para o Firestore em segundo plano. Não usa listeners em tempo real (`onSnapshot`) — o modelo é *pull on login + push debounced on write*, pensado para uso em um dispositivo por vez.

- `src/firebase.js` — inicializa o Firebase a partir de variáveis de ambiente (nunca hardcoded). Se não configurado, `isFirebaseConfigured = false` e o app roda 100% local (sem tela de login).
- `src/utils/auth.js` — `signInWithGoogle()`, `signInWithEmail()`/`signUpWithEmail()`, `resetPassword()`, `signOutUser()`, `onAuthChange()`. Login oferece Google e e-mail/senha; ambos passam pela mesma checagem de allowlist antes de considerar a pessoa logada.
- `src/utils/cloudStore.js` — primitivas Firestore (get/set/delete por documento/coleção).
- `src/utils/syncEngine.js` — orquestração: push debounced por item, fila de retry offline (`ej_sync_queue`, refeita quando a conexão volta), pull completo no login, e migração única (`migrateLocalToCloudIfNeeded`) que sobe os dados locais existentes pra nuvem no primeiro login, marcando `level: 'A1'` em tudo que não tiver o campo.
- `src/utils/storage.js` — `createStore(key, syncName)`: o segundo argumento é o nome da coleção no Firestore. Entidades geradas pelo usuário (flashcards, notas, erros, tentativas, diário, glossário) passam `syncName`; conteúdo estático re-semeado localmente em todo dispositivo (tópicos, exercícios) **não** passa — nunca precisa tocar a nuvem.
- Estrutura no Firestore: `users/{uid}` (perfil: `current_level`, `levels_unlocked`, `migratedAt`), `users/{uid}/{coleção}/{id}` (flashcards, diario, glossario, notes, errorLog, attempts), `users/{uid}/settings/{chave}` (nextClass, vipCurrent, vipSessions, metas), `users/{uid}/roadmapProgress/{level}`.
- Regras de segurança: `firestore.rules` na raiz — cada usuária só lê/escreve o próprio `users/{uid}/**`, **e só se o e-mail autenticado estiver na allowlist** (ver seção "Acesso restrito" abaixo). Colar no console do Firebase em **Firestore Database → Regras**.
- Os botões "exportar progresso", "backup" (localStorage → arquivo `.json` local) e "restaurar" continuam funcionando exatamente como antes — são uma segunda camada de segurança opcional, não a única forma de não perder dados.

### Acesso restrito (allowlist de e-mails)

O app é de uso restrito: só quem está numa lista de e-mails autorizados consegue criar conta ou logar (Google **ou** e-mail/senha — os dois métodos passam pela mesma checagem).

- **Onde a lista mora**: coleção `allowed_users` no Firestore. Cada pessoa autorizada é um documento cujo **ID é o e-mail dela em minúsculas** (ex.: `paolasantos.assis@gmail.com`) — o conteúdo do documento não importa, só a existência dele.
- **Como adicionar alguém**: Firebase Console → **Firestore Database → Dados** → coleção `allowed_users` → **Adicionar documento** → cole o e-mail (em minúsculas) como ID do documento → salve com qualquer campo (ex. `addedAt: "2026-08-20"`) → **Salvar**. Pronto, a pessoa já consegue se cadastrar/logar.
- **Como remover alguém**: mesma tela, abra o documento com o e-mail da pessoa e **Excluir documento**. Se ela já tiver conta e sessão aberta em algum aparelho, é deslogada automaticamente no próximo carregamento do app (a checagem roda a cada mudança de estado de autenticação, não só no login).
- **Por que fica no Firestore e não no código**: código do front-end pode ser inspecionado no navegador — qualquer lista ali seria só decoração. A allowlist real vive nas `firestore.rules` (nega leitura/escrita em `users/{uid}` para qualquer e-mail que não tenha um doc em `allowed_users`) — mesmo que alguém contorne a tela de login, o banco de dados recusa.
- **Quem pode editar a lista**: ninguém pelo app — `allowed_users` tem `allow write: if false` nas regras, só é editável manualmente pelo console (ou por quem tiver acesso de administrador ao projeto Firebase).
- Cadastro/login de um e-mail fora da lista: mostra a mensagem "este app é de uso restrito — acesso não autorizado para este email" e, se a conta acabou de ser criada automaticamente pelo fluxo (Google no primeiro login, ou o próprio cadastro por e-mail/senha), ela é apagada do Firebase Auth na hora — não fica lixo de conta órfã.

### Configurar um ambiente novo do zero

1. Copiar `.env.example` para `.env` e preencher com as chaves do projeto Firebase (console.firebase.google.com → Configurações do projeto → Geral → Seus apps → SDK).
2. No console do Firebase: ativar **Authentication → Sign-in method → Google** e **Email/senha**, adicionar o domínio de deploy em **Authentication → Settings → Authorized domains**, criar o **Firestore Database**, colar o conteúdo de `firestore.rules` em **Firestore Database → Regras**, e criar os documentos iniciais em `allowed_users` (ver "Acesso restrito" acima).
3. Para o deploy no GitHub Actions funcionar, cadastrar as mesmas 6 variáveis como *secrets* do repositório (`Settings → Secrets and variables → Actions`), com os mesmos nomes `VITE_FIREBASE_*` usados no `.env`.
4. **Nunca** commitar `.env` (já está no `.gitignore`) nem colar chaves direto no código — sempre via `import.meta.env.VITE_FIREBASE_*`.

## Comandos

Em ambientes onde `npm`/`npx` global estiverem quebrados, use os caminhos diretos abaixo como alternativa.

```
npm run dev        # servidor de desenvolvimento (vite)
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção localmente
```

## Convenções de código

- Sem TypeScript; componentes em `.jsx`, utilitários puros em `.js`.
- Estado local por componente com `useState`; entidades de lista (flashcards, notas, erros, tentativas, diário, glossário, exercícios) passam por `createStore()` (`src/utils/storage.js`), nunca `localStorage` direto no componente.
- Padrão de listagem: `useState(0)` como "tick" + `useMemo(() => getX(), [tick, ...])` + uma função `refresh()` que incrementa o tick depois de qualquer mutação — evita re-fetch implícito e mantém a UI sempre sincronizada com o que está no storage.
- **Cuidado com React StrictMode ao persistir dentro de um updater de `setState`**: já houve bug real de duplicação porque uma função passada a `setState(prev => ...)` chamava `addX()` (side effect) — o StrictMode invoca esses updaters duas vezes de propósito. Quando precisar decidir "criar vs. atualizar" dentro de um fluxo de autosave, guarde o id atual num `useRef` e faça o side effect FORA do updater.
- Visual: `.card`/`.card-flat`/`.pill`/`.btn-primary`/`.btn-secondary`/`.progress-track`+`.progress-fill` (classes utilitárias já definidas em `index.css`); paleta por página em `PAGE_COLORS` (`src/utils/colors.js`); títulos de página sempre em minúsculo (`lowercase`).
- Ícones: `lucide-react`.
- Editor de texto rico: componente `RichTextEditor` (Tiptap) — reutilizar em vez de criar outro.
