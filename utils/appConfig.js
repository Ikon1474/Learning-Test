function getServicePrice() {
  const parsedValue = Number(process.env.SERVICE_PRICE || 70);

  if (Number.isFinite(parsedValue) && parsedValue >= 0) {
    return parsedValue;
  }

  return 70;
}

function getAdminTelegram() {
  return (process.env.ADMIN_TELEGRAM || "@yourtelegramusername").trim();
}

function getTelegramLink() {
  const telegramValue = getAdminTelegram();

  if (telegramValue.startsWith("http://") || telegramValue.startsWith("https://")) {
    return telegramValue;
  }

  const username = telegramValue.replace(/^@/, "");
  return `https://t.me/${username}`;
}

module.exports = {
  getAdminTelegram,
  getServicePrice,
  getTelegramLink
};
