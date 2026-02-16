import * as SecureStore from 'expo-secure-store';
import { uint8ArrayToBase64 } from './uint8ArrayToBase64';
import { base64ToUint8Array } from './base64ToUint8Array';

const HEX_MARKER = 0xFF;

function isZeroxHexKey(key: string): boolean {
  if (!key.startsWith('0x')) return false;
  const hexPart = key.slice(2);
  return /^[0-9a-fA-F]+$/.test(hexPart);
}

function isRawHexKey(key: string): boolean {
  if (key.startsWith('0x')) return false;
  return /^[0-9a-fA-F]+$/.test(key) && key.length === 128;
}

function hexToUint8ArrayWithMarker(hex: string): Uint8Array {
  const hasPrefix = hex.startsWith('0x');
  const cleanHex = hasPrefix ? hex.slice(2) : hex;

  if (hasPrefix) {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 64; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
  } else {
    const bytes = new Uint8Array(65);
    bytes[0] = HEX_MARKER;
    for (let i = 0; i < 128; i += 2) {
      bytes[(i / 2) + 1] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
  }
}

function uint8ArrayToHexWithMarker(bytes: Uint8Array): { hex: string; hadPrefix: boolean } {
  if (bytes.length === 32) {
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return { hex: `0x${hex}`, hadPrefix: true };
  } else if (bytes.length === 65 && bytes[0] === HEX_MARKER) {
    const hex = Array.from(bytes.slice(1)).map(b => b.toString(16).padStart(2, '0')).join('');
    return { hex, hadPrefix: false };
  } else {
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return { hex, hadPrefix: false };
  }
}

export async function setPrivateKeyAsync(key: string, value: string): Promise<void> {
  const storageKey = `merchant_wallet_private_key_${key}`;
  let valueToStore: string;

  if (isZeroxHexKey(value) || isRawHexKey(value)) {
    const bytes = hexToUint8ArrayWithMarker(value);
    valueToStore = uint8ArrayToBase64(bytes);
  } else {
    valueToStore = value;
  }

  await SecureStore.setItemAsync(storageKey, valueToStore);
}

export async function getPrivateKeyAsync(key: string): Promise<string | null> {
  const storageKey = `merchant_wallet_private_key_${key}`;
  const storedValue = await SecureStore.getItemAsync(storageKey);

  if (!storedValue) return null;

  const isBase64Encoded = /^[0-9a-zA-Z+/]+={0,2}$/.test(storedValue) && storedValue.length > 20;

  if (isBase64Encoded) {
    try {
      const bytes = base64ToUint8Array(storedValue);
      const { hex } = uint8ArrayToHexWithMarker(bytes);
      return hex;
    } catch {
      return storedValue;
    }
  }

  return storedValue;
}
