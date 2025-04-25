/**
 * General application constants
 */

// Default timezone and date settings
export const DEFAULT_TIMEZONE = 'Europe/Moscow';
export const DEFAULT_DAYS_LOOKBACK = 7;

// Calendar constraints
export const MAX_DAYS_SELECTION = 10;
export const MAX_PAST_DAYS = 90;

// Special dates with messages and disabled status
export const DATE_MESSAGES = {
  '2025-04-16': { message: 'Holiday - Date Disabled', disabled: true },
  '2025-04-30': { message: 'Maintenance Day - Date Disabled', disabled: true }
};

// API constants
export const API_ENDPOINTS = {
  TRANSACTIONS: 'https://run.mocky.io/v3/672d4da9-a299-4270-ade5-73bc4e2add0a',
};

// Table column configuration
export const TABLE_COLUMNS = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'date', label: 'Date', sortable: true },
  { id: 'amount', label: 'Amount', sortable: true },
  { id: 'status', label: 'Status', sortable: false }
];

// Status styles mapping
export const STATUS_CLASSES = {
  completed: 'status-completed',
  pending: 'status-pending',
  failed: 'status-failed',
  processing: 'status-processing'
};