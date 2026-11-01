import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { cicloApi, loadAuthSession, saveAuthSession, type AuthSession, type Collection, type CollectionPoint, type ImpactStats, type MaterialInfo, type NotificationItem, type TokenTransaction, type User, type WalletSummary } from "@/lib/api";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  ChevronDown,
  CircleHelp,
  Download,
  CircleAlert,
  Clock3,
  Home as HomeIcon,
  Leaf,
  LockKeyhole,
  LogOut,
  Menu,
  Phone,
  ShieldCheck,
  Share2,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

type Toast = { title: string; detail: string } | null;
type DepTab = "dashboard" | "perfil";
type CicloData = {
  user: User | null;
  collections: Collection[];
  wallet: WalletSummary | null;
  transactions: TokenTransaction[];
  impact: ImpactStats | null;
  materials: MaterialInfo[];
  points: CollectionPoint[];
  notifications: NotificationItem[];
  loading: boolean;
};

const CicloDataContext = createContext<CicloData | null>(null);

function useCicloData() {
  const data = useContext(CicloDataContext);
  if (!data) throw new Error("Dados do Ciclo indisponíveis fora do provedor.");
  return data;
}

function formatTokens(value: number | undefined) {
  return (value ?? 0).toLocaleString("pt-BR");
}

function Logo() {
  return <div className="brand-lockup"><div className="brand-mark"><Leaf size={18} strokeWidth={2.8} /></div><div><strong>ciclo</strong><span>rastreio</span></div></div>;
}

function GoogleMark() {
  return <span className="google-mark">G</span>;
}

function LoginScreen({ onLogin, onError, error, busy }: { onLogin: (credential: string) => void; onError: (message: string) => void; error: string | null; busy: boolean }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return <main className="login-shell"><div className="login-orbit orbit-one" /><div className="login-orbit orbit-two" /><div className="login-card"><Logo /><span className="eyebrow">ACESSO DO DEPOSITADOR</span><h1>Recicle. Acompanhe.<br /><em>Transforme.</em></h1><p>Uma conta para acompanhar suas coletas, materiais e saldo em tokens.</p>{googleClientId ? <div className={busy ? "google-login-wrap is-busy" : "google-login-wrap"}><GoogleLogin onSuccess={(response) => { if (response.credential) onLogin(response.credential); else onError("O Google não retornou uma credencial válida."); }} onError={() => onError("Não foi possível autenticar com o Google. Tente novamente.")} text="continue_with" theme="outline" shape="rectangular" size="large" width="320" /></div> : <button className="google-button" disabled><GoogleMark /> Configure o Client ID Google</button>}<div className="login-note" role={error ? "alert" : undefined}>{error ? <CircleAlert size={15} /> : <ShieldCheck size={15} />} {error || "Autenticação segura fornecida pelo Google."}</div></div><div className="login-art login-art-reference"><img src="/images/login-shapes.png" alt="Composição abstrata com formas coloridas" /><div className="login-art-overlay" /><span className="art-label">ciclo / impacto real</span><p>O que você separa hoje<br /><strong>volta para o ciclo.</strong></p></div></main>;
}

function TopBar({ depTab, setDepTab, onToast, onLogout, onOpenNotifications, unreadCount }: { depTab: DepTab; setDepTab: (tab: DepTab) => void; onToast: (toast: NonNullable<Toast>) => void; onLogout: () => void; onOpenNotifications: () => void; unreadCount: number }) {
  const [accountOpen, setAccountOpen] = useState(false);
  const { user } = useCicloData();
  const name = user?.name ?? "Conta Ciclo";
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <header className="topbar"><div className="topbar-inner"><Logo /><nav className="top-nav"><button className={depTab === "dashboard" ? "active" : ""} onClick={() => setDepTab("dashboard")}><HomeIcon size={16} /> Visão geral</button><button className={depTab === "perfil" ? "active" : ""} onClick={() => setDepTab("perfil")}><UserRound size={16} /> Meu perfil</button></nav><div className="topbar-actions"><span className="account-status"><span className="status-dot" /> Conta conectada</span><button className="icon-button notification-bell" aria-label={`Abrir notificações${unreadCount ? `, ${unreadCount} não lidas` : ""}`} onClick={onOpenNotifications}><Bell size={18} />{unreadCount > 0 && <span className="notification-count" aria-label={`${unreadCount} notificações não lidas`}>{unreadCount}</span>}</button><button className="avatar" onClick={() => setAccountOpen(!accountOpen)} aria-label="Abrir conta">{initials}</button>{accountOpen && <div className="account-menu"><strong>{name}</strong><span>{user?.email}</span><button onClick={onLogout}><LogOut size={15} /> Sair</button></div>}</div></div></header>;
}

function SideRail({ depTab, setDepTab, onToast }: { depTab: DepTab; setDepTab: (tab: DepTab) => void; onToast: (toast: NonNullable<Toast>) => void }) {
  const { user } = useCicloData();
  return <aside className="side-rail"><div className="rail-context"><span className="eyebrow">APLICATIVO ATIVO</span><strong>Minha jornada</strong><span className="context-line">Acompanhe o impacto de cada entrega.</span></div><nav className="rail-nav"><button className={depTab === "dashboard" ? "active" : ""} onClick={() => setDepTab("dashboard")}><HomeIcon size={18} /><span>Visão geral</span><ChevronRight size={15} /></button><button className={depTab === "perfil" ? "active" : ""} onClick={() => setDepTab("perfil")}><UserRound size={18} /><span>Meu perfil</span><ChevronRight size={15} /></button></nav><div className="rail-bottom"><div className="help-box"><ShieldCheck size={19} /><div><strong>Rastreio protegido</strong><span>Etiqueta visível · {user?.identifierTag ?? ""}</span></div></div><button className="rail-link" onClick={() => onToast({ title: "Central de ajuda", detail: "A equipe Ciclo responderá em breve." })}>Preciso de ajuda <ChevronRight size={15} /></button></div></aside>;
}

function PageHeader({ overline, title, description }: { overline: string; title: ReactNode; description: string }) {
  return <div className="page-header"><div><span className="eyebrow">{overline}</span><h1>{title}</h1><p>{description}</p></div></div>;
}

function TokenCard() {
  const { wallet } = useCicloData();
  return <section className="token-card"><div className="card-topline"><span className="eyebrow light">CARTEIRA DE TOKENS</span><WalletCards size={19} /></div><div className="token-value">{formatTokens(wallet?.balanceTokens)} <span>tk</span></div><div className="token-footer"><span>+ {formatTokens(wallet?.tokensThisMonth)} tokens este mês</span><span className="token-caption">{wallet?.tokenRatioText || "Saldo conectado à carteira"}</span></div></section>;
}

function InstructionsCard() {
  const { user } = useCicloData();
  const [open, setOpen] = useState(false);
  const steps = [["01", "Separe", "Separe o material em MET, PAP ou PLS."], ["02", "Ensacar", "Coloque cada material separado em um saco."], ["03", "Identificar", `Escreva ${user?.identifierTag ?? "seu identificador"} no papel e cole com fita no saco.`]];
  return <section className={`white-card expandable-card ${open ? "is-open" : ""}`}><button className="expand-trigger" onClick={() => setOpen(!open)} aria-expanded={open}><span><span className="eyebrow">COMO PARTICIPAR</span><strong>Veja os três passos simples</strong></span><span className="expand-icon"><ChevronDown size={18} /></span></button>{open && <div className="expand-content"><div className="instruction-list">{steps.map(([number, title, detail]) => <div className="instruction" key={number}><span className="instruction-number">{number}</span><div><strong>{title}</strong><p>{detail}</p></div></div>)}</div><div className="identifier-note"><LockKeyhole size={16} /><span>Seu identificador <strong>{user?.identifierTag ?? ""}</strong> é fixo e deve acompanhar todas as entregas.</span></div></div>}</section>;
}

function MaterialsChart({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  const { impact, materials } = useCicloData();
  const bars = impact?.materials ?? materials;
  const totalWeight = impact?.totalWeightFormatted ?? `${bars.reduce((total, item) => total + item.totalKg, 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`;
  const shareResults = async () => {
    const shareData = { title: "Meu impacto no Ciclo", text: `Registrei ${totalWeight} de impacto positivo separando materiais no Ciclo e transformei minhas entregas em tokens.`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else onToast({ title: "Resultados prontos para compartilhar", detail: "O compartilhamento nativo não está disponível neste dispositivo." });
    } catch { /* cancelamento do compartilhamento não exige feedback */ }
  };
  return <section className="white-card materials-card"><div className="section-heading"><div><span className="eyebrow">IMPACTO ACUMULADO</span><h2>Materiais coletados</h2></div><BarChart3 size={19} /></div><p className="card-description">Peso verificado por tipo de material.</p><div className="bar-chart">{bars.map((bar) => <div className="bar-row" key={bar.label}><div className="bar-label"><strong>{bar.label}</strong><span>{bar.name}</span></div><div className="bar-track"><div className={`bar-fill ${bar.className}`} style={{ width: `${bar.percentage}%` }} /></div><b>{bar.totalKg.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</b></div>)}</div><div className="chart-total"><span>Total separado</span><strong>{totalWeight}</strong></div><button className="share-results-button" onClick={shareResults}><Share2 size={15} /> Compartilhar meus resultados</button></section>;
}

function LocationsCard() {
  const { points } = useCicloData();
  const [open, setOpen] = useState(false);
  return <section className={`white-card expandable-card ${open ? "is-open" : ""}`}><button className="expand-trigger" onClick={() => setOpen(!open)} aria-expanded={open}><span><span className="eyebrow">ONDE ENTREGAR</span><strong>Veja os pontos de coleta</strong></span><span className="expand-icon"><ChevronDown size={18} /></span></button>{open && <div className="expand-content"><p className="card-description">Escolha o ponto mais conveniente para entregar seu saco identificado.</p><div className="location-list">{points.map((point) => <div className="location-item" key={point.id}><span className="location-index">{point.code}</span><div><strong>{point.name}</strong><span>{point.hours}</span><small>{point.address}</small></div><span className="open-pill">{point.status}</span></div>)}</div>{points.some((point) => point.specialNotes) && <div className="holiday-alert"><CircleAlert size={15} /><span>{points.find((point) => point.specialNotes)?.specialNotes}</span></div>}</div>}</section>;
}

function LedgerContent({ onToast, onExpand }: { onToast: (toast: NonNullable<Toast>) => void; onExpand?: () => void }) {
  const { transactions: movements, wallet } = useCicloData();
  const downloadPdf = async () => {
    try {
      const pdf = await cicloApi.downloadStatement();
      const url = URL.createObjectURL(pdf);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "extrato-tokens-ciclo.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      onToast({ title: "PDF baixado", detail: "Extrato gerado pela API do Ciclo." });
      return;
    } catch {}
    const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
    const esc = (value: string) => normalize(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const today = new Date();
    const months = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const emittedAt = today.toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
    const filename = `extrato_tokens_${months[today.getMonth()]}_${today.getFullYear()}.pdf`;
    const rows = movements;
    const rowsPerPage = 8;
    const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));
    const pages: string[] = [];
    const text = (value: string, x: number, y: number, size = 10, font = "F1", color = "0.16 0.14 0.18") => `${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${esc(value)}) Tj ET`;
    const line = (x1: number, y1: number, x2: number, y2: number, color = "0.87 0.84 0.88") => `${color} RG 0.7 w ${x1} ${y1} m ${x2} ${y2} l S`;
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      const pageRows = rows.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);
      const commands: string[] = ["q", "0.98 0.97 0.99 rg 0 0 595 842 re f", "Q"];
      commands.push(text("CICLO", 54, 786, 16, "F2", "0.16 0.14 0.18"));
      commands.push(text("RASTREIO DE RECICLAGEM", 54, 770, 8, "F1", "0.42 0.39 0.45"));
      commands.push(text("EXTRATO DE TOKENS", 54, 730, 24, "F2"));
      commands.push(text(`Emitido em ${emittedAt}`, 54, 708, 9, "F1", "0.42 0.39 0.45"));
      commands.push(text("Extrato de tokens Ciclo", 380, 708, 9, "F1", "0.42 0.39 0.45"));
      commands.push("0.86 0.80 0.92 rg 54 642 487 44 re f");
      commands.push(text("SALDO ATUAL", 70, 668, 8, "F2", "0.32 0.28 0.39"));
      commands.push(text(`${formatTokens(wallet?.balanceTokens)} tk`, 70, 650, 20, "F2", "0.16 0.14 0.18"));
      commands.push(text(`+ ${formatTokens(wallet?.tokensThisMonth)} tokens no mes corrente`, 390, 653, 9, "F1", "0.32 0.28 0.39"));
      commands.push(text("HISTORICO DE LANCAMENTOS", 54, 612, 9, "F2", "0.32 0.28 0.39"));
      commands.push(line(54, 600, 541, 600, "0.72 0.68 0.76"));
      commands.push(text("DATA E HORA", 54, 584, 8, "F2", "0.42 0.39 0.45"));
      commands.push(text("DESCRICAO / DETALHES", 165, 584, 8, "F2", "0.42 0.39 0.45"));
      commands.push(text("STATUS", 410, 584, 8, "F2", "0.42 0.39 0.45"));
      commands.push(text("CREDITO", 490, 584, 8, "F2", "0.42 0.39 0.45"));
      let y = 558;
      pageRows.forEach((movement) => {
        commands.push(text(`${movement.date}, ${movement.time}`, 54, y, 9, "F2"));
        commands.push(text(movement.title, 165, y, 9, "F2"));
        commands.push(text(`${movement.detail}`, 165, y - 14, 8, "F1", "0.42 0.39 0.45"));
        commands.push(text(movement.status, 410, y, 8, "F1", "0.25 0.45 0.34"));
        commands.push(text(`${movement.amount} tk`, 490, y, 9, "F2", "0.25 0.45 0.34"));
        commands.push(line(54, y - 28, 541, y - 28));
        y -= 48;
      });
      commands.push(text("Obrigado por transformar residuos em recursos!", 54, 62, 9, "F1", "0.42 0.39 0.45"));
      commands.push(text(`Pagina ${pageIndex + 1} de ${pageCount}`, 470, 62, 8, "F1", "0.42 0.39 0.45"));
      pages.push(commands.join("\n"));
    }
    const objects: string[] = ["1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj"];
    const pageRefs: string[] = [];
    const contentRefs: string[] = [];
    pages.forEach((_, i) => { pageRefs.push(`${3 + i * 2} 0 R`); contentRefs.push(`${4 + i * 2} 0 R`); });
    objects.push(`2 0 obj<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>endobj`);
    pages.forEach((stream, i) => {
      const pageObj = 3 + i * 2;
      const contentObj = 4 + i * 2;
      objects.push(`${pageObj} 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R /F2 ${4 + pages.length * 2} 0 R >> >> /Contents ${contentObj} 0 R >>endobj`);
      objects.push(`${contentObj} 0 obj<< /Length ${stream.length} >>stream\n${stream}\nendstream endobj`);
    });
    const regularFont = 3 + pages.length * 2;
    const boldFont = regularFont + 1;
    objects.push(`${regularFont} 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj`);
    objects.push(`${boldFont} 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>endobj`);
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object) => { offsets.push(pdf.length); pdf += object + "\n"; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
    pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onToast({ title: "PDF baixado", detail: `Extrato salvo como ${filename}.` });
  };
  return <><div className="ledger-highlight ledger-detail-highlight"><span className="ledger-detail-label">Saldo atual</span><strong className="ledger-detail-value">{formatTokens(wallet?.balanceTokens)} <small className="ledger-detail-unit">tk</small></strong><em className="ledger-detail-month">+ {formatTokens(wallet?.tokensThisMonth)} este mês</em></div><div className="ledger-list-header ledger-detail-header"><span>Lançamentos por data</span><b className="ledger-detail-count">{movements.length} lançamentos</b></div><div className="movement-list ledger-scroll ledger-detail-scroll">{movements.slice(0, 3).map((movement) => <div className="token-movement ledger-detail-row" key={movement.id}><div className="date-block ledger-detail-date"><strong>{movement.date.split(" ")[0]}</strong><span className="ledger-detail-month-label">{movement.date.split(" ").slice(1).join(" ")}</span></div><div className="token-movement-content ledger-detail-content"><strong className="ledger-detail-title">{movement.title}</strong><span className="ledger-detail-meta">{movement.detail} · {movement.time}</span><small className="ledger-detail-status">{movement.status}</small></div><b className="positive token-amount ledger-detail-amount">{movement.amountFormatted} tk</b></div>)}</div><div className="ledger-actions ledger-detail-actions"><button className="full-width-button" onClick={() => onExpand?.()}>Ver extrato completo <ChevronRight size={15} /></button><button className="download-pdf-button" onClick={downloadPdf}><Download size={15} /> Baixar PDF</button></div></>;

}
function TokenLedger({ onToast, onExpand }: { onToast: (toast: NonNullable<Toast>) => void; onExpand: () => void }) {
  const { transactions, wallet } = useCicloData();
  return <section className="white-card token-ledger token-ledger-summary"><div className="section-heading"><div><span className="eyebrow">EXTRATO DE TOKENS</span><h2>Movimentações recentes</h2></div><button className="icon-button subtle" aria-label="Expandir extrato" onClick={onExpand}><BarChart3 size={17} /></button></div><div className="ledger-highlight"><span>Saldo atual</span><strong>{formatTokens(wallet?.balanceTokens)} <small>tk</small></strong><em>+ {formatTokens(wallet?.tokensThisMonth)} este mês</em></div><div className="ledger-summary-note"><span className="summary-icon"><Clock3 size={16} /></span><div><strong>{transactions.length} lançamentos recentes</strong><p>Veja data, material, peso, status e valor no extrato detalhado.</p></div></div><button className="full-width-button ledger-open-button" onClick={onExpand}>Ver extrato completo <ChevronRight size={15} /></button></section>;
}
function HistoryCard() {
  const { collections, loading } = useCicloData();
  return <section className="white-card history-card"><div className="section-heading"><div><span className="eyebrow">HISTÓRICO DE DEPÓSITOS</span><h2>Depósitos verificados</h2></div><span className="soft-badge">{collections.length} registros</span></div>{loading ? <div className="history-skeleton" aria-label="Carregando histórico" role="status"><span /><span /><span /><small>Carregando depósitos…</small></div> : collections.length ? <div className="collection-list">{collections.map((item) => <div className="collection-item" key={item.id}><div className="date-block"><strong>{item.date.split(" ")[0]}</strong><span>{item.date.split(" ").slice(1).join(" ")}</span></div><div className="collection-content"><strong>{item.material} <span>· {item.weightFormatted}</span></strong><span>{item.detail}</span></div></div>)}</div> : <p className="card-description">Seus depósitos aparecerão aqui após a verificação.</p>}</section>;
}

function BinMaterials() {
  const [selected, setSelected] = useState<string | null>(null);
  const { materials } = useCicloData();
  const bins = materials.map((material) => ({
    label: material.label,
    name: material.name,
    className: material.label === "MET" ? "bin-met" : material.label === "PAP" ? "bin-pap" : "bin-pls",
    what: material.whatToDiscard,
    how: material.howToPrepare,
  }));
  return <section className="white-card bin-card"><div className="section-heading"><div><span className="eyebrow">SEPARAÇÃO CORRETA</span><h2>Uma lixeira para cada material</h2></div><span className="soft-badge">guia visual</span></div><p className="card-description">Aprenda como preparar cada material antes de separar e entregar.</p><div className="guide-actions"><InstructionsCard /><LocationsCard /></div><div className="bin-layout"><div className="bin-image-wrap"><img src="/images/recycling-bins.png" alt="Lixeiras para separação de metal, papel e plástico" /></div><div className="bin-materials">{bins.map((bin) => <div className={`bin-material ${bin.className} ${selected === bin.label ? "is-selected" : ""}`} key={bin.label}><button className="bin-info-trigger" onClick={() => setSelected(selected === bin.label ? null : bin.label)} aria-expanded={selected === bin.label}><span className="bin-swatch" /><span><strong>{bin.label}</strong><small>{bin.name}</small></span><ChevronDown size={15} /></button>{selected === bin.label && <div className="bin-detail"><p><strong>O que descartar:</strong> {bin.what}</p><p><strong>Como preparar:</strong> {bin.how}</p></div>}</div>)}</div></div></section>;
}
function InitialNotification({ onClose }: { onClose: () => void }) {
  const { materials, points, user } = useCicloData();
  return <section className="initial-notification" aria-live="polite"><div className="notification-heading"><div><span className="eyebrow">NOTIFICAÇÃO INICIAL</span><h2>Seu cuidado com o meio ambiente vale tokens</h2></div><div className="notification-heading-actions"><Bell size={18} /><button className="icon-button" aria-label="Fechar instruções" onClick={onClose}><X size={16} /></button></div></div><p>Separe os materiais aceitos e identifique cada entrega com sua etiqueta {user?.identifierTag}.</p><div className="notification-steps"><article><span>01</span><div><strong>Separe</strong><p>Escolha uma das categorias aceitas e prepare o material antes de entregar.</p><ul>{materials.map((material) => <li key={material.label}><b>{material.label} ({material.name}):</b> {material.whatToDiscard} {material.howToPrepare}</li>)}</ul></div></article><article><span>02</span><div><strong>Ensacar</strong><p>Coloque cada material separado em um saco identificado.</p></div></article><article><span>03</span><div><strong>Identificar</strong><p>Escreva <b>{user?.identifierTag}</b> em um papel e cole com fita no saco. O identificador é fixo e deve acompanhar todas as entregas.</p></div></article></div><div className="notification-locations"><strong>Onde entregar</strong>{points.map((point) => <span key={point.id}>{point.code} · {point.name} — {point.hours}{point.specialNotes ? `. ${point.specialNotes}` : ''}</span>)}</div></section>;
}

function GuideNotificationsDrawer({ onClose, onReopenInstructions }: { onClose: () => void; onReopenInstructions: () => void }) {
  const { materials, points, user } = useCicloData();
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(expanded === id ? null : id);
  return <><div className="drawer-backdrop" onClick={onClose} /><aside className="notifications-drawer" role="dialog" aria-modal="true" aria-label="Central de avisos"><div className="drawer-header"><div><span className="eyebrow">GUIA DE RECICLAGEM</span><h2>Materiais e entregas</h2><p className="drawer-subtitle">Prepare cada categoria e escolha um ponto de coleta.</p></div><button className="icon-button" aria-label="Fechar guia" onClick={onClose}><X size={17} /></button></div><div className="notification-history"><article className={`notification-history-item ${expanded === "materials" ? "is-expanded" : ""}`}><button className="notification-trigger" onClick={() => toggle("materials")} aria-expanded={expanded === "materials"}><span className="notification-dot" /><span className="notification-trigger-copy"><strong>Separação dos materiais</strong><small>MET · PAP · PLS</small></span><ChevronDown size={17} className={expanded === "materials" ? "notification-chevron open" : "notification-chevron"} /></button>{expanded === "materials" && <div className="notification-expanded-content">{materials.map((material) => <div className="material-detail" key={material.label}><strong>{material.label} ({material.name})</strong><p><b>O que descartar:</b> {material.whatToDiscard}</p><p><b>Como preparar:</b> {material.howToPrepare}</p></div>)}</div>}</article><article className={`notification-history-item ${expanded === "delivery" ? "is-expanded" : ""}`}><button className="notification-trigger" onClick={() => toggle("delivery")} aria-expanded={expanded === "delivery"}><span className="notification-dot mint" /><span className="notification-trigger-copy"><strong>Ensacar e identificar</strong><small>Etiqueta {user?.identifierTag}</small></span><ChevronDown size={17} className={expanded === "delivery" ? "notification-chevron open" : "notification-chevron"} /></button>{expanded === "delivery" && <div className="notification-expanded-content"><p>Mantenha os materiais separados e escreva <strong>{user?.identifierTag}</strong> no saco para acompanhar a entrega.</p></div>}</article><article className={`notification-history-item ${expanded === "points" ? "is-expanded" : ""}`}><button className="notification-trigger" onClick={() => toggle("points")} aria-expanded={expanded === "points"}><span className="notification-dot" /><span className="notification-trigger-copy"><strong>Pontos de coleta</strong><small>{points.length} locais disponíveis</small></span><ChevronDown size={17} className={expanded === "points" ? "notification-chevron open" : "notification-chevron"} /></button>{expanded === "points" && <div className="notification-expanded-content">{points.map((point) => <div className="material-detail" key={point.id}><strong>{point.code}. {point.name}</strong><p>{point.address}</p><p>{point.hours}{point.specialNotes ? ` · ${point.specialNotes}` : ''}</p></div>)}</div>}</article></div><button className="drawer-action" onClick={onReopenInstructions}>Mostrar guia na tela <ChevronRight size={14} /></button></aside></>;
}
function NotificationsDrawer({ notifications, onClose, onReopenInstructions }: { notifications: NotificationItem[]; onClose: () => void; onReopenInstructions: () => void }) {
  const [showGuide, setShowGuide] = useState(false);
  if (showGuide) return <GuideNotificationsDrawer onClose={() => setShowGuide(false)} onReopenInstructions={onReopenInstructions} />;
  return <><div className="drawer-backdrop" onClick={onClose} /><aside className="notifications-drawer" role="dialog" aria-modal="true" aria-label="Central de avisos"><div className="drawer-header"><div><span className="eyebrow">CENTRAL DE AVISOS</span><h2>Notificações</h2><p className="drawer-subtitle">Avisos e atualizações da sua conta Ciclo.</p></div><button className="icon-button" aria-label="Fechar notificações" onClick={onClose}><X size={17} /></button></div><div className="notification-history">{notifications.length ? notifications.map((notification) => <article className={`notification-history-item ${notification.read ? "" : "is-expanded"}`} key={notification.id}><div className="notification-trigger"><span className="notification-dot" /><span className="notification-trigger-copy"><strong>{notification.title}</strong><small>{notification.subtitle} · {new Date(notification.createdAt).toLocaleDateString("pt-BR")}</small><p>{notification.message}</p></span></div></article>) : <p className="drawer-subtitle">Você ainda não recebeu notificações.</p>}</div><button className="legal-link" onClick={() => setShowGuide(true)}><CircleHelp size={15} /> Consultar guia de reciclagem <ChevronRight size={15} /></button></aside></>;
}

function HighlightModal({ title, onClose, children, className = "" }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  return <><div className="highlight-backdrop" onClick={onClose} /><div className={`highlight-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title}><div className="highlight-modal-header"><div><span className="eyebrow">VISUALIZAÇÃO DETALHADA</span><h2>{title}</h2></div><button className="icon-button" aria-label="Fechar visualização" onClick={onClose}><X size={18} /></button></div>{children}</div></>;
}

function Dashboard({ onToast, onOpenNotifications, reopenInstructions }: { onToast: (toast: NonNullable<Toast>) => void; onOpenNotifications: () => void; reopenInstructions: number }) {
  const { user } = useCicloData();
  const [showHistory, setShowHistory] = useState(false); const [showLedger, setShowLedger] = useState(false); const [showInstructions, setShowInstructions] = useState(() => window.localStorage.getItem("ciclo-guide-dismissed") !== "true");
  useEffect(() => { if (reopenInstructions > 0) { window.localStorage.removeItem("ciclo-guide-dismissed"); setShowInstructions(true); } }, [reopenInstructions]);
  return <><PageHeader overline="SUA JORNADA DE RECICLAGEM" title={<span className="greeting-title">Olá, {user?.name ?? "depositante"} <span className="header-identifier">Etiqueta {user?.identifierTag ?? ""}</span></span>} description="Veja seus depósitos verificados, o impacto gerado e seus tokens." />{showInstructions && <InitialNotification onClose={() => { window.localStorage.setItem("ciclo-guide-dismissed", "true"); setShowInstructions(false); }} />}<div className="dashboard-stack"><div className="dashboard-top-shell"><div className="token-hero-grid"><TokenCard /></div><button className="history-cta" onClick={() => setShowHistory(true)}><Check size={16} /> Ver depósitos verificados <ChevronRight size={15} /></button></div><TokenLedger onToast={onToast} onExpand={() => setShowLedger(true)} /><BinMaterials /><MaterialsChart onToast={onToast} /></div>{showHistory && <HighlightModal title="Depósitos verificados" onClose={() => setShowHistory(false)}><HistoryCard /></HighlightModal>}{showLedger && <HighlightModal title="Extrato de tokens" className="ledger-highlight-modal" onClose={() => setShowLedger(false)}><LedgerContent onToast={onToast} onExpand={() => setShowLedger(true)} /></HighlightModal>}{!showInstructions && <button className="floating-help-button" aria-label="Abrir notificações" onClick={onOpenNotifications}><Bell size={18} /><span>Notificações</span></button>}</>;
}
function Profile({ onToast, onUserUpdate }: { onToast: (toast: NonNullable<Toast>) => void; onUserUpdate: (user: User) => void }) {
  const { user } = useCicloData();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setName(user?.name ?? ""); setEmail(user?.email ?? ""); }, [user]);
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await cicloApi.updateProfile({ name, email });
      onUserUpdate(updated);
      setEditing(false);
      onToast({ title: "Perfil atualizado", detail: "Nome e e-mail salvos na sua conta." });
    } catch (error) {
      onToast({ title: "Não foi possível salvar", detail: error instanceof Error ? error.message : "Tente novamente." });
    } finally {
      setSaving(false);
    }
  };
  return <><PageHeader overline="CONTA E PRIVACIDADE" title="Meu perfil" description="Mantenha seus dados atualizados e controle como sua conta participa do Ciclo." /><div className="profile-grid"><section className="white-card profile-card"><div className="profile-intro"><div className="large-avatar profile-photo">{initials}</div><div><h2>{name || "Depositante"}</h2><p>{email}</p><span className="verified"><ShieldCheck size={14} /> Sessão autenticada pelo Ciclo</span></div></div><form className="form-section" onSubmit={save}><span className="eyebrow">INFORMAÇÕES DO USUÁRIO</span><div className="form-grid"><label>Nome completo<input value={name} onChange={(event) => setName(event.target.value)} readOnly={!editing} required minLength={2} /></label><label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} readOnly={!editing} required /></label><label>Telefone<input value="Não informado" readOnly /></label><label>Estado<input value="Não informado" readOnly /></label><label>Cidade<input value="Não informado" readOnly /></label><label>Identificador<input value={user?.identifierTag ?? ""} readOnly /></label></div>{editing ? <div className="profile-form-actions"><button className="outline-button edit-profile-button" type="submit" disabled={saving}><Check size={14} /> {saving ? "Salvando..." : "Salvar alterações"}</button><button className="outline-button" type="button" onClick={() => { setName(user?.name ?? ""); setEmail(user?.email ?? ""); setEditing(false); }}>Cancelar</button></div> : <button className="outline-button edit-profile-button" type="button" onClick={() => setEditing(true)}><UserRound size={14} /> Editar informações</button>}</form></section><aside className="profile-side"><section className="white-card consent-card"><span className="eyebrow">SEGURANÇA</span><h2>Sessão do Ciclo autenticada.</h2><p>Seu acesso é mantido por um token de sessão protegido.</p><div className="google-account"><span className="google-mark">C</span><div><strong>{email}</strong><span>Conta ativa</span></div><Check size={16} /></div><button className="legal-link" onClick={() => onToast({ title: "Termos de uso", detail: "Documento aberto para leitura." })}>Ler termos de uso <ChevronRight size={15} /></button></section><section className="security-callout"><LockKeyhole size={18} /><div><strong>Identificador protegido</strong><span>O código do usuário é usado internamente para rastrear as coletas.</span></div></section></aside></div></>;
}

export default function Home() {
  const [session, setSession] = useState<AuthSession | null>(() => loadAuthSession());
  const [profile, setProfile] = useState<User | null>(() => loadAuthSession()?.user ?? null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [depTab, setDepTab] = useState<DepTab>("dashboard");
  const [toast, setToast] = useState<Toast>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [instructionRequest, setInstructionRequest] = useState(0);
  const [data, setData] = useState<CicloData>({ user: profile, collections: [], wallet: null, transactions: [], impact: null, materials: [], points: [], notifications: [], loading: Boolean(session) });
  const notify = (next: NonNullable<Toast>) => { setToast(next); window.setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    if (!session) {
      setData({ user: null, collections: [], wallet: null, transactions: [], impact: null, materials: [], points: [], notifications: [], loading: false });
      setProfile(null);
      return;
    }

    let active = true;
    setData((current) => ({ ...current, loading: true }));
    Promise.all([
      cicloApi.getProfile(),
      cicloApi.getCollections(),
      cicloApi.getWallet(),
      cicloApi.getTransactions(),
      cicloApi.getImpact(),
      cicloApi.getMaterials(),
      cicloApi.getPoints(),
      cicloApi.getNotifications(),
    ]).then(([user, collections, wallet, transactions, impact, materials, points, notifications]) => {
      if (!active) return;
      setProfile(user);
      setData({ user, collections, wallet, transactions, impact, materials, points, notifications, loading: false });
      setNotificationUnread(notifications.filter((notification) => !notification.read).length);
    }).catch((error: unknown) => {
      if (!active) return;
      const message = error instanceof Error ? error.message : "Não foi possível carregar os dados do Ciclo.";
      setData((current) => ({ ...current, user: profile, loading: false }));
      setToast({ title: "Falha ao carregar dados", detail: message });
      if (message.toLowerCase().includes("token")) {
        saveAuthSession(null);
        setSession(null);
        setLoginError("Sua sessão expirou. Entre novamente para continuar.");
      }
    });
    return () => { active = false; };
  }, [session]);

  const handleLogin = async (credential: string) => {
    setLoginBusy(true);
    setLoginError(null);
    try {
      const nextSession = await cicloApi.login(credential);
      saveAuthSession(nextSession);
      setSession(nextSession);
      setProfile(nextSession.user);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setLoginBusy(false);
    }
  };

  if (!session) return <LoginScreen onLogin={(credential) => { void handleLogin(credential); }} onError={setLoginError} error={loginError} busy={loginBusy} />;
  const logout = () => { saveAuthSession(null); setSession(null); setLoginError(null); };
  const openNotifications = () => {
    setNotificationsOpen(true);
    setNotificationUnread(0);
    setData((current) => ({ ...current, notifications: current.notifications.map((notification) => ({ ...notification, read: true })) }));
    cicloApi.markAllNotificationsAsRead().catch((error: unknown) => {
      notify({ title: "Avisos não atualizados", detail: error instanceof Error ? error.message : "Tente novamente." });
    });
  };
  const contextData = { ...data, user: profile };
  return <CicloDataContext.Provider value={contextData}><div className="app-shell"><TopBar depTab={depTab} setDepTab={setDepTab} onToast={notify} onLogout={logout} onOpenNotifications={openNotifications} unreadCount={notificationUnread} /><div className="app-layout"><SideRail depTab={depTab} setDepTab={setDepTab} onToast={notify} /><main className="main-content">{depTab === "dashboard" ? <Dashboard onToast={notify} onOpenNotifications={openNotifications} reopenInstructions={instructionRequest} /> : <Profile onToast={notify} onUserUpdate={(user) => { setProfile(user); setData((current) => ({ ...current, user })); }} />}</main></div>{notificationsOpen && <NotificationsDrawer notifications={data.notifications} onClose={() => setNotificationsOpen(false)} onReopenInstructions={() => { window.localStorage.removeItem("ciclo-guide-dismissed"); setNotificationsOpen(false); setDepTab("dashboard"); setInstructionRequest((value) => value + 1); }} />}{toast && <div className="toast"><div className="toast-check"><Check size={15} /></div><div><strong>{toast.title}</strong><span>{toast.detail}</span></div><button onClick={() => setToast(null)}><X size={15} /></button></div>}</div></CicloDataContext.Provider>;
}
