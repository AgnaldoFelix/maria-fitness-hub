-- ============================================================================
-- CADASTRAR PRODUTOS DE FITNESS
-- ============================================================================

INSERT INTO public.produtos (nome, descricao, preco, foto_url, disponivel, mensagem_whatsapp)
VALUES
  (
    'Whey Protein Chocolate',
    'Whey protein isolado de alta qualidade, 1kg. Ideal para pós-treino e recuperação muscular.',
    89.90,
    'https://images.unsplash.com/photo-1518611505868-48510c8dfa93?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de comprar Whey Protein Chocolate'
  ),
  (
    'BCAA 2:1:1',
    'Aminoácidos essenciais para treino, recuperação e ganho de massa muscular. Sabor Maracujá.',
    45.90,
    'https://images.unsplash.com/photo-1565042666747-338d58c91f0f?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de comprar BCAA 2:1:1'
  ),
  (
    'Creatina Monohidratada',
    'Creatina pura 100% importada. Aumenta força, potência e desempenho nos treinos.',
    65.00,
    'https://images.unsplash.com/photo-1535242749633-0ef90820e0ae?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de comprar Creatina Monohidratada'
  ),
  (
    'Garrafinha de Água 500ml',
    'Garrafinha térmica de alumínio com isolamento a vácuo. Mantém bebidas quentes ou frias por horas.',
    35.50,
    'https://images.unsplash.com/photo-1602143407151-7e406cab6c16?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de comprar Garrafinha de Água 500ml'
  ),
  (
    'Pré Treino Energy Boost',
    'Pré treino com cafeína, beta-alanina e nitrato de beterraba. Sabor Morango.',
    72.90,
    'https://images.unsplash.com/photo-1584308666744-24d5f400f025?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de comprar Pré Treino Energy Boost'
  ),
  (
    'Termogênico Fat Burner',
    'Queimador de gordura com cafeína, L-carnitina e extrato de chá verde. Acelera metabolismo.',
    58.90,
    'https://images.unsplash.com/photo-1577405132519-21a6a27ab9ad?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de comprar Termogênico Fat Burner'
  ),
  (
    'Kit Marmita Semanal Proteico',
    'Kit com 7 marmitas preparadas semanalmente. Frango grelhado, arroz integral e brócolis. Entrega segunda a segunda.',
    189.90,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de comprar Kit Marmita Semanal Proteico'
  ),
  (
    'Kit Marmita Low Carb',
    'Kit com 5 marmitas preparadas. Carnes magras, legumes grelhados e abacate. Perfeito para quem está em dieta low carb.',
    145.00,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de comprar Kit Marmita Low Carb'
  ),
  (
    'Kit Marmita Vegetariana',
    'Kit com 7 marmitas 100% vegetarianas. Quinoa, feijão, legumes variados e ovos. Opção deliciosa e saudável.',
    159.90,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de comprar Kit Marmita Vegetariana'
  ),
  (
    'Kit Marmita Personalizado',
    'Monte seu próprio kit! Escolha a quantidade de dias, proteína, acompanhamento e legumes. Entrega conforme pedido.',
    199.90,
    'https://images.unsplash.com/photo-1506959293351-b8335dc2df60?w=500&h=500&fit=crop',
    true,
    'Olá! Gostaria de montar meu Kit Marmita Personalizado'
  );

-- ============================================================================
-- CADASTRAR RECEITAS FIT
-- ============================================================================

INSERT INTO public.receitas (nome, ingredientes, modo_preparo, categoria, tempo, foto_url, publicada)
VALUES
  (
    'Bolo de Chocolate Low Carb',
    '3 ovos, 100g de chocolate 70%, 50g de manteiga, 40g de farinha de amêndoa, 1 colher de chá de fermento, adoçante a gosto',
    '1. Derreta o chocolate com a manteiga em banho-maria. 2. Bata os ovos com adoçante. 3. Misture o chocolate aos ovos. 4. Adicione a farinha de amêndoa e fermento. 5. Coloque em forma untada e asse a 180°C por 25 minutos.',
    'Doce Fit',
    '40 min',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
    true
  ),
  (
    'Ovos Mexidos com Vegetais',
    '3 ovos grandes, 1 xícara de espinafre fresco, 1/2 cebola roxa, 1 tomate, sal e pimenta a gosto, 1 colher de azeite',
    '1. Aqueça o azeite em uma frigideira. 2. Refogue a cebola até ficar transparente. 3. Adicione o espinafre e tomate. 4. Despeje os ovos batidos. 5. Mexa constantemente até cozinhar. 6. Tempere com sal e pimenta.',
    'Café da Manhã',
    '15 min',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=500&fit=crop',
    true
  ),
  (
    'Barra de Proteína Caseira',
    '200g de pasta de amendoim natural, 100g de whey protein chocolate, 80g de aveia em flocos, 40g de mel, 50g de chocolate amargo derretido',
    '1. Misture pasta de amendoim com whey protein. 2. Adicione aveia e mel. 3. Coloque em uma forma forrada com papel manteiga. 4. Leve à geladeira por 2 horas. 5. Corte em barras e cubra com chocolate.',
    'Lanche',
    '20 min',
    'https://images.unsplash.com/photo-1622351781551-74d440642117?w=500&h=500&fit=crop',
    true
  ),
  (
    'Salada de Frango com Quinoa',
    '200g de peito de frango grelhado, 1 xícara de quinoa cozida, 2 xícaras de alface roxa, 1 cenoura ralada, 1/2 abacate, suco de limão, azeite e sal',
    '1. Cozinhe a quinoa em água e sal. 2. Tempere o frango com limão, sal e pimenta, grelhe. 3. Corte o frango em tiras. 4. Misture a alface, cenoura e abacate em uma tigela. 5. Adicione a quinoa e frango. 6. Regue com azeite e suco de limão.',
    'Proteico',
    '30 min',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
    true
  ),
  (
    'Smoothie Verde Detox',
    '1 xícara de espinafre, 1 maçã verde, 1/2 banana, 1/2 xícara de água de coco, gelo, 1 colher de sopa de chia, suco de limão',
    '1. Adicione o espinafre na liquidificadora. 2. Coloque a maçã, banana e água de coco. 3. Bata até ficar homogêneo. 4. Adicione gelo e bata novamente. 5. Despeje em um copo e polvilhe chia por cima. 6. Beba imediatamente.',
    'Café da Manhã',
    '5 min',
    'https://images.unsplash.com/photo-1590952214146-e89e42e4365e?w=500&h=500&fit=crop',
    true
  ),
  (
    'Pão Proteico Low Carb',
    '3 ovos, 100g de queijo mozzarela ralada, 50g de almond flour, 1 colher de chá de fermento, sal, ervas secas',
    '1. Bata os ovos na batedeira. 2. Adicione queijo mozzarela aquecido e almond flour. 3. Misture fermento e sal. 4. Despeje em forma de pão. 5. Asse a 190°C por 35 minutos até dourar.',
    'Low Carb',
    '45 min',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop',
    true
  );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verifique se os produtos foram inseridos
SELECT COUNT(*) as total_produtos FROM public.produtos;

-- Verifique se as receitas foram inseridas
SELECT COUNT(*) as total_receitas FROM public.receitas;
