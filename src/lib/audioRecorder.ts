/**
 * AudioRecorder captures audio from the microphone and yields base64-encoded PCM chunks.
 */
export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: AudioWorkletNode | null = null;
  private onData: (base64Data: string) => void;

  constructor(onData: (base64Data: string) => void) {
    this.onData = onData;
  }

  async start() {
    // Check if any audio input devices exist first
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMic = devices.some(device => device.kind === 'audioinput');
      if (!hasMic) {
        throw new Error("No microphone device found on this system.");
      }
    } catch (e) {
      console.warn("Could not enumerate devices:", e);
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
    } catch (e: any) {
      if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        throw new Error("Requested device not found. Please connect a microphone.");
      }
      console.info("Standard audio constraints failed, trying basic audio:true", e);
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e2: any) {
        if (e2.name === 'NotAllowedError' || e2.name === 'PermissionDeniedError') {
          throw new Error("Microphone permission denied. To use voice features, please open the app in a new browser tab or enable microphone access in your browser settings.");
        }
        throw e2;
      }
    }
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000,
    });
    
    if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
    }

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    
    // We use a ScriptProcessorNode normally if Worklets aren't ready, 
    // but ScriptProcessor is deprecated. For simplicity in this environment, 
    // we'll use a ScriptProcessorNode but it's better to use Worklet.
    // However, creating a worklet requires a separate file or a blob URL.
    
    const bufferSize = 4096;
    const scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    this.processor = scriptProcessor as any;
    
    scriptProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = this.floatTo16BitPCM(inputData);
      const base64 = this.arrayBufferToBase64(pcm16);
      this.onData(base64);
    };

    this.source.connect(scriptProcessor);
    scriptProcessor.connect(this.audioContext.destination);
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch (e) {}
      this.processor = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch (e) {}
      this.source = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  setMuted(muted: boolean) {
    if (this.stream) {
      this.stream.getAudioTracks().forEach(track => track.enabled = !muted);
    }
  }

  private floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
