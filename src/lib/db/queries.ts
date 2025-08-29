import type { ResponseObject } from "../types";
import { fetchApi } from "../utils";
import type { Court, Courts, NewCourt, PartialCourt } from "./schema";

export const getCourts = async () => {
  const { success, data, message } = await fetchApi<ResponseObject<Courts>>(
    "/api/courts",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return { success, data, message };
};

export const addCourt = async (court: NewCourt) => {
  const { success, data, message } = await fetchApi<ResponseObject<Court>>(
    "/api/courts",
    {
      method: "POST",
      body: JSON.stringify(court),
    }
  );

  return { success, data, message };
};

export const editCourt = async (court: PartialCourt) => {
  const { success, data, message } = await fetchApi<ResponseObject<Court>>(
    `/api/courts/${court.id}`,
    {
      method: "PUT",
      body: JSON.stringify(court),
    }
  );

  return { success, data, message };
};
