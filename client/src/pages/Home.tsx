import { useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  ChevronDown,
  CircleAlert,
  CircleDashed,
  Clock3,
  Home as HomeIcon,
  Leaf,
  LockKeyhole,
  LogOut,
  Menu,
  Phone,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

type Toast = { title: string; detail: string } | null;
type DepTab = "dashboard" | "perfil";

const collections = [
  { date: "06 set 2026", material: "MET", weight: "3,80 kg", status: "Em análise", detail: "Aguardando validação do peso" },
  { date: "02 set 2026", material: "PET", weight: "2,45 kg", status: "Verificado", detail: "Tokens liberados" },
  { date: "27 ago 2026", material: "PLA", weight: "1,70 kg", status: "Verificado", detail: "Tokens liberados" },
  { date: "22 ago 2026", material: "PET", weight: "4,10 kg", status: "Verificado", detail: "Tokens liberados" },
];

const movements = [
  { date: "06 set 2026", time: "14:32", title: "Tokens por coleta verificada", amount: "+ 184", positive: true },
  { date: "02 set 2026", time: "09:15", title: "Tokens por coleta verificada", amount: "+ 126", positive: true },
  { date: "27 ago 2026", time: "11:48", title: "Tokens por coleta verificada", amount: "+ 92", positive: true },
];

const materialBars = [
  { label: "MET", name: "Metal", value: 8.6, percent: 76, className: "mint" },
  { label: "PET", name: "Plástico PET", value: 6.4, percent: 57, className: "peach" },
  { label: "PLA", name: "Plástico PLA", value: 4.1, percent: 37, className: "lilac" },
];

function Logo() {
  return <div className="brand-lockup"><div className="brand-mark"><Leaf size={18} strokeWidth={2.8} /></div><div><strong>ciclo</strong><span>rastreio</span></div></div>;
}

function GoogleMark() {
  return <span className="google-mark">G</span>;
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return <main className="login-shell"><div className="login-orbit orbit-one" /><div className="login-orbit orbit-two" /><div className="login-card"><Logo /><span className="eyebrow">ACESSO DO DEPOSITADOR</span><h1>Recicle. Acompanhe.<br /><em>Transforme.</em></h1><p>Uma conta para acompanhar suas coletas, materiais e saldo em tokens.</p><button className="google-button" onClick={onLogin}><GoogleMark /> Continuar com Google <ChevronRight size={17} /></button><div className="login-note"><ShieldCheck size={15} /> Login seguro e simplificado. Usamos apenas sua conta Google.</div></div><div className="login-art"><span className="art-label">ciclo / impacto real</span><div className="art-shape shape-arch" /><div className="art-shape shape-sun" /><div className="art-shape shape-wave" /><div className="art-shape shape-block" /><p>O que você separa hoje<br /><strong>volta para o ciclo.</strong></p></div></main>;
}

function TopBar({ depTab, setDepTab, onToast, onLogout }: { depTab: DepTab; setDepTab: (tab: DepTab) => void; onToast: (toast: NonNullable<Toast>) => void; onLogout: () => void }) {
  const [accountOpen, setAccountOpen] = useState(false);
  return <header className="topbar"><div className="topbar-inner"><Logo /><nav className="top-nav"><button className={depTab === "dashboard" ? "active" : ""} onClick={() => setDepTab("dashboard")}><HomeIcon size={16} /> Visão geral</button><button className={depTab === "perfil" ? "active" : ""} onClick={() => setDepTab("perfil")}><UserRound size={16} /> Meu perfil</button></nav><div className="topbar-actions"><span className="account-status"><span className="status-dot" /> Conta conectada</span><button className="icon-button" aria-label="Notificações" onClick={() => onToast({ title: "Tudo em dia", detail: "Nenhuma nova notificação." })}><Bell size={18} /></button><button className="avatar" onClick={() => setAccountOpen(!accountOpen)} aria-label="Abrir conta">MC</button>{accountOpen && <div className="account-menu"><strong>Marina Costa</strong><span>marina.costa@email.com</span><button onClick={onLogout}><LogOut size={15} /> Sair</button></div>}</div></div></header>;
}

function SideRail({ depTab, setDepTab, onToast }: { depTab: DepTab; setDepTab: (tab: DepTab) => void; onToast: (toast: NonNullable<Toast>) => void }) {
  return <aside className="side-rail"><div className="rail-context"><span className="eyebrow">APLICATIVO ATIVO</span><strong>Minha jornada</strong><span className="context-line">Acompanhe o impacto de cada entrega.</span></div><nav className="rail-nav"><button className={depTab === "dashboard" ? "active" : ""} onClick={() => setDepTab("dashboard")}><HomeIcon size={18} /><span>Visão geral</span><ChevronRight size={15} /></button><button className={depTab === "perfil" ? "active" : ""} onClick={() => setDepTab("perfil")}><UserRound size={18} /><span>Meu perfil</span><ChevronRight size={15} /></button></nav><div className="rail-bottom"><div className="help-box"><ShieldCheck size={19} /><div><strong>Rastreio protegido</strong><span>Etiqueta visível · #48237</span></div></div><button className="rail-link" onClick={() => onToast({ title: "Central de ajuda", detail: "A equipe Ciclo responderá em breve." })}>Preciso de ajuda <ChevronRight size={15} /></button></div></aside>;
}

function PageHeader({ overline, title, description }: { overline: string; title: ReactNode; description: string }) {
  return <div className="page-header"><div><span className="eyebrow">{overline}</span><h1>{title}</h1><p>{description}</p></div></div>;
}

function StatusTrack() {
  const stages = [{ label: "Não coletado", icon: CircleDashed }, { label: "Em análise", icon: CircleAlert }, { label: "Verificado", icon: Check }];
  return <div className="status-track">{stages.map((stage, i) => { const Icon = stage.icon; const current = i === 1; const done = i === 0; return <div className={`stage ${done ? "done" : ""} ${current ? "current" : ""}`} key={stage.label}><div className="stage-line"><div className="stage-icon"><Icon size={16} /></div>{i < stages.length - 1 && <div className={`stage-connector ${done ? "filled" : ""}`} />}</div><strong>{stage.label}</strong><span>{i === 0 ? "Aguardando rota" : i === 1 ? "Peso em validação" : "Tokens liberados"}</span></div>; })}</div>;
}

function TokenCard() {
  return <section className="token-card"><div className="card-topline"><span className="eyebrow light">CARTEIRA DE TOKENS</span><WalletCards size={19} /></div><div className="token-value">2.480 <span>tk</span></div><div className="token-footer"><span>+ 402 tokens este mês</span><span className="token-caption">1 token = impacto registrado</span></div></section>;
}

function InstructionsCard() {
  const [open, setOpen] = useState(false);
  const steps = [["01", "Separe", "Separe o lixo por material: MET, PET ou PLA."], ["02", "Ensacar", "Coloque os materiais separados em um saco de lixo."], ["03", "Identificar", "Escreva #48237 no papel e cole com fita no saco."]];
  return <section className={`white-card expandable-card ${open ? "is-open" : ""}`}><button className="expand-trigger" onClick={() => setOpen(!open)} aria-expanded={open}><span><span className="eyebrow">COMO PARTICIPAR</span><strong>Veja os três passos simples</strong></span><span className="expand-icon"><ChevronDown size={18} /></span></button>{open && <div className="expand-content"><div className="instruction-list">{steps.map(([number, title, detail]) => <div className="instruction" key={number}><span className="instruction-number">{number}</span><div><strong>{title}</strong><p>{detail}</p></div></div>)}</div><div className="identifier-note"><LockKeyhole size={16} /><span>Seu identificador <strong>#48237</strong> é fixo e deve acompanhar todas as entregas.</span></div></div>}</section>;
}

function MaterialsChart() {
  return <section className="white-card materials-card"><div className="section-heading"><div><span className="eyebrow">IMPACTO ACUMULADO</span><h2>Materiais coletados</h2></div><BarChart3 size={19} /></div><p className="card-description">Peso verificado por tipo de material.</p><div className="bar-chart">{materialBars.map((bar) => <div className="bar-row" key={bar.label}><div className="bar-label"><strong>{bar.label}</strong><span>{bar.name}</span></div><div className="bar-track"><div className={`bar-fill ${bar.className}`} style={{ width: `${bar.percent}%` }} /></div><b>{bar.value.toFixed(1).replace(".", ",")} kg</b></div>)}</div><div className="chart-total"><span>Total separado</span><strong>19,1 kg</strong></div></section>;
}

function LocationsCard({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  const [open, setOpen] = useState(false);
  return <section className={`white-card expandable-card ${open ? "is-open" : ""}`}><button className="expand-trigger" onClick={() => setOpen(!open)} aria-expanded={open}><span><span className="eyebrow">ONDE ENTREGAR</span><strong>Veja os pontos de coleta</strong></span><span className="expand-icon"><ChevronDown size={18} /></span></button>{open && <div className="expand-content"><p className="card-description">Escolha o ponto mais conveniente para entregar seu saco identificado.</p><div className="location-list"><div className="location-item"><span className="location-index">01</span><div><strong>Praça das Artes</strong><span>Seg–sáb · 08:00–19:00</span></div><span className="open-pill">Aberto</span></div><div className="location-item"><span className="location-index">02</span><div><strong>Mercado Central</strong><span>Seg–dom · 07:00–21:00</span></div><span className="open-pill">Aberto</span></div></div><div className="holiday-alert"><CircleAlert size={15} /><span><strong>Feriado em 07/09:</strong> Praça das Artes fecha às 13h.</span></div><button className="text-button refresh-locations" onClick={() => onToast({ title: "Lista atualizada", detail: "Mostrando os pontos mais próximos de você." })}>Atualizar pontos <ChevronRight size={15} /></button></div>}</section>;
}

function TokenLedger({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  return <section className="white-card token-ledger"><div className="section-heading"><div><span className="eyebrow">EXTRATO DE TOKENS</span><h2>Movimentações recentes</h2></div><button className="icon-button subtle" onClick={() => onToast({ title: "Extrato completo", detail: "Seu histórico completo de tokens está disponível." })}><BarChart3 size={17} /></button></div><div className="ledger-highlight"><span>Saldo atual</span><strong>2.480 <small>tk</small></strong><em>+ 402 este mês</em></div><div className="movement-list">{movements.map((movement) => <div className="movement" key={movement.date + movement.time}><span className="movement-icon in"><ArrowDownLeft size={15} /></span><div><strong>{movement.title}</strong><span>{movement.date} · {movement.time}</span></div><b className="positive">{movement.amount} tk</b></div>)}</div><button className="full-width-button" onClick={() => onToast({ title: "Extrato completo", detail: "Todos os lançamentos foram carregados." })}>Ver extrato completo <ChevronRight size={15} /></button></section>;
}

function HistoryCard() {
  return <section className="white-card history-card"><div className="section-heading"><div><span className="eyebrow">HISTÓRICO POR DATA</span><h2>Suas entregas</h2></div><span className="soft-badge">4 registros</span></div><div className="collection-list">{collections.map((item) => <div className="collection-item" key={item.date}><div className="date-block"><strong>{item.date.split(" ")[0]}</strong><span>{item.date.split(" ")[1]} {item.date.split(" ")[2]}</span></div><div className="collection-content"><strong>{item.material} <span>· {item.weight}</span></strong><span>{item.detail}</span></div><span className={`collection-status ${item.status === "Em análise" ? "review" : "verified-status"}`}>{item.status}</span></div>)}</div></section>;
}

function BinMaterials() {
  const [selected, setSelected] = useState<string | null>(null);
  const bins = [
    { label: "MET", name: "Metal", className: "bin-metal", what: "Latas de alumínio, latas de aço ou flandres, tampinhas de garrafas de vidro, arames, pregos e pequenas ferragens.", how: "Esvazie todo o conteúdo, passe água de reuso nas latas de conservas e amasse as latas de alumínio para otimizar o espaço." },
    { label: "PET", name: "Plástico PET", className: "bin-pet", what: "Garrafas transparentes ou coloridas de água, refrigerantes, sucos e chás, embalagens de óleo de soja e alguns frascos de cosméticos.", how: "Retire todo o líquido, amasse a garrafa do fundo para o gargalo e feche com a própria tampa para reduzir o volume." },
    { label: "PLA", name: "Plástico PLA", className: "bin-pla", what: "Copos, talheres, potes e embalagens com selo biodegradável/compostável, além de sobras e suportes de filamentos de impressão 3D.", how: "Não misture com PET: o PLA requer compostagem industrial. Remova restos de comida antes de depositar na lixeira exclusiva." },
  ];
  return <section className="white-card bin-card"><div className="section-heading"><div><span className="eyebrow">SEPARAÇÃO CORRETA</span><h2>Uma lixeira para cada material</h2></div><span className="soft-badge">guia visual</span></div><p className="card-description">Aprenda como preparar cada material antes de separar e entregar.</p><div className="guide-actions"><InstructionsCard /><LocationsCard onToast={() => {}} /></div><div className="bin-layout"><div className="bin-image-wrap"><img src="/manus-storage/pasted_file_Go6Gd1_image_058fa20e.png" alt="Três lixeiras coloridas para separação de materiais" /></div><div className="bin-materials">{bins.map((bin) => <div className={`bin-material ${bin.className} ${selected === bin.label ? "is-selected" : ""}`} key={bin.label}><button className="bin-info-trigger" onClick={() => setSelected(selected === bin.label ? null : bin.label)} aria-expanded={selected === bin.label}><span className="bin-swatch" /><span><strong>{bin.label}</strong><small>{bin.name}</small></span><ChevronDown size={15} /></button>{selected === bin.label && <div className="bin-detail"><p><strong>O que descartar:</strong> {bin.what}</p><p><strong>Como preparar:</strong> {bin.how}</p></div>}</div>)}</div></div></section>;
}
function Dashboard({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  const [showHistory, setShowHistory] = useState(false);
  return <><PageHeader overline="SEGUNDA-FEIRA · 07 SET 2026" title={<span className="greeting-title">Olá, Marina <span className="header-identifier">Etiqueta #48237</span></span>} description="Acompanhe o que você separou, o impacto gerado e seus tokens." /><div className="dashboard-stack"><div className="token-hero-grid"><TokenCard /><section className="white-card active-status-card"><div className="card-heading"><div><span className="eyebrow">ÚLTIMA ENTREGA</span><h2>Acompanhe sua coleta</h2></div><span className="status-badge dark">Em análise</span></div><p className="muted-copy">O peso está sendo validado pela equipe. Os tokens serão liberados após a conferência.</p><StatusTrack /><button className="history-cta" onClick={() => setShowHistory(!showHistory)}><Clock3 size={16} /> {showHistory ? "Ocultar histórico" : "Ver histórico de entregas"} <ChevronDown size={15} className={showHistory ? "history-chevron open" : "history-chevron"} /></button>{showHistory && <HistoryCard />}</section></div><TokenLedger onToast={onToast} /><BinMaterials /><MaterialsChart /></div></>;
}
function Profile({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  return <><PageHeader overline="CONTA E PRIVACIDADE" title="Meu perfil" description="Mantenha seus dados atualizados e controle como sua conta participa do Ciclo." /><div className="profile-grid"><section className="white-card profile-card"><div className="profile-intro"><div className="large-avatar profile-photo">MC</div><div><h2>Marina Costa</h2><p>marina.costa@email.com</p><span className="verified"><ShieldCheck size={14} /> Login feito pelo Google</span></div></div><div className="form-section"><span className="eyebrow">INFORMAÇÕES DO USUÁRIO</span><div className="form-grid"><label>Nome completo<input value="Marina Costa" readOnly /></label><label>E-mail<input value="marina.costa@email.com" readOnly /></label><label>Telefone<input value="(11) 98888-7766" readOnly /></label><label>Estado<input value="São Paulo" readOnly /></label><label>Cidade<input value="São Paulo" readOnly /></label><label>Identificador<input value="Identificador único" readOnly /></label></div><button className="outline-button edit-profile-button" onClick={() => onToast({ title: "Edição de perfil", detail: "Campos pessoais liberados para alteração." })}><UserRound size={14} /> Editar informações</button></div></section><aside className="profile-side"><section className="white-card consent-card"><span className="eyebrow">SEGURANÇA</span><h2>Conta Google conectada.</h2><p>Seu acesso é feito exclusivamente pela conta Google. Não há senha do Ciclo para guardar.</p><div className="google-account"><span className="google-mark">G</span><div><strong>marina.costa@email.com</strong><span>Conta verificada</span></div><Check size={16} /></div><button className="legal-link" onClick={() => onToast({ title: "Termos de uso", detail: "Documento aberto para leitura." })}>Ler termos de uso <ChevronRight size={15} /></button></section><section className="security-callout"><LockKeyhole size={18} /><div><strong>Identificador protegido</strong><span>O código do usuário é usado internamente para rastrear as coletas.</span></div></section></aside></div></>;
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [depTab, setDepTab] = useState<DepTab>("dashboard");
  const [toast, setToast] = useState<Toast>(null);
  const notify = (next: NonNullable<Toast>) => { setToast(next); window.setTimeout(() => setToast(null), 3500); };
  if (!authenticated) return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  return <div className="app-shell"><TopBar depTab={depTab} setDepTab={setDepTab} onToast={notify} onLogout={() => setAuthenticated(false)} /><div className="app-layout"><SideRail depTab={depTab} setDepTab={setDepTab} onToast={notify} /><main className="main-content">{depTab === "dashboard" ? <Dashboard onToast={notify} /> : <Profile onToast={notify} />}</main></div>{toast && <div className="toast"><div className="toast-check"><Check size={15} /></div><div><strong>{toast.title}</strong><span>{toast.detail}</span></div><button onClick={() => setToast(null)}><X size={15} /></button></div>}</div>;
}
