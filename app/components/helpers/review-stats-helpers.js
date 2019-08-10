import numeral from 'numeral';

export const formatReviewStats = (amount) => {
    if (!amount) { return amount; }

    const amountNumeral = numeral(amount);

    return amount < 10000 ? amountNumeral.format('0,0') : amountNumeral.format('0.0a');
};
