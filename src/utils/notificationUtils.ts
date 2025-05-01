
/**
 * Generates a message about rate changes
 */
export const generateRateChangeMessage = (
  metalType: string,
  oldRate: number | null,
  newRate: number
): string => {
  if (!oldRate) return `Current ${metalType} rate: ₹${newRate.toLocaleString()} per 10gm`;
  
  const difference = newRate - oldRate;
  const changeDirection = difference > 0 ? 'up' : 'down';
  const absDifference = Math.abs(difference);
  
  return `${metalType.charAt(0).toUpperCase() + metalType.slice(1)} rate is ${changeDirection} by ₹${absDifference.toLocaleString()}. Current rate: ₹${newRate.toLocaleString()} per 10gm`;
};

/**
 * Store customer mobile number in localStorage
 */
export const saveMobileNumber = (mobileNumber: string): void => {
  localStorage.setItem('customerMobileNumber', mobileNumber);
};

/**
 * Get stored customer mobile number from localStorage
 */
export const getMobileNumber = (): string | null => {
  return localStorage.getItem('customerMobileNumber');
};

/**
 * Store additional numbers for notifications in localStorage
 */
export const saveAdditionalNumbers = (numbers: string[]): void => {
  localStorage.setItem('additionalMobileNumbers', JSON.stringify(numbers));
};

/**
 * Get additional mobile numbers from localStorage
 */
export const getAdditionalNumbers = (): string[] => {
  const numbersStr = localStorage.getItem('additionalMobileNumbers');
  if (!numbersStr) return [];
  try {
    return JSON.parse(numbersStr);
  } catch (e) {
    console.error('Error parsing additional numbers:', e);
    return [];
  }
};

/**
 * Sends an SMS notification to the provided phone number
 */
export const sendSMS = async (
  message: string, 
  phoneNumber: string, 
  fromNumber: string = "9921612155"
): Promise<boolean> => {
  try {
    // In a real implementation, this would call an SMS API
    // For now, we'll simulate the SMS sending with a console log
    console.log(`Sending SMS from ${fromNumber} to ${phoneNumber}: ${message}`);
    
    // Simulating API call success with a timeout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return true to indicate success
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
};
