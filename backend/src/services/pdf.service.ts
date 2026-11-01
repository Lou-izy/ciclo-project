import { db } from '../database/db.js';

export class PdfService {
  /**
   * Generates a raw PDF-1.4 binary buffer for the user's token statement.
   */
  public static async generateStatementPdf(userId: string): Promise<Buffer> {
    const [storedUser, txs] = await Promise.all([
      db.getUserById(userId),
      db.getTransactions(userId),
    ]);
    const user = storedUser || {
      name: 'Depositador Ciclo',
      identifierTag: '#48237',
    };

    const escapePdf = (text: string) =>
      text
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');

    const textCmd = (
      txt: string,
      x: number,
      y: number,
      size = 10,
      font = 'F1',
      color = '0 0 0'
    ) =>
      `BT /${font} ${size} Tf ${color} rg ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdf(txt)}) Tj ET`;

    const lineCmd = (x1: number, y1: number, x2: number, y2: number) =>
      `0.85 0.85 0.85 RG 0.5 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`;

    const cmds: string[] = [];

    // Header
    cmds.push(textCmd('CICLO — RASTREIO DE RECICLAGEM', 54, 780, 16, 'F2', '0.1 0.4 0.25'));
    cmds.push(textCmd('EXTRATO OFICIAL DE TOKENS E IMPACTO', 54, 762, 10, 'F1', '0.4 0.4 0.4'));
    cmds.push(lineCmd(54, 748, 541, 748));

    // User Info Box
    cmds.push(textCmd(`Depositador: ${user.name}`, 54, 725, 10, 'F2', '0.1 0.1 0.1'));
    cmds.push(textCmd(`Identificador: ${user.identifierTag}`, 380, 725, 10, 'F2', '0.1 0.4 0.25'));
    cmds.push(
      textCmd(
        `Emitido em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
        54,
        710,
        8,
        'F1',
        '0.5 0.5 0.5'
      )
    );
    cmds.push(lineCmd(54, 698, 541, 698));

    // Table Header
    cmds.push(textCmd('DATA / HORA', 54, 680, 9, 'F2', '0.3 0.3 0.3'));
    cmds.push(textCmd('DESCRICAO / MATERIAL', 165, 680, 9, 'F2', '0.3 0.3 0.3'));
    cmds.push(textCmd('STATUS', 390, 680, 9, 'F2', '0.3 0.3 0.3'));
    cmds.push(textCmd('VALOR', 485, 680, 9, 'F2', '0.3 0.3 0.3'));
    cmds.push(lineCmd(54, 670, 541, 670));

    // Rows
    let y = 650;
    const items = txs.slice(0, 12);
    items.forEach((item) => {
      cmds.push(textCmd(`${item.date}, ${item.time}`, 54, y, 9, 'F1', '0.2 0.2 0.2'));
      cmds.push(textCmd(item.title, 165, y, 9, 'F2', '0.1 0.1 0.1'));
      cmds.push(textCmd(item.detail, 165, y - 12, 8, 'F1', '0.45 0.45 0.45'));
      cmds.push(textCmd(item.status, 390, y, 8, 'F1', '0.2 0.5 0.3'));
      cmds.push(textCmd(`${item.amountFormatted} tk`, 485, y, 9, 'F2', '0.15 0.55 0.35'));
      cmds.push(lineCmd(54, y - 20, 541, y - 20));
      y -= 38;
    });

    // Footer
    cmds.push(lineCmd(54, 70, 541, 70));
    cmds.push(
      textCmd(
        'Obrigado por transformar residuos em recursos e fortalecer a reciclagem!',
        54,
        55,
        8,
        'F1',
        '0.4 0.4 0.4'
      )
    );
    cmds.push(textCmd('ciclorastrei.manus.space', 440, 55, 8, 'F2', '0.1 0.4 0.25'));

    const contentStream = cmds.join('\n');
    const contentLen = Buffer.byteLength(contentStream, 'utf8');

    // Build PDF structures
    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>\nendobj',
      `4 0 obj\n<< /Length ${contentLen} >>\nstream\n${contentStream}\nendstream\nendobj`,
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
      '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];

    objects.forEach((obj) => {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += obj + '\n';
    });

    const startXref = Buffer.byteLength(pdf, 'utf8');
    pdf += 'xref\n';
    pdf += `0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.slice(1).forEach((off) => {
      pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
    });

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

    return Buffer.from(pdf, 'utf8');
  }
}
