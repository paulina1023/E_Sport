export default function FormField({ etiqueta, error, children }) {
  return (
    <label className={error ? "field field-error" : "field"}>
      {etiqueta}
      {children}
      {error && <span className="field-message">{error}</span>}
    </label>
  );
}
