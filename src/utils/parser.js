/**
 * Parse raw OCR text into structured bill items
 * @param {string} rawText - Raw text from OCR
 * @returns {Array<{name: string, quantity: number, price: number}>}
 */
export function parseBillText(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];

  // Common patterns for bill items:
  // "2x Chicken Biryani    450"
  // "Chicken Biryani  2  450.00"
  // "1 Paneer Tikka 280"
  // "Masala Dosa ......... 120"
  // "Butter Naan          3 x 40   120"

  for (const line of lines) {
    // Skip common non-item lines
    if (isHeaderOrFooter(line)) continue;

    const parsed = tryParseLine(line);
    if (parsed) {
      items.push(parsed);
    }
  }

  return items;
}

function isHeaderOrFooter(line) {
  const lower = line.toLowerCase();
  const skipPatterns = [
    'subtotal', 'sub total', 'total', 'tax', 'gst', 'cgst', 'sgst',
    'service charge', 'service tax', 'vat', 'tip', 'gratuity',
    'thank', 'welcome', 'invoice', 'receipt', 'bill no', 'bill number',
    'table', 'order', 'date', 'time', 'cashier', 'server', 'waiter',
    'payment', 'cash', 'card', 'upi', 'change', 'balance',
    'restaurant', 'hotel', 'cafe', 'address', 'phone', 'tel',
    'gstin', 'fssai', '---', '===', '***', 'amount', 'qty',
    'item', 'description', 'price', 'sr no', 'sl no', '#'
  ];
  return skipPatterns.some(p => lower.includes(p));
}

function tryParseLine(line) {
  // Clean up OCR artifacts
  let cleaned = line
    .replace(/[.]{2,}/g, ' ')   // dots as separators
    .replace(/[-]{2,}/g, ' ')   // dashes as separators
    .replace(/[|]/g, ' ')       // pipe separators
    .replace(/\s+/g, ' ')       // normalize whitespace
    .trim();

  // Pattern 1: "2x Item Name 450" or "2 x Item Name 450"
  let match = cleaned.match(/^(\d+)\s*[xX×]\s+(.+?)\s+(\d+[\.,]?\d*)$/);
  if (match) {
    return {
      name: cleanName(match[2]),
      quantity: parseInt(match[1]),
      price: parsePrice(match[3]),
    };
  }

  // Pattern 2: "Item Name 2 450" (qty before price at end)
  match = cleaned.match(/^(.+?)\s+(\d+)\s+(\d+[\.,]?\d*)$/);
  if (match && isLikelyName(match[1])) {
    const qty = parseInt(match[2]);
    const price = parsePrice(match[3]);
    // Heuristic: qty is usually < 20, price is usually > qty
    if (qty <= 20 && price > qty) {
      return { name: cleanName(match[1]), quantity: qty, price };
    }
  }

  // Pattern 3: "Item Name 450" or "Item Name 450.00" (qty=1 implied)
  match = cleaned.match(/^(.+?)\s+(\d+[\.,]?\d*)$/);
  if (match && isLikelyName(match[1])) {
    const price = parsePrice(match[2]);
    if (price >= 5) { // Minimum reasonable price
      return { name: cleanName(match[1]), quantity: 1, price };
    }
  }

  // Pattern 4: "1 Item Name 450"
  match = cleaned.match(/^(\d+)\s+(.+?)\s+(\d+[\.,]?\d*)$/);
  if (match) {
    const qty = parseInt(match[1]);
    const price = parsePrice(match[3]);
    if (qty <= 20 && isLikelyName(match[2]) && price >= 5) {
      return { name: cleanName(match[2]), quantity: qty, price };
    }
  }

  return null;
}

function isLikelyName(str) {
  // A name should have at least one letter and be at least 2 chars
  return /[a-zA-Z]/.test(str) && str.trim().length >= 2;
}

function cleanName(name) {
  return name
    .replace(/^\d+\s*/, '')     // leading numbers
    .replace(/\s+/g, ' ')      // normalize spaces
    .replace(/[^\w\s&'-]/g, '') // remove special chars except useful ones
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function parsePrice(priceStr) {
  return parseFloat(priceStr.replace(',', '.')) || 0;
}
