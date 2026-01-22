# 🏋️ Maria Fitness Hub

> **Receitas Fitness & Produtos Saudáveis** | Uma plataforma moderna para compartilhar receitas deliciosas e vender produtos fitness com integração WhatsApp

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![HeroUI](https://img.shields.io/badge/HeroUI-000000?style=for-the-badge&logo=heroui&logoColor=white)](https://heroui.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

---

## 📱 Visão Geral

**Maria Fitness Hub** é uma aplicação web moderna e responsiva construída para Maria compartilhar receitas fitness e vender produtos saudáveis. Com um design intuitivo otimizado para mobile, integração WhatsApp seamless e um painel administrativo poderoso.

### ✨ Destaques Principais

- 🍽️ **Catálogo de Receitas** - Browsável com filtro por categorias e busca em tempo real
- 🛍️ **Loja de Produtos** - Venda de produtos fitness diretamente via WhatsApp
- 👨‍💼 **Painel Admin** - Gerenciamento completo de receitas e produtos
- 📱 **PWA Completo** - Funciona offline e pode ser instalado na tela inicial
- 🎨 **Design Moderno** - Interface com Tailwind CSS + HeroUI Components
- ⚡ **Performance** - Carregamento rápido com Vite e React Query
- 🔐 **Seguro** - Autenticação e autorização com Supabase

---

## 🚀 Funcionalidades

### Para Usuários

| Feature | Descrição |
|---------|-----------|
| 🔍 **Busca de Receitas** | Encontre receitas por nome ou ingrediente |
| 🏷️ **Filtro por Categoria** | Organize por: Café da Manhã, Lanche, Doce Fit, Low Carb, Proteico |
| 📋 **Instruções Detalhadas** | Modo de preparo com passos numerados e formatação automática |
| 📸 **Galeria de Imagens** | Visualize as receitas com fotos de alta qualidade |
| 💬 **Chat WhatsApp** | Tire dúvidas sobre receitas direto pelo WhatsApp |
| 🛒 **Compra de Produtos** | Adquira produtos fitness com um clique |
| 📥 **Compartilhamento** | Copie receitas ou compartilhe via WhatsApp |
| 💾 **Modo Offline** | Acesse conteúdo já carregado sem internet |

### Para Administradores

| Feature | Descrição |
|---------|-----------|
| ➕ **Criar Receitas** | Adicione novas receitas com ingredientes e modo de preparo |
| ✏️ **Editar Receitas** | Atualize receitas existentes |
| 🗑️ **Deletar Receitas** | Remova receitas do catálogo |
| 📤 **Publicar/Despublicar** | Controle quais receitas são visíveis |
| 🎨 **Gerenciar Produtos** | CRUD completo de produtos |
| 💰 **Controle de Preços** | Defina e atualize preços |
| 📊 **Dashboard** | Visualize stats e analíticas |
| ⚙️ **Configurações** | Gerencie número WhatsApp e configs |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: HeroUI + shadcn/ui
- **Icons**: Lucide React
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **HTTP Client**: Axios via Supabase SDK

### Backend & Database
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime
- **Storage**: Supabase Storage

### Development
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint
- **Package Manager**: Bun / npm / yarn
- **Version Control**: Git + GitHub

### Deployment
- **Hosting**: Vercel / Netlify
- **Database**: Supabase Cloud
- **PWA**: Service Workers

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ ou Bun
- npm/yarn/bun
- Conta Supabase (gratuita)
- Git

### Clone & Setup

```bash
# 1️⃣ Clone o repositório
git clone https://github.com/seu-usuario/maria-fitness-hub.git
cd maria-fitness-hub

# 2️⃣ Instale as dependências
npm install
# ou com Bun:
bun install

# 3️⃣ Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Supabase

# 4️⃣ Inicie o servidor de desenvolvimento
npm run dev
# Acesse http://localhost:8080
```

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

---

## 📁 Estrutura do Projeto

```
maria-fitness-hub/
├── public/                    # Assets estáticos
│   ├── day.png               # Logo da aplicação
│   ├── manifest.json         # PWA Manifest
│   └── robots.txt
│
├── src/
│   ├── components/           # Componentes React
│   │   ├── Header.tsx        # Cabeçalho da app
│   │   ├── BottomNav.tsx     # Navegação inferior
│   │   ├── RecipeCard.tsx    # Card de receita
│   │   ├── ProductCard.tsx   # Card de produto
│   │   ├── RecipeModal.tsx   # Modal de detalhes da receita
│   │   ├── RecipeFormDialog.tsx
│   │   ├── ProductFormDialog.tsx
│   │   └── ui/               # Componentes base (shadcn)
│   │
│   ├── pages/                # Páginas da aplicação
│   │   ├── Receitas.tsx      # Página de receitas
│   │   ├── Produtos.tsx      # Página de produtos
│   │   ├── Admin.tsx         # Painel administrativo
│   │   └── NotFound.tsx      # 404
│   │
│   ├── hooks/                # Custom React Hooks
│   │   ├── useRecipes.ts     # Hook para receitas
│   │   ├── useProducts.ts    # Hook para produtos
│   │   ├── useSettings.ts    # Hook para configurações
│   │   └── use-toast.ts      # Hook para notificações
│   │
│   ├── integrations/         # Integrações externas
│   │   └── supabase/         # Cliente Supabase
│   │
│   ├── lib/                  # Funções utilitárias
│   │   └── utils.ts
│   │
│   ├── test/                 # Testes
│   │   ├── setup.ts
│   │   └── example.test.ts
│   │
│   ├── App.tsx               # Componente raiz
│   ├── App.css
│   ├── index.css             # Estilos globais
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts
│
├── supabase/
│   ├── config.toml           # Configuração local
│   └── migrations/           # Migrações SQL
│
├── index.html                # HTML template
├── package.json              # Dependências
├── tsconfig.json             # Config TypeScript
├── vite.config.ts            # Config Vite
├── vitest.config.ts          # Config Vitest
├── tailwind.config.ts        # Config Tailwind
└── README.md                 # Este arquivo
```

---

## 🚀 Começando a Usar

### Página de Receitas

1. Acesse a página inicial (/)
2. Veja todas as receitas publicadas
3. Use a barra de busca para encontrar receitas
4. Filtre por categoria
5. Clique em uma receita para ver detalhes completos
6. Copie a receita ou compartilhe via WhatsApp

### Página de Produtos

1. Acesse a página de produtos (/produtos)
2. Navegue pelos produtos disponíveis
3. Clique em "Comprar" para contactar via WhatsApp
4. Converse com Maria para confirmar pedido

### Painel Admin

1. Acesse a página admin (/admin)
2. Crie, edite ou delete receitas
3. Gerencie produtos e preços
4. Publique/despublique conteúdo

---

## 📚 API & Database Schema

### Tabelas Supabase

#### `receitas` (Receitas)
```sql
CREATE TABLE receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  ingredientes TEXT NOT NULL,
  modo_preparo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tempo TEXT NOT NULL,
  foto_url TEXT,
  publicada BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### `produtos` (Produtos)
```sql
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  foto_url TEXT,
  disponivel BOOLEAN DEFAULT true,
  mensagem_whatsapp TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### `configuracoes` (Configurações)
```sql
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 🎨 Design & Customização

### Cores (Tema Pink & Green)

```css
--primary: #da36a0 (Pink)
--secondary: #7ba856 (Green)
--success: #10b981 (Teal)
--warning: #f59e0b (Amber)
--destructive: #ef4444 (Red)
```

### Fontes

- **Heading**: Poppins (700)
- **Body**: Inter (400, 500, 600)

### Componentes

Todos os componentes utilizam HeroUI e tailwindcss para total flexibilidade.

---

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com coverage
npm run test:coverage

# Modo watch
npm run test:watch
```

---

## 📦 Build & Deploy

### Build para produção

```bash
npm run build
```

Isso gera uma pasta `dist/` pronta para deploy.

### Deploy no Vercel

```bash
npm install -g vercel
vercel
```

### Deploy no Netlify

```bash
npm run build
# Arraste a pasta dist/ para o Netlify
```

---

## 🔐 Segurança

- ✅ Row Level Security (RLS) no Supabase
- ✅ Validação de entrada no frontend
- ✅ TypeScript para type safety
- ✅ HTTPS/TLS em produção
- ✅ Sanitização de dados

---

## 📱 PWA & Mobile

A aplicação é um Progressive Web App completo:

- ✅ Service Workers para offline
- ✅ Manifest.json para instalação
- ✅ Responsive design (mobile-first)
- ✅ Otimizado para iOS & Android
- ✅ Ícones em várias resoluções

### Instalar no Celular

**iOS:**
1. Abra em Safari
2. Toque em Compartilhar
3. Selecione "Adicionar à Tela de Início"

**Android:**
1. Abra em Chrome
2. Toque no menu (⋮)
3. Selecione "Instalar app"

---

## 🚢 CI/CD Pipeline

O projeto está configurado para:

- ✅ Testes automáticos em cada push
- ✅ Linting obrigatório
- ✅ Deploy automático na main
- ✅ Preview automático em PRs

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript em todos os novos arquivos
- Siga o eslint.config.js
- Componentes funcionais com hooks
- Props com TypeScript interfaces
- Nomes em camelCase para variáveis/funções
- Nomes em PascalCase para componentes

---

## 📋 Roadmap

- [ ] Autenticação de usuários
- [ ] Favoritar receitas
- [ ] Histórico de compras
- [ ] Avaliações e comentários
- [ ] Plano de nutrição personalizado
- [ ] Integração com calculadora macros
- [ ] Push notifications
- [ ] Modo escuro
- [ ] Múltiplos idiomas
- [ ] App nativo (React Native)

---

## 🐛 Troubleshooting

### Erro de conexão com Supabase

```
Verifique:
- URL e chave estão corretas em .env.local
- Projeto Supabase está ativo
- RLS policies estão configuradas
```

### Imagens não carregam

```
Verifique:
- URLs das imagens estão acessíveis
- Supabase Storage está configurado
- CORS está permitido
```

### App não funciona offline

```
Verifique:
- Service Workers estão habilitados
- PWA Manifest está válido
- Browser suporta PWA
```

---

## 📞 Suporte & Contato

- 📧 Email: maria@fitness.com
- 📱 WhatsApp: [Link WhatsApp](https://wa.me/5511999999999)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/maria-fitness-hub/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/seu-usuario/maria-fitness-hub/discussions)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- [HeroUI](https://heroui.com) - Componentes incríveis
- [Supabase](https://supabase.com) - Backend poderoso
- [Tailwind CSS](https://tailwindcss.com) - Estilo utilitário
- [React Query](https://tanstack.com/query) - Data fetching
- Comunidade Open Source ❤️

---

## 📊 Estatísticas do Projeto

![Lines of code](https://img.shields.io/badge/lines%20of%20code-5.2k-blue)
![Contributors](https://img.shields.io/badge/contributors-1-green)
![Last commit](https://img.shields.io/badge/last%20commit-today-brightgreen)

---

<div align="center">

### ⭐ Se gostou do projeto, deixe uma estrela! ⭐

**[⬆ Voltar ao topo](#-maria-fitness-hub)**

Made with ❤️ by [Your Name]

</div>