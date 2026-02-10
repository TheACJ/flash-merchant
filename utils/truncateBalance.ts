export const truncateBalance = (balance: string | number, decimals: number = 4): string => {
    if (!balance) return '0';
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(num)) return '0';

    // Convert to fixed with required decimals
    const fixed = num.toFixed(decimals);

    // Remove trailing zeros and dot if needed (e.g. 1.5000 -> 1.5, 1.0000 -> 1)
    return parseFloat(fixed).toString();
};
