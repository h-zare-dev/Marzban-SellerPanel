export function CalculateRemainDate(expire: number) {
  if (expire != null) {
    const diffDate = new Date(expire * 1000).getTime() - new Date().getTime();
    const remainDay = Math.ceil(diffDate / (1000 * 3600 * 24)) - 1;
    if (remainDay >= 0) return remainDay + " Day Left";
    return Math.abs(remainDay) + " Day Expired";
  }
  return "Never";
}

export function CalculateTraffic(volume: number) {
  if (volume < 1024) return volume + " B";
  else if (volume < 1024 * 1024) return (volume / 1024).toFixed(2) + " KB";
  else if (volume < 1024 * 1024 * 1024)
    return (volume / (1024 * 1024)).toFixed(2) + " MB";
  else if (volume < 1024 * 1024 * 1024 * 1024)
    return (volume / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  else if (volume < 1024 * 1024 * 1024 * 1024 * 1024)
    return (volume / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB";
}
export async function copyTextToClipboard(text: string) {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
}
