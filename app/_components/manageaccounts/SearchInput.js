//This component is a reusable search input field that can be used to filter the accounts table based on user input. 
//It accepts `value` and `onChange` props to manage the input state from the parent component.
"use client";

export default function SearchInput({ value, onChange }) {
  return (
    <div className = "space-y-6">
      <input
        type = "text"
        value = { value }
        onChange = { ( e ) => onChange( e.target.value ) }
        placeholder = "Search"
        className = "w-75 px-5 py-2 m border text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />    
    </div>
  );
}