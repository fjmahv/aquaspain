// Adaptador para el nuevo JSON optimizado de ETL
export function parseHydroJson(jsonData: any) {
  const records = jsonData.datos || [];
  const meta = jsonData.metadatos || {};
  
  if (records.length === 0) return { basins: [], reservoirs: [], dataDate: null, syncDate: new Date().toISOString() };

  const latestDate = records[0].f; 

  const reservoirs = records.map((r: any) => {
    const curP = (r.aa / r.at) * 100;
    const preP = r.m1s !== undefined && r.m1s !== null ? (r.m1s / r.at) * 100 : curP; 
    const avgP = r.ht ? (r.ht / r.at) * 100 : 0;

    return {
      id: `res-${r.en}`,
      name: r.en,
      basin: r.an,
      capacity: r.at,
      current: r.aa,
      variation: curP - preP,
      avg10yP: avgP,
      m1m: r.m1m ?? r.aa,
      ma1: r.ma1 ?? r.aa,
      h3a: r.h3a ?? r.aa,
      h5a: r.h5a ?? r.aa,
      h10a: r.h10a ?? r.aa
    };
  });

  const basinMap: any = {};
  records.forEach((r: any) => {
    if (!basinMap[r.an]) {
      // Añadimos los campos a inicializar
      basinMap[r.an] = { 
        name: r.an, cur: 0, cap: 0, prev: 0, ht: 0,
        m1m: 0, ma1: 0, h3a: 0, h5a: 0, h10a: 0
      };
    }
    basinMap[r.an].cur += r.aa;
    basinMap[r.an].cap += r.at;
    basinMap[r.an].prev += (r.m1s !== undefined && r.m1s !== null ? r.m1s : r.aa);
    basinMap[r.an].ht += (r.ht || 0);
    
    // Sumamos los históricos a la cuenca total
    basinMap[r.an].m1m += (r.m1m ?? r.aa);
    basinMap[r.an].ma1 += (r.ma1 ?? r.aa);
    basinMap[r.an].h3a += (r.h3a ?? r.aa);
    basinMap[r.an].h5a += (r.h5a ?? r.aa);
    basinMap[r.an].h10a += (r.h10a ?? r.aa);
  });

  const basins = Object.entries(basinMap).map(([name, d]: any, i) => ({
    id: `b-${i}`,
    name,
    current: d.cur,
    capacity: d.cap,
    variation: (d.cur / d.cap) * 100 - (d.prev / d.cap) * 100,
    avg10yP: (d.ht / d.cap) * 100,
    // Calculamos el % de cada histórico
    m1mP: d.cap > 0 ? (d.m1m / d.cap) * 100 : 0,
    ma1P: d.cap > 0 ? (d.ma1 / d.cap) * 100 : 0,
    h3aP: d.cap > 0 ? (d.h3a / d.cap) * 100 : 0,
    h5aP: d.cap > 0 ? (d.h5a / d.cap) * 100 : 0,
    h10aP: d.cap > 0 ? (d.h10a / d.cap) * 100 : 0,
  }));

  return { basins, reservoirs, dataDate: latestDate, syncDate: new Date().toISOString() };
}