//This is a reusable date validation hook for sensor dashboards. 

//It provides the earliest and latest allowed dates, and validates that the "from" date is before the "to" date.

"use client";
import { useState } from "react";

export const useDateValidation = ({ earliestDate, latestDate } = {}) => {
  const [errors, setErrors] = useState({});

  const validate = (field, value, otherDate) => {
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
  };

  //Validates both dates and sets error state
  const validateAll = (fromDate, toDate) => {
    const fromError = validate("from", fromDate, toDate); //otherDate = toDate
    const toError = validate("to", toDate, fromDate); //otherDate = fromDate
    setErrors({ from: fromError, to: toError });
    return !fromError && !toError;
  };

  const clearErrors = () => setErrors({});

  return { errors, setErrors, validate, validateAll, clearErrors };
}
