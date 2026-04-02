type LogLevel = "debug" | "info" | "warn" | "error";

const logLevels: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function toLogLevel(value: string | undefined): LogLevel {
  if (!value) {
    return "info";
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === "debug" || normalizedValue === "info" || normalizedValue === "warn" || normalizedValue === "error") {
    return normalizedValue;
  }

  return "info";
}

function shouldLog(currentLevel: LogLevel, targetLevel: LogLevel) {
  return logLevels[targetLevel] >= logLevels[currentLevel];
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

export function createLogger(level: string | undefined) {
  const currentLevel = toLogLevel(level);

  function write(targetLevel: LogLevel, message: string, data?: Record<string, unknown>) {
    if (!shouldLog(currentLevel, targetLevel)) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level: targetLevel,
      message,
      ...data,
    };

    const output = JSON.stringify(payload);

    if (targetLevel === "error") {
      console.error(output);
      return;
    }

    if (targetLevel === "warn") {
      console.warn(output);
      return;
    }

    console.info(output);
  }

  return {
    debug(message: string, data?: Record<string, unknown>) {
      write("debug", message, data);
    },
    info(message: string, data?: Record<string, unknown>) {
      write("info", message, data);
    },
    warn(message: string, data?: Record<string, unknown>) {
      write("warn", message, data);
    },
    error(message: string, data?: Record<string, unknown>) {
      write("error", message, data);
    },
    formatError,
  };
}

export type AppLogger = ReturnType<typeof createLogger>;
