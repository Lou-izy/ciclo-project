import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  CircleAlert,
  CircleDashed,
  Clock3,
  ClipboardList,
  CloudOff,
  Download,
  FileDown,
  Home as HomeIcon,
  Leaf,
  Link2,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  PackageCheck,
  Plus,
  RefreshCw,
  ScanLine,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  WalletCards,
  Wifi,
  X,
} from "lucide-react";

type Mode = "depositador" | "coletor";
type DepTab = "dashboard" | "perfil";
type CollectorTab = "registro" | "historico" | "perfil";

type Toast = { title: string; detail: string } | null;

const stages = [
  { label: "Não coletado", note: "Aguardando rota", icon: CircleDashed },
  { label: "Coletado", note: "Em triagem", icon: PackageCheck },
  { label: "Em análise", note: "Peso e fraude", icon: CircleAlert },
  { label: "Verificado", note: "Saldo liberado", icon: Check },
];

const movements = [
  { date: "06 set 2026", time: "14:32", title: "Recebimento · etiqueta #04821", amount: "+ R$ 18,40", positive: true },
  { date: "02 set 2026", time: "09:15", title: "Recebimento · etiqueta #04792", amount: "+ R$ 12,80", positive: true },
  { date: "29 ago 2026", time: "18:06", title: "Saque via PIX", amount: "− R$ 24,00", positive: false },
  { date: "27 ago 2026", time: "11:48", title: "Recebimento · etiqueta #04670", amount: "+ R$ 21,60", positive: true },
];

const collectionHistory = [
  { id: "#04821", material: "PAP", weight: "3,80 kg", status: "Sincronizado", time: "14:32", date: "07/09/2026" },
  { id: "#04820", material: "MET", weight: "1,20 kg", status: "Sincronizado", time: "14:18", date: "07/09/2026" },
  { id: "#04819", material: "PLA", weight: "2,45 kg", status: "Pendente offline", time: "13:57", date: "07/09/2026" },
  { id: "#04818", material: "PAP", weight: "4,10 kg", status: "Sincronizado", time: "13:34", date: "07/09/2026" },
  { id: "#04792", material: "MET", weight: "2,10 kg", status: "Sincronizado", time: "16:05", date: "06/09/2026" },
  { id: "#04781", material: "PLA", weight: "1,70 kg", status: "Sincronizado", time: "11:24", date: "05/09/2026" },
];

function Logo() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark"><Leaf size={18} strokeWidth={2.8} /></div>
      <div><strong>ciclo</strong><span>rastreio</span></div>
    </div>
  );
}

function TopBar({ mode, onMode, onToast, menuOpen, onMenu }: { mode: Mode; onMode: (mode: Mode) => void; onToast: (toast: NonNullable<Toast>) => void; menuOpen: boolean; onMenu: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="sidebar-toggle" onClick={onMenu} aria-label={menuOpen ? "Recolher menu lateral" : "Abrir menu lateral"} aria-expanded={menuOpen}><Menu size={18} /><span>Menu</span></button>
        <Logo />
        <div className="topbar-actions">
          <button className="connection-pill" onClick={() => onToast({ title: "Modo offline ativo", detail: "Registros serão sincronizados ao reconectar." })}>
            <span className="status-dot" /> <span>Operação online</span>
          </button>
          <button className="icon-button" aria-label="Notificações" onClick={() => onToast({ title: "Tudo em dia", detail: "Nenhuma nova notificação." })}><Bell size={19} /></button>
          <button className="avatar" onClick={() => setOpen(!open)} aria-label="Abrir menu da conta">MC</button>
          {open && <div className="account-menu"><strong>Marina Costa</strong><span>Conta verificada</span><button onClick={() => onToast({ title: "Sessão encerrada", detail: "Até a próxima, Marina." })}><LogOut size={15} /> Sair</button></div>}
        </div>
      </div>
      <div className="mode-switch-wrap">
        <div className="mode-switch">
          <button className={mode === "depositador" ? "active" : ""} onClick={() => onMode("depositador")}><UserRound size={16} /> Depositador</button>
          <button className={mode === "coletor" ? "active" : ""} onClick={() => onMode("coletor")}><ScanLine size={16} /> Coletor</button>
        </div>
        <span className="prototype-label">protótipo de alta fidelidade</span>
      </div>
    </header>
  );
}

function SideRail({ mode, depTab, setDepTab, collectorTab, setCollectorTab, onToast }: { mode: Mode; depTab: DepTab; setDepTab: (tab: DepTab) => void; collectorTab: CollectorTab; setCollectorTab: (tab: CollectorTab) => void; onToast: (toast: NonNullable<Toast>) => void }) {
  const items = mode === "depositador" ? [
    { id: "dashboard", label: "Visão geral", icon: HomeIcon },
    { id: "perfil", label: "Perfil e segurança", icon: UserRound },
  ] : [
    { id: "registro", label: "Registrar coleta", icon: ClipboardList },
    { id: "historico", label: "Histórico diário", icon: BarChart3 },
    { id: "perfil", label: "Meu perfil", icon: UserRound },
  ];
  const current = mode === "depositador" ? depTab : collectorTab;
  const select = mode === "depositador" ? setDepTab : setCollectorTab;
  return <aside className="side-rail">
    <div className="rail-context"><span className="eyebrow">APLICATIVO ATIVO</span><strong>{mode === "depositador" ? "Minha jornada" : "Operação de rua"}</strong><span className="context-line">{mode === "depositador" ? "Acompanhe cada sacola." : "Registre sem perder dados."}</span></div>
    <nav className="rail-nav">{items.map((item) => { const Icon = item.icon; return <button key={item.id} className={current === item.id ? "active" : ""} onClick={() => select(item.id as never)}><Icon size={18} /><span>{item.label}</span><ChevronRight size={15} className="nav-chevron" /></button>; })}</nav>
    <div className="rail-bottom"><div className="help-box"><ShieldCheck size={19} /><div><strong>Rastreio protegido</strong><span>Seus dados são criptografados.</span></div></div><button className="rail-link" onClick={() => onToast({ title: "Central de ajuda", detail: "A equipe Ciclo responderá em breve." })}><Settings2 size={16} /> Central de ajuda</button></div>
  </aside>;
}

function PageHeader({ overline, title, description, action }: { overline: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-header"><div><span className="eyebrow">{overline}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function StatusTrack() {
  return <div className="status-track">{stages.map((stage, i) => { const Icon = stage.icon; const done = i < 2; const current = i === 2; return <div className={`stage ${done ? "done" : ""} ${current ? "current" : ""}`} key={stage.label}><div className="stage-line"><div className="stage-icon"><Icon size={16} /></div>{i < stages.length - 1 && <div className={`stage-connector ${done ? "filled" : ""}`} />}</div><strong>{stage.label}</strong><span>{stage.note}</span></div>; })}</div>;
}

function DepositadorDashboard({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  const [showLedger, setShowLedger] = useState(false);
  const [showCollectionHistory, setShowCollectionHistory] = useState(false);
  const [showStickerRequest, setShowStickerRequest] = useState(false);
  const [stickerQuantity, setStickerQuantity] = useState("2");
  return <>
    <PageHeader overline="SEGUNDA-FEIRA · 07 SET 2026" title="Olá, Marina" description="Acompanhe o caminho dos seus materiais e o valor gerado por cada entrega." action={<button className="fixed-label request-label" onClick={() => setShowStickerRequest(true)}><Plus size={15} /> Solicitar novas cartelas</button>} />
    <div className="metric-grid">
      <section className="balance-card"><div className="card-topline"><span className="eyebrow light">SALDO DISPONÍVEL</span><WalletCards size={19} /></div><div className="balance-value">R$ 86<span>,40</span></div><div className="balance-footer"><span>+ R$ 52,80 este mês</span><button onClick={() => onToast({ title: "Saque solicitado", detail: "O fluxo PIX está disponível no perfil." })}>Sacar saldo <ArrowUpRight size={15} /></button></div></section>
      <section className="white-card collection-card"><div className="card-heading"><div><span className="eyebrow">Último depósito realizado</span><h2>Etiqueta <span className="mono">#04821</span></h2></div><span className="status-badge dark">Em análise</span></div><p className="muted-copy">Sua sacola foi pesada pela equipe e aguarda a verificação final.</p><StatusTrack /><div className="lock-note"><LockKeyhole size={16} /><span><strong>Saldo bloqueado durante a análise.</strong> Isso protege você contra divergências e fraudes.</span></div><button className="history-cta" onClick={() => setShowCollectionHistory(true)}><ClipboardList size={16} /> Ver todo o histórico de coleta <ChevronRight size={15} /></button></section>
    </div>
    <div className="content-grid">
      <section className="white-card map-card"><div className="section-heading"><div><span className="eyebrow">PONTOS DE DESCARTE</span><h2>Onde entregar</h2></div><button className="text-button" onClick={() => onToast({ title: "Mapa em breve", detail: "A visualização completa será aberta em uma nova etapa." })}>Ver mapa <ChevronRight size={15} /></button></div><div className="map-visual"><div className="map-grid" /><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><div className="map-pin pin-1"><MapPin size={17} /></div><div className="map-pin pin-2"><MapPin size={17} /></div><div className="map-pin pin-3"><MapPin size={17} /></div><div className="map-label"><strong>2 pontos próximos</strong><span>Aberto agora · até 19h</span></div></div><div className="map-schedule"><div><span className="schedule-icon"><MapPin size={16} /></span><div><strong>Praça das Artes</strong><span>Seg–sáb · 08:00–19:00</span></div></div><div><span className="schedule-icon"><MapPin size={16} /></span><div><strong>Mercado Central</strong><span>Seg–dom · 07:00–21:00</span></div></div></div><div className="holiday-alert"><CircleAlert size={16} /><span><strong>Feriado em 07/09:</strong> o ponto Praça das Artes fecha às 13h.</span></div></section>
      <section className="white-card ledger-card"><div className="section-heading"><div><span className="eyebrow">MOVIMENTAÇÕES</span><h2>Extrato recente</h2></div><button className="icon-button subtle" onClick={() => setShowLedger(!showLedger)}><SlidersHorizontal size={17} /></button></div><div className="account-summary"><div><span>Titular</span><strong>Marina Costa</strong></div><div><span>PIX cadastrado</span><strong>•••• 9021</strong></div></div><div className="ledger-balance"><span>Saldo final em 06 set</span><strong>R$ 86,40</strong></div><div className="movement-list">{(showLedger ? [...movements, { date: "22 ago 2026", time: "10:20", title: "Recebimento · etiqueta #04611", amount: "+ R$ 16,20", positive: true }] : movements).map((movement) => <div className="movement" key={movement.date + movement.time}><span className={`movement-icon ${movement.positive ? "in" : "out"}`}>{movement.positive ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><div><strong>{movement.title}</strong><span>{movement.date} · {movement.time}</span></div><b className={movement.positive ? "positive" : "negative"}>{movement.amount}</b></div>)}</div><button className="full-width-button" onClick={() => setShowLedger(!showLedger)}>{showLedger ? "Mostrar menos" : "Ver extrato completo"} <ChevronRight size={15} /></button></section>
    </div>{showStickerRequest && <div className="history-overlay" role="dialog" aria-modal="true" aria-label="Solicitar cartelas de adesivos"><div className="history-modal sticker-request-modal"><div className="modal-heading"><div><span className="eyebrow">REPOSIÇÃO DE ADESIVOS</span><h2>Solicitar novas cartelas</h2><p>Escolha a quantidade e veja quando poderá retirar no ponto de atendimento.</p></div><button className="icon-button subtle" onClick={() => setShowStickerRequest(false)} aria-label="Fechar solicitação"><X size={17} /></button></div><div className="sticker-form"><label htmlFor="sticker-quantity">Quantidade de cartelas<select id="sticker-quantity" value={stickerQuantity} onChange={(e) => setStickerQuantity(e.target.value)}><option value="1">1 cartela</option><option value="2">2 cartelas</option><option value="3">3 cartelas</option><option value="5">5 cartelas</option></select></label><div className="pickup-estimate"><Clock3 size={18} /><div><span className="eyebrow">ESTIMATIVA DE RETIRADA</span><strong>A partir de 10 de setembro</strong><p>Você poderá buscar no ponto Praça das Artes, de segunda a sábado, das 08:00 às 19:00.</p></div></div></div><button className="dark-button modal-close" onClick={() => { setShowStickerRequest(false); onToast({ title: "Solicitação enviada", detail: `${stickerQuantity} ${stickerQuantity === "1" ? "cartela" : "cartelas"} reservadas para retirada a partir de 10 de setembro.` }); }}>Solicitar cartelas</button></div></div>}{showCollectionHistory && <div className="history-overlay" role="dialog" aria-modal="true" aria-label="Histórico de coleta"><div className="history-modal"><div className="modal-heading"><div><span className="eyebrow">RASTREIO COMPLETO</span><h2>Histórico de coleta</h2><p>Acompanhe cada etiqueta seguindo o passo a passo de verificação.</p></div><button className="icon-button subtle" onClick={() => setShowCollectionHistory(false)} aria-label="Fechar histórico"><X size={17} /></button></div><div className="collection-history-list"><div className="collection-history-item active"><div className="history-item-top"><div><span className="eyebrow">ETIQUETA ATUAL</span><strong className="history-code">#04821</strong></div><span className="status-badge dark">Em análise</span></div><StatusTrack /><p>Coletado em 06 set 2026 · 3,80 kg · PAP</p></div><div className="collection-history-item"><div className="history-item-top"><div><span className="eyebrow">VERIFICADA</span><strong className="history-code">#04792</strong></div><span className="status-badge light-badge">Verificado</span></div><StatusTrack /><p>Coletado em 02 set 2026 · 2,40 kg · MET</p></div><div className="collection-history-item"><div className="history-item-top"><div><span className="eyebrow">AGUARDANDO COLETA</span><strong className="history-code">#04780</strong></div><span className="status-badge light-badge">Não coletado</span></div><StatusTrack /><p>Cartela vinculada · ainda não entregue</p></div></div><button className="dark-button modal-close" onClick={() => setShowCollectionHistory(false)}>Fechar histórico</button></div></div>}
  </>;
}

function Profile({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  return <><PageHeader overline="CONTA E PRIVACIDADE" title="Perfil e segurança" description="Mantenha seus dados atualizados para receber pagamentos e acompanhar seus direitos." action={<button className="dark-button" onClick={() => onToast({ title: "Alterações salvas", detail: "Seu perfil foi atualizado com segurança." })}><Check size={17} /> Salvar alterações</button>} /><div className="profile-grid"><section className="white-card profile-card"><div className="profile-intro"><div className="large-avatar profile-photo" aria-label="Foto de Marina Costa">MC</div><div><h2>Marina Costa</h2><p>marina.costa@email.com</p><span className="verified"><ShieldCheck size={14} /> Conta verificada pelo Google</span></div></div><div className="form-section"><span className="eyebrow">DADOS PESSOAIS</span><div className="form-grid"><label>Nome completo<input value="Marina Costa" readOnly /></label><label>E-mail<input value="marina.costa@email.com" readOnly /></label><label>Estado<input value="São Paulo" readOnly /></label><label>Cidade<input value="São Paulo" readOnly /></label></div><button className="outline-button edit-profile-button" onClick={() => onToast({ title: "Edição de perfil", detail: "Campos pessoais liberados para alteração." })}><UserRound size={14} /> Editar perfil</button></div><div className="form-section"><span className="eyebrow">PAGAMENTO</span><div className="payment-row"><div className="bank-icon">PIX</div><div><strong>Chave PIX · CPF</strong><span>***.***.***-90 · Banco Inter</span></div><button className="outline-button" onClick={() => onToast({ title: "Edição de pagamento", detail: "Formulário de alteração aberto." })}>Gerenciar</button></div></div></section><aside className="profile-side"><section className="white-card consent-card"><span className="eyebrow">CONSENTIMENTOS</span><h2>Transparência por padrão.</h2><p>Você controla como seus dados de coleta e pagamento são utilizados.</p><label className="toggle-row"><span><strong>Compartilhar dados de impacto</strong><small>Ajuda a comprovar o impacto da reciclagem.</small></span><span className="fake-toggle on"><span /></span></label><label className="toggle-row"><span><strong>Atualizações por e-mail</strong><small>Receba alertas sobre cada verificação.</small></span><span className="fake-toggle on"><span /></span></label><button className="legal-link" onClick={() => onToast({ title: "Termos de uso", detail: "Documento aberto para leitura." })}>Ler termos de uso <ChevronRight size={15} /></button></section><section className="security-callout"><LockKeyhole size={18} /><div><strong>Seus dados estão protegidos</strong><span>Criptografia em trânsito e em repouso.</span></div></section></aside></div></>;
}

function CollectorRegister({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  const [material, setMaterial] = useState("PAP");
  const [code, setCode] = useState("04822");
  const [weight, setWeight] = useState("3,80");
  const [offline, setOffline] = useState(false);
  return <><PageHeader overline="ROTA 04 · 07 SET 2026" title="Registrar coleta" description="Registre o material no local. O app salva tudo mesmo sem conexão." action={<div className={`offline-badge ${offline ? "is-offline" : ""}`}><span className="status-dot" /> {offline ? "Offline · fila local" : "Conectado"}</div>} /><div className="collector-grid"><section className="white-card register-card"><div className="register-top"><div><span className="eyebrow">NOVA COLETA</span><h2>Identifique a sacola</h2></div></div><div className="big-form"><label><span>1 · Código numérico da etiqueta</span><div className="input-with-icon"><Link2 size={18} /><input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" /></div><small>Use a etiqueta pré-impressa colada na sacola.</small></label><label><span>2 · Tipo de material</span><div className="toggle-group">{["PAP", "MET", "PLA"].map((item) => <button key={item} className={material === item ? "selected" : ""} onClick={() => setMaterial(item)}>{item}<small>{item === "PAP" ? "papel" : item === "MET" ? "metal" : "plástico"}</small></button>)}</div></label><label><span>3 · Peso aferido</span><div className="weight-input"><input value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9,.]/g, "").replace(".", ","))} inputMode="decimal" /><strong>kg</strong></div><small>Você pode usar ponto ou vírgula. Ex.: 3,80 kg</small></label><button className="submit-collection" onClick={() => onToast({ title: `Coleta #${code || "00000"} registrada`, detail: `${weight || "0"} kg de ${material} · ${offline ? "salva na fila offline" : "sincronizada com o servidor"}.` })}><Check size={19} /> Registrar material</button><button className="unlinked-button" onClick={() => onToast({ title: "Material sem vínculo salvo", detail: "Peso incluído nas estatísticas, sem crédito para usuário." })}><CircleAlert size={17} /> Registrar material sem vínculo</button></div></section><aside className="collector-side"><section className="white-card route-map-card"><div className="section-heading"><div><span className="eyebrow">TRAJETO ATUALIZADO</span><h2>Rota de coleta</h2></div><RefreshCw size={17} /></div><div className="route-map-visual"><div className="route-grid" /><div className="route-line" /><div className="route-stop stop-a"><span>1</span></div><div className="route-stop stop-b"><span>2</span></div><div className="route-stop stop-c"><span>3</span></div><div className="route-current"><MapPin size={15} /></div><div className="route-map-caption"><strong>Praça das Artes</strong><span>Próxima parada · 650 m</span></div></div></section><section className="white-card sync-card"><div className="section-heading"><div><span className="eyebrow">MODO OFFLINE</span><h2>Fila local</h2></div><Wifi size={18} /></div><div className="sync-number">03 <span>coletas aguardando envio</span></div><p>Os registros ficam seguros neste dispositivo e são enviados em lote assim que a conexão retornar.</p><button className="outline-button full" onClick={() => { setOffline(!offline); onToast({ title: offline ? "Conexão restaurada" : "Modo offline ativado", detail: offline ? "3 registros sincronizados." : "Novos registros serão salvos localmente." }); }}><RefreshCw size={15} /> {offline ? "Simular reconexão" : "Testar modo offline"}</button></section><section className="route-note"><MapPin size={18} /><div><strong>Ponto atual</strong><span>Praça das Artes · Setor B</span><small>Última sincronização: agora</small></div></section></aside></div></>;
}

function CollectorHistory({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  const [dateFilter, setDateFilter] = useState("todos");
  const [materialFilter, setMaterialFilter] = useState("todos");
  const filteredHistory = collectionHistory.filter((row) => (dateFilter === "todos" || row.date === dateFilter) && (materialFilter === "todos" || row.material === materialFilter));
  return <><PageHeader overline="HISTÓRICO DA OPERAÇÃO" title="Resumo diário" description="Acompanhe as coletas da rota e exporte o fechamento para a equipe." action={<div className="export-actions"><button className="outline-button" onClick={() => onToast({ title: "Planilha gerada", detail: "O arquivo CSV está pronto para download." })}><Download size={16} /> Planilha</button><button className="dark-button" onClick={() => onToast({ title: "PDF gerado", detail: "O resumo diário foi preparado." })}><FileDown size={16} /> Exportar PDF</button></div>} /><div className="collector-metrics"><div className="white-card small-metric"><span className="eyebrow">SACOLAS HOJE</span><strong>28</strong><span className="metric-change">+ 12% vs. ontem</span></div><div className="white-card small-metric"><span className="eyebrow">PESO TOTAL</span><strong>86,4 <em>kg</em></strong><span className="metric-change">4 materiais</span></div><div className="white-card small-metric"><span className="eyebrow">SEM VÍNCULO</span><strong>03</strong><span className="metric-change">Apenas estatístico</span></div></div><section className="white-card history-card"><div className="section-heading"><div><span className="eyebrow">HISTÓRICO COMPLETO · TABELAS PREENCHIDAS</span><h2>Coletas registradas</h2></div><button className="icon-button subtle" onClick={() => onToast({ title: "Filtros aplicados", detail: `${filteredHistory.length} registros encontrados.` })}><SlidersHorizontal size={17} /></button></div><div className="history-filters"><label>Data<select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}><option value="todos">Todos os dias</option><option value="07/09/2026">07 set 2026</option><option value="06/09/2026">06 set 2026</option><option value="05/09/2026">05 set 2026</option></select></label><label>Material<select value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)}><option value="todos">Todos os materiais</option><option value="PAP">PAP · papel</option><option value="MET">MET · metal</option><option value="PLA">PLA · plástico</option></select></label><span className="filter-result">{filteredHistory.length} registros</span></div><div className="history-table"><div className="history-head"><span>ETIQUETA</span><span>MATERIAL</span><span>PESO</span><span>STATUS</span><span>HORA</span></div>{filteredHistory.map((row) => <div className="history-row" key={row.id}><strong className="mono">{row.id}</strong><span className="material-chip">{row.material}</span><strong>{row.weight}</strong><span className={`row-status ${row.status.includes("Pendente") ? "pending" : ""}`}>{row.status}</span><span className="muted">{row.time}</span></div>)}</div><div className="table-footer"><span>Histórico pesquisável por data e material</span><button className="text-button" onClick={() => { setDateFilter("todos"); setMaterialFilter("todos"); }}>Limpar filtros <X size={14} /></button></div></section></>;
}

function CollectorProfile({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  return <><PageHeader overline="CONTA DA OPERAÇÃO" title="Meu perfil" description="Dados do coletor, rota atribuída e acesso ao histórico operacional." action={<button className="dark-button" onClick={() => onToast({ title: "Perfil atualizado", detail: "Suas informações foram salvas." })}><Check size={17} /> Salvar alterações</button>} /><div className="collector-profile-grid"><section className="white-card collector-profile-card"><div className="profile-intro"><div className="large-avatar profile-photo">RC</div><div><h2>Rafael Costa</h2><p>rafael.costa@ciclo.eco</p><span className="verified"><ShieldCheck size={14} /> Operador verificado</span></div></div><div className="form-section"><span className="eyebrow">DADOS DO OPERADOR</span><div className="form-grid"><label>Nome completo<input value="Rafael Costa" readOnly /></label><label>E-mail<input value="rafael.costa@ciclo.eco" readOnly /></label><label>Rota atual<input value="Rota 04 · Centro" readOnly /></label><label>Turno<input value="07:00–16:00" readOnly /></label></div><button className="outline-button edit-profile-button" onClick={() => onToast({ title: "Edição de perfil", detail: "Solicitação enviada ao administrador." })}><UserRound size={14} /> Editar perfil</button></div></section><aside className="profile-side"><section className="white-card consent-card"><span className="eyebrow">ATALHOS OPERACIONAIS</span><h2>Histórico completo.</h2><p>Acesse todas as tabelas preenchidas em dias anteriores, com filtros por data e material.</p><button className="dark-button full" onClick={() => onToast({ title: "Abra Histórico diário", detail: "Use os filtros para localizar qualquer coleta." })}><BarChart3 size={16} /> Ver histórico de coletas</button></section><section className="security-callout"><CloudOff size={18} /><div><strong>Modo offline ativo</strong><span>Os registros são protegidos até a sincronização.</span></div></section></aside></div></>;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("depositador");
  const [depTab, setDepTab] = useState<DepTab>("dashboard");
  const [collectorTab, setCollectorTab] = useState<CollectorTab>("registro");
  const [toast, setToast] = useState<Toast>(null);
  const [menuOpen, setMenuOpen] = useState(() => typeof window === "undefined" ? true : window.innerWidth > 720);
  const [isSwitching, setIsSwitching] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const syncMenu = () => setMenuOpen(!media.matches);
    syncMenu();
    media.addEventListener("change", syncMenu);
    return () => media.removeEventListener("change", syncMenu);
  }, []);
  const notify = (next: NonNullable<Toast>) => { setToast(next); window.setTimeout(() => setToast(null), 3500); };
  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setIsSwitching(true);
    setMode(next);
    setMenuOpen(window.innerWidth > 720);
    window.setTimeout(() => setIsSwitching(false), 260);
  };
  const page = useMemo(() => mode === "depositador" ? (depTab === "dashboard" ? <DepositadorDashboard onToast={notify} /> : <Profile onToast={notify} />) : (collectorTab === "registro" ? <CollectorRegister onToast={notify} /> : collectorTab === "historico" ? <CollectorHistory onToast={notify} /> : <CollectorProfile onToast={notify} />), [mode, depTab, collectorTab]);
  return <div className={`app-shell ${mode}`}><TopBar mode={mode} onMode={switchMode} onToast={notify} menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} /><div className={`app-layout ${menuOpen ? "menu-open" : "menu-closed"}`}><SideRail mode={mode} depTab={depTab} setDepTab={(tab) => { setDepTab(tab); setMenuOpen(window.innerWidth > 720); }} collectorTab={collectorTab} setCollectorTab={(tab) => { setCollectorTab(tab); setMenuOpen(window.innerWidth > 720); }} onToast={notify} /><main className={`main-content ${isSwitching ? "is-switching" : ""}`}>{page}</main></div>{toast && <div className="toast"><div className="toast-check"><Check size={15} /></div><div><strong>{toast.title}</strong><span>{toast.detail}</span></div><button onClick={() => setToast(null)}><X size={15} /></button></div>}</div>;
}
