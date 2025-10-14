export const formatDateFromSQLite = (dateString: string): string => {
  const normalized = dateString.replace(" ", "T");
  const date = new Date(normalized);

  if (isNaN(date.getTime())) return dateString;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;

  return `${month} ${day}/${year}\n${hours}:${minutes}${ampm}`;
};
