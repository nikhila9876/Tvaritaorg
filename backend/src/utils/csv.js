import { parse } from 'csv-parse/sync';

/**
 * Parse CSV buffer into objects. Throws with a clear message on parse failure.
 */
export function parseCsvBuffer(buffer, { columns, requiredColumns }) {
  let records;
  try {
    records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: false,
    });
  } catch (err) {
    const error = new Error(`CSV parse error: ${err.message}`);
    error.status = 400;
    throw error;
  }

  if (!records.length) {
    const error = new Error('CSV contains no data rows');
    error.status = 400;
    throw error;
  }

  const headers = Object.keys(records[0]);
  const missingHeaders = requiredColumns.filter((c) => !headers.includes(c));
  if (missingHeaders.length) {
    const error = new Error(`CSV missing required columns: ${missingHeaders.join(', ')}`);
    error.status = 400;
    error.details = { missingHeaders };
    throw error;
  }

  return records.map((row, index) => {
    const normalized = {};
    for (const col of columns) {
      normalized[col] = row[col] != null ? String(row[col]).trim() : '';
    }
    return { rowNumber: index + 2, data: normalized };
  });
}

/**
 * Validate all rows; if any fail, reject the whole batch with row-level errors.
 */
export function validateCsvRows(rows, validateRow) {
  const errors = [];
  const valid = [];

  for (const row of rows) {
    const result = validateRow(row.data, row.rowNumber);
    if (result.error) {
      errors.push({ row: row.rowNumber, errors: result.error });
    } else {
      valid.push({ rowNumber: row.rowNumber, data: result.data });
    }
  }

  if (errors.length) {
    const error = new Error('CSV validation failed');
    error.status = 400;
    error.details = { rowErrors: errors };
    throw error;
  }

  return valid;
}
