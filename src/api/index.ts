import type { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import type {
  CustomAxiosRequestConfig,
  RequestConfig,
  Result,
  ResultData,
} from "./interface";
import { BASE_URL, RETRY_COUNT, RETRY_DELAY, TIMEOUT } from "./config";
import axios from "axios";
import { ResultEnum } from "./enums/httpEnum";
import { useCancelRequest } from "./hooks/use-cancel-request";

const { addPendingRequest, removePendingRequest } = useCancelRequest();

class RequestHttp {
  // axios 实例
  instance: AxiosInstance;
  constructor(config?: RequestConfig) {
    // instantiation
    this.instance = axios.create(config);

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        // 重复请求不需要取消，在 api 服务中通过指定的第三个参数: { cancel: false } 来控制
        config.cancel ??= true;
        config.cancel && addPendingRequest(config);

        // 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { loading: false } 来控制
        config.loading ??= true;
        // config.loading && showFullScreenLoading();

        // 添加token
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("x-access-token", "token");
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse & { config: CustomAxiosRequestConfig }) => {
        const { data } = response;

        removePendingRequest(response.config);
        // config.loading && tryHideFullScreenLoading();
        // 处理自定义错误码
        const { code } = data as Result;

        switch (code) {
          // 登录失效
          case ResultEnum.OVERDUE:
            return Promise.reject(data);
          // SUCCESS
          case ResultEnum.SUCCESS:
            return data;
          // 全局错误信息拦截
          default:
            return Promise.reject(data);
        }
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // 处理token过期
          return Promise.reject(error);
        }

        // 处理请求重试
        const config = error.config as RequestConfig;
        if (!config || !config.retryCount) return Promise.reject(error);

        config.retryCount = config.retryCount - 1;
        config.retryDelay = config.retryDelay || RETRY_DELAY;

        // 延迟重试
        await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
        return this.instance(config);
      }
    );
  }

  /**
   * @description 常用请求方法封装
   */
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.instance.get(url, { params, ..._object });
  }
  post<T>(
    url: string,
    params?: object | string,
    _object = {}
  ): Promise<ResultData<T>> {
    return this.instance.post(url, params, _object);
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.instance.put(url, params, _object);
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.instance.delete(url, { params, ..._object });
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.instance.post(url, params, {
      ..._object,
      responseType: "blob",
    });
  }
}

export default new RequestHttp({
  baseURL: BASE_URL.dev,
  timeout: TIMEOUT,
  retryCount: RETRY_COUNT,
  retryDelay: RETRY_DELAY,
});
