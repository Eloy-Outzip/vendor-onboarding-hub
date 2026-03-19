export const isEditorPreview = () =>
  window.location.hostname.includes("lovableproject.com") ||
  new URLSearchParams(window.location.search).has("__lovable_token");
