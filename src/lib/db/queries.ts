import type { ResponseObject } from "../types";
import { fetchApi } from "../utils";
import type {
  CheckIn,
  Court,
  Courts,
  CourtWithCheckIns,
  ImagesWithUrl,
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
    "/api/court",
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
    "/api/court",
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
    "/api/checkin",
    {
      method: "POST",
      body: JSON.stringify({ courtId }),
    }
  );

  return { success, data, message };
};

export const getCheckins = async (courtId: NewCheckIn["courtId"]) => {
  const { success, data, message } = await fetchApi<ResponseObject<CheckIn[]>>(
    `/api/checkin?courtId=${courtId}`,
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

// Images

export const uploadImage = async (formData: FormData) => {
  const { success, data, message } = await fetchApi<
    ResponseObject<{ id: string; url: string }>
  >("/api/image", {
    method: "POST",
    body: formData,
  });

  return { success, data, message };
};

export const getImages = async (params: {
  courtId?: string;
  checkinId?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params.courtId) searchParams.set("courtId", params.courtId);
  if (params.checkinId) searchParams.set("checkinId", params.checkinId);

  const { success, data, message } = await fetchApi<
    ResponseObject<ImagesWithUrl>
  >(`/api/image?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return { success, data, message };
};

export const deleteImage = async (imageId: string) => {
  const { success, data, message } = await fetchApi<ResponseObject<null>>(
    "/api/image",
    {
      method: "DELETE",
      body: JSON.stringify({ id: imageId }),
    }
  );

  return { success, data, message };
};
