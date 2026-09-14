/**
 * ZIP mínimo, método "store" (sem compressão).
 *
 * PNG já é um formato comprimido: passar deflate por cima gasta CPU e ganha ~0%.
 * Escrever aqui evita uma dependência nova no projeto por ~60 linhas.
 * Formato: APPNOTE 6.3.2, sem Zip64 (suficiente até 4 GB e 65535 arquivos).
 */

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Data/hora no formato MS-DOS que o ZIP usa. */
function dataDos(d: Date): { hora: number; data: number } {
  return {
    hora: (d.getHours() << 11) | (d.getMinutes() << 5) | (Math.floor(d.getSeconds() / 2)),
    data: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

export interface ArquivoZip { nome: string; dados: Uint8Array }

export function montarZip(arquivos: ArquivoZip[], quando = new Date()): Blob {
  const { hora, data } = dataDos(quando);
  const codificador = new TextEncoder();
  const locais: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let deslocamento = 0;

  for (const arq of arquivos) {
    const nome = codificador.encode(arq.nome);
    const crc = crc32(arq.dados);
    const tam = arq.dados.length;

    const cabecalho = new Uint8Array(30 + nome.length);
    const v = new DataView(cabecalho.buffer);
    v.setUint32(0, 0x04034b50, true);   // assinatura local
    v.setUint16(4, 20, true);           // versão necessária
    v.setUint16(6, 0x0800, true);       // flag: nome em UTF-8
    v.setUint16(8, 0, true);            // método: store
    v.setUint16(10, hora, true);
    v.setUint16(12, data, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, tam, true);         // comprimido
    v.setUint32(22, tam, true);         // original
    v.setUint16(26, nome.length, true);
    v.setUint16(28, 0, true);           // extra
    cabecalho.set(nome, 30);
    locais.push(cabecalho, arq.dados);

    const dir = new Uint8Array(46 + nome.length);
    const dv = new DataView(dir.buffer);
    dv.setUint32(0, 0x02014b50, true);  // assinatura central
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 20, true);
    dv.setUint16(8, 0x0800, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, hora, true);
    dv.setUint16(14, data, true);
    dv.setUint32(16, crc, true);
    dv.setUint32(20, tam, true);
    dv.setUint32(24, tam, true);
    dv.setUint16(28, nome.length, true);
    dv.setUint32(42, deslocamento, true);
    dir.set(nome, 46);
    central.push(dir);

    deslocamento += cabecalho.length + tam;
  }

  const tamCentral = central.reduce((s, d) => s + d.length, 0);
  const fim = new Uint8Array(22);
  const fv = new DataView(fim.buffer);
  fv.setUint32(0, 0x06054b50, true);
  fv.setUint16(8, arquivos.length, true);
  fv.setUint16(10, arquivos.length, true);
  fv.setUint32(12, tamCentral, true);
  fv.setUint32(16, deslocamento, true);

  // concatena num único buffer: passar `u.buffer` direto entregaria o buffer inteiro
  // quando os dados chegam como view de um maior, e o ZIP sairia corrompido.
  const pedacos = [...locais, ...central, fim];
  const total = pedacos.reduce((s, p) => s + p.length, 0);
  const saida = new Uint8Array(total);
  let pos = 0;
  for (const p of pedacos) { saida.set(p, pos); pos += p.length; }
  return new Blob([saida.buffer], { type: "application/zip" });
}
