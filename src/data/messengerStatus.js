const daysAsString = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function isTimeInBetween(date, startTime, closeTime) {
  // concatnating time ranges with today's date
  const dateString = date.toLocaleDateString();
  const startDate = new Date(`${dateString} ${startTime}`);
  const closeDate = new Date(`${dateString} ${closeTime}`);

  return startDate <= date && date <= closeDate;
}

function isWeekday(day) {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day);
}

function isWeekend(day) {
  return ['saturday', 'sunday'].includes(day);
}

export function isOnline(integration, now = new Date()) {
  /**
   * Manual: We can determine state from isOnline field value when method is manual
   */
  if (integration.availabilityMethod === 'manual') {
    return integration.isOnline;
  }

  /**
   * Auto
   */
  const day = daysAsString[now.getDay()];

  if (!integration.onlineHours) {
    return false;
  }

  // check by everyday config
  const everydayConf = integration.onlineHours.find(c => c.day === 'everyday');
  if (everydayConf) {
    return isTimeInBetween(now, everydayConf.from, everydayConf.to);
  }

  // check by weekdays config
  const weekdaysConf = integration.onlineHours.find(c => c.day === 'weekdays');
  if (weekdaysConf && isWeekday(day)) {
    return isTimeInBetween(now, weekdaysConf.from, weekdaysConf.to);
  }

  // check by weekends config
  const weekendsConf = integration.onlineHours.find(c => c.day === 'weekends');
  if (weekendsConf && isWeekend(day)) {
    return isTimeInBetween(now, weekendsConf.from, weekendsConf.to);
  }

  // check by regular day config
  const dayConf = integration.onlineHours.find(c => c.day === day);
  if (dayConf) {
    return isTimeInBetween(now, dayConf.from, dayConf.to);
  }

  return false;
}
