import { useState, useCallback, useMemo } from 'react';

/**
 * useForm Hook
 * Advanced React form management hook providing controlled input handling,
 * inline validation, dirty/touched tracking, and submission lifecycle.
 *
 * @param {Object} initialValues - Initial form state
 * @param {Function} validate - Validation function receiving values and returning errors object
 * @returns {Object} Form state and handler utilities
 */
export function useForm(initialValues = {}, validate = null) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Run validation whenever values change if validator is provided
  const runValidation = useCallback(
    (currentValues) => {
      if (typeof validate === 'function') {
        const validationErrors = validate(currentValues) || {};
        setErrors(validationErrors);
        return validationErrors;
      }
      return {};
    },
    [validate],
  );

  // Controlled change handler for standard HTML inputs
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      setValues((prev) => {
        const updated = { ...prev, [name]: fieldValue };
        if (typeof validate === 'function') {
          runValidation(updated);
        }
        return updated;
      });
    },
    [validate, runValidation],
  );

  // Blur handler to mark field as touched
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (typeof validate === 'function') {
        runValidation(values);
      }
    },
    [validate, runValidation, values],
  );

  // Programmatic setter for custom input components or masks
  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => {
        const updated = { ...prev, [name]: value };
        if (typeof validate === 'function') {
          runValidation(updated);
        }
        return updated;
      });
    },
    [validate, runValidation],
  );

  // Submission wrapper
  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // Validate
      const validationErrors = runValidation(values);
      const hasErrors = Object.keys(validationErrors).length > 0;

      if (hasErrors) {
        return;
      }

      setIsSubmitting(true);
      try {
        if (typeof onSubmit === 'function') {
          await onSubmit(values);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, runValidation],
  );

  // Reset form back to initial or new values
  const resetForm = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setTouched({});
      setErrors({});
      setIsSubmitting(false);
    },
    [initialValues],
  );

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
    resetForm,
    setValues,
  };
}

export default useForm;
