import { AxiosRequestConfig } from "axios";
import { ArenaDictionary } from "@openforis/arena-core";

export type RequestOptions = {
  serverUrl: string;
  uri: string;
  data?: ArenaDictionary<unknown>;
  config?: AxiosRequestConfig;
};
