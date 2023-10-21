export function getCurrentTimeInSupabaseFormat() {
  const now = new Date();
  return getDateInSupabaseFormat(now);
}

export function getDateInSupabaseFormat(date: Date) {
  const timeZoneOffset =
    (date.getTimezoneOffset() / 60).toString().padStart(2, "0") + "00";

  // Format the date and time to a string in the desired format
  return date.toISOString().replace("Z", `+${timeZoneOffset}`);
}
