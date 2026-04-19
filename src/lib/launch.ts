import { exec } from 'child_process';

export function launchItem(type: 'app' | 'url', cmd: string, browser: string): void {
  const shell = type === 'url'
    ? `${browser} "${cmd.replace(/"/g, '\\"')}" >/dev/null 2>&1 &`
    : `nohup ${cmd} >/dev/null 2>&1 &`;
  exec(shell);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
