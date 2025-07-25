// WebAssembly-based SHA-256 mining worker for browser-based BSV mining
import { sha256 } from './sha256';

export interface MiningJob {
  blockHeader: string;
  target: string;
  nonce: number;
  difficulty: number;
}

export interface MiningResult {
  found: boolean;
  nonce?: number;
  hash?: string;
  hashrate: number;
  attempts: number;
}

export class MiningWorker {
  private isRunning = false;
  private currentJob: MiningJob | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    console.log('Mining worker initialized');
  }

  async startMining(job: MiningJob): Promise<MiningResult> {
    if (this.isRunning) {
      throw new Error('Mining is already running');
    }

    this.isRunning = true;
    this.currentJob = job;
    this.abortController = new AbortController();

    const startTime = Date.now();
    let attempts = 0;
    let nonce = job.nonce;

    console.log('Starting mining with job:', job);

    try {
      while (this.isRunning && !this.abortController.signal.aborted) {
        // Create block header with current nonce
        const blockHeader = this.buildBlockHeader(job.blockHeader, nonce);
        
        // Calculate double SHA-256 hash
        const hash = await this.doubleHash(blockHeader);
        attempts++;

        // Check if hash meets target difficulty
        if (this.checkTarget(hash, job.target)) {
          const endTime = Date.now();
          const duration = (endTime - startTime) / 1000; // seconds
          const hashrate = attempts / duration;

          console.log('Found valid hash!', { nonce, hash, attempts, hashrate });

          return {
            found: true,
            nonce,
            hash,
            hashrate,
            attempts
          };
        }

        nonce++;

        // Yield control periodically to prevent blocking the main thread
        if (attempts % 1000 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
          
          // Calculate current hashrate for display
          const currentTime = Date.now();
          const duration = (currentTime - startTime) / 1000;
          const currentHashrate = attempts / duration;
          
          // Emit progress update
          this.emitProgress({
            attempts,
            hashrate: currentHashrate,
            nonce,
            duration
          });
        }

        // Check for abort signal
        if (this.abortController.signal.aborted) {
          break;
        }
      }

      // Mining stopped without finding a valid hash
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      const hashrate = attempts / duration;

      return {
        found: false,
        hashrate,
        attempts
      };

    } finally {
      this.isRunning = false;
      this.currentJob = null;
      this.abortController = null;
    }
  }

  stopMining(): void {
    if (this.isRunning && this.abortController) {
      console.log('Stopping mining...');
      this.abortController.abort();
      this.isRunning = false;
    }
  }

  private buildBlockHeader(template: string, nonce: number): string {
    // BSV block header format: version + prev_hash + merkle_root + timestamp + bits + nonce
    // Replace nonce in template (last 4 bytes)
    const nonceHex = nonce.toString(16).padStart(8, '0');
    const nonceBytes = this.hexToBytes(nonceHex).reverse(); // Little-endian
    const template_bytes = this.hexToBytes(template);
    
    // Replace last 4 bytes with new nonce
    for (let i = 0; i < 4; i++) {
      template_bytes[template_bytes.length - 4 + i] = nonceBytes[i];
    }
    
    return this.bytesToHex(template_bytes);
  }

  private async doubleHash(data: string): Promise<string> {
    const bytes = this.hexToBytes(data);
    const hash1 = await sha256(bytes);
    const hash2 = await sha256(hash1);
    return this.bytesToHex(hash2);
  }

  private checkTarget(hash: string, target: string): boolean {
    // Convert hash and target to big integers for comparison
    const hashBigInt = BigInt('0x' + hash);
    const targetBigInt = BigInt('0x' + target);
    return hashBigInt <= targetBigInt;
  }

  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private emitProgress(progress: {
    attempts: number;
    hashrate: number;
    nonce: number;
    duration: number;
  }): void {
    // Emit progress event (can be extended for WebWorker communication)
    if (typeof self !== 'undefined' && self.postMessage) {
      self.postMessage({
        type: 'mining_progress',
        data: progress
      });
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      currentJob: this.currentJob
    };
  }
}

// Create singleton instance
export const miningWorker = new MiningWorker();

// WebWorker compatibility
if (typeof self !== 'undefined' && 'importScripts' in self) {
  // Running in WebWorker context
  self.onmessage = async function(e) {
    const { type, data } = e.data;
    
    switch (type) {
      case 'start_mining':
        try {
          const result = await miningWorker.startMining(data);
          self.postMessage({ type: 'mining_result', data: result });
        } catch (error) {
          self.postMessage({ 
            type: 'mining_error', 
            data: { message: (error as Error).message } 
          });
        }
        break;
        
      case 'stop_mining':
        miningWorker.stopMining();
        self.postMessage({ type: 'mining_stopped' });
        break;
        
      case 'get_status':
        self.postMessage({ 
          type: 'mining_status', 
          data: miningWorker.getStatus() 
        });
        break;
    }
  };
}
