"use client";

/**
 * @author Temi Bankole
 */

/**
 * SearchInput
 *
 * Reusable controlled text input for filtering a list. Unwraps the change
 * event and passes the raw string value to onChange.
 *
 * @param {string} value - Current input value controlled by the parent
 * @param {Function} onChange - Called with the raw string value on each keystroke
 *
 * Notes:
 * - onChange receives e.target.value directly, not the synthetic event
 */
export default function SearchInput({ value, onChange }) {
  return (
    <div className="space-y-6">
      <input
        type = "text"
        value = { value }
        onChange = { ( e ) => onChange( e.target.value ) }
        placeholder = "Search"
        className = "w-80 px-5 py-2 m border text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />    
    </div>
  );
}