/**
 * Shared roadmap cache — ensures CareerRoadmap and LearningPath
 * always show the SAME AI-generated data.
 *
 * Both pages read/write to the same localStorage key.
 * Key includes sorted skills hash so it auto-invalidates when profile changes.
 */

export const ROADMAP_CACHE_PREFIX = "career_roadmap";

export function getRoadmapCacheKey(userId: string, skills: string[]): string {
  const skillsHash = [...skills].sort().join(",").slice(0, 80);
  return `${ROADMAP_CACHE_PREFIX}_${userId}_${skillsHash}`;
}

export function getCachedRoadmap(userId: string, skills: string[]): any | null {
  try {
    const key  = getRoadmapCacheKey(userId, skills);
    const raw  = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCachedRoadmap(userId: string, skills: string[], roadmap: any): void {
  try {
    const key = getRoadmapCacheKey(userId, skills);
    localStorage.setItem(key, JSON.stringify(roadmap));

    // Clear any stale keys for this user
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(`${ROADMAP_CACHE_PREFIX}_${userId}`) && k !== key) {
        localStorage.removeItem(k);
      }
    });
  } catch {
    // localStorage quota exceeded — silent fail
  }
}

export function clearRoadmapCache(userId: string): void {
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith(`${ROADMAP_CACHE_PREFIX}_${userId}`)) {
      localStorage.removeItem(k);
    }
  });
}