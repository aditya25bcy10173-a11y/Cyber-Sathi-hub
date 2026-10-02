"use server"

export async function analyzeSms(messageText: string) {
  try {
    // Calling your Python SMS Detector running on port 5007
    const response = await fetch('http://127.0.0.1:5007/api/scan-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messageText }),
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("SMS Analysis Error:", error);
    return { error: "SMS Detector Engine Offline (Port 5007 unreachable)." };
  }
}
