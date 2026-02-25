// Adaptador para el nuevo JSON optimizado de ETL
export function parseHydroJson(jsonData: any) {
  const records = jsonData.datos || [];
  const meta = jsonData.metadatos || {};
  
  if (records.length === 0) return { basins: [], reservoirs: [], dataDate: null, syncDate: new Date().toISOString() };

  // La fecha viene en la clave 'f'
  const latestDate = records[0].f; 

  const reservoirs = records.map((r: any) => {
    const curP = (r.aa / r.at) * 100;
    // Usamos m1s (media ultima semana) para la variación reciente
    const preP = r.m1s ? (r.m1s / r.at) * 100 : curP; 
    const avgP = r.ht ? (r.ht / r.at) * 100 : 0;

    return {
      id: `res-${r.en}`,
      name: r.en,
      basin: r.an,
      capacity: r.at,
      current: r.aa,
      variation: curP - preP,
      avg10yP: avgP
    };
  });

  const basinMap: any = {};
  records.forEach((r: any) => {
    if (!basinMap[r.an]) basinMap[r.an] = { name: r.an, cur: 0, cap: 0, prev: 0, ht: 0 };
    basinMap[r.an].cur += r.aa;
    basinMap[r.an].cap += r.at;
    basinMap[r.an].prev += (r.m1s || r.aa);
    basinMap[r.an].ht += (r.ht || 0);
  });

  const basins = Object.entries(basinMap).map(([name, d]: any, i) => ({
    id: `b-${i}`,
    name,
    current: d.cur,
    capacity: d.cap,
    variation: (d.cur / d.cap) * 100 - (d.prev / d.cap) * 100,
    avg10yP: (d.ht / d.cap) * 100
  }));

  return { basins, reservoirs, dataDate: latestDate, syncDate: new Date().toISOString() };
}