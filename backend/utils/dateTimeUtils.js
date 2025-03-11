const formatDate = (date) => {
    const formatter = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return formatter.format(date).replace(/\//g, '/').replace(',', '');
};
module.exports = {formatDate}