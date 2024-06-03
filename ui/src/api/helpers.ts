const baseURL = process.env.NEXT_PUBLIC_API_URL;

export enum REQUEST_METHODS {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export type Payload = Record<string, unknown>;

export type Response<T> = {
  status: number;
  data: T;
};

const baseRequest = async <T>(
  uri: string,
  method: REQUEST_METHODS,
  payload?: Payload,
): Promise<Response<T>> => {
  const result = await fetch(`${baseURL}/${uri}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    next: { revalidate: 0 },
  });

  const res = await result.json();

  if (result.ok !== true) {
    throw new Error(res.message[0] as string | "Request failed");
  }

  return { status: result.status, data: res };
};

export const getRequest = <T>(uri: string): Promise<Response<T>> =>
  baseRequest<T>(uri, REQUEST_METHODS.GET);
export const postRequest = <T>(
  uri: string,
  payload: Payload,
): Promise<Response<T>> => baseRequest<T>(uri, REQUEST_METHODS.POST, payload);
export const patchRequest = <T>(
  uri: string,
  payload: Payload,
): Promise<Response<T>> => baseRequest<T>(uri, REQUEST_METHODS.PATCH, payload);
export const deleteRequest = <T>(uri: string): Promise<Response<T>> =>
  baseRequest<T>(uri, REQUEST_METHODS.DELETE);
