'use strict';

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
    const visiveis = obterRegistrosVisiveis();
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
    const { acao, id, pagina } = alvo.dataset;
    if (alvo.tagName === 'A') evento.preventDefault();

    switch (acao) {
        case 'pagina':
            estado.paginaAtual = Number(pagina);
            renderizarListagem();
            $('titulo-tabela').scrollIntoView({ behavior: 'smooth' });
            break;

        case 'detalhes':
            exibirDetalhes(id);
            break;

        case 'editar':
            iniciarEdicao(id);
            break;

        case 'excluir':
            pedirConfirmacaoExclusao(id);
            break;
    }
}

function registrarEventosListagem() {
    document.addEventListener('click', aoClicarAcao);
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

    if (estado.idEmEdicao) {
        const original = estado.registros.find((r) => r.id === estado.idEmEdicao);
        if (!original) {
            mostrarMensagem('erro', 'O registro que estava sendo editado não existe mais.');
            formulario.reset();
            return;
        }
        const atualizado = montarRegistro(dados, original);
        const lista = estado.registros.map((r) => (r.id === original.id ? atualizado : r));
        if (!aplicarAlteracao(lista)) return;

        formulario.reset();
        atualizarTudo();
        if (estado.idSelecionado === atualizado.id) exibirDetalhes(atualizado.id, { rolar: false });
        mostrarMensagem('sucesso', 'Registro atualizado com sucesso!');
        $('consulta').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Novo cadastro
    const novo = montarRegistro(dados);
    if (!aplicarAlteracao([...estado.registros, novo])) return;

    formulario.reset();
    atualizarTudo();
    mostrarMensagem('sucesso', 'Registro salvo com sucesso!');
    $('consulta').scrollIntoView({ behavior: 'smooth' });
}

function aoLimparFormulario() {
    limparErros($('form-registro'));
    sairModoEdicao(); // COMMIT 6
    estado.imagemUpload = '';
    estado.imagemPagina = '';
    // O reset do navegador acontece depois deste evento; por isso o setTimeout.
    setTimeout(() => {
        atualizarCamposData();
        atualizarPrevia(); 
    }, 0);
}



function aoLimparFormulario() {
    limparErros($('form-registro'));
    sairModoEdicao();
    estado.imagemUpload = '';
    estado.imagemPagina = '';
    setTimeout(() => {
        atualizarCamposData();
        atualizarPrevia();
    }, 0);
}

function registrarEventosFormulario() {
    const formulario = $('form-registro');
    formulario.addEventListener('submit', aoEnviarFormulario);
    formulario.addEventListener('input', limparErroDoCampo);
    formulario.addEventListener('reset', aoLimparFormulario);
    $('tipo-data').addEventListener('change', atualizarCamposData);
    $('btn-cancelar-edicao').addEventListener('click', () => formulario.reset());
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

function exibirDetalhes(id, { rolar = true } = {}) {
    const reg = estado.registros.find((r) => r.id === id);
    if (!reg) {
        mostrarMensagem('erro', 'Registro não encontrado.');
        return;
    }
    estado.idSelecionado = id;

    $('detalhe-titulo').textContent = reg.titulo;
    const etiqueta = $('detalhe-categoria');
    etiqueta.textContent = CATEGORIAS[reg.categoria] || reg.categoria;
    etiqueta.dataset.categoria = reg.categoria;

    const figura = $('detalhe-figura');
    if (reg.imagem) {
        $('detalhe-imagem').src = reg.imagem.url;
        $('detalhe-imagem').alt = `Imagem do registro: ${reg.titulo}`;
        const legenda = [
            `Autor: ${reg.imagem.autor}`,
            `Licença: ${LICENCAS[reg.imagem.licenca] || reg.imagem.licenca}`,
        ].join(' · ');
        $('detalhe-legenda').replaceChildren(
            legenda,
            reg.imagem.paginaOrigem ? ' · ' : '',
            reg.imagem.paginaOrigem
                ? el('a', {
                    href: reg.imagem.paginaOrigem,
                    target: '_blank',
                    rel: 'noopener',
                    texto: 'Página da imagem',
                })
                : ''
        );
        figura.hidden = false;
    } else {
        figura.hidden = true;
    }

    $('detalhe-descricao').replaceChildren(
        ...reg.descricao
            .split(/\n+/)
            .filter(Boolean)
            .map((paragrafo) => el('p', { texto: paragrafo }))
    );

    $('detalhe-data').replaceChildren(
        el('time', { datetime: chaveData(reg), texto: formatarPeriodo(reg) })
    );
    $('detalhe-local').textContent = reg.local || '—';
    $('detalhe-pessoas').replaceChildren(
        reg.pessoas.length
            ? el('ul', {}, ...reg.pessoas.map((pessoa) => el('li', { texto: pessoa })))
            : '—'
    );
    $('detalhe-fonte').replaceChildren(
        reg.fonte,
        reg.linkFonte ? ' ' : '',
        reg.linkFonte
            ? el('a', { href: reg.linkFonte, target: '_blank', rel: 'noopener', texto: '(acessar fonte)' })
            : ''
    );
    $('detalhe-cadastro').textContent = formatarDataHora(reg.criadoEm);

    $('detalhe-referencias').replaceChildren(
        ...reg.referencias.map((ref) =>
            el(
                'li',
                {},
                urlValida(ref) ? el('a', { href: ref, target: '_blank', rel: 'noopener', texto: ref }) : ref
            )
        )
    );
    $('detalhe-sem-referencias').hidden = reg.referencias.length > 0;

    const pessoasDoRegistro = reg.pessoas.map(normalizar);
    const relacionados = estado.registros
        .filter(
            (outro) =>
                outro.id !== reg.id &&
                (outro.categoria === reg.categoria ||
                    outro.pessoas.some((pessoa) => pessoasDoRegistro.includes(normalizar(pessoa))))
        )
        .slice(0, 4);
    $('detalhe-relacionados').replaceChildren(
        ...(relacionados.length
            ? relacionados.map((outro) =>
                el(
                    'li',
                    {},
                    el('a', {
                        href: '#detalhes',
                        dados: { acao: 'detalhes', id: outro.id },
                        texto: outro.titulo,
                    })
                )
            )
            : [el('li', { texto: 'Nenhum registro relacionado.' })])
    );

    $('btn-detalhe-editar').dataset.id = id;
    $('btn-detalhe-excluir').dataset.id = id;

    $('detalhes-vazio').hidden = true;
    $('detalhes-conteudo').hidden = false;
    renderizarListagem();
    atualizarMapa(id);
    renderizarComentarios(reg);

    if (rolar) {
        $('detalhes').scrollIntoView({ behavior: 'smooth' });
        $('detalhe-titulo').focus({ preventScroll: true });
    }
}

function ocultarDetalhes() {
    estado.idSelecionado = null;
    $('detalhes-conteudo').hidden = true;
    $('detalhes-vazio').hidden = false;
    atualizarMapa(null);
}

function preencherFormulario(reg) {
    $('titulo').value = reg.titulo;
    $('descricao').value = reg.descricao;
    $('categoria').value = reg.categoria;
    $('tipo-data').value = reg.tipoData;
    $('data-inicio').value = reg.dataInicio;
    $('data-fim').value = reg.dataFim;
    $('ano').value = reg.ano;
    $('local').value = reg.local;
    $('latitude').value = temCoordenadas(reg) ? reg.latitude : '';
    $('longitude').value = temCoordenadas(reg) ? reg.longitude : '';
    $('pessoas').value = reg.pessoas.join(', ');
    $('fonte').value = reg.fonte;
    $('link-fonte').value = reg.linkFonte;
    $('referencias').value = reg.referencias.join('\n');

    if (reg.imagem) {
        const enviada = reg.imagem.url.startsWith('data:');
        estado.imagemUpload = enviada ? reg.imagem.url : '';
        $('url-imagem').value = enviada ? '' : reg.imagem.url;
        $('autor-imagem').value = reg.imagem.autor;
        $('licenca-imagem').value = reg.imagem.licenca;
        estado.imagemPagina = reg.imagem.paginaOrigem || '';
    }

    atualizarCamposData();
    atualizarPrevia();
}

function iniciarEdicao(id) {
    const reg = estado.registros.find((r) => r.id === id);
    if (!reg) {
        mostrarMensagem('erro', 'Registro não encontrado.');
        return;
    }
    $('form-registro').reset();
    estado.idEmEdicao = id;
    preencherFormulario(reg);

    $('titulo-cadastro').textContent = 'Editar registro histórico';
    $('btn-salvar').textContent = 'Salvar alterações';
    $('texto-aviso-edicao').textContent = `Você está editando: "${reg.titulo}".`;
    $('aviso-edicao').hidden = false;

    $('cadastro').scrollIntoView({ behavior: 'smooth' });
    $('titulo').focus({ preventScroll: true });
}

function sairModoEdicao() {
    estado.idEmEdicao = null;
    $('aviso-edicao').hidden = true;
    $('titulo-cadastro').textContent = 'Cadastrar registro histórico';
    $('btn-salvar').textContent = 'Salvar registro';
}

function pedirConfirmacaoExclusao(id) {
    const reg = estado.registros.find((r) => r.id === id);
    if (!reg) return;
    estado.idParaExcluir = id;
    $('dialogo-texto').textContent =
        `O registro "${reg.titulo}" será removido permanentemente, junto com seus comentários. Esta ação não poderá ser desfeita.`;
    $('dialogo-exclusao').showModal();
}

function confirmarExclusao() {
    const id = estado.idParaExcluir;
    $('dialogo-exclusao').close();
    const reg = estado.registros.find((r) => r.id === id);
    if (!reg) return;

    if (!aplicarAlteracao(estado.registros.filter((r) => r.id !== id))) return;

    if (estado.idSelecionado === id) ocultarDetalhes();
    if (estado.idEmEdicao === id) $('form-registro').reset();

    atualizarTudo();
    mostrarMensagem('sucesso', `Registro "${reg.titulo}" excluído.`);
}

function registrarEventosExclusao() {
    $('btn-confirmar-exclusao').addEventListener('click', confirmarExclusao);
    $('btn-cancelar-exclusao').addEventListener('click', () => $('dialogo-exclusao').close());
    $('dialogo-exclusao').addEventListener('close', () => {
        estado.idParaExcluir = null;
    });
}

//=============pesquisa e filtros=============

function lerCriterios() {
    const numeroOuNulo = (id) => ($(id).value === '' ? null : Number($(id).value));
    return {
        busca: $('pesquisa').value.trim(),
        categoria: $('filtro-categoria').value,
        anoInicial: numeroOuNulo('filtro-ano-inicial'),
        anoFinal: numeroOuNulo('filtro-ano-final'),
        pessoa: $('filtro-pessoa').value.trim(),
        ordenarPor: $('ordenar-por').value,
        ordem: $('ordem').value,
    };
}

function pesquisarRegistros(lista, termo) {
    const busca = normalizar(termo);
    if (!busca) return lista;
    return lista.filter((reg) => {
        const texto = [reg.titulo, reg.descricao, reg.local, reg.fonte, reg.pessoas.join(' ')].join(' ');
        return normalizar(texto).includes(busca);
    });
}

function obterRegistrosVisiveis() {
    const criterios = lerCriterios();
    let lista = pesquisarRegistros(estado.registros, criterios.busca);
    lista = filtrarRegistros(lista, criterios);
    return ordenarRegistros(lista, criterios.ordenarPor, criterios.ordem);
}

function aoMudarCriterios() {
    estado.paginaAtual = 1;
    renderizarListagem();
}

function registrarEventosConsulta() {
    const formulario = $('form-filtros');
    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        aoMudarCriterios();
    });
    formulario.addEventListener('input', aoMudarCriterios);
    formulario.addEventListener('reset', () => setTimeout(aoMudarCriterios, 0));
    $('btn-pesquisar').addEventListener('click', aoMudarCriterios);
    $('btn-limpar-busca').addEventListener('click', () => formulario.reset());
    $('btn-aplicar-filtros').addEventListener('click', aoMudarCriterios);
}

//=========FILTRO==========

function filtrarRegistros(lista, criterios) {
    const pessoaBuscada = normalizar(criterios.pessoa);
    return lista.filter((reg) => {
        if (criterios.categoria && reg.categoria !== criterios.categoria) return false;

        if (pessoaBuscada && !reg.pessoas.some((p) => normalizar(p).includes(pessoaBuscada))) {
            return false;
        }

        if (criterios.anoInicial !== null || criterios.anoFinal !== null) {
            const { inicio, fim } = intervaloAnos(reg);
            if (inicio === null) return false;
            if (criterios.anoInicial !== null && fim < criterios.anoInicial) return false;
            if (criterios.anoFinal !== null && inicio > criterios.anoFinal) return false;
        }
        return true;
    });
}

//============ordenação=============

function ordenarRegistros(lista, ordenarPor, ordem) {
    const fator = ordem === 'desc' ? -1 : 1;
    return [...lista].sort((a, b) => {
        const comparacao =
            ordenarPor === 'data'
                ? chaveData(a).localeCompare(chaveData(b))
                : a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' });
        return comparacao * fator;
    });
}

// ============ integração apis ==============


const URL_API_COMMONS = 'https://commons.wikimedia.org/w/api.php';

/** Remove marcações HTML (a API devolve o autor com tags). */
function textoPuro(html) {
    return new DOMParser().parseFromString(html, 'text/html').body.textContent.trim();
}

/** Converte o texto da licença da API para as opções do nosso <select>. */
function mapearLicenca(texto) {
    const t = texto.toLowerCase();
    if (t.includes('public domain') || t.includes('domínio público')) return 'dominio-publico';
    if (t.includes('cc0')) return 'cc0';
    if (t.includes('cc by-sa')) return 'cc-by-sa';
    if (t.startsWith('cc by')) return 'cc-by';
    return 'outra';
}

async function buscarImagensCommons(termo) {
    const parametros = new URLSearchParams({
        action: 'query',
        format: 'json',
        origin: '*', // permite a chamada direto do navegador (CORS)
        generator: 'search',
        gsrsearch: `${termo} filetype:bitmap`,
        gsrnamespace: '6', // namespace "File"
        gsrlimit: '9',
        prop: 'imageinfo',
        iiprop: 'url|extmetadata',
        iiurlwidth: '640',
    });

    const resposta = await fetch(`${URL_API_COMMONS}?${parametros}`);
    if (!resposta.ok) throw new Error(`Resposta HTTP ${resposta.status}`);
    const dados = await resposta.json();

    const paginas = dados.query ? Object.values(dados.query.pages) : [];
    return paginas
        .sort((a, b) => a.index - b.index)
        .filter((pagina) => pagina.imageinfo && pagina.imageinfo[0])
        .map((pagina) => {
            const info = pagina.imageinfo[0];
            const meta = info.extmetadata || {};
            return {
                titulo: pagina.title.replace(/^File:/, '').replace(/\.[^.]+$/, ''),
                miniatura: info.thumburl || info.url,
                paginaOrigem: info.descriptionurl,
                autor: textoPuro((meta.Artist && meta.Artist.value) || ''),
                licenca: (meta.LicenseShortName && meta.LicenseShortName.value) || '',
            };
        });
}

function definirStatusImagens(texto) {
    $('status-imagens').textContent = texto;
}

function renderizarResultadosImagens(imagens) {
    $('resultados-imagem').replaceChildren(
        ...imagens.map((imagem) =>
            el(
                'li',
                {},
                el(
                    'figure',
                    {},
                    el('img', {
                        src: imagem.miniatura,
                        alt: `Resultado da Wikimedia Commons: ${imagem.titulo}`,
                        loading: 'lazy',
                    }),
                    el('figcaption', { texto: resumir(imagem.titulo, 60) })
                ),
                el('button', {
                    type: 'button',
                    texto: 'Usar esta imagem',
                    onclick: () => usarImagemCommons(imagem),
                })
            )
        )
    );
}

async function aoPesquisarImagem() {
    const termo = $('busca-imagem').value.trim();
    if (termo.length < 2) {
        definirStatusImagens('Digite pelo menos 2 caracteres para pesquisar imagens.');
        return;
    }

    const botao = $('btn-buscar-imagem');
    botao.disabled = true;
    $('resultados-imagem').setAttribute('aria-busy', 'true');
    definirStatusImagens('Buscando imagens na Wikimedia Commons…');

    try {
        const imagens = await buscarImagensCommons(termo);
        renderizarResultadosImagens(imagens);
        definirStatusImagens(
            imagens.length
                ? `${imagens.length} imagem(ns) encontrada(s). Confira a licença antes de usar.`
                : 'Nenhuma imagem encontrada. Tente outro termo.'
        );
    } catch (erro) {
        console.error('Falha na API da Wikimedia Commons:', erro);
        $('resultados-imagem').replaceChildren();
        definirStatusImagens('Não foi possível consultar a Wikimedia Commons. Verifique sua conexão e tente novamente.');
    } finally {
        botao.disabled = false;
        $('resultados-imagem').removeAttribute('aria-busy');
    }
}

/** Associa a imagem escolhida ao formulário de cadastro. */
function usarImagemCommons(imagem) {
    estado.imagemUpload = '';
    $('arquivo-imagem').value = '';
    estado.imagemPagina = imagem.paginaOrigem;

    $('url-imagem').value = imagem.miniatura;
    $('autor-imagem').value = imagem.autor || '';
    $('licenca-imagem').value = imagem.licenca ? mapearLicenca(imagem.licenca) : '';

    limparErroDoCampo({ target: $('url-imagem') });
    limparErroDoCampo({ target: $('autor-imagem') });
    limparErroDoCampo({ target: $('licenca-imagem') });
    atualizarPrevia();
    mostrarMensagem('info', 'Imagem selecionada. Confira o autor e a licença antes de salvar o registro.');
}

/** Atualiza a pré-visualização da imagem do formulário. */
function atualizarPrevia() {
    const campoUrl = $('url-imagem').value.trim();
    const url = estado.imagemUpload || (urlValida(campoUrl) ? campoUrl : '');
    const previa = $('previa-imagem');
    if (!url) {
        previa.hidden = true;
        return;
    }
    $('previa-img').src = url;
    $('previa-legenda').textContent = 'Imagem selecionada para este registro.';
    previa.hidden = false;
}

function aoEscolherArquivo(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
        mostrarMensagem('erro', 'Escolha um arquivo de imagem (JPG, PNG, WebP...).');
        evento.target.value = '';
        return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_UPLOAD) {
        mostrarMensagem(
            'erro',
            `A imagem tem ${Math.round(arquivo.size / 1024)} KB. O limite é ${TAMANHO_MAXIMO_UPLOAD / 1024} KB, pois os dados ficam salvos no navegador.`,
            7000
        );
        evento.target.value = '';
        return;
    }

    const leitor = new FileReader();
    leitor.addEventListener('load', () => {
        estado.imagemUpload = leitor.result;
        estado.imagemPagina = '';
        $('url-imagem').value = '';
        atualizarPrevia();
    });
    leitor.addEventListener('error', () => mostrarMensagem('erro', 'Não foi possível ler o arquivo.'));
    leitor.readAsDataURL(arquivo);
}

function removerImagem() {
    estado.imagemUpload = '';
    estado.imagemPagina = '';
    $('url-imagem').value = '';
    $('autor-imagem').value = '';
    $('licenca-imagem').value = '';
    $('arquivo-imagem').value = '';
    atualizarPrevia();
}

function registrarEventosImagem() {
    $('btn-buscar-imagem').addEventListener('click', aoPesquisarImagem);
    // Enter no campo de busca pesquisa imagens (e não envia o formulário)
    $('busca-imagem').addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            evento.preventDefault();
            aoPesquisarImagem();
        }
    });
    $('arquivo-imagem').addEventListener('change', aoEscolherArquivo);
    $('btn-remover-imagem').addEventListener('click', removerImagem);
    $('url-imagem').addEventListener('input', () => {
        // Digitar uma URL própria substitui qualquer imagem anterior
        estado.imagemUpload = '';
        estado.imagemPagina = '';
        atualizarPrevia();
    });
    $('previa-img').addEventListener('error', () => {
        $('previa-legenda').textContent = 'Não foi possível carregar a imagem deste endereço.';
    });
}


function renderizarLinhaDoTempo() {
    const ordenados = ordenarRegistros(estado.registros, 'data', 'asc');
    if (ordenados.length === 0) {
        $('linha-tempo-lista').replaceChildren(el('li', { texto: 'Nenhum registro cadastrado.' }));
        return;
    }
    $('linha-tempo-lista').replaceChildren(
        ...ordenados.map((reg) =>
            el(
                'li',
                {},
                el('time', { datetime: chaveData(reg), texto: chaveData(reg).slice(0, 4).replace(/^0+/, '') }),
                ' – ',
                el('a', {
                    href: '#detalhes',
                    dados: { acao: 'detalhes', id: reg.id },
                    texto: reg.titulo,
                })
            )
        )
    );
}

function preencherSeletorMapa() {
    const seletor = $('mapa-registro');
    const valorAtual = seletor.value;
    const comCoordenadas = estado.registros.filter(temCoordenadas);
    seletor.replaceChildren(
        el('option', { value: '', texto: 'Selecione um registro...' }),
        ...comCoordenadas.map((reg) => el('option', { value: reg.id, texto: reg.titulo }))
    );
    seletor.value = comCoordenadas.some((reg) => reg.id === valorAtual) ? valorAtual : '';
}

/** Mostra o mapa (OpenStreetMap) do registro, se ele tiver coordenadas. */
function atualizarMapa(id) {
    const quadro = $('mapa-quadro');
    const link = $('mapa-link');
    const reg = estado.registros.find((r) => r.id === id);
    $('mapa-registro').value = reg && temCoordenadas(reg) ? id : '';

    if (!reg || !temCoordenadas(reg)) {
        quadro.replaceChildren(
            el('p', {
                classe: 'estado-vazio',
                texto: reg
                    ? 'Este registro não possui coordenadas cadastradas.'
                    : 'Selecione um registro com coordenadas para ver o mapa.',
            })
        );
        link.hidden = true;
        return;
    }

    const { latitude: lat, longitude: lng } = reg;
    const margem = 0.01;
    const origem =
        'https://www.openstreetmap.org/export/embed.html' +
        `?bbox=${lng - margem}%2C${lat - margem}%2C${lng + margem}%2C${lat + margem}` +
        `&layer=mapnik&marker=${lat}%2C${lng}`;
    quadro.replaceChildren(
        el('iframe', { src: origem, title: `Mapa: ${reg.local || reg.titulo}`, loading: 'lazy' })
    );
    link.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
    link.hidden = false;
}

/** API Nominatim (OpenStreetMap): converte o nome do local em latitude/longitude. */
async function buscarCoordenadas() {
    const local = $('local').value.trim();
    if (local.length < 3) {
        mostrarMensagem('aviso', 'Informe o local (mínimo 3 caracteres) antes de buscar as coordenadas.');
        $('local').focus();
        return;
    }

    const botao = $('btn-geocodificar');
    botao.disabled = true;
    botao.textContent = 'Buscando…';

    try {
        const parametros = new URLSearchParams({
            q: local,
            format: 'json',
            limit: '1',
            'accept-language': 'pt-BR',
        });
        const resposta = await fetch(`https://nominatim.openstreetmap.org/search?${parametros}`);
        if (!resposta.ok) throw new Error(`Resposta HTTP ${resposta.status}`);
        const resultados = await resposta.json();

        if (resultados.length === 0) {
            mostrarMensagem('aviso', 'Nenhuma coordenada encontrada para este local. Informe manualmente, se desejar.');
            return;
        }
        $('latitude').value = Number(resultados[0].lat).toFixed(5);
        $('longitude').value = Number(resultados[0].lon).toFixed(5);
        limparErroDoCampo({ target: $('latitude') });
        limparErroDoCampo({ target: $('longitude') });
        mostrarMensagem('sucesso', `Coordenadas encontradas para: ${resumir(resultados[0].display_name, 70)}`);
    } catch (erro) {
        console.error('Falha na API Nominatim:', erro);
        mostrarMensagem('erro', 'Não foi possível buscar as coordenadas agora. Tente novamente mais tarde.');
    } finally {
        botao.disabled = false;
        botao.textContent = 'Buscar coordenadas';
    }
}

function registrarEventosMapa() {
    $('btn-geocodificar').addEventListener('click', buscarCoordenadas);
    $('mapa-registro').addEventListener('change', (evento) => atualizarMapa(evento.target.value));
}

// ========== comentários ================

function criarMensagem(mensagem, aoExcluir) {
    return el(
        'article',
        { classe: 'comentario' },
        el(
            'header',
            {},
            el(
                'p',
                {},
                el('strong', { texto: mensagem.autor }),
                ' · ',
                el('time', { datetime: mensagem.data, texto: formatarDataHora(mensagem.data) })
            ),
            el('button', {
                type: 'button',
                classe: 'botao--pequeno botao--perigo',
                'aria-label': `Excluir mensagem de ${mensagem.autor}`,
                texto: 'Excluir',
                onclick: aoExcluir,
            })
        ),
        el('p', { texto: mensagem.texto })
    );
}

function validarMensagem(idAutor, idTexto, autor, texto, minimoTexto = 5) {
    const erros = {};
    if (autor.length < 2) erros[idAutor] = 'Informe seu nome (mínimo 2 caracteres).';
    if (texto.length < minimoTexto) erros[idTexto] = `Escreva pelo menos ${minimoTexto} caracteres.`;
    return erros;
}

function renderizarComentarios(reg) {
    $('lista-comentarios').replaceChildren(
        ...(reg.comentarios.length
            ? reg.comentarios.map((comentario) =>
                criarMensagem(comentario, () => excluirComentario(reg.id, comentario.id))
            )
            : [el('p', { texto: 'Ainda não há comentários neste registro.' })])
    );
}

function aoEnviarComentario(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    limparErros(formulario);

    const autor = $('comentario-nome').value.trim();
    const texto = $('comentario-texto').value.trim();
    const erros = validarMensagem('comentario-nome', 'comentario-texto', autor, texto);
    if (Object.keys(erros).length > 0) {
        exibirErros(erros);
        return;
    }

    const id = estado.idSelecionado;
    const comentario = { id: gerarId('c'), autor, texto, data: new Date().toISOString() };
    if (!atualizarRegistro(id, (r) => ({ ...r, comentarios: [...r.comentarios, comentario] }))) return;

    formulario.reset();
    renderizarComentarios(estado.registros.find((r) => r.id === id));
    mostrarMensagem('sucesso', 'Comentário publicado!');
}

function excluirComentario(idRegistro, idComentario) {
    if (!confirm('Excluir este comentário?')) return;
    const alterou = atualizarRegistro(idRegistro, (r) => ({
        ...r,
        comentarios: r.comentarios.filter((c) => c.id !== idComentario),
    }));
    if (alterou) renderizarComentarios(estado.registros.find((r) => r.id === idRegistro));
}

function registrarEventosComentarios() {
    const formulario = $('form-comentario');
    formulario.addEventListener('submit', aoEnviarComentario);
    formulario.addEventListener('input', limparErroDoCampo);
}

// =========== fórum ============

function ultimaAtividade(topico) {
    const ultima = topico.respostas[topico.respostas.length - 1];
    return ultima ? ultima.data : topico.criadoEm;
}

function criarFormularioResposta(topico) {
    const idAutor = `resp-autor-${topico.id}`;
    const idTexto = `resp-texto-${topico.id}`;
    const formulario = el(
        'form',
        { novalidate: true, onsubmit: (evento) => aoEnviarResposta(evento, topico.id, idAutor, idTexto) },
        el(
            'fieldset',
            { classe: 'campos' },
            el('legend', { texto: 'Responder' }),
            el(
                'div',
                { classe: 'campo' },
                el('label', { for: idAutor, texto: 'Seu nome' }),
                el('input', { type: 'text', id: idAutor, autocomplete: 'name' })
            ),
            el(
                'div',
                { classe: 'campo campo--largo' },
                el('label', { for: idTexto, texto: 'Resposta' }),
                el('textarea', { id: idTexto, rows: '3' })
            ),
            el('div', { classe: 'campo--largo' }, el('button', { type: 'submit', texto: 'Enviar resposta' }))
        )
    );
    formulario.addEventListener('input', limparErroDoCampo);
    return formulario;
}

function criarTopico(topico, aberto) {
    const quantidade = topico.respostas.length;
    const meta =
        `por ${topico.autor} · ${quantidade} ${quantidade === 1 ? 'resposta' : 'respostas'}` +
        ` · última atividade em ${formatarDataHora(ultimaAtividade(topico))}`;

    return el(
        'details',
        { classe: 'topico-forum', dados: { id: topico.id }, open: aberto ? true : null },
        el('summary', {}, topico.assunto, el('span', { classe: 'topico-forum__meta', texto: meta })),
        el(
            'div',
            { classe: 'topico-forum__corpo' },
            el('p', { texto: topico.mensagem }),
            el(
                'div',
                { classe: 'topico-forum__respostas' },
                ...topico.respostas.map((resposta) =>
                    criarMensagem(resposta, () => excluirResposta(topico.id, resposta.id))
                )
            ),
            criarFormularioResposta(topico)
        )
    );
}

function renderizarForum() {
    const lista = $('lista-forum');
    const abertos = new Set([...lista.querySelectorAll('details[open]')].map((d) => d.dataset.id));
    const ordenados = [...estado.forum].sort((a, b) =>
        ultimaAtividade(b).localeCompare(ultimaAtividade(a))
    );

    lista.replaceChildren(
        ...(ordenados.length
            ? ordenados.map((topico) => criarTopico(topico, abertos.has(topico.id)))
            : [el('p', { classe: 'estado-vazio', texto: 'Nenhum tópico criado ainda. Seja o primeiro a participar!' })])
    );
}

function aoEnviarTopico(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    limparErros(formulario);

    const autor = $('forum-autor').value.trim();
    const assunto = $('forum-assunto').value.trim();
    const mensagem = $('forum-mensagem').value.trim();

    const erros = validarMensagem('forum-autor', 'forum-mensagem', autor, mensagem, 10);
    if (assunto.length < 5) erros['forum-assunto'] = 'O assunto deve ter pelo menos 5 caracteres.';
    if (Object.keys(erros).length > 0) {
        exibirErros(erros);
        return;
    }

    const topico = {
        id: gerarId('t'),
        assunto,
        autor,
        mensagem,
        criadoEm: new Date().toISOString(),
        respostas: [],
    };
    if (!aplicarAlteracaoForum([...estado.forum, topico])) return;

    formulario.reset();
    renderizarForum();
    mostrarMensagem('sucesso', 'Tópico publicado!');
}

function aoEnviarResposta(evento, idTopico, idAutor, idTexto) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    limparErros(formulario);

    const autor = $(idAutor).value.trim();
    const texto = $(idTexto).value.trim();
    const erros = validarMensagem(idAutor, idTexto, autor, texto);
    if (Object.keys(erros).length > 0) {
        exibirErros(erros);
        return;
    }

    const resposta = { id: gerarId('p'), autor, texto, data: new Date().toISOString() };
    const lista = estado.forum.map((t) =>
        t.id === idTopico ? { ...t, respostas: [...t.respostas, resposta] } : t
    );
    if (!aplicarAlteracaoForum(lista)) return;

    renderizarForum();
    mostrarMensagem('sucesso', 'Resposta publicada!');
}

function excluirResposta(idTopico, idResposta) {
    if (!confirm('Excluir esta resposta?')) return;
    const lista = estado.forum.map((t) =>
        t.id === idTopico ? { ...t, respostas: t.respostas.filter((r) => r.id !== idResposta) } : t
    );
    if (aplicarAlteracaoForum(lista)) renderizarForum();
}

function carregarForum() {
    const dados = lerJSON(CHAVE_FORUM, null);
    if (dados === null) return JSON.parse(JSON.stringify(FORUM_EXEMPLO));
    return Array.isArray(dados) ? dados : [];
}

const aplicarAlteracaoForum = (novaLista) => persistir('forum', CHAVE_FORUM, novaLista);

function registrarEventosForum() {
    const formulario = $('form-forum');
    formulario.addEventListener('submit', aoEnviarTopico);
    formulario.addEventListener('input', limparErroDoCampo);
}

// ============== inicialização ==============


function atualizarTudo() {
    renderizarListagem();
    renderizarLinhaDoTempo();
    preencherSeletorMapa();
}

function iniciar() {
    const primeiraVez = lerJSON(CHAVE_REGISTROS, null) === null;
    estado.registros = carregarRegistros();
    if (primeiraVez) gravarJSON(CHAVE_REGISTROS, estado.registros);

    registrarEventosListagem();
    registrarEventosFormulario();
    atualizarCamposData();

    registrarEventosExclusao();
    registrarEventosConsulta();
    registrarEventosImagem();
    registrarEventosMapa();
    registrarEventosComentarios();

    atualizarMapa(null);
    atualizarTudo();

    const primeiraVezForum = lerJSON(CHAVE_FORUM, null) === null;
    estado.forum = carregarForum();
    if (primeiraVezForum) gravarJSON(CHAVE_FORUM, estado.forum);

    registrarEventosForum();
    renderizarForum();
}

iniciar();