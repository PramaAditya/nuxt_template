import mitt from 'tiny-emitter/instance';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      emitter: mitt,
    },
  };
});