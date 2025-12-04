type LimiterOptions = {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
};

export type RateLimitStatus = {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
};

type AttemptRecord = {
  timestamps: number[];
  blockedUntil?: number;
};

type LimiterBucket = {
  config: LimiterOptions;
  entries: Map<string, AttemptRecord>;
};

const DEFAULT_OPTIONS: LimiterOptions = {
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxAttempts: 5,
  blockDurationMs: 15 * 60 * 1000, // 15 minutes
};

const limiterStore: Map<string, LimiterBucket> = (globalThis as any).__rateLimiterStore ?? new Map();
(globalThis as any).__rateLimiterStore = limiterStore;

function pruneAttempts(record: AttemptRecord, windowMs: number, now: number) {
  record.timestamps = record.timestamps.filter((ts) => now - ts <= windowMs);
}

function buildStatus(record: AttemptRecord | undefined, bucket: LimiterBucket, now: number): RateLimitStatus {
  if (record?.blockedUntil && record.blockedUntil > now) {
    return {
      isBlocked: true,
      remainingAttempts: 0,
      retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000),
    };
  }

  const remaining = bucket.config.maxAttempts - (record?.timestamps.length ?? 0);
  return {
    isBlocked: false,
    remainingAttempts: Math.max(remaining, 0),
  };
}

export function getRateLimiter(name: string, overrides?: Partial<LimiterOptions>) {
  if (!limiterStore.has(name)) {
    limiterStore.set(name, {
      config: { ...DEFAULT_OPTIONS, ...overrides },
      entries: new Map<string, AttemptRecord>(),
    });
  } else if (overrides) {
    const bucket = limiterStore.get(name)!;
    bucket.config = { ...bucket.config, ...overrides };
  }

  const bucket = limiterStore.get(name)!;

  return {
    check(identifier: string): RateLimitStatus {
      const record = bucket.entries.get(identifier);
      const now = Date.now();

      if (record) {
        if (record.blockedUntil && record.blockedUntil <= now) {
          record.blockedUntil = undefined;
          record.timestamps = [];
        }
        pruneAttempts(record, bucket.config.windowMs, now);
      }

      return buildStatus(record, bucket, now);
    },
    recordFailure(identifier: string): RateLimitStatus {
      const now = Date.now();
      const record = bucket.entries.get(identifier) ?? { timestamps: [] };

      if (record.blockedUntil && record.blockedUntil <= now) {
        record.blockedUntil = undefined;
        record.timestamps = [];
      }

      pruneAttempts(record, bucket.config.windowMs, now);
      record.timestamps.push(now);

      if (record.timestamps.length >= bucket.config.maxAttempts) {
        record.blockedUntil = now + bucket.config.blockDurationMs;
      }

      bucket.entries.set(identifier, record);
      return buildStatus(record, bucket, now);
    },
    reset(identifier: string) {
      bucket.entries.delete(identifier);
    },
  };
}
