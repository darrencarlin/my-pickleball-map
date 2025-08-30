import type { ResponseObject } from "../types";
import { fetchApi } from "../utils";
import type {
  CheckIn,
  Court,
  Courts,
  CourtWithCheckIns,
  NewCheckIn,
  NewCourt,
} from "./schema";

export const getCourt = async (id: Court["id"]) => {
  const { success, data, message } = await fetchApi<
    ResponseObject<CourtWithCheckIns>
  >(`/api/court/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return { success, data, message };
};

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

export const editCourt = async (court: Partial<Court>) => {
  const { success, data, message } = await fetchApi<ResponseObject<Court>>(
    `/api/court/${court.id}`,
    {
      method: "PUT",
      body: JSON.stringify(court),
    }
  );

  return { success, data, message };
};

// Checkins

export const getCheckIn = async (id: CheckIn["id"]) => {
  const { success, data, message } = await fetchApi<ResponseObject<CheckIn>>(
    `/api/checkin/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return { success, data, message };
};

export const addCheckin = async (courtId: NewCheckIn["courtId"]) => {
  const { success, data, message } = await fetchApi<ResponseObject<CheckIn>>(
    "/api/checkins",
    {
      method: "POST",
      body: JSON.stringify({ courtId }),
    }
  );

  return { success, data, message };
};

export const getCheckins = async (courtId: NewCheckIn["courtId"]) => {
  const { success, data, message } = await fetchApi<ResponseObject<CheckIn[]>>(
    `/api/checkins?courtId=${courtId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return { success, data, message };
};

export const editCheckIn = async (checkIn: Partial<CheckIn>) => {
  const { success, data, message } = await fetchApi<ResponseObject<CheckIn>>(
    `/api/checkin/${checkIn.id}`,
    {
      method: "PUT",
      body: JSON.stringify(checkIn),
    }
  );

  return { success, data, message };
};
