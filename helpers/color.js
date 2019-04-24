/**
 * compute color from item.text
 * @param item { text }
 */
export function colorFromText(item) {
  const colors = ['grey', 'red', 'blue', 'purple', 'pink', 'green']
  let idx = item.text.charCodeAt(0)
  if (item.text.length > 1) idx += item.text.charCodeAt(1)
  return colors[idx % colors.length]
}
