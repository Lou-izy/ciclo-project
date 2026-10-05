import { useEffect, useState, type ReactNode } from "react";
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
  CircleDashed,
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

const collections = [
  { date: "06 set 2026", material: "MET", weight: "3,80 kg", status: "Em análise", detail: "Aguardando validação do peso" },
  { date: "02 set 2026", material: "PET", weight: "2,45 kg", status: "Verificado", detail: "Tokens liberados" },
  { date: "27 ago 2026", material: "PLA", weight: "1,70 kg", status: "Verificado", detail: "Tokens liberados" },
  { date: "22 ago 2026", material: "PET", weight: "4,10 kg", status: "Verificado", detail: "Tokens liberados" },
];

const movements = [
  { date: "06 set 2026", time: "14:32", title: "Tokens por coleta verificada", amount: "+ 184", positive: true, detail: "MET · 3,80 kg", status: "Verificado" },
  { date: "02 set 2026", time: "09:15", title: "Tokens por coleta verificada", amount: "+ 126", positive: true, detail: "PET · 2,45 kg", status: "Verificado" },
  { date: "27 ago 2026", time: "11:48", title: "Tokens por coleta verificada", amount: "+ 92", positive: true, detail: "PLA · 1,70 kg", status: "Verificado" },
  { date: "22 ago 2026", time: "16:05", title: "Tokens por coleta verificada", amount: "+ 210", positive: true, detail: "PET · 4,10 kg", status: "Verificado" },
  { date: "18 ago 2026", time: "10:26", title: "Tokens por coleta verificada", amount: "+ 148", positive: true, detail: "MET · 2,95 kg", status: "Verificado" },
  { date: "12 ago 2026", time: "13:40", title: "Tokens por coleta verificada", amount: "+ 176", positive: true, detail: "PET · 3,30 kg", status: "Verificado" },
  { date: "08 ago 2026", time: "08:52", title: "Tokens por coleta verificada", amount: "+ 84", positive: true, detail: "PLA · 1,20 kg", status: "Verificado" },
  { date: "01 ago 2026", time: "15:17", title: "Tokens por coleta verificada", amount: "+ 132", positive: true, detail: "MET · 2,60 kg", status: "Verificado" },
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
  return <main className="login-shell"><div className="login-orbit orbit-one" /><div className="login-orbit orbit-two" /><div className="login-card"><Logo /><span className="eyebrow">ACESSO DO DEPOSITADOR</span><h1>Recicle. Acompanhe.<br /><em>Transforme.</em></h1><p>Uma conta para acompanhar suas coletas, materiais e saldo em tokens.</p><button className="google-button" onClick={onLogin}><GoogleMark /> Continuar com Google <ChevronRight size={17} /></button><div className="login-note"><ShieldCheck size={15} /> Login seguro e simplificado. Usamos apenas sua conta Google.</div></div><div className="login-art login-art-reference"><img src="/manus-storage/login-shapes_ba0f3fe8.png" alt="Composição abstrata com formas coloridas" /><div className="login-art-overlay" /><span className="art-label">ciclo / impacto real</span><p>O que você separa hoje<br /><strong>volta para o ciclo.</strong></p></div></main>;
}

function TopBar({ depTab, setDepTab, onToast, onLogout, onOpenNotifications, unreadCount }: { depTab: DepTab; setDepTab: (tab: DepTab) => void; onToast: (toast: NonNullable<Toast>) => void; onLogout: () => void; onOpenNotifications: () => void; unreadCount: number }) {
  const [accountOpen, setAccountOpen] = useState(false);
  return <header className="topbar"><div className="topbar-inner"><Logo /><nav className="top-nav"><button className={depTab === "dashboard" ? "active" : ""} onClick={() => setDepTab("dashboard")}><HomeIcon size={16} /> Visão geral</button><button className={depTab === "perfil" ? "active" : ""} onClick={() => setDepTab("perfil")}><UserRound size={16} /> Meu perfil</button></nav><div className="topbar-actions"><span className="account-status"><span className="status-dot" /> Conta conectada</span><button className="icon-button notification-bell" aria-label={`Abrir notificações${unreadCount ? `, ${unreadCount} não lidas` : ""}`} onClick={onOpenNotifications}><Bell size={18} />{unreadCount > 0 && <span className="notification-count" aria-label={`${unreadCount} notificações não lidas`}>{unreadCount}</span>}</button><button className="avatar" onClick={() => setAccountOpen(!accountOpen)} aria-label="Abrir conta">MC</button>{accountOpen && <div className="account-menu"><strong>Marina Costa</strong><span>marina.costa@email.com</span><button onClick={onLogout}><LogOut size={15} /> Sair</button></div>}</div></div></header>;
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

function MaterialsChart({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  const shareResults = async () => {
    const shareData = { title: "Meu impacto no Ciclo", text: "Conquistei 19,1 kg de impacto positivo separando MET, PET e PLA no Ciclo — e já transformei minhas entregas em tokens. Venha fazer parte do projeto, cuide do ambiente e faça seu impacto voltar para o ciclo!", url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else onToast({ title: "Resultados prontos para compartilhar", detail: "O compartilhamento nativo não está disponível neste dispositivo." });
    } catch { /* cancelamento do compartilhamento não exige feedback */ }
  };
  return <section className="white-card materials-card"><div className="section-heading"><div><span className="eyebrow">IMPACTO ACUMULADO</span><h2>Materiais coletados</h2></div><BarChart3 size={19} /></div><p className="card-description">Peso verificado por tipo de material.</p><div className="bar-chart">{materialBars.map((bar) => <div className="bar-row" key={bar.label}><div className="bar-label"><strong>{bar.label}</strong><span>{bar.name}</span></div><div className="bar-track"><div className={`bar-fill ${bar.className}`} style={{ width: `${bar.percent}%` }} /></div><b>{bar.value.toFixed(1).replace(".", ",")} kg</b></div>)}</div><div className="chart-total"><span>Total separado</span><strong>19,1 kg</strong></div><button className="share-results-button" onClick={shareResults}><Share2 size={15} /> Compartilhar meus resultados</button></section>;
}

function LocationsCard() {
  const [open, setOpen] = useState(false);
  return <section className={`white-card expandable-card ${open ? "is-open" : ""}`}><button className="expand-trigger" onClick={() => setOpen(!open)} aria-expanded={open}><span><span className="eyebrow">ONDE ENTREGAR</span><strong>Veja os pontos de coleta</strong></span><span className="expand-icon"><ChevronDown size={18} /></span></button>{open && <div className="expand-content"><p className="card-description">Escolha o ponto mais conveniente para entregar seu saco identificado.</p><div className="location-list"><div className="location-item"><span className="location-index">01</span><div><strong>Praça das Artes</strong><span>Seg–sáb · 08:00–19:00</span></div><span className="open-pill">Aberto</span></div><div className="location-item"><span className="location-index">02</span><div><strong>Mercado Central</strong><span>Seg–dom · 07:00–21:00</span></div><span className="open-pill">Aberto</span></div></div><div className="holiday-alert"><CircleAlert size={15} /><span><strong>Feriado em 07/09:</strong> Praça das Artes fecha às 13h.</span></div></div>}</section>;
}

function LedgerContent({ onToast, onExpand }: { onToast: (toast: NonNullable<Toast>) => void; onExpand?: () => void }) {
  const downloadPdf = () => {
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
      commands.push(text("Marina Costa · ID #48237", 380, 708, 9, "F1", "0.42 0.39 0.45"));
      commands.push("0.86 0.80 0.92 rg 54 642 487 44 re f");
      commands.push(text("SALDO ATUAL", 70, 668, 8, "F2", "0.32 0.28 0.39"));
      commands.push(text("2.480 tk", 70, 650, 20, "F2", "0.16 0.14 0.18"));
      commands.push(text("+ 402 tokens no mes corrente", 390, 653, 9, "F1", "0.32 0.28 0.39"));
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
  return <><div className="ledger-highlight ledger-detail-highlight"><span className="ledger-detail-label">Saldo atual</span><strong className="ledger-detail-value">2.480 <small className="ledger-detail-unit">tk</small></strong><em className="ledger-detail-month">+ 402 este mês</em></div><div className="ledger-list-header ledger-detail-header"><span>Lançamentos por data</span><b className="ledger-detail-count">3 lançamentos</b></div><div className="movement-list ledger-scroll ledger-detail-scroll">{movements.slice(0, 3).map((movement) => <div className="token-movement ledger-detail-row" key={movement.date + movement.time}><div className="date-block ledger-detail-date"><strong>{movement.date.split(" ")[0]}</strong><span className="ledger-detail-month-label">{movement.date.split(" ").slice(1).join(" ")}</span></div><div className="token-movement-content ledger-detail-content"><strong className="ledger-detail-title">{movement.title}</strong><span className="ledger-detail-meta">{movement.detail} · {movement.time}</span><small className="ledger-detail-status">{movement.status}</small></div><b className="positive token-amount ledger-detail-amount">{movement.amount} tk</b></div>)}</div><div className="ledger-actions ledger-detail-actions"><button className="full-width-button" onClick={() => onExpand?.()}>Ver extrato completo <ChevronRight size={15} /></button><button className="download-pdf-button" onClick={downloadPdf}><Download size={15} /> Baixar PDF</button></div></>;

}
function TokenLedger({ onToast, onExpand }: { onToast: (toast: NonNullable<Toast>) => void; onExpand: () => void }) {
  return <section className="white-card token-ledger token-ledger-summary"><div className="section-heading"><div><span className="eyebrow">EXTRATO DE TOKENS</span><h2>Movimentações recentes</h2></div><button className="icon-button subtle" aria-label="Expandir extrato" onClick={onExpand}><BarChart3 size={17} /></button></div><div className="ledger-highlight"><span>Saldo atual</span><strong>2.480 <small>tk</small></strong><em>+ 402 este mês</em></div><div className="ledger-summary-note"><span className="summary-icon"><Clock3 size={16} /></span><div><strong>3 lançamentos recentes</strong><p>Veja data, material, peso, status e valor no extrato detalhado.</p></div></div><button className="full-width-button ledger-open-button" onClick={onExpand}>Ver extrato completo <ChevronRight size={15} /></button></section>;
}
function HistoryCard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 560);
    return () => window.clearTimeout(timer);
  }, []);
  return <section className="white-card history-card"><div className="section-heading"><div><span className="eyebrow">HISTÓRICO POR DATA</span><h2>Suas entregas</h2></div><span className="soft-badge">4 registros</span></div>{loading ? <div className="history-skeleton" aria-label="Carregando histórico" role="status"><span /><span /><span /><small>Carregando entregas…</small></div> : <div className="collection-list">{collections.map((item) => <div className="collection-item" key={item.date}><div className="date-block"><strong>{item.date.split(" ")[0]}</strong><span>{item.date.split(" ")[1]} {item.date.split(" ")[2]}</span></div><div className="collection-content"><strong>{item.material} <span>· {item.weight}</span></strong><span>{item.detail}</span></div><span className={`collection-status ${item.status === "Em análise" ? "review" : "verified-status"}`}>{item.status}</span></div>)}</div>}</section>;
}

function BinMaterials() {
  const [selected, setSelected] = useState<string | null>(null);
  const bins = [
    { label: "MET", name: "Metal", className: "bin-metal", what: "Latas de alumínio, latas de aço ou flandres, tampinhas de garrafas de vidro, arames, pregos e pequenas ferragens.", how: "Esvazie todo o conteúdo, passe água de reuso nas latas de conservas e amasse as latas de alumínio para otimizar o espaço." },
    { label: "PET", name: "Plástico PET", className: "bin-pet", what: "Garrafas transparentes ou coloridas de água, refrigerantes, sucos e chás, embalagens de óleo de soja e alguns frascos de cosméticos.", how: "Retire todo o líquido, amasse a garrafa do fundo para o gargalo e feche com a própria tampa para reduzir o volume." },
    { label: "PLA", name: "Plástico PLA", className: "bin-pla", what: "Copos, talheres, potes e embalagens com selo biodegradável/compostável, além de sobras e suportes de filamentos de impressão 3D.", how: "Não misture com PET: o PLA requer compostagem industrial. Remova restos de comida antes de depositar na lixeira exclusiva." },
  ];
  return <section className="white-card bin-card"><div className="section-heading"><div><span className="eyebrow">SEPARAÇÃO CORRETA</span><h2>Uma lixeira para cada material</h2></div><span className="soft-badge">guia visual</span></div><p className="card-description">Aprenda como preparar cada material antes de separar e entregar.</p><div className="guide-actions"><InstructionsCard /><LocationsCard /></div><div className="bin-layout"><div className="bin-image-wrap"><img src="/manus-storage/pasted_file_Go6Gd1_image_058fa20e.png" alt="Três lixeiras coloridas para separação de materiais" /></div><div className="bin-materials">{bins.map((bin) => <div className={`bin-material ${bin.className} ${selected === bin.label ? "is-selected" : ""}`} key={bin.label}><button className="bin-info-trigger" onClick={() => setSelected(selected === bin.label ? null : bin.label)} aria-expanded={selected === bin.label}><span className="bin-swatch" /><span><strong>{bin.label}</strong><small>{bin.name}</small></span><ChevronDown size={15} /></button>{selected === bin.label && <div className="bin-detail"><p><strong>O que descartar:</strong> {bin.what}</p><p><strong>Como preparar:</strong> {bin.how}</p></div>}</div>)}</div></div></section>;
}
function InitialNotification({ onClose }: { onClose: () => void }) {
  return <section className="initial-notification" aria-live="polite"><div className="notification-heading"><div><span className="eyebrow">NOTIFICAÇÃO INICIAL</span><h2>Seu cuidado com o meio ambiente vale tokens</h2></div><div className="notification-heading-actions"><Bell size={18} /><button className="icon-button" aria-label="Fechar instruções" onClick={onClose}><X size={16} /></button></div></div><p>O projeto incentiva a reciclagem recompensando você por cada entrega correta.</p><div className="notification-steps"><article><span>01</span><div><strong>Separe</strong><p>Separe o lixo por material: <b>MET, PET ou PLA</b>. Consulte os detalhes de preparo em cada lixeira.</p><ul><li><b>MET:</b> esvazie, lave com água de reuso e amasse latas de alumínio.</li><li><b>PET:</b> retire o líquido, amasse do fundo ao gargalo e feche com a tampa.</li><li><b>PLA:</b> use apenas materiais biodegradáveis/compostáveis; não misture com PET e remova restos de comida.</li></ul></div></article><article><span>02</span><div><strong>Ensacar</strong><p>Coloque os materiais já separados em um saco de lixo.</p></div></article><article><span>03</span><div><strong>Identificar</strong><p>Escreva seu identificador, por exemplo <b>#48237</b>, em um papel e cole com fita no saco. O identificador é fixo e deve acompanhar todas as entregas.</p></div></article></div><div className="notification-locations"><strong>Onde entregar</strong><span>01 · Praça das Artes — segunda a sábado, 08:00–19:00. No feriado de 07/09, fecha às 13h.</span><span>02 · Mercado Central — segunda a domingo, 07:00–21:00.</span></div></section>;
}

function NotificationsDrawer({ onClose, onReopenInstructions }: { onClose: () => void; onReopenInstructions: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded(expanded === id ? null : id);
  return <><div className="drawer-backdrop" onClick={onClose} /><aside className="notifications-drawer" role="dialog" aria-label="Central de Avisos"><div className="drawer-header"><div><span className="eyebrow">CENTRAL DE AVISOS</span><h2>Notificações</h2><p className="drawer-subtitle">Avisos importantes e instruções fixadas para consultar quando quiser.</p></div><button className="icon-button" aria-label="Fechar notificações" onClick={onClose}><X size={17} /></button></div><div className="notification-history"><article className={`notification-history-item ${expanded === "guide" ? "is-expanded" : ""}`}><button className="notification-trigger" onClick={() => toggle("guide")} aria-expanded={expanded === "guide"}><span className="notification-dot" /><span className="notification-trigger-copy"><strong>Como participar do Ciclo</strong><small>Guia essencial · fixado</small></span><ChevronDown size={17} className={expanded === "guide" ? "notification-chevron open" : "notification-chevron"} /></button>{expanded === "guide" && <div className="notification-expanded-content"><p>Para participar e começar a acumular seus tokens, siga os três passos simples abaixo:</p><div className="notification-detail-step"><b>01. Separe</b><p>Para garantir que os materiais fiquem separados e cada coleta seja pesada corretamente, separe o lixo por material: <strong>MET, PET ou PLA</strong>. Aprenda como preparar cada material antes de separar e entregar.</p><div className="material-detail"><strong>MET (Metal)</strong><p><b>O que descartar:</b> Latas de alumínio (refrigerante, suco, cerveja), latas de aço ou flandres (milho, ervilha, sardinha), tampinhas de garrafas de vidro, arames, pregos e pequenas ferragens.</p><p><b>Como preparar:</b> Esvazie todo o conteúdo. É recomendável passar uma água de reuso nas latas de conservas para evitar mau cheiro e não atrair vetores. Amasse as latas de alumínio para otimizar o espaço na lixeira.</p></div><div className="material-detail"><strong>PET (Plástico PET)</strong><p><b>O que descartar:</b> Garrafas transparentes ou coloridas de água, refrigerantes, sucos, chás, além de embalagens de óleo de soja e alguns frascos de cosméticos.</p><p><b>Como preparar:</b> Retire todo o líquido. Retire o ar amassando a garrafa do fundo para o gargalo e feche com a própria tampa para manter o formato reduzido. Isso economiza espaço e facilita a pesagem.</p></div><div className="material-detail"><strong>PLA (Plástico PLA)</strong><p><b>O que descartar:</b> Copos descartáveis, talheres, potes e embalagens transparentes com selo biodegradável/compostável, além de sobras e suportes de filamentos de impressão 3D.</p><p><b>Como preparar:</b> O PLA não pode ser misturado com plásticos convencionais, como PET, pois requer compostagem industrial. Remova restos de comida antes de depositá-lo na lixeira exclusiva.</p></div></div><div className="notification-detail-step"><b>02. Ensacar</b><p>Coloque os materiais já separados em um saco de lixo.</p></div><div className="notification-detail-step"><b>03. Identificar</b><p>Escreva seu identificador, por exemplo <strong>#48237</strong>, em um papel e cole com fita no saco. <strong>Atenção:</strong> seu identificador é fixo e deve acompanhar todas as entregas para que os tokens sejam creditados corretamente.</p></div><div className="notification-location-detail"><strong>📍 Onde entregar</strong><p>Escolha o ponto mais conveniente para entregar seu saco identificado:</p><p><b>01. Praça das Artes:</b> segunda a sábado, das 08:00 às 19:00. No feriado de 07/09, fecha às 13h.</p><p><b>02. Mercado Central:</b> segunda a domingo, das 07:00 às 21:00.</p></div><button className="drawer-action" onClick={onReopenInstructions}>Mostrar guia na tela <ChevronRight size={14} /></button></div>}</article><article className={`notification-history-item ${expanded === "updates" ? "is-expanded" : ""}`}><button className="notification-trigger" onClick={() => toggle("updates")} aria-expanded={expanded === "updates"}><span className="notification-dot mint" /><span className="notification-trigger-copy"><strong>Instruções disponíveis</strong><small>Consulte materiais e pontos de coleta</small></span><ChevronDown size={17} className={expanded === "updates" ? "notification-chevron open" : "notification-chevron"} /></button>{expanded === "updates" && <div className="notification-expanded-content"><p>O guia completo de separação, preparo dos materiais e locais de entrega está disponível nesta Central de Avisos.</p><small className="pinned-note">Aviso fixado para consulta.</small></div>}</article></div></aside></>;
}
function HighlightModal({ title, onClose, children, className = "" }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  return <><div className="highlight-backdrop" onClick={onClose} /><div className={`highlight-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title}><div className="highlight-modal-header"><div><span className="eyebrow">VISUALIZAÇÃO DETALHADA</span><h2>{title}</h2></div><button className="icon-button" aria-label="Fechar visualização" onClick={onClose}><X size={18} /></button></div>{children}</div></>;
}

function Dashboard({ onToast, onOpenNotifications, reopenInstructions }: { onToast: (toast: NonNullable<Toast>) => void; onOpenNotifications: () => void; reopenInstructions: number }) {
  const [showHistory, setShowHistory] = useState(false); const [showLedger, setShowLedger] = useState(false); const [showInstructions, setShowInstructions] = useState(() => window.localStorage.getItem("ciclo-guide-dismissed") !== "true");
  useEffect(() => { if (reopenInstructions > 0) { window.localStorage.removeItem("ciclo-guide-dismissed"); setShowInstructions(true); } }, [reopenInstructions]);
  return <><PageHeader overline="SEGUNDA-FEIRA · 07 SET 2026" title={<span className="greeting-title">Olá, Marina <span className="header-identifier">Etiqueta #48237</span></span>} description="Acompanhe o que você separou, o impacto gerado e seus tokens." />{showInstructions && <InitialNotification onClose={() => { window.localStorage.setItem("ciclo-guide-dismissed", "true"); setShowInstructions(false); }} />}<div className="dashboard-stack"><div className="dashboard-top-shell"><div className="token-hero-grid"><TokenCard /><section className="white-card active-status-card"><div className="card-heading"><div><span className="eyebrow">ÚLTIMA ENTREGA</span><h2>Acompanhe sua coleta</h2></div><span className="status-badge dark">Em análise</span></div><p className="muted-copy">O peso está sendo validado pela equipe. Os tokens serão liberados após a conferência.</p><StatusTrack /><button className="history-cta" onClick={() => setShowHistory(true)} aria-expanded={showHistory}><Clock3 size={16} /> Ver histórico de entregas <ChevronRight size={15} /></button></section></div></div><TokenLedger onToast={onToast} onExpand={() => setShowLedger(true)} /><BinMaterials /><MaterialsChart onToast={onToast} /></div>{showHistory && <HighlightModal title="Histórico de entregas" onClose={() => setShowHistory(false)}><HistoryCard /></HighlightModal>}{showLedger && <HighlightModal title="Extrato de tokens" className="ledger-highlight-modal" onClose={() => setShowLedger(false)}><LedgerContent onToast={onToast} onExpand={() => setShowLedger(true)} /></HighlightModal>}{!showInstructions && <button className="floating-help-button" aria-label="Abrir notificações" onClick={onOpenNotifications}><Bell size={18} /><span>Notificações</span></button>}</>;
}
function Profile({ onToast }: { onToast: (toast: NonNullable<Toast>) => void }) {
  return <><PageHeader overline="CONTA E PRIVACIDADE" title="Meu perfil" description="Mantenha seus dados atualizados e controle como sua conta participa do Ciclo." /><div className="profile-grid"><section className="white-card profile-card"><div className="profile-intro"><div className="large-avatar profile-photo">MC</div><div><h2>Marina Costa</h2><p>marina.costa@email.com</p><span className="verified"><ShieldCheck size={14} /> Login feito pelo Google</span></div></div><div className="form-section"><span className="eyebrow">INFORMAÇÕES DO USUÁRIO</span><div className="form-grid"><label>Nome completo<input value="Marina Costa" readOnly /></label><label>E-mail<input value="marina.costa@email.com" readOnly /></label><label>Telefone<input value="(11) 98888-7766" readOnly /></label><label>Estado<input value="São Paulo" readOnly /></label><label>Cidade<input value="São Paulo" readOnly /></label><label>Identificador<input value="Identificador único" readOnly /></label></div><button className="outline-button edit-profile-button" onClick={() => onToast({ title: "Edição de perfil", detail: "Campos pessoais liberados para alteração." })}><UserRound size={14} /> Editar informações</button></div></section><aside className="profile-side"><section className="white-card consent-card"><span className="eyebrow">SEGURANÇA</span><h2>Conta Google conectada.</h2><p>Seu acesso é feito exclusivamente pela conta Google. Não há senha do Ciclo para guardar.</p><div className="google-account"><span className="google-mark">G</span><div><strong>marina.costa@email.com</strong><span>Conta verificada</span></div><Check size={16} /></div><button className="legal-link" onClick={() => onToast({ title: "Termos de uso", detail: "Documento aberto para leitura." })}>Ler termos de uso <ChevronRight size={15} /></button></section><section className="security-callout"><LockKeyhole size={18} /><div><strong>Identificador protegido</strong><span>O código do usuário é usado internamente para rastrear as coletas.</span></div></section></aside></div></>;
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false); const [depTab, setDepTab] = useState<DepTab>("dashboard"); const [toast, setToast] = useState<Toast>(null); const [notificationsOpen, setNotificationsOpen] = useState(false); const [notificationUnread, setNotificationUnread] = useState(() => { const saved = Number(window.localStorage.getItem("ciclo-notification-unread")); return Number.isFinite(saved) ? saved : 2; }); const [instructionRequest, setInstructionRequest] = useState(0);
  const notify = (next: NonNullable<Toast>) => { setToast(next); window.setTimeout(() => setToast(null), 3500); };
  if (!authenticated) return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  const openNotifications = () => { setNotificationsOpen(true); setNotificationUnread(0); window.localStorage.setItem("ciclo-notification-unread", "0"); };
  return <div className="app-shell"><TopBar depTab={depTab} setDepTab={setDepTab} onToast={notify} onLogout={() => setAuthenticated(false)} onOpenNotifications={openNotifications} unreadCount={notificationUnread} /><div className="app-layout"><SideRail depTab={depTab} setDepTab={setDepTab} onToast={notify} /><main className="main-content">{depTab === "dashboard" ? <Dashboard onToast={notify} onOpenNotifications={openNotifications} reopenInstructions={instructionRequest} /> : <Profile onToast={notify} />}</main></div>{notificationsOpen && <NotificationsDrawer onClose={() => setNotificationsOpen(false)} onReopenInstructions={() => { window.localStorage.removeItem("ciclo-guide-dismissed"); setNotificationsOpen(false); setDepTab("dashboard"); setInstructionRequest((value) => value + 1); }} />}{toast && <div className="toast"><div className="toast-check"><Check size={15} /></div><div><strong>{toast.title}</strong><span>{toast.detail}</span></div><button onClick={() => setToast(null)}><X size={15} /></button></div>}</div>;
}
