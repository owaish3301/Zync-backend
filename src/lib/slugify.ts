function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // strip special chars
    .replace(/\s+/g, "-") // multiple spaces → single -
    .replace(/-+/g, "-") // multiple - → single -
    .replace(/^-|-$/g, ""); // strip leading/trailing -
}

export default slugify;