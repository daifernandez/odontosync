// React resets action forms during commit, when synthetic events are disabled.
// Keep the selected values for validation errors and explicit overlap confirmation.
export function preserveFormValues(form: HTMLFormElement | null) {
  if (!form) return;
  const preventReset = (event: Event) => event.preventDefault();
  form.addEventListener("reset", preventReset);
  return () => form.removeEventListener("reset", preventReset);
}
