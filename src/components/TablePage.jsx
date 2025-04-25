// src/components/TablePage.jsx
import React, { useMemo, memo } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, Typography, Box, CircularProgress
} from '@mui/material';
import { 
  ArrowUpward as ArrowUpwardIcon, 
  ArrowDownward as ArrowDownwardIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { fetchTransactionData } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import { TABLE_COLUMNS, STATUS_CLASSES } from '../constants';
import './TablePage.css';

// Memoized table cell component
const MemoizedTableCell = memo(({ children, onClick, className }) => (
  <TableCell 
    className={className} 
    onClick={onClick}
  >
    {children}
  </TableCell>
));

// Memoized table row component
const MemoizedTableRow = memo(({ row, columns }) => (
  <TableRow key={row.id}>
    {columns.map(column => (
      <TableCell key={`${row.id}-${column.id}`}>
        {column.id === 'status' ? (
          <span className={`status-badge ${STATUS_CLASSES[row.status.toLowerCase()]}`}>
            {row.status}
          </span>
        ) : (
          row[column.id]
        )}
      </TableCell>
    ))}
  </TableRow>
));

// Memoized search column button
const SearchColumnButton = memo(({ column, isActive, onClick }) => (
  <button 
    className={`search-column-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {column.label}
  </button>
));

const TablePage = ({ dateRange }) => {
  // Use our custom hook for API data handling
  const {
    filteredData,
    loading,
    error,
    sortConfig,
    searchConfig,
    handleSort,
    handleSearchChange,
    handleSearchColumnChange
  } = useApiData(fetchTransactionData, dateRange);

  // Memoized function to render sort icon
  const renderSortIcon = useMemo(() => (columnId) => {
    if (sortConfig.key !== columnId) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUpwardIcon fontSize="small" /> 
      : <ArrowDownwardIcon fontSize="small" />;
  }, [sortConfig]);

  return (
    <div className="table-page">
      <h2>Transaction Data</h2>
      
      {dateRange.startDate && (
        <Typography variant="subtitle1" className="date-range-info">
          Showing data from {dateRange.startDate.split(' ')[0]} to {dateRange.endDate.split(' ')[0]} ({dateRange.timeZone})
        </Typography>
      )}
      
      <Box className="search-container">
        <div className="search-column-selector">
          <Typography variant="body2">Search by:</Typography>
          {TABLE_COLUMNS.map(column => (
            <SearchColumnButton
              key={column.id}
              column={column}
              isActive={searchConfig.column === column.id}
              onClick={() => handleSearchColumnChange(column.id)}
            />
          ))}
        </div>
        
        <div className="search-input-container">
          <SearchIcon />
          <TextField
            variant="outlined"
            size="small"
            placeholder={`Search by ${TABLE_COLUMNS.find(col => col.id === searchConfig.column)?.label}`}
            value={searchConfig.query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </Box>
      
      {loading ? (
        <div className="loading-container">
          <CircularProgress />
          <Typography>Loading data...</Typography>
        </div>
      ) : error ? (
        <div className="error-container">
          <Typography color="error">{error}</Typography>
        </div>
      ) : (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                {TABLE_COLUMNS.map(column => (
                  <MemoizedTableCell 
                    key={column.id}
                    className={column.sortable ? 'sortable-header' : ''}
                    onClick={() => column.sortable && handleSort(column.id, TABLE_COLUMNS)}
                  >
                    <div className="header-content">
                      {column.label}
                      {column.sortable && (
                        <div className="sort-icon">
                          {renderSortIcon(column.id)}
                        </div>
                      )}
                    </div>
                  </MemoizedTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map(row => (
                  <MemoizedTableRow 
                    key={row.id} 
                    row={row} 
                    columns={TABLE_COLUMNS} 
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={TABLE_COLUMNS.length} align="center">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

// Export memoized component
export default memo(TablePage);