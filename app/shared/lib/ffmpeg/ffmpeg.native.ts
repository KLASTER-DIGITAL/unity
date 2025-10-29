/**
 * FFmpeg mock for React Native
 * 
 * @ffmpeg/ffmpeg не поддерживается в React Native (использует WebAssembly и dynamic imports)
 * Этот mock предотвращает ошибки bundling
 */

export class FFmpeg {
  load() {
    throw new Error('FFmpeg is not supported in React Native');
  }
  
  exec() {
    throw new Error('FFmpeg is not supported in React Native');
  }
}

export const createFFmpeg = () => {
  throw new Error('FFmpeg is not supported in React Native');
};

