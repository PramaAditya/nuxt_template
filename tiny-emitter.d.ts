declare module 'tiny-emitter/instance' {
  export interface Emitter {
    on(event: string, callback: (...args: any[]) => void, ctx?: any): this;
    once(event: string, callback: (...args: any[]) => void, ctx?: any): this;
    emit(event: string, ...args: any[]): this;
    off(event: string, callback?: (...args: any[]) => void): this;
  }
  const mitt: Emitter;
  export default mitt;
}