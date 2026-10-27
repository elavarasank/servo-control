import { isDevMode } from '@angular/core';

export const API = {
  baseUrl: isDevMode()
    ? '/api/iot'
    : 'https://ela-smarthome-automation.onrender.com/api/iot',
  timeoutMs: 60000,
};