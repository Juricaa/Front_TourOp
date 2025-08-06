import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';

export interface TravelDates {
  dateTravel: Date | string;
  dateReturn: Date | string;
}

export const validateFlightDates = (
  flightDeparture: Date | string,
  flightReturn: Date | string,
  travelDates: TravelDates
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  const travelStart = typeof travelDates.dateTravel === 'string' 
    ? parseISO(travelDates.dateTravel) 
    : travelDates.dateTravel;
    
  const travelEnd = typeof travelDates.dateReturn === 'string' 
    ? parseISO(travelDates.dateReturn) 
    : travelDates.dateReturn;
    
  const flightDep = typeof flightDeparture === 'string' 
    ? parseISO(flightDeparture) 
    : flightDeparture;
    
  const flightRet = flightReturn 
    ? (typeof flightReturn === 'string' ? parseISO(flightReturn) : flightReturn)
    : flightDep;

  // Validate departure date
  if (isBefore(flightDep, travelStart) && !isEqual(flightDep, travelStart)) {
    errors.push(`Le vol part avant la date de voyage (${format(travelStart, 'dd/MM/yyyy')})`);
  }

  // Validate return date
  if (isAfter(flightRet, travelEnd) && !isEqual(flightRet, travelEnd)) {
    errors.push(`Le vol retour est après la date de retour (${format(travelEnd, 'dd/MM/yyyy')})`);
  }

  // Validate if departure is after return (for one-way flights)
  if (isAfter(flightDep, travelEnd)) {
    errors.push(`Le vol part après la date de retour prévue`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const isFlightWithinTravelPeriod = (
  flightDate: Date | string,
  travelDates: TravelDates
): boolean => {
  const travelStart = typeof travelDates.dateTravel === 'string' 
    ? parseISO(travelDates.dateTravel) 
    : travelDates.dateTravel;
    
  const travelEnd = typeof travelDates.dateReturn === 'string' 
    ? parseISO(travelDates.dateReturn) 
    : travelDates.dateReturn;
    
  const flight = typeof flightDate === 'string' ? parseISO(flightDate) : flightDate;

  return (isAfter(flight, travelStart) || isEqual(flight, travelStart)) && 
         (isBefore(flight, travelEnd) || isEqual(flight, travelEnd));
};

export const formatDateRange = (travelDates: TravelDates): string => {
  const start = typeof travelDates.dateTravel === 'string' 
    ? parseISO(travelDates.dateTravel) 
    : travelDates.dateTravel;
    
  const end = typeof travelDates.dateReturn === 'string' 
    ? parseISO(travelDates.dateReturn) 
    : travelDates.dateReturn;

  return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
};

export const getDateValidationMessage = (travelDates: TravelDates): string => {
  if (!travelDates.dateTravel || !travelDates.dateReturn) {
    return "Veuillez d'abord définir vos dates de voyage dans l'étape client";
  }
  
  return `Période de voyage: ${formatDateRange(travelDates)}`;
};
