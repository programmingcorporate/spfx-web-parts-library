// The three choices for Field3 — this must be a union type, not a plain string
export type Field3Choice = 'Option A' | 'Option B' | 'Option C';

// The complete form state interface — all fields controlled
export interface IFormModel {
  field1: string;           // required, single line text
  field2: string;           // required, single line text
  field3: Field3Choice | ''; // required, dropdown choice
 field4: string;           // optional, multiline text
  field5: string;           // required, ISO date string YYYY-MM-DD
}

// Empty initial state — use this to initialise and reset the form
export const EMPTY_FORM: IFormModel = {
  field1: '',
  field2: '',
  field3: '',
  field4: '',
  field5: '',
};

// Client-side validation error messages keyed by field name
export interface IFormValidationErrors {
  field1?: string;
  field2?: string;
  field3?: string;
  field5?: string;
  files?: string;
}

// Options array for the Dropdown component
export const FIELD3_OPTIONS: Field3Choice[] = ['Option A', 'Option B', 'Option C'];