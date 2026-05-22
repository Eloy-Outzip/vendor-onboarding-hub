export type WizardForm = {
  shopName: string;
  city: string;
  website: string;
  email: string;
  categories: string[];
  terms: boolean;
};

export type WizardErrors = Partial<Record<keyof WizardForm, true>>;

export function validateStep(
  step: number,
  form: WizardForm,
  _t: (key: string) => string
): WizardErrors {
  const errors: WizardErrors = {};
  if (step === 0) {
    if (!form.shopName.trim()) errors.shopName = true;
    if (!form.city.trim()) errors.city = true;
  } else if (step === 1) {
    if (form.categories.length === 0) errors.categories = true;
  } else if (step === 2) {
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = true;
    if (!form.terms) errors.terms = true;
  }
  return errors;
}
