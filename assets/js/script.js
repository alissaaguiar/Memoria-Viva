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

function criarEtiqueta(categoria) {
    return el('span', {
        classe: 'etiqueta',
        dados: { categoria },
        texto: CATEGORIAS[categoria] || categoria,
    });
}

function criarBotoesAcoes(reg) {
    return el(
        'div',
        { classe: 'acoes' },
        el('button', {
            type: 'button',
            classe: 'botao--primario botao--pequeno',
            dados: { acao: 'detalhes', id: reg.id },
            'aria-label': `Ver detalhes de ${reg.titulo}`,
            texto: 'Ver detalhes',
        }),
        el('button', {
            type: 'button',
            classe: 'botao--pequeno',
            dados: { acao: 'editar', id: reg.id },
            'aria-label': `Editar ${reg.titulo}`,
            texto: 'Editar',
        }),
        el('button', {
            type: 'button',
            classe: 'botao--perigo botao--pequeno',
            dados: { acao: 'excluir', id: reg.id },
            'aria-label': `Excluir ${reg.titulo}`,
            texto: 'Excluir',
        })
    );
}

function criarLinhaTabela(reg) {
    return el(
        'tr',
        { classe: reg.id === estado.idSelecionado ? 'selecionado' : null },
        el('th', { scope: 'row', texto: reg.titulo }),
        el('td', { 'data-label': 'Categoria' }, criarEtiqueta(reg.categoria)),
        el(
            'td',
            { 'data-label': 'Data / período' },
            el('time', { datetime: chaveData(reg), texto: formatarPeriodo(reg) })
        ),
        el('td', { 'data-label': 'Local', texto: reg.local || '—' }),
        el('td', { 'data-label': 'Pessoas relacionadas', texto: reg.pessoas.join(', ') || '—' }),
        el('td', { 'data-label': 'Fonte', texto: reg.fonte }),
        el('td', { 'data-label': 'Ações' }, criarBotoesAcoes(reg))
    );
}

function criarCartao(reg) {
    const imagem = reg.imagem
        ? el(
            'figure',
            {},
            el('img', {
                src: reg.imagem.url,
                alt: `Imagem do registro: ${reg.titulo}`,
                loading: 'lazy',
            }),
            el('figcaption', {
                texto: `Autor: ${reg.imagem.autor} · Licença: ${LICENCAS[reg.imagem.licenca] || reg.imagem.licenca}`,
            })
        )
        : el('div', { classe: 'cartao__sem-imagem', 'aria-hidden': 'true', texto: 'Sem imagem' });

    return el(
        'article',
        { classe: 'cartao' },
        imagem,
        el(
            'div',
            { classe: 'cartao__corpo' },
            el('h4', { texto: reg.titulo }),
            el('p', {}, criarEtiqueta(reg.categoria)),
            el(
                'p',
                {},
                el('strong', { texto: 'Data: ' }),
                el('time', { datetime: chaveData(reg), texto: formatarPeriodo(reg) })
            ),
            el('p', { texto: resumir(reg.descricao.replace(/\s+/g, ' '), 140) }),
            criarBotoesAcoes(reg)
        )
    );
}

function renderizarCartoesRecentes() {
    const recentes = [...estado.registros]
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
        .slice(0, 3);
    $('secao-recentes').hidden = recentes.length === 0;
    $('lista-cartoes').replaceChildren(...recentes.map(criarCartao));
}

function renderizarPaginacao(totalPaginas) {
    $('paginacao').hidden = totalPaginas <= 1;

    const criarItem = (rotulo, pagina, atual = false) =>
        el(
            'li',
            {},
            el('a', {
                href: '#consulta',
                dados: { acao: 'pagina', pagina },
                'aria-current': atual ? 'page' : null,
                'aria-label': atual ? `Página ${pagina} (atual)` : `Ir para ${rotulo === String(pagina) ? `a página ${pagina}` : rotulo.toLowerCase()}`,
                texto: rotulo,
            })
        );

    const itens = [];
    if (estado.paginaAtual > 1) itens.push(criarItem('Anterior', estado.paginaAtual - 1));
    for (let p = 1; p <= totalPaginas; p++) {
        itens.push(criarItem(String(p), p, p === estado.paginaAtual));
    }
    if (estado.paginaAtual < totalPaginas) itens.push(criarItem('Próxima', estado.paginaAtual + 1));
    $('paginacao-lista').replaceChildren(...itens);
}

function renderizarListagem() {
    const visiveis = [...estado.registros];
    const total = estado.registros.length;

    const totalPaginas = Math.max(1, Math.ceil(visiveis.length / ITENS_POR_PAGINA));
    if (estado.paginaAtual > totalPaginas) estado.paginaAtual = totalPaginas;

    const inicio = (estado.paginaAtual - 1) * ITENS_POR_PAGINA;
    const pagina = visiveis.slice(inicio, inicio + ITENS_POR_PAGINA);

    $('lista-corpo').replaceChildren(...pagina.map(criarLinhaTabela));

    const vazio = visiveis.length === 0;
    $('tabela-wrapper').hidden = vazio;
    $('estado-vazio').hidden = !vazio;
    $('contador-resultados').hidden = vazio;
    if (vazio) {
        const semCadastro = total === 0;
        $('vazio-titulo').textContent = semCadastro
            ? 'Nenhum registro cadastrado'
            : 'Nenhum registro encontrado';
        $('vazio-texto').textContent = semCadastro
            ? 'Use o formulário acima para cadastrar o primeiro registro histórico.'
            : 'Tente alterar a pesquisa ou limpar os filtros aplicados.';
        $('btn-limpar-busca').hidden = semCadastro;
    } else {
        $('contador-resultados').textContent =
            `Mostrando ${pagina.length} de ${visiveis.length} resultado(s)` +
            (visiveis.length !== total ? ` (${total} registro(s) cadastrado(s) no total)` : '') +
            ` — página ${estado.paginaAtual} de ${totalPaginas}.`;
    }

    renderizarPaginacao(totalPaginas);
    renderizarCartoesRecentes();
}

function aoClicarAcao(evento) {
    const alvo = evento.target.closest('[data-acao]');
    if (!alvo) return;
    const { acao, pagina } = alvo.dataset;
    if (alvo.tagName === 'A') evento.preventDefault();

    switch (acao) {
        case 'pagina':
            estado.paginaAtual = Number(pagina);
            renderizarListagem();
            $('titulo-tabela').scrollIntoView({ behavior: 'smooth' });
            break;
    }
}

function registrarEventosListagem() {
    document.addEventListener('click', aoClicarAcao);
}

function atualizarTudo() {
    renderizarListagem();
}

function iniciar() {
    estado.registros = [...REGISTROS_EXEMPLO];
    registrarEventosListagem();
    atualizarTudo();
}

function atualizarCamposData() {
    const tipo = $('tipo-data').value;
    const camposPorTipo = {
        exata: ['data-inicio'],
        ano: ['ano'],
        periodo: ['data-inicio', 'data-fim'],
        aproximada: ['data-inicio', 'ano'],
    };
    const visiveis = camposPorTipo[tipo] || [];
    for (const id of ['data-inicio', 'data-fim', 'ano']) {
        $(id).closest('.campo').hidden = !visiveis.includes(id);
    }

    const rotuloInicio = document.querySelector('label[for="data-inicio"]');
    const rotulos = {
        exata: 'Data *',
        periodo: 'Data de início *',
        aproximada: 'Data aproximada (ou informe só o ano)',
    };
    rotuloInicio.textContent = rotulos[tipo] || 'Data';
    document.querySelector('label[for="ano"]').textContent =
        tipo === 'ano' ? 'Ano *' : 'Ano (opcional)';
}

function lerFormulario() {
    return {
        titulo: $('titulo').value.trim(),
        descricao: $('descricao').value.trim(),
        categoria: $('categoria').value,
        tipoData: $('tipo-data').value,
        dataInicio: $('data-inicio').value,
        dataFim: $('data-fim').value,
        ano: $('ano').value.trim(),
        local: $('local').value.trim(),
        latitude: $('latitude').value.trim(),
        longitude: $('longitude').value.trim(),
        pessoas: separarLista($('pessoas').value, ','),
        fonte: $('fonte').value.trim(),
        linkFonte: $('link-fonte').value.trim(),
        referencias: separarLista($('referencias').value, '\n'),
        urlImagem: $('url-imagem').value.trim(),
        autorImagem: $('autor-imagem').value.trim(),
        licencaImagem: $('licenca-imagem').value,
    };
}

function validarDados(d) {
    const erros = {};
    const anoAtual = new Date().getFullYear();
    const hoje = hojeISO();

    if (d.titulo.length < 3) erros['titulo'] = 'Informe um título com pelo menos 3 caracteres.';
    if (d.descricao.length < 20) erros['descricao'] = 'A descrição deve ter pelo menos 20 caracteres.';
    if (!d.categoria) erros['categoria'] = 'Selecione uma categoria.';

    const validarAno = (obrigatorio) => {
        if (d.ano === '') {
            if (obrigatorio) erros['ano'] = 'Informe o ano.';
            return;
        }
        const numero = Number(d.ano);
        if (!Number.isInteger(numero) || numero < 1 || numero > anoAtual) {
            erros['ano'] = `Informe um ano entre 1 e ${anoAtual}.`;
        }
    };

    switch (d.tipoData) {
        case 'exata':
            if (!d.dataInicio) erros['data-inicio'] = 'Informe a data do acontecimento.';
            else if (d.dataInicio > hoje) erros['data-inicio'] = 'A data não pode estar no futuro.';
            break;
        case 'ano':
            validarAno(true);
            break;
        case 'periodo':
            if (!d.dataInicio) erros['data-inicio'] = 'Informe a data de início.';
            else if (d.dataInicio > hoje) erros['data-inicio'] = 'A data não pode estar no futuro.';
            if (!d.dataFim) erros['data-fim'] = 'Informe a data de fim.';
            else if (d.dataFim > hoje) erros['data-fim'] = 'A data de fim não pode estar no futuro.';
            else if (d.dataInicio && d.dataFim < d.dataInicio) {
                erros['data-fim'] = 'A data de fim deve ser igual ou posterior à de início.';
            }
            break;
        case 'aproximada':
            if (!d.dataInicio && d.ano === '') {
                erros['data-inicio'] = 'Informe uma data aproximada ou o ano.';
            } else if (d.dataInicio > hoje) {
                erros['data-inicio'] = 'A data não pode estar no futuro.';
            }
            validarAno(false);
            break;
    }

    const temLat = d.latitude !== '';
    const temLng = d.longitude !== '';
    if (temLat !== temLng) {
        erros[temLat ? 'longitude' : 'latitude'] = 'Informe latitude e longitude juntas.';
    } else if (temLat) {
        const lat = Number(d.latitude);
        const lng = Number(d.longitude);
        if (!Number.isFinite(lat) || lat < -90 || lat > 90) erros['latitude'] = 'Latitude entre -90 e 90.';
        if (!Number.isFinite(lng) || lng < -180 || lng > 180) erros['longitude'] = 'Longitude entre -180 e 180.';
    }

    if (d.fonte.length < 3) erros['fonte'] = 'Informe a fonte das informações (mínimo 3 caracteres).';
    if (d.linkFonte && !urlValida(d.linkFonte)) {
        erros['link-fonte'] = 'Informe um endereço válido, começando com http:// ou https://.';
    }

    if (d.urlImagem && !urlValida(d.urlImagem)) {
        erros['url-imagem'] = 'Informe um endereço válido, começando com http:// ou https://.';
    }
    const temImagem = Boolean(estado.imagemUpload || (d.urlImagem && !erros['url-imagem']));
    if (temImagem) {
        if (!d.autorImagem) erros['autor-imagem'] = 'Informe o autor da imagem (ou "Desconhecido").';
        if (!d.licencaImagem) erros['licenca-imagem'] = 'Selecione a licença da imagem.';
    }

    return erros;
}

function exibirErros(erros) {
    let primeiro = null;
    for (const [id, mensagem] of Object.entries(erros)) {
        const campo = $(id);
        if (!campo) continue;
        const idErro = `erro-${id}`;
        const paragrafo = el('p', {
            classe: 'mensagem-campo mensagem-campo--erro',
            id: idErro,
            texto: mensagem,
        });
        (campo.closest('.campo') || campo.parentElement).append(paragrafo);
        campo.setAttribute('aria-invalid', 'true');
        campo.setAttribute('aria-describedby', idErro);
        if (!primeiro) primeiro = campo;
    }
    if (primeiro) primeiro.focus();
}

function limparErros(formulario) {
    formulario.querySelectorAll('[aria-invalid]').forEach((campo) => {
        campo.removeAttribute('aria-invalid');
        campo.removeAttribute('aria-describedby');
    });
    formulario.querySelectorAll('.mensagem-campo--erro').forEach((p) => p.remove());
}

function limparErroDoCampo(evento) {
    const campo = evento.target;
    if (!campo.hasAttribute || !campo.hasAttribute('aria-invalid')) return;
    campo.removeAttribute('aria-invalid');
    campo.removeAttribute('aria-describedby');
    const mensagem = $(`erro-${campo.id}`);
    if (mensagem) mensagem.remove();
}

function montarRegistro(d, base = {}) {
    const urlFinal = estado.imagemUpload || d.urlImagem;
    return {
        id: base.id || gerarId('r'),
        titulo: d.titulo,
        descricao: d.descricao,
        categoria: d.categoria,
        tipoData: d.tipoData,
        dataInicio: d.tipoData === 'ano' ? '' : d.dataInicio,
        dataFim: d.tipoData === 'periodo' ? d.dataFim : '',
        ano: d.tipoData === 'ano' || d.tipoData === 'aproximada' ? d.ano : '',
        local: d.local,
        latitude: d.latitude === '' ? null : Number(d.latitude),
        longitude: d.longitude === '' ? null : Number(d.longitude),
        pessoas: d.pessoas,
        fonte: d.fonte,
        linkFonte: d.linkFonte,
        referencias: d.referencias,
        imagem: urlFinal
            ? {
                url: urlFinal,
                autor: d.autorImagem,
                licenca: d.licencaImagem,
                paginaOrigem: estado.imagemPagina,
            }
            : null,
        comentarios: base.comentarios || [],
        criadoEm: base.criadoEm || new Date().toISOString(),
    };
}

function aoEnviarFormulario(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    limparErros(formulario);

    const dados = lerFormulario();
    const erros = validarDados(dados);
    if (Object.keys(erros).length > 0) {
        exibirErros(erros);
        mostrarMensagem('erro', 'Não foi possível salvar. Corrija os campos destacados.');
        return;
    }

    const novo = montarRegistro(dados);
    if (!aplicarAlteracao([...estado.registros, novo])) return;

    formulario.reset();
    atualizarTudo();
    mostrarMensagem('sucesso', 'Registro salvo com sucesso!');
    $('consulta').scrollIntoView({ behavior: 'smooth' });
}

function aoLimparFormulario() {
    limparErros($('form-registro'));
    estado.imagemUpload = '';
    estado.imagemPagina = '';
    setTimeout(() => {
        atualizarCamposData();
    }, 0);
}

function registrarEventosFormulario() {
    const formulario = $('form-registro');
    formulario.addEventListener('submit', aoEnviarFormulario);
    formulario.addEventListener('input', limparErroDoCampo);
    formulario.addEventListener('reset', aoLimparFormulario);
    $('tipo-data').addEventListener('change', atualizarCamposData);
}

function iniciar() {
    const primeiraVez = lerJSON(CHAVE_REGISTROS, null) === null;
    estado.registros = carregarRegistros();
    if (primeiraVez) gravarJSON(CHAVE_REGISTROS, estado.registros);

    registrarEventosListagem();
    registrarEventosFormulario();
    atualizarCamposData();
    atualizarTudo();
}

function lerJSON(chave, padrao) {
    try {
        const bruto = localStorage.getItem(chave);
        return bruto === null ? padrao : JSON.parse(bruto);
    } catch (erro) {
        console.error(`Erro ao ler "${chave}" do localStorage:`, erro);
        return padrao;
    }
}

function gravarJSON(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
        return true;
    } catch (erro) {
        console.error(`Erro ao gravar "${chave}" no localStorage:`, erro);
        mostrarMensagem(
            'erro',
            'Não foi possível salvar no navegador (armazenamento cheio ou bloqueado). A alteração foi desfeita.',
            8000
        );
        return false;
    }
}

function normalizarRegistro(r) {
    return {
        id: r.id || gerarId('r'),
        titulo: String(r.titulo || 'Sem título'),
        descricao: r.descricao || '',
        categoria: r.categoria || 'outra',
        tipoData: r.tipoData || 'exata',
        dataInicio: r.dataInicio || '',
        dataFim: r.dataFim || '',
        ano: r.ano ? String(r.ano) : '',
        local: r.local || '',
        latitude: typeof r.latitude === 'number' ? r.latitude : null,
        longitude: typeof r.longitude === 'number' ? r.longitude : null,
        pessoas: Array.isArray(r.pessoas) ? r.pessoas : [],
        fonte: r.fonte || '',
        linkFonte: r.linkFonte || '',
        referencias: Array.isArray(r.referencias) ? r.referencias : [],
        imagem: r.imagem && r.imagem.url ? r.imagem : null,
        comentarios: Array.isArray(r.comentarios) ? r.comentarios : [],
        criadoEm: r.criadoEm || new Date().toISOString(),
    };
}

function carregarRegistros() {
    const dados = lerJSON(CHAVE_REGISTROS, null);
    if (dados === null) return JSON.parse(JSON.stringify(REGISTROS_EXEMPLO));
    return Array.isArray(dados) ? dados.map(normalizarRegistro) : [];
}

function persistir(nomeNoEstado, chaveStorage, novoValor) {
    const anterior = estado[nomeNoEstado];
    estado[nomeNoEstado] = novoValor;
    if (!gravarJSON(chaveStorage, novoValor)) {
        estado[nomeNoEstado] = anterior;
        return false;
    }
    return true;
}

const aplicarAlteracao = (novaLista) => persistir('registros', CHAVE_REGISTROS, novaLista);

function atualizarRegistro(id, alterar) {
    return aplicarAlteracao(estado.registros.map((r) => (r.id === id ? alterar(r) : r)));
}