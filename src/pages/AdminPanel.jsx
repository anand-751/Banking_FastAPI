import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TableDisplay from '../components/TableDisplay'; // Import reusable table component

export default function AdminPanel() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:5001/api/admin/tables', {
        headers: { Role: 'admin' },
      })
      .then((response) => setTables(response.data.tables))
      .catch((error) => console.error('Error fetching tables:', error));
  }, []);

  const fetchTableData = (tableName) => {
    setSelectedTable(tableName);
    axios
      .get(`http://127.0.0.1:5001/api/admin/tables/${tableName}`, {
        headers: { Role: 'admin' },
      })
      .then((response) => setTableData(response.data.data))
      .catch((error) =>
        console.error(`Error fetching data from ${tableName}:`, error)
      );
  };


  return (
    <div>
      <h1>Admin Panel</h1>
      <div>
        <h2>Tables</h2>
        <ul>
          {tables.map((table) => (
            <li key={table}>
              <button onClick={() => fetchTableData(table)}>{table}</button>
            </li>
          ))}
        </ul>
      </div>
      {selectedTable && (
        <div>
          <h2>Data in Table: {selectedTable}</h2>
          <TableDisplay data={tableData} />
        </div>
      )}
    </div>
  );
}
