export function exportToCSV(filename, headers, rows) {
  const processRow = (row) => {
    return row
      .map((val) => {
        let stringVal = val === null || val === undefined ? '' : String(val);
        if (stringVal.search(/("|,|\n)/g) >= 0) {
          stringVal = `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      })
      .join(',');
  };

  const csvContent = [
    headers.join(','),
    ...rows.map(processRow)
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
