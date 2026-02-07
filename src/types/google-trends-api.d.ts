declare module "google-trends-api" {
  type InterestOverTimeOptions = {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string | string[];
    hl?: string;
    timezone?: number;
    category?: number;
    property?: string;
    granularTimeResolution?: boolean;
    agent?: unknown;
  };

  export function interestOverTime(
    options: InterestOverTimeOptions,
    callback?: (err: Error | null, results: string) => void
  ): Promise<string>;
}
