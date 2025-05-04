import { inject, Injectable } from '@angular/core';

import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

declare global {
  interface Navigator {
    bluetooth: any;
  }
  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt: BluetoothRemoteGATTServer | null;
  }
  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>;
    getPrimaryService(uuid: string): Promise<BluetoothRemoteGATTService>;
  }
  interface BluetoothRemoteGATTService {
    getCharacteristic(uuid: string): Promise<BluetoothRemoteGATTCharacteristic>;
  }
  interface BluetoothRemoteGATTCharacteristic {
    writeValue(value: BufferSource): Promise<void>;
  }
}

@Injectable({ providedIn: 'root' })
export class BluetoothPrinterService {
  private readonly serviceUUID = environment.bluetoothPrinterServiceUUID;
  private readonly characteristicUUID = environment.bluetoothPrinterCharacteristicUUID;
  private deviceId: string;
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  storageService = inject(StorageService);

  async connect(): Promise<void> {

    // Check if device is already connected
    if (this.deviceId) return;

    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'PT' }],
      optionalServices: [this.serviceUUID]
    });

    this.deviceId = this.device.id;
    const server = await this.device.gatt!.connect();
    const service = await server.getPrimaryService(this.serviceUUID);
    this.characteristic = await service.getCharacteristic(this.characteristicUUID);
  }

  async printText(text: string): Promise<void> {
    try {
      if (!this.characteristic) throw new Error('Printer not connected');

      const encoder = new TextEncoder();
      const buffer = encoder.encode(text);
      const chunkSize = 20;

      for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        await this.sleep(50);
      }
    } catch (error) {
      this.deviceId = '';
      throw new Error(error.mesage);
    }
  }

  async printImage(bitmap: { bytes: number[], width: number, height: number }): Promise<void> {
    if (!this.characteristic) throw new Error('Printer not connected');

    const { bytes, width, height } = bitmap;
    const bytesPerLine = width / 8;

    for (let y = 0; y < height; y += 24) {
      let slice: number[] = [];
      for (let z = 0; z < 24; z++) {
        const row = y + z;
        if (row >= height) break;
        const offset = row * bytesPerLine;
        slice.push(...bytes.slice(offset, offset + bytesPerLine));
      }

      const header = [0x1D, 0x76, 0x30, 0x00, bytesPerLine, 0x00, 24, 0x00];
      const fullPacket = new Uint8Array([...header, ...slice]);

      // Split into chunks of 512 bytes max
      const chunkSize = 512;
      for (let i = 0; i < fullPacket.length; i += chunkSize) {
        const chunk = fullPacket.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        await this.sleep(30); // a small pause helps the printer catch up
      }
    }

    // Feed paper a little after printing
    await this.characteristic.writeValue(new Uint8Array([0x0A, 0x0A]));

    // VERY IMPORTANT: Reset printer (back to text mode)
    await this.characteristic.writeValue(new Uint8Array([0x1B, 0x40])); // ESC @
    await this.sleep(100);
  }

  async loadBitmapFromImagePath(imagePath: string, width: number, height: number): Promise<{ bytes: number[], width: number, height: number }> {
    const img = new Image();
    img.src = imagePath;
    img.crossOrigin = 'Anonymous';

    if (!img.complete) {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image.'));
      });
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get canvas context');

    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const bytes: number[] = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x += 8) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const pixelIndex = ((y * width) + (x + bit)) * 4;
          if (pixelIndex >= pixels.length) continue;
          const r = pixels[pixelIndex];
          const g = pixels[pixelIndex + 1];
          const b = pixels[pixelIndex + 2];
          const brightness = (r + g + b) / 3;
          if (brightness < 128) {
            byte |= (1 << (7 - bit));
          }
        }
        bytes.push(byte);
      }
    }

    return { bytes, width, height };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
