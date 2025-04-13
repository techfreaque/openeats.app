/**
 * Type declarations for csv-writer to fix TypeScript errors
 */

declare module "csv-writer" {
  export interface ObjectCsvWriterParams {
    path?: string;
    header: Array<{ id: string; title: string }>;
    fieldDelimiter?: string;
    recordDelimiter?: string;
    alwaysQuote?: boolean;
    encoding?: string;
    append?: boolean;
  }

  export interface ArrayCsvWriterParams {
    path?: string;
    header?: string[];
    fieldDelimiter?: string;
    recordDelimiter?: string;
    alwaysQuote?: boolean;
    encoding?: string;
    append?: boolean;
  }

  export interface ArrayCsvStringifierParams {
    header?: string[];
    fieldDelimiter?: string;
    recordDelimiter?: string;
    alwaysQuote?: boolean;
  }

  export interface ObjectCsvStringifierParams {
    header: Array<{ id: string; title: string }>;
    fieldDelimiter?: string;
    recordDelimiter?: string;
    alwaysQuote?: boolean;
  }

  export interface CsvWriter {
    writeRecords(records: any[]): Promise<void>;
  }

  export interface CsvStringifier {
    getHeaderString(): string;
    stringifyRecords(records: any[]): string;
  }

  export function createObjectCsvWriter(
    params: ObjectCsvWriterParams,
  ): CsvWriter;
  export function createArrayCsvWriter(params: ArrayCsvWriterParams): CsvWriter;
  export function createObjectCsvStringifier(
    params: ObjectCsvStringifierParams,
  ): CsvStringifier;
  export function createArrayCsvStringifier(
    params: ArrayCsvStringifierParams,
  ): CsvStringifier;
}
