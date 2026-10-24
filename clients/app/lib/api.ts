import type {
  Order,
  PaginatedResponseProps,
  Reservation,
  TableStatus,
} from "@/type";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "";

export const API_URL = `${BACKEND_URL}/api/v1`;

// Reusable fetch wrapper to handle JSON, errors, and BetterAuth cookies
export async function customFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Crucial for BetterAuth!
  });

  if (!response.ok) {
    // Attempt to parse the backend error message
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`,
    );
  }

  return response.json();
}

// ==========================================
// CATEGORIES
// ==========================================

export const createCategory = ({ name }: { name: string }) => {
  return customFetch(`/category/create`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
};

export const updateCategory = ({ id, name }: { id: string; name: string }) => {
  return customFetch(`/category/update/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
};

export const deleteCategory = ({ id }: { id: string }) => {
  return customFetch(`/category/delete/${id}`, {
    method: "DELETE",
  });
};

// ==========================================
// MENU ITEMS
// ==========================================

export const createMenuItem = ({
  data,
}: {
  data: {
    name: string;
    description?: any[] | undefined;
    price: number;
    categoryId: string;
    isAvailable: boolean;
    image?: string;
    discount?: number | undefined;
  };
}) => {
  return customFetch(`/menu/create`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateMenuItem = ({
  id,
  data,
}: {
  id: string;
  data: {
    name: string;
    description?: any[] | undefined;
    price: number;
    categoryId: string;
    isAvailable: boolean;
    image?: string;
    discount?: number | undefined;
  };
}) => {
  return customFetch(`/menu/update/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

// ==========================================
// RESERVATIONS
// ==========================================

// Fetch reservations (Pass userId for the Profile page, leave empty for Admin page)
export const fetchReservations = ({
  userId,
  page,
}: {
  userId?: string;
  page: number;
}) => {
  const params = new URLSearchParams();
  if (userId) params.append("userId", userId);
  params.append("page", page.toString());

  return customFetch<PaginatedResponseProps<Reservation>>(
    `/reservations?${params.toString()}`,
    {
      method: "GET",
    },
  );
};

// Update reservation status (Admin only)
export const updateResStatus = ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  return customFetch(`/reservations/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const createReservation = (args: {
  customerName: string;
  date: string;
  guests: number;
  tableId: string;
}) => {
  return customFetch(`/reservations/create`, {
    method: "POST",
    body: JSON.stringify(args),
  });
};

// ==========================================
// TABLES
// ==========================================

export const updateTableStatus = (args: {
  id: string;
  status: TableStatus;
}) => {
  return customFetch(`/tables/${args.id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: args.status }),
  });
};

export const updateTable = (args: {
  id: string;
  name: string;
  seats: number;
  section: "Main Dining Room" | "Outdoor" | "Terrace";
  shape: "square" | "circle" | "rectangle";
}) => {
  return customFetch(`/tables/${args.id}/update`, {
    method: "PATCH",
    body: JSON.stringify(args),
  });
};

export const createTable = (args: {
  name: string;
  seats: number;
  section: string;
  shape: string;
}) => {
  return customFetch(`/tables/create`, {
    method: "POST",
    body: JSON.stringify(args),
  });
};

export const deleteTable = ({ id }: { id: string }) => {
  return customFetch(`/tables/${id}/delete`, {
    method: "DELETE",
  });
};

// ==========================================
// ORDERS
// ==========================================

export const submitOrder = (data: {
  items: Array<{ id: string; quantity: number }>;
  orderType: string;
  tableId?: string | null;
}) => {
  return customFetch(`/orders`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getOrders = ({
  args,
}: {
  args: {
    userId?: string;
    page: number;
  };
}) => {
  // Build the query string
  const params = new URLSearchParams();

  if (args.userId) {
    params.append("userId", args.userId);
  }
  params.append("page", args.page.toString());

  return customFetch<PaginatedResponseProps<Order>>(
    `/orders?${params.toString()}`,
    {
      method: "GET",
    },
  );
};

export const updateOrderDetails = (args: {
  id: string;
  field: string;
  value: string;
}) => {
  return customFetch(`/orders/${args.id}`, {
    method: "PATCH",
    body: JSON.stringify({ field: args.field, value: args.value }),
  });
};