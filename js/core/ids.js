/* Identifiants courts, uniques en pratique : préfixe + horodatage en
   base 36 + quatre caractères de hasard. Lisibles dans un export. */
export function nouvelId(prefixe = "id") {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `${prefixe}_${t}${r}`;
}
