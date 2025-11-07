import { AxiosRequestConfig } from "axios";
import { Dictionary } from "@openforis/arena-core";

export type RequestOptions = {
  serverUrl: string;
  uri: string;
  data?: Dictionary<any>;
  config?: AxiosRequestConfig;
};
