"use client";

import { useCallback, useState } from "react";

/**
 * @author Temi Bankole
 */

/**
 * useDateValidation
 *
 * Reusable date validation hook that enforces a date range boundary and
 * validates that the "from" date precedes the "to" date. Returns validators,
 * error state, and a clear function for use in date range form controls.
 *
 * @param {string} earliestDate - Lower bound date in YYYY-MM-DD format
 * @param {string} latestDate - Upper bound date in YYYY-MM-DD format
 *
 * @returns {object} An object containing:
 *   - {object} errors - Current validation errors keyed by field name ("from" / "to")
 *   - {Function} setErrors - Direct error state setter for external overrides
 *   - {Function} validate - Validates a single field against the other date and the allowed bounds
 *   - {Function} validateAll - Validates both fields at once and updates error state
 *   - {Function} clearErrors - Resets all errors to an empty object
 *
 * Notes:
 * - validate returns an error string or null but does not update error state — call setErrors manually or use validateAll
 * - validateAll returns true if both fields are valid, false otherwise
 * - validate and validateAll are memoized with useCallback to avoid recreation on every render
 * - Error messages for bound violations are formatted as human-readable locale strings, e.g. "Jan 1, 2017"
 */
export const useDateValidation = ({ earliestDate, latestDate } = {}) => {
  const [errors, setErrors] = useState({});

  const validate = useCallback((field, value, otherDate) => {
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
    }
    return null;
  }, [earliestDate, latestDate]);

  const validateAll = useCallback((fromDate, toDate) => {
    const fromError = validate("from", fromDate, toDate);
    const toError = validate("to", toDate, fromDate);
    setErrors({ from: fromError, to: toError });
    return !fromError && !toError;
  }, [validate]);

  const clearErrors = () => setErrors({});

  return { errors, setErrors, validate, validateAll, clearErrors };
};