// frontend/src/utils/sync.js

/**
 * Calculates the expected current time of the video based on the server's state
 * and corrects the local video player's time if it has drifted too much.
 *
 * @param {HTMLVideoElement} videoElement The HTML video element.
 * @param {object} room The authoritative room state from the server.
 * @param {number} threshold The maximum allowed drift in seconds.
 */
export function correctDrift(videoElement, room, threshold) {
  if (!videoElement || !room) return;

  // Calculate the expected time
  let expectedTime = room.videoTime;
  if (room.isPlaying) {
    // Calculate the time elapsed since the server's last update
    const elapsed = (Date.now() - room.lastUpdateTimestamp) / 1000;
    expectedTime += elapsed;
  }

  const localTime = videoElement.currentTime;
  const drift = Math.abs(localTime - expectedTime);

  // If drift exceeds the threshold, seek to the correct time
  if (drift > threshold) {
    console.warn(`Drift of ${drift.toFixed(2)}s detected. Correcting playback time.`);
    videoElement.currentTime = expectedTime;
  }
}
