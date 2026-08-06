// Centralized Production Logging Utility for Vanguard Quantum Platform

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 200;

  public log(level: LogLevel, module: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    const prefix = `[Vanguard ${level}] [${module}]`;
    if (level === 'ERROR') {
      console.error(prefix, message, data || '');
    } else if (level === 'WARN') {
      console.warn(prefix, message, data || '');
    } else {
      console.log(prefix, message, data || '');
    }
  }

  public info(module: string, message: string, data?: any) {
    this.log('INFO', module, message, data);
  }

  public warn(module: string, message: string, data?: any) {
    this.log('WARN', module, message, data);
  }

  public error(module: string, message: string, data?: any) {
    this.log('ERROR', module, message, data);
  }

  public audit(module: string, message: string, data?: any) {
    this.log('AUDIT', module, message, data);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const logger = new Logger();
