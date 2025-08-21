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
