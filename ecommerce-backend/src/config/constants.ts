export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000
} as const;

export const VALID_CARD_PREFIXES = {
  '23': 'Citibank',
  '12': 'Bank of America', 
  '56': 'Capital One',
  '34': 'Chase Bank',
  '45': 'Wells Fargo',
  '67': 'PNC Bank',
  '89': 'US Bank',
  '90': 'TD Bank',
  '11': 'BB&T',
  '22': 'SunTrust',
  '33': 'Regions Bank',
  '44': 'Fifth Third Bank',
  '55': 'Santander Bank'

} as const;

export const validateCardPrefix = (cardNumber: string): { isValid: boolean; bankName?: string } => {
  const prefix = cardNumber.substring(0, 2);
  const bankName = VALID_CARD_PREFIXES[prefix as keyof typeof VALID_CARD_PREFIXES];
  return bankName ? { isValid: true, bankName } : { isValid: false };
};
