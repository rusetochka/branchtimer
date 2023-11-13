import * as fs from "fs";

export const extractBranchCode = (logEntry: string): string | null => {
  const match = logEntry.match(/SEAL-\d{4}/i);
  return match ? match[0].toUpperCase() : null;
};

export const extractTimestamp = (logEntry: string): number => {
  const regex = /(\d{1,2}\/\d{1,2}\/\d{4}) (\d{1,2}:\d{1,2})/;

  const match = logEntry.match(regex);
  if (match && match.length === 3) {
    const dateString = match[1];
    const timeString = match[2];

    const [day, month, year] = dateString.split("/");
    const [hours, minutes] = timeString.split(":");

    const dateTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );

    // Return the Unix timestamp (milliseconds since January 1, 1970)
    return dateTime.getTime();
  }

  return 0;
};

export const getFormattedDate = () => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const calculateBranchTimesFromFile = async (
  filePath: string
): Promise<Record<string, string>> => {
  try {
    const fileContent = await fs.promises.readFile(filePath, "utf-8");

    const logEntries = fileContent.split("\n");
    return calculateBranchTimes(logEntries);
  } catch (error: any) {
    console.error(`Error reading file: ${error.message}`);
    throw error;
  }
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else {
    return `${remainingMinutes}m`;
  }
};

export const calculateBranchTimes = (
    logEntries: string[]
  ): Record<string, string> => {
    const branchTimes: Record<string, number> = {}; // Object to store branch times in minutes
  
    for (let i = 0; i < logEntries.length - 2; i++) {
      const currentEntry = logEntries[i];
      const nextEntry = logEntries[i + 1];
  
      const currentBranch = extractBranchCode(currentEntry);
  
      // Check if both entries have valid branch codes
      if (currentBranch) {
        const currentTime = extractTimestamp(currentEntry);
  
        if (nextEntry.toLowerCase().includes("stopped")) {
          // Handle the "Stopped" entry
          const stopTime = extractTimestamp(nextEntry);
          const timeDifference = (stopTime - currentTime) / (1000 * 60); // Difference in minutes
         
          branchTimes[currentBranch] = (branchTimes[currentBranch] || 0) + timeDifference;
  
        } else {
          // Calculate the time difference to the next entry of the same branch
          const nextTime = extractTimestamp(nextEntry);
          const timeDifference = (nextTime - currentTime) / (1000 * 60); // Difference in minutes
          branchTimes[currentBranch] = (branchTimes[currentBranch] || 0) + timeDifference;
          
        }
      }
    }
  
    const formattedBranchTimes: Record<string, string> = {};
  
    // Format the total time for each branch
    for (const branch in branchTimes) {
      const totalTime = branchTimes[branch];
      const formattedTime = formatTime(totalTime);
      formattedBranchTimes[branch] = formattedTime;
    }
  
    return formattedBranchTimes;
  };
  
