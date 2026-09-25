# Controle de Estoque — ONG Nascente

Aplicativo web simples para controle de estoque de alimentos e cadastro de famílias atendidas pela ONG Nascente.

## Estrutura do projeto

```
controle-estoque-nascente/
├── index.html      # estrutura da página
├── css/
│   └── style.css   # estilos visuais (paleta, layout, tipografia)
├── js/
│   └── app.js      # lógica do app (estoque, famílias, movimentações)
└── README.md
```

## Funcionalidades

- **Estoque**: lista de itens com quantidade atual e alerta visual quando abaixo do mínimo cadastrado.
- **Famílias**: cadastro de famílias atendidas (nome do responsável, número de pessoas, contato).
- **Movimentar**: registro de entradas (doações) e saídas (distribuições) por item, com observação opcional.
- **Histórico**: log de todas as movimentações realizadas, mais recentes primeiro.

Os dados são salvos no `localStorage` do navegador — ou seja, ficam gravados localmente, por navegador/dispositivo, sem precisar de servidor ou banco de dados.

## Como rodar

Não precisa de instalação nem build. Basta abrir o `index.html` no navegador, ou, no VS Code, usar a extensão **Live Server** e clicar em "Go Live" para servir a pasta.

## Personalizando

- Para mudar as categorias de alimentos pré-cadastradas e seus estoques mínimos, edite o array `DEFAULT_CATEGORIES` no início de `js/app.js`.
- As cores (paleta clara/escura) ficam nas variáveis CSS `:root` no topo de `css/style.css`.
