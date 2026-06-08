// Shared pagination constants for the transactions feed.

/** Columns we actually use — keep payloads lean. */
export const TRANSACTION_COLUMNS =
  'id,date,merchant,category,amount,type,description,is_recurring,recurring_id,frequency';

/** Rows the app shell loads up front (most recent). Older rows load on demand. */
export const INITIAL_TRANSACTION_LOAD = 1000;

/** Rows fetched per "Load more". */
export const TRANSACTION_PAGE_SIZE = 500;
