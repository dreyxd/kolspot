import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 60,
  checkperiod: 120
});

export const get = (key) => cache.get(key);

export const set = (key, value, ttl) => cache.set(key, value, ttl);

export const del = (key) => cache.del(key);

export const flush = () => cache.flushAll();

export default cache;
