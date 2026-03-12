// Utility to get or create a persistent device ID for identifying DM/players without auth
export function getDeviceId(): string {
  const key = 'arcane-table-device-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// Generate a short join code
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Store DM session ownership
export function setDMSession(sessionId: string) {
  const sessions = getDMSessions();
  if (!sessions.includes(sessionId)) {
    sessions.push(sessionId);
    localStorage.setItem('arcane-table-dm-sessions', JSON.stringify(sessions));
  }
}

export function getDMSessions(): string[] {
  try {
    return JSON.parse(localStorage.getItem('arcane-table-dm-sessions') || '[]');
  } catch { return []; }
}

export function isDMOfSession(sessionId: string): boolean {
  return getDMSessions().includes(sessionId);
}

// Store player token for a session
export function setPlayerToken(sessionId: string, playerId: string, token: string) {
  localStorage.setItem(`arcane-table-player-${sessionId}`, JSON.stringify({ playerId, token }));
}

export function getPlayerSession(sessionId: string): { playerId: string; token: string } | null {
  try {
    return JSON.parse(localStorage.getItem(`arcane-table-player-${sessionId}`) || 'null');
  } catch { return null; }
}
