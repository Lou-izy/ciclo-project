import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  CircleAlert,
  CircleDashed,
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
type CollectorTab = "registro" | "historico";

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
  { id: "#04821", material: "PAP", weight: "3,80 kg", status: "Sincronizado", time: "14:32" },
  { id: "#04820", material: "MET", weight: "1,20 kg", status: "Sincronizado", time: "14:18" },
  { id: "#04819", material: "PLA", weight: "2,45 kg", status: "Pendente offline", time: "13:57" },
  { id: "#04818", material: "PAP", weight: "4,10 kg", status: "Sincronizado", time: "13:34" },
];

function Logo() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark"><Leaf size={18} strokeWidth={2.8} /></div>
      <div><strong>ciclo</strong><span>rastreio</span></div>
    </div>
  );
}

function TopBar({ mode, onMode, onToast }: { mode: Mode; onMode: (mode: Mode) => void; onToast: (toast: NonNullable<Toast>) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="topbar">
      <div className="topbar-inner">
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
  return <>
    <PageHeader overline="SEGUNDA-FEIRA · 07 SET 2026" title="Olá, Marina" description="Acompanhe o caminho dos seus materiais e o valor gerado por cada entrega." action={<button className="dark-button" onClick={() => onToast({ title: "Cartela vinculada", detail: "Nova cartela pronta para receber etiquetas." })}><Plus size={17} /> Vincular cartela</button>} />
    <div className="metric-grid">
      <section className="balance-card"><div className="card-topline"><span className="eyebrow light">SALDO DISPONÍVEL</span><WalletCards size={19} /></div><div className="balance-value">R$ 86<span>,40</span></div><div className="balance-footer"><span>+ R$ 52,80 este mês</span><button onClick={() => onToast({ title: "Saque solicitado", detail: "O fluxo PIX está disponível no perfil." })}>Sacar saldo <ArrowUpRight size={15} /></button></div></section>
      <section className="white-card collection-card"><div className="card-heading"><div><span className="eyebrow">RASTREIO ATIVO</span><h2>Etiqueta <span className="mono">#04821</span></h2></div><span className="status-badge dark">Em análise</span></div><p className="muted-copy">Sua sacola foi pesada pela equipe e aguarda a verificação final.</p><StatusTrack /><div className="lock-note"><LockKeyhole size={16} /><span><strong>Saldo bloqueado durante a análise.</strong> Isso protege você contra divergências e fraudes.</span></div></section>
    </div>
    <div className="content-grid">
      <section className="white-card map-card"><div className="section-heading"><div><span className="eyebrow">PONTOS DE DESCARTE</span><h2>Onde entregar</h2></div><button className="text-button" onClick={() => onToast({ title: "Mapa em breve", detail: "A visualização completa será aberta em uma nova etapa." })}>Ver mapa <ChevronRight size={15} /></button></div><div className="map-visual"><div className="map-grid" /><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><div className="map-pin pin-1"><MapPin size={17} /></div><div className="map-pin pin-2"><MapPin size={17} /></div><div className="map-pin pin-3"><MapPin size={17} /></div><div className="map-label"><strong>2 pontos próximos</strong><span>Aberto agora · até 19h</span></div></div><div className="map-schedule"><div><span className="schedule-icon"><MapPin size={16} /></span><div><strong>Praça das Artes</strong><span>Seg–sáb · 08:00–19:00</span></div></div><div><span className="schedule-icon"><MapPin size={16} /></span><div><strong>Mercado Central</strong><span>Seg–dom · 07:00–21:00</span></div></div></div><div className="holiday-alert"><CircleAlert size={16} /><span><strong>Feriado em 07/09:</strong> o ponto Praça das Artes fecha às 13h.</span></div></section>
      <section className="white-card ledger-card"><div className="section-heading"><div><span className="eyebrow">MOVIMENTAÇÕES</span><h2>Extrato recente</h2></div><button className="icon-button subtle" onClick={() => setShowLedger(!showLedger)}><SlidersHorizontal size={17} /></button></div><div className="account-summary"><div><span>Titular</span><strong>Marina Costa</strong></div><div><span>PIX cadastrado</span><strong>•••• 9021</strong></div></div><div className="ledger-balance"><span>Saldo final em 06 set</span><strong>R$ 86,40</strong></div><div className="movement-list">{(showLedger ? [...movements, { date: "22 ago 2026", time: "10:20", title: "Recebimento · etiqueta #04611", amount: "+ R$ 16,20", positive: true }] : movements).map((movement) => <div className="movement" key={movement.date + movement.time}><span className={`movement-icon ${movement.positive ? "in" : "out"}`}>{movement.positive ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}</span><div><strong>{movement.title}</strong><span>{movement.date} · {movement.time}</span></div><b className={movement.positive ? "positive" : "negative"}>{movement.amount}</b></div>)}</div><button className="full-width-button" onClick={() => setShowLedger(!showLedger)}>{showLedger ? "Mostrar menos" : "Ver extrato completo"} <ChevronRight size={15} /></button></section>
    </div>
  </>;
}

function Profile({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  return <><PageHeader overline="CONTA E PRIVACIDADE" title="Perfil e segurança" description="Mantenha seus dados atualizados para receber pagamentos e acompanhar seus direitos." action={<button className="dark-button" onClick={() => onToast({ title: "Alterações salvas", detail: "Seu perfil foi atualizado com segurança." })}><Check size={17} /> Salvar alterações</button>} /><div className="profile-grid"><section className="white-card profile-card"><div className="profile-intro"><div className="large-avatar">MC</div><div><h2>Marina Costa</h2><p>marina.costa@email.com</p><span className="verified"><ShieldCheck size={14} /> Conta verificada pelo Google</span></div></div><div className="form-section"><span className="eyebrow">DADOS PESSOAIS</span><div className="form-grid"><label>Nome completo<input value="Marina Costa" readOnly /></label><label>CPF<input value="***.***.***-90" readOnly /></label><label>Celular<input value="(11) 9 8765-4321" readOnly /></label><label>Data de nascimento<input value="12/04/1994" readOnly /></label></div></div><div className="form-section"><span className="eyebrow">PAGAMENTO</span><div className="payment-row"><div className="bank-icon">PIX</div><div><strong>Chave PIX · CPF</strong><span>***.***.***-90 · Banco Inter</span></div><button className="outline-button" onClick={() => onToast({ title: "Edição de pagamento", detail: "Formulário de alteração aberto." })}>Editar</button></div></div></section><aside className="profile-side"><section className="white-card consent-card"><span className="eyebrow">CONSENTIMENTOS</span><h2>Transparência por padrão.</h2><p>Você controla como seus dados de coleta e pagamento são utilizados.</p><label className="toggle-row"><span><strong>Compartilhar dados de impacto</strong><small>Ajuda a comprovar o impacto da reciclagem.</small></span><span className="fake-toggle on"><span /></span></label><label className="toggle-row"><span><strong>Atualizações por e-mail</strong><small>Receba alertas sobre cada verificação.</small></span><span className="fake-toggle on"><span /></span></label><button className="legal-link" onClick={() => onToast({ title: "Termos de uso", detail: "Documento aberto para leitura." })}>Ler termos de uso <ChevronRight size={15} /></button></section><section className="security-callout"><LockKeyhole size={18} /><div><strong>Seus dados estão protegidos</strong><span>Criptografia em trânsito e em repouso.</span></div></section></aside></div></>;
}

function CollectorRegister({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  const [material, setMaterial] = useState("PAP");
  const [code, setCode] = useState("04822");
  const [weight, setWeight] = useState("3,80");
  const [offline, setOffline] = useState(false);
  return <><PageHeader overline="ROTA 04 · 07 SET 2026" title="Registrar coleta" description="Registre o material no local. O app salva tudo mesmo sem conexão." action={<div className={`offline-badge ${offline ? "is-offline" : ""}`}><span className="status-dot" /> {offline ? "Offline · fila local" : "Conectado"}</div>} /><div className="collector-grid"><section className="white-card register-card"><div className="register-top"><div><span className="eyebrow">NOVA COLETA</span><h2>Identifique a sacola</h2></div><button className="scan-button" onClick={() => onToast({ title: "Leitor ativado", detail: "Aponte a câmera para o código numérico." })}><ScanLine size={21} /> Ler etiqueta</button></div><div className="big-form"><label><span>1 · Código numérico da etiqueta</span><div className="input-with-icon"><Link2 size={18} /><input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" /></div><small>Use a etiqueta pré-impressa colada na sacola.</small></label><label><span>2 · Tipo de material</span><div className="toggle-group">{["PAP", "MET", "PLA"].map((item) => <button key={item} className={material === item ? "selected" : ""} onClick={() => setMaterial(item)}>{item}<small>{item === "PAP" ? "papel" : item === "MET" ? "metal" : "plástico"}</small></button>)}</div></label><label><span>3 · Peso aferido</span><div className="weight-input"><input value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9,.]/g, "").replace(".", ","))} inputMode="decimal" /><strong>kg</strong></div><small>Você pode usar ponto ou vírgula. Ex.: 3,80 kg</small></label><button className="submit-collection" onClick={() => onToast({ title: `Coleta #${code || "00000"} registrada`, detail: `${weight || "0"} kg de ${material} · ${offline ? "salva na fila offline" : "sincronizada com o servidor"}.` })}><Check size={19} /> Registrar material</button><button className="unlinked-button" onClick={() => onToast({ title: "Material sem vínculo salvo", detail: "Peso incluído nas estatísticas, sem crédito para usuário." })}><CircleAlert size={17} /> Registrar material sem vínculo</button></div></section><aside className="collector-side"><section className="white-card sync-card"><div className="section-heading"><div><span className="eyebrow">MODO OFFLINE</span><h2>Fila local</h2></div><Wifi size={18} /></div><div className="sync-number">03 <span>coletas aguardando envio</span></div><p>Os registros ficam seguros neste dispositivo e são enviados em lote assim que a conexão retornar.</p><button className="outline-button full" onClick={() => { setOffline(!offline); onToast({ title: offline ? "Conexão restaurada" : "Modo offline ativado", detail: offline ? "3 registros sincronizados." : "Novos registros serão salvos localmente." }); }}><RefreshCw size={15} /> {offline ? "Simular reconexão" : "Testar modo offline"}</button></section><section className="route-note"><MapPin size={18} /><div><strong>Ponto atual</strong><span>Praça das Artes · Setor B</span><small>Última sincronização: agora</small></div></section></aside></div></>;
}

function CollectorHistory({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  return <><PageHeader overline="HISTÓRICO DA OPERAÇÃO" title="Resumo diário" description="Acompanhe as coletas da rota e exporte o fechamento para a equipe." action={<div className="export-actions"><button className="outline-button" onClick={() => onToast({ title: "Planilha gerada", detail: "O arquivo CSV está pronto para download." })}><Download size={16} /> Planilha</button><button className="dark-button" onClick={() => onToast({ title: "PDF gerado", detail: "O resumo diário foi preparado." })}><FileDown size={16} /> Exportar PDF</button></div>} /><div className="collector-metrics"><div className="white-card small-metric"><span className="eyebrow">SACOLAS HOJE</span><strong>28</strong><span className="metric-change">+ 12% vs. ontem</span></div><div className="white-card small-metric"><span className="eyebrow">PESO TOTAL</span><strong>86,4 <em>kg</em></strong><span className="metric-change">4 materiais</span></div><div className="white-card small-metric"><span className="eyebrow">SEM VÍNCULO</span><strong>03</strong><span className="metric-change">Apenas estatístico</span></div></div><section className="white-card history-card"><div className="section-heading"><div><span className="eyebrow">07 SET 2026 · ROTA 04</span><h2>Coletas registradas</h2></div><button className="icon-button subtle" onClick={() => onToast({ title: "Filtros", detail: "Filtro por material disponível em breve." })}><SlidersHorizontal size={17} /></button></div><div className="history-table"><div className="history-head"><span>ETIQUETA</span><span>MATERIAL</span><span>PESO</span><span>STATUS</span><span>HORA</span></div>{collectionHistory.map((row) => <div className="history-row" key={row.id}><strong className="mono">{row.id}</strong><span className="material-chip">{row.material}</span><strong>{row.weight}</strong><span className={`row-status ${row.status.includes("Pendente") ? "pending" : ""}`}>{row.status}</span><span className="muted">{row.time}</span></div>)}</div><div className="table-footer"><span>Exibindo 4 de 28 coletas</span><button className="text-button" onClick={() => onToast({ title: "Histórico completo", detail: "Todas as 28 coletas estão carregadas." })}>Ver todas <ChevronRight size={15} /></button></div></section></>;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("depositador");
  const [depTab, setDepTab] = useState<DepTab>("dashboard");
  const [collectorTab, setCollectorTab] = useState<CollectorTab>("registro");
  const [toast, setToast] = useState<Toast>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notify = (next: NonNullable<Toast>) => { setToast(next); window.setTimeout(() => setToast(null), 3500); };
  const page = useMemo(() => mode === "depositador" ? (depTab === "dashboard" ? <DepositadorDashboard onToast={notify} /> : <Profile onToast={notify} />) : (collectorTab === "registro" ? <CollectorRegister onToast={notify} /> : <CollectorHistory onToast={notify} />), [mode, depTab, collectorTab]);
  return <div className={`app-shell ${mode}`}><TopBar mode={mode} onMode={(next) => { setMode(next); setMobileOpen(false); }} onToast={notify} /><button className="mobile-menu-button icon-button" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={20} /></button><div className={`app-layout ${mobileOpen ? "mobile-nav-open" : ""}`}><SideRail mode={mode} depTab={depTab} setDepTab={(tab) => { setDepTab(tab); setMobileOpen(false); }} collectorTab={collectorTab} setCollectorTab={(tab) => { setCollectorTab(tab); setMobileOpen(false); }} onToast={notify} /><main className="main-content">{page}</main></div>{toast && <div className="toast"><div className="toast-check"><Check size={15} /></div><div><strong>{toast.title}</strong><span>{toast.detail}</span></div><button onClick={() => setToast(null)}><X size={15} /></button></div>}</div>;
}
