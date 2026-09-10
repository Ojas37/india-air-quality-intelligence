import time
import functools
import threading
from typing import Any, Callable, Dict, Optional, Tuple


class TTLCache:
    """
    Thread-safe in-memory cache with Time-To-Live (TTL) and LRU eviction policy.
    Used for caching heavy geospatial fusion results, FIRMS fire queries, and national grid rasters.
    """

    def __init__(self, maxsize: int = 1024, default_ttl_seconds: int = 300):
        self.maxsize = maxsize
        self.default_ttl = default_ttl_seconds
        self._cache: Dict[str, Tuple[Any, float]] = {}  # key -> (value, expiry_timestamp)
        self._lock = threading.Lock()
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key in self._cache:
                val, expiry = self._cache[key]
                if time.time() < expiry:
                    self._hits += 1
                    return val
                else:
                    # Expired
                    del self._cache[key]
            self._misses += 1
            return None

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expiry = time.time() + ttl
        with self._lock:
            # Simple eviction if full
            if len(self._cache) >= self.maxsize and key not in self._cache:
                # Remove oldest expired item or first item
                now = time.time()
                expired_keys = [k for k, (_, exp) in self._cache.items() if now >= exp]
                if expired_keys:
                    for k in expired_keys[:10]:
                        del self._cache[k]
                else:
                    # Evict first key
                    first_key = next(iter(self._cache))
                    del self._cache[first_key]

            self._cache[key] = (value, expiry)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()
            self._hits = 0
            self._misses = 0

    @property
    def stats(self) -> Dict[str, Any]:
        with self._lock:
            total = self._hits + self._misses
            hit_ratio = round((self._hits / total) * 100, 2) if total > 0 else 0.0
            return {
                "size": len(self._cache),
                "maxsize": self.maxsize,
                "hits": self._hits,
                "misses": self._misses,
                "hit_ratio_percent": hit_ratio,
            }


# Global cache instance
memory_cache = TTLCache(maxsize=2048, default_ttl_seconds=600)


def cached(ttl_seconds: int = 300, key_prefix: str = ""):
    """
    Decorator for caching sync and async function results with a TTL.
    """

    def decorator(func: Callable):
        prefix = key_prefix or f"{func.__module__}.{func.__name__}"

        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            key = f"{prefix}:{str(args)}:{str(sorted(kwargs.items()))}"
            cached_val = memory_cache.get(key)
            if cached_val is not None:
                return cached_val

            res = await func(*args, **kwargs)
            memory_cache.set(key, res, ttl_seconds)
            return res

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            key = f"{prefix}:{str(args)}:{str(sorted(kwargs.items()))}"
            cached_val = memory_cache.get(key)
            if cached_val is not None:
                return cached_val

            res = func(*args, **kwargs)
            memory_cache.set(key, res, ttl_seconds)
            return res

        import inspect

        if inspect.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator
