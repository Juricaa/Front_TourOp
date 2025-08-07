import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';

export interface TravelDates {
  dateTravel: Date | string;
  dateReturn: Date | string;
}

export interface FlightValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AccommodationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface VehicleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateFlightDatesAgainstTravel = (
  flightDeparture: Date | string,
  flightReturn: Date | string,
  travelDates: TravelDates
): FlightValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
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
  if (isBefore(flightDep, travelStart)) {
    errors.push(`Le vol ne peut pas partir avant le ${format(travelStart, 'dd/MM/yyyy')}`);
  }

  // Validate return date
  if (isAfter(flightRet, travelEnd)) {
    errors.push(`Le vol ne peut pas retourner après le ${format(travelEnd, 'dd/MM/yyyy')}`);
  }

  // Validate departure is not after return
  if (isAfter(flightDep, travelEnd)) {
    errors.push('Le vol de départ ne peut pas être après la date de retour prévue');
  }

  // Warning for flights close to travel boundaries
  const daysBeforeTravel = Math.abs(flightDep.getTime() - travelStart.getTime()) / (1000 * 3600 * 24);
  const daysAfterReturn = Math.abs(flightRet.getTime() - travelEnd.getTime()) / (1000 * 3600 * 24);
  
  if (daysBeforeTravel < 1) {
    warnings.push('Le vol part très proche de la date de voyage');
  }
  
  if (daysAfterReturn < 1) {
    warnings.push('Le vol retour est très proche de la date de retour');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
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

export const isDateWithinTravelPeriod = (
  date: Date | string,
  travelDates: TravelDates
): boolean => {
  const travelStart = typeof travelDates.dateTravel === 'string' 
    ? parseISO(travelDates.dateTravel) 
    : travelDates.dateTravel;
    
  const travelEnd = typeof travelDates.dateReturn === 'string' 
    ? parseISO(travelDates.dateReturn) 
    : travelDates.dateReturn;
    
  const checkDate = typeof date === 'string' ? parseISO(date) : date;

  return (isAfter(checkDate, travelStart) || isEqual(checkDate, travelStart)) && 
         (isBefore(checkDate, travelEnd) || isEqual(checkDate, travelEnd));
};

export const validateVehicleDatesAgainstTravel = (
  vehicleStartDate: Date | string,
  vehicleEndDate: Date | string,
  travelDates: TravelDates
): VehicleValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const travelStart = typeof travelDates.dateTravel === 'string' 
    ? parseISO(travelDates.dateTravel) 
    : travelDates.dateTravel;
    
  const travelEnd = typeof travelDates.dateReturn === 'string' 
    ? parseISO(travelDates.dateReturn) 
    : travelDates.dateReturn;
    
  const vehicleStart = typeof vehicleStartDate === 'string' 
    ? parseISO(vehicleStartDate) 
    : vehicleStartDate;
    
  const vehicleEnd = typeof vehicleEndDate === 'string' 
    ? parseISO(vehicleEndDate) 
    : vehicleEndDate;

  // Validate vehicle start date
  if (isBefore(vehicleStart, travelStart)) {
    errors.push(`La location ne peut pas commencer avant le ${format(travelStart, 'dd/MM/yyyy')}`);
  }

  // Validate vehicle end date
  if (isAfter(vehicleEnd, travelEnd)) {
    errors.push(`La location ne peut pas se terminer après le ${format(travelEnd, 'dd/MM/yyyy')}`);
  }

  // Validate start is not after end
  if (isAfter(vehicleStart, vehicleEnd)) {
    errors.push('La date de début de location ne peut pas être après la date de fin');
  }

  // Warning for dates close to travel boundaries
  const daysBeforeTravel = Math.abs(vehicleStart.getTime() - travelStart.getTime()) / (1000 * 3600 * 24);
  const daysAfterReturn = Math.abs(vehicleEnd.getTime() - travelEnd.getTime()) / (1000 * 3600 * 24);
  
  if (daysBeforeTravel < 1) {
    warnings.push('La location commence très proche de la date de voyage');
  }
  
  if (daysAfterReturn < 1) {
    warnings.push('La location se termine très proche de la date de retour');
  }

  // Warning for very short rental periods
  const rentalDays = Math.ceil((vehicleEnd.getTime() - vehicleStart.getTime()) / (1000 * 3600 * 24));
  if (rentalDays < 2) {
    warnings.push('La période de location est très courte');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateAccommodationDatesAgainstFlight = (
  checkIn: Date | string,
  checkOut: Date | string,
  flightDeparture: Date | string,
  flightReturn: Date | string
): AccommodationValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const depDate = typeof flightDeparture === 'string' ? parseISO(flightDeparture) : flightDeparture;
  const retDate = typeof flightReturn === 'string' ? parseISO(flightReturn) : flightReturn;
  const inDate = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const outDate = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;

  if (isBefore(inDate, depDate)) {
    errors.push(`La date d'arrivée à l'hébergement ne peut pas être avant la date de départ du vol (${format(depDate, 'dd/MM/yyyy')})`);
  }

  if (isAfter(outDate, retDate)) {
    errors.push(`La date de départ de l'hébergement ne peut pas être après la date de retour du vol (${format(retDate, 'dd/MM/yyyy')})`);
  }

  if (isAfter(inDate, outDate)) {
    errors.push("La date d'arrivée ne peut pas être après la date de départ de l'hébergement");
  }

  // Warnings for dates close to flight dates
  const daysBeforeFlight = Math.abs(inDate.getTime() - depDate.getTime()) / (1000 * 3600 * 24);
  const daysAfterFlightReturn = Math.abs(outDate.getTime() - retDate.getTime()) / (1000 * 3600 * 24);

  if (daysBeforeFlight < 1) {
    warnings.push("L'arrivée à l'hébergement est très proche de la date de départ du vol");
  }

  if (daysAfterFlightReturn < 1) {
    warnings.push("Le départ de l'hébergement est très proche de la date de retour du vol");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
