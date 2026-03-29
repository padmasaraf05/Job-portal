/**
 * formatSalary — handles salary values stored in different formats:
 *
 * Case 1: salary_min=600000, salary_max=800000 → "₹6-8 LPA"  (stored as full rupees)
 * Case 2: salary_min=6, salary_max=8           → "₹6-8 LPA"  (stored as LPA directly)
 * Case 3: salary_min=0 or null, salary text exists → use salary text
 * Case 4: everything is null/0                 → "Salary not disclosed"
 */
export function formatSalary(
  salary_min: number | null | undefined,
  salary_max: number | null | undefined,
  salary_text: string | null | undefined
): string {
  // If we have numeric min/max and at least one is non-zero
  if (salary_min && salary_max && salary_min > 0 && salary_max > 0) {
    // Stored as full rupees (e.g. 600000) → divide to get LPA
    if (salary_min >= 100000) {
      const min = (salary_min / 100000).toFixed(0);
      const max = (salary_max / 100000).toFixed(0);
      return `₹${min}-${max} LPA`;
    }
    // Stored as LPA directly (e.g. 6, 8) → use as-is
    if (salary_min >= 1) {
      return `₹${salary_min}-${salary_max} LPA`;
    }
  }

  // Fall back to the text salary column
  if (salary_text && salary_text.trim() && salary_text !== "₹0-0 LPA") {
    return salary_text;
  }

  return "Salary not disclosed";
}