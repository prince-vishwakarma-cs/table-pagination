import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { OverlayPanel } from "primereact/overlaypanel";
import { useEffect, useRef, useState } from "react";

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const rows = 12;
  const [total, setTotal] = useState(0);

  const [selected, setSelected] = useState([]);
  const [bulkCount, setBulkCount] = useState("");
  const overlayRef = useRef(null);
  const fields = "id,title,place_of_origin,artist_display,inscriptions,date_start,date_end";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const url = `https://api.artic.edu/api/v1/artworks?page=${page}&fields=${fields}`;
      try {
        const resp = await fetch(url);
        const result = await resp.json();
        setData(result.data);
        setTotal(result.pagination.total);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const onPage = (event) => {
    setPage(event.page + 1);
  };

  const onSelect = (e) => {
    setSelected(e.value);
  };

  const onBulkSubmit = async () => {
    const n = parseInt(bulkCount, 10);
    if (!n || n < 1) return;

    const apiLimit = 100;
    const pagesToFetch = Math.ceil(n / apiLimit);
    
    const promises = [];
    for (let page = 1; page <= pagesToFetch; page++) {
      const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${apiLimit}&fields=${fields}`;
      promises.push(fetch(url).then((res) => res.json()));
    }

    try {
      const results = await Promise.all(promises);
      
      const allData = results.flatMap((result) => result.data);
      setSelected(allData.slice(0, n));

    } catch (error) {
      console.error("Failed to fetch bulk data:", error);
    } finally {
      setBulkCount("");
      overlayRef.current.hide();
    }
  };

  const header = () => (
    <div className="flex items-center">
      <i
        className="pi pi-chevron-down ml-2 cursor-pointer"
        onClick={(e) => overlayRef.current.toggle(e)}
      />
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl mb-4">Table</h1>

      <OverlayPanel ref={overlayRef}>
        <div className="flex gap-2">
          <InputText
            placeholder="Number of rows"
            value={bulkCount}
            onChange={(e) => setBulkCount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onBulkSubmit()}
            type="number"
          />
          <Button label="Select" onClick={onBulkSubmit} />
        </div>
      </OverlayPanel>

      <DataTable
        value={data}
        lazy
        paginator
        first={(page - 1) * rows}
        rows={rows}
        totalRecords={total}
        onPage={onPage}
        selection={selected}
        onSelectionChange={onSelect}
        loading={loading}
        dataKey="id"
        tableStyle={{ minWidth: '75rem' }}
      >
        <Column selectionMode="multiple" header={header} headerStyle={{ width: '5rem' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
};

export default App;