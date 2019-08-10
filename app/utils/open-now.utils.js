import moment from 'moment';

export const isOpenNow = (openingPeriods) => {
    if (!openingPeriods) { return false; }
  
    if (isAlwaysOpen(openingPeriods)) {
      return true;
    }
    
    const dayOfWeek = moment().day();
    const todaysOpeningPeriods = getOpeningPeriodOfDay(openingPeriods, dayOfWeek) || {};
    const { open, close } = todaysOpeningPeriods;
  
    if (isOpenSinceYesterday(openingPeriods)) {
      return true;
    }
  
    return isAfterOpeningTime(open) && isBeforeClosingTime(close);
};
  
const getOpeningPeriodOfDay = (openingPeriods, day) => {
    let result = null;
  
    (openingPeriods || []).forEach(openingPeriod => {
      const { open } = openingPeriod;
      if (open && open.day === day) {
        result = openingPeriod;
        return;
      }
    });
    return result;
};
  
const isAlwaysOpen = (openingPeriods) => {
    if (openingPeriods.length === 1) {
      const { open, close } = openingPeriods[0];
  
      if (!close && parseInt(open.time, 10) === 0) {
        return true;
      }
    }
  
    return false;
};
  
const isOpenSinceYesterday = (openingPeriods) => {
    const yesterdayDayOfWeek = moment().subtract(1, 'days').day();
    const yesterdayOpeningPeriods = getOpeningPeriodOfDay(openingPeriods, yesterdayDayOfWeek);
  
    if (yesterdayOpeningPeriods) {
      const { close } = yesterdayOpeningPeriods;
      
      return moment().isBefore(getOpeningPeriodTime(close));
    }
    
    return false;
};
  
/**
 * @param { day: number, time: string } openingPeriod 
 */
const isAfterOpeningTime = (openingPeriod) => {
    const openingTime = getOpeningPeriodTime(openingPeriod);
  
    return openingTime && moment().isAfter(openingTime);
};
  
/**
 * @param { day: number, time: string } openingPeriod 
 */
const isBeforeClosingTime = (closingPeriod) => {
     const closingTime = getOpeningPeriodTime(closingPeriod);
  
     return closingTime && moment().isBefore(closingTime);
};
  
/**
 * Gets the time associated with the period
 * @param { day: number, time: string } openingPeriod 
 * @returns {Moment} 
 */
const getOpeningPeriodTime = (openingPeriod) => {
    if (!openingPeriod) { return null; }
  
    const { day, time } = openingPeriod;
    
    if (!day && !time) { return null; }
  
    const dateStr = moment().day(day).format('YYYY-MM-DD');
    const momentTime = moment(`${dateStr} ${time}`, 'YYYY-MM-DD HHmm');
    return momentTime;
};
