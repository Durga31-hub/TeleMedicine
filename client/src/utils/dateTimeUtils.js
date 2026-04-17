export const isAppointmentActive = (date, timeSlot) => {
  const now = new Date();
  
  // Create an appointment date object
  // Parsing YYYY-MM-DD and HH:MM
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = timeSlot.split(':').map(Number);
  
  const appStartTime = new Date(year, month - 1, day, hour, minute);
  const bufferTime = 5 * 60 * 1000; // 5 minutes early
  const expiryTime = 60 * 60 * 1000; // Active for 1 hour
  
  const startTimeWithBuffer = new Date(appStartTime.getTime() - bufferTime);
  const endTime = new Date(appStartTime.getTime() + expiryTime);
  
  if (now < startTimeWithBuffer) {
    return { active: false, status: 'upcoming', label: 'Scheduled' };
  } else if (now >= startTimeWithBuffer && now <= endTime) {
    return { active: true, status: 'active', label: 'Live' };
  } else {
    return { active: false, status: 'expired', label: 'Expired' };
  }
};
