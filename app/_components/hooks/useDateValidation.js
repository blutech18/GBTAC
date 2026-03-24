//This is a reusable date validation hook for sensor dashboards. 

//It provides the earliest and latest allowed dates, and validates that the "from" date is before the "to" date.

"use client";
import { useCallback, useState } from "react";

export const useDateValidation = ({ earliestDate, latestDate } = {}) => {
  const [errors, setErrors] = useState({});

  const validate = useCallback((field, value, otherDate) => { //useCallback to avoid recreating function on every render
    if (field === "from") {
      if (!value) return "From date is required";
      if (otherDate && value > otherDate) return "From date must be before To date";
      if (new Date(value) < new Date(earliestDate))
        return `Minimum date: ${new Date(earliestDate).toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
    }
    if (field === "to") {
      if (!value) return "To date is required";
      if (otherDate && value < otherDate) return "To date must be after From date";
      if (new Date(value) > new Date(latestDate))
        return `Maximum date: ${new Date(latestDate).toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      ;
    }
    return null;
  }, [earliestDate, latestDate]);

  //Validates both dates and sets error state
  const validateAll = useCallback((fromDate, toDate) => { //useCallback to avoid recreating function on every render
    const fromError = validate("from", fromDate, toDate); //otherDate = toDate
    const toError = validate("to", toDate, fromDate); //otherDate = fromDate
    setErrors({ from: fromError, to: toError });
    return !fromError && !toError;
  }, [validate]);
  

  const clearErrors = () => setErrors({});

  return { errors, setErrors, validate, validateAll, clearErrors };
}
