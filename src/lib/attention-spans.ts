interface AttentionConfig {
  singleBlockMinutes: number
  dailyTotalMinutes: number
  breakIntervalMinutes: number
}

export function getAttentionConfig(age: number): AttentionConfig {
  if (age <= 6) {
    return { singleBlockMinutes: 10, dailyTotalMinutes: 68, breakIntervalMinutes: 10 }
  }
  if (age <= 8) {
    return { singleBlockMinutes: 15, dailyTotalMinutes: 90, breakIntervalMinutes: 15 }
  }
  if (age <= 10) {
    return { singleBlockMinutes: 20, dailyTotalMinutes: 120, breakIntervalMinutes: 20 }
  }
  return { singleBlockMinutes: 28, dailyTotalMinutes: 150, breakIntervalMinutes: 25 }
}
