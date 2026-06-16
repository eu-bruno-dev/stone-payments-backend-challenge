export const TRANSACTION_ERROR_MESSAGES = {
  TIMESTAMP_NOT_VALID: 'timestamp not valid',
  TIMESTAMP_ON_FUTURE: 'timestamp on the the future',
  PAYLOAD_ERROR: 'invalid payload',
  MISSING_REQUIRED_PAYLOAD_FIELDS_ERROR: 'Missing required fields in payload',
  INVALID_AMOUNT_ERROR: 'Amount must be greater than zero',
  CARD_NUMBER_ERROR: 'card_number must be between 13 and 19 digits',
} as const;
