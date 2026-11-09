// ---- Constantes ----------------------------------------------------------
const CHAVE_REGISTROS = 'memoriaViva:registros';
const CHAVE_FORUM = 'memoriaViva:forum';
const ITENS_POR_PAGINA = 5;
const TAMANHO_MAXIMO_UPLOAD = 300 * 1024; // 300 KB 

const CATEGORIAS = {
    politica: 'Política',
    cultura: 'Cultura',
    economia: 'Economia',
    sociedade: 'Sociedade',
    arquitetura: 'Arquitetura e patrimônio',
    ciencia: 'Ciência e tecnologia',
    outra: 'Outra',
};

const LICENCAS = {
    'dominio-publico': 'Domínio público',
    'cc-by': 'CC BY',
    'cc-by-sa': 'CC BY-SA',
    cc0: 'CC0',
    outra: 'Outra',
};

// ---- Dados de exemplo (usados apenas na primeira execução) ---------------
const REGISTROS_EXEMPLO = [
    {
        id: 'r-exemplo-1',
        titulo: 'Inauguração da Estação Ferroviária de Vila Nova',
        descricao:
            'A estação foi inaugurada com a presença de autoridades locais e de moradores, marcando a chegada da ferrovia e a transformação econômica da região.\n\nEste texto é fictício e serve apenas para demonstrar como a descrição completa de um registro é exibida.',
        categoria: 'arquitetura',
        tipoData: 'exata',
        dataInicio: '1888-05-14',
        dataFim: '',
        ano: '',
        local: 'Vila Nova, Minas Gerais, Brasil',
        latitude: -21.5513,
        longitude: -45.4303,
        pessoas: ['Joaquim Almeida', 'Barão de Santa Rita'],
        fonte: 'Arquivo Municipal de Vila Nova (fictício)',
        linkFonte: '',
        referencias: [
            'Ata da cerimônia de inauguração (1888)',
            'Fotografia da fachada da estação (1890)',
            'Reportagem do jornal Voz da Cidade (1888)',
        ],
        imagem: null,
        comentarios: [
            {
                id: 'c-exemplo-1',
                autor: 'Ana Paula',
                texto: 'Meu bisavô trabalhou na construção da estação. Posso enviar uma foto de família?',
                data: '2026-10-10T14:30:00.000Z',
            },
            {
                id: 'c-exemplo-2',
                autor: 'Carlos Eduardo',
                texto: 'Seria interessante incluir a planta original da estação nas referências.',
                data: '2026-10-12T09:15:00.000Z',
            },
        ],
        criadoEm: '2026-10-01T10:00:00.000Z',
    },
    {
        id: 'r-exemplo-2',
        titulo: 'Primeira Feira de Cultura Popular',
        descricao:
            'Evento que reuniu artesãos, músicos e contadores de histórias da região. Registro fictício para demonstração do sistema.',
        categoria: 'cultura',
        tipoData: 'exata',
        dataInicio: '1952-07-20',
        dataFim: '',
        ano: '',
        local: 'Vila Nova, Minas Gerais, Brasil',
        latitude: -21.5513,
        longitude: -45.4303,
        pessoas: ['Maria das Dores', 'Antônio Ferreira'],
        fonte: 'Jornal Voz da Cidade (fictício)',
        linkFonte: '',
        referencias: [],
        imagem: null,
        comentarios: [],
        criadoEm: '2026-10-02T10:00:00.000Z',
    },
    {
        id: 'r-exemplo-3',
        titulo: 'Ciclo do café na região',
        descricao:
            'Período de expansão das fazendas e das ferrovias no Sul de Minas, que transformou a economia e a paisagem local. Registro fictício para demonstração.',
        categoria: 'economia',
        tipoData: 'periodo',
        dataInicio: '1870-01-01',
        dataFim: '1930-12-31',
        ano: '',
        local: 'Sul de Minas, Brasil',
        latitude: null,
        longitude: null,
        pessoas: ['Coronel Benedito Rocha'],
        fonte: 'Livro "Terra e Café" (fictício)',
        linkFonte: '',
        referencias: [],
        imagem: null,
        comentarios: [],
        criadoEm: '2026-10-03T10:00:00.000Z',
    },
    {
        id: 'r-exemplo-4',
        titulo: 'Criação do primeiro grupo escolar',
        descricao:
            'Criação da primeira escola pública organizada em grupo escolar na cidade, ampliando o acesso à educação. Registro fictício para demonstração.',
        categoria: 'sociedade',
        tipoData: 'ano',
        dataInicio: '',
        dataFim: '',
        ano: '1911',
        local: 'Vila Nova, Minas Gerais, Brasil',
        latitude: null,
        longitude: null,
        pessoas: ['Profa. Helena Duarte'],
        fonte: 'Acervo da Escola Estadual (fictício)',
        linkFonte: '',
        referencias: [],
        imagem: null,
        comentarios: [],
        criadoEm: '2026-10-04T10:00:00.000Z',
    },
];

const FORUM_EXEMPLO = [
    {
        id: 't-exemplo-1',
        assunto: 'Como confirmar a data de inauguração da estação?',
        autor: 'Ana Paula',
        mensagem: 'Encontrei duas datas diferentes em fontes distintas. Alguém sabe onde consultar a ata original?',
        criadoEm: '2026-10-08T12:00:00.000Z',
        respostas: [
            {
                id: 'p-exemplo-1',
                autor: 'Carlos Eduardo',
                texto: 'O Arquivo Municipal costuma guardar as atas. Vale pedir uma cópia digitalizada.',
                data: '2026-10-12T16:40:00.000Z',
            },
        ],
    },
    {
        id: 't-exemplo-2',
        assunto: 'Fotos antigas da feira de 1952',
        autor: 'Carlos Eduardo',
        mensagem: 'Alguém tem fotografias da feira? Gostaria de associá-las ao registro, com a devida fonte.',
        criadoEm: '2026-10-14T18:00:00.000Z',
        respostas: [],
    },
];

// ---- Estado da aplicação -------------------------------------------------
const estado = {
    registros: [],
    forum: [],
    paginaAtual: 1,
    idEmEdicao: null,
    idSelecionado: null,
    idParaExcluir: null,
    imagemUpload: '', // imagem enviada pelo usuário (data URL)
    imagemPagina: '', // página de origem da imagem (Wikimedia Commons)
};

// ---- Funções utilitárias -------------------------------------------------

/** Atalho para document.getElementById. */
const $ = (id) => document.getElementById(id);

function el(tag, props = {}, ...filhos) {
    const elemento = document.createElement(tag);
    for (const [chave, valor] of Object.entries(props)) {
        if (valor === undefined || valor === null || valor === false) continue;
        if (chave === 'classe') elemento.className = valor;
        else if (chave === 'texto') elemento.textContent = valor;
        else if (chave === 'dados') Object.assign(elemento.dataset, valor);
        else if (chave.startsWith('on')) elemento.addEventListener(chave.slice(2), valor);
        else elemento.setAttribute(chave, valor === true ? '' : valor);
    }
    for (const filho of filhos.flat()) {
        if (filho === undefined || filho === null || filho === false) continue;
        elemento.append(filho);
    }
    return elemento;
}

/** Remove acentos e converte para minúsculas (pesquisas sem distinção). */
function normalizar(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function separarLista(texto, separador) {
    return texto
        .split(separador)
        .map((item) => item.trim())
        .filter(Boolean);
}

function gerarId(prefixo) {
    return `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function hojeISO() {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${agora.getFullYear()}-${mes}-${dia}`;
}

/** '1888-05-14' → '14/05/1888' (sem usar Date, evitando problemas de fuso). */
function formatarData(iso) {
    if (!iso) return '';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(iso) {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatarPeriodo(reg) {
    const inicio = formatarData(reg.dataInicio);
    switch (reg.tipoData) {
        case 'exata':
            return inicio;
        case 'ano':
            return String(reg.ano);
        case 'periodo':
            return `${inicio} a ${formatarData(reg.dataFim)}`;
        case 'aproximada':
            return `c. ${inicio || reg.ano}`;
        default:
            return inicio || String(reg.ano || '—');
    }
}

/** Chave textual 'AAAA-MM-DD' usada para ordenar por data. */
function chaveData(reg) {
    if (reg.dataInicio) return reg.dataInicio;
    if (reg.ano) return `${String(reg.ano).padStart(4, '0')}-01-01`;
    return '9999-12-31';
}

/** Intervalo de anos do registro (para o filtro de período). */
function intervaloAnos(reg) {
    const anoDe = (iso) => (iso ? parseInt(iso.slice(0, 4), 10) : null);
    const inicio = reg.dataInicio ? anoDe(reg.dataInicio) : Number(reg.ano) || null;
    const fim = reg.dataFim ? anoDe(reg.dataFim) : inicio;
    return { inicio, fim };
}

function resumir(texto, limite) {
    return texto.length > limite ? `${texto.slice(0, limite).trimEnd()}…` : texto;
}

function urlValida(texto) {
    try {
        const url = new URL(texto);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function temCoordenadas(reg) {
    return typeof reg.latitude === 'number' && typeof reg.longitude === 'number';
}

/** Exibe uma mensagem temporária (sucesso, erro, aviso ou info). */
function mostrarMensagem(tipo, texto, duracao = 5000) {
    const papel = tipo === 'erro' ? 'alert' : 'status';
    const alerta = el(
        'div',
        { classe: `alerta alerta--${tipo}`, role: papel },
        el('p', { texto }),
        el('button', {
            type: 'button',
            classe: 'botao--pequeno',
            'aria-label': 'Fechar mensagem',
            texto: 'Fechar',
            onclick: () => alerta.remove(),
        })
    );
    $('mensagens').append(alerta);
    if (duracao > 0) setTimeout(() => alerta.remove(), duracao);
}
